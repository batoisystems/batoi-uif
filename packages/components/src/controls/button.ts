import type { ComponentInstance } from '../controller.js';
import { handleAction } from '../controller.js';
export function initButton(el: HTMLElement): ComponentInstance {
  el.addEventListener('click', handleAction);
  return { destroy: () => el.removeEventListener('click', handleAction) };
}
