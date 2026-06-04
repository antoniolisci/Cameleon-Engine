// PDF_IMPORT_V1 — Phase 1 : détection de la famille PDF Binance
// Familles : TRADE_HISTORY | ORDER_HISTORY | UNKNOWN
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md · PDF-ARCH-01
//
// Stratégie : signaux forts uniquement (poids 3) + comptage statuts d'ordre.
// Les signaux partagés (paire, côté, exécuté) sont exclus — ils ne discriminent pas.
//
// Problèmes résolus :
//   - U+2019 (apostrophe typographique Binance) → remplacé par espace avant matching
//   - U+00B0 (signe degré dans "N°") → supprimé avant matching
//   - Doublons après normalisation NFD (côté/cote, exécuté/execute) → supprimés

// ── Normalisation robuste ──────────────────────────────────────────────────
// Gère : accents NFD · apostrophe typographique U+2019 · signe degré U+00B0 · casse

function _norm(str) {
  return str
    .toLowerCase()
    .replace(/\u2019/g, ' ')              // apostrophe typographique Binance → espace
    .replace(/°/g, '')                    // signe degré (N° → N)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')     // supprime les diacritiques
    .replace(/\s+/g, ' ')               // normalise les espaces
    .trim();
}

// ── Signaux forts Trade History ────────────────────────────────────────────
// Reconnaissance basée sur les identifiants de section et le champ "Frais",
// qui est absent de Order History.
// Les colonnes partagées (Paire, Côté, Exécuté) sont exclues volontairement.

const STRONG_TRADE = [
  'trade history',
  'historique des trades spot',
  'historique des trades',
  'frais',
  'fee',
];

// ── Signaux forts Order History ────────────────────────────────────────────
// "Commentaires" = bloc explicatif présent uniquement sur la page 1 de tout
// Order History Binance (PDF-ARCH-03). Signal exclusif très fiable.
// "Numéro de commande" / "n commande" = colonne absente de Trade History.
// "Statut" = colonne absente de Trade History.

const STRONG_ORDER = [
  'order history',
  'historique d ordre spot',    // "Historique d'ordre Spot" — U+2019 normalisé
  'historique d ordre',         // "Historique d'ordre"      — U+2019 normalisé
  'historique des ordres',
  'numero de commande',         // "Numéro de commande"      — accents normalisés
  'n commande',                 // "N° commande"             — ° supprimé
  'commentaires',               // bloc page 1 Order History — exclusif
  'statut',
];

// ── detectPdfFamily ────────────────────────────────────────────────────────
// rawText : string — texte brut concaténé de toutes les pages
// items   : array  — items positionnels (réservé Phase 2, non utilisé ici)
// Retourne : 'TRADE_HISTORY' | 'ORDER_HISTORY' | 'UNKNOWN'

function detectPdfFamily(rawText, items) {
  const text = _norm(rawText);

  // ── Score signaux forts ────────────────────────────────────────────────
  let tradeScore = 0;
  let orderScore = 0;

  for (const sig of STRONG_TRADE) {
    if (text.includes(sig)) tradeScore += 3;
  }

  for (const sig of STRONG_ORDER) {
    if (text.includes(sig)) orderScore += 3;
  }

  // ── Statuts d'ordre (haute densité dans Order History) ──────────────────
  // FILLED / CANCELED / NEW apparaissent sur chaque ligne de données Order History.
  // Présence massive → signal quasi certain de famille Order.
  const countStatuts =
    (text.match(/filled/g)   || []).length +
    (text.match(/canceled/g) || []).length;

  if (countStatuts >= 3) orderScore += 3;

  // ── Décision ──────────────────────────────────────────────────────────────
  if (orderScore > tradeScore) return 'ORDER_HISTORY';
  if (tradeScore > 0)          return 'TRADE_HISTORY';
  return 'UNKNOWN';
}

export { detectPdfFamily };
