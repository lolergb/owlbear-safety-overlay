/**
 * @fileoverview API pública: triggerAction, subscribeToEvents, getConfig, setConfig, clearLog.
 * Cooldown anti-spam y respeto a showIdentity.
 */

import { MetadataService } from '../obr/MetadataService.js';
import { createEvent, appendAndTrim } from './SafetyEventBus.js';
import { normalizeConfig } from './SafetyTypes.js';
import { ACTION_COOLDOWN_MS } from '../../utils/constants.js';
import { log, logError } from '../../utils/logger.js';
import { getUserRole } from '../../utils/logger.js';

export class SafetyService {
  constructor() {
    this.metadata = new MetadataService();
    this.OBR = null;
    /** @type {Map<string, number>} playerId -> lastTriggerTs */
    this._cooldownMap = new Map();
  }

  setOBR(obr) {
    this.OBR = obr;
    this.metadata.setOBR(obr);
  }

  /**
   * Dispara una acción (X-Card, Pause, Rewind). Respeta cooldown y showIdentity.
   * @param {string} actionId
   * @param {string} actionLabel
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async triggerAction(actionId, actionLabel) {
    if (!this.OBR) return { success: false, error: 'OBR not ready' };

    let userId = null;
    let userName = null;
    try {
      if (this.OBR.player?.getId) userId = await this.OBR.player.getId();
      if (this.OBR.player?.getName) userName = await this.OBR.player.getName();
    } catch (_) {}

    const playerKey = userId || `anon_${Date.now()}`;
    const now = Date.now();
    const last = this._cooldownMap.get(playerKey) || 0;
    if (now - last < ACTION_COOLDOWN_MS) {
      const remaining = Math.ceil((ACTION_COOLDOWN_MS - (now - last)) / 1000);
      return { success: false, error: `Cooldown: espera ${remaining}s` };
    }

    const { config, events } = await this.metadata.getAll();
    const cfg = normalizeConfig(config);
    const newEvent = createEvent(actionId, actionLabel, cfg.showIdentity, userId, userName);
    const nextEvents = appendAndTrim(events, newEvent);

    const ok = await this.metadata.setEvents(nextEvents);
    if (ok) {
      this._cooldownMap.set(playerKey, now);
      log('Safety action:', actionId, newEvent.id);
    }
    return ok ? { success: true } : { success: false, error: 'Failed to save' };
  }

  /**
   * Suscribe a cambios de events (y opcionalmente config). Llama callback con { config, events }
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribeToEvents(callback) {
    return this.metadata.subscribe(callback);
  }

  async getConfig() {
    const raw = await this.metadata.getConfig();
    return normalizeConfig(raw);
  }

  /**
   * Solo GM puede cambiar config
   * @param {Object} config
   */
  async setConfig(config) {
    const isGM = await getUserRole();
    if (!isGM) return false;
    const normalized = normalizeConfig(config);
    return this.metadata.setConfig(normalized);
  }

  /**
   * Limpia el log de eventos. Solo GM.
   * @returns {Promise<boolean>}
   */
  async clearLog() {
    const isGM = await getUserRole();
    if (!isGM) return false;
    const ok = await this.metadata.setEvents([]);
    if (ok) log('GM log cleared');
    return ok;
  }

  /**
   * Obtiene la lista actual de events (para UI)
   */
  async getEvents() {
    return this.metadata.getEvents();
  }

  cleanup() {
    this.metadata.cleanup();
    this._cooldownMap.clear();
  }
}
