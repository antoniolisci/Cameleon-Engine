import { DEFAULT_FORM, DEFAULT_TAB, HISTORY_LIMIT, STORAGE_KEY } from "./data.js";

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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return memoryState ? { ...createInitialState(), ...memoryState, form: { ...DEFAULT_FORM, ...(memoryState.form || {}) } } : createInitialState();
    }
    const parsed = JSON.parse(raw);
    memoryState = parsed;
    return {
      ...createInitialState(),
      ...parsed,
      form: { ...DEFAULT_FORM, ...(parsed.form || {}) },
      history: Array.isArray(parsed.history) ? parsed.history.slice(-HISTORY_LIMIT) : []
    };
  } catch {
    return memoryState ? { ...createInitialState(), ...memoryState, form: { ...DEFAULT_FORM, ...(memoryState.form || {}) } } : createInitialState();
  }
}

export function saveState(state) {
  const snapshot = {
    ...state,
    history: Array.isArray(state.history) ? state.history.slice(-HISTORY_LIMIT) : []
  };
  memoryState = snapshot;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function estimateStateSize(state) {
  return `${(new Blob([JSON.stringify(state)]).size / 1024).toFixed(1)} KB`;
}

export function canUseStorage() {
  try {
    const key = "__ce_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
