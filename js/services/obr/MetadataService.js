/**
 * @fileoverview Servicio de room metadata con namespace para Safety Overlay.
 * get/set/subscribe para config y events usando OBR.room.
 */

import { NS_CONFIG, NS_EVENTS } from '../../utils/constants.js';
import { log, logError } from '../../utils/logger.js';

export class MetadataService {
  constructor() {
    this.OBR = null;
    this._unsubscribe = null;
  }

  setOBR(obr) {
    this.OBR = obr;
  }

  /**
   * Obtiene toda la metadata de la room y extrae config y events del namespace
   * @returns {Promise<{ config: Object, events: Array }>}
   */
  async getAll() {
    if (!this.OBR?.room?.getMetadata) return { config: null, events: [] };
    try {
      const meta = await this.OBR.room.getMetadata() || {};
      return {
        config: meta[NS_CONFIG] ?? null,
        events: Array.isArray(meta[NS_EVENTS]) ? meta[NS_EVENTS] : []
      };
    } catch (e) {
      logError('MetadataService.getAll', e);
      return { config: null, events: [] };
    }
  }

  /**
   * Obtiene solo la config
   * @returns {Promise<Object|null>}
   */
  async getConfig() {
    const { config } = await this.getAll();
    return config;
  }

  /**
   * Obtiene solo los events
   * @returns {Promise<Array>}
   */
  async getEvents() {
    const { events } = await this.getAll();
    return events;
  }

  /**
   * Guarda config en room metadata (merge con el resto de metadata)
   * @param {Object} config
   * @returns {Promise<boolean>}
   */
  async setConfig(config) {
    if (!this.OBR?.room?.setMetadata) return false;
    try {
      const meta = (await this.OBR.room.getMetadata()) || {};
      await this.OBR.room.setMetadata({
        ...meta,
        [NS_CONFIG]: config
      });
      return true;
    } catch (e) {
      logError('MetadataService.setConfig', e);
      return false;
    }
  }

  /**
   * Guarda events en room metadata (merge con el resto)
   * @param {Array} events
   * @returns {Promise<boolean>}
   */
  async setEvents(events) {
    log('MetadataService.setEvents called, events count:', events?.length || 0);
    if (!this.OBR?.room?.setMetadata) {
      log('ERROR: OBR.room.setMetadata not available');
      return false;
    }
    try {
      const meta = (await this.OBR.room.getMetadata()) || {};
      log('Current metadata keys:', Object.keys(meta));
      const newMeta = {
        ...meta,
        [NS_EVENTS]: events
      };
      log('Setting new metadata with events:', events?.length || 0);
      await this.OBR.room.setMetadata(newMeta);
      log('Metadata saved successfully');
      return true;
    } catch (e) {
      logError('MetadataService.setEvents', e);
      return false;
    }
  }

  /**
   * Suscribe a cambios de metadata; llama a callback con { config, events } cuando cambia
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    log('MetadataService.subscribe called');
    if (!this.OBR?.room?.onMetadataChange) {
      log('ERROR: OBR.room.onMetadataChange not available');
      return () => {};
    }
    
    log('Setting up onMetadataChange listener');
    this._unsubscribe = this.OBR.room.onMetadataChange((meta) => {
      log('onMetadataChange triggered');
      const config = meta?.[NS_CONFIG] ?? null;
      const events = Array.isArray(meta?.[NS_EVENTS]) ? meta[NS_EVENTS] : [];
      log('Parsed from metadata - config:', !!config, 'events:', events.length);
      callback({ config, events });
    });
    
    log('onMetadataChange listener set, unsubscribe type:', typeof this._unsubscribe);
    
    return () => {
      log('Unsubscribing from metadata changes');
      if (typeof this._unsubscribe === 'function') {
        this._unsubscribe();
      } else if (this._unsubscribe && typeof this._unsubscribe.unsubscribe === 'function') {
        this._unsubscribe.unsubscribe();
      }
      this._unsubscribe = null;
    };
  }

  cleanup() {
    if (this._unsubscribe && typeof this._unsubscribe.unsubscribe === 'function') {
      this._unsubscribe.unsubscribe();
    }
    this._unsubscribe = null;
  }
}
