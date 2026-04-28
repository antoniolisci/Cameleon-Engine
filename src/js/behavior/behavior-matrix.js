/**
 * behavior-matrix.js
 *
 * Behavioral state dictionary — isolated lookup table.
 * Maps a detected behavior pattern + severity level (1–5) to a structured
 * descriptor: state label, diagnostic message, risk, and recommended action.
 *
 * ISOLATION CONTRACT:
 * - No imports
 * - No exports besides BEHAVIOR_MATRIX and getBehaviorMatrixEntry
 * - No localStorage access
 * - No side effects
 * - No UI connection
 *
 * USAGE (future integration):
 *   import { getBehaviorMatrixEntry } from './behavior-matrix.js';
 *   const entry = getBehaviorMatrixEntry('OVERTRADING', 4);
 *   // → { state, message, risk, action }
 */

// ── Level scale reference ─────────────────────────────────────────────────
//
//  Level 1 — Calme / Contrôlé      : no behavioral pressure detected
//  Level 2 — Tension légère         : early signals, manageable
//  Level 3 — Fixation               : pattern established, attention required
//  Level 4 — Sur-engagement         : active pressure, intervention needed
//  Level 5 — Saturation             : critical state, full stop required
//
// ──────────────────────────────────────────────────────────────────────────

export const BEHAVIOR_MATRIX = {

  // ── OVERTRADING ───────────────────────────────────────────────────────

  OVERTRADING: {
    1: {
      state:   'Calme',
      message: 'Rythme normal. Aucun signal de suractivité.',
      risk:    'Aucun',
      action:  'Maintenir le rythme actuel. Observer sans forcer.'
    },
    2: {
      state:   'Tension légère',
      message: 'Légère accélération du rythme détectée.',
      risk:    'FOMO latent',
      action:  'Ralentir. Attendre un signal clair avant la prochaine entrée.'
    },
    3: {
      state:   'Fixation',
      message: 'Tu multiplies les trades sans signal valide.',
      risk:    'Perte de sélectivité',
      action:  'Pause de 20 minutes. Réévaluer le contexte à froid.'
    },
    4: {
      state:   'Sur-engagement',
      message: 'Suractivité confirmée. Tu forces le marché.',
      risk:    'Destruction progressive du capital',
      action:  'Stopper toute nouvelle entrée. Réduire la taille de position de 50%.'
    },
    5: {
      state:   'Saturation',
      message: 'Surtrading critique. Le marché est devenu un terrain de forçage.',
      risk:    'Destruction rapide du capital',
      action:  'STOP TOTAL. Fermer la plateforme. Reprendre uniquement après stabilisation.'
    }
  },

  // ── FOMO ─────────────────────────────────────────────────────────────

  FOMO: {
    1: {
      state:   'Calme',
      message: 'Aucune impulsion détectée. Tu attends les setups.',
      risk:    'Aucun',
      action:  'Continuer à attendre la confirmation avant d\'agir.'
    },
    2: {
      state:   'Tension légère',
      message: 'Tu surveilles le marché avec impatience.',
      risk:    'Entrée prématurée',
      action:  'Poser un scénario écrit avant d\'entrer. Ne pas anticiper.'
    },
    3: {
      state:   'Fixation',
      message: 'Tu te focalises sur une opportunité au détriment du cadre.',
      risk:    'Entrée hors setup, exposition non maîtrisée',
      action:  'Sortir de l\'écran 15 minutes. L\'opportunité n\'est pas la dernière.'
    },
    4: {
      state:   'Sur-engagement',
      message: 'Tu entres sur des mouvements déjà amorcés, sans valeur.',
      risk:    'Achat de sommet, vente de creux',
      action:  'Interdire toute entrée non planifiée. Revenir à la liste de setups définis.'
    },
    5: {
      state:   'Saturation',
      message: 'Le FOMO dicte chaque décision. Aucune lucidité restante.',
      risk:    'Perte totale de contrôle sur les entrées',
      action:  'STOP TOTAL. Aucune position nouvelle. Attendre 24h avant de reprendre.'
    }
  },

  // ── REVENGE ──────────────────────────────────────────────────────────

  REVENGE: {
    1: {
      state:   'Calme',
      message: 'Aucun signal de compensation émotionnelle.',
      risk:    'Aucun',
      action:  'Continuer à appliquer le cadre habituel.'
    },
    2: {
      state:   'Tension légère',
      message: 'Légère tendance à ré-entrer rapidement après une perte.',
      risk:    'Décision réactive',
      action:  'Imposer un délai minimum de 30 minutes après chaque perte avant toute nouvelle entrée.'
    },
    3: {
      state:   'Fixation',
      message: 'Tu cherches à récupérer la perte précédente.',
      risk:    'Biais émotionnel actif, prise de risque accrue',
      action:  'Sortir du marché. Écrire ce que tu ressens avant de revenir.'
    },
    4: {
      state:   'Sur-engagement',
      message: 'Revenge trading confirmé. Chaque trade est une tentative de récupération.',
      risk:    'Aggravation systématique des pertes',
      action:  'Couper immédiatement toute position. Aucun trade autorisé avant demain.'
    },
    5: {
      state:   'Saturation',
      message: 'Tu trades exclusivement pour récupérer. La perte contrôle tes décisions.',
      risk:    'Destruction complète du capital de session',
      action:  'STOP TOTAL. Fermer la plateforme. Traiter la perte émotionnellement avant de reprendre.'
    }
  },

  // ── HESITATION ───────────────────────────────────────────────────────

  HESITATION: {
    1: {
      state:   'Calme',
      message: 'Prise de décision fluide. Tu exécutes tes setups.',
      risk:    'Aucun',
      action:  'Maintenir le niveau d\'exécution actuel.'
    },
    2: {
      state:   'Tension légère',
      message: 'Quelques hésitations à l\'entrée détectées.',
      risk:    'Setups manqués ponctuellement',
      action:  'Retravailler les conditions d\'entrée. Simplifier les critères si nécessaire.'
    },
    3: {
      state:   'Fixation',
      message: 'Tu analyses en boucle sans passer à l\'action.',
      risk:    'Paralysie analytique, frustration croissante',
      action:  'Fixer un maximum de 3 critères d\'entrée. Agir dès qu\'ils sont réunis.'
    },
    4: {
      state:   'Sur-engagement',
      message: 'Hésitation systématique. Tu manques tous les setups valides.',
      risk:    'Inaction coûteuse, perte de confiance accélérée',
      action:  'Revenir à des setups ultra-simples. Une seule condition d\'entrée jusqu\'à la prochaine session.'
    },
    5: {
      state:   'Saturation',
      message: 'Blocage total. La peur de perdre empêche toute décision.',
      risk:    'Incapacité à trader, décrochage du marché',
      action:  'Arrêter la session. Reprendre sur simulateur uniquement jusqu\'à récupération de la fluidité.'
    }
  },

  // ── OVERCONFIDENCE ───────────────────────────────────────────────────

  OVERCONFIDENCE: {
    1: {
      state:   'Calme',
      message: 'Confiance calibrée. Tu respectes ton cadre.',
      risk:    'Aucun',
      action:  'Ne pas relâcher la discipline après une série gagnante.'
    },
    2: {
      state:   'Tension légère',
      message: 'Légère tendance à sous-estimer le risque après de bons trades.',
      risk:    'Relâchement progressif du cadre',
      action:  'Vérifier que la taille de position n\'a pas dérivé à la hausse.'
    },
    3: {
      state:   'Fixation',
      message: 'Tu ignores des signaux négatifs par excès de confiance.',
      risk:    'Exposition non maîtrisée, risque sous-évalué',
      action:  'Revenir à la taille de position standard. Appliquer le cadre sans exception.'
    },
    4: {
      state:   'Sur-engagement',
      message: 'Overconfidence confirmée. Tu prends des risques hors cadre.',
      risk:    'Drawdown sévère imminent',
      action:  'Réduire la taille de position de 50% immédiatement. Revalider chaque entrée contre le plan.'
    },
    5: {
      state:   'Saturation',
      message: 'Tu te crois hors de portée du risque. Toutes les protections sont désactivées.',
      risk:    'Perte catastrophique imminente',
      action:  'STOP TOTAL. Couper toutes les positions. Reprendre uniquement après révision du plan de trading.'
    }
  }

};

// ── Valid pattern keys ────────────────────────────────────────────────────
const VALID_PATTERNS = Object.keys(BEHAVIOR_MATRIX);

/**
 * Returns a single entry from BEHAVIOR_MATRIX with safe fallbacks.
 *
 * @param {string} pattern  — One of: OVERTRADING, FOMO, REVENGE, HESITATION, OVERCONFIDENCE.
 *                            Falls back to OVERTRADING if invalid.
 * @param {number} level    — Integer 1–5.
 *                            Falls back to 1 if invalid or out of range.
 * @returns {{ state: string, message: string, risk: string, action: string }}
 */
export function getBehaviorMatrixEntry(pattern, level) {
  const safePattern = VALID_PATTERNS.includes(pattern) ? pattern : 'OVERTRADING';
  const safeLevel   = Number.isInteger(level) && level <= 5 && level >= 1 ? level : 1;
  return BEHAVIOR_MATRIX[safePattern][safeLevel];
}
