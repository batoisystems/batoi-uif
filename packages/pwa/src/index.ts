import { isSafeURL } from '@batoi/uif-dom';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installPromptListening = false;
interface OfflineQueueEntry {
  attempts: number;
  key?: string;
  maxAttempts: number;
  task: () => Promise<void>;
}

export interface OfflineTaskOptions {
  idempotent: true;
  key?: string;
  maxAttempts?: number;
}

export interface ServiceWorkerOptions {
  scope?: string;
  updateViaCache?: ServiceWorkerUpdateViaCache;
}

const offlineQueue: OfflineQueueEntry[] = [];
const installPromptDisposers = new WeakMap<HTMLElement, () => void>();

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

export async function registerServiceWorker(path = '/sw.js', options: ServiceWorkerOptions = {}): Promise<ServiceWorkerRegistration | undefined> {
  if (!isSafeURL(path, { context: 'network', allowHash: false, sameOrigin: true })) throw new Error('Batoi UIF blocked an unsafe service worker URL');
  if (options.scope && !isSafeURL(options.scope, { context: 'navigation', allowHash: false, sameOrigin: true })) throw new Error('Batoi UIF blocked an unsafe service worker scope');
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.register(path, { scope: options.scope, updateViaCache: options.updateViaCache ?? 'none' });
}

export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((registration) => registration.unregister()));
}

export function setupInstallPrompt(): () => Promise<void> {
  if (!installPromptListening) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
    });
    installPromptListening = true;
  }
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

const cacheFirstStrategy = "event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request).then((cached) => cached || fetch(event.request)) : fetch(event.request)";

export const cacheStrategies = {
  networkFirst: "fetch(event.request).catch(() => event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request) : Promise.reject(new Error('uncacheable request')))",
  cacheFirst: cacheFirstStrategy,
  staleWhileRevalidate:
    "event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request).then((cached) => { const fresh = fetch(event.request); return cached || fresh; }) : fetch(event.request)",
};

export function createCacheStrategy(name: keyof typeof cacheStrategies): string {
  return cacheStrategies[name];
}

export function isCacheableRequest(request: Request): boolean {
  return request.method === 'GET' && !request.headers.has('authorization') && isSafeURL(request.url, { context: 'network', allowHash: false, sameOrigin: true });
}

export function isCacheableResponse(response: Response): boolean {
  const cacheControl = response.headers.get('cache-control')?.toLowerCase() ?? '';
  return response.ok && !cacheControl.includes('private') && !cacheControl.includes('no-store') && (cacheControl.includes('public') || cacheControl.includes('max-age='));
}

export function queueOfflineTask(task: () => Promise<void>, options: OfflineTaskOptions): void {
  if (!options?.idempotent) throw new Error('Offline tasks must be explicitly idempotent');
  if (offlineQueue.length >= 100) throw new Error('Offline queue exceeds the 100 task limit');
  if (options.key) {
    const existing = offlineQueue.findIndex((entry) => entry.key === options.key);
    if (existing >= 0) offlineQueue.splice(existing, 1);
  }
  offlineQueue.push({ task, key: options.key, attempts: 0, maxAttempts: Math.max(1, Math.min(10, Math.floor(options.maxAttempts ?? 3))) });
  window.dispatchEvent(new CustomEvent('uif:offline-queued', { detail: { key: options.key, size: offlineQueue.length } }));
}

export async function flushOfflineQueue(): Promise<void> {
  const pending = offlineQueue.splice(0);
  for (const entry of pending) {
    try {
      entry.attempts += 1;
      await entry.task();
      window.dispatchEvent(new CustomEvent('uif:offline-synced', { detail: { key: entry.key, attempts: entry.attempts } }));
    } catch (error) {
      if (entry.attempts < entry.maxAttempts) offlineQueue.push(entry);
      window.dispatchEvent(new CustomEvent('uif:offline-error', { detail: { key: entry.key, attempts: entry.attempts, retrying: entry.attempts < entry.maxAttempts, error } }));
    }
  }
}

export function initOfflineQueue(): () => void {
  const flush = () => void flushOfflineQueue();
  window.addEventListener('online', flush);
  return () => window.removeEventListener('online', flush);
}

export function onAppUpdate(handler: (registration: ServiceWorkerRegistration) => void): () => void {
  if (!('serviceWorker' in navigator)) return () => undefined;
  let disposed = false;
  let registration: ServiceWorkerRegistration | undefined;
  let installing: ServiceWorker | null = null;
  const notify = () => {
    if (!disposed && registration?.waiting) handler(registration);
  };
  const onStateChange = () => {
    if (installing?.state === 'installed' && navigator.serviceWorker.controller) notify();
  };
  const onUpdateFound = () => {
    installing?.removeEventListener('statechange', onStateChange);
    installing = registration?.installing ?? null;
    installing?.addEventListener('statechange', onStateChange);
  };
  void navigator.serviceWorker.ready.then((readyRegistration) => {
    if (disposed) return;
    registration = readyRegistration;
    registration.addEventListener('updatefound', onUpdateFound);
    notify();
  });
  return () => {
    disposed = true;
    installing?.removeEventListener('statechange', onStateChange);
    registration?.removeEventListener('updatefound', onUpdateFound);
  };
}

export function initInstallPrompt(el: HTMLElement): () => void {
  const existing = installPromptDisposers.get(el);
  if (existing) return existing;
  const prompt = setupInstallPrompt();
  const listener = () => void prompt();
  el.addEventListener('click', listener);
  const dispose = () => {
    el.removeEventListener('click', listener);
    if (installPromptDisposers.get(el) === dispose) installPromptDisposers.delete(el);
  };
  installPromptDisposers.set(el, dispose);
  return dispose;
}
