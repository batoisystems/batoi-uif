import { hide, show } from '@batoi/uif-effects';

export interface OverlayOptions {
  opener?: HTMLElement | null;
  modal?: boolean;
  restoreFocus?: boolean;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

interface OverlayRecord {
  el: HTMLElement;
  opener?: HTMLElement | null;
  options: OverlayOptions;
}

const stack: OverlayRecord[] = [];

function top(): OverlayRecord | undefined {
  return stack[stack.length - 1];
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeOverlay(top()?.el);
}

export function getOverlayStack(): HTMLElement[] {
  return stack.map((entry) => entry.el);
}

export async function openOverlay(el: HTMLElement, options: OverlayOptions = {}): Promise<void> {
  if (!stack.length) document.addEventListener('keydown', onKey);
  if (!stack.some((entry) => entry.el === el)) stack.push({ el, opener: options.opener ?? (document.activeElement as HTMLElement), options });
  if (options.modal) document.body.classList.add('uif-overlay-open');
  el.setAttribute('aria-hidden', 'false');
  await show(el);
  el.querySelector<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus();
}

export async function closeOverlay(el: HTMLElement | undefined = top()?.el): Promise<void> {
  if (!el) return;
  const index = stack.findIndex((entry) => entry.el === el);
  const [entry] = index >= 0 ? stack.splice(index, 1) : [];
  el.setAttribute('aria-hidden', 'true');
  await hide(el);
  if (entry?.options.restoreFocus !== false) entry?.opener?.focus?.();
  if (!stack.length) {
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('uif-overlay-open');
  }
}

export async function toggleOverlay(el: HTMLElement, options: OverlayOptions = {}): Promise<void> {
  if (stack.some((entry) => entry.el === el)) await closeOverlay(el);
  else await openOverlay(el, options);
}

export function positionOverlay(anchor: HTMLElement, panel: HTMLElement, options: OverlayOptions = {}): void {
  const rect = anchor.getBoundingClientRect();
  const placement = options.placement ?? 'bottom-start';
  panel.style.position = 'absolute';
  panel.style.top = placement.startsWith('top') ? `${rect.top + window.scrollY - panel.offsetHeight}px` : `${rect.bottom + window.scrollY}px`;
  panel.style.left = placement.endsWith('end')
    ? `${rect.right + window.scrollX - panel.offsetWidth}px`
    : `${rect.left + window.scrollX}px`;
}
