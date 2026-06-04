import { showToast } from '@batoi/uif-components';
import { registerServiceWorker } from '@batoi/uif-pwa';

export interface NotificationItem {
  id: string;
  message: string;
  read?: boolean;
  type?: string;
  data?: unknown;
}

const notifications: NotificationItem[] = [];

export function addNotification(item: Omit<NotificationItem, 'id'> & { id?: string }): NotificationItem {
  const notification = { ...item, id: item.id || `n-${Date.now()}-${notifications.length}` };
  notifications.unshift(notification);
  window.dispatchEvent(new CustomEvent('uif:notification', { detail: notification }));
  return notification;
}

export function getNotifications(): NotificationItem[] {
  return [...notifications];
}

export function unreadCount(): number {
  return notifications.filter((item) => !item.read).length;
}

export function markNotificationsRead(): void {
  notifications.forEach((item) => {
    item.read = true;
  });
}

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

export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}

export function showInAppNotification(message: string, options: { type?: string } = {}): HTMLElement {
  addNotification({ message, type: options.type ?? 'info' });
  return showToast(message, { type: options.type ?? 'info', dismissible: false });
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
