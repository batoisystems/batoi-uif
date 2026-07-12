import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addNotification, getNotifications, initPush, showInAppNotification, subscribeToPush } from './index.js';

describe('push', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows in-app notifications', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = showInAppNotification('Hello');
    expect(el.textContent).toBe('Hello');
  });

  it('handles declarative notify action', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const button = document.createElement('button');
    button.dataset.uifAction = 'notify';
    button.dataset.uifMessage = 'Saved';
    const controller = initPush(button);
    expect(initPush(button)).toBe(controller);
    button.click();
    expect(document.querySelector('.uif-toast')?.textContent).toBe('Saved');
    const count = document.querySelectorAll('.uif-toast').length;
    controller.destroy();
    button.click();
    expect(document.querySelectorAll('.uif-toast')).toHaveLength(count);
  });

  it('blocks unsafe push subscription endpoints', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    vi.stubGlobal('Notification', { requestPermission: vi.fn(async () => 'granted') });
    const button = document.createElement('button');
    button.dataset.uifAction = 'subscribe';
    button.dataset.uifSrc = 'https://evil.example/push';
    const failed = new Promise<CustomEvent>((resolve) => button.addEventListener('uif:push-error', (event) => resolve(event as CustomEvent), { once: true }));
    const controller = initPush(button);

    button.click();

    expect((await failed).detail.error.message).toContain('unsafe push endpoint');
    expect(button.dataset.uifState).toBe('error');
    controller.destroy();
  });

  it('requires supported, permitted, user-visible push subscriptions', async () => {
    vi.stubGlobal('PushManager', class PushManager {});
    vi.stubGlobal('Notification', { permission: 'denied' });
    const subscribe = vi.fn();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { ready: Promise.resolve({ pushManager: { subscribe } }) },
    });
    await expect(subscribeToPush({ userVisibleOnly: true })).rejects.toThrow(/permission must be granted/);

    vi.stubGlobal('Notification', { permission: 'granted' });
    await expect(subscribeToPush({ userVisibleOnly: false })).rejects.toThrow(/visible notifications/);
    await subscribeToPush({ userVisibleOnly: true });
    expect(subscribe).toHaveBeenCalledWith({ userVisibleOnly: true });
  });

  it('bounds notification history and message length', () => {
    for (let index = 0; index < 105; index += 1) addNotification({ id: `bounded-${index}`, message: index === 104 ? 'x'.repeat(10_100) : `${index}` });
    const items = getNotifications();
    expect(items).toHaveLength(100);
    expect(items[0]?.message).toHaveLength(10_000);
  });
});
