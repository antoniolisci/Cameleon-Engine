// Orchestrates file reading, parsing, mapping and validation for a Binance Spot CSV.

import { parseCSV } from './parser.js';
import { mapBinanceSpotRow } from '../normalize/mappers/binance_spot.js';
import { isValidTrade } from '../normalize/validator.js';

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.readAsText(file, 'UTF-8');
  });
}

async function importBinanceSpot(file) {
  let text;
  try {
    text = await readFileAsText(file);
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier.', trades: [] };
  }

  const rows = parseCSV(text);
  if (rows.length === 0) {
    return { ok: false, error: 'Fichier vide ou format non reconnu.', trades: [] };
  }

  const sessionId = `session_${Date.now()}`;
  const trades  = [];
  let   skipped = 0;

  for (const row of rows) {
    const trade = mapBinanceSpotRow(row, sessionId);
    if (trade && isValidTrade(trade)) {
      trades.push(trade);
    } else {
      skipped++;
    }
  }

  if (trades.length === 0) {
    return {
      ok: false,
      error: 'Aucun trade valide trouvé. Vérifiez que le fichier est bien un export Binance Spot (colonnes : Date(UTC), Pair, Side, Price, Executed, Amount, Fee).',
      trades: []
    };
  }

  return { ok: true, trades, skipped, sessionId };
}

export { importBinanceSpot };
