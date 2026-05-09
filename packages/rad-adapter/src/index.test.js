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

  it('handles JSON payload targets and swap modes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, html: '<strong>json</strong>', target: '#json-target', swap: 'append' }), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
    const target = document.createElement('div');
    target.id = 'json-target';
    document.body.appendChild(target);
    const src = document.createElement('button');
    src.dataset.uifSrc = '/partial.json';
    await loadPartial(src);
    expect(target.innerHTML).toContain('json');
  });
});
