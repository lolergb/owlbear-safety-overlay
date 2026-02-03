/**
 * @fileoverview Overlay de carta visual: modal centrado con backdrop, imagen por actionId.
 * Cola de eventos, auto-hide 4s, cierre manual (click backdrop o botón Close).
 */

import { getCardImagePath } from '../utils/cardAssets.js';
import { CARD_OVERLAY_DURATION_MS } from '../utils/constants.js';

export class CardOverlay {
  /**
   * @param {HTMLElement} container - contenedor donde montar (ej. document.body o #safety-app)
   * @param {Object} options - { durationMs }
   */
  constructor(container, options = {}) {
    this.container = container || document.body;
    this.durationMs = options.durationMs ?? CARD_OVERLAY_DURATION_MS;
    this.queue = [];
    this.isShowing = false;
    this._backdrop = null;
    this._cardWrap = null;
    this._closeTimer = null;
  }

  /**
   * Añade una carta a la cola y la muestra cuando toque
   * @param {string} actionId - ej. 'x-card', 'pause', 'rewind'
   * @param {string} [actionLabel] - ej. 'X-Card' (opcional, para accesibilidad)
   */
  show(actionId, actionLabel) {
    this.queue.push({ actionId, actionLabel: actionLabel || actionId, ts: Date.now() });
    this._tick();
  }

  _tick() {
    if (this.isShowing || this.queue.length === 0) return;
    this.isShowing = true;
    const item = this.queue.shift();
    this._render(item.actionId, item.actionLabel);
    this._closeTimer = setTimeout(() => {
      this._close();
      this.isShowing = false;
      this._tick();
    }, this.durationMs);
  }

  _render(actionId, actionLabel) {
    const path = getCardImagePath(actionId);

    this._backdrop = document.createElement('div');
    this._backdrop.className = 'safety-card-backdrop';
    this._backdrop.setAttribute('role', 'dialog');
    this._backdrop.setAttribute('aria-label', actionLabel || 'Safety card');
    this._backdrop.addEventListener('click', (e) => {
      if (e.target === this._backdrop) this._closeManually();
    });

    this._cardWrap = document.createElement('div');
    this._cardWrap.className = 'safety-card-wrap';
    this._cardWrap.addEventListener('click', (e) => e.stopPropagation());

    const img = document.createElement('img');
    img.src = path;
    img.alt = actionLabel || actionId;
    img.className = 'safety-card-image';
    img.loading = 'eager';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'safety-card-close safety-btn safety-btn--ghost';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => this._closeManually());

    this._cardWrap.appendChild(img);
    this._cardWrap.appendChild(closeBtn);
    this._backdrop.appendChild(this._cardWrap);
    this.container.appendChild(this._backdrop);
  }

  _close() {
    this._clearTimer();
    if (this._backdrop?.parentNode) {
      this._backdrop.classList.add('safety-card-backdrop--out');
      setTimeout(() => {
        if (this._backdrop?.parentNode) this._backdrop.parentNode.removeChild(this._backdrop);
        this._backdrop = null;
        this._cardWrap = null;
      }, 300);
    }
  }

  _closeManually() {
    this._close();
    this.isShowing = false;
    this._tick();
  }

  _clearTimer() {
    if (this._closeTimer) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  destroy() {
    this._clearTimer();
    this.queue = [];
    this._close();
    this._backdrop = null;
    this._cardWrap = null;
    this.isShowing = false;
  }
}
