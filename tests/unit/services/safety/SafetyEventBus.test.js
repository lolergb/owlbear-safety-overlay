/**
 * Tests: createEvent (anonimato), appendAndTrim (trimming a 50)
 */

import { describe, it, expect } from '@jest/globals';
import { createEvent, appendAndTrim } from '../../../../js/services/safety/SafetyEventBus.js';
import { MAX_EVENTS } from '../../../../js/utils/constants.js';

describe('SafetyEventBus', () => {
  describe('createEvent', () => {
    it('incluye id, ts, actionId, actionLabel', () => {
      const ev = createEvent('x-card', 'X-Card', false);
      expect(ev.id).toBeDefined();
      expect(ev.ts).toBeDefined();
      expect(ev.actionId).toBe('x-card');
      expect(ev.actionLabel).toBe('X-Card');
    });

    it('showIdentity=false: NO incluye userId ni userName en el evento', () => {
      const ev = createEvent('pause', 'Pause', false, 'user-123', 'Alice');
      expect(ev.userId).toBeUndefined();
      expect(ev.userName).toBeUndefined();
    });

    it('showIdentity=true: incluye userId y userName si se pasan', () => {
      const ev = createEvent('rewind', 'Rewind', true, 'user-456', 'Bob');
      expect(ev.userId).toBe('user-456');
      expect(ev.userName).toBe('Bob');
    });
  });

  describe('appendAndTrim', () => {
    it('añade un evento y recorta a últimos MAX_EVENTS (50)', () => {
      const current = Array.from({ length: 52 }, (_, i) => ({ id: `ev-${i}`, ts: i }));
      const newEv = { id: 'ev-new', ts: 100, actionId: 'x-card', actionLabel: 'X-Card' };
      const result = appendAndTrim(current, newEv);
      expect(result.length).toBe(MAX_EVENTS);
      expect(result[result.length - 1]).toEqual(newEv);
      expect(result[0].id).toBe('ev-3'); // 52 + 1 = 53, trim 50 => últimos 50 (índices 3..52 del original)
    });

    it('si current tiene menos de 50, solo añade', () => {
      const current = [{ id: 'a', ts: 1 }];
      const newEv = { id: 'b', ts: 2, actionId: 'pause', actionLabel: 'Pause' };
      const result = appendAndTrim(current, newEv);
      expect(result.length).toBe(2);
      expect(result[1]).toEqual(newEv);
    });
  });
});
