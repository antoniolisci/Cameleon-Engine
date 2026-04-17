import { DEFAULT_FORM, DEFAULT_TAB, HISTORY_LIMIT } from "./data.js";
import { uiState, journalEntries, payloadCurrent, canUseStorage, estimateTotalSize, runMigration } from "./storage.js";

export { canUseStorage };

let memoryState = null;

export function createInitialState() {
  return {
    form: { ...DEFAULT_FORM },
    history: [],
    lastPayload: null,
    activeTab: DEFAULT_TAB,
    lastSaved: null
  };
}

export function loadState() {
  try {
    runMigration();
    const ui      = uiState.get();
    const entries = journalEntries.getAll();
    const payload = payloadCurrent.get();
    if (!ui) return memoryState ?? createInitialState();
    const state = {
      ...createInitialState(),
      form:        { ...DEFAULT_FORM, ...(ui.form || {}) },
      activeTab:   ui.activeTab  ?? DEFAULT_TAB,
      lastSaved:   ui.lastSaved  ?? null,
      history:     entries.slice(-HISTORY_LIMIT),
      lastPayload: payload,
    };
    memoryState = state;
    return state;
  } catch {
    return memoryState ?? createInitialState();
  }
}

export function saveState(state) {
  memoryState = state;
  const ok1 = uiState.set({ activeTab: state.activeTab, form: state.form, lastSaved: state.lastSaved });
  const ok2 = journalEntries.setAll(Array.isArray(state.history) ? state.history : []);
  const ok3 = state.lastPayload
    ? payloadCurrent.set(state.lastPayload)
    : payloadCurrent.clear();
  return ok1 && ok2 && ok3;
}

export function estimateStateSize(_state) {
  return `${(estimateTotalSize() / 1024).toFixed(1)} KB`;
}
