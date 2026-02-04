/**
 * Tests: createEvent (anonimato), appendAndTrim (trimming a 50)
 */

import { describe, it, expect } from '@jest/globals';
import { createEvent, appendAndTrim } from '../../../../js/services/safety/SafetyEventBus.js';
import { MAX_EVENTS } from '../../../../js/utils/constants.js';

describe('SafetyEventBus', () => {
  describe('createEvent', () => {
    it('incluye id, t (timestamp), a (actionId), l (actionLabel)', () => {
      const ev = createEvent('x-card', 'X-Card', false);
      expect(ev.id).toBeDefined();
      expect(ev.t).toBeDefined();
      expect(typeof ev.t).toBe('number');
      expect(ev.a).toBe('x-card');
      expect(ev.l).toBe('X-Card');
    });

    it('showIdentity=false: NO incluye u (userId) ni n (userName) en el evento', () => {
      const ev = createEvent('pause', 'Pause', false, 'user-123', 'Alice');
      expect(ev.u).toBeUndefined();
      expect(ev.n).toBeUndefined();
    });

    it('showIdentity=true: incluye u (userId) y n (userName) si se pasan', () => {
      const ev = createEvent('rewind', 'Rewind', true, 'user-456', 'Bob');
      expect(ev.u).toBe('user-456');
      expect(ev.n).toBe('Bob');
    });
  });

  describe('appendAndTrim', () => {
    it('añade un evento y recorta a últimos MAX_EVENTS', () => {
      const current = Array.from({ length: 22 }, (_, i) => ({ id: `ev-${i}`, t: i }));
      const newEv = { id: 'ev-new', t: 100, a: 'x-card', l: 'X-Card' };
      const result = appendAndTrim(current, newEv);
      expect(result.length).toBe(MAX_EVENTS);
      expect(result[result.length - 1]).toEqual(newEv);
      expect(result[0].id).toBe('ev-3'); // 22 + 1 = 23, trim 20 => últimos 20 (índices 3..22 del original)
    });

    it('si current tiene menos de MAX_EVENTS, solo añade', () => {
      const current = [{ id: 'a', t: 1 }];
      const newEv = { id: 'b', t: 2, a: 'pause', l: 'Pause' };
      const result = appendAndTrim(current, newEv);
      expect(result.length).toBe(2);
      expect(result[1]).toEqual(newEv);
    });
  });
});
