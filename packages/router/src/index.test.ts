import { describe, expect, it, vi } from 'vitest';
import { initRouter } from './index.js';

describe('router', () => {
  it('loads same-origin route partials into a target', async () => {
    document.body.innerHTML = '<a data-uif="route" href="/next" data-uif-target="#view">Next</a><main id="view"></main>';
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>Next</p>', { headers: { 'content-type': 'text/html' } })));
    initRouter(document);
    document.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(document.querySelector('#view')?.innerHTML).toBe('<p>Next</p>');
  });
});
