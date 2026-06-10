// Analyzes a Binance account history (wallet) CSV.
// Columns expected: UTC_Time, Operation, Coin, Change, Remark
//
// Does NOT touch the trading pipeline — isolated module.
//
// Output:
//   { type: 'wallet', metrics: {...}, summary: { activityLevel, feeIntensity, behavior } }

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseChange(raw) {
  const str = String(raw || '').trim().replace(/,/g, '').replace(/\s/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function parseWalletDate(str) {
  if (!str) return null;
  str = str.trim();
  // Unix timestamp (10 or 13 digits)
  if (/^\d{10}$/.test(str)) return parseInt(str, 10) * 1000;
  if (/^\d{13}$/.test(str)) return parseInt(str, 10);
  // Text: "2023-01-15 10:30:00" or ISO
  const normalized = str.replace(' ', 'T');
  const suffix = (normalized.includes('Z') || normalized.includes('+')) ? '' : 'Z';
  const d = new Date(normalized + suffix);
  return isNaN(d.getTime()) ? null : d.getTime();
}

// Returns the value of the first key found in normalized row, or ''.
function get(row, ...candidates) {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== '') return row[c];
  }
  return '';
}

// ── Main analyzer ─────────────────────────────────────────────────────────────

function analyzeWallet(rows) {
  if (!rows || rows.length === 0) {
    return { type: 'wallet', metrics: null, summary: null };
  }

  // Normalize all column keys to lowercase+trimmed for alias tolerance
  const normalized = rows.map(row => {
    const r = {};
    for (const [k, v] of Object.entries(row)) {
      r[k.toLowerCase().trim()] = v;
    }
    return r;
  });

  let totalVolume    = 0;
  let totalFees      = 0;   // count of fee operations
  let totalFeeAmount = 0;   // sum of |Change| for fee operations
  let totalEarnRewards = 0; // count of earn/reward/staking operations
  let totalConvert   = 0;   // count of convert/swap operations

  const uniqueCoins     = new Set();
  const operationsByDay = {};
  const timestamps      = [];

  for (const row of normalized) {
    const operation = get(row, 'operation').toLowerCase().trim();
    const coin      = get(row, 'coin', 'asset').trim().toUpperCase();
    const change    = parseChange(get(row, 'change'));
    const absChange = Math.abs(change);
    const ts        = parseWalletDate(get(row, 'utc_time', 'time', 'date', 'timestamp', 'date(utc)'));

    if (coin) uniqueCoins.add(coin);
    totalVolume += absChange;

    if (operation.includes('fee') || operation.includes('commission')) {
      totalFees++;
      totalFeeAmount += absChange;
    }

    if (
      operation.includes('reward')    ||
      operation.includes('earn')      ||
      operation.includes('interest')  ||
      operation.includes('saving')    ||
      operation.includes('staking')
    ) {
      totalEarnRewards++;
    }

    if (operation.includes('convert') || operation.includes('swap')) {
      totalConvert++;
    }

    if (ts) {
      timestamps.push(ts);
      const day = new Date(ts).toISOString().slice(0, 10); // "YYYY-MM-DD"
      operationsByDay[day] = (operationsByDay[day] || 0) + 1;
    }
  }

  const totalOperations = rows.length;
  const dayValues       = Object.values(operationsByDay);
  const maxOperationsInOneDay = dayValues.length > 0 ? Math.max(...dayValues) : 0;

  // avgOperationPerDay : based on actual observed span
  let avgOperationPerDay = 0;
  if (timestamps.length > 1) {
    const spanDays = Math.max(
      (Math.max(...timestamps) - Math.min(...timestamps)) / 86400000,
      1
    );
    avgOperationPerDay = Math.round((totalOperations / spanDays) * 10) / 10;
  } else if (timestamps.length === 1) {
    avgOperationPerDay = totalOperations;
  }

  // ── Summary ──────────────────────────────────────────────────────────────────

  const activityLevel = avgOperationPerDay > 10 ? 'high'
    : avgOperationPerDay > 3  ? 'medium'
    : 'low';

  // feeIntensity based on fee amount vs total volume moved
  const feeRatio    = totalVolume > 0 ? totalFeeAmount / totalVolume : 0;
  const feeIntensity = feeRatio > 0.01  ? 'high'
    : feeRatio > 0.003 ? 'medium'
    : 'low';

  // behavior : dominant signal in plain French
  let behavior;
  if (totalConvert > 10) {
    behavior = 'Rotation fréquente d\'actifs — comportement impulsif possible';
  } else if (activityLevel === 'high') {
    behavior = 'Activité wallet élevée — nombreuses opérations quotidiennes';
  } else if (feeIntensity === 'high') {
    behavior = 'Coûts de transaction élevés — impact significatif sur la performance';
  } else if (totalEarnRewards > 5) {
    behavior = 'Utilisation active de produits passifs (earn / staking / rewards)';
  } else if (totalConvert > 3) {
    behavior = 'Conversions récurrentes — surveillance du timing conseillée';
  } else if (activityLevel === 'low') {
    behavior = 'Activité wallet faible — profil conservateur ou inactif';
  } else {
    behavior = 'Profil équilibré — aucun signal comportemental dominant';
  }

  return {
    type: 'wallet',
    metrics: {
      totalOperations,
      uniqueCoins:          [...uniqueCoins].sort(),
      totalVolume:          Math.round(totalVolume    * 100) / 100,
      totalFees,
      totalFeeAmount:       Math.round(totalFeeAmount * 100) / 100,
      totalEarnRewards,
      totalConvert,
      avgOperationPerDay,
      maxOperationsInOneDay
    },
    summary: {
      activityLevel,
      feeIntensity,
      behavior
    }
  };
}

export { analyzeWallet };
