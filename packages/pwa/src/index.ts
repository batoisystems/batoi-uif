let deferredPrompt: BeforeInstallPromptEvent | null = null;
const offlineQueue: Array<() => Promise<void>> = [];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

export async function registerServiceWorker(path = '/sw.js'): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.register(path);
}

export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((registration) => registration.unregister()));
}

export function setupInstallPrompt(): () => Promise<void> {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
  });
  return async () => {
    await deferredPrompt?.prompt();
  };
}

export function onOnline(handler: () => void): () => void {
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}

export function onOffline(handler: () => void): () => void {
  window.addEventListener('offline', handler);
  return () => window.removeEventListener('offline', handler);
}

export function onNetworkChange(handler: (online: boolean) => void): () => void {
  const up = () => handler(true);
  const down = () => handler(false);
  window.addEventListener('online', up);
  window.addEventListener('offline', down);
  return () => {
    window.removeEventListener('online', up);
    window.removeEventListener('offline', down);
  };
}

export const cacheStrategies = {
  networkFirst: "fetch(event.request).catch(() => caches.match(event.request))",
  cacheFirst: "caches.match(event.request).then((cached) => cached || fetch(event.request))",
  staleWhileRevalidate:
    "caches.match(event.request).then((cached) => { const fresh = fetch(event.request); return cached || fresh; })",
};

export function createCacheStrategy(name: keyof typeof cacheStrategies): string {
  return cacheStrategies[name];
}

export function queueOfflineTask(task: () => Promise<void>): void {
  offlineQueue.push(task);
}

export async function flushOfflineQueue(): Promise<void> {
  while (offlineQueue.length) await offlineQueue.shift()?.();
}

export function initOfflineQueue(): () => void {
  const flush = () => void flushOfflineQueue();
  window.addEventListener('online', flush);
  return () => window.removeEventListener('online', flush);
}

export function onAppUpdate(handler: (registration: ServiceWorkerRegistration) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => undefined;
  const listener = () => {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) handler(registration);
    });
  };
  navigator.serviceWorker.addEventListener('controllerchange', listener);
  return () => navigator.serviceWorker.removeEventListener('controllerchange', listener);
}

export function initInstallPrompt(el: HTMLElement): void {
  const prompt = setupInstallPrompt();
  el.addEventListener('click', () => void prompt());
}
