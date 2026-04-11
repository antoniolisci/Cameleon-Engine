// Parses a CSV text string into an array of row objects.
// Handles quoted fields and trims whitespace.

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitLine(line);
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((h, j) => {
      row[h] = values[j].replace(/^"|"$/g, '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

export { parseCSV };
