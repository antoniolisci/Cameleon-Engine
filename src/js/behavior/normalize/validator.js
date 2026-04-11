// Validates that a mapped trade satisfies the canonical format minimum requirements.

function isValidTrade(trade) {
  if (!trade) return false;
  if (typeof trade.timestamp !== 'number' || trade.timestamp <= 0) return false;
  if (typeof trade.symbol !== 'string' || trade.symbol.length === 0) return false;
  if (!['BUY', 'SELL'].includes(trade.side)) return false;
  if (typeof trade.price !== 'number' || trade.price <= 0) return false;
  if (typeof trade.quantity !== 'number' || trade.quantity <= 0) return false;
  return true;
}

export { isValidTrade };
