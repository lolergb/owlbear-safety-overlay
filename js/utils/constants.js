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
/** Cooldown anti-spam por usuario (ms) */
export const ACTION_COOLDOWN_MS = 12000;

// ============================================
// BROADCAST CHANNELS
// ============================================
/** Canal broadcast para mostrar carta a todos */
export const BROADCAST_CHANNEL_SHOW_CARD = 'com.lole.safetyOverlay/showCard';

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
