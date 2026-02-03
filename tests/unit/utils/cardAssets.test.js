/**
 * Tests: mapping actionId -> asset path (existe y no rompe)
 */

import { describe, it, expect } from '@jest/globals';
import { getCardImagePath, ACTION_ID_TO_CARD_PATH, CARDS_BASE_PATH } from '../../../js/utils/cardAssets.js';

describe('cardAssets', () => {
  describe('getCardImagePath', () => {
    it('devuelve ruta correcta para x-card', () => {
      expect(getCardImagePath('x-card')).toBe(`${CARDS_BASE_PATH}/x-card.svg`);
    });

    it('devuelve ruta correcta para pause', () => {
      expect(getCardImagePath('pause')).toBe(`${CARDS_BASE_PATH}/pause.svg`);
    });

    it('devuelve ruta correcta para rewind', () => {
      expect(getCardImagePath('rewind')).toBe(`${CARDS_BASE_PATH}/rewind.svg`);
    });

    it('actionId desconocido devuelve fallback (x-card) y no rompe', () => {
      expect(getCardImagePath('unknown')).toBe(`${CARDS_BASE_PATH}/x-card.svg`);
      expect(getCardImagePath('')).toBe(`${CARDS_BASE_PATH}/x-card.svg`);
    });

    it('actionId null o no string devuelve fallback y no rompe', () => {
      expect(getCardImagePath(null)).toBe(`${CARDS_BASE_PATH}/x-card.svg`);
      expect(getCardImagePath(undefined)).toBe(`${CARDS_BASE_PATH}/x-card.svg`);
    });

    it('el mapping ACTION_ID_TO_CARD_PATH existe y tiene las 3 acciones', () => {
      expect(ACTION_ID_TO_CARD_PATH['x-card']).toBe('x-card');
      expect(ACTION_ID_TO_CARD_PATH['pause']).toBe('pause');
      expect(ACTION_ID_TO_CARD_PATH['rewind']).toBe('rewind');
      expect(Object.keys(ACTION_ID_TO_CARD_PATH).length).toBe(3);
    });
  });
});
