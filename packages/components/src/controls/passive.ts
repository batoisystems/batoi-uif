import type { ComponentInstance } from '../controller.js';
export function initPassive(el: HTMLElement): ComponentInstance {
  if (el.dataset.uif === 'table') el.setAttribute('role', el.getAttribute('role') || 'table');
  if (el.dataset.uif === 'nav') el.setAttribute('role', el.getAttribute('role') || 'navigation');
  return { destroy: () => undefined };
}
