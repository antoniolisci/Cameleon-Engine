// Regroupe les trades grille avant l'analyse comportementale.
//
// Problème : un trader utilisant une grille de limit orders génère de nombreux
// petits trades (même symbole, même côté, courte fenêtre temporelle) qui
// déclenchent à tort overtrading / rapid_reentry / size_inconsistency.
//
// Solution : consolider ces trades en un "groupe-trade" synthétique avant
// la détection de patterns. Le groupe représente une intention unique.
//
// Critères de regroupement :
//   - Même symbole
//   - Même côté (BUY ou SELL)
//   - Écart temporel entre trades consécutifs < GRID_GAP_MIN
//   - Au moins GRID_MIN_MEMBERS trades dans le groupe
//
// Trade synthétique produit :
//   timestamp     : timestamp du premier trade du groupe
//   symbol        : inchangé
//   side          : inchangé
//   price         : prix moyen pondéré par quantité
//   quantity      : somme des quantités
//   quote_value   : somme des quote_values
//   fee           : somme des frais
//   _isGridGroup  : true (flag pour traçabilité)
//   _groupSize    : nombre de trades consolidés

// ── Paramètres ────────────────────────────────────────────────────────────────

const GRID_GAP_MIN    = 5;    // écart max entre deux trades consécutifs du groupe (minutes)
const GRID_MIN_MEMBERS = 3;   // minimum de trades pour former un groupe

// ── groupGridTrades ───────────────────────────────────────────────────────────
// trades : tableau de trades canoniques (doit avoir timestamp, symbol, side, price, quantity, quote_value, fee)
// Retourne un nouveau tableau où les séquences grille sont consolidées.

function groupGridTrades(trades) {
  if (!trades || trades.length < GRID_MIN_MEMBERS) return trades;

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const result = [];

  let i = 0;
  while (i < sorted.length) {
    const anchor = sorted[i];
    const group  = [anchor];

    // Étendre le groupe tant que le prochain trade correspond au critère
    let j = i + 1;
    while (j < sorted.length) {
      const next    = sorted[j];
      const prev    = sorted[j - 1];
      const gapMin  = (next.timestamp - prev.timestamp) / 60000;

      if (next.symbol === anchor.symbol &&
          next.side   === anchor.side   &&
          gapMin      <= GRID_GAP_MIN) {
        group.push(next);
        j++;
      } else {
        break;
      }
    }

    if (group.length >= GRID_MIN_MEMBERS) {
      result.push(consolidateGroup(group));
      i = j;
    } else {
      result.push(anchor);
      i++;
    }
  }

  const gridGroups = result.filter(t => t._isGridGroup).length;
  if (gridGroups > 0) {
    console.debug('[bhv:grid] %d trades → %d après regroupement grille (%d groupes)',
      trades.length, result.length, gridGroups);
  }

  return result;
}

// ── consolidateGroup ──────────────────────────────────────────────────────────
// Fusionne un groupe de trades en un trade synthétique représentatif.

function consolidateGroup(group) {
  const totalQty   = group.reduce((s, t) => s + (t.quantity    || 0), 0);
  const totalQuote = group.reduce((s, t) => s + (t.quote_value || 0), 0);
  const totalFee   = group.reduce((s, t) => s + (t.fee         || 0), 0);

  // Prix moyen pondéré par quantité
  const vwap = totalQty > 0 ? totalQuote / totalQty : group[0].price;

  return {
    timestamp:     group[0].timestamp,
    symbol:        group[0].symbol,
    side:          group[0].side,
    price:         vwap,
    quantity:      totalQty,
    quote_value:   totalQuote,
    quote_quantity: totalQuote,
    fee:           totalFee,
    session_id:    group[0].session_id,
    tags:          [],
    _isGridGroup:  true,
    _groupSize:    group.length
  };
}

export { groupGridTrades, GRID_GAP_MIN, GRID_MIN_MEMBERS };
