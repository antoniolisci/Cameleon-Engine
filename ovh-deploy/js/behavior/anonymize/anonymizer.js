// anonymizer.js
//
// Couche d'anonymisation locale des trades Binance.
// Appelé AVANT tout stockage (behaviorRepo, sessionRepo, debug, export).
//
// Principe :
//   - Supprime les identifiants pouvant lier un trade à un compte réel.
//   - Ne modifie JAMAIS les champs comportementaux (timestamp, symbol, side,
//     price, quantity, fee, quote_value, quote_quantity, tags, fillRate).
//   - Ne casse pas les patterns, la chronologie, ni les relations BUY/SELL.
//
// Champs anonymisés :
//   orderId   — identifiant d'ordre Binance (Order History uniquement)
//
// Champs conservés (liste exhaustive) :
//   timestamp, symbol, side, price, quantity, quote_value, quote_quantity,
//   fee, session_id, tags, status, fillRate
//
// Ce module est une fonction pure : pas d'effets de bord, pas d'import
// de modules métier, testable en isolation.

/**
 * Anonymise un trade canonique unique.
 * Retourne un nouveau objet — ne modifie pas l'original.
 *
 * @param {Object} trade — trade canonique issu du pipeline import
 * @returns {Object} trade anonymisé
 */
export function anonymizeTrade(trade) {
  if (!trade || typeof trade !== 'object') return trade;

  const sanitized = { ...trade };

  // orderId — seul champ PII réel dans le trade canonique.
  // Présent uniquement dans les imports Order History (binance_order.js).
  // Supprimé : un orderId Binance est directement traçable vers un compte.
  if ('orderId' in sanitized) {
    sanitized.orderId = null;
  }

  return sanitized;
}

/**
 * Anonymise un tableau de trades canoniques.
 * Retourne un nouveau tableau — ne modifie pas l'original.
 *
 * @param {Object[]} trades — tableau de trades canoniques
 * @returns {Object[]} tableau de trades anonymisés
 */
export function anonymizeTrades(trades) {
  if (!Array.isArray(trades)) return trades;
  return trades.map(anonymizeTrade);
}
