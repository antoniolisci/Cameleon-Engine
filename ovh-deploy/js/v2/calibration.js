// src/js/v2/calibration.js
// Instrumentation calibration — V2
// SQUELETTE Phase 0 — logique active en Phase 6

const BUFFER_MAX = 50;

/** @type {import('./types.js').CalibrationSnapshot[]} */
const calibrationBuffer = [];

/**
 * @param {object} data
 * @returns {void}
 */
export function captureSnapshot(data) {
  // TODO Phase 6 — implémenter la capture CalibrationSnapshot FIFO
}

/** @returns {import('./types.js').CalibrationSnapshot[]} */
export function getBuffer() {
  return [...calibrationBuffer];
}

export function clearBuffer() {
  calibrationBuffer.length = 0;
}
