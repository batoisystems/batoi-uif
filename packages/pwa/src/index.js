let deferredPrompt = null;

export async function registerServiceWorker(path = '/sw.js') {
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.register(path);
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  return async () => {
    if (deferredPrompt?.prompt) await deferredPrompt.prompt();
  };
}

export function onNetworkChange(handler) {
  const up = () => handler(true);
  const down = () => handler(false);
  window.addEventListener('online', up);
  window.addEventListener('offline', down);
  return () => {
    window.removeEventListener('online', up);
    window.removeEventListener('offline', down);
  };
}
