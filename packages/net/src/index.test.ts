import { afterEach, describe, expect, it, vi } from 'vitest';
import { get, post, request } from './index.js';

describe('net', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('performs GET and parses json', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ok: true })));
    await expect(get('/api')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api', expect.objectContaining({ method: 'GET' }));
  });

  it('posts json', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ saved: true })));
    await post('/save', { name: 'Ada' });
    expect(fetch).toHaveBeenCalledWith(
      '/save',
      expect.objectContaining({ method: 'POST', body: '{"name":"Ada"}' }),
    );
  });

  it('parses html responses as text', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>Partial</p>', { headers: { 'content-type': 'text/html' } })));
    await expect(get('/partial')).resolves.toBe('<p>Partial</p>');
  });

  it('aborts timed out requests', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            const signal = options?.signal as AbortSignal;
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          }),
      ),
    );
    const pending = request('/slow', { timeout: 10 });
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    vi.useRealTimers();
  });

  it('rejects failed responses with normalized status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    await expect(request('/fail')).rejects.toMatchObject({ status: 500 });
  });
});
