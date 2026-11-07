import { emit } from '@batoi/uif-core/runtime';
import { eventElement } from '../internal.js';
interface ToastOptions {
  type?: string;
  duration?: number;
  placement?: string;
  dismissible?: boolean;
}
function getToastContainer(placement = 'bottom-end'): HTMLElement {
  const normalized = placement || 'bottom-end';
  const existing = document.querySelector<HTMLElement>(
    `.uif-toast-stack[data-uif-placement="${normalized}"]`,
  );
  if (existing) return existing;
  const container = document.createElement('div');
  container.className = `uif-toast-stack uif-toast-stack-${normalized}`;
  container.dataset.uifPlacement = normalized;
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.appendChild(container);
  return container;
}
export function setupToast(toastEl: HTMLElement, options: ToastOptions = {}): () => void {
  let timer: number | undefined;
  let startedAt = 0;
  let remaining = options.duration ?? 3000;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const clear = () => {
    window.clearTimeout(timer);
    timer = undefined;
  };
  const close = () => {
    clear();
    toastEl.dataset.uifState = 'closed';
    toastEl.remove();
  };
  const schedule = (delay = remaining) => {
    clear();
    if (delay <= 0) return;
    startedAt = Date.now();
    timer = window.setTimeout(close, reduce ? 0 : delay);
  };
  const pause = () => {
    if (!timer) return;
    remaining = Math.max(0, remaining - (Date.now() - startedAt));
    clear();
  };
  const resume = () => {
    if (toastEl.isConnected) schedule();
  };
  const onClick = (event: MouseEvent) => {
    const action = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
  };
  toastEl.addEventListener('mouseenter', pause);
  toastEl.addEventListener('mouseleave', resume);
  toastEl.addEventListener('focusin', pause);
  toastEl.addEventListener('focusout', resume);
  toastEl.addEventListener('click', onClick);
  schedule();
  return () => {
    clear();
    toastEl.removeEventListener('mouseenter', pause);
    toastEl.removeEventListener('mouseleave', resume);
    toastEl.removeEventListener('focusin', pause);
    toastEl.removeEventListener('focusout', resume);
    toastEl.removeEventListener('click', onClick);
  };
}
export function showToast(message: string, options: ToastOptions = {}): HTMLElement {
  const toastEl = document.createElement('div');
  toastEl.dataset.uif = 'toast';
  toastEl.dataset.uifState = 'open';
  toastEl.dataset.uifType = options.type ?? 'info';
  const messageEl = document.createElement('span');
  messageEl.className = 'uif-toast-message';
  messageEl.textContent = message;
  toastEl.append(messageEl);
  if (options.dismissible !== false) {
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'uif-toast-close';
    closeButton.dataset.uifAction = 'close';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.textContent = 'x';
    toastEl.append(closeButton);
  }
  toastEl.setAttribute('role', options.type === 'danger' ? 'alert' : 'status');
  toastEl.className = `uif-toast uif-toast-${options.type ?? 'info'}`;
  getToastContainer(options.placement).appendChild(toastEl);
  emit('uif:toast', { message, options, el: toastEl }, toastEl);
  setupToast(toastEl, options);
  return toastEl;
}
