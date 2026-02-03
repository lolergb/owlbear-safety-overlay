/**
 * @fileoverview Constantes globales de Safety Overlay
 */

// ============================================
// ROOM METADATA (namespace)
// ============================================
export const NS_CONFIG = 'com.lole.safetyOverlay/config';
export const NS_EVENTS = 'com.lole.safetyOverlay/events';

// ============================================
// LÍMITES Y TIEMPOS
// ============================================
export const MAX_EVENTS = 50;
export const TOAST_DURATION_MS = 4000;
/** Cooldown anti-spam por usuario (ms) */
export const ACTION_COOLDOWN_MS = 12000;

// ============================================
// ACCIONES POR DEFECTO
// ============================================
export const DEFAULT_ACTIONS = [
  { id: 'x-card', label: 'X-Card' },
  { id: 'pause', label: 'Pause' },
  { id: 'rewind', label: 'Rewind' }
];

// ============================================
// CONFIG DEFAULTS
// ============================================
export const DEFAULT_CONFIG = {
  showIdentity: false,
  notifyGmPrivately: true
};
