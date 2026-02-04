/**
 * @fileoverview Funciones auxiliares para Safety Overlay
 */

/**
 * Genera un id único para eventos (optimizado para tamaño)
 * @returns {string}
 */
export function generateEventId() {
  // Formato más corto: timestamp + 6 chars aleatorios
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
