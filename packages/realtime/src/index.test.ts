import { describe, expect, it, vi } from 'vitest';
import { connect, disconnect, publishLocal, subscribe } from './index.js';

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
});
