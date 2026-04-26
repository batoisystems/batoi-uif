import { describe, expect, it, vi } from 'vitest';
import { loadPartial, swapContent } from './index.js';

describe('rad adapter', () => {
  it('swaps content', () => {
    const el = document.createElement('div');
    swapContent(el, '<span>x</span>', 'inner');
    expect(el.innerHTML).toContain('x');
  });

  it('rehydrates load partial', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<div>ok</div>', { headers: { 'content-type': 'text/html' } })));
    const src = document.createElement('button');
    src.dataset.uifSrc = '/partial';
    src.dataset.uifTarget = 'self';
    await loadPartial(src);
    expect(src.innerHTML).toContain('ok');
  });
});
