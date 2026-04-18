// Validation métier post-normalisation.
// Détecte les incohérences structurelles qui rendent l'analyse peu fiable.
//
// Retourne : { isValid: boolean, warnings: string[] }

function validateTrades(trades) {
  const warnings = [];

  // sécurité tableau vide
  if (!trades || trades.length === 0) {
    return { isValid: false, warnings: ['Aucun trade exploitable'] };
  }

  // 1. Taille moyenne anormale (> 10 000 $)
  const values = trades.map(t =>
    t.quote_quantity > 0 ? t.quote_quantity : t.price * t.quantity
  );

  const avg = values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  if (avg > 10000) {
    warnings.push(`Taille moyenne anormale : ${Math.round(avg)} $ (seuil : 10 000 $)`);
  }

  // 2. Déséquilibre BUY / SELL
  const buyCount  = trades.filter(t => t.side === 'BUY').length;
  const sellCount = trades.filter(t => t.side === 'SELL').length;

  if (buyCount === 0)  warnings.push('Aucun trade BUY détecté — déséquilibre BUY/SELL');
  if (sellCount === 0) warnings.push('Aucun trade SELL détecté — déséquilibre BUY/SELL');

  // 3. Cohérence price × qty ≈ quote_quantity (tolérance ±5%)
  const incoherent = trades.filter(t => {
    if (!t.quote_quantity || t.quote_quantity <= 0) return false;
    const computed = t.price * t.quantity;
    return Math.abs(computed - t.quote_quantity) / t.quote_quantity > 0.05;
  });

  if (incoherent.length > 0) {
    warnings.push(`${incoherent.length} trade(s) avec montant incohérent (price × qty ≠ valeur reportée)`);
  }

  return { isValid: warnings.length === 0, warnings };
}

export { validateTrades };
