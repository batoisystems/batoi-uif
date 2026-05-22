export function initMobileShell(el: HTMLElement): void {
  el.classList.add('uif-mobile-shell');
  el.querySelector('[data-uif-role="topbar"]')?.classList.add('uif-mobile-topbar');
  el.querySelector('[data-uif-role="content"]')?.classList.add('uif-mobile-content');
  el.querySelector('[data-uif-role="bottom-nav"]')?.classList.add('uif-mobile-bottom-nav');
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

export const mobileShell = { name: 'mobile-shell', init: initMobileShell };
