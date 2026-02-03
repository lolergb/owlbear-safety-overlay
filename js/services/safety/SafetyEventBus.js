/**
 * @fileoverview Lógica de eventos: añadir, recortar a 50, sin guardar identidad si showIdentity=false.
 * No escribe en OBR; solo prepara el array. SafetyService usa MetadataService para persistir.
 */

import { trimToLast } from '../../utils/helpers.js';
import { MAX_EVENTS } from '../../utils/constants.js';
import { generateEventId } from '../../utils/helpers.js';

/**
 * Crea un nuevo evento. Si showIdentity es false, no incluye userId ni userName.
 * @param {string} actionId
 * @param {string} actionLabel
 * @param {boolean} showIdentity
 * @param {string} [userId]
 * @param {string} [userName]
 * @returns {{ id: string, ts: number, actionId: string, actionLabel: string, userId?: string, userName?: string }}
 */
export function createEvent(actionId, actionLabel, showIdentity, userId, userName) {
  const ev = {
    id: generateEventId(),
    ts: Date.now(),
    actionId,
    actionLabel
  };
  if (showIdentity && (userId || userName)) {
    if (userId) ev.userId = userId;
    if (userName) ev.userName = userName;
  }
  return ev;
}

/**
 * Añade un evento al array y recorta a los últimos MAX_EVENTS
 * @param {Array} currentEvents
 * @param {Object} newEvent
 * @returns {Array}
 */
export function appendAndTrim(currentEvents, newEvent) {
  const list = Array.isArray(currentEvents) ? [...currentEvents] : [];
  list.push(newEvent);
  return trimToLast(list, MAX_EVENTS);
}
