export interface MobileController { refresh(): void; destroy(): void; }

const mobileControllers = new WeakMap<HTMLElement, MobileController>();
const segmentedControllers = new WeakMap<HTMLElement, MobileController>();
let offlineBanner: HTMLElement | null = null;

export function initMobileShell(el: HTMLElement): MobileController {
  const existing = mobileControllers.get(el);
  if (existing) return existing;
  const refresh = () => {
  el.classList.add('uif-mobile-shell');
  el.querySelector('[data-uif-role="topbar"]')?.classList.add('uif-mobile-topbar');
  el.querySelector('[data-uif-role="content"]')?.classList.add('uif-mobile-content');
    const nav = el.querySelector<HTMLElement>('[data-uif-role="bottom-nav"]');
    nav?.classList.add('uif-mobile-bottom-nav');
    if (nav && !nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'Primary');
  el.querySelectorAll<HTMLElement>('[data-uif-role="sheet"]').forEach(initSheetModal);
  el.querySelectorAll<HTMLElement>('[data-uif-role="swipe-action"]').forEach(initSwipeAction);
  el.querySelectorAll<HTMLElement>('[data-uif-role="pull-to-refresh"]').forEach(initPullToRefresh);
    el.querySelectorAll<HTMLElement>('[data-uif-role="segmented"]').forEach(initSegmentedControl);
  };
  refresh();
  const controller: MobileController = {
    refresh,
    destroy() {
      el.querySelectorAll<HTMLElement>('[data-uif-role="segmented"]').forEach((segmented) => segmentedControllers.get(segmented)?.destroy());
      if (mobileControllers.get(el) === controller) mobileControllers.delete(el);
    },
  };
  mobileControllers.set(el, controller);
  return controller;
}

export function showOfflineBanner(message = 'Offline'): HTMLElement {
  if (offlineBanner?.isConnected) {
    offlineBanner.textContent = message;
    return offlineBanner;
  }
  const banner = document.createElement('div');
  banner.className = 'uif-offline-banner';
  banner.textContent = message;
  banner.setAttribute('role', 'status');
  document.body.prepend(banner);
  offlineBanner = banner;
  return banner;
}

export function hideOfflineBanner(): void {
  offlineBanner?.remove();
  offlineBanner = null;
}

export function initSegmentedControl(el: HTMLElement): MobileController {
  const existing = segmentedControllers.get(el);
  if (existing) return existing;
  el.setAttribute('role', 'tablist');
  const segments = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="segment"]'));
  const select = (next: HTMLElement, focus = false, emit = true) => {
    segments.forEach((segment) => {
      const selected = segment === next;
      segment.setAttribute('aria-selected', String(selected));
      segment.tabIndex = selected ? 0 : -1;
    });
    if (focus) next.focus();
    if (emit) el.dispatchEvent(new CustomEvent('uif:segment-change', { detail: { segment: next, value: next.dataset.uifValue }, bubbles: true }));
  };
  const declared = segments.find((segment) => segment.getAttribute('aria-selected') === 'true') ?? segments[0];
  segments.forEach((segment) => segment.setAttribute('role', 'tab'));
  if (declared) select(declared, false, false);
  const onClick = (event: Event) => {
    const segment = (event.target as Element).closest<HTMLElement>('[data-uif-role="segment"]');
    if (segment && el.contains(segment)) select(segment);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const current = segments.indexOf(event.target as HTMLElement);
    if (current < 0) return;
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    let next = direction ? (current + direction + segments.length) % segments.length : event.key === 'Home' ? 0 : event.key === 'End' ? segments.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    select(segments[next]!, true);
  };
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKeyDown);
  const controller: MobileController = {
    refresh() {
      const selected = segments.find((segment) => segment.getAttribute('aria-selected') === 'true') ?? segments[0];
      if (selected) select(selected, false, false);
    },
    destroy() {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKeyDown);
      if (segmentedControllers.get(el) === controller) segmentedControllers.delete(el);
    },
  };
  segmentedControllers.set(el, controller);
  return controller;
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
