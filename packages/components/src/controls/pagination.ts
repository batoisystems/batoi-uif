import type { ComponentInstance } from '../controller.js';
export function initPagination(el: HTMLElement): ComponentInstance {
  el.setAttribute('role', 'navigation');
  el.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('[data-uif-page]').forEach((item) => {
    const active =
      item.dataset.uifState === 'active' || item.getAttribute('aria-current') === 'page';
    item.setAttribute('aria-current', active ? 'page' : 'false');
  });
  return { destroy: () => undefined };
}
