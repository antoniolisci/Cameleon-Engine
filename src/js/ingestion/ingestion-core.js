// ingestion-core.js — Core d'orchestration d'ingestion V1
// Orchestre le pipeline en 11 étapes (P2-2.D §8.2) et maintient le registre des adaptateurs.
// Point d'entrée unique du module d'ingestion : ingest(descriptor).
// LOT-P2-2.D §7–§8 · LOT-P2-2.E §8
//
// Invariants Core First (I-D1→I-D4, P2-2.D §4) :
//   I-D1 : Core ne connaît aucun format, aucune plateforme, aucun schéma de champs
//   I-D2 : Adaptateurs ne contrôlent jamais la séquence d'ingestion
//   I-D3 : Séquence d'orchestration identique pour toutes familles et adaptateurs
//   I-D4 : Ajout d'un adaptateur = zéro modification du Core
//
// Dépendances :
//   - src/js/canonical/canonical-store.js   (writeIngestedTrace)
//   - src/js/ingestion/ingestion-registry.js (findByFingerprint · addEntry)
//   - src/js/canonical/canonical-index.js   (INDEX_BASE_KEY — lecture étape 10)
//   - src/js/storage.js                     (resolveKey — lecture index étape 10)

import { writeIngestedTrace }          from '../canonical/canonical-store.js';
import { findByFingerprint, addEntry } from './ingestion-registry.js';
import { INDEX_BASE_KEY }              from '../canonical/canonical-index.js';
import { resolveKey }                  from '../storage.js';

// ─── Registre des adaptateurs ─────────────────────────────────────────────────

// Tableau ordonné d'adaptateurs déclarés. L'ordre détermine la priorité de résolution (étape 1).
// En Phase A : un seul adaptateur (Binance S1). Extensible sans modification du Core (I-D4).
const _adapters = [];

// ─── Utilitaires internes ─────────────────────────────────────────────────────

/**
 * Génère un identifiant de session unique préfixé "SID-".
 * @returns {string}
 */
function _generateSessionId() {
  return 'SID-' + crypto.randomUUID();
}

/**
 * Lit l'index canonique brut depuis localStorage pour vérification (étape 10).
 * canonical-index.js n'expose pas de fonction readIndex() — lecture directe via resolveKey (ML-5).
 * Retourne null si l'index est absent ou illisible.
 * @returns {object|null}
 */
function _readIndexRaw() {
  try {
    const raw = localStorage.getItem(resolveKey(INDEX_BASE_KEY));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Classifie la valeur de date retournée par processEvent en état EP-RC2.
 *
 * Contrainte d'implémentation : R1 ("date absente") et R3 ("format non reconnu")
 * produisent tous deux la sentinelle 'Non disponible'. Ils sont indistinguables
 * depuis la valeur de date seule — les deux sont comptés sous R1.
 * En conséquence dateStates.R3 est toujours 0 (LOT-P2-2.E §8.3 · LOT-P2-2_B §4 EP-RC2).
 *
 * @param {string|undefined} date — valeur retournée par processEvent().date
 * @returns {'standard'|'R1'|'R4'}
 */
function _classifyDateState(date) {
  if (!date || date === 'Non disponible') return 'R1';
  if (date === 'Non exploitable au format canonique') return 'R4';
  return 'standard';
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Enregistre un adaptateur dans le registre du Core.
 * L'ordre d'enregistrement détermine la priorité de résolution (étape 1).
 * I-D4 : l'ajout d'un adaptateur ne requiert aucune modification du Core.
 *
 * @param {object} adapter — objet exposant les 6 capacités du contrat (P2-2.D §7.2) :
 *   famille · canHandle · getSourceId · fingerprint · extractEvents · processEvent
 */
export function registerAdapter(adapter) {
  if (adapter && typeof adapter === 'object') {
    _adapters.push(adapter);
  }
}

/**
 * Orchestre le pipeline d'ingestion en 11 étapes (P2-2.D §8.1–§8.2).
 * Point d'entrée unique du module d'ingestion.
 *
 * Retours possibles :
 *   { type: 'source-non-reconnue' }
 *     Aucun adaptateur enregistré ne reconnaît le descripteur.
 *     Aucune trace écrite · aucune session créée.
 *
 *   { type: 'doublon', sourceId: string, importedAt: string, traceCount: number }
 *     L'empreinte du descripteur est déjà présente dans le registre (DT-2).
 *     Import bloqué avant création de session.
 *
 *   { type: 'rapport', sessionId, sourceId, totalLines, qualified, excluded,
 *     rejected, written, failed, dateStates, result [, indexEcarts] }
 *     Rapport de session complet (P2-2.C §5.3).
 *     result : 'succès' · 'succès partiel' · 'échec'.
 *
 * @param {{ type: string, data: any, meta: { name: string } }} descriptor
 * @returns {Promise<object>}
 */
export async function ingest(descriptor) {

  // ── Étape 1 — Résolution ─────────────────────────────────────────────────
  // Parcourir le registre · canHandle(descriptor) · premier vrai = adaptateur.
  // Si aucun adaptateur ne reconnaît la source : fin du pipeline (P2-2.D §7.3).
  let adapter = null;
  for (const a of _adapters) {
    if (await a.canHandle(descriptor)) {
      adapter = a;
      break;
    }
  }
  if (!adapter) {
    return { type: 'source-non-reconnue' };
  }

  // ── Étape 2 — Empreinte ──────────────────────────────────────────────────
  const fingerprint = await adapter.fingerprint(descriptor);

  // ── Étape 3 — Déduplication ──────────────────────────────────────────────
  // Consulter le registre AVANT la création de session (DT-2 · P2-2.C §4.4).
  // Correction INV-9 (b351938) : source déjà enregistrée → bloquée avant session.
  const existing = findByFingerprint(fingerprint);
  if (existing) {
    return {
      type:       'doublon',
      sourceId:   existing.sourceId,
      importedAt: existing.importedAt,
      traceCount: existing.traceCount,
    };
  }

  // ── Étape 4 — Session ────────────────────────────────────────────────────
  // La session n'est créée qu'après confirmation d'absence de doublon (INV-9).
  const sessionId = _generateSessionId();
  const sourceId  = adapter.getSourceId(descriptor);

  // ── Étape 5 — Extraction ─────────────────────────────────────────────────
  const { events, total: totalLines, sourceType } = await adapter.extractEvents(descriptor);

  // ── Étape 6 — Qualification ──────────────────────────────────────────────
  // Pour chaque événement : processEvent · accumulation qualified/excluded/rejected
  // · distribution des états EP-RC2 (standard · R1 · R3 · R4).
  const qualifiedEvents = [];
  let qualified = 0;
  let excluded  = 0;
  let rejected  = 0;
  const dateStates = { standard: 0, R1: 0, R3: 0, R4: 0 };

  for (const event of events) {
    const res = adapter.processEvent(event);
    if (res.status === 'qualifié') {
      qualified++;
      dateStates[_classifyDateState(res.date)]++;
      qualifiedEvents.push(res);
    } else if (res.status === 'exclu') {
      excluded++;
    } else {
      // rejeté (RF-R6) · type non reconnu
      rejected++;
    }
  }

  // ── Étape 7 — Construction du contexte ──────────────────────────────────
  // Objet de session consolidé après qualification (P2-2.C §3.3 · P2-2.D §8.3).
  // Injecté dans le champ contexte de chaque trace qualifiée.
  const contexte = {
    sourceType,
    totalLines,
    qualified,
    excluded,
    rejected,
  };

  // Lecture de la base byFamille avant écriture — nécessaire pour le delta (étape 10).
  const indexAvantEcriture = _readIndexRaw();
  const byFamilleAvant = Array.isArray(indexAvantEcriture?.byFamille?.[adapter.famille])
    ? indexAvantEcriture.byFamille[adapter.famille].length
    : 0;

  // ── Étape 8 — Écriture ───────────────────────────────────────────────────
  // Pour chaque événement qualifié : assembler la trace canonique · writeIngestedTrace.
  // La poursuite est maintenue même en cas d'échec individuel (P2-2.D §8.2).
  let written = 0;
  let failed  = 0;

  for (const qe of qualifiedEvents) {
    const trace = {
      famille:  adapter.famille,
      source:   sourceId,
      date:     qe.date,
      valeur:   qe.valeur,
      session:  sessionId,
      contexte,
    };
    const writeResult = writeIngestedTrace(trace);
    if (writeResult.written) {
      written++;
    } else {
      failed++;
    }
  }

  // ── Étape 9 — Registre ───────────────────────────────────────────────────
  // Enregistrer la source dans le registre d'ingestion si au moins une trace a été écrite.
  // Si written === 0 : aucune entrée de registre (P2-2.C §4.4).
  if (written >= 1) {
    addEntry({ fingerprint, sessionId, sourceId, traceCount: written });
  }

  // ── Étape 10 — Index ─────────────────────────────────────────────────────
  // Vérifier la cohérence de l'index après écriture (P2-2.C §7 · P2-2.D §8.2).
  // Deux axes : bySession[sessionId] et byFamille[adapter.famille] (delta).
  // Tout écart est consigné dans indexEcarts du rapport.
  const indexEcarts = [];

  if (written > 0) {
    const indexApresEcriture = _readIndexRaw();

    // bySession[sessionId] doit contenir exactement `written` identifiants de traces.
    const bySessionCount = Array.isArray(indexApresEcriture?.bySession?.[sessionId])
      ? indexApresEcriture.bySession[sessionId].length
      : 0;
    if (bySessionCount !== written) {
      indexEcarts.push(
        `bySession[${sessionId}] : ${bySessionCount} trace(s) indexée(s) · ${written} attendue(s)`
      );
    }

    // byFamille[adapter.famille] doit avoir augmenté exactement de `written`.
    const byFamilleApres = Array.isArray(indexApresEcriture?.byFamille?.[adapter.famille])
      ? indexApresEcriture.byFamille[adapter.famille].length
      : 0;
    const delta = byFamilleApres - byFamilleAvant;
    if (delta !== written) {
      indexEcarts.push(
        `byFamille[${adapter.famille}] delta : ${delta} trace(s) ajoutée(s) · ${written} attendue(s)`
      );
    }
  }

  // ── Étape 11 — Rapport ───────────────────────────────────────────────────
  // Assembler le rapport de session (P2-2.C §5.3).
  // result : 'succès' (0 échec) · 'succès partiel' (≥1 échec, ≥1 écrite) · 'échec' (0 écrite).
  let result;
  if (written === 0) {
    result = 'échec';
  } else if (failed === 0) {
    result = 'succès';
  } else {
    result = 'succès partiel';
  }

  const rapport = {
    type: 'rapport',
    sessionId,
    sourceId,
    totalLines,
    qualified,
    excluded,
    rejected,
    written,
    failed,
    dateStates,
    result,
  };

  if (indexEcarts.length > 0) {
    rapport.indexEcarts = indexEcarts;
  }

  return rapport;
}
