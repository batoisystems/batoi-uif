import { describe, expect, it, vi } from 'vitest';
import { connect, disconnect, initRealtime, publishLocal, subscribe } from './index.js';

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
