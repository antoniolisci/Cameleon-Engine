// PDF_IMPORT_V1 — Phase 3 : normalisation vers le format canonique Caméléon
// Format cible : { timestamp, symbol, side, price, quantity, quote_quantity, fee, session_id, tags }
// Règle date : préfixer "20" avant parsing (PDF-ARCH-04) · offset UTC+2 → −7 200 000 ms
// Référence architecturale : docs/architecture/pdf-import-v1-architecture.md · PDF-ARCH-04

export {};
