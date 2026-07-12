import { describe, expect, it, vi } from 'vitest';
import { initRouter } from './index.js';

describe('router', () => {
  it('loads same-origin route partials into a target', async () => {
    document.body.innerHTML = '<a data-uif="route" href="/next" data-uif-target="#view">Next</a><main id="view"></main>';
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>Next</p>', { headers: { 'content-type': 'text/html' } })));
    const dispose = initRouter(document);
    document.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(document.querySelector('#view')?.innerHTML).toBe('<p>Next</p>');
    dispose();
  });

  it('blocks cross-origin route mappings and disposes listeners', async () => {
    document.body.innerHTML = '<a data-uif="route" href="/next" data-uif-target="#view">Next</a><main id="view"></main>';
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const error = vi.fn();
    window.addEventListener('uif:router-error', error);
    const dispose = initRouter(document, { routes: { '/next': 'https://evil.example/partial' } });
    document.querySelector('a')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(fetch).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
    dispose();
    window.removeEventListener('uif:router-error', error);
  });

  it('prevents native navigation while awaiting a guard and writes history only after success', async () => {
    document.body.innerHTML = '<a data-uif="route" href="/guarded" data-uif-target="#view">Guarded</a><main id="view"></main>';
    let allow: ((value: boolean) => void) | undefined;
    const beforeNavigate = vi.fn(() => new Promise<boolean>((resolve) => { allow = resolve; }));
    const pushState = vi.spyOn(history, 'pushState');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>Guarded</p>')));
    const dispose = initRouter(document, { beforeNavigate });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    document.querySelector('a')?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(pushState).not.toHaveBeenCalled();
    allow?.(true);
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(pushState).toHaveBeenCalledOnce();
    dispose();
  });

  it('cancels stale route loads without reporting aborts and bounds partial HTML', async () => {
    document.body.innerHTML = '<a id="one" data-uif="route" href="/one" data-uif-target="#view">One</a><a id="two" data-uif="route" href="/two" data-uif-target="#view">Two</a><main id="view"></main>';
    const errors = vi.fn();
    window.addEventListener('uif:router-error', errors);
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => new Promise<Response>((resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      if (url.endsWith('/two')) resolve(new Response('too long'));
    })));
    const dispose = initRouter(document, { maxHTMLLength: 3 });
    document.querySelector<HTMLAnchorElement>('#one')?.click();
    await Promise.resolve();
    document.querySelector<HTMLAnchorElement>('#two')?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(errors).toHaveBeenCalledOnce();
    expect((errors.mock.calls[0]?.[0] as CustomEvent).detail.error.message).toBe('UIF_ROUTE_LIMIT');
    dispose();
    window.removeEventListener('uif:router-error', errors);
  });
});
