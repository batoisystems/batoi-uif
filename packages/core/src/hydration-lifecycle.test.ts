// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { createHydrationLifecycle, type UIFHydrationAdapter } from './hydration-lifecycle.js';

describe('hydration lifecycle', () => {
  it('owns root, target, and refresh adapter execution and cleanup', () => {
    const target = document.createElement('section');
    document.body.append(target);
    const calls: string[] = [];
    const adapters: UIFHydrationAdapter[] = [
      { name: 'root', scope: 'root', hydrate: () => { calls.push('root'); return () => calls.push('dispose-root'); } },
      { name: 'target', scope: 'target', hydrate: (value) => { calls.push(value === target ? 'target' : 'document'); return () => calls.push('dispose-target'); } },
      { name: 'refresh', scope: 'refresh', hydrate: () => calls.push('refresh') },
    ];
    const lifecycle = createHydrationLifecycle(document, adapters);
    lifecycle.refresh();
    lifecycle.refresh(target);
    lifecycle.refresh(target);
    expect(calls).toEqual(['root', 'document', 'refresh', 'target', 'refresh', 'dispose-target', 'target', 'refresh']);
    lifecycle.destroy();
    expect(calls).toEqual(expect.arrayContaining(['dispose-root', 'dispose-target']));
  });

  it('ignores refresh after destruction', () => {
    const hydrate = vi.fn();
    const lifecycle = createHydrationLifecycle(document, [{ name: 'refresh', scope: 'refresh', hydrate }]);
    lifecycle.destroy();
    lifecycle.refresh();
    expect(hydrate).not.toHaveBeenCalled();
  });
});
