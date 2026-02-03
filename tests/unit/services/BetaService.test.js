/**
 * Tests para BetaService
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { BetaService } from '../../../js/services/BetaService.js';

describe('BetaService', () => {
  let betaService;
  let originalFetch;

  beforeEach(() => {
    betaService = new BetaService();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    betaService.reset();
  });

  it('debe inicializar con beta deshabilitado por defecto', () => {
    expect(betaService.isBetaEnabled()).toBe(false);
    expect(betaService.getFeatures()).toEqual({});
  });

  it('debe detectar que no estamos en Netlify y no hacer fetch', async () => {
    global.fetch = jest.fn();
    // window.location.origin no incluye 'netlify'
    await betaService.init();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(betaService.isBetaEnabled()).toBe(false);
  });

  it('debe obtener features beta si la respuesta es exitosa', async () => {
    // Simular que estamos en Netlify
    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://owlbear-safety-overlay.netlify.app' },
      writable: true,
      configurable: true
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          betaEnabled: true,
          features: { customActions: true, exportLog: false }
        })
      })
    );

    await betaService.init();

    expect(betaService.isBetaEnabled()).toBe(true);
    expect(betaService.isFeatureEnabled('customActions')).toBe(true);
    expect(betaService.isFeatureEnabled('exportLog')).toBe(false);
    expect(betaService.isFeatureEnabled('unknownFeature')).toBe(false);
    expect(betaService.getFeatures()).toEqual({
      customActions: true,
      exportLog: false
    });

    // Restaurar
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true
    });
  });

  it('debe manejar errores de fetch sin romper', async () => {
    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://owlbear-safety-overlay.netlify.app' },
      writable: true,
      configurable: true
    });

    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    await betaService.init();

    expect(betaService.isBetaEnabled()).toBe(false);
    expect(betaService.getFeatures()).toEqual({});

    // Restaurar
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true
    });
  });

  it('debe cachear el resultado y no volver a hacer fetch', async () => {
    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://owlbear-safety-overlay.netlify.app' },
      writable: true,
      configurable: true
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          betaEnabled: true,
          features: { test: true }
        })
      })
    );

    await betaService.init();
    await betaService.init();
    await betaService.init();

    // Solo debe llamar fetch una vez
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(betaService.isBetaEnabled()).toBe(true);

    // Restaurar
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true
    });
  });

  it('debe poder resetear el estado', async () => {
    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://owlbear-safety-overlay.netlify.app' },
      writable: true,
      configurable: true
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          betaEnabled: true,
          features: { test: true }
        })
      })
    );

    await betaService.init();
    expect(betaService.isBetaEnabled()).toBe(true);

    betaService.reset();
    expect(betaService.isBetaEnabled()).toBe(false);
    expect(betaService.getFeatures()).toEqual({});
    expect(betaService._initialized).toBe(false);

    // Restaurar
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true
    });
  });

  it('debe incluir token de usuario en la URL si está disponible', async () => {
    const originalOrigin = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://owlbear-safety-overlay.netlify.app' },
      writable: true,
      configurable: true
    });

    const mockToken = 'test-token-123';
    betaService.setUserTokenFunction(() => mockToken);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ betaEnabled: false, features: {} })
      })
    );

    await betaService.init();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`token=${encodeURIComponent(mockToken)}`)
    );

    // Restaurar
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true
    });
  });
});
