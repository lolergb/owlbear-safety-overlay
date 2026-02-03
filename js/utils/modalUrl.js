/**
 * @fileoverview URL del modal de carta para OBR.modal.open (misma origen que la extensión).
 */

/**
 * Devuelve la URL absoluta de la página de carta para el modal de OBR.
 * Cada cliente en la room abre esta URL en OBR.modal al recibir el evento.
 * @param {string} actionId - ej. 'x-card', 'pause', 'rewind'
 * @param {string} [actionLabel] - opcional, para accesibilidad en la página del modal
 * @returns {string}
 */
export function getCardModalUrl(actionId, actionLabel) {
  const base = window.location.origin + window.location.pathname;
  const url = new URL(base);
  url.searchParams.set('modal', 'card');
  url.searchParams.set('actionId', actionId || 'x-card');
  if (actionLabel) url.searchParams.set('actionLabel', encodeURIComponent(actionLabel));
  return url.toString();
}
