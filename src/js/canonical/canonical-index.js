// canonical-index.js — Index triple-axe · Implémentation complète (ML-3)
// Maintient l'index canonique par famille, date et session.
// Fournit la réconciliation de l'index sur demande (non systématique — LOT-P1-2.3 §5.3).
// LOT-P1-2.3 — LOT-P1-2.1 §9 (MI-7)
// Dépendances : storage.js (resolveKey) · canonical-model.js (CANONICAL_FAMILIES)

import { resolveKey } from '../storage.js';
import { CANONICAL_FAMILIES } from './canonical-model.js';

// Clé de base de l'index (namespacing UUID via resolveKey — ML-5)
export const INDEX_BASE_KEY = 'CE_canonical_index_v1';

// ─── Structure de l'index ─────────────────────────────────────────────────────

// Construit un index vide avec byFamille pré-peuplé pour les 13 familles ACF V1.
// Toutes les familles du registre sont présentes avec un ensemble vide (LOT-P1-2.3 §3).
function _buildEmptyIndex() {
  const byFamille = {};
  for (const famille of Object.values(CANONICAL_FAMILIES)) {
    byFamille[famille] = [];
  }
  return { byFamille, byDate: {}, bySession: {} };
}

// ─── Lecture / écriture de l'index ───────────────────────────────────────────

function _readIndex() {
  try {
    const raw = localStorage.getItem(resolveKey(INDEX_BASE_KEY));
    if (!raw) return _buildEmptyIndex();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return _buildEmptyIndex();
    return parsed;
  } catch {
    return _buildEmptyIndex();
  }
}

function _writeIndex(index) {
  try {
    localStorage.setItem(resolveKey(INDEX_BASE_KEY), JSON.stringify(index));
    return true;
  } catch {
    return false;
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────

/**
 * Initialise l'index canonique si absent du stockage.
 * Crée la structure vide avec les 13 familles ACF V1 pré-peuplées.
 * Ne remplace pas un index existant.
 * La réconciliation n'est pas activée à chaque initialisation (LOT-P1-2.3 §5.3).
 * LOT-P1-2.3
 */
export function initCanonicalIndex() {
  try {
    const existing = localStorage.getItem(resolveKey(INDEX_BASE_KEY));
    if (!existing) {
      _writeIndex(_buildEmptyIndex());
    }
  } catch {
    // Défaillance non bloquante — l'index sera absent, la réconciliation
    // conditionnelle peut le reconstruire à l'initialisation (LOT-P1-2.3 §5.3).
  }
}

// ─── Mise à jour de l'index ───────────────────────────────────────────────────

/**
 * Met à jour l'index après écriture d'une trace (RE2 — LOT-P1-2.1 §8.2).
 * Indexation triple-axe : byFamille · byDate · bySession.
 *
 * byFamille : toutes les traces sont indexées par famille, en ordre d'écriture.
 * byDate    : toutes les traces sont indexées par valeur du champ Date, en ordre d'écriture.
 *             Pour les traces à date formalisée (MI-7), l'ordre d'écriture est l'ordre de migration.
 * bySession : uniquement si trace.session est non nul. La valeur est opaque (LOT-P1-2.3 §4).
 *
 * @param {object} trace — trace canonique persistée
 */
export function updateIndex(trace) {
  const index = _readIndex();

  // ── byFamille ─────────────────────────────────────────────────────────────
  if (!Array.isArray(index.byFamille[trace.famille])) {
    index.byFamille[trace.famille] = [];
  }
  index.byFamille[trace.famille].push(trace.id);

  // ── byDate ────────────────────────────────────────────────────────────────
  // Clé = valeur réelle du champ Date (ISO 8601 UTC ou état formalisé).
  // Les traces à date formalisée sont incluses sous leur clé littérale (LOT-P1-2.3 §7).
  if (!Array.isArray(index.byDate[trace.date])) {
    index.byDate[trace.date] = [];
  }
  index.byDate[trace.date].push(trace.id);

  // ── bySession ─────────────────────────────────────────────────────────────
  // La couche indexe uniquement si session est fournie — jamais sur null (LOT-P1-2.3 §4).
  if (trace.session !== null && trace.session !== undefined) {
    if (!Array.isArray(index.bySession[trace.session])) {
      index.bySession[trace.session] = [];
    }
    index.bySession[trace.session].push(trace.id);
  }

  _writeIndex(index);
}

// ─── Réconciliation ───────────────────────────────────────────────────────────

/**
 * Reconstruit l'index à partir du corpus fourni.
 * Capacité offerte par la couche — non activée de façon systématique (LOT-P1-2.3 §5.3).
 * À appeler uniquement lorsqu'une divergence corpus/index est détectée.
 *
 * @param {object[]} corpus — tableau complet des traces canoniques persistées
 */
export function reconcileIndex(corpus) {
  if (!Array.isArray(corpus)) return;
  const index = _buildEmptyIndex();
  for (const trace of corpus) {
    if (!trace || typeof trace !== 'object') continue;

    // byFamille
    if (trace.famille) {
      if (!Array.isArray(index.byFamille[trace.famille])) {
        index.byFamille[trace.famille] = [];
      }
      index.byFamille[trace.famille].push(trace.id);
    }

    // byDate
    if (trace.date) {
      if (!Array.isArray(index.byDate[trace.date])) {
        index.byDate[trace.date] = [];
      }
      index.byDate[trace.date].push(trace.id);
    }

    // bySession — uniquement si non nul
    if (trace.session !== null && trace.session !== undefined) {
      if (!Array.isArray(index.bySession[trace.session])) {
        index.bySession[trace.session] = [];
      }
      index.bySession[trace.session].push(trace.id);
    }
  }
  _writeIndex(index);
}
