export type UIFHydrationScope = 'root' | 'target' | 'refresh';

export interface UIFHydrationAdapter {
  name: string;
  scope: UIFHydrationScope;
  hydrate(root: Document | HTMLElement): void | (() => void);
}

export interface UIFHydrationLifecycle {
  refresh(target?: Document | HTMLElement): void;
  destroy(): void;
}

export function createHydrationLifecycle(
  root: Document | HTMLElement,
  adapters: readonly UIFHydrationAdapter[],
): UIFHydrationLifecycle {
  const rootDisposers = new Map<string, () => void>();
  const targetDisposers = new Map<Document | HTMLElement, Map<string, () => void>>();
  let destroyed = false;

  const run = (adapter: UIFHydrationAdapter, target: Document | HTMLElement): void => {
    if (adapter.scope === 'root') {
      if (rootDisposers.has(adapter.name)) return;
      const dispose = adapter.hydrate(root);
      rootDisposers.set(adapter.name, typeof dispose === 'function' ? dispose : () => undefined);
      return;
    }
    if (adapter.scope === 'refresh') {
      adapter.hydrate(target);
      return;
    }
    const entries = targetDisposers.get(target) ?? new Map<string, () => void>();
    entries.get(adapter.name)?.();
    const dispose = adapter.hydrate(target);
    entries.set(adapter.name, typeof dispose === 'function' ? dispose : () => undefined);
    targetDisposers.set(target, entries);
  };

  return {
    refresh(target = root) {
      if (destroyed) return;
      adapters.forEach((adapter) => run(adapter, target));
    },
    destroy() {
      if (destroyed) return;
      targetDisposers.forEach((entries) => entries.forEach((dispose) => dispose()));
      rootDisposers.forEach((dispose) => dispose());
      targetDisposers.clear();
      rootDisposers.clear();
      destroyed = true;
    },
  };
}
