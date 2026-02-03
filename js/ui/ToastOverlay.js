/**
 * @fileoverview Cola de toasts: muestra un banner arriba-centro 4s por evento; encola si llegan varios.
 */

import { TOAST_DURATION_MS } from '../utils/constants.js';

export class ToastOverlay {
  /**
   * @param {HTMLElement} container - contenedor donde montar el overlay
   * @param {Object} options - { durationMs }
   */
  constructor(container, options = {}) {
    this.container = container;
    this.durationMs = options.durationMs ?? TOAST_DURATION_MS;
    this.queue = [];
    this.isShowing = false;
    this._node = null;
  }

  /**
   * Añade un toast a la cola y lo muestra cuando toque
   * @param {string} actionLabel - ej. "X-Card", "Pause", "Rewind"
   */
  show(actionLabel) {
    this.queue.push({ actionLabel, ts: Date.now() });
    this._tick();
  }

  _tick() {
    if (this.isShowing || this.queue.length === 0) return;
    this.isShowing = true;
    const item = this.queue.shift();
    this._render(item.actionLabel);
    setTimeout(() => {
      this._hide();
      this.isShowing = false;
      this._tick();
    }, this.durationMs);
  }

  _render(label) {
    this._node = document.createElement('div');
    this._node.className = 'safety-toast';
    this._node.setAttribute('role', 'status');
    this._node.textContent = label;
    this.container.appendChild(this._node);
  }

  _hide() {
    if (this._node && this._node.parentNode) {
      this._node.classList.add('safety-toast--out');
      setTimeout(() => {
        if (this._node?.parentNode) this._node.parentNode.removeChild(this._node);
        this._node = null;
      }, 300);
    }
  }

  destroy() {
    this.queue = [];
    this._hide();
    this._node = null;
    this.isShowing = false;
  }
}
