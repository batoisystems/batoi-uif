let deferredPrompt: BeforeInstallPromptEvent | null = null;

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
