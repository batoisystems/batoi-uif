import { emit } from '@batoi/uif-core';

const instances = new WeakMap();
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function setState(el, open) {
  el.dataset.uifState = open ? 'open' : 'closed';
  el.toggleAttribute('hidden', !open);
  emit(open ? 'uif:open' : 'uif:close', { component: el.dataset.uif, el }, el);
}

function getInstance(el) {
  return instances.get(el);
}

function resolveComponentTarget(source) {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest('[data-uif]');
  if (expr === 'self') return source;
  if (expr === 'parent') return source.parentElement;
  if (expr.startsWith('closest:')) return source.closest(expr.slice(8));
  return document.querySelector(expr);
}

function initModal(el) {
  const mode = el.dataset.uifMode ?? 'dismissible';
  const dialog = el.dataset.uifRole === 'dialog' ? el : el.querySelector('[data-uif-role="dialog"]') || el;
  const open = () => {
    setState(el, true);
    const first = dialog.querySelector(focusableSelector);
    first?.focus();
  };
  const close = () => {
    if (mode !== 'locked') setState(el, false);
  };
  const toggle = () => (el.dataset.uifState === 'open' ? close() : open());
  const onKey = (event) => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab' || el.dataset.uifState !== 'open') return;
    const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
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
  const onClick = (event) => {
    const action = event.target.closest('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
    if (event.target.dataset.uifRole === 'backdrop' && mode !== 'locked') close();
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

function initDrawer(el) {
  const mode = el.dataset.uifMode ?? 'left';
  el.setAttribute('role', el.getAttribute('role') || 'dialog');
  el.dataset.uifMode = mode;
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => {},
    open: () => setState(el, true),
    close: () => setState(el, false),
    toggle: () => setState(el, el.dataset.uifState !== 'open'),
  };
}

function initDropdown(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  const open = () => {
    panel?.removeAttribute('hidden');
    trigger?.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel?.setAttribute('hidden', '');
    trigger?.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => (panel?.hasAttribute('hidden') ? open() : close());
  const onDoc = (event) => {
    if (!el.contains(event.target)) close();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };
  const onClick = (event) => {
    const role = event.target.closest('[data-uif-role]')?.dataset.uifRole;
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

function initTabs(el) {
  const tabs = Array.from(el.querySelectorAll('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll('[data-uif-role="tabpanel"]'));
  const activate = (idx) => {
    tabs.forEach((tab, i) => {
      const panel = panels[i];
      if (panel && !panel.id) panel.id = `${el.id || 'uif-tabs'}-panel-${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === idx));
      tab.setAttribute('tabindex', i === idx ? '0' : '-1');
      if (panel) tab.setAttribute('aria-controls', panel.id);
      if (i === idx) tab.focus();
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.hidden = i !== idx;
    });
  };
  const onClick = (event) => {
    const tab = event.target.closest('[data-uif-role="tab"]');
    if (!tab) return;
    activate(tabs.indexOf(tab));
  };
  const onKey = (event) => {
    const idx = tabs.indexOf(event.target);
    if (idx < 0) return;
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

function initToast(el) {
  el.setAttribute('role', el.dataset.uifType === 'danger' ? 'alert' : 'status');
  if (!el.dataset.uifState) setState(el, true);
  return { destroy: () => {}, close: () => el.remove() };
}

function initAccordion(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  if (panel && !panel.id) panel.id = `${el.id || 'uif-accordion'}-panel`;
  const setExpanded = (expanded) => {
    el.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    trigger?.setAttribute('aria-expanded', String(expanded));
    if (panel) panel.hidden = !expanded;
  };
  const toggle = () => setExpanded(trigger?.getAttribute('aria-expanded') !== 'true');
  const onKey = (event) => {
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

function initButton(el) {
  el.addEventListener('click', handleAction);
  return { destroy: () => el.removeEventListener('click', handleAction) };
}

function handleAction(event) {
  const actionEl = event.target.closest('[data-uif-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === 'toast') {
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || 'Notification', {
      type: actionEl.dataset.uifType || 'info',
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const instance = target ? getInstance(target) : null;
  if (instance?.[action]) {
    event.preventDefault();
    instance[action]();
  }
}

const inits = {
  modal: initModal,
  drawer: initDrawer,
  dropdown: initDropdown,
  tabs: initTabs,
  toast: initToast,
  accordion: initAccordion,
  button: initButton,
};

export const modal = { init: initModal, destroy: destroyComponent };
export const drawer = { init: initDrawer, destroy: destroyComponent };
export const dropdown = { init: initDropdown, destroy: destroyComponent };
export const tabs = { init: initTabs, destroy: destroyComponent };
export const toast = { init: initToast, destroy: destroyComponent };
export const accordion = { init: initAccordion, destroy: destroyComponent };
export const button = { init: initButton, destroy: destroyComponent };

export function initComponent(el) {
  if (instances.has(el)) return;
  const name = el.dataset.uif;
  if (!name || !inits[name]) return;
  instances.set(el, inits[name](el));
  emit('uif:init', { component: name, el }, el);
}

export function destroyComponent(el) {
  instances.get(el)?.destroy();
  instances.delete(el);
  emit('uif:destroy', { el }, el);
}

export function initAll(root = document) {
  root.querySelectorAll('[data-uif]').forEach(initComponent);
  root.addEventListener?.('click', handleAction);
}

export function showToast(message, options = {}) {
  const toastEl = document.createElement('div');
  toastEl.dataset.uif = 'toast';
  toastEl.dataset.uifState = 'open';
  toastEl.dataset.uifType = options.type ?? 'info';
  toastEl.textContent = message;
  toastEl.setAttribute('role', options.type === 'danger' ? 'alert' : 'status');
  toastEl.className = `uif-toast uif-toast-${options.type ?? 'info'}`;
  document.body.appendChild(toastEl);
  emit('uif:toast', { message, options, el: toastEl }, toastEl);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => toastEl.remove(), reduce ? 0 : options.duration ?? 3000);
  return toastEl;
}
