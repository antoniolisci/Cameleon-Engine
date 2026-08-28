/**
 * Couche de ton adaptatif — Caméléon Engine
 *
 * Principe : même état de marché, message calibré selon l'état émotionnel.
 * Ne remplace pas MARKET_DICTIONARY. Complète la raison affichée.
 *
 * Tones :
 *   calm      → neutre, pédagogique
 *   hesitation → directif, rappelle la règle
 *   tension    → court, ferme, sans nuance
 *   tilt       → frontal, impossible à ignorer
 *
 * Mapping emotion_state → tone :
 *   calm    → calm
 *   neutral → hesitation
 *   stress  → tension
 *   fomo    → tilt
 */

export const EMOTION_TO_TONE = {
  calm: "calm",
  neutral: "hesitation",
  stress: "tension",
  fomo: "tilt"
};

export const TONE_LAYER = {

  range: {
    calm:       "Pas de signal. Tu peux rester en dehors.",
    hesitation: "Aucun signal exploitable. Attends.",
    tension:    "Du bruit. Tu paies.",
    tilt:       "Rien ici. Tu forces. Tu paies."
  },

  compression: {
    calm:       "La direction n'est pas encore là. Attends la cassure.",
    hesitation: "Pas de cassure. Pas d'entrée.",
    tension:    "Aucun edge. Juste du risque.",
    tilt:       "Tu devines. Tu perds."
  },

  expansion: {
    calm:       "Le mouvement existe. Entre proprement ou attends.",
    hesitation: "Retracement validé uniquement.",
    tension:    "Tu poursuis. Tu paies.",
    tilt:       "Tu chasses le prix. Tu achètes le sommet."
  },

  breakout: {
    calm:       "La cassure est visible. Attends le retest pour confirmer.",
    hesitation: "Pas de retest. Pas d'entrée.",
    tension:    "Pas de retest. Tu paies.",
    tilt:       "Tu entres sur la mèche. Tu offres de l'argent."
  },

  defense: {
    calm:       "Les conditions ne permettent pas d'agir. Réduis.",
    hesitation: "Risque présent. Réduis maintenant.",
    tension:    "Exposé ici. Tu perds.",
    tilt:       "Tu tiens. Tu aggraves."
  },

  riskoff: {
    calm:       "Le contexte ne permet pas de trade. Reste en cash.",
    hesitation: "Plus d'edge. Hors marché.",
    tension:    "Plus d'edge. Chaque position est un pari.",
    tilt:       "Tu rentres en risk-off. Tu finances ta propre perte."
  },

  instable: {
    calm:       "Aucune structure lisible. Rien à faire ici.",
    hesitation: "Pas de structure. Pas de trade.",
    tension:    "Tu inventes un signal. L'erreur est déjà là.",
    tilt:       "Tu forces dans le vide. Tu perds."
  }

};

/**
 * Retourne le message adapté à l'état de marché et au ton émotionnel.
 *
 * @param {string} state  - Clé d'état de marché (ex: "range", "compression")
 * @param {string} tone   - Ton cible ("calm" | "hesitation" | "tension" | "tilt")
 * @returns {string}
 */
export function getMessage(state, tone) {
  return TONE_LAYER[state]?.[tone] ?? TONE_LAYER[state]?.tension ?? "";
}

/**
 * Dérive le ton à partir de l'état émotionnel brut du payload.
 *
 * @param {string} emotionState - Valeur de emotion_state ("calm" | "neutral" | "stress" | "fomo")
 * @returns {string} tone
 */
export function getToneFromEmotion(emotionState) {
  return EMOTION_TO_TONE[emotionState] ?? "tension";
}

/**
 * Raccourci : dérive le message final depuis le payload directement.
 * Utilise l'émotion déclarée uniquement.
 *
 * Pour utiliser le ton comportemental (behavior.js), passer le ton directement :
 *   import { getAdaptiveTone } from "./behavior.js";
 *   getMessage(marketState, getAdaptiveTone());
 *
 * @param {string} marketState  - payload.market_state
 * @param {string} emotionState - payload.emotion_state
 * @returns {string}
 */
export function getAdaptiveMessage(marketState, emotionState) {
  const tone = getToneFromEmotion(emotionState);
  return getMessage(marketState, tone);
}

/**
 * Version comportementale : accepte un ton déjà résolu (ex: depuis behavior.js).
 * Permet de brancher getAdaptiveTone() sans modifier getAdaptiveMessage.
 *
 * @param {string} marketState - payload.market_state
 * @param {string} tone        - "calm" | "hesitation" | "tension" | "tilt"
 * @returns {string}
 */
export function getMessageForTone(marketState, tone) {
  return getMessage(marketState, tone);
}
