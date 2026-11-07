import { hide } from '@batoi/uif-effects';
import type { ComponentInstance } from '../controller.js';
import { eventElement } from '../internal.js';
export function initDismissible(el: HTMLElement): ComponentInstance {
  const close = () => {
    void hide(el);
    el.dataset.uifState = 'closed';
  };
  const onClick = (event: MouseEvent) => {
    const action = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
  };
  el.addEventListener('click', onClick);
  return { destroy: () => el.removeEventListener('click', onClick), close };
}
