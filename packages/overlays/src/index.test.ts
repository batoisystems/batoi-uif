import { describe, expect, it, vi } from 'vitest';
import { closeOverlay, getOverlayStack, openOverlay } from './index.js';

describe('overlays', () => {
  it('opens and closes overlays with stack tracking', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = document.createElement('div');
    el.hidden = true;
    document.body.append(el);
    await openOverlay(el, { modal: true });
    expect(getOverlayStack()).toEqual([el]);
    expect(el.hidden).toBe(false);
    await closeOverlay(el);
    expect(getOverlayStack()).toEqual([]);
    expect(el.hidden).toBe(true);
  });
});
