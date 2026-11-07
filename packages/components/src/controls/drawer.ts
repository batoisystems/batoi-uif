import { closeOverlay, destroyOverlay, openOverlay } from '@batoi/uif-overlays';
import type { ComponentInstance } from '../controller.js';
import { setComponentState as setState } from '../internal.js';
export function initDrawer(el: HTMLElement): ComponentInstance {
  const open = (opener?: HTMLElement) => {
    void openOverlay(el, { modal: true, restoreFocus: true, opener });
    setState(el, true);
  };
  const close = () => {
    void closeOverlay(el);
    setState(el, false);
  };
  const onClose = (event: Event) => {
    if (event.target === el) setState(el, false);
  };
  el.addEventListener('uif:overlay-close', onClose);
  el.setAttribute('role', el.getAttribute('role') || 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.dataset.uifMode = el.dataset.uifMode ?? 'left';
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => {
      destroyOverlay(el);
      el.removeEventListener('uif:overlay-close', onClose);
    },
    open,
    close,
    toggle: (opener?: HTMLElement) => el.dataset.uifState === 'open' ? close() : open(opener),
  };
}
