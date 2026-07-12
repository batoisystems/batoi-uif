import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindRadActions, loadPartial, swapContent } from './index.js';

describe('rad adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it('blocks cross-origin RAD requests unless explicitly allowed', async () => {
    document.body.innerHTML = '<button data-uif-src="https://evil.example/partial"></button>';
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(loadPartial(document.querySelector('button') as HTMLElement)).rejects.toThrow(/unsafe RAD request URL/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ignores malformed response selectors without crashing', async () => {
    document.body.innerHTML = '<button data-uif-src="/partial" data-uif-target="#target"></button><div id="target"></div>';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true, html: '<p>Loaded</p>', target: '[invalid' }), { headers: { 'content-type': 'application/json' } })));
    await expect(loadPartial(document.querySelector('button') as HTMLElement)).resolves.toMatchObject({ ok: true });
    expect(document.querySelector('#target')?.innerHTML).toBe('');
  });

  it('rejects malformed, unsupported, and oversized response envelopes', async () => {
    const button = document.createElement('button');
    button.dataset.uifSrc = '/partial';
    document.body.append(button);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
    await expect(loadPartial(button)).rejects.toThrow('UIF_RAD_INVALID');

    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ version: 3 })));
    await expect(loadPartial(button)).rejects.toThrow('UIF_RAD_VERSION');

    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ html: 'x'.repeat(1_000_001) })));
    await expect(loadPartial(button)).rejects.toThrow('UIF_RAD_LIMIT');
  });

  it('filters unsupported actions and bounds field errors', async () => {
    document.body.innerHTML = '<button data-uif-src="/partial"></button>';
    const button = document.querySelector('button')!;
    const fieldErrors = vi.fn();
    button.addEventListener('uif:field-errors', fieldErrors);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      ok: true,
      actions: [{ type: 'execute-tool', command: 'danger' }],
      errors: { email: ['x'.repeat(2_100), ...Array.from({ length: 15 }, () => 'extra')] },
    })));
    const payload = await loadPartial(button);
    expect(payload?.actions).toEqual([]);
    expect(payload?.errors?.email).toHaveLength(10);
    expect(payload?.errors?.email?.[0]).toHaveLength(2_000);
    expect(fieldErrors).toHaveBeenCalledOnce();
  });

  it('keeps loading ownership with the latest request and cancels on root teardown', async () => {
    document.body.innerHTML = '<section id="root"><button data-uif="ajax" data-uif-src="/partial"></button></section>';
    const root = document.querySelector('#root') as HTMLElement;
    const button = document.querySelector('button')!;
    vi.stubGlobal('fetch', vi.fn((_url, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const dispose = bindRadActions(root);
    const first = loadPartial(button);
    const second = loadPartial(button);
    await expect(first).resolves.toBeNull();
    expect(button.hasAttribute('aria-busy')).toBe(true);
    dispose();
    await expect(second).resolves.toBeNull();
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });
});
