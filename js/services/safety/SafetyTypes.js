/**
 * @fileoverview Tipos y valores por defecto para Safety Overlay
 */

import { DEFAULT_CONFIG, DEFAULT_ACTIONS, MAX_EVENTS } from '../../utils/constants.js';

/**
 * @typedef {Object} SafetyConfig
 * @property {boolean} showIdentity
 * @property {boolean} notifyGmPrivately
 */

/**
 * @typedef {Object} SafetyEvent
 * @property {string} id
 * @property {number} ts
 * @property {string} actionId
 * @property {string} actionLabel
 * @property {string} [userId]
 * @property {string} [userName]
 */

/**
 * Normaliza config: rellena con defaults
 * @param {Partial<SafetyConfig>|null} config
 * @returns {SafetyConfig}
 */
export function normalizeConfig(config) {
  if (!config || typeof config !== 'object') {
    return { ...DEFAULT_CONFIG };
  }
  return {
    showIdentity: Boolean(config.showIdentity),
    notifyGmPrivately: config.notifyGmPrivately !== false
  };
}

/**
 * Lista de acciones por defecto (id + label)
 */
export function getDefaultActions() {
  return [...DEFAULT_ACTIONS];
}

/**
 * Máximo de eventos en el log
 */
export const MAX_EVENTS_LIMIT = MAX_EVENTS;
