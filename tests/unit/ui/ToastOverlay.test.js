/**
 * Tests: cola de toasts (lógica de cola)
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ToastOverlay } from '../../../js/ui/ToastOverlay.js';

describe('ToastOverlay', () => {
  let container;
  let overlay;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.useFakeTimers();
  });

  afterEach(() => {
    overlay?.destroy();
    container?.remove();
    jest.useRealTimers();
  });

  it('encola y muestra un toast', () => {
    overlay = new ToastOverlay(container, { durationMs: 1000 });
    overlay.show('X-Card');
    expect(container.querySelector('.safety-toast')).not.toBeNull();
    expect(container.querySelector('.safety-toast').textContent).toBe('X-Card');
  });

  it('encola varios y los muestra en orden', () => {
    overlay = new ToastOverlay(container, { durationMs: 100 });
    overlay.show('First');
    overlay.show('Second');
    expect(container.querySelectorAll('.safety-toast').length).toBe(1);
    expect(container.querySelector('.safety-toast').textContent).toBe('First');
    jest.advanceTimersByTime(150);
    expect(container.querySelectorAll('.safety-toast').length).toBeLessThanOrEqual(2);
    jest.advanceTimersByTime(200);
    overlay.destroy();
  });
});
