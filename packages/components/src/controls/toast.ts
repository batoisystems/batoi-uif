import type { ComponentInstance } from '../controller.js';
import { setComponentState as setState } from '../internal.js';
import { setupToast } from './notification.js';
export function initToast(el: HTMLElement): ComponentInstance {
  el.setAttribute('role', el.dataset.uifType === 'danger' ? 'alert' : 'status');
  if (!el.dataset.uifState) setState(el, true);
  const dispose = setupToast(el, {
    duration: Number(el.dataset.uifDuration) || undefined,
    dismissible: el.dataset.uifDismissible !== 'false',
  });
  return {
    destroy: dispose,
    close: () => {
      dispose();
      el.remove();
    },
  };
}
