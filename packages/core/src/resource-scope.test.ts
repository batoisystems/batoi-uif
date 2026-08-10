import { describe, expect, it, vi } from 'vitest';
import { createResourceScope } from './resource-scope.js';

describe('resource scope', () => {
  it('owns abort, listener, timer, observer, and custom cleanup', () => {
    vi.useFakeTimers();
    const scope = createResourceScope();
    const target = new EventTarget();
    const listener = vi.fn();
    const dispose = vi.fn();
    const disconnect = vi.fn();
    scope.listen(target, 'update', listener);
    scope.timeout(listener, 10);
    scope.interval(listener, 20);
    scope.observe({ disconnect });
    scope.add(dispose);

    target.dispatchEvent(new Event('update'));
    expect(listener).toHaveBeenCalledTimes(1);
    scope.destroy();
    scope.destroy();
    target.dispatchEvent(new Event('update'));
    vi.runAllTimers();

    expect(scope.signal.aborted).toBe(true);
    expect(scope.destroyed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('immediately disposes resources added after destruction', () => {
    const scope = createResourceScope();
    const dispose = vi.fn();
    scope.destroy();
    scope.add(dispose);
    expect(dispose).toHaveBeenCalledOnce();
  });
});
