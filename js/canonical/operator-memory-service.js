// operator-memory-service.js — Interface de lecture de la mémoire opérateur V1
// Opérations O1-O4 — LOT-P1-3.2
// Consomme exclusivement les primitives canoniques de LOT-P1-2.3 (contrainte C1).
// Stateless · read-only (OM-I3 · OM-I6 · OM-I7).

import { readByFamille, readByDateRange, readBySession } from './canonical-read.js';
import { DATE_UNAVAILABLE, DATE_NON_EXPLOITABLE, PHASE_A_ACTIVE_FAMILIES } from './canonical-model.js';

// ─── Libellés opérateur des familles actives Phase A ─────────────────────────
// LOT-P1-3 §6.2 — conformes au Language System V1

export const FAMILLE_LABELS = Object.freeze({
  SY1: 'Mémoire comportementale',
  SY3: 'Mémoire décisionnelle',
  S1:  'Mémoire transactionnelle',
  S2:  'Mémoire patrimoniale',
});

// ─── Libellés opérateur des dates formalisées ─────────────────────────────────
// LOT-P1-3.1 §6.1 — projection des états canoniques vers les libellés opérateur
// OM-I5 : toute date formalisée porte le libellé défini ici, jamais la constante interne.

const _DATE_LABELS = Object.freeze({
  [DATE_UNAVAILABLE]:     'Date non disponible',
  [DATE_NON_EXPLOITABLE]: 'Date non exploitable au format canonique',
});

// ─── Projection : trace canonique → unité mémorielle ─────────────────────────
// D1 Option B — projection partielle : supprime id (OM-I4), transforme date (OM-I5).
// Préserve session null (C5) · valeur intacte (C4) · contexte intact.

function _projectTrace(trace) {
  return {
    famille:  trace.famille,
    source:   trace.source,
    date:     _DATE_LABELS[trace.date] ?? trace.date,
    valeur:   trace.valeur,
    session:  trace.session ?? null,
    contexte: trace.contexte ?? null,
  };
}

// ─── Construction d'un compartiment mémoriel ─────────────────────────────────
// D2 Option B — structure par compartiment (famille → unites[] · vide).
// D3 Option B — compartiment toujours présent même si séquence vide.

function _buildCompartiment(famille, traces) {
  const unites = traces.map(_projectTrace);
  return {
    famille,
    label: FAMILLE_LABELS[famille] ?? famille,
    unites,
    vide:  unites.length === 0,
  };
}

// ─── O1 : Lecture de l'état complet ──────────────────────────────────────────
// Construit les quatre compartiments actifs Phase A depuis le corpus canonique.
// OM-I1 : les quatre compartiments SY1 · SY3 · S1 · S2 sont toujours présents.
// OM-I6 : stateless — construit à la demande, aucun cache interne.
// OM-I7 : aucune écriture dans le corpus ni dans l'index.

export function getOperatorMemoryState() {
  const etat = {};
  for (const famille of PHASE_A_ACTIVE_FAMILIES) {
    const traces = readByFamille(famille);
    etat[famille] = _buildCompartiment(famille, traces);
  }
  return etat;
}

// ─── O2 : Lecture par famille ─────────────────────────────────────────────────
// DI2 : famille hors registre ACF V1 → compartiment présent avec séquence vide.
// Aucune erreur levée — comportement identique aux primitives canoniques sous-jacentes.

export function getCompartiment(famille) {
  const traces = readByFamille(famille);
  return _buildCompartiment(famille, traces);
}

// ─── O3 : Lecture par plage de dates ─────────────────────────────────────────
// Filtre les traces d'une famille dont la date ISO 8601 est dans [startDate, endDate].
// Les traces à date formalisée sont exclues du filtrage (MI-7 · LOT-P1-2.3 §7).
// Tri chronologique délégué à readByDateRange.
// Séquence vide si aucune trace dans la plage — aucune erreur levée (OM-I7).

export function getCompartimentByDate(famille, startDate, endDate) {
  if (!famille || typeof famille !== 'string' || !startDate || !endDate) {
    return _buildCompartiment(famille ?? '', []);
  }
  const allInRange = readByDateRange(startDate, endDate);
  const filtered = allInRange.filter(t => t.famille === famille);
  return _buildCompartiment(famille, filtered);
}

// ─── O4 : Lecture par session ─────────────────────────────────────────────────
// En Phase A : toutes les traces migrées ont session = null.
// O4 retourne systématiquement un compartiment vide pour le corpus Phase A.
// Ce comportement est attendu et documenté (DI1 · RI2 de LOT-P1-3.2 · R5 cadrage §9).

export function getCompartimentBySession(famille, sessionId) {
  if (!famille || !sessionId) {
    return _buildCompartiment(famille ?? '', []);
  }
  const traces = readBySession(sessionId).filter(t => t.famille === famille);
  return _buildCompartiment(famille, traces);
}
