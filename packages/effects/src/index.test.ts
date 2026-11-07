import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureCompatibility } from '@batoi/uif-core';
import {
  animate,
  animationPresets,
  cancelAnimation,
  collapse,
  expand,
  hide,
  initAnimation,
  initAnimationTriggers,
  initTypedText,
  observeMotion,
  show,
  toggle,
} from './index.js';

afterEach(() => { configureCompatibility(null); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('effects', () => {
  it('cancels a stale hide when shown again and releases scheduled work', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('div');
    const closing = hide(el, { duration: 100 });
    const reopening = show(el, { duration: 20 });
    await vi.runAllTimersAsync();
    await Promise.all([closing, reopening]);
    expect(el.hidden).toBe(false);
    expect(el.dataset.uifState).toBe('open');
    expect(el.classList.contains('uif-is-visible')).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not add delayed classes or retain height after cancellation', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('div');
    const animation = animate(el, 'pop', { delay: 1000 });
    const opening = expand(el);
    cancelAnimation(el);
    await Promise.all([animation, opening]);
    expect(el.style.height).toBe('');
    expect(el.className).toBe('');
    expect(vi.getTimerCount()).toBe(0);
    const closing = collapse(el);
    const reopened = expand(el, { duration: 1 });
    await vi.runAllTimersAsync();
    await Promise.all([closing, reopened]);
    expect(el.hidden).toBe(false);
    expect(el.style.height).toBe('');
    expect(el.classList.contains('uif-is-expanded')).toBe(true);
  });

  it('keeps a replacement animation intact when an aborted animation settles', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('div');
    const first = animate(el, 'pop', { duration: 100 });
    await vi.advanceTimersByTimeAsync(20);
    const second = animate(el, 'pop', { duration: 200 });
    await vi.advanceTimersByTimeAsync(20);
    await first;
    expect(el.classList.contains('uif-is-animating')).toBe(true);
    expect(el.style.animationDuration).toBe('200ms');
    await vi.runAllTimersAsync();
    await second;
    expect(el.classList.contains('uif-is-animating')).toBe(false);
  });

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

  it('exposes preset metadata and supports cancellation', async () => {
    expect(animationPresets.some((preset) => preset.name === 'highlight')).toBe(true);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('div');
    const pending = animate(el, 'pulse', { duration: 20, repeat: 2 });
    cancelAnimation(el);
    await pending;
    expect(el.classList.contains('uif-is-animating')).toBe(false);
  });

  it('owns declarative trigger listeners through animation controllers', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('button');
    el.dataset.uifTrigger = 'click';
    el.dataset.uifAnimation = 'fade-in';
    const controller = initAnimation(el);
    expect(initAnimation(el)).toBe(controller);

    controller.destroy();
    el.click();
    expect(el.classList.contains('uif-is-animating')).toBe(false);
    expect(initAnimation(el)).not.toBe(controller);
  });

  it('shows typed text immediately when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = document.createElement('span');
    el.dataset.uifStrings = '["Build faster","Ship safely"]';

    const controller = initTypedText(el);

    expect(el.textContent).toBe('Build faster');
    expect(el.getAttribute('aria-label')).toBe('Build faster');
    expect(initTypedText(el)).toBe(controller);
    controller.destroy();
    expect(initTypedText(el)).not.toBe(controller);
  });

  it('rejects legacy typed-text lists in strict v3 mode', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    configureCompatibility({ mode: 'v3' });
    const el = document.createElement('span');
    el.dataset.uifStrings = 'First|Second';
    const controller = initTypedText(el);
    expect(el.textContent).toBe('');
    controller.destroy();
  });

  it('types, deletes, and advances declarative phrases', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = document.createElement('span');
    el.dataset.uifStrings = '["One","Two"]';

    const controller = initTypedText(el, { typeSpeed: 1, deleteSpeed: 1, pause: 1 });
    vi.advanceTimersByTime(3);
    expect(el.textContent).toBe('One');
    expect(el.getAttribute('aria-label')).toBe('One');
    vi.advanceTimersByTime(8);
    expect(el.textContent).toBe('Two');

    controller.destroy();
    vi.runOnlyPendingTimers();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
