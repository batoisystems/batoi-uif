import { emit } from '@batoi/uif-core';

const store = new WeakMap();
const setState = (el, open) => { el.dataset.uifState = open ? 'open' : 'closed'; };

function initModal(el) {
  const mode = el.dataset.uifMode ?? 'dismissible';
  const onKey = (e) => { if (e.key === 'Escape' && mode !== 'locked') setState(el, false); };
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  document.addEventListener('keydown', onKey);
  return { destroy: () => document.removeEventListener('keydown', onKey), open: () => setState(el, true), close: () => setState(el, false), toggle: () => setState(el, el.dataset.uifState !== 'open') };
}

function initDropdown(el) {
  const panel = el.querySelector('[data-uif-role="panel"]');
  const close = () => panel?.setAttribute('hidden', '');
  const open = () => panel?.removeAttribute('hidden');
  const onDoc = (e) => { if (!el.contains(e.target)) close(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('click', onDoc);
  document.addEventListener('keydown', onKey);
  return { destroy: () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); }, open, close, toggle: () => (panel?.hasAttribute('hidden') ? open() : close()) };
}

function initTabs(el) {
  const tabs = Array.from(el.querySelectorAll('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll('[data-uif-role="tabpanel"]'));
  el.setAttribute('role', 'tablist');
  const activate = (idx) => {
    tabs.forEach((t, i) => { t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(i === idx)); });
    panels.forEach((p, i) => { p.setAttribute('role', 'tabpanel'); p.hidden = i !== idx; });
  };
  tabs.forEach((t, idx) => t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') activate((idx + 1) % tabs.length); if (e.key === 'ArrowLeft') activate((idx - 1 + tabs.length) % tabs.length); }));
  activate(0);
  return { destroy: () => {} };
}

function initAccordion(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  const toggle = () => { const expanded = trigger?.getAttribute('aria-expanded') === 'true'; trigger?.setAttribute('aria-expanded', String(!expanded)); if (panel) panel.hidden = expanded; };
  const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); };
  trigger?.addEventListener('keydown', onKey);
  trigger?.addEventListener('click', toggle);
  return { destroy: () => { trigger?.removeEventListener('keydown', onKey); trigger?.removeEventListener('click', toggle); }, toggle };
}

const initBasic = (el) => ({ destroy: () => {}, toggle: () => setState(el, el.dataset.uifState !== 'open') });

const inits = { modal: initModal, drawer: initBasic, dropdown: initDropdown, tabs: initTabs, toast: initBasic, accordion: initAccordion, button: initBasic };

export function initComponent(el) {
  if (store.has(el)) return;
  const name = el.dataset.uif;
  if (!name || !inits[name]) return;
  store.set(el, inits[name](el));
  emit('uif:init', { component: name, el });
}

export function destroyComponent(el) {
  store.get(el)?.destroy();
  store.delete(el);
  emit('uif:destroy', { el });
}

export function initAll(root = document) { root.querySelectorAll('[data-uif]').forEach(initComponent); }

export function showToast(message, options = {}) {
  const toast = document.createElement('div');
  toast.dataset.uif = 'toast';
  toast.dataset.uifState = 'open';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.className = `uif-toast uif-toast-${options.type ?? 'info'}`;
  document.body.appendChild(toast);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => toast.remove(), reduce ? 0 : options.duration ?? 3000);
}
