// src/js/v2/coherence.js
// Couche cohérence inter-modules — V2
// Phase 1 : détection T1–T4 depuis le payload V1

import { V2_FLAGS } from './flags.js';

/**
 * Détecte les tensions de cohérence inter-modules à partir du payload V1.
 *
 * Mapping champs payload V1 → concepts V2 :
 *   payload.score        → confidence_score (seuil T1 : < 65)
 *   payload.user_profile → posture (PASSIVE / BALANCED / ACTIVE)
 *   payload.need_action  → engagement_declared proxy ('no' = faible engagement)
 *   payload.MdS          → Maturité de Structure (optionnel — non exposé en V1)
 *   payload.QdR          → Qualité du Retracement (optionnel — non exposé en V1)
 *   payload.DMU          → Divergence Multi-Unité (optionnel — non exposé en V1)
 *
 * Seuils provisoires D-COH-01 (à calibrer via test V0) :
 *   T1 : confidence_score < 65 ET (MdS > 2 OU DMU > 2)
 *   T2 : structureLevel 'haut' ou 'tres_haut' (non exposé en V1 actuel)
 *   T3 : posture ACTIVE ET engagement faible (need_action = 'no')
 *   T4 : MdS > 3 ET QdR > 3 ET confidence_score > 2
 *
 * @param {object} payload - Payload V1 produit par buildPayload()
 * @param {Function|null} behaviorGetter - Getter profil comportemental (peut être null)
 * @returns {import('./types.js').TensionMap|null}
 */
export function computeTensionMap(payload, behaviorGetter) {
  if (!V2_FLAGS.V2_COHERENCE) return null;
  if (!payload || typeof payload !== 'object') return null;

  const tensions = [];

  // ── Extraction des valeurs source ────────────────────────────────────────
  // confidence_score : payload.score est le score moteur V1 (0–100)
  const cs  = payload.confidence_score ?? payload.score ?? null;
  // Premium indicators : non présents dans payload V1 — null par défaut
  const MdS = payload.MdS ?? null;
  const QdR = payload.QdR ?? null;
  const DMU = payload.DMU ?? null;
  // Posture : user_profile V1 (PASSIVE / BALANCED / ACTIVE)
  const posture = payload.posture ?? payload.user_profile ?? null;
  // Engagement : need_action proxy ('no' = déclaration d'engagement faible)
  const engagement = payload.engagement_declared
    ?? (payload.need_action === 'no' ? 'faible' : null);
  // Structure level : non exposé dans payload V1 actuel
  const structureLevel = payload.structureLevel ?? payload.structure_level ?? null;

  // ── T1 — Cohérence confidence / premium ──────────────────────────────────
  // Condition : confidence_score < 65 ET (MdS > 2 OU DMU > 2)
  // T1 ne peut pas se déclencher sans MdS ou DMU dans le payload V1.
  if (cs !== null && cs < 65 && (MdS !== null || DMU !== null)) {
    if (MdS > 2 || DMU > 2) {
      tensions.push({
        id: 'T1',
        type: 'coherence_confidence_premium',
        severity: cs < 40 ? 'high' : 'medium',
        payload: { confidence_score: cs, MdS, DMU },
      });
    }
  }

  // ── T2 — Surcharge structurelle ───────────────────────────────────────────
  // Non exposé dans payload V1 actuel — sera actif quand structureLevel sera transmis
  if (structureLevel === 'haut' || structureLevel === 'tres_haut'
    || structureLevel === 'high' || structureLevel === 'very_high') {
    tensions.push({
      id: 'T2',
      type: 'surcharge_structurelle',
      severity: (structureLevel === 'tres_haut' || structureLevel === 'very_high') ? 'high' : 'medium',
      payload: { structureLevel },
    });
  }

  // ── T3 — Delta engagement / posture ──────────────────────────────────────
  // Condition binaire : posture ACTIVE ET engagement faible (need_action = 'no')
  if (posture === 'ACTIVE'
    && (engagement === 'faible' || engagement === 'low' || engagement === 'bas')) {
    tensions.push({
      id: 'T3',
      type: 'delta_engagement_posture',
      severity: 'high',
      payload: { posture, engagement },
    });
  }

  // ── T4 — Surqualification technique ──────────────────────────────────────
  // Condition : MdS > 3 ET QdR > 3 ET confidence_score > 2
  // T4 ne peut pas se déclencher sans MdS et QdR dans le payload V1.
  if (MdS !== null && QdR !== null && cs !== null && MdS > 3 && QdR > 3 && cs > 2) {
    tensions.push({
      id: 'T4',
      type: 'surqualification_technique',
      severity: 'low',
      payload: { MdS, QdR, confidence_score: cs },
    });
  }

  if (tensions.length === 0) return null;

  return {
    tensions,
    active_exposed: 0,
    noise_level: tensions.length >= 3 ? 'high' : tensions.length === 2 ? 'medium' : 'low',
  };
}
