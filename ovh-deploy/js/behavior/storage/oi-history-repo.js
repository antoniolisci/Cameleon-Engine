// Persistance de l'historique OI V1 — profils opérateur longitudinaux.
// Stockage : CE_oi_history_v1 (via storage.js → oiHistory)

import { oiHistory } from '../../storage.js';

const SCHEMA_VERSION = 1;
const OI_VERSION     = 1; // Incrémenter si les seuils OI V1 sont recalibrés

export function getAll() {
  return oiHistory.getAll();
}

export function append(entry) {
  return oiHistory.append(entry);
}

export function clear() {
  return oiHistory.clear();
}

// ── buildEntry ────────────────────────────────────────────────
// Construit l'entrée canonique depuis les résultats OI V1 et les métadonnées d'import.
// Si etat === 'Indisponible', la dimension est stockée null (silence structurel).
// importRef : { fileName, rowsKept, nbMoisActifs }

export function buildEntry(capitalResult, cadenceResult, portefeuilleResult, importRef) {
  const cap = (capitalResult && capitalResult.etat !== 'Indisponible') ? {
    etat:      capitalResult.etat,
    confiance: capitalResult.confiance,
    cr3:       capitalResult.cr3 ?? null,
  } : null;

  const cad = (cadenceResult && cadenceResult.etat !== 'Indisponible') ? {
    etat:            cadenceResult.etat,
    confiance:       cadenceResult.confiance,
    active_day_rate: cadenceResult.active_day_rate ?? null,
  } : null;

  const prt = (portefeuilleResult && portefeuilleResult.etat !== 'Indisponible') ? {
    etat:          portefeuilleResult.etat,
    confiance:     portefeuilleResult.confiance,
    noyau_symbols: Array.isArray(portefeuilleResult.noyau_symbols) ? portefeuilleResult.noyau_symbols : [],
    noyau_weight:  portefeuilleResult.noyau_weight ?? null,
  } : null;

  return {
    schemaVersion: SCHEMA_VERSION,
    oiVersion:     OI_VERSION,
    createdAt:     new Date().toISOString(),
    importRef: {
      fileName:     importRef?.fileName     ?? null,
      rowsKept:     importRef?.rowsKept     ?? null,
      nbMoisActifs: importRef?.nbMoisActifs ?? null,
    },
    capital:      cap,
    cadence:      cad,
    portefeuille: prt,
  };
}
