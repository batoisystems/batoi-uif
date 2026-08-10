export interface UIFResourceScope {
  readonly signal: AbortSignal;
  readonly destroyed: boolean;
  add(dispose: () => void): () => void;
  listen(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): () => void;
  timeout(callback: () => void, delay: number): number;
  interval(callback: () => void, delay: number): number;
  observe(observer: { disconnect(): void }): void;
  destroy(): void;
}

export function createResourceScope(): UIFResourceScope {
  const controller = new AbortController();
  const disposers = new Set<() => void>();
  let destroyed = false;

  const add = (dispose: () => void): (() => void) => {
    if (destroyed) {
      dispose();
      return () => undefined;
    }
    let active = true;
    const ownedDispose = () => {
      if (!active) return;
      active = false;
      disposers.delete(ownedDispose);
      dispose();
    };
    disposers.add(ownedDispose);
    return ownedDispose;
  };

  return {
    signal: controller.signal,
    get destroyed() {
      return destroyed;
    },
    add,
    listen(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      return add(() => target.removeEventListener(type, listener, options));
    },
    timeout(callback, delay) {
      const id = globalThis.setTimeout(callback, Math.max(0, delay));
      add(() => globalThis.clearTimeout(id));
      return Number(id);
    },
    interval(callback, delay) {
      const id = globalThis.setInterval(callback, Math.max(1, delay));
      add(() => globalThis.clearInterval(id));
      return Number(id);
    },
    observe(observer) {
      add(() => observer.disconnect());
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      controller.abort();
      Array.from(disposers).reverse().forEach((dispose) => dispose());
      disposers.clear();
    },
  };
}
