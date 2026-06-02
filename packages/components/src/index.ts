import { emit } from '@batoi/uif-core';
import { collapse, expand, hide, show } from '@batoi/uif-effects';
import { closeOverlay, openOverlay, positionOverlay, toggleOverlay } from '@batoi/uif-overlays';

export interface ComponentInstance {
  destroy(): void;
  open?(): void;
  close?(): void;
  toggle?(): void;
  [action: string]: unknown;
}

type ComponentInit = (el: HTMLElement) => ComponentInstance;

const instances = new WeakMap<HTMLElement, ComponentInstance>();
const actionBindings = new WeakMap<Document | HTMLElement, () => void>();
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

function storageGet(key: string | undefined): string | null {
  if (!key) return null;
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function storageSet(key: string | undefined, value: string): void {
  if (!key) return;
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Persistence is optional; shell behavior must keep working without storage.
  }
}

function initModal(el: HTMLElement): ComponentInstance {
  const mode = el.dataset.uifMode ?? 'dismissible';
  const dialog = el.dataset.uifRole === 'dialog' ? el : el.querySelector<HTMLElement>('[data-uif-role="dialog"]') || el;
  const open = () => {
    void openOverlay(el, { modal: true, restoreFocus: true });
    setState(el, true);
    document.body.classList.add('uif-modal-open');
    dialog.querySelector<HTMLElement>(focusableSelector)?.focus();
  };
  const close = () => {
    if (mode === 'locked') return;
    void closeOverlay(el);
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
    open: () => {
      void openOverlay(el, { modal: true, restoreFocus: true });
      setState(el, true);
    },
    close: () => {
      void closeOverlay(el);
      setState(el, false);
    },
    toggle: () => {
      void toggleOverlay(el, { modal: true, restoreFocus: true });
      setState(el, el.dataset.uifState !== 'open');
    },
  };
}

function initDropdown(el: HTMLElement): ComponentInstance {
  const trigger = el.querySelector<HTMLElement>('[data-uif-role="trigger"]');
  const panel = el.querySelector<HTMLElement>('[data-uif-role="panel"]');
  const open = () => {
    if (trigger && panel) positionOverlay(trigger, panel);
    if (panel) void show(panel);
    trigger?.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    if (panel) void hide(panel);
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
    if (panel) void (expanded ? expand(panel) : collapse(panel));
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

function initShell(el: HTMLElement): ComponentInstance {
  const sidebar = el.querySelector<HTMLElement>('[data-uif-role="sidebar"]');
  const main = el.querySelector<HTMLElement>('[data-uif-role="main"],main');
  const nav = el.querySelector<HTMLElement>('[data-uif-role="nav"],nav');
  const sidebarKey = el.dataset.uifSidebarKey;
  const densityKey = el.dataset.uifDensityKey;
  const currentRoute = el.dataset.uifRoute;

  const setSidebar = (collapsed: boolean) => {
    el.dataset.uifSidebar = collapsed ? 'collapsed' : 'expanded';
    el.classList.toggle('uif-shell-sidebar-collapsed', collapsed);
    sidebar?.setAttribute('aria-hidden', String(collapsed));
    el.querySelectorAll<HTMLElement>('[data-uif-action="toggle"][data-uif-target], [data-uif-action="toggle-sidebar"]').forEach((trigger) => {
      if (trigger.dataset.uifTarget && resolveComponentTarget(trigger) !== el) return;
      trigger.setAttribute('aria-expanded', String(!collapsed));
    });
    storageSet(sidebarKey, collapsed ? 'collapsed' : 'expanded');
  };

  const setDensity = (density: string) => {
    if (!density) return;
    el.dataset.uifDensity = density;
    el.setAttribute('data-density', density);
    storageSet(densityKey, density);
    emit('uif:shell-density', { density, el }, el);
  };

  const resolveSectionPanel = (trigger: HTMLElement): HTMLElement | null => {
    const target = trigger.dataset.uifTarget;
    if (target) return resolveComponentTarget(trigger);
    const next = trigger.nextElementSibling;
    return next instanceof HTMLElement ? next : null;
  };

  const setSection = (trigger: HTMLElement, expanded: boolean) => {
    const panel = resolveSectionPanel(trigger);
    trigger.setAttribute('aria-expanded', String(expanded));
    trigger.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    if (panel) {
      panel.hidden = !expanded;
      panel.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    }
  };

  const applyActiveRoute = () => {
    const path = window.location?.pathname || '';
    nav?.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      const routeMatch = currentRoute && link.dataset.uifRoute === currentRoute;
      const urlMatch = !currentRoute && link.pathname === path;
      const active = Boolean(routeMatch || urlMatch || link.getAttribute('aria-current') === 'page');
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else if (link.getAttribute('aria-current') === 'page') link.removeAttribute('aria-current');
    });
  };

  const setupSkipTarget = () => {
    if (!main) return;
    if (!main.id) main.id = `${el.id || 'uif-shell'}-main`;
    if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
    el.querySelectorAll<HTMLAnchorElement>('[data-uif-role="skip-link"]').forEach((link) => {
      link.href = `#${main.id}`;
    });
  };

  const onClick = (event: MouseEvent) => {
    const action = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
    if (!action || !el.contains(action)) return;
    if (action.dataset.uifAction === 'toggle-section') {
      event.preventDefault();
      setSection(action, action.getAttribute('aria-expanded') !== 'true');
    }
    if (action.dataset.uifDensity) {
      event.preventDefault();
      setDensity(action.dataset.uifDensity);
    }
  };

  const onKey = (event: KeyboardEvent) => {
    if (!nav?.contains(event.target as Node)) return;
    const items = Array.from(nav.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')).filter((item) => !item.hidden && !item.closest('[hidden]'));
    const index = items.indexOf(event.target as HTMLElement);
    if (index < 0 || items.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
    if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    }
    if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const storedSidebar = storageGet(sidebarKey);
  const collapsed = storedSidebar ? storedSidebar === 'collapsed' : el.dataset.uifSidebar === 'collapsed';
  setSidebar(collapsed);
  setDensity(storageGet(densityKey) || el.dataset.uifDensity || el.getAttribute('data-density') || 'comfortable');
  el.querySelectorAll<HTMLElement>('[data-uif-action="toggle-section"]').forEach((trigger) => {
    setSection(trigger, trigger.dataset.uifState === 'expanded' || trigger.getAttribute('aria-expanded') === 'true');
  });
  applyActiveRoute();
  setupSkipTarget();
  nav?.setAttribute('role', nav.getAttribute('role') || 'navigation');
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);

  return {
    destroy: () => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
    },
    open: () => setSidebar(false),
    close: () => setSidebar(true),
    toggle: () => setSidebar(el.dataset.uifSidebar !== 'collapsed'),
    'toggle-sidebar': () => setSidebar(el.dataset.uifSidebar !== 'collapsed'),
  };
}

function initPassive(el: HTMLElement): ComponentInstance {
  if (el.dataset.uif === 'table') el.setAttribute('role', el.getAttribute('role') || 'table');
  if (el.dataset.uif === 'nav') el.setAttribute('role', el.getAttribute('role') || 'navigation');
  return { destroy: () => undefined };
}

function initDismissible(el: HTMLElement): ComponentInstance {
  const close = () => {
    void hide(el);
    el.dataset.uifState = 'closed';
  };
  const onClick = (event: MouseEvent) => {
    const action = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
    if (action?.dataset.uifAction === 'close') close();
  };
  el.addEventListener('click', onClick);
  return { destroy: () => el.removeEventListener('click', onClick), close };
}

function initCollapse(el: HTMLElement): ComponentInstance {
  if (!el.dataset.uifState) el.dataset.uifState = el.hidden ? 'collapsed' : 'expanded';
  const toggle = () => {
    const expanded = el.dataset.uifState !== 'expanded';
    el.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    void (expanded ? expand(el) : collapse(el));
  };
  return { destroy: () => undefined, toggle };
}

function initTooltip(el: HTMLElement): ComponentInstance {
  const panel = document.createElement('div');
  panel.className = 'uif-tooltip';
  panel.id = el.getAttribute('aria-describedby') || `${el.id || 'uif-tooltip'}-panel`;
  panel.setAttribute('role', 'tooltip');
  panel.textContent = el.dataset.uifMessage || el.getAttribute('title') || '';
  panel.hidden = true;
  el.removeAttribute('title');
  el.setAttribute('aria-describedby', panel.id);
  document.body.appendChild(panel);
  const open = () => {
    positionOverlay(el, panel);
    void show(panel);
  };
  const close = () => void hide(panel);
  el.addEventListener('mouseenter', open);
  el.addEventListener('focus', open);
  el.addEventListener('mouseleave', close);
  el.addEventListener('blur', close);
  return {
    destroy: () => {
      el.removeEventListener('mouseenter', open);
      el.removeEventListener('focus', open);
      el.removeEventListener('mouseleave', close);
      el.removeEventListener('blur', close);
      panel.remove();
    },
    open,
    close,
  };
}

function initPopover(el: HTMLElement): ComponentInstance {
  const trigger = el.querySelector<HTMLElement>('[data-uif-role="trigger"]') || el;
  const panel = el.querySelector<HTMLElement>('[data-uif-role="panel"]');
  const open = () => {
    if (!panel) return;
    positionOverlay(trigger, panel);
    void openOverlay(panel, { restoreFocus: true });
  };
  const close = () => {
    if (panel) void closeOverlay(panel);
  };
  const toggle = () => (panel?.dataset.uifState === 'open' ? close() : open());
  trigger.addEventListener('click', toggle);
  panel?.setAttribute('role', panel.getAttribute('role') || 'dialog');
  panel?.setAttribute('hidden', '');
  return { destroy: () => trigger.removeEventListener('click', toggle), open, close, toggle };
}

function initProgress(el: HTMLElement): ComponentInstance {
  const value = Number(el.dataset.uifValue || el.getAttribute('aria-valuenow') || 0);
  const max = Number(el.dataset.uifMax || el.getAttribute('aria-valuemax') || 100);
  el.setAttribute('role', 'progressbar');
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', String(max));
  el.setAttribute('aria-valuenow', String(value));
  el.style.setProperty('--uif-progress', `${Math.max(0, Math.min(100, (value / max) * 100))}%`);
  return { destroy: () => undefined };
}

function initPagination(el: HTMLElement): ComponentInstance {
  el.setAttribute('role', 'navigation');
  el.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('[data-uif-page]').forEach((item) => {
    const active = item.dataset.uifState === 'active' || item.getAttribute('aria-current') === 'page';
    item.setAttribute('aria-current', active ? 'page' : 'false');
  });
  return { destroy: () => undefined };
}

function initCommandMenu(el: HTMLElement): ComponentInstance {
  const input = el.querySelector<HTMLInputElement>('[data-uif-role="search"]');
  const items = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="item"]'));
  let active = 0;
  const activate = (idx: number) => {
    active = (idx + items.length) % Math.max(1, items.length);
    items.forEach((item, i) => {
      item.tabIndex = i === active ? 0 : -1;
      item.dataset.uifState = i === active ? 'active' : 'inactive';
    });
    items[active]?.focus();
  };
  const filter = () => {
    const query = input?.value.trim().toLowerCase() || '';
    items.forEach((item) => {
      item.hidden = query !== '' && !item.textContent?.toLowerCase().includes(query);
    });
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activate(active + 1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      activate(active - 1);
    }
    if (event.key === 'Home') activate(0);
    if (event.key === 'End') activate(items.length - 1);
  };
  el.setAttribute('role', 'menu');
  input?.addEventListener('input', filter);
  el.addEventListener('keydown', onKey);
  if (items.length) activate(0);
  return {
    destroy: () => {
      input?.removeEventListener('input', filter);
      el.removeEventListener('keydown', onKey);
    },
  };
}

function initFileUpload(el: HTMLElement): ComponentInstance {
  const input = el.querySelector<HTMLInputElement>('input[type="file"]');
  const label = el.querySelector<HTMLElement>('[data-uif-role="file-list"]');
  const update = () => {
    if (!label || !input) return;
    label.textContent = Array.from(input.files || [])
      .map((file) => file.name)
      .join(', ');
  };
  input?.addEventListener('change', update);
  return { destroy: () => input?.removeEventListener('change', update) };
}

function initCombobox(el: HTMLElement): ComponentInstance {
  const input = el.querySelector<HTMLInputElement>('input,[data-uif-role="input"]');
  const options = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="option"]'));
  const filter = () => {
    const query = input?.value.toLowerCase() || '';
    options.forEach((option) => {
      option.hidden = query !== '' && !option.textContent?.toLowerCase().includes(query);
    });
  };
  const select = (option: HTMLElement) => {
    if (input) input.value = option.dataset.uifValue || option.textContent?.trim() || '';
    emit('uif:select', { value: input?.value, option }, el);
  };
  const onClick = (event: MouseEvent) => {
    const option = eventElement(event)?.closest<HTMLElement>('[data-uif-role="option"]');
    if (option) select(option);
  };
  el.setAttribute('role', 'combobox');
  input?.setAttribute('aria-autocomplete', 'list');
  input?.addEventListener('input', filter);
  el.addEventListener('click', onClick);
  return {
    destroy: () => {
      input?.removeEventListener('input', filter);
      el.removeEventListener('click', onClick);
    },
  };
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
  offcanvas: initDrawer,
  dropdown: initDropdown,
  tabs: initTabs,
  toast: initToast,
  accordion: initAccordion,
  alert: initDismissible,
  badge: initPassive,
  breadcrumb: initPassive,
  collapse: initCollapse,
  tooltip: initTooltip,
  popover: initPopover,
  progress: initProgress,
  spinner: initPassive,
  skeleton: initPassive,
  pagination: initPagination,
  'command-menu': initCommandMenu,
  navbar: initPassive,
  sidebar: initPassive,
  shell: initShell,
  stepper: initPassive,
  wizard: initPassive,
  'file-upload': initFileUpload,
  combobox: initCombobox,
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

export function initAll(root: Document | HTMLElement = document): () => void {
  root.querySelectorAll<HTMLElement>('[data-uif]').forEach(initComponent);
  const existing = actionBindings.get(root);
  if (existing) return existing;
  root.addEventListener('click', handleAction);
  const dispose = () => {
    root.removeEventListener('click', handleAction);
    actionBindings.delete(root);
  };
  actionBindings.set(root, dispose);
  return dispose;
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
export const offcanvas = { name: 'offcanvas', init: initDrawer, destroy: destroyComponent };
export const dropdown = { name: 'dropdown', init: initDropdown, destroy: destroyComponent };
export const tabs = { name: 'tabs', init: initTabs, destroy: destroyComponent };
export const toast = { name: 'toast', init: initToast, destroy: destroyComponent };
export const accordion = { name: 'accordion', init: initAccordion, destroy: destroyComponent };
export const alert = { name: 'alert', init: initDismissible, destroy: destroyComponent };
export const badge = { name: 'badge', init: initPassive, destroy: destroyComponent };
export const breadcrumb = { name: 'breadcrumb', init: initPassive, destroy: destroyComponent };
export const collapseComponent = { name: 'collapse', init: initCollapse, destroy: destroyComponent };
export const tooltip = { name: 'tooltip', init: initTooltip, destroy: destroyComponent };
export const popover = { name: 'popover', init: initPopover, destroy: destroyComponent };
export const progress = { name: 'progress', init: initProgress, destroy: destroyComponent };
export const spinner = { name: 'spinner', init: initPassive, destroy: destroyComponent };
export const skeleton = { name: 'skeleton', init: initPassive, destroy: destroyComponent };
export const pagination = { name: 'pagination', init: initPagination, destroy: destroyComponent };
export const commandMenu = { name: 'command-menu', init: initCommandMenu, destroy: destroyComponent };
export const navbar = { name: 'navbar', init: initPassive, destroy: destroyComponent };
export const sidebar = { name: 'sidebar', init: initPassive, destroy: destroyComponent };
export const shell = { name: 'shell', init: initShell, destroy: destroyComponent };
export const stepper = { name: 'stepper', init: initPassive, destroy: destroyComponent };
export const wizard = { name: 'wizard', init: initPassive, destroy: destroyComponent };
export const fileUpload = { name: 'file-upload', init: initFileUpload, destroy: destroyComponent };
export const combobox = { name: 'combobox', init: initCombobox, destroy: destroyComponent };
export const card = { name: 'card', init: initPassive, destroy: destroyComponent };
export const nav = { name: 'nav', init: initPassive, destroy: destroyComponent };
export const table = { name: 'table', init: initPassive, destroy: destroyComponent };
