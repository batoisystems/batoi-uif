import { describe, expect, it, vi } from 'vitest';
import { cacheStrategies, flushOfflineQueue, initInstallPrompt, isCacheableRequest, isCacheableResponse, onAppUpdate, onNetworkChange, queueOfflineTask, registerServiceWorker, setupInstallPrompt, type OfflineTaskOptions } from './index.js';

describe('pwa', () => {
  it('exposes cache strategies and network change cleanup', () => {
    const fn = vi.fn();
    const off = onNetworkChange(fn);
    window.dispatchEvent(new Event('online'));
    off();
    expect(fn).toHaveBeenCalledWith(true);
    expect(cacheStrategies.networkFirst).toContain('fetch');
  });

  it('captures install prompt event', async () => {
    const prompt = vi.fn(async () => undefined);
    const runPrompt = setupInstallPrompt();
    const event = new Event('beforeinstallprompt') as Event & { prompt: typeof prompt };
    event.prompt = prompt;
    window.dispatchEvent(event);
    await runPrompt();
    expect(prompt).toHaveBeenCalled();
  });

  it('owns install button listeners through an idempotent disposer', async () => {
    const prompt = vi.fn(async () => undefined);
    const event = new Event('beforeinstallprompt') as Event & { prompt: typeof prompt };
    event.prompt = prompt;
    window.dispatchEvent(event);
    const button = document.createElement('button');
    const dispose = initInstallPrompt(button);
    expect(initInstallPrompt(button)).toBe(dispose);

    button.click();
    await Promise.resolve();
    expect(prompt).toHaveBeenCalledOnce();
    dispose();
    button.click();
    await Promise.resolve();
    expect(prompt).toHaveBeenCalledOnce();
  });

  it('blocks cross-origin service worker URLs', async () => {
    await expect(registerServiceWorker('https://evil.example/sw.js')).rejects.toThrow(/unsafe service worker URL/);
    await expect(registerServiceWorker('/sw.js', { scope: 'https://evil.example/' })).rejects.toThrow(/unsafe service worker scope/);
  });

  it('registers service workers with explicit safe scope and no script caching', async () => {
    const register = vi.fn(async () => ({}) as ServiceWorkerRegistration);
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });

    await registerServiceWorker('/sw.js', { scope: '/app/', updateViaCache: 'imports' });

    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/app/', updateViaCache: 'imports' });
  });

  it('only treats same-origin public GET responses as cacheable', () => {
    const local = (path: string) => new URL(path, window.location.href);
    expect(isCacheableRequest(new Request(local('/assets/app.js')))).toBe(true);
    expect(isCacheableRequest(new Request(local('/api'), { method: 'POST' }))).toBe(false);
    expect(isCacheableRequest(new Request(local('/private'), { headers: { authorization: 'Bearer token' } }))).toBe(false);
    expect(isCacheableRequest(new Request('https://evil.example/app.js'))).toBe(false);
    expect(isCacheableResponse(new Response('ok', { status: 200, headers: { 'cache-control': 'public, max-age=60' } }))).toBe(true);
    expect(isCacheableResponse(new Response('private', { status: 200, headers: { 'cache-control': 'private, max-age=60' } }))).toBe(false);
    expect(isCacheableResponse(new Response('unspecified'))).toBe(false);
  });

  it('requires bounded idempotent offline tasks, deduplicates keys, and limits retries', async () => {
    const oldTask = vi.fn(async () => undefined);
    const latestTask = vi.fn(async () => undefined);
    expect(() => queueOfflineTask(oldTask, {} as OfflineTaskOptions)).toThrow('explicitly idempotent');
    queueOfflineTask(oldTask, { idempotent: true, key: 'save' });
    queueOfflineTask(latestTask, { idempotent: true, key: 'save' });
    await flushOfflineQueue();
    expect(oldTask).not.toHaveBeenCalled();
    expect(latestTask).toHaveBeenCalledOnce();

    const retry = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const errors = vi.fn();
    window.addEventListener('uif:offline-error', errors);
    queueOfflineTask(retry, { idempotent: true, key: 'retry', maxAttempts: 2 });
    await flushOfflineQueue();
    expect(errors).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ attempts: 1, retrying: true }) }));
    await flushOfflineQueue();
    expect(retry).toHaveBeenCalledTimes(2);
    window.removeEventListener('uif:offline-error', errors);
  });

  it('reports waiting and newly installed service workers and disposes its listeners', async () => {
    const worker = new EventTarget() as ServiceWorker;
    Object.defineProperty(worker, 'state', { configurable: true, value: 'installing' });
    const registration = new EventTarget() as ServiceWorkerRegistration;
    Object.defineProperties(registration, {
      installing: { configurable: true, value: null },
      waiting: { configurable: true, value: {} },
    });
    const serviceWorker = new EventTarget() as ServiceWorkerContainer;
    Object.defineProperties(serviceWorker, {
      controller: { configurable: true, value: {} },
      ready: { configurable: true, value: Promise.resolve(registration) },
    });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: serviceWorker });
    const handler = vi.fn();
    const dispose = onAppUpdate(handler);
    await Promise.resolve();
    expect(handler).toHaveBeenCalledOnce();

    Object.defineProperties(registration, {
      installing: { configurable: true, value: worker },
      waiting: { configurable: true, value: {} },
    });
    registration.dispatchEvent(new Event('updatefound'));
    Object.defineProperty(worker, 'state', { configurable: true, value: 'installed' });
    worker.dispatchEvent(new Event('statechange'));
    expect(handler).toHaveBeenCalledTimes(2);

    dispose();
    worker.dispatchEvent(new Event('statechange'));
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
