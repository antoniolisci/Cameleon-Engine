// Regroupe les trades grille avant l'analyse comportementale.
//
// Problème : un trader utilisant une grille de limit orders génère de nombreux
// petits trades (même symbole, même côté, courte fenêtre temporelle) qui
// déclenchent à tort overtrading / rapid_reentry / size_inconsistency.
//
// Solution : consolider ces trades en un "groupe-trade" synthétique UNIQUEMENT
// si les critères stricts ci-dessous sont tous satisfaits. L'objectif est
// d'identifier une intention unique, pas de cacher un comportement agressif.
//
// ── LIMITATION DOCUMENTÉE ────────────────────────────────────────────────────
// Ce module travaille exclusivement sur les timestamps d'EXÉCUTION (fill time),
// qui est la seule information disponible dans Trade History.
//
// Il NE PEUT PAS reconstruire une grille d'ordres limites posés ensemble
// mais exécutés à plusieurs heures d'écart. Exemple :
//   10h00 : 4 limit BUY BTCUSDT placés à $95k / $94.5k / $94k / $93.5k
//   10h05 : fill à $95k    → trade 1
//   10h47 : fill à $94.5k  → trade 2 (gap 42 min > seuil → rupture du groupe)
//   12h31 : fill à $94k    → trade 3
// → aucun groupe détecté. Les 3 fills restent des trades distincts.
//
// Pour ce cas, Order History est la source fiable. Le pont comportemental V4.2
// dans scoring.js permet à un profil GRID détecté en Order History de
// contextualiser le scoring Trade History (atténuation de la pénalité
// overtrading isolé via behaviorRepo.orderStrategyProfile).
//
// ── Critères de regroupement ──────────────────────────────────────────────────
//   1. Même symbole
//   2. Même côté (BUY ou SELL)
//   3. Écart entre deux trades consécutifs du groupe < GRID_GROUP_GAP_MIN
//   4. Fenêtre totale du groupe (dernier − premier) ≤ GRID_GROUP_MAX_WINDOW_MIN
//   5. Nombre de membres ≥ GRID_GROUP_MIN_MEMBERS ET ≤ GRID_GROUP_MAX_TRADES
//
// ── Trade synthétique produit ─────────────────────────────────────────────────
//   timestamp       : timestamp du PREMIER trade (pour tri chronologique)
//   _lastTimestamp  : timestamp du DERNIER trade (pour rapid_reentry correct)
//   symbol          : inchangé
//   side            : inchangé
//   price           : VWAP (prix moyen pondéré par quantité)
//   quantity        : somme des quantités
//   quote_value     : somme des quote_values
//   fee             : somme des frais
//   _isGridGroup    : true (flag traçabilité)
//   _groupSize      : nombre de trades absorbés

// ── Config centralisée ────────────────────────────────────────────────────────
// Tous les magic numbers en un seul endroit — ajuster ici uniquement.

const GRID_GROUP_GAP_MIN        = 3;    // écart max entre deux trades CONSÉCUTIFS (minutes)
                                        // > 3 min entre deux BUYs = probablement pas la même grille
const GRID_GROUP_MAX_WINDOW_MIN = 30;   // durée totale max du groupe (premier → dernier, minutes)
                                        // au-delà, on est dans un overtrading long, pas une grille
const GRID_GROUP_MIN_MEMBERS    = 3;    // minimum de trades pour former un groupe
                                        // 2 trades proches = coïncidence, pas une grille
const GRID_GROUP_MAX_TRADES     = 10;   // plafond de trades absorbés dans un groupe
                                        // évite d'engloutir un vrai comportement agressif prolongé

// ── Debug ─────────────────────────────────────────────────────────────────────
const DEBUG = false;
const dbg = (...args) => { if (DEBUG) console.debug('[bhv:grid]', ...args); };

// ── groupGridTrades ───────────────────────────────────────────────────────────
// trades : tableau de trades canoniques
// Retourne un nouveau tableau où les séquences grille qualifiées sont consolidées.

function groupGridTrades(trades) {
  if (!trades || trades.length < GRID_GROUP_MIN_MEMBERS) return trades;

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const result = [];

  dbg('entrée : %d trades', sorted.length);

  let i = 0;
  while (i < sorted.length) {
    const anchor    = sorted[i];
    const candidate = [anchor];

    let j = i + 1;
    while (j < sorted.length && candidate.length < GRID_GROUP_MAX_TRADES) {
      const next = sorted[j];
      const prev = sorted[j - 1];

      const gapMin    = (next.timestamp - prev.timestamp) / 60000;
      const windowMin = (next.timestamp - anchor.timestamp) / 60000;

      const sameSymbol  = next.symbol === anchor.symbol;
      const sameSide    = next.side   === anchor.side;
      const gapOk       = gapMin    <= GRID_GROUP_GAP_MIN;
      const windowOk    = windowMin <= GRID_GROUP_MAX_WINDOW_MIN;

      if (sameSymbol && sameSide && gapOk && windowOk) {
        candidate.push(next);
        j++;
      } else {
        dbg('rupture groupe sur %s/%s : %s %s %s %s',
          anchor.symbol, anchor.side,
          !sameSymbol ? 'symbole≠' : '',
          !sameSide   ? 'côté≠'   : '',
          !gapOk      ? `gap=${gapMin.toFixed(1)}min>seuil` : '',
          !windowOk   ? `window=${windowMin.toFixed(1)}min>max` : ''
        );
        break;
      }
    }

    if (candidate.length >= GRID_GROUP_MIN_MEMBERS) {
      const group = consolidateGroup(candidate);
      result.push(group);
      dbg('groupe créé : %s %s · %d trades · window=%dmin · VWAP=%s',
        anchor.symbol, anchor.side,
        candidate.length,
        Math.round((candidate[candidate.length - 1].timestamp - anchor.timestamp) / 60000),
        group.price.toFixed(4)
      );
      i = j;
    } else {
      result.push(anchor);
      i++;
    }
  }

  const gridGroups  = result.filter(t => t._isGridGroup);
  const absorbed    = gridGroups.reduce((s, t) => s + t._groupSize, 0);
  const remaining   = result.length;

  if (gridGroups.length > 0) {
    console.debug('[bhv:grid] %d trades → %d (groupes: %d, absorbés: %d)',
      sorted.length, remaining, gridGroups.length, absorbed);
  } else {
    dbg('aucun groupe détecté — tous les trades conservés');
  }

  return result;
}

// ── consolidateGroup ──────────────────────────────────────────────────────────
// Fusionne un groupe en trade synthétique.
// _lastTimestamp stocke le timestamp du dernier membre — utilisé par
// findRapidReentryInstances() pour calculer le hold time réel (BUY_dernier → SELL),
// pas depuis le premier BUY du groupe.

function consolidateGroup(group) {
  const totalQty   = group.reduce((s, t) => s + (t.quantity    || 0), 0);
  const totalQuote = group.reduce((s, t) => s + (t.quote_value || 0), 0);
  const totalFee   = group.reduce((s, t) => s + (t.fee         || 0), 0);

  // VWAP : prix moyen pondéré par quantité base
  const vwap = totalQty > 0 ? totalQuote / totalQty : group[0].price;

  return {
    timestamp:      group[0].timestamp,                       // premier — pour tri
    _lastTimestamp: group[group.length - 1].timestamp,        // dernier — pour hold time
    symbol:         group[0].symbol,
    side:           group[0].side,
    price:          vwap,
    quantity:       totalQty,
    quote_value:    totalQuote,
    quote_quantity: totalQuote,
    fee:            totalFee,
    session_id:     group[0].session_id,
    tags:           [],
    _isGridGroup:   true,
    _groupSize:     group.length
  };
}

// ── Exports ───────────────────────────────────────────────────────────────────

export {
  groupGridTrades,
  GRID_GROUP_GAP_MIN,
  GRID_GROUP_MAX_WINDOW_MIN,
  GRID_GROUP_MIN_MEMBERS,
  GRID_GROUP_MAX_TRADES
};
