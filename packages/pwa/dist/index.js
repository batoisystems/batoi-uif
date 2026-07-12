// src/index.ts
import { isSafeURL } from "@batoi/uif-dom";
var deferredPrompt = null;
var installPromptListening = false;
var offlineQueue = [];
var installPromptDisposers = /* @__PURE__ */ new WeakMap();
async function registerServiceWorker(path = "/sw.js", options = {}) {
  if (!isSafeURL(path, { context: "network", allowHash: false, sameOrigin: true })) throw new Error("Batoi UIF blocked an unsafe service worker URL");
  if (options.scope && !isSafeURL(options.scope, { context: "navigation", allowHash: false, sameOrigin: true })) throw new Error("Batoi UIF blocked an unsafe service worker scope");
  if (!("serviceWorker" in navigator)) return void 0;
  return navigator.serviceWorker.register(path, { scope: options.scope, updateViaCache: options.updateViaCache ?? "none" });
}
async function unregisterServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((registration) => registration.unregister()));
}
function setupInstallPrompt() {
  if (!installPromptListening) {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
    });
    installPromptListening = true;
  }
  return async () => {
    await deferredPrompt?.prompt();
  };
}
function onOnline(handler) {
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
function onOffline(handler) {
  window.addEventListener("offline", handler);
  return () => window.removeEventListener("offline", handler);
}
function onNetworkChange(handler) {
  const up = () => handler(true);
  const down = () => handler(false);
  window.addEventListener("online", up);
  window.addEventListener("offline", down);
  return () => {
    window.removeEventListener("online", up);
    window.removeEventListener("offline", down);
  };
}
var cacheFirstStrategy = "event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request).then((cached) => cached || fetch(event.request)) : fetch(event.request)";
var cacheStrategies = {
  networkFirst: "fetch(event.request).catch(() => event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request) : Promise.reject(new Error('uncacheable request')))",
  cacheFirst: cacheFirstStrategy,
  staleWhileRevalidate: "event.request.method === 'GET' && !event.request.headers.has('authorization') ? caches.match(event.request).then((cached) => { const fresh = fetch(event.request); return cached || fresh; }) : fetch(event.request)"
};
function createCacheStrategy(name) {
  return cacheStrategies[name];
}
function isCacheableRequest(request) {
  return request.method === "GET" && !request.headers.has("authorization") && isSafeURL(request.url, { context: "network", allowHash: false, sameOrigin: true });
}
function isCacheableResponse(response) {
  const cacheControl = response.headers.get("cache-control")?.toLowerCase() ?? "";
  return response.ok && !cacheControl.includes("private") && !cacheControl.includes("no-store") && (cacheControl.includes("public") || cacheControl.includes("max-age="));
}
function queueOfflineTask(task, options) {
  if (!options?.idempotent) throw new Error("Offline tasks must be explicitly idempotent");
  if (offlineQueue.length >= 100) throw new Error("Offline queue exceeds the 100 task limit");
  if (options.key) {
    const existing = offlineQueue.findIndex((entry) => entry.key === options.key);
    if (existing >= 0) offlineQueue.splice(existing, 1);
  }
  offlineQueue.push({ task, key: options.key, attempts: 0, maxAttempts: Math.max(1, Math.min(10, Math.floor(options.maxAttempts ?? 3))) });
  window.dispatchEvent(new CustomEvent("uif:offline-queued", { detail: { key: options.key, size: offlineQueue.length } }));
}
async function flushOfflineQueue() {
  const pending = offlineQueue.splice(0);
  for (const entry of pending) {
    try {
      entry.attempts += 1;
      await entry.task();
      window.dispatchEvent(new CustomEvent("uif:offline-synced", { detail: { key: entry.key, attempts: entry.attempts } }));
    } catch (error) {
      if (entry.attempts < entry.maxAttempts) offlineQueue.push(entry);
      window.dispatchEvent(new CustomEvent("uif:offline-error", { detail: { key: entry.key, attempts: entry.attempts, retrying: entry.attempts < entry.maxAttempts, error } }));
    }
  }
}
function initOfflineQueue() {
  const flush = () => void flushOfflineQueue();
  window.addEventListener("online", flush);
  return () => window.removeEventListener("online", flush);
}
function onAppUpdate(handler) {
  if (!("serviceWorker" in navigator)) return () => void 0;
  let disposed = false;
  let registration;
  let installing = null;
  const notify = () => {
    if (!disposed && registration?.waiting) handler(registration);
  };
  const onStateChange = () => {
    if (installing?.state === "installed" && navigator.serviceWorker.controller) notify();
  };
  const onUpdateFound = () => {
    installing?.removeEventListener("statechange", onStateChange);
    installing = registration?.installing ?? null;
    installing?.addEventListener("statechange", onStateChange);
  };
  void navigator.serviceWorker.ready.then((readyRegistration) => {
    if (disposed) return;
    registration = readyRegistration;
    registration.addEventListener("updatefound", onUpdateFound);
    notify();
  });
  return () => {
    disposed = true;
    installing?.removeEventListener("statechange", onStateChange);
    registration?.removeEventListener("updatefound", onUpdateFound);
  };
}
function initInstallPrompt(el) {
  const existing = installPromptDisposers.get(el);
  if (existing) return existing;
  const prompt = setupInstallPrompt();
  const listener = () => void prompt();
  el.addEventListener("click", listener);
  const dispose = () => {
    el.removeEventListener("click", listener);
    if (installPromptDisposers.get(el) === dispose) installPromptDisposers.delete(el);
  };
  installPromptDisposers.set(el, dispose);
  return dispose;
}
export {
  cacheStrategies,
  createCacheStrategy,
  flushOfflineQueue,
  initInstallPrompt,
  initOfflineQueue,
  isCacheableRequest,
  isCacheableResponse,
  onAppUpdate,
  onNetworkChange,
  onOffline,
  onOnline,
  queueOfflineTask,
  registerServiceWorker,
  setupInstallPrompt,
  unregisterServiceWorker
};
