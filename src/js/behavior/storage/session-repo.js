// Persistance des sessions d'analyse comportementale.
// Stockage : CE_behavior_sessions_v1 (via storage.js)
// Structure : { id: string, name: string, createdAt: number, trades: array }

import { behaviorSessions } from '../../storage.js';

function getAll() {
  return behaviorSessions.getAll().sort((a, b) => b.createdAt - a.createdAt);
}

function save(trades, name) {
  const sessions  = getAll();
  const createdAt = Date.now();
  const d  = new Date(createdAt);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const session = {
    id:        `bhv_${createdAt}_${Math.random().toString(36).slice(2, 7)}`,
    name:      name || `Session ${dd}/${mm} ${hh}:${mi}`,
    createdAt,
    trades,
  };
  sessions.unshift(session);
  behaviorSessions.setAll(sessions);
  return session;
}

function remove(id) {
  behaviorSessions.setAll(getAll().filter(s => s.id !== id));
}

function clearAll() {
  behaviorSessions.setAll([]);
}

export { getAll, save, remove, clearAll };
