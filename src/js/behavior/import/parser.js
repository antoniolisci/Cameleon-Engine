// Parses a CSV text string into an array of row objects.
// Handles quoted fields, trims whitespace, and auto-detects the separator.

// ── Separator detection ───────────────────────────────────────────────────────
// Counts occurrences of each candidate separator in the first line.
// The one with the most hits is the most likely column separator.

function detectSeparator(line) {
  const commas     = (line.split(',').length  - 1);
  const semicolons = (line.split(';').length  - 1);
  const tabs       = (line.split('\t').length - 1);
  if (tabs >= semicolons && tabs >= commas) return '\t';
  if (semicolons > commas)                  return ';';
  return ',';
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const sep     = detectSeparator(lines[0]);
  const headers = splitLine(lines[0], sep).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows    = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitLine(line, sep);

    // Lenient : on ne rejette plus les lignes dont le nombre de colonnes diffère.
    // Colonnes supplémentaires → ignorées. Colonnes manquantes → chaîne vide.
    // Cela tolère les exports avec une colonne "Type" en plus, une virgule finale, etc.
    const row = {};
    headers.forEach((h, j) => {
      row[h] = (values[j] !== undefined ? values[j] : '').replace(/^"|"$/g, '').trim();
    });
    rows.push(row);
  }

  return rows;
}

// ── Line splitter ─────────────────────────────────────────────────────────────
// Splits on any single-character separator, respects quoted fields.

function splitLine(line, sep) {
  const result = [];
  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === sep && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

export { parseCSV, detectSeparator };
