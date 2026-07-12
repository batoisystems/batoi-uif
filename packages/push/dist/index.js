// src/index.ts
import { showToast } from "@batoi/uif-components";
import { isSafeURL } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
import { registerServiceWorker } from "@batoi/uif-pwa";
var notifications = [];
var MAX_NOTIFICATIONS = 100;
var MAX_NOTIFICATION_MESSAGE_LENGTH = 1e4;
function requirePushSupport() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Push notifications are not supported");
  return navigator.serviceWorker;
}
function addNotification(item) {
  const message = String(item.message).slice(0, MAX_NOTIFICATION_MESSAGE_LENGTH);
  const notification = { ...item, message, id: item.id || `n-${Date.now()}-${notifications.length}` };
  notifications.unshift(notification);
  if (notifications.length > MAX_NOTIFICATIONS) notifications.length = MAX_NOTIFICATIONS;
  window.dispatchEvent(new CustomEvent("uif:notification", { detail: notification }));
  return notification;
}
function getNotifications() {
  return [...notifications];
}
function unreadCount() {
  return notifications.filter((item) => !item.read).length;
}
function markNotificationsRead() {
  notifications.forEach((item) => {
    item.read = true;
  });
}
async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}
async function registerPushServiceWorker(path = "/sw.js") {
  return registerServiceWorker(path);
}
async function subscribeToPush(options) {
  const serviceWorker = requirePushSupport();
  if (!("Notification" in window) || Notification.permission !== "granted") throw new Error("Notification permission must be granted before subscribing");
  if (options.userVisibleOnly !== true) throw new Error("Push subscriptions must require visible notifications");
  const registration = await serviceWorker.ready;
  return registration.pushManager.subscribe(options);
}
async function getPushSubscription() {
  const registration = await requirePushSupport().ready;
  return registration.pushManager.getSubscription();
}
async function unsubscribeFromPush() {
  const registration = await requirePushSupport().ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}
function showInAppNotification(message, options = {}) {
  addNotification({ message, type: options.type ?? "info" });
  return showToast(message, { type: options.type ?? "info", dismissible: false });
}
var pushControllers = /* @__PURE__ */ new WeakMap();
var pushSequence = 0;
async function postSubscription(src, payload, key) {
  if (!src) return;
  if (!isSafeURL(src, { context: "network", allowHash: false, sameOrigin: true })) throw new Error("Batoi UIF blocked an unsafe push endpoint");
  await request(src, {
    key,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
    timeout: 15e3
  });
}
function initPush(el) {
  const existing = pushControllers.get(el);
  if (existing) return existing;
  const key = `push:${++pushSequence}`;
  const listener = async () => {
    const action = el.dataset.uifAction || "notify";
    try {
      if (action === "subscribe") {
        const permission = await requestNotificationPermission();
        await postSubscription(el.dataset.uifSrc, { action, permission }, key);
        showInAppNotification(permission === "granted" ? "Notifications enabled" : "Notification permission not granted");
      }
      if (action === "unsubscribe") {
        const ok = await unsubscribeFromPush();
        await postSubscription(el.dataset.uifSrc, { action, ok }, key);
        showInAppNotification(ok ? "Notifications disabled" : "Unable to disable notifications");
      }
      if (action === "notify") showInAppNotification(el.dataset.uifMessage || el.textContent?.trim() || "Notification");
    } catch (error) {
      el.dataset.uifState = "error";
      el.dispatchEvent(new CustomEvent("uif:push-error", { detail: { error, action }, bubbles: true }));
    }
  };
  el.addEventListener("click", listener);
  const controller = {
    refresh() {
      el.dataset.uifState = "idle";
    },
    destroy() {
      el.removeEventListener("click", listener);
      cancelRequest(key);
      if (pushControllers.get(el) === controller) pushControllers.delete(el);
    }
  };
  pushControllers.set(el, controller);
  return controller;
}
var push = { name: "push", init: initPush };
export {
  addNotification,
  getNotifications,
  getPushSubscription,
  initPush,
  markNotificationsRead,
  push,
  registerPushServiceWorker,
  requestNotificationPermission,
  showInAppNotification,
  subscribeToPush,
  unreadCount,
  unsubscribeFromPush
};
