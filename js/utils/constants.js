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
/** Duración del overlay de carta (auto-hide) en ms */
export const CARD_OVERLAY_DURATION_MS = 4000;

/** ID del modal OBR para la carta */
export const SAFETY_CARD_MODAL_ID = 'safety-overlay-card';
/** Canal broadcast para avisar cuando el modal de carta se cierra */
export const BROADCAST_CARD_CLOSED = 'com.lole.safetyOverlay/cardClosed';
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
