/**
 * Tests: cola de visualización de cartas (se muestran en orden)
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CardOverlay } from '../../../js/ui/CardOverlay.js';

describe('CardOverlay', () => {
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

  it('encola y muestra una carta para actionId', () => {
    overlay = new CardOverlay(container, { durationMs: 1000 });
    overlay.show('x-card', 'X-Card');
    const backdrop = container.querySelector('.safety-card-backdrop');
    expect(backdrop).not.toBeNull();
    const img = container.querySelector('.safety-card-image');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/public/cards/x-card.svg');
  });

  it('encola varias cartas y las muestra en orden', () => {
    overlay = new CardOverlay(container, { durationMs: 100 });
    overlay.show('x-card', 'X-Card');
    overlay.show('pause', 'Pause');
    overlay.show('rewind', 'Rewind');
    expect(container.querySelectorAll('.safety-card-backdrop').length).toBe(1);
    expect(container.querySelector('.safety-card-image').getAttribute('src')).toContain('x-card.svg');
    jest.advanceTimersByTime(150);
    overlay.destroy();
  });

  it('usa getCardImagePath: pause devuelve ruta de pause', () => {
    overlay = new CardOverlay(container, { durationMs: 1000 });
    overlay.show('pause', 'Pause');
    const img = container.querySelector('.safety-card-image');
    expect(img.getAttribute('src')).toBe('/public/cards/pause.svg');
  });
});
