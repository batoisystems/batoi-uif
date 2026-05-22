import { emit } from '@batoi/uif-core';

export interface ComponentInstance {
  destroy(): void;
  open?(): void;
  close?(): void;
  toggle?(): void;
}

type ComponentInit = (el: HTMLElement) => ComponentInstance;

const instances = new WeakMap<HTMLElement, ComponentInstance>();
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function setState(el: HTMLElement, open: boolean): void {
  el.dataset.uifState = open ? 'open' : 'closed';
  el.toggleAttribute('hidden', !open);
  emit(open ? 'uif:open' : 'uif:close', { component: el.dataset.uif, el }, el);
}

function resolveComponentTarget(source: HTMLElement): HTMLElement | null {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest<HTMLElement>('[data-uif]');
  if (expr === 'self') return source;
  if (expr === 'parent') return source.parentElement;
  if (expr.startsWith('closest:')) return source.closest<HTMLElement>(expr.slice(8));
  return document.querySelector<HTMLElement>(expr);
}

function eventElement(event: Event): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

function initModal(el: HTMLElement): ComponentInstance {
  const mode = el.dataset.uifMode ?? 'dismissible';
  const dialog = el.dataset.uifRole === 'dialog' ? el : el.querySelector<HTMLElement>('[data-uif-role="dialog"]') || el;
  const open = () => {
    setState(el, true);
    document.body.classList.add('uif-modal-open');
    dialog.querySelector<HTMLElement>(focusableSelector)?.focus();
  };
  const close = () => {
    if (mode === 'locked') return;
    setState(el, false);
    document.body.classList.remove('uif-modal-open');
  };
  const toggle = () => (el.dataset.uifState === 'open' ? close() : open());
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab' || el.dataset.uifState !== 'open') return;
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
    const action = target?.closest<HTMLElement>('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
    if (target?.dataset.uifRole === 'backdrop') close();
  };
  dialog.setAttribute('role', dialog.getAttribute('role') || 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  if (!el.dataset.uifState) setState(el, false);
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', onClick);
  return {
    destroy: () => {
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
    },
    open,
    close,
    toggle,
  };
}

function initDrawer(el: HTMLElement): ComponentInstance {
  el.setAttribute('role', el.getAttribute('role') || 'dialog');
  el.dataset.uifMode = el.dataset.uifMode ?? 'left';
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => undefined,
    open: () => setState(el, true),
    close: () => setState(el, false),
    toggle: () => setState(el, el.dataset.uifState !== 'open'),
  };
}

function initDropdown(el: HTMLElement): ComponentInstance {
  const trigger = el.querySelector<HTMLElement>('[data-uif-role="trigger"]');
  const panel = el.querySelector<HTMLElement>('[data-uif-role="panel"]');
  const open = () => {
    panel?.removeAttribute('hidden');
    trigger?.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel?.setAttribute('hidden', '');
    trigger?.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => (panel?.hasAttribute('hidden') ? open() : close());
  const onDoc = (event: MouseEvent) => {
    const target = eventElement(event);
    if (target && !el.contains(target)) close();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };
  const onClick = (event: MouseEvent) => {
    const role = eventElement(event)?.closest<HTMLElement>('[data-uif-role]')?.dataset.uifRole;
    if (role === 'trigger') toggle();
    if (role === 'item') close();
  };
  trigger?.setAttribute('aria-haspopup', 'menu');
  trigger?.setAttribute('aria-expanded', 'false');
  panel?.setAttribute('role', 'menu');
  panel?.setAttribute('hidden', '');
  el.addEventListener('click', onClick);
  document.addEventListener('click', onDoc);
  document.addEventListener('keydown', onKey);
  return {
    destroy: () => {
      el.removeEventListener('click', onClick);
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    },
    open,
    close,
    toggle,
  };
}

function initTabs(el: HTMLElement): ComponentInstance {
  const tabs = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="tabpanel"]'));
  const activate = (idx: number) => {
    tabs.forEach((tab, i) => {
      const panel = panels[i];
      if (panel && !panel.id) panel.id = `${el.id || 'uif-tabs'}-panel-${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === idx));
      tab.setAttribute('tabindex', i === idx ? '0' : '-1');
      if (panel) tab.setAttribute('aria-controls', panel.id);
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = i !== idx;
    });
    tabs[idx]?.focus();
  };
  const onClick = (event: MouseEvent) => {
    const tab = eventElement(event)?.closest<HTMLElement>('[data-uif-role="tab"]');
    if (tab) activate(tabs.indexOf(tab));
  };
  const onKey = (event: KeyboardEvent) => {
    const idx = tabs.indexOf(event.target as HTMLElement);
    if (idx < 0 || tabs.length === 0) return;
    if (event.key === 'ArrowRight') activate((idx + 1) % tabs.length);
    if (event.key === 'ArrowLeft') activate((idx - 1 + tabs.length) % tabs.length);
  };
  el.setAttribute('role', 'tablist');
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  activate(0);
  return {
    destroy: () => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
    },
  };
}

function initToast(el: HTMLElement): ComponentInstance {
  el.setAttribute('role', el.dataset.uifType === 'danger' ? 'alert' : 'status');
  if (!el.dataset.uifState) setState(el, true);
  return { destroy: () => undefined, close: () => el.remove() };
}

function initAccordion(el: HTMLElement): ComponentInstance {
  const trigger = el.querySelector<HTMLElement>('[data-uif-role="trigger"]');
  const panel = el.querySelector<HTMLElement>('[data-uif-role="panel"]');
  if (panel && !panel.id) panel.id = `${el.id || 'uif-accordion'}-panel`;
  const setExpanded = (expanded: boolean) => {
    el.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    trigger?.setAttribute('aria-expanded', String(expanded));
    if (panel) panel.hidden = !expanded;
  };
  const toggle = () => setExpanded(trigger?.getAttribute('aria-expanded') !== 'true');
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };
  trigger?.setAttribute('aria-controls', panel?.id || '');
  trigger?.addEventListener('keydown', onKey);
  trigger?.addEventListener('click', toggle);
  setExpanded(el.dataset.uifState === 'expanded');
  return {
    destroy: () => {
      trigger?.removeEventListener('keydown', onKey);
      trigger?.removeEventListener('click', toggle);
    },
    toggle,
  };
}

function initButton(el: HTMLElement): ComponentInstance {
  el.addEventListener('click', handleAction);
  return { destroy: () => el.removeEventListener('click', handleAction) };
}

function initPassive(el: HTMLElement): ComponentInstance {
  if (el.dataset.uif === 'table') el.setAttribute('role', el.getAttribute('role') || 'table');
  if (el.dataset.uif === 'nav') el.setAttribute('role', el.getAttribute('role') || 'navigation');
  return { destroy: () => undefined };
}

function handleAction(event: Event): void {
  const actionEl = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === 'toast') {
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || 'Notification', {
      type: actionEl.dataset.uifType || 'info',
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const instance = target ? instances.get(target) : null;
  const command = action && instance ? instance[action as keyof ComponentInstance] : undefined;
  if (typeof command === 'function') {
    event.preventDefault();
    command.call(instance);
  }
}

const inits: Record<string, ComponentInit> = {
  modal: initModal,
  drawer: initDrawer,
  dropdown: initDropdown,
  tabs: initTabs,
  toast: initToast,
  accordion: initAccordion,
  button: initButton,
  card: initPassive,
  nav: initPassive,
  table: initPassive,
};

export function initComponent(el: HTMLElement): void {
  if (instances.has(el)) return;
  const name = el.dataset.uif;
  if (!name || !inits[name]) return;
  instances.set(el, inits[name](el));
  emit('uif:init', { component: name, el }, el);
}

export function destroyComponent(el: HTMLElement): void {
  instances.get(el)?.destroy();
  instances.delete(el);
  emit('uif:destroy', { el }, el);
}

export function initAll(root: Document | HTMLElement = document): void {
  root.querySelectorAll<HTMLElement>('[data-uif]').forEach(initComponent);
  root.addEventListener('click', handleAction);
}

export function showToast(message: string, options: { type?: string; duration?: number } = {}): HTMLElement {
  const toastEl = document.createElement('div');
  toastEl.dataset.uif = 'toast';
  toastEl.dataset.uifState = 'open';
  toastEl.dataset.uifType = options.type ?? 'info';
  toastEl.textContent = message;
  toastEl.setAttribute('role', options.type === 'danger' ? 'alert' : 'status');
  toastEl.className = `uif-toast uif-toast-${options.type ?? 'info'}`;
  document.body.appendChild(toastEl);
  emit('uif:toast', { message, options, el: toastEl }, toastEl);
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => toastEl.remove(), reduce ? 0 : options.duration ?? 3000);
  return toastEl;
}

export const button = { name: 'button', init: initButton, destroy: destroyComponent };
export const modal = { name: 'modal', init: initModal, destroy: destroyComponent };
export const drawer = { name: 'drawer', init: initDrawer, destroy: destroyComponent };
export const dropdown = { name: 'dropdown', init: initDropdown, destroy: destroyComponent };
export const tabs = { name: 'tabs', init: initTabs, destroy: destroyComponent };
export const toast = { name: 'toast', init: initToast, destroy: destroyComponent };
export const accordion = { name: 'accordion', init: initAccordion, destroy: destroyComponent };
export const card = { name: 'card', init: initPassive, destroy: destroyComponent };
export const nav = { name: 'nav', init: initPassive, destroy: destroyComponent };
export const table = { name: 'table', init: initPassive, destroy: destroyComponent };
