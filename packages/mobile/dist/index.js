// src/index.ts
function initMobileShell(el) {
  el.classList.add("uif-mobile-shell");
  el.querySelector('[data-uif-role="topbar"]')?.classList.add("uif-mobile-topbar");
  el.querySelector('[data-uif-role="content"]')?.classList.add("uif-mobile-content");
  el.querySelector('[data-uif-role="bottom-nav"]')?.classList.add("uif-mobile-bottom-nav");
  el.querySelectorAll('[data-uif-role="sheet"]').forEach(initSheetModal);
  el.querySelectorAll('[data-uif-role="swipe-action"]').forEach(initSwipeAction);
  el.querySelectorAll('[data-uif-role="pull-to-refresh"]').forEach(initPullToRefresh);
}
function showOfflineBanner(message = "Offline") {
  const banner = document.createElement("div");
  banner.className = "uif-offline-banner";
  banner.textContent = message;
  banner.setAttribute("role", "status");
  document.body.prepend(banner);
  return banner;
}
function initSegmentedControl(el) {
  el.setAttribute("role", "tablist");
  el.querySelectorAll('[data-uif-role="segment"]').forEach((segment, index) => {
    segment.setAttribute("role", "tab");
    segment.setAttribute("aria-selected", String(index === 0));
  });
}
function initSheetModal(el) {
  el.classList.add("uif-sheet-modal");
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.setAttribute("aria-modal", "true");
}
function initSwipeAction(el) {
  el.classList.add("uif-swipe-action");
  el.dataset.uifState = el.dataset.uifState || "idle";
}
function initPullToRefresh(el) {
  el.classList.add("uif-pull-to-refresh");
  el.dataset.uifState = el.dataset.uifState || "idle";
}
var mobileShell = { name: "mobile-shell", init: initMobileShell };
export {
  initMobileShell,
  initPullToRefresh,
  initSegmentedControl,
  initSheetModal,
  initSwipeAction,
  mobileShell,
  showOfflineBanner
};
