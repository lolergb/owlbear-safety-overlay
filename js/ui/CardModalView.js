/**
 * @fileoverview Vista mínima cuando OBR abre el modal de carta (?modal=card&actionId=).
 * Muestra la imagen de la carta, auto-cierre 4s y botón Close; llama OBR.modal.close().
 */

import { getCardImagePath } from '../utils/cardAssets.js';
import { CARD_OVERLAY_DURATION_MS, BROADCAST_CARD_CLOSED } from '../utils/constants.js';

/**
 * Inicializa la vista de carta para el modal de OBR.
 * Debe llamarse cuando la URL tiene ?modal=card&actionId=...
 * @param {Object} OBR - SDK de Owlbear (para OBR.modal.close)
 * @param {HTMLElement} root - contenedor (ej. #safety-app)
 */
export async function initCardModalView(OBR, root) {
  const params = new URLSearchParams(window.location.search);
  const actionId = params.get('actionId') || 'x-card';
  const actionLabel = params.get('actionLabel') || actionId;

  let playerId = null;
  try {
    if (OBR?.player?.getId) playerId = await OBR.player.getId();
  } catch (_) {}

  const path = getCardImagePath(actionId);

  root.innerHTML = '';
  root.className = 'safety-app safety-app--card-modal';

  const backdrop = document.createElement('div');
  backdrop.className = 'safety-card-backdrop safety-card-backdrop--modal';

  const wrap = document.createElement('div');
  wrap.className = 'safety-card-wrap';

  const img = document.createElement('img');
  img.src = path;
  img.alt = actionLabel;
  img.className = 'safety-card-image';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'safety-card-close safety-btn safety-btn--ghost';
  closeBtn.textContent = 'Close';

  function closeModal() {
    if (window._safetyCardModalTimer) {
      clearTimeout(window._safetyCardModalTimer);
      window._safetyCardModalTimer = null;
    }
    if (OBR && OBR.broadcast) {
      OBR.broadcast.sendMessage(BROADCAST_CARD_CLOSED, { closedAt: Date.now(), senderId: playerId });
    }
    if (OBR && OBR.modal && typeof OBR.modal.close === 'function') {
      OBR.modal.close();
    }
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  wrap.appendChild(img);
  wrap.appendChild(closeBtn);
  backdrop.appendChild(wrap);
  root.appendChild(backdrop);

  const timer = setTimeout(closeModal, CARD_OVERLAY_DURATION_MS);
  window._safetyCardModalTimer = timer;
}
