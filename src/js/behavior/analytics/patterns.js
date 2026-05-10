// Détecte les patterns comportementaux à partir de l'historique de trades.
//
// V2 patterns :
//   1. overtrading        — trop de trades dans une fenêtre courte
//   2. revenge_trading    — entrée rapide après vente avec taille > moyenne
//   3. rapid_reentry      — BUY → SELL rapide → nouveau BUY rapide
//   4. size_inconsistency — tailles de position très variables (coeff. variation élevé)
//   5. loss_chasing       — 3 BUYs consécutifs avec taille croissante dans une fenêtre

// ── Debug (mettre à true pour afficher les logs de diagnostic dans la console) ─
const DEBUG = false;
const dbg = (...args) => { if (DEBUG) console.debug('[bhv:patterns]', ...args); };

// ── Seuils (tous regroupés ici pour faciliter les ajustements) ────────────────

const OVERTRADING_WINDOW_MIN   = 60;   // fenêtre glissante
const OVERTRADING_MIN_TRADES   = 5;    // trades dans cette fenêtre pour déclencher

const REVENGE_MAX_GAP_MIN      = 30;   // délai max SELL → BUY pour considérer "revenge"
const REVENGE_SIZE_FACTOR      = 1.5;  // taille BUY > avg * ce facteur

// BUG CORRIGÉ v2 : la détection ne cherche plus des positions consécutives dans
// le tableau (fragile si d'autres trades s'intercalent), mais cherche dynamiquement
// le BUY précédent et le BUY suivant autour de chaque SELL.
const RR_HOLD_MAX_MIN          = 20;   // BUY → SELL en moins de N min = "sortie rapide"
const RR_REENTRY_MAX_MIN       = 45;   // SELL → BUY suivant en moins de N min = "reentry"

// SEUIL CORRIGÉ v2 : 0.8 était trop strict (rates les cas évidents).
// Un CV de 0.5 signifie que l'écart-type est 50% de la moyenne — déjà très instable.
const SIZE_CV_THRESHOLD        = 0.5;
const SIZE_MIN_TRADES          = 5;

// FENÊTRE ÉLARGIE v2 : 60 min était trop court pour capturer l'escalade réelle.
const LC_WINDOW_MIN            = 120;  // fenêtre pour détecter l'escalade de taille
const LC_MIN_SEQUENCE          = 3;    // BUYs croissants consécutifs
// SEUIL v3 : le 3e BUY doit dépasser 1.8× la taille du 1er pour qualifier d'escalade réelle.
// Élimine les DCA à progression légère (100→110→120$) qui sont des stratégies planifiées.
const LC_ESCALATION_FACTOR     = 1.8;

// ── Détection principale ──────────────────────────────────────────────────────

function detectPatterns(trades, metrics) {
  if (!trades || trades.length < 2 || !metrics) return [];

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const detected = [];

  const ot = detectOvertrading(sorted);
  if (ot) detected.push(ot);

  const rv = detectRevenge(sorted, metrics);
  if (rv) detected.push(rv);

  const rr = detectRapidReentry(sorted);
  if (rr) detected.push(rr);

  const si = detectSizeInconsistency(sorted, metrics);
  if (si) detected.push(si);

  const lc = detectLossChasing(sorted);
  if (lc) detected.push(lc);

  dbg('patterns détectés :', detected.map(p => p.type));
  return detected;
}

// ── Tags pour le journal (timestamps → labels) ────────────────────────────────

function tagTrades(trades, metrics) {
  if (!trades || trades.length < 2 || !metrics) return new Map();

  const sorted  = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const tagMap  = new Map();
  const addTag  = (ts, label) => {
    if (!tagMap.has(ts)) tagMap.set(ts, []);
    tagMap.get(ts).push(label);
  };

  // Revenge — v3 : même symbole requis (aligné sur detectRevenge)
  const revengeGapMs = REVENGE_MAX_GAP_MIN * 60000;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]; const curr = sorted[i];
    if (
      prev.side === 'SELL' && curr.side === 'BUY' &&
      prev.symbol === curr.symbol &&
      curr.timestamp - prev.timestamp <= revengeGapMs &&
      curr.quote_quantity > metrics.avgSize * REVENGE_SIZE_FACTOR
    ) {
      addTag(curr.timestamp, 'revenge');
    }
  }

  // Rapid reentry — utilise le même helper que detectRapidReentry
  const rrInstances = findRapidReentryInstances(sorted);
  rrInstances.forEach(({ sell, nextBuy }) => {
    addTag(sell.timestamp,   'reentry');
    addTag(nextBuy.timestamp, 'reentry');
  });

  // Loss chasing — v3 : par symbole + seuil d'escalade significatif (aligné sur detectLossChasing)
  const lcMs     = LC_WINDOW_MIN * 60000;
  const tagSymbols = [...new Set(sorted.map(t => t.symbol))];
  for (const sym of tagSymbols) {
    const buysList = sorted.filter(t => t.side === 'BUY' && t.symbol === sym);
    for (let i = 2; i < buysList.length; i++) {
      const a = buysList[i - 2]; const b = buysList[i - 1]; const c = buysList[i];
      if (
        c.timestamp - a.timestamp <= lcMs &&
        b.quote_quantity > a.quote_quantity &&
        c.quote_quantity > b.quote_quantity &&
        c.quote_quantity > a.quote_quantity * LC_ESCALATION_FACTOR
      ) {
        addTag(a.timestamp, 'escalade');
        addTag(b.timestamp, 'escalade');
        addTag(c.timestamp, 'escalade');
      }
    }
  }

  return tagMap;
}

// ── Fonctions de détection individuelles ──────────────────────────────────────

function detectOvertrading(sorted) {
  const windowMs = OVERTRADING_WINDOW_MIN * 60000;
  let count = 0;

  for (let i = 0; i < sorted.length; i++) {
    const sym = sorted[i].symbol;
    const end = sorted[i].timestamp + windowMs;
    // v3 : filtre par symbole — plusieurs trades sur des paires différentes
    // dans la même fenêtre ne constituent pas de l'overtrading.
    let inWindow = 0;
    for (let j = i; j < sorted.length && sorted[j].timestamp <= end; j++) {
      if (sorted[j].symbol === sym) inWindow++;
    }
    if (inWindow >= OVERTRADING_MIN_TRADES) count++;
  }

  dbg('overtrading — fenêtres déclenchées :', count);
  if (count === 0) return null;
  return {
    type:        'overtrading',
    label:       'Overtrading',
    description: `${count} fenêtre(s) avec ${OVERTRADING_MIN_TRADES}+ trades en ${OVERTRADING_WINDOW_MIN} min sur le même symbole.`,
    severity:    count >= 5 ? 'high' : 'medium',
    count
  };
}

function detectRevenge(sorted, metrics) {
  const gapMs = REVENGE_MAX_GAP_MIN * 60000;
  let count = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]; const curr = sorted[i];
    if (
      prev.side === 'SELL' && curr.side === 'BUY' &&
      // v3 : même symbole requis — un BUY sur une autre paire après un SELL
      // n'est pas une réaction émotionnelle à ce SELL.
      prev.symbol === curr.symbol &&
      curr.timestamp - prev.timestamp <= gapMs &&
      curr.quote_quantity > metrics.avgSize * REVENGE_SIZE_FACTOR
    ) {
      dbg('revenge — instance :', {
        symbol:  curr.symbol,
        gap_min: Math.round((curr.timestamp - prev.timestamp) / 60000),
        taille:  curr.quote_quantity,
        seuil:   Math.round(metrics.avgSize * REVENGE_SIZE_FACTOR)
      });
      count++;
    }
  }

  dbg('revenge — total instances :', count);
  if (count === 0) return null;
  return {
    type:        'revenge_trading',
    label:       'Revenge trading',
    description: `${count} entrée(s) rapide(s) après vente sur le même symbole avec taille > ${REVENGE_SIZE_FACTOR}× la moyenne (${metrics.avgSize} $).`,
    severity:    count >= 3 ? 'high' : 'medium',
    count
  };
}

// CORRIGÉ v2 : cherche dynamiquement le BUY précédent et le BUY suivant
// autour de chaque SELL. L'ancienne version ratait les cas où d'autres trades
// s'intercalaient entre le BUY et le SELL dans le tableau trié.
function detectRapidReentry(sorted) {
  const instances = findRapidReentryInstances(sorted);
  dbg('rapid_reentry — instances :', instances.length, instances.map(r => ({
    hold_min:    Math.round((r.sell.timestamp    - r.prevBuy.timestamp) / 60000),
    reentry_min: Math.round((r.nextBuy.timestamp - r.sell.timestamp)    / 60000)
  })));

  if (instances.length === 0) return null;
  return {
    type:        'rapid_reentry',
    label:       'Réentrée rapide',
    description: `${instances.length} fois : achat → vente < ${RR_HOLD_MAX_MIN} min → nouvel achat < ${RR_REENTRY_MAX_MIN} min.`,
    severity:    instances.length >= 3 ? 'high' : 'medium',
    count:       instances.length
  };
}

// Helper partagé entre detectRapidReentry et tagTrades.
// Pour chaque SELL, cherche le BUY le plus récent avant lui (dans la fenêtre hold)
// et le prochain BUY après lui (dans la fenêtre reentry).
// v3 : toutes les recherches sont restreintes au même symbole que le SELL.
// Un BUY sur une paire différente ne constitue pas une réentrée rapide.
function findRapidReentryInstances(sorted) {
  const holdMs    = RR_HOLD_MAX_MIN    * 60000;
  const reentryMs = RR_REENTRY_MAX_MIN * 60000;
  const instances = [];

  for (let i = 0; i < sorted.length; i++) {
    const sell = sorted[i];
    if (sell.side !== 'SELL') continue;

    // BUY le plus récent AVANT ce SELL — même symbole
    let prevBuy = null;
    for (let j = i - 1; j >= 0; j--) {
      if (sorted[j].side === 'BUY' && sorted[j].symbol === sell.symbol) {
        prevBuy = sorted[j]; break;
      }
    }
    if (!prevBuy) continue;
    if (sell.timestamp - prevBuy.timestamp > holdMs) continue;

    // Prochain BUY APRÈS ce SELL — même symbole
    let nextBuy = null;
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].side === 'BUY' && sorted[j].symbol === sell.symbol) {
        nextBuy = sorted[j]; break;
      }
    }
    if (!nextBuy) continue;
    if (nextBuy.timestamp - sell.timestamp > reentryMs) continue;

    instances.push({ prevBuy, sell, nextBuy });
  }

  return instances;
}

function detectSizeInconsistency(sorted, metrics) {
  if (sorted.length < SIZE_MIN_TRADES) return null;

  const sizes = sorted.map(t => t.quote_quantity).filter(q => q > 0);
  if (sizes.length < SIZE_MIN_TRADES) return null;

  const mean = metrics.avgSize;
  if (mean === 0) return null;

  const variance = sizes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sizes.length;
  const cv = Math.sqrt(variance) / mean;

  dbg('size_inconsistency — CV :', Math.round(cv * 100) + '% (seuil : ' + Math.round(SIZE_CV_THRESHOLD * 100) + '%)');

  if (cv <= SIZE_CV_THRESHOLD) return null;
  return {
    type:        'size_inconsistency',
    label:       'Tailles incohérentes',
    description: `Tes positions varient fortement autour de ta moyenne (${metrics.avgSize} $). Coefficient : ${Math.round(cv * 100)}%.`,
    severity:    cv >= 1.0 ? 'high' : 'medium',
    cv:          Math.round(cv * 100) / 100  // valeur brute pour le scoring
  };
}

function detectLossChasing(sorted) {
  // v3 : on travaille par symbole — une séquence d'escalade n'a de sens que si
  // les 3 BUYs concernent le même actif.
  const symbols = [...new Set(sorted.map(t => t.symbol))];
  const lcMs    = LC_WINDOW_MIN * 60000;
  let count     = 0;

  for (const sym of symbols) {
    const buysList = sorted.filter(t => t.side === 'BUY' && t.symbol === sym);

    for (let i = 2; i < buysList.length; i++) {
      const a = buysList[i - 2]; const b = buysList[i - 1]; const c = buysList[i];
      const windowOk = c.timestamp - a.timestamp <= lcMs;
      // v3 : exige que C soit > LC_ESCALATION_FACTOR × A (pas juste légèrement supérieur).
      // Un DCA planifié à progression légère (100→110→120$) ne doit pas être signalé.
      // Seule une vraie escalade (100→130→180$) déclenche le pattern.
      const sizeOk   = b.quote_quantity > a.quote_quantity
                    && c.quote_quantity > b.quote_quantity
                    && c.quote_quantity > a.quote_quantity * LC_ESCALATION_FACTOR;

      dbg('loss_chasing — triplet BUY :', {
        symbol: sym,
        A: Math.round(a.quote_quantity), B: Math.round(b.quote_quantity), C: Math.round(c.quote_quantity),
        window_min: Math.round((c.timestamp - a.timestamp) / 60000),
        window_ok: windowOk, size_ok: sizeOk
      });

      if (windowOk && sizeOk) count++;
    }
  }

  dbg('loss_chasing — séquences détectées :', count);
  if (count === 0) return null;
  return {
    type:        'loss_chasing',
    label:       'Escalade de position',
    description: `${count} séquence(s) de ${LC_MIN_SEQUENCE} achats consécutifs avec escalade significative (>${Math.round(LC_ESCALATION_FACTOR * 100)}% du 1er) en ${LC_WINDOW_MIN} min.`,
    severity:    count >= 3 ? 'high' : 'medium',
    count
  };
}

export { detectPatterns, tagTrades };
