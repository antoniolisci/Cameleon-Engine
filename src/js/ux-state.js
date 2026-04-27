export function computeUXState({ history = [] }) {
  const n = history.length;

  if (n < 3) return "CALM";

  const recent = history.slice(-5);

  // --- 1. FOMO DETECTION ---
  const fomoCount = recent.filter(s => s.emotion_state === "fomo").length;

  if (fomoCount >= 2) {
    return "DANGER";
  }

  // --- 2. HESITATION DETECTION ---
  let decisionChanges = 0;

  for (let i = 0; i < recent.length - 1; i++) {
    if (recent[i].decision !== recent[i + 1].decision) {
      decisionChanges++;
    }
  }

  const sameMarket = recent.every(
    s => s.market_state === recent[0].market_state
  );

  if (sameMarket && decisionChanges >= 2) {
    return "TENSION"; // hésitation
  }

  // --- 3. REVENGE / IMPULSIVE ---
  let instability = 0;

  for (let i = 0; i < recent.length - 1; i++) {
    if (recent[i].market_state !== recent[i + 1].market_state) instability++;
    if (recent[i].emotion_state !== recent[i + 1].emotion_state) instability++;
  }

  if (instability >= 4 && n >= 6) {
    return "DRIFT";
  }

  // --- LONG TERM STABILITY ---
  if (n >= 20 && instability <= 1) {
    return "CALM";
  }

  // --- DEFAULT ---
  if (n >= 6) return "DRIFT";
  return "TENSION";
}
