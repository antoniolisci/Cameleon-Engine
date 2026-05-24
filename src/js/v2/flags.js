// src/js/v2/flags.js
// Feature flags V2 — contrôlent l'activation des composants V2
// Ne jamais persister en localStorage
// Modifier uniquement dans ce fichier

export const V2_FLAGS = {
  // Activation globale — si false, runV2() est un no-op strict
  V2_ENABLED: true,

  // Composants individuels (activation dans l'ordre documenté)
  V2_COHERENCE: true,        // Phase 1 — couche cohérence inter-modules (shadow mode)
  V2_HIERARCHY: true,        // Phase 2 — hiérarchie des tensions (T2-01 shadow mode)
  V2_ATTENTION: false,       // Phase 3 — gestion de l'attention
  V2_EXPOSITION: false,      // Phase 4 — explicabilité sobre

  // Exposition cockpit (activer uniquement après shadow mode validé)
  V2_COCKPIT_MESSAGE: false, // Phase 5 — affichage ExpositionResult.message

  // Instrumentation calibration
  V2_CALIBRATION: false,     // Phase 6 — CalibrationSnapshot + buffer
};
