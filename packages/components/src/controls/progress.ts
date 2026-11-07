import type { ComponentInstance } from '../controller.js';
export function initProgress(el: HTMLElement): ComponentInstance {
  const value = Number(el.dataset.uifValue || el.getAttribute('aria-valuenow') || 0);
  const max = Number(el.dataset.uifMax || el.getAttribute('aria-valuemax') || 100);
  el.setAttribute('role', 'progressbar');
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', String(max));
  el.setAttribute('aria-valuenow', String(value));
  el.style.setProperty('--uif-progress', `${Math.max(0, Math.min(100, (value / max) * 100))}%`);
  return { destroy: () => undefined };
}
