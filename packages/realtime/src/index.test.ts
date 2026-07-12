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
    connect({ channel: 'retry', src: '/events', mode: 'poll', interval: 20, backoff: 10, maxBackoff: 20, jitter: 0 });
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
    const controller = initRealtime(feed);
    publishLocal('safe', { message: '<img src=x onerror=alert(1)>' });
    expect(feed.querySelector('img')).toBeNull();
    expect(feed.textContent).toContain('<img src=x onerror=alert(1)>');
    controller?.destroy();
  });

  it('tears down repeated declarative initialization and supports refresh/destroy', () => {
    document.body.innerHTML = '<div data-uif="realtime" data-uif-channel="lifecycle"></div>';
    const feed = document.querySelector('[data-uif="realtime"]') as HTMLElement;
    const first = initRealtime(feed);
    const second = initRealtime(feed);

    publishLocal('lifecycle', 'One');
    expect(feed.querySelectorAll('.uif-feed-item')).toHaveLength(1);
    second?.refresh();
    publishLocal('lifecycle', 'Two');
    expect(feed.querySelectorAll('.uif-feed-item')).toHaveLength(1);
    expect(feed.textContent).toBe('Two');

    first?.destroy();
    second?.destroy();
    publishLocal('lifecycle', 'Three');
    expect(feed.textContent).toBe('Two');
    expect(getConnectionState('lifecycle')).toBe('disconnected');
  });

  it('blocks unsafe cross-origin realtime endpoints by default', () => {
    const error = vi.fn();
    window.addEventListener('uif:realtime-error', error);
    connect({ channel: 'unsafe', src: 'https://evil.example/events', mode: 'poll' });
    expect(getConnectionState('unsafe')).toBe('failed');
    expect(error).toHaveBeenCalledOnce();
    window.removeEventListener('uif:realtime-error', error);
    disconnect('unsafe');
  });

  it('rejects oversized remote payloads without publishing them', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const error = vi.fn();
    subscribe('oversized', fn);
    window.addEventListener('uif:realtime-error', error);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ message: 'This payload is too large' })));

    connect({ channel: 'oversized', src: '/events', mode: 'poll', interval: 100, maxPayloadBytes: 10 });
    await vi.advanceTimersByTimeAsync(0);

    expect(fn).not.toHaveBeenCalled();
    expect(getConnectionState('oversized')).toBe('degraded');
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ maxPayloadBytes: 10 }) }));
    window.removeEventListener('uif:realtime-error', error);
    disconnect('oversized');
    vi.useRealTimers();
  });

  it('stops reconnecting after the configured attempt limit', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetch);

    connect({ channel: 'limited-retry', src: '/events', mode: 'poll', backoff: 10, jitter: 0, maxReconnectAttempts: 1 });
    await vi.advanceTimersByTimeAsync(0);
    expect(getConnectionState('limited-retry')).toBe('reconnecting');
    await vi.advanceTimersByTimeAsync(10);
    await vi.advanceTimersByTimeAsync(0);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(getConnectionState('limited-retry')).toBe('failed');
    disconnect('limited-retry');
    vi.useRealTimers();
  });

  it('defers reconnect while the document is hidden and resumes when visible', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetch);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });

    connect({ channel: 'visibility', src: '/events', mode: 'poll', backoff: 10, jitter: 0 });
    await vi.advanceTimersByTimeAsync(0);
    expect(getConnectionState('visibility')).toBe('stale');
    expect(fetch).toHaveBeenCalledOnce();

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(getConnectionState('visibility')).toBe('connected');
    disconnect('visibility');
    vi.useRealTimers();
  });
});
