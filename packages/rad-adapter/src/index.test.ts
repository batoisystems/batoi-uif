import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPartial, swapContent } from './index.js';

describe('rad adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('swaps content', () => {
    document.body.innerHTML = '<div id="target">Old</div>';
    const target = document.querySelector('#target') as HTMLElement;
    swapContent(target, '<span>New</span>');
    expect(target.innerHTML).toBe('<span>New</span>');
  });

  it('loads partial html into a target', async () => {
    document.body.innerHTML = '<button data-uif-src="/partial" data-uif-target="#target"></button><div id="target"></div>';
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>Loaded</p>', { headers: { 'content-type': 'text/html' } })));
    await loadPartial(document.querySelector('button') as HTMLElement);
    expect(document.querySelector('#target')?.innerHTML).toBe('<p>Loaded</p>');
  });
});
