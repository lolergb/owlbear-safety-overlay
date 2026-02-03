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
  // Construir URL base igual que owlbear-gm-vault
  const currentPath = window.location.pathname;
  const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const baseUrl = window.location.origin + baseDir;
  
  const url = new URL('index.html', baseUrl);
  url.searchParams.set('modal', 'card');
  url.searchParams.set('actionId', actionId || 'x-card');
  if (actionLabel) url.searchParams.set('actionLabel', encodeURIComponent(actionLabel));
  
  console.log('[Safety Overlay] Modal URL:', url.toString());
  return url.toString();
}
