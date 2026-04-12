// Persistance des sessions d'analyse comportementale.
// Stockage : localStorage, clé 'bhv_sessions'
// Structure : { id: string, name: string, createdAt: number, trades: array }

const STORAGE_KEY = 'bhv_sessions';

function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
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
  _persist(sessions);
  return session;
}

function remove(id) {
  _persist(getAll().filter(s => s.id !== id));
}

function clearAll() {
  _persist([]);
}

function _persist(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // quota exceeded — ignoré silencieusement
  }
}

export { getAll, save, remove, clearAll };
