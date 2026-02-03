/**
 * @fileoverview Vista mínima cuando OBR abre el modal de carta (?modal=card&actionId=).
 * Muestra la imagen de la carta, auto-cierre 4s y botón Close; llama OBR.modal.close().
 */

import { getCardImagePath } from '../utils/cardAssets.js';
import { CARD_OVERLAY_DURATION_MS, SAFETY_CARD_MODAL_ID } from '../utils/constants.js';

/**
 * Inicializa la vista de carta para el modal de OBR.
 * Debe llamarse cuando la URL tiene ?modal=card&actionId=...
 * @param {Object} OBR - SDK de Owlbear (para OBR.modal.close)
 * @param {HTMLElement} root - contenedor (ej. #safety-app)
 */
export function initCardModalView(OBR, root) {
  console.log('[Safety Overlay] === CARD MODAL VIEW INIT ===');
  console.log('[Safety Overlay] URL:', window.location.href);
  console.log('[Safety Overlay] Search params:', window.location.search);
  
  // Fondo transparente
  document.documentElement.classList.add('card-modal-mode');
  document.body.style.background = 'transparent';
  
  const params = new URLSearchParams(window.location.search);
  const actionId = params.get('actionId') || 'x-card';
  const actionLabel = params.get('actionLabel') || actionId;
  // URL personalizada de imagen (opcional)
  const customImageUrl = params.get('imageUrl') ? decodeURIComponent(params.get('imageUrl')) : null;
  
  console.log('[Safety Overlay] actionId:', actionId);
  console.log('[Safety Overlay] actionLabel:', actionLabel);
  console.log('[Safety Overlay] customImageUrl:', customImageUrl);

  const path = customImageUrl || getCardImagePath(actionId);
  console.log('[Safety Overlay] Final image path:', path);

  root.innerHTML = '';
  root.className = 'safety-app safety-app--card-modal';

  const img = document.createElement('img');
  img.src = path;
  img.alt = actionLabel;
  img.className = 'safety-card-image-fullmodal';

  async function closeModal() {
    if (window._safetyCardModalTimer) {
      clearTimeout(window._safetyCardModalTimer);
      window._safetyCardModalTimer = null;
    }
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'safety-card-modal-closed', modalId: SAFETY_CARD_MODAL_ID }, '*');
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'safety-card-modal-closed', modalId: SAFETY_CARD_MODAL_ID }, '*');
      }
    } catch (_) {}
    if (OBR && OBR.modal && typeof OBR.modal.close === 'function') {
      await OBR.modal.close(SAFETY_CARD_MODAL_ID);
    }
  }

  // Click en la imagen cierra el modal
  img.addEventListener('click', closeModal);

  root.appendChild(img);

  const timer = setTimeout(closeModal, CARD_OVERLAY_DURATION_MS);
  window._safetyCardModalTimer = timer;
}
