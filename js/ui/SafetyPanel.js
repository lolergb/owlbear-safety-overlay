/**
 * @fileoverview Panel principal: acciones (X-Card, Pause, Rewind), opciones GM y GM Event Log.
 */

import { getDefaultActions } from '../services/safety/SafetyTypes.js';
import { ToastOverlay } from './ToastOverlay.js';
import { GmLogPanel } from './GmLogPanel.js';
import { normalizeConfig } from '../services/safety/SafetyTypes.js';
import { getCardModalUrl } from '../utils/modalUrl.js';
import { CARD_OVERLAY_DURATION_MS, SAFETY_CARD_MODAL_ID, BROADCAST_CHANNEL_SHOW_CARD } from '../utils/constants.js';
import { log } from '../utils/logger.js';

export class SafetyPanel {
  /**
   * @param {HTMLElement} root - elemento raíz (ej. #safety-app)
   * @param {Object} deps - { safetyService, isGM, obr }
   */
  constructor(root, deps) {
    this.root = root;
    this.safetyService = deps.safetyService;
    this.isGM = deps.isGM;
    this.obr = deps.obr;
    this.config = normalizeConfig(null);
    this.actions = getDefaultActions();
    this.toastOverlay = null;
    this.gmLogPanel = null;
    this._modalQueue = [];
    this._modalShowing = false;
    this._modalTimer = null;
    this._toastContainer = null;
    this._broadcastUnsubscribe = null;
    this._lastBroadcastEventId = null;
    this._lastEventId = null;
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

    this._setupModalCloseListener();
    this._setupBroadcastListener();

    // Cargar eventos iniciales y establecer último ID para no mostrar modales de eventos viejos
    const initialEvents = await this.safetyService.getEvents();
    if (initialEvents.length > 0) {
      this._lastEventId = initialEvents[initialEvents.length - 1].id;
    }
    this._initialized = true;

    // Suscribirse a cambios de metadata (SOLO para actualizar log/config del GM)
    // Los modales se muestran exclusivamente via broadcast (más rápido y confiable)
    this._unsubscribe = this.safetyService.subscribeToEvents(({ config, events }) => {
      log('Metadata change received, events count:', events?.length || 0);
      this.config = normalizeConfig(config);
      this.gmLogPanel.setConfig(this.config);
      this.gmLogPanel.render(events);
      this._updateSettingsUI();
      
      // Actualizar lastEventId solo para tracking (no para mostrar modales)
      const last = events[events.length - 1];
      if (last) {
        this._lastEventId = last.id;
      }
    });
    log('SafetyPanel initialized, isGM:', this.isGM);
  }

  /**
   * Configura listener de broadcast para recibir notificaciones de carta inmediatamente
   */
  _setupBroadcastListener() {
    log('Setting up broadcast listener...');
    log('OBR available:', !!this.obr);
    log('OBR.broadcast available:', !!this.obr?.broadcast);
    log('OBR.broadcast.onMessage available:', !!this.obr?.broadcast?.onMessage);
    
    if (!this.obr?.broadcast?.onMessage) {
      log('ERROR: Broadcast not available!');
      return;
    }
    
    this._broadcastUnsubscribe = this.obr.broadcast.onMessage(BROADCAST_CHANNEL_SHOW_CARD, (event) => {
      log('=== BROADCAST RECEIVED ===');
      log('Event data:', JSON.stringify(event.data || {}));
      const { actionId, actionLabel, eventId, senderId } = event.data || {};
      log('Parsed - actionId:', actionId, 'eventId:', eventId);
      
      // Evitar duplicados
      if (eventId && eventId === this._lastBroadcastEventId) {
        log('Duplicate broadcast, ignoring');
        return;
      }
      this._lastBroadcastEventId = eventId;
      
      // Mostrar toast y modal
      if (actionId) {
        log('Showing toast and modal for:', actionId);
        this.toastOverlay.show(actionLabel || actionId);
        this._showCardModal(actionId, actionLabel);
      } else {
        log('ERROR: No actionId in broadcast!');
      }
    });
    log('Broadcast listener configured on channel:', BROADCAST_CHANNEL_SHOW_CARD);
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
    log('Rendering actions, count:', this.actions.length);
    this._actionsContainer.innerHTML = '';
    for (const action of this.actions) {
      log('Creating button for action:', action.id, action.label);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'safety-btn safety-btn--action';
      btn.textContent = action.label;
      btn.dataset.actionId = action.id;
      btn.dataset.actionLabel = action.label;
      btn.addEventListener('click', (e) => {
        log('Button clicked:', action.id);
        this._onActionClick(e);
      });
      this._actionsContainer.appendChild(btn);
    }
    log('Actions rendered');
  }

  async _onActionClick(e) {
    log('_onActionClick called');
    const btn = e.currentTarget;
    const actionId = btn.dataset.actionId;
    const actionLabel = btn.dataset.actionLabel || actionId;
    log('Action clicked:', actionId, actionLabel);
    
    // NOTA: confirm() no funciona en iframes de Owlbear, deshabilitado
    // El cooldown de 12s es suficiente protección anti-spam
    
    log('Calling safetyService.triggerAction...');
    try {
      const result = await this.safetyService.triggerAction(actionId, actionLabel);
      log('triggerAction result:', JSON.stringify(result));
      if (!result.success && result.error) {
        log('Action failed:', result.error);
        if (result.error.includes('Cooldown')) {
          btn.disabled = true;
          btn.textContent = 'Espera...';
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = actionLabel;
          }, 2000);
        }
      }
    } catch (err) {
      log('ERROR in triggerAction:', err.message || err);
      console.error('[Safety Overlay] triggerAction error:', err);
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

    // Sección de imágenes personalizadas
    const imagesSection = document.createElement('div');
    imagesSection.className = 'safety-settings__images';
    
    const imagesTitle = document.createElement('div');
    imagesTitle.className = 'safety-settings__title';
    imagesTitle.textContent = 'Custom Card Images (URLs)';
    imagesSection.appendChild(imagesTitle);

    const customImages = this.config.customImages || {};
    for (const action of this.actions) {
      const row = document.createElement('div');
      row.className = 'safety-settings__row';
      
      const label = document.createElement('label');
      label.textContent = action.label + ':';
      label.className = 'safety-settings__label';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'safety-input';
      input.placeholder = 'URL de imagen (dejar vacío = default)';
      input.value = customImages[action.id] || '';
      input.dataset.actionId = action.id;
      input.addEventListener('change', (e) => {
        const newCustomImages = { ...this.config.customImages };
        if (e.target.value.trim()) {
          newCustomImages[action.id] = e.target.value.trim();
        } else {
          delete newCustomImages[action.id];
        }
        this._saveConfig({ customImages: newCustomImages });
      });
      
      row.appendChild(label);
      row.appendChild(input);
      imagesSection.appendChild(row);
    }
    
    wrap.appendChild(imagesSection);
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

  /**
   * Añade carta a la cola y abre modal OBR (uno por uno) para que todos en la room la vean.
   */
  _showCardModal(actionId, actionLabel) {
    // Obtener URL de imagen personalizada si existe
    const customImageUrl = this.config?.customImages?.[actionId] || null;
    this._modalQueue.push({ actionId, actionLabel: actionLabel || actionId, customImageUrl });
    this._processModalQueue();
  }

  /**
   * Escucha postMessage desde el modal para saber cuándo se cerró y abrir el siguiente.
   */
  _setupModalCloseListener() {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'safety-card-modal-closed' && e.data.modalId === SAFETY_CARD_MODAL_ID) {
        this._onModalClosed();
      }
    });
  }

  _onModalClosed() {
    if (this._modalTimer) {
      clearTimeout(this._modalTimer);
      this._modalTimer = null;
    }
    this._modalShowing = false;
    this._processModalQueue();
  }

  async _processModalQueue() {
    log('_processModalQueue called');
    log('_modalShowing:', this._modalShowing);
    log('_modalQueue.length:', this._modalQueue.length);
    log('obr.modal available:', !!this.obr?.modal);
    
    if (this._modalShowing) {
      log('Modal already showing, waiting...');
      return;
    }
    if (this._modalQueue.length === 0) {
      log('Modal queue empty');
      return;
    }
    if (!this.obr?.modal) {
      log('ERROR: OBR.modal not available!');
      return;
    }
    
    this._modalShowing = true;
    const item = this._modalQueue.shift();
    const url = getCardModalUrl(item.actionId, item.actionLabel, item.customImageUrl);
    
    log('Opening modal with URL:', url);
    log('Modal ID:', SAFETY_CARD_MODAL_ID);
    
    try {
      // Intentar cerrar modal anterior
      try {
        log('Closing previous modal...');
        await this.obr.modal.close(SAFETY_CARD_MODAL_ID);
        log('Previous modal closed');
      } catch (closeErr) {
        log('No previous modal to close (normal)');
      }
      
      // Cerrar el popover antes de abrir el modal fullscreen
      // Esto evita conflictos con el fullScreen de OBR
      // IMPORTANTE: El GM suele tener el popover abierto, causando diferencias visuales
      try {
        if (this.obr?.popover?.close) {
          log('Closing popover before modal (isGM:', this.isGM, ')...');
          await this.obr.popover.close();
          // Delay más largo para GM (que suele tener popover abierto)
          const delay = this.isGM ? 300 : 100;
          log('Waiting', delay, 'ms for popover to close...');
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (popoverErr) {
        log('Could not close popover (normal):', popoverErr.message || popoverErr);
      }
      
      log('Opening new modal...');
      await this.obr.modal.open({
        id: SAFETY_CARD_MODAL_ID,
        url,
        fullScreen: false,
        hidePaper: true,
        hideBackdrop: true
      });
      log('Modal opened successfully!');
    } catch (e) {
      log('ERROR opening modal:', e.message || e);
      console.error('[Safety Overlay] Error abriendo modal OBR:', e);
      this._modalShowing = false;
      return;
    }
    
    this._modalTimer = setTimeout(() => {
      log('Modal timeout, calling _onModalClosed');
      this._onModalClosed();
    }, CARD_OVERLAY_DURATION_MS + 500);
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    if (this._broadcastUnsubscribe) {
      if (typeof this._broadcastUnsubscribe === 'function') {
        this._broadcastUnsubscribe();
      } else if (this._broadcastUnsubscribe.unsubscribe) {
        this._broadcastUnsubscribe.unsubscribe();
      }
    }
    this.toastOverlay?.destroy();
    this._modalQueue = [];
    if (this._modalTimer) {
      clearTimeout(this._modalTimer);
      this._modalTimer = null;
    }
    this._unsubscribe = null;
    this._broadcastUnsubscribe = null;
  }
}
