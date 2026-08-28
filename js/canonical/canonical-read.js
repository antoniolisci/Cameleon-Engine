// canonical-read.js — Interface de lecture de la couche canonique V1
// Lecture par famille, par plage de dates et par session.
// LOT-P1-2.3 §6 — LOT-P1-2.1 §9 (MI-7) — LOT-P1-2 §4.5 (I-09)
// Dépendances : storage.js (resolveKey) · canonical-store.js · canonical-index.js · canonical-model.js

import { resolveKey } from '../storage.js';
import { readCorpus } from './canonical-store.js';
import { INDEX_BASE_KEY } from './canonical-index.js';
import { DATE_UNAVAILABLE, DATE_NON_EXPLOITABLE } from './canonical-model.js';

// ─── Constantes internes ──────────────────────────────────────────────────────

// Ensemble des valeurs de date formalisées (MI-7 — LOT-P1-2.1 §9).
// Ces valeurs sont présentes dans byDate sous leur clé littérale,
// mais ne participent pas aux requêtes par plage de dates (LOT-P1-2.3 §7).
const _FORMALIZED_DATES = new Set([DATE_UNAVAILABLE, DATE_NON_EXPLOITABLE]);

// ─── Accès à l'index ─────────────────────────────────────────────────────────

function _readIndex() {
  try {
    const raw = localStorage.getItem(resolveKey(INDEX_BASE_KEY));
    if (!raw) return { byFamille: {}, byDate: {}, bySession: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { byFamille: {}, byDate: {}, bySession: {} };
    return parsed;
  } catch {
    return { byFamille: {}, byDate: {}, bySession: {} };
  }
}

// ─── Résolution des identifiants → traces ─────────────────────────────────────

// Construit une Map id → trace à partir du corpus pour la résolution par identifiant.
function _buildTraceMap(corpus) {
  return new Map(corpus.map(t => [t.id, t]));
}

// Retourne les traces dans l'ordre des identifiants fournis.
// Les identifiants absents du corpus sont ignorés silencieusement (I-09).
function _resolveTraces(ids, traceMap) {
  const result = [];
  for (const id of ids) {
    const trace = traceMap.get(id);
    if (trace) result.push(trace);
  }
  return result;
}

// ─── Interface de lecture ─────────────────────────────────────────────────────

/**
 * Retourne toutes les traces d'une famille mémorielle, dans l'ordre d'écriture.
 * Retourne un tableau vide si la famille est inconnue ou sans trace (I-09).
 * LOT-P1-2.3 §4 — LOT-P1-2 §4.5
 *
 * @param {string} famille — valeur de famille ACF V1
 * @returns {object[]}
 */
export function readByFamille(famille) {
  if (!famille || typeof famille !== 'string') return [];
  const index = _readIndex();
  const ids = index.byFamille[famille];
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const corpus = readCorpus();
  return _resolveTraces(ids, _buildTraceMap(corpus));
}

/**
 * Retourne toutes les traces dont la date est comprise dans la plage [startDate, endDate].
 * Les dates sont comparées en tant que chaînes ISO 8601 UTC (comparaison lexicographique).
 * Les traces à date formalisée (R1/R3/R4) ne participent pas aux requêtes de plage (MI-7).
 * Les traces sont retournées dans l'ordre chronologique (LOT-P1-2.3 §6.1).
 * Retourne un tableau vide si aucune trace ne correspond (I-09).
 *
 * @param {string} startDate — borne inférieure ISO 8601 UTC (incluse)
 * @param {string} endDate   — borne supérieure ISO 8601 UTC (incluse)
 * @returns {object[]}
 */
export function readByDateRange(startDate, endDate) {
  if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') return [];
  const index = _readIndex();
  const corpus = readCorpus();
  const traceMap = _buildTraceMap(corpus);

  // Collecte les identifiants dont la clé de date est ISO 8601 et dans la plage.
  // Les clés formalisées sont explicitement exclues du parcours (LOT-P1-2.3 §7).
  const matchingIds = [];
  for (const [dateKey, ids] of Object.entries(index.byDate)) {
    if (_FORMALIZED_DATES.has(dateKey)) continue;
    if (dateKey >= startDate && dateKey <= endDate) {
      for (const id of ids) matchingIds.push(id);
    }
  }

  // Résolution puis tri chronologique par valeur du champ Date.
  const traces = _resolveTraces(matchingIds, traceMap);
  return traces.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Retourne toutes les traces associées à un identifiant de session donné,
 * dans l'ordre d'écriture (ordre chronologique — LOT-P1-2.3 §6.2).
 * L'identifiant de session est traité comme une valeur opaque.
 * Retourne un tableau vide si aucune trace ne correspond (I-09).
 *
 * @param {string} sessionId — identifiant de session opaque
 * @returns {object[]}
 */
export function readBySession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return [];
  const index = _readIndex();
  const ids = index.bySession[sessionId];
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const corpus = readCorpus();
  return _resolveTraces(ids, _buildTraceMap(corpus));
}
