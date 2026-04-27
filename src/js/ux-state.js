export function computeUXState({ history = [] }) {
  const n = history.length;
  if (n < 3) return "CALM";

  const recent = history.slice(-5); // 5 derniers snapshots

  // Détection FOMO répété
  const fomoCount = recent.filter(s => s.emotion_state === "fomo").length;
  if (fomoCount >= 2) return "DANGER";

  // Détection instabilité : changements de market_state ou emotion_state
  let changes = 0;
  for (let i = 0; i < recent.length - 1; i++) {
    if (recent[i].market_state !== recent[i + 1].market_state) changes++;
    if (recent[i].emotion_state !== recent[i + 1].emotion_state) changes++;
  }

  if (changes >= 4 && n >= 6) return "DRIFT";
  if (changes >= 2) return "TENSION";

  // Utilisateur stable avec historique long
  if (n >= 20 && changes <= 1) return "CALM";

  if (n >= 6) return "DRIFT";
  return "TENSION";
}
