import { describe, expect, it, vi } from 'vitest';
import { connect, disconnect, getConnectionState, initRealtime, publishLocal, subscribe } from './index.js';

describe('realtime', () => {
  it('publishes local events to subscribers', () => {
    const fn = vi.fn();
    subscribe('demo', fn);
    publishLocal('demo', { ok: true });
    expect(fn).toHaveBeenCalledWith({ ok: true });
  });

  it('polls a source without websocket support', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ id: 1 }])));
    subscribe('poll', fn);
    connect({ channel: 'poll', src: '/events', mode: 'poll', interval: 10 });
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).toHaveBeenCalledWith([{ id: 1 }]);
    disconnect('poll');
    vi.useRealTimers();
  });

  it('emits message lifecycle events', () => {
    const listener = vi.fn();
    window.addEventListener('uif:realtime-message', listener);
    publishLocal('events', { message: 'hello' });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: { channel: 'events', payload: { message: 'hello' } } }));
    window.removeEventListener('uif:realtime-message', listener);
  });

  it('reconnects polling with backoff after request errors', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetch);
    connect({ channel: 'retry', src: '/events', mode: 'poll', interval: 20, backoff: 10, maxBackoff: 20 });
    await vi.advanceTimersByTimeAsync(0);
    expect(getConnectionState('retry')).toBe('reconnecting');
    await vi.advanceTimersByTimeAsync(10);
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(0);
    expect(getConnectionState('retry')).toBe('connected');
    disconnect('retry');
    vi.useRealTimers();
  });

  it('aborts in-flight polling requests on disconnect', async () => {
    vi.useFakeTimers();
    const aborted = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_url: string, init?: RequestInit) =>
          new Promise<Response>((resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              aborted();
              reject(new DOMException('Aborted', 'AbortError'));
            });
            window.setTimeout(() => resolve(Response.json({ ok: true })), 100);
          }),
      ),
    );
    connect({ channel: 'abort', src: '/events', mode: 'poll', interval: 100 });
    await vi.advanceTimersByTimeAsync(0);
    disconnect('abort');
    expect(aborted).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('renders payload text safely in declarative feeds', () => {
    document.body.innerHTML = '<div data-uif="realtime" data-uif-channel="safe"></div>';
    const feed = document.querySelector('[data-uif="realtime"]') as HTMLElement;
    initRealtime(feed);
    publishLocal('safe', { message: '<img src=x onerror=alert(1)>' });
    expect(feed.querySelector('img')).toBeNull();
    expect(feed.textContent).toContain('<img src=x onerror=alert(1)>');
    disconnect('safe');
  });
});
