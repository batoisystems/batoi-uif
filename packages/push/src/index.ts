import { showToast } from '@batoi/uif-components';
import { registerServiceWorker } from '@batoi/uif-pwa';

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.requestPermission();
}

export async function registerPushServiceWorker(path = '/sw.js'): Promise<ServiceWorkerRegistration | undefined> {
  return registerServiceWorker(path);
}

export async function subscribeToPush(options: PushSubscriptionOptionsInit): Promise<PushSubscription | undefined> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe(options);
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}

export function showInAppNotification(message: string, options: { type?: string } = {}): HTMLElement {
  return showToast(message, { type: options.type ?? 'info' });
}

async function postSubscription(src: string | undefined, payload: unknown): Promise<void> {
  if (!src) return;
  await fetch(src, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function initPush(el: HTMLElement): void {
  el.addEventListener('click', async () => {
    const action = el.dataset.uifAction || 'notify';
    if (action === 'subscribe') {
      const permission = await requestNotificationPermission();
      await postSubscription(el.dataset.uifSrc, { action, permission });
      showInAppNotification(permission === 'granted' ? 'Notifications enabled' : 'Notification permission not granted');
    }
    if (action === 'unsubscribe') {
      const ok = await unsubscribeFromPush();
      await postSubscription(el.dataset.uifSrc, { action, ok });
      showInAppNotification(ok ? 'Notifications disabled' : 'Unable to disable notifications');
    }
    if (action === 'notify') showInAppNotification(el.dataset.uifMessage || el.textContent?.trim() || 'Notification');
  });
}

export const push = { name: 'push', init: initPush };
