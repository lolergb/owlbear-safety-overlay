/**
 * @fileoverview Panel principal: acciones (X-Card, Pause, Rewind), opciones GM y GM Event Log.
 */

import { getDefaultActions } from '../services/safety/SafetyTypes.js';
import { ToastOverlay } from './ToastOverlay.js';
import { GmLogPanel } from './GmLogPanel.js';
import { normalizeConfig } from '../services/safety/SafetyTypes.js';

export class SafetyPanel {
  /**
   * @param {HTMLElement} root - elemento raíz (ej. #safety-app)
   * @param {Object} deps - { safetyService, isGM }
   */
  constructor(root, deps) {
    this.root = root;
    this.safetyService = deps.safetyService;
    this.isGM = deps.isGM;
    this.config = normalizeConfig(null);
    this.actions = getDefaultActions();
    this.toastOverlay = null;
    this.gmLogPanel = null;
    this._toastContainer = null;
    this._actionsContainer = null;
    this._settingsContainer = null;
    this._gmLogContainer = null;
    this._unsubscribe = null;
  }

  async init() {
    this.config = await this.safetyService.getConfig();
    this._renderStructure();
    this.toastOverlay = new ToastOverlay(this._toastContainer, { durationMs: 4000 });
    this.gmLogPanel = new GmLogPanel(this._gmLogContainer, {
      onClearLog: () => this.safetyService.clearLog()
    });
    this.gmLogPanel.setConfig(this.config);
    this._renderActions();
    this._renderSettings();
    this.gmLogPanel.render(await this.safetyService.getEvents());
    this.gmLogPanel.setVisible(this.isGM);

    this._lastEventId = null;
    this._initialized = false;
    this._unsubscribe = this.safetyService.subscribeToEvents(({ config, events }) => {
      this.config = normalizeConfig(config);
      this.gmLogPanel.setConfig(this.config);
      this.gmLogPanel.render(events);
      this._updateSettingsUI();
      const last = events[events.length - 1];
      if (last) {
        if (this._initialized && last.id !== this._lastEventId) {
          this.toastOverlay.show(last.actionLabel);
        }
        this._lastEventId = last.id;
        this._initialized = true;
      }
    });
  }

  _renderStructure() {
    this.root.innerHTML = '';
    const header = document.createElement('header');
    header.className = 'safety-header';
    header.textContent = 'Safety';
    this.root.appendChild(header);

    this._toastContainer = document.createElement('div');
    this._toastContainer.className = 'safety-toast-container';
    this.root.appendChild(this._toastContainer);

    this._actionsContainer = document.createElement('div');
    this._actionsContainer.className = 'safety-actions';
    this.root.appendChild(this._actionsContainer);

    this._settingsContainer = document.createElement('div');
    this._settingsContainer.className = 'safety-settings';
    this.root.appendChild(this._settingsContainer);

    this._gmLogContainer = document.createElement('div');
    this._gmLogContainer.className = 'safety-gmlog';
    this.root.appendChild(this._gmLogContainer);
  }

  _renderActions() {
    this._actionsContainer.innerHTML = '';
    for (const action of this.actions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'safety-btn safety-btn--action';
      btn.textContent = action.label;
      btn.dataset.actionId = action.id;
      btn.dataset.actionLabel = action.label;
      btn.addEventListener('click', (e) => this._onActionClick(e));
      this._actionsContainer.appendChild(btn);
    }
  }

  async _onActionClick(e) {
    const btn = e.currentTarget;
    const actionId = btn.dataset.actionId;
    const actionLabel = btn.dataset.actionLabel || actionId;
    // Confirmación opcional en móvil para evitar misclicks
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);
    if (isMobile && !confirm(`¿Enviar ${actionLabel}?`)) return;
    const result = await this.safetyService.triggerAction(actionId, actionLabel);
    if (!result.success && result.error) {
      if (result.error.includes('Cooldown')) {
        btn.disabled = true;
        btn.textContent = 'Espera...';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = actionLabel;
        }, 2000);
      }
    }
  }

  _renderSettings() {
    this._settingsContainer.innerHTML = '';
    if (!this.isGM) {
      this._settingsContainer.style.display = 'none';
      return;
    }
    this._settingsContainer.style.display = 'block';

    const wrap = document.createElement('div');
    wrap.className = 'safety-settings__inner';

    const notifyLabel = document.createElement('label');
    notifyLabel.className = 'safety-check';
    const notifyCb = document.createElement('input');
    notifyCb.type = 'checkbox';
    notifyCb.checked = this.config.notifyGmPrivately;
    notifyCb.addEventListener('change', () => this._saveConfig({ notifyGmPrivately: notifyCb.checked }));
    notifyLabel.appendChild(notifyCb);
    notifyLabel.appendChild(document.createTextNode(' Notify GM privately (log visible only to GM)'));
    wrap.appendChild(notifyLabel);

    const identityLabel = document.createElement('label');
    identityLabel.className = 'safety-check';
    const identityCb = document.createElement('input');
    identityCb.type = 'checkbox';
    identityCb.checked = this.config.showIdentity;
    identityCb.addEventListener('change', () => this._saveConfig({ showIdentity: identityCb.checked }));
    identityLabel.appendChild(identityCb);
    identityLabel.appendChild(document.createTextNode(' Show player identity in log'));
    wrap.appendChild(identityLabel);

    this._settingsContainer.appendChild(wrap);
  }

  _updateSettingsUI() {
    const checks = this._settingsContainer.querySelectorAll('input[type="checkbox"]');
    if (checks[0]) checks[0].checked = this.config.notifyGmPrivately;
    if (checks[1]) checks[1].checked = this.config.showIdentity;
  }

  async _saveConfig(partial) {
    const next = { ...this.config, ...partial };
    await this.safetyService.setConfig(next);
    this.config = next;
    this.gmLogPanel.setConfig(next);
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    this.toastOverlay?.destroy();
    this._unsubscribe = null;
  }
}
