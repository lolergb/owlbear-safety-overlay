/**
 * @fileoverview Mapping actionId -> ruta de imagen de carta.
 * Usado por CardOverlay para mostrar la carta correcta.
 */

/** Base path para las cartas (relativo a la raíz del sitio) */
export const CARDS_BASE_PATH = '/public/cards';

/** actionId -> nombre de archivo (sin extensión); extensión .svg */
export const ACTION_ID_TO_CARD_PATH = {
  'x-card': 'x-card',
  'pause': 'pause',
  'rewind': 'rewind'
};

/**
 * Devuelve la ruta completa del asset de carta para un actionId.
 * Si el actionId no existe en el mapping, devuelve la carta por defecto (x-card).
   * @param {string} actionId - ej. 'x-card', 'pause', 'rewind'
 * @returns {string} ruta ej. '/public/cards/x-card.svg'
 */
export function getCardImagePath(actionId) {
  if (!actionId || typeof actionId !== 'string') {
    return `${CARDS_BASE_PATH}/x-card.svg`;
  }
  const filename = ACTION_ID_TO_CARD_PATH[actionId];
  if (!filename) {
    return `${CARDS_BASE_PATH}/x-card.svg`;
  }
  return `${CARDS_BASE_PATH}/${filename}.svg`;
}
