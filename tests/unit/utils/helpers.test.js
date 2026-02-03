/**
 * Tests: trimToLast y generateEventId
 */

import { describe, it, expect } from '@jest/globals';
import { trimToLast, generateEventId } from '../../../js/utils/helpers.js';

describe('helpers', () => {
  describe('trimToLast', () => {
    it('devuelve el array si length <= max', () => {
      expect(trimToLast([1, 2, 3], 5)).toEqual([1, 2, 3]);
      expect(trimToLast([], 50)).toEqual([]);
    });

    it('recorta a los últimos max elementos', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      expect(trimToLast(arr, 3)).toEqual([4, 5, 6]);
      expect(trimToLast([1, 2, 3, 4, 5], 2)).toEqual([4, 5]);
    });

    it('no muta el array original', () => {
      const arr = [1, 2, 3, 4];
      trimToLast(arr, 2);
      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('maneja input no-array o length <= max', () => {
      expect(trimToLast(null, 50)).toEqual(null);
      expect(trimToLast([1, 2], 50)).toEqual([1, 2]);
    });
  });

  describe('generateEventId', () => {
    it('genera un string no vacío', () => {
      const id = generateEventId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('empieza con ev_', () => {
      expect(generateEventId().startsWith('ev_')).toBe(true);
    });

    it('genera ids distintos', () => {
      const a = generateEventId();
      const b = generateEventId();
      expect(a).not.toBe(b);
    });
  });
});
