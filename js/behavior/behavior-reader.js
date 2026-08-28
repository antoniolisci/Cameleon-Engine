// src/js/behavior/behavior-reader.js
// Accesseur en lecture seule pour le dernier profil comportemental calculé.
//
// Usage : couche de cohérence V2 (T2). Permet de lire le profil comportemental
// le plus récent sans dépendre d'aucun module UI ou de la couche de rendu.
//
// CONTRAT D'ISOLATION :
//   - N'importe PAS depuis engine.js, render.js, ou tout module V2
//   - N'écrit dans aucun store
//   - La valeur retournée est un objet plain — le consommateur ne doit pas la muter
//
// CONTRAT DE RETOUR :
//   getBehavioralProfile()
//   -> null                           (aucune session analysée, ou label non reconnu)
//   -> { key: string, label: string }  (profil de la session la plus récente)
//
// SOURCE :
//   memory.window10[0].profile
//   window10 est prepend-FIFO — index 0 = entrée la plus récente.
//   Labels possibles (UTF-8 exacts, tels que persistés par memory-computer.js) :
//     'Discipliné' / 'Réactif' / 'Impulsif' / 'Agressif'
//
// GRAPHE D'IMPORTS :
//   behavior-reader.js
//     -> storage/memory-repo.js  ->  ../../storage.js  ->  ./data.js
//     -> analytics/scoring.js    ->  (zéro imports)

import { getMemory }              from './storage/memory-repo.js';
import { getProfileKeyFromLabel } from './analytics/scoring.js';

/**
 * Retourne le profil comportemental issu de la session la plus récente, ou null
 * si aucune session n'a été analysée ou si le label stocké n'est pas reconnu.
 *
 * @returns {{ key: string, label: string }|null}
 */
export function getBehavioralProfile() {
  const memory = getMemory();
  const latest = memory?.window10?.[0];
  if (!latest?.profile) return null;
  const key = getProfileKeyFromLabel(latest.profile);
  if (!key) return null;
  return { key, label: latest.profile };
}
