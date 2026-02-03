/**
 * @fileoverview Servicio para gestionar features beta
 * Obtiene features habilitadas desde Netlify Function y cachea el resultado
 */

import { log, logWarn } from '../utils/logger.js';

export class BetaService {
  constructor() {
    this._betaEnabled = false;
    this._features = {};
    this._initialized = false;
    this._initPromise = null;
    this._userTokenFn = null;
  }

  /**
   * Inyecta función para obtener token del usuario
   * @param {Function} fn - Función que retorna el token del usuario
   */
  setUserTokenFunction(fn) {
    this._userTokenFn = fn;
  }

  /**
   * Inicializa el servicio beta obteniendo features desde Netlify
   * @returns {Promise<void>}
   */
  async init() {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      try {
        // Solo intentar si estamos en Netlify
        const isNetlify = window.location.origin.includes('netlify.app') || 
                          window.location.origin.includes('netlify.com');
        
        if (!isNetlify) {
          log('Beta features: no estamos en Netlify, omitiendo');
          this._initialized = true;
          return;
        }

        // Obtener token del usuario si hay función configurada
        const userToken = this._userTokenFn ? this._userTokenFn() : null;
        
        // Construir URL con token si existe
        let url = '/.netlify/functions/get-beta-features';
        if (userToken) {
          url += `?token=${encodeURIComponent(userToken)}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          this._betaEnabled = data.betaEnabled || false;
          this._features = data.features || {};
          
          if (this._betaEnabled) {
            log('🧪 Beta features habilitadas:', Object.keys(this._features).filter(k => this._features[k]));
          }
        } else {
          logWarn('Error obteniendo beta features:', response.status);
        }
      } catch (e) {
        logWarn('Error inicializando beta features:', e.message);
      } finally {
        this._initialized = true;
      }
    })();

    return this._initPromise;
  }

  /**
   * Comprueba si el sistema beta está habilitado
   * @returns {boolean}
   */
  isBetaEnabled() {
    return this._betaEnabled;
  }

  /**
   * Comprueba si una feature específica está habilitada
   * @param {string} featureName - Nombre de la feature
   * @returns {boolean}
   */
  isFeatureEnabled(featureName) {
    if (!this._betaEnabled) return false;
    return this._features[featureName] === true;
  }

  /**
   * Obtiene todas las features habilitadas
   * @returns {Object} - Objeto con features { featureName: boolean }
   */
  getFeatures() {
    return { ...this._features };
  }

  /**
   * Resetea el estado (útil para tests)
   */
  reset() {
    this._betaEnabled = false;
    this._features = {};
    this._initialized = false;
    this._initPromise = null;
  }
}

// Instancia singleton
export const betaService = new BetaService();
