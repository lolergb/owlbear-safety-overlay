/**
 * @fileoverview Panel GM: lista de últimos 50 eventos (hora + acción + nombre si showIdentity).
 * Solo visible para GM. Botón "Clear log" solo GM.
 */

import { normalizeConfig } from '../services/safety/SafetyTypes.js';

export class GmLogPanel {
  /**
   * @param {HTMLElement} container
   * @param {Object} callbacks - { onClearLog: async () => boolean }
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.onClearLog = callbacks.onClearLog || (async () => false);
    this._listEl = null;
    this._clearBtn = null;
    this._config = { showIdentity: false };
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
  }

  /**
   * Renderiza la lista de eventos
   * @param {Array} events - [{ id, ts, actionId, actionLabel, userId?, userName? }]
   */
  render(events) {
    if (!this.container) return;
    const list = Array.isArray(events) ? events : [];
    const showName = this._config.showIdentity;

    if (!this._listEl) {
      this.container.innerHTML = '';
      const title = document.createElement('h3');
      title.className = 'safety-gmlog__title';
      title.textContent = 'GM Event Log';
      this.container.appendChild(title);

      this._listEl = document.createElement('ul');
      this._listEl.className = 'safety-gmlog__list';
      this.container.appendChild(this._listEl);

      this._clearBtn = document.createElement('button');
      this._clearBtn.type = 'button';
      this._clearBtn.className = 'safety-btn safety-btn--ghost safety-gmlog__clear';
      this._clearBtn.textContent = 'Clear log';
      this._clearBtn.addEventListener('click', () => this._handleClear());
      this.container.appendChild(this._clearBtn);
    }

    this._listEl.innerHTML = '';
    const reversed = [...list].reverse();
    for (const ev of reversed) {
      const li = document.createElement('li');
      li.className = 'safety-gmlog__item';
      const time = new Date(ev.ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let text = `${time} — ${ev.actionLabel}`;
      if (showName && (ev.userName || ev.userId)) {
        text += ` (${ev.userName || ev.userId || '—'})`;
      }
      li.textContent = text;
      this._listEl.appendChild(li);
    }
  }

  async _handleClear() {
    this._clearBtn.disabled = true;
    try {
      await this.onClearLog();
    } finally {
      this._clearBtn.disabled = false;
    }
  }

  setVisible(visible) {
    this.container.style.display = visible ? 'block' : 'none';
  }
}
