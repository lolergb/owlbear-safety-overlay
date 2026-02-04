/**
 * @fileoverview Lógica de eventos: añadir, recortar a 50, sin guardar identidad si showIdentity=false.
 * No escribe en OBR; solo prepara el array. SafetyService usa MetadataService para persistir.
 */

import { trimToLast } from '../../utils/helpers.js';
import { MAX_EVENTS } from '../../utils/constants.js';
import { generateEventId } from '../../utils/helpers.js';

/**
 * Crea un nuevo evento optimizado para tamaño (campos cortos).
 * Si showIdentity es false, no incluye userId ni userName.
 * @param {string} actionId
 * @param {string} actionLabel
 * @param {boolean} showIdentity
 * @param {string} [userId]
 * @param {string} [userName]
 * @returns {{ id: string, t: number, a: string, l: string, u?: string, n?: string }}
 */
export function createEvent(actionId, actionLabel, showIdentity, userId, userName) {
  // Campos cortos para reducir tamaño: t=ts, a=actionId, l=actionLabel, u=userId, n=userName
  const ev = {
    id: generateEventId(),
    t: Date.now(),
    a: actionId,
    l: actionLabel
  };
  if (showIdentity && (userId || userName)) {
    if (userId) ev.u = userId;
    if (userName) ev.n = userName;
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
