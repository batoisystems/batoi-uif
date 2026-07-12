import { showToast } from '@batoi/uif-components';
import { isSafeURL } from '@batoi/uif-dom';
import { cancelRequest, request } from '@batoi/uif-net';
import { registerServiceWorker } from '@batoi/uif-pwa';

export interface NotificationItem {
  id: string;
  message: string;
  read?: boolean;
  type?: string;
  data?: unknown;
}

const notifications: NotificationItem[] = [];
const MAX_NOTIFICATIONS = 100;
const MAX_NOTIFICATION_MESSAGE_LENGTH = 10_000;

function requirePushSupport(): ServiceWorkerContainer {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push notifications are not supported');
  return navigator.serviceWorker;
}

export function addNotification(item: Omit<NotificationItem, 'id'> & { id?: string }): NotificationItem {
  const message = String(item.message).slice(0, MAX_NOTIFICATION_MESSAGE_LENGTH);
  const notification = { ...item, message, id: item.id || `n-${Date.now()}-${notifications.length}` };
  notifications.unshift(notification);
  if (notifications.length > MAX_NOTIFICATIONS) notifications.length = MAX_NOTIFICATIONS;
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
  const serviceWorker = requirePushSupport();
  if (!('Notification' in window) || Notification.permission !== 'granted') throw new Error('Notification permission must be granted before subscribing');
  if (options.userVisibleOnly !== true) throw new Error('Push subscriptions must require visible notifications');
  const registration = await serviceWorker.ready;
  return registration.pushManager.subscribe(options);
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await requirePushSupport().ready;
  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await requirePushSupport().ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}

export function showInAppNotification(message: string, options: { type?: string } = {}): HTMLElement {
  addNotification({ message, type: options.type ?? 'info' });
  return showToast(message, { type: options.type ?? 'info', dismissible: false });
}

export interface PushController { refresh(): void; destroy(): void; }
const pushControllers = new WeakMap<HTMLElement, PushController>();
let pushSequence = 0;

async function postSubscription(src: string | undefined, payload: unknown, key: string): Promise<void> {
  if (!src) return;
  if (!isSafeURL(src, { context: 'network', allowHash: false, sameOrigin: true })) throw new Error('Batoi UIF blocked an unsafe push endpoint');
  await request(src, {
    key,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
    timeout: 15_000,
  });
}

export function initPush(el: HTMLElement): PushController {
  const existing = pushControllers.get(el);
  if (existing) return existing;
  const key = `push:${++pushSequence}`;
  const listener = async () => {
    const action = el.dataset.uifAction || 'notify';
    try {
      if (action === 'subscribe') {
        const permission = await requestNotificationPermission();
        await postSubscription(el.dataset.uifSrc, { action, permission }, key);
        showInAppNotification(permission === 'granted' ? 'Notifications enabled' : 'Notification permission not granted');
      }
      if (action === 'unsubscribe') {
        const ok = await unsubscribeFromPush();
        await postSubscription(el.dataset.uifSrc, { action, ok }, key);
        showInAppNotification(ok ? 'Notifications disabled' : 'Unable to disable notifications');
      }
      if (action === 'notify') showInAppNotification(el.dataset.uifMessage || el.textContent?.trim() || 'Notification');
    } catch (error) {
      el.dataset.uifState = 'error';
      el.dispatchEvent(new CustomEvent('uif:push-error', { detail: { error, action }, bubbles: true }));
    }
  };
  el.addEventListener('click', listener);
  const controller: PushController = {
    refresh() { el.dataset.uifState = 'idle'; },
    destroy() {
      el.removeEventListener('click', listener);
      cancelRequest(key);
      if (pushControllers.get(el) === controller) pushControllers.delete(el);
    },
  };
  pushControllers.set(el, controller);
  return controller;
}

export const push = { name: 'push', init: initPush };
