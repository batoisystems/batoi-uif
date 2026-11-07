import { closeOverlay, openOverlay, positionOverlay } from '@batoi/uif-overlays';
import type { ComponentInstance } from '../controller.js';
export function initPopover(el: HTMLElement): ComponentInstance {
  const trigger = el.querySelector<HTMLElement>('[data-uif-role="trigger"]') || el;
  const panel = el.querySelector<HTMLElement>('[data-uif-role="panel"]');
  const open = () => {
    if (!panel) return;
    positionOverlay(trigger, panel);
    void openOverlay(panel, { restoreFocus: true });
    panel.dataset.uifState = 'open';
    trigger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    if (!panel) return;
    void closeOverlay(panel);
    panel.dataset.uifState = 'closed';
    trigger.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => (panel?.dataset.uifState === 'open' ? close() : open());
  trigger.addEventListener('click', toggle);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  panel?.setAttribute('role', panel.getAttribute('role') || 'dialog');
  panel?.setAttribute('hidden', '');
  if (panel && !panel.dataset.uifState) panel.dataset.uifState = 'closed';
  return { destroy: () => trigger.removeEventListener('click', toggle), open, close, toggle };
}
