/**
 * @fileoverview Funciones auxiliares para Safety Overlay
 */

/**
 * Genera un id único para eventos
 * @returns {string}
 */
export function generateEventId() {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Recorta un array a los últimos n elementos
 * @param {Array} arr
 * @param {number} max
 * @returns {Array}
 */
export function trimToLast(arr, max) {
  if (!Array.isArray(arr) || arr.length <= max) return arr;
  return arr.slice(-max);
}
