// PDF_IMPORT_V1 — Phase 1 : chargement PDF.js et extraction positionnelle
// Périmètre : Binance Trade History Spot PDF · Binance Order History Spot PDF
// Dépend de : src/js/vendor/pdf.min.mjs + pdf.worker.min.mjs
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md

// ── Chargement PDF.js (singleton) ──────────────────────────────────────────

let _pdfjsLib = null;

async function _getPdfjsLib() {
  if (_pdfjsLib) return _pdfjsLib;
  const mod = await import(new URL('../../vendor/pdf.min.mjs', import.meta.url).href);
  mod.GlobalWorkerOptions.workerSrc = new URL('../../vendor/pdf.worker.min.mjs', import.meta.url).href;
  _pdfjsLib = mod;
  return _pdfjsLib;
}

// ── loadPdfTextItems ────────────────────────────────────────────────────────
// fileOrPath : File | Blob | URL string
// Retourne   : { pages, items, rawText, quality }
// items[]    : { str, x, y, width, height, page }
//
// Contrat :
//   - aucune reconstruction de lignes
//   - aucune interprétation de colonnes
//   - coordonnées brutes PDF.js (origine bas-gauche)

async function loadPdfTextItems(fileOrPath) {
  const pdfjsLib = await _getPdfjsLib();

  let data;
  if (fileOrPath instanceof Blob) {
    data = await fileOrPath.arrayBuffer();
  } else {
    const resp = await fetch(fileOrPath);
    if (!resp.ok) throw new Error(`loadPdfTextItems: HTTP ${resp.status} — ${fileOrPath}`);
    data = await resp.arrayBuffer();
  }

  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = pdfDoc.numPages;

  const items = [];
  let rawText = '';

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (typeof item.str !== 'string') continue;
      const [, , , , x, y] = item.transform;
      items.push({
        str:    item.str,
        x,
        y,
        width:  item.width,
        height: item.height,
        page:   p,
      });
      rawText += item.str + ' ';
    }
  }

  const result = { pages: numPages, items, rawText };
  result.quality = detectPdfQuality(result);
  return result;
}

// ── detectPdfQuality ────────────────────────────────────────────────────────
// result : objet produit par loadPdfTextItems (quality non encore défini)
// Retourne : 'NATIVE' | 'DEGRADED' | 'SCANNED' | 'UNREADABLE'
//
// Logique :
//   UNREADABLE  — aucun item extrait
//   SCANNED     — items présents mais rawText presque vide (PDF image)
//   DEGRADED    — très peu d'items par page (texte tronqué ou corrompu)
//   NATIVE      — PDF texte natif, contenu lisible

function detectPdfQuality(result) {
  const { items, rawText, pages } = result;

  if (!items || items.length === 0) return 'UNREADABLE';

  const meaningfulChars = (rawText || '').replace(/\s+/g, '').length;
  if (meaningfulChars < 20) return 'SCANNED';

  const itemsPerPage = items.length / Math.max(pages, 1);
  if (itemsPerPage < 5) return 'DEGRADED';

  return 'NATIVE';
}

// Pré-chauffe le singleton pdf.js — fire-and-forget, pas d'await.
// À appeler dès l'ouverture du panneau comportemental pour éviter l'échec
// à froid sur iOS Safari (Web Worker non initialisé au premier import).
function warmupPdfLoader() {
  _getPdfjsLib().catch(() => { /* non-bloquant — ignoré si échec au pré-chargement */ });
}

export { loadPdfTextItems, detectPdfQuality, warmupPdfLoader };
