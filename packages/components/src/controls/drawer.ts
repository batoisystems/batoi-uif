import { closeOverlay, destroyOverlay, openOverlay, toggleOverlay } from '@batoi/uif-overlays';
import type { ComponentInstance } from '../controller.js';
import { setComponentState as setState } from '../internal.js';
export function initDrawer(el: HTMLElement): ComponentInstance {
  const onClose = (event: Event) => {
    if (event.target === el) setState(el, false);
  };
  el.addEventListener('uif:overlay-close', onClose);
  el.setAttribute('role', el.getAttribute('role') || 'dialog');
  el.dataset.uifMode = el.dataset.uifMode ?? 'left';
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => {
      destroyOverlay(el);
      el.removeEventListener('uif:overlay-close', onClose);
    },
    open: (opener?: HTMLElement) => {
      void openOverlay(el, { modal: true, restoreFocus: true, opener });
      setState(el, true);
    },
    close: () => {
      void closeOverlay(el);
      setState(el, false);
    },
    toggle: (opener?: HTMLElement) => {
      void toggleOverlay(el, { modal: true, restoreFocus: true, opener });
      setState(el, el.dataset.uifState !== 'open');
    },
  };
}
