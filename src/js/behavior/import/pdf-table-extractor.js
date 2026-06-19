// PDF_IMPORT_V1 — Phase 2 : extraction positionnelle des tables Binance PDF
// Stratégie : clustering Y=2pt · skip page 1 Order History (PDF-ARCH-03)
//             · signature X détectée dynamiquement depuis l'en-tête du PDF
//             · fallback vers signature statique (corpus b3.pdf) si en-tête non trouvé
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md

// ── Constantes ─────────────────────────────────────────────────────────────

const Y_TOLERANCE        = 2;    // pt — validé sur corpus B1-B19
const X_TOLERANCE_STATIC = 3;    // pt — fallback signature statique (PDF-ARCH-02, b3.pdf)
const X_TOLERANCE_DYN    = 10;   // pt — signature dynamique (détectée depuis l'en-tête réel)

// Signature X Order History statique (PDF-ARCH-02) — fallback uniquement, validée sur b3.pdf.
// Utilisée si la détection dynamique échoue (score en-tête < 4).
const ORDER_X_SIGNATURE = [
  38.8,   // created_at
  117.9,  // order_id
  208.3,  // symbol
  264.8,  // order_type
  321.3,  // side
  377.7,  // order_price
  434.2,  // order_amount
  490.7,  // execution_time
  569.8,  // executed_qty
  626.3,  // average_price
  682.8,  // trading_total
  750.5,  // status
];

// Termes de colonnes Trade History (normalisés) — pour détection en-têtes
const TRADE_HEADER_TERMS = ['duree', 'paire', 'cote', 'prix', 'execute', 'montant', 'frais'];

// Termes d'en-têtes Order History (normalisés, sortie de _normCell).
// Couvre FR et EN — utilisé pour scorer chaque cluster et localiser la ligne d'en-tête.
const ORDER_HEADER_TERMS = [
  // Temporel
  'date', 'duree', 'created time', 'date de creation', 'update time', 'heure',
  // Identifiant
  'order id', 'n commande', 'numero de commande', 'orderid',
  // Actif
  'pair', 'paire', 'symbol',
  // Classification
  'type', 'order type',
  // Côté
  'side', 'cote',
  // Prix
  'price', 'prix', 'order price', 'prix de l ordre',
  'avg price', 'prix moyen', 'average price',
  // Quantité / montant
  'amount', 'montant', 'order amount', 'montant de l ordre',
  // Exécution
  'executed', 'execute', 'filled', 'qty',
  'execution time', 'temps d execution',
  // Total
  'total', 'trading total', 'total echange',
  // Statut
  'status', 'statut',
];

// ── Utilitaires internes ────────────────────────────────────────────────────

// Normalisation cellule : accents, apostrophe typographique, degré, casse
function _normCell(str) {
  return str
    .toLowerCase()
    .replace(/\u2019/g, ' ')
    .replace(/°/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Détecte une cellule date Binance PDF.
// Accepte 2 ou 4 chiffres pour l'année :
//   YY-MM-DD HH:MM:SS   (ancien format, ex. "26-04-18 20:47:49")
//   YYYY-MM-DD HH:MM:SS (nouveau format, ex. "2026-04-18 20:47:49")
// Le parsing réel est délégué à Phase 3 (pdf-normalizer.js).
function _isDateCell(str) {
  return /^\d{2,4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str.trim());
}

// ── Clustering Y ───────────────────────────────────────────────────────────
// Regroupe les items d'une page en lignes visuelles par proximité Y.
// Tri : y décroissant (haut vers bas) puis x croissant (gauche vers droite).
// Résultat : [{ yRef, items[] }]

function _clusterByY(pageItems) {
  const sorted = [...pageItems].sort((a, b) => b.y - a.y || a.x - b.x);
  const clusters = [];
  let current = null;

  for (const item of sorted) {
    if (!current || Math.abs(item.y - current.yRef) > Y_TOLERANCE) {
      current = { yRef: item.y, items: [item] };
      clusters.push(current);
    } else {
      current.items.push(item);
    }
  }

  for (const cluster of clusters) {
    cluster.items.sort((a, b) => a.x - b.x);
  }

  return clusters;
}

// ── Détection en-tête Trade History ───────────────────────────────────────
// Une ligne est un en-tête si ≥4 cellules normalisées correspondent
// exactement à un terme de colonne Trade History.

function _isTradeHeader(cells) {
  const normed = cells.map(_normCell);
  const hits = TRADE_HEADER_TERMS.filter(term => normed.some(c => c === term));
  return hits.length >= 4;
}

// ── Détection dynamique signature X (Order History) ───────────────────────

// Score d'en-tête Order History d'un cluster :
// nombre de termes ORDER_HEADER_TERMS présents dans les cellules normalisées.
// Correspondance : exacte OU le terme est un token de début/fin de cellule.
function _orderHeaderScore(cluster) {
  const normed = cluster.items
    .map(i => _normCell(i.str))
    .filter(s => s.length > 0);
  let score = 0;
  for (const term of ORDER_HEADER_TERMS) {
    if (normed.some(c => c === term || c.startsWith(term + ' ') || c.endsWith(' ' + term))) {
      score++;
    }
  }
  return score;
}

// Cherche la ligne d'en-tête Order History dans un ensemble de clusters,
// extrait les positions X pour construire la signature dynamique.
//
// Stratégie de fusion multi-cluster :
//   Les PDF Binance 2026 fragmentent les libellés de colonnes sur plusieurs
//   clusters Y consécutifs (ex. "Numéro de commande" → cluster "Numéro de" + cluster "mmande").
//   Ces fragments ont score=0 (aucun terme complet de ORDER_HEADER_TERMS).
//   La boucle tolère jusqu'à MAX_SKIP=3 fragments consécutifs avant d'abandonner,
//   et reprend la fusion dès qu'un cluster score≥2 est retrouvé.
//   Arrêt absolu sur date (_isDateCell) ou MAX_WINDOW=10 clusters inspecté.
//
// Retourne :
//   { xSig, tolerance, found, source, score, headerY, mergedLines, clusterAudit }
//   source : 'dynamic' — en-tête détecté, positions X extraites du PDF réel
//            'static'  — fallback sur ORDER_X_SIGNATURE (b3.pdf)
function _detectOrderXSig(clusters) {
  // Trouver le cluster avec le meilleur score d'en-tête
  let bestIdx  = -1;
  let bestScore = 0;
  for (let i = 0; i < clusters.length; i++) {
    const s = _orderHeaderScore(clusters[i]);
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  }

  // Score minimum de 4 requis pour considérer qu'un en-tête a été trouvé
  if (bestIdx === -1 || bestScore < 4) {
    return {
      xSig:      ORDER_X_SIGNATURE,
      tolerance: X_TOLERANCE_STATIC,
      found:     false,
      source:    'static',
      score:     bestScore,
      headerY:   null,
    };
  }

  // Collecter les items de l'en-tête principal.
  // Les en-têtes Binance PDF 2026 sont fragmentés : chaque colonne peut tenir sur
  // 2-3 clusters Y consécutifs (ex. "Numéro de commande" → "Numéro de" / "mmande").
  // Ces clusters intermédiaires ont score=0 car leurs fragments ne correspondent
  // à aucun terme complet de ORDER_HEADER_TERMS.
  //
  // Stratégie : tolérer jusqu'à MAX_SKIP clusters faibles consécutifs (fragments),
  // continuer dès qu'un cluster score≥2 est retrouvé, s'arrêter uniquement sur :
  //   — une ligne de données réelle (_isDateCell)
  //   — MAX_SKIP fragments consécutifs sans rebond
  //   — MAX_WINDOW clusters inspectés depuis bestIdx

  const MAX_SKIP   = 3;   // fragments consécutifs tolérés avant abandon
  const MAX_WINDOW = 10;  // fenêtre maximale depuis bestIdx

  // DEBUG-IPAD — audit : entrées BEFORE_HEADER (bestIdx-2 … bestIdx-1)
  const clusterAudit = [];
  for (let ai = Math.max(0, bestIdx - 2); ai < bestIdx; ai++) {
    const cl = clusters[ai];
    clusterAudit.push({
      idx: ai, isBest: false,
      y:           cl.yRef.toFixed(1),
      score:       _orderHeaderScore(cl),
      firstCell:   cl.items.map(i => i.str.trim()).find(s => s.length > 0) ?? '',
      normedCells: cl.items.map(i => _normCell(i.str)).filter(s => s.length > 0).slice(0, 8),
      role: 'BEFORE_HEADER',
      rejectReason: 'avant le cluster principal — non considéré pour fusion',
    });
  }
  // DEBUG-IPAD — entrée BEST_HEADER
  clusterAudit.push({
    idx: bestIdx, isBest: true,
    y:           clusters[bestIdx].yRef.toFixed(1),
    score:       bestScore,
    firstCell:   clusters[bestIdx].items.map(i => i.str.trim()).find(s => s.length > 0) ?? '',
    normedCells: clusters[bestIdx].items.map(i => _normCell(i.str)).filter(s => s.length > 0).slice(0, 8),
    role: 'BEST_HEADER',
    rejectReason: null,
  });

  const headerItems = [...clusters[bestIdx].items];
  let nextIdx        = bestIdx + 1;
  let mergedLines    = 0;
  let skippedFrags   = 0;  // fragments consécutifs ignorés depuis le dernier merge

  while (nextIdx < clusters.length && (nextIdx - bestIdx) <= MAX_WINDOW) {
    const cl        = clusters[nextIdx];
    const nextScore = _orderHeaderScore(cl);
    const firstCell = cl.items.map(i => i.str.trim()).find(s => s.length > 0) ?? '';
    const normedCells = cl.items.map(i => _normCell(i.str)).filter(s => s.length > 0).slice(0, 8);

    // Arrêt absolu : ligne de données réelle détectée
    if (_isDateCell(firstCell)) {
      clusterAudit.push({ idx: nextIdx, isBest: false, y: cl.yRef.toFixed(1), score: nextScore, firstCell, normedCells,
        role: 'REJECTED_DATA_ROW', rejectReason: `date détectée : "${firstCell}"` });
      break;
    }

    if (nextScore >= 2) {
      // Cluster header valide → fusionner, réinitialiser le compteur de fragments
      headerItems.push(...cl.items);
      mergedLines++;
      skippedFrags = 0;
      clusterAudit.push({ idx: nextIdx, isBest: false, y: cl.yRef.toFixed(1), score: nextScore, firstCell, normedCells,
        role: 'MERGED', rejectReason: null });
    } else {
      // Fragment faible (score<2) — toléré jusqu'à MAX_SKIP consécutifs
      if (skippedFrags >= MAX_SKIP) {
        clusterAudit.push({ idx: nextIdx, isBest: false, y: cl.yRef.toFixed(1), score: nextScore, firstCell, normedCells,
          role: 'REJECTED_MAX_SKIP', rejectReason: `${MAX_SKIP} fragments consécutifs atteints` });
        break;
      }
      // Les fragments partagent le même X que leur colonne parente.
      // On collecte leurs items pour capturer les X des colonnes absentes
      // de la ligne principale (ex. cols 9-11 Binance 2026 : average_price,
      // trading_total, status uniquement présents dans le cluster fragment).
      headerItems.push(...cl.items);
      skippedFrags++;
      clusterAudit.push({ idx: nextIdx, isBest: false, y: cl.yRef.toFixed(1), score: nextScore, firstCell, normedCells,
        role: 'SKIPPED_FRAGMENT', rejectReason: `score=${nextScore} < 2, X collectés, fragment toléré (${skippedFrags}/${MAX_SKIP})` });
    }
    nextIdx++;
  }

  // Positions X uniques de tous les items non-vides de l'en-tête (triées, dédupliquées ±2pt)
  const rawX = headerItems
    .filter(i => i.str.trim().length > 0)
    .map(i => i.x)
    .sort((a, b) => a - b);

  const xSig = rawX.reduce((acc, x) => {
    if (acc.length === 0 || x - acc[acc.length - 1] > 2) acc.push(x);
    return acc;
  }, []);

  // En-tête trop pauvre pour être fiable → fallback
  if (xSig.length < 4) {
    return {
      xSig:      ORDER_X_SIGNATURE,
      tolerance: X_TOLERANCE_STATIC,
      found:     false,
      source:    'static',
      score:     bestScore,
      headerY:   clusters[bestIdx].yRef,
    };
  }

  return {
    xSig,
    tolerance:    X_TOLERANCE_DYN,
    found:        true,
    source:       'dynamic',
    score:        bestScore,
    headerY:      clusters[bestIdx].yRef,
    mergedLines,  // nombre de lignes header fusionnées (0 = une seule ligne)
    clusterAudit, // DEBUG-IPAD — audit de fusion par cluster
  };
}

// Vérifie si x est dans la signature (xSig, tolerance)
function _inSig(x, xSig, tolerance) {
  return xSig.some(sx => Math.abs(x - sx) <= tolerance);
}

// Compte les items non-vides d'un cluster qui tombent dans la signature
function _sigMatchCount(items, xSig, tolerance) {
  return items.filter(i => i.str.trim().length > 0 && _inSig(i.x, xSig, tolerance)).length;
}

// Assigne chaque item à la colonne de xSig la plus proche par distance X.
// Retourne toujours xSig.length cellules dans l'ordre des colonnes — les colonnes
// sans item restent vides (""). Garantit la parité avec normalizeOrderHistoryRows.
function _assignToCols(clusterItems, xSig) {
  const colBuckets = xSig.map(() => /** @type {string[]} */ ([]));
  for (const item of clusterItems) {
    const str = item.str.trim();
    if (!str) continue;
    let bestCol  = 0;
    let bestDist = Math.abs(item.x - xSig[0]);
    for (let ci = 1; ci < xSig.length; ci++) {
      const d = Math.abs(item.x - xSig[ci]);
      if (d < bestDist) { bestDist = d; bestCol = ci; }
    }
    colBuckets[bestCol].push(str);
  }
  return colBuckets.map(parts => parts.join(' '));
}

// ── extractPdfTableRows ────────────────────────────────────────────────────
// pdfResult : résultat de loadPdfTextItems() — { pages, items, rawText, quality }
// family    : 'TRADE_HISTORY' | 'ORDER_HISTORY'
//
// Retourne :
//   {
//     family,
//     rows,              — tableau de rows, chaque row = tableau de cellules texte brutes
//     skippedHeaderRows, — en-têtes détectés et ignorés
//     pagesProcessed,    — tableau des numéros de page traités
//     diagnostics        — métriques de diagnostic (dont sigSource, sigFound, sigScore)
//   }
//
// Contrat Phase 2 :
//   - aucun mapping de colonnes (pas de {created_at: ...})
//   - aucune normalisation métier (dates, nombres, unités)
//   - aucune transformation vers le format canonique

function extractPdfTableRows(pdfResult, family) {
  const { items, pages } = pdfResult;

  // PDF-ARCH-03 : Order History — extraction opérationnelle à partir de page 2.
  // La page 1 contient un bloc Commentaires (x>440, y<460) qui pollue le clustering.
  const startPage = family === 'ORDER_HISTORY' ? 2 : 1;

  // Regroupement des items par page (avec filtre startPage)
  const byPage = {};
  for (const item of items) {
    if (item.page < startPage) continue;
    if (!byPage[item.page]) byPage[item.page] = [];
    byPage[item.page].push(item);
  }

  const pagesProcessed = Object.keys(byPage).map(Number).sort((a, b) => a - b);
  const rows = [];
  const skippedHeaderRows = [];
  let rawLineCount = 0;
  let rejectedRowCount = 0;

  // ── Détection signature X (ORDER_HISTORY uniquement) ─────────────────────
  // Effectuée une seule fois sur tous les clusters de la première page traitée.
  // La signature est ensuite appliquée uniformément à toutes les pages.
  let sig = null;
  if (family === 'ORDER_HISTORY' && pagesProcessed.length > 0) {
    const firstPageClusters = _clusterByY(byPage[pagesProcessed[0]] || []);
    sig = _detectOrderXSig(firstPageClusters);
  }

  for (const pageNum of pagesProcessed) {
    const clusters = _clusterByY(byPage[pageNum]);

    for (const cluster of clusters) {
      rawLineCount++;

      if (family === 'TRADE_HISTORY') {
        const cells = cluster.items
          .map(i => i.str.trim())
          .filter(s => s.length > 0);

        if (cells.length === 0) { rejectedRowCount++; continue; }

        // Ligne de données : première cellule = date Binance
        if (_isDateCell(cells[0])) {
          rows.push(cells);
          continue;
        }

        // En-tête répété : ≥4 termes de colonne Trade History détectés
        if (_isTradeHeader(cells)) {
          skippedHeaderRows.push(cells);
          continue;
        }

        // Tout le reste : titre de page, pied de page, métadonnées → rejeté
        rejectedRowCount++;

      } else if (family === 'ORDER_HISTORY') {
        // Filtrage par signature X : garde uniquement les lignes de table.
        // Seuil : ≥6 items dont la position X correspond à la signature.
        const sigCount = _sigMatchCount(cluster.items, sig.xSig, sig.tolerance);
        if (sigCount < 6) { rejectedRowCount++; continue; }

        // Assignation nearest-column : produit toujours sig.xSig.length cellules.
        // Garantit que row[0]…row[11] sont présents même si un item est décalé
        // (nouveau PDF Binance 2026 — colonnes Average Price, Trading Total, Status
        // hors de la fenêtre ±tolerance du filtre précédent).
        const sigCells = _assignToCols(cluster.items, sig.xSig);

        // Discrimination données / en-tête : première cellule = date Binance → données
        if (_isDateCell(sigCells[0])) {
          rows.push(sigCells);
        } else {
          // En-tête (potentiellement fragmenté sur 2 lignes — PDF-ARCH-02)
          skippedHeaderRows.push(sigCells);
        }
      }
    }
  }

  // ── Diagnostics ───────────────────────────────────────────────────────────
  const cellCounts = rows.map(r => r.length);

  const diagnostics = {
    totalItems:      items.length,
    rawLineCount,
    dataRowCount:    rows.length,
    rejectedRowCount,
    headerRowCount:  skippedHeaderRows.length,
    pagesProcessed:  pagesProcessed.length,
    minCells:        cellCounts.length ? Math.min(...cellCounts) : 0,
    maxCells:        cellCounts.length ? Math.max(...cellCounts) : 0,
    sampleRows:      rows.slice(0, 3),
    // Infos signature (ORDER_HISTORY uniquement)
    sigSource:       sig?.source      ?? null,
    sigFound:        sig?.found       ?? null,
    sigScore:        sig?.score       ?? null,
    sigPositions:    sig?.xSig?.map(x => x.toFixed(1)) ?? null,
    sigHeaderY:      sig?.headerY     ?? null,
    sigColCount:     sig?.xSig?.length ?? null,   // nb colonnes dans la signature
    sigMergedLines:  sig?.mergedLines ?? null,    // lignes header fusionnées (0 = une seule)
  };

  // DEBUG-IPAD — retirer après diagnostic
  if (family === 'ORDER_HISTORY') {
    const debugPages  = pagesProcessed.slice(0, 2);
    const debugItems  = items
      .filter(i => debugPages.includes(i.page) && i.str.trim().length > 0)
      .slice(0, 30)
      .map(i => `p${i.page} x=${i.x.toFixed(1).padStart(6)} y=${i.y.toFixed(1).padStart(6)}  "${i.str.trim()}"`);

    const sampleItems = items
      .filter(i => i.page >= startPage && i.str.trim().length > 0)
      .slice(0, 200);
    const xBuckets = {};
    for (const it of sampleItems) {
      const bucket = Math.round(it.x / 5) * 5;
      xBuckets[bucket] = (xBuckets[bucket] || 0) + 1;
    }
    const xDist = Object.entries(xBuckets)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([x, n]) => `x≈${x.padStart(4)} : ${'█'.repeat(Math.min(n, 20))} (${n})`)
      .join('\n');

    const p2Clusters = _clusterByY(byPage[pagesProcessed[0]] || []).slice(0, 10);
    const sigCounts  = p2Clusters.map((cl, i) =>
      `cluster ${String(i).padStart(2)} | y=${cl.yRef.toFixed(1).padStart(6)} | items=${cl.items.length} | sigMatches=${_sigMatchCount(cl.items, sig.xSig, sig.tolerance)}`
    );

    // DEBUG-IPAD — format texte de l'audit de fusion pour l'overlay
    const clusterAuditLines = (sig.clusterAudit ?? []).map(ca =>
      `${ca.isBest ? '★' : ' '} idx=${String(ca.idx).padStart(2)} y=${String(ca.y).padStart(7)} ` +
      `score=${ca.score} role=${ca.role.padEnd(14)} ` +
      `firstCell="${ca.firstCell.slice(0, 20)}" ` +
      (ca.rejectReason ? `→ ${ca.rejectReason}` : '') +
      `\n    normed=[${ca.normedCells.join(' | ')}]`
    );

    diagnostics._debugExtract = {
      sigSource:      sig.source,
      sigFound:       sig.found,
      sigScore:       sig.score,
      sigColCount:    sig.xSig.length,
      sigMergedLines: sig.mergedLines ?? 0,
      sigPositions:   sig.xSig.map(x => x.toFixed(1)).join(', '),
      sigHeaderY:     sig.headerY?.toFixed(1) ?? null,
      clusterAuditLines,  // DEBUG-IPAD — audit de fusion cluster par cluster
      debugItems,
      xDist,
      sigCounts,
      startPage,
      pagesProcessed: pagesProcessed.slice(0, 5),
    };
  }
  // FIN DEBUG-IPAD

  return { family, rows, skippedHeaderRows, pagesProcessed, diagnostics };
}

export { extractPdfTableRows };
