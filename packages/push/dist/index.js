// src/index.ts
import { showToast } from "@batoi/uif-components";
import { registerServiceWorker } from "@batoi/uif-pwa";
var notifications = [];
function addNotification(item) {
  const notification = { ...item, id: item.id || `n-${Date.now()}-${notifications.length}` };
  notifications.unshift(notification);
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
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe(options);
}
async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}
async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}
function showInAppNotification(message, options = {}) {
  addNotification({ message, type: options.type ?? "info" });
  return showToast(message, { type: options.type ?? "info", dismissible: false });
}
async function postSubscription(src, payload) {
  if (!src) return;
  await fetch(src, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}
function initPush(el) {
  el.addEventListener("click", async () => {
    const action = el.dataset.uifAction || "notify";
    if (action === "subscribe") {
      const permission = await requestNotificationPermission();
      await postSubscription(el.dataset.uifSrc, { action, permission });
      showInAppNotification(permission === "granted" ? "Notifications enabled" : "Notification permission not granted");
    }
    if (action === "unsubscribe") {
      const ok = await unsubscribeFromPush();
      await postSubscription(el.dataset.uifSrc, { action, ok });
      showInAppNotification(ok ? "Notifications disabled" : "Unable to disable notifications");
    }
    if (action === "notify") showInAppNotification(el.dataset.uifMessage || el.textContent?.trim() || "Notification");
  });
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
