// src/index.ts
var deferredPrompt = null;
var offlineQueue = [];
async function registerServiceWorker(path = "/sw.js") {
  if (!("serviceWorker" in navigator)) return void 0;
  return navigator.serviceWorker.register(path);
}
async function unregisterServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((registration) => registration.unregister()));
}
function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });
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
var cacheStrategies = {
  networkFirst: "fetch(event.request).catch(() => caches.match(event.request))",
  cacheFirst: "caches.match(event.request).then((cached) => cached || fetch(event.request))",
  staleWhileRevalidate: "caches.match(event.request).then((cached) => { const fresh = fetch(event.request); return cached || fresh; })"
};
function createCacheStrategy(name) {
  return cacheStrategies[name];
}
function queueOfflineTask(task) {
  offlineQueue.push(task);
}
async function flushOfflineQueue() {
  while (offlineQueue.length) await offlineQueue.shift()?.();
}
function initOfflineQueue() {
  const flush = () => void flushOfflineQueue();
  window.addEventListener("online", flush);
  return () => window.removeEventListener("online", flush);
}
function onAppUpdate(handler) {
  if (!("serviceWorker" in navigator)) return () => void 0;
  const listener = () => {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) handler(registration);
    });
  };
  navigator.serviceWorker.addEventListener("controllerchange", listener);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", listener);
}
function initInstallPrompt(el) {
  const prompt = setupInstallPrompt();
  el.addEventListener("click", () => void prompt());
}
export {
  cacheStrategies,
  createCacheStrategy,
  flushOfflineQueue,
  initInstallPrompt,
  initOfflineQueue,
  onAppUpdate,
  onNetworkChange,
  onOffline,
  onOnline,
  queueOfflineTask,
  registerServiceWorker,
  setupInstallPrompt,
  unregisterServiceWorker
};
