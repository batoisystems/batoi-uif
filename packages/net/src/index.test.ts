import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindConnector, cancelRequest, get, post, request, upload, useRequestInterceptor } from './index.js';

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

  it('retries only transient idempotent requests with a bounded count', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetch);
    await expect(request('/retry', { method: 'GET', retries: 20, retryDelay: 0 })).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);

    fetch.mockClear();
    fetch.mockResolvedValue(new Response('busy', { status: 503 }));
    await expect(request('/mutation', { method: 'POST', retries: 2, retryDelay: 0 })).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('does not retry permanent client errors and allows explicit idempotent mutations', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('invalid', { status: 400 }));
    vi.stubGlobal('fetch', fetch);
    await expect(request('/invalid', { method: 'GET', retries: 2, retryDelay: 0 })).rejects.toMatchObject({ status: 400 });
    expect(fetch).toHaveBeenCalledOnce();

    fetch.mockReset().mockResolvedValueOnce(new Response('busy', { status: 503 })).mockResolvedValueOnce(Response.json({ saved: true }));
    await expect(request('/put', { method: 'PUT', idempotent: true, retries: 1, retryDelay: 0 })).resolves.toEqual({ saved: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('preserves framework cancellation when an interceptor returns options', async () => {
    vi.useFakeTimers();
    const dispose = useRequestInterceptor(() => ({ headers: { accept: 'application/json' } }));
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      (options?.signal as AbortSignal).addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const pending = request('/slow-intercepted', { timeout: 10 });
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    dispose();
    vi.useRealTimers();
  });

  it('composes caller cancellation with framework request ownership', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      (options?.signal as AbortSignal).addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const pending = request('/owned', { signal: controller.signal });
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
  });

  it('keeps the newest keyed request cancellable after the superseded request settles', async () => {
    const signals: AbortSignal[] = [];
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      const signal = options?.signal as AbortSignal;
      signals.push(signal);
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const first = request('/first', { key: 'shared' });
    const firstAssertion = expect(first).rejects.toMatchObject({ name: 'AbortError' });
    const second = request('/second', { key: 'shared' });
    const secondAssertion = expect(second).rejects.toMatchObject({ name: 'AbortError' });
    await firstAssertion;
    expect(signals[1]?.aborted).toBe(false);
    cancelRequest('shared');
    await secondAssertion;
    expect(signals[1]?.aborted).toBe(true);
  });

  it('rejects failed progress uploads with normalized status and response data', async () => {
    class FakeXHR extends EventTarget {
      upload = new EventTarget();
      responseText = '{"error":"too large"}';
      status = 413;
      timeout = 0;
      withCredentials = false;
      open() {}
      setRequestHeader() {}
      send() { this.dispatchEvent(new Event('load')); }
      abort() { this.dispatchEvent(new Event('abort')); }
    }
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
    await expect(upload('/upload', new FormData(), { onUploadProgress: vi.fn() })).rejects.toMatchObject({ status: 413, data: { error: 'too large' } });
  });

  it('prevents overlapping connector polls and reports failures', async () => {
    vi.useFakeTimers();
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetch = vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const onError = vi.fn();
    const stop = bindConnector({ type: 'json', src: '/feed', refreshInterval: 10 }, vi.fn(), { onError });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetch).toHaveBeenCalledOnce();
    resolveFetch?.(new Response('failed', { status: 500 }));
    await vi.advanceTimersByTimeAsync(0);
    expect(onError).toHaveBeenCalledOnce();
    stop();
    vi.useRealTimers();
  });
});
