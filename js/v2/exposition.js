// src/js/v2/exposition.js
// Couche d'explicabilité sobre — V2
// T2-03 — actif en shadow mode

/**
 * Produit le message final destiné au cockpit (shadow mode : Debug uniquement).
 *
 * Règles de formulation (spec § Règles de formulation) :
 *   R1 — Pas de première ni deuxième personne
 *   R2 — Pas de verbe modal prescriptif
 *   R3 — Maximum 20 mots
 *   R4 — Pas de phrase interrogative
 *   R5 — Fait structurel, pas interprétation
 *   R6 — Pas d'auto-explication
 *   R7 — Cohérence lexicale avec le corpus
 *
 * Invariants :
 *   winner === null → null
 *   shouldExpose === false → null
 *   winner.is_blocking === true → template bloquer (exception absolue)
 *   Tension inconnue → null (spec § Cas limites : silence préféré à formulation tronquée)
 *
 * @param {import('./types.js').TensionDetail|null} winner
 * @param {boolean} shouldExpose
 * @returns {import('./types.js').ExpositionResult|null}
 */
export function buildExpositionResult(winner, shouldExpose) {
  if (winner === null || !shouldExpose) return null;

  const is_blocking = winner.is_blocking === true;

  // ── Contradiction bloquante — exception absolue ───────────────────────────
  // Passe quoi qu'il arrive (gate attention déjà traité) — intention bloquer.
  if (is_blocking) {
    return {
      message:    'Contradiction structurelle — décision suspendue.',
      intention:  'bloquer',
      tension_id: winner.id,
      severity:   winner.severity,
      is_blocking: true,
    };
  }

  // ── Templates par tension ─────────────────────────────────────────────────
  switch (winner.id) {

    case 'T3': {
      // Delta engagement ↔ posture.
      // winner.payload.delta optionnel — cohérence.js ne le calcule pas encore.
      // Fallback 1 : delta minimum (T3 est binaire dans V1). D-EXP-03 provisoire.
      const delta = winner.payload?.delta ?? 1;

      if (delta >= 3) {
        return {
          message:    `Distance posture/engagement : +${delta} crans — décision suspendue.`,
          intention:  'ralentir',
          tension_id: 'T3',
          severity:   winner.severity,
          is_blocking: false,
        };
      } else if (delta >= 2) {
        return {
          message:    `Distance posture/engagement : +${delta} crans.`,
          intention:  'ralentir',
          tension_id: 'T3',
          severity:   winner.severity,
          is_blocking: false,
        };
      } else {
        return {
          message:    `Distance posture/engagement : +${delta} cran.`,
          intention:  'expliquer',
          tension_id: 'T3',
          severity:   winner.severity,
          is_blocking: false,
        };
      }
    }

    case 'T1': {
      // Freeware ↔ Premium.
      // {module} = indicateur premium contradictoire. Fallback : 'la structure' (D-EXP-03).
      const module = winner.payload?.module ?? 'la structure';
      return {
        message:    `Lisibilité freeware non confirmée par ${module}.`,
        intention:  'expliquer',
        tension_id: 'T1',
        severity:   winner.severity,
        is_blocking: false,
      };
    }

    case 'T2': {
      // Profil comportemental ↔ Posture.
      // {profil} = profil comportemental actif. Fallback : 'non chargé' (D-EXP-03).
      const profil = winner.payload?.profil
        ?? winner.payload?.behavior_profile
        ?? 'non chargé';
      return {
        message:    `Posture ACTIVE · profil ${profil} — tension détectée.`,
        intention:  'expliquer',
        tension_id: 'T2',
        severity:   winner.severity,
        is_blocking: false,
      };
    }

    case 'T4': {
      // QdR ↔ MdS — tension intra-premium.
      return {
        message:    'Retracement qualifié · structure non confirmée.',
        intention:  'expliquer',
        tension_id: 'T4',
        severity:   winner.severity,
        is_blocking: false,
      };
    }

    default:
      // Tension inconnue — silence préféré à message incomplet (spec § Cas limites)
      return null;
  }
}
