import { closeOverlay, destroyOverlay, getOverlayStack, openOverlay } from '@batoi/uif-overlays';
import type { ComponentInstance } from '../controller.js';
import { eventElement, focusableSelector, setComponentState as setState } from '../internal.js';
export function initModal(el: HTMLElement): ComponentInstance {
  const mode = el.dataset.uifMode ?? 'dismissible';
  const backdrop = el.dataset.uifBackdrop ?? 'true';
  const closeOnEscape =
    mode !== 'locked' && backdrop !== 'static' && el.dataset.uifKeyboard !== 'false';
  const dialog =
    el.dataset.uifRole === 'dialog'
      ? el
      : el.querySelector<HTMLElement>('[data-uif-role="dialog"]') || el;
  const open = (opener?: HTMLElement) => {
    void openOverlay(el, { modal: true, restoreFocus: true, closeOnEscape, opener });
    setState(el, true);
    dialog.querySelector<HTMLElement>(focusableSelector)?.focus();
  };
  const close = () => {
    if (mode === 'locked') return;
    void closeOverlay(el);
    setState(el, false);
  };
  const toggle = (opener?: HTMLElement) =>
    el.dataset.uifState === 'open' ? close() : open(opener);
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || getOverlayStack().at(-1) !== el) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const onClick = (event: MouseEvent) => {
    const target = eventElement(event);
    if (target?.closest('[data-uif="modal"],[data-uif="drawer"]') !== el) return;
    const action = target?.closest<HTMLElement>('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
    if (target?.dataset.uifRole === 'backdrop' && backdrop !== 'static') close();
  };
  const onClose = (event: Event) => {
    if (event.target === el) setState(el, false);
  };
  dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  if (!el.dataset.uifState) setState(el, false);
  document.addEventListener('keydown', onKey);
  el.addEventListener('uif:overlay-close', onClose);
  el.addEventListener('click', onClick);
  return {
    destroy: () => {
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
      destroyOverlay(el);
      el.removeEventListener('uif:overlay-close', onClose);
    },
    open,
    close,
    toggle,
  };
}
