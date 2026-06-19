// PDF_IMPORT_V1 — Phase 2 : extraction positionnelle des tables Binance PDF
// Stratégie : clustering Y=2pt · skip page 1 Order History (PDF-ARCH-03)
//             · filtrage en-têtes Order par signature X (PDF-ARCH-02)
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md

// ── Constantes ─────────────────────────────────────────────────────────────

const Y_TOLERANCE = 2;   // pt — validé sur corpus B1-B19 (variance X = 0.0pt)
const X_TOLERANCE = 3;   // pt — tolérance signature Order History (PDF-ARCH-02)

// Signature X Order History (PDF-ARCH-02) — validée sur b3.pdf
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

// Détecte une cellule date Binance PDF : format YY-MM-DD HH:MM:SS (PDF-ARCH-04)
// Utilisée pour discriminer données vs en-têtes — le parsing réel est Phase 3.
function _isDateCell(str) {
  return /^\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str.trim());
}

// Vérifie si une coordonnée X correspond à un emplacement de la signature Order
function _matchesSig(x) {
  return ORDER_X_SIGNATURE.some(sx => Math.abs(x - sx) <= X_TOLERANCE);
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

// ── Comptage matches signature X (Order History) ───────────────────────────

function _sigMatchCount(items) {
  return items.filter(i => i.str.trim().length > 0 && _matchesSig(i.x)).length;
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
//     diagnostics        — métriques de diagnostic
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
        // Filtrage par signature X (PDF-ARCH-02) : garde uniquement les lignes de table.
        // Un cluster avec <6 positions matchant la signature = bruit (texte libre, numéros de page…).
        const sigCount = _sigMatchCount(cluster.items);
        if (sigCount < 6) { rejectedRowCount++; continue; }

        // Extraction des cellules dans les colonnes de la signature (ordre X croissant)
        const sigItems = cluster.items
          .filter(i => i.str.trim().length > 0 && _matchesSig(i.x))
          .sort((a, b) => a.x - b.x);

        const sigCells = sigItems.map(i => i.str.trim());
        if (sigCells.length === 0) { rejectedRowCount++; continue; }

        // Discrimination données / en-tête : première cellule = date Binance → données
        // En-têtes Order History : premier cell = "Durée" / fragment de nom de colonne
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
  };

  // DEBUG-IPAD — retirer après diagnostic
  if (family === 'ORDER_HISTORY') {
    // Items bruts des 2 premières pages traitées (max 30 items) avec X, Y, str
    const debugPages  = pagesProcessed.slice(0, 2);
    const debugItems  = items
      .filter(i => debugPages.includes(i.page) && i.str.trim().length > 0)
      .slice(0, 30)
      .map(i => `p${i.page} x=${i.x.toFixed(1).padStart(6)} y=${i.y.toFixed(1).padStart(6)}  "${i.str.trim()}"`);

    // Distribution X sur les 200 premiers items non-vides des pages traitées
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

    // Signature sigCount de chaque cluster (premières 10 lignes de p2)
    const p2Items = (byPage[pagesProcessed[0]] || []);
    const p2Clusters = _clusterByY(p2Items).slice(0, 10);
    const sigCounts = p2Clusters.map((cl, i) =>
      `cluster ${String(i).padStart(2)} | y=${cl.yRef.toFixed(1).padStart(6)} | items=${cl.items.length} | sigMatches=${_sigMatchCount(cl.items)}`
    );

    diagnostics._debugExtract = {
      debugItems,
      xDist,
      sigCounts,
      startPage,
      pagesProcessed: pagesProcessed.slice(0, 5),
    };
    console.warn('[DEBUG-IPAD] extractPdfTableRows', diagnostics._debugExtract);
  }
  // FIN DEBUG-IPAD

  return { family, rows, skippedHeaderRows, pagesProcessed, diagnostics };
}

export { extractPdfTableRows };
