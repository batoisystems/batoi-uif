export function initMobileShell(el: HTMLElement): void {
  el.classList.add('uif-mobile-shell');
  el.querySelector('[data-uif-role="topbar"]')?.classList.add('uif-mobile-topbar');
  el.querySelector('[data-uif-role="content"]')?.classList.add('uif-mobile-content');
  el.querySelector('[data-uif-role="bottom-nav"]')?.classList.add('uif-mobile-bottom-nav');
  el.querySelectorAll<HTMLElement>('[data-uif-role="sheet"]').forEach(initSheetModal);
  el.querySelectorAll<HTMLElement>('[data-uif-role="swipe-action"]').forEach(initSwipeAction);
  el.querySelectorAll<HTMLElement>('[data-uif-role="pull-to-refresh"]').forEach(initPullToRefresh);
}

export function showOfflineBanner(message = 'Offline'): HTMLElement {
  const banner = document.createElement('div');
  banner.className = 'uif-offline-banner';
  banner.textContent = message;
  banner.setAttribute('role', 'status');
  document.body.prepend(banner);
  return banner;
}

export function initSegmentedControl(el: HTMLElement): void {
  el.setAttribute('role', 'tablist');
  el.querySelectorAll<HTMLElement>('[data-uif-role="segment"]').forEach((segment, index) => {
    segment.setAttribute('role', 'tab');
    segment.setAttribute('aria-selected', String(index === 0));
  });
}

export function initSheetModal(el: HTMLElement): void {
  el.classList.add('uif-sheet-modal');
  el.setAttribute('role', el.getAttribute('role') || 'dialog');
  el.setAttribute('aria-modal', 'true');
}

export function initSwipeAction(el: HTMLElement): void {
  el.classList.add('uif-swipe-action');
  el.dataset.uifState = el.dataset.uifState || 'idle';
}

export function initPullToRefresh(el: HTMLElement): void {
  el.classList.add('uif-pull-to-refresh');
  el.dataset.uifState = el.dataset.uifState || 'idle';
}

export const mobileShell = { name: 'mobile-shell', init: initMobileShell };
