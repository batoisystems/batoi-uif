import { emit, partitionStorageKey } from '@batoi/uif-core';

export const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function setComponentState(el: HTMLElement, open: boolean): void {
  el.dataset.uifState = open ? 'open' : 'closed';
  el.toggleAttribute('hidden', !open);
  emit(open ? 'uif:open' : 'uif:close', { component: el.dataset.uif, el }, el);
}

export function resolveComponentTarget(source: HTMLElement): HTMLElement | null {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest<HTMLElement>('[data-uif]');
  if (expr === 'self') return source;
  if (expr === 'parent') return source.parentElement;
  if (expr.startsWith('closest:')) return source.closest<HTMLElement>(expr.slice(8));
  return document.querySelector<HTMLElement>(expr);
}

export function eventElement(event: Event): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

export function storageGet(key: string | undefined): string | null {
  if (!key) return null;
  try {
    return window.localStorage?.getItem(partitionStorageKey(key)) ?? null;
  } catch {
    return null;
  }
}

export function storageSet(key: string | undefined, value: string): void {
  if (!key) return;
  try {
    window.localStorage?.setItem(partitionStorageKey(key), value);
  } catch {
    // Persistence is optional; shell behavior must keep working without storage.
  }
}
