import { describe, expect, it, vi } from 'vitest';
import { animate, hide, initAnimationTriggers, observeMotion, show, toggle } from './index.js';

describe('effects', () => {
  it('shows, hides, and toggles with reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = document.createElement('div');
    el.hidden = true;
    await show(el);
    expect(el.hidden).toBe(false);
    await hide(el);
    expect(el.hidden).toBe(true);
    await toggle(el);
    expect(el.hidden).toBe(false);
  });

  it('animates and initializes declarative animation helpers', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('div');
    await animate(el, 'pop', { duration: 1 });
    expect(el.classList.contains('uif-is-animating')).toBe(false);
    document.body.innerHTML = '<div data-uif="animate" data-uif-animation="fade-in"></div>';
    initAnimationTriggers(document);
    observeMotion(document.documentElement);
    expect(document.documentElement.dataset.uifMotion).toBe('safe');
  });
});
