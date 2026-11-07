import { emit } from '@batoi/uif-core/runtime';
import type { ComponentInstance } from '../controller.js';
import { eventElement, resolveComponentTarget, storageGet, storageSet } from '../internal.js';
export function initShell(el: HTMLElement): ComponentInstance {
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
    el.querySelectorAll<HTMLElement>(
      '[data-uif-action="toggle"][data-uif-target], [data-uif-action="toggle-sidebar"]',
    ).forEach((trigger) => {
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
      const active = Boolean(
        routeMatch || urlMatch || link.getAttribute('aria-current') === 'page',
      );
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
    if (
      action.dataset.uifAction === 'toggle-sidebar' ||
      (action.dataset.uifAction === 'toggle' && resolveComponentTarget(action) === el)
    ) {
      event.preventDefault();
      event.stopPropagation();
      setSidebar(el.dataset.uifSidebar !== 'collapsed');
    }
    if (action.dataset.uifDensity) {
      event.preventDefault();
      setDensity(action.dataset.uifDensity);
    }
  };

  const onKey = (event: KeyboardEvent) => {
    if (!nav?.contains(event.target as Node)) return;
    const items = Array.from(
      nav.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'),
    ).filter((item) => !item.hidden && !item.closest('[hidden]'));
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
  const collapsed = storedSidebar
    ? storedSidebar === 'collapsed'
    : el.dataset.uifSidebar === 'collapsed';
  setSidebar(collapsed);
  setDensity(
    storageGet(densityKey) ||
      el.dataset.uifDensity ||
      el.getAttribute('data-density') ||
      'comfortable',
  );
  el.querySelectorAll<HTMLElement>('[data-uif-action="toggle-section"]').forEach((trigger) => {
    setSection(
      trigger,
      trigger.dataset.uifState === 'expanded' || trigger.getAttribute('aria-expanded') === 'true',
    );
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
