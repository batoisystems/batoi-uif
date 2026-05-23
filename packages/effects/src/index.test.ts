import { describe, expect, it, vi } from 'vitest';
import { hide, show, toggle } from './index.js';

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
});
