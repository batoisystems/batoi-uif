import type { ComponentInstance } from '../controller.js';
import { eventElement } from '../internal.js';
let sequence = 0;
export function initTabs(el: HTMLElement): ComponentInstance {
  const tablist = el.querySelector<HTMLElement>('[data-uif-role="tablist"]') ?? el;
  const tabs = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="tabpanel"]'));
  const manual = el.dataset.uifActivation === 'manual';
  const vertical = el.dataset.uifOrientation === 'vertical';
  const prefix = el.id || `uif-tabs-${++sequence}`;
  const enabled = tabs
    .map((tab, index) => ({ tab, index }))
    .filter(
      ({ tab }) => !tab.hasAttribute('disabled') && tab.getAttribute('aria-disabled') !== 'true',
    )
    .map(({ index }) => index);
  let selectedIndex = 0;
  let focusedIndex = 0;
  const sync = () => {
    tabs.forEach((tab, i) => {
      const panel = panels[i];
      if (panel && !panel.id) panel.id = `${prefix}-panel-${i}`;
      if (!tab.id) tab.id = `${prefix}-tab-${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === selectedIndex));
      tab.setAttribute('tabindex', i === focusedIndex ? '0' : '-1');
      if (panel) tab.setAttribute('aria-controls', panel.id);
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      if (tabs[i]) panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.hidden = i !== selectedIndex;
    });
  };
  const activate = (idx: number) => {
    if (!enabled.includes(idx)) return;
    selectedIndex = (idx + tabs.length) % tabs.length;
    focusedIndex = selectedIndex;
    sync();
    tabs[focusedIndex]?.focus();
  };
  const focusTab = (idx: number) => {
    focusedIndex = enabled[(idx + enabled.length) % enabled.length];
    if (!manual) selectedIndex = focusedIndex;
    sync();
    tabs[focusedIndex]?.focus();
  };
  const onClick = (event: MouseEvent) => {
    const tab = eventElement(event)?.closest<HTMLElement>('[data-uif-role="tab"]');
    if (tab && tabs.includes(tab)) activate(tabs.indexOf(tab));
  };
  const onKey = (event: KeyboardEvent) => {
    const idx = tabs.indexOf(event.target as HTMLElement);
    if (idx < 0 || tabs.length === 0) return;
    const direction = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
      event.preventDefault();
      focusTab(enabled.indexOf(idx) + (vertical ? 1 : direction));
    }
    if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
      event.preventDefault();
      focusTab(enabled.indexOf(idx) - (vertical ? 1 : direction));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusTab(enabled.length - 1);
    }
    if (manual && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      activate(idx);
    }
  };
  tablist.setAttribute('role', 'tablist');
  if (vertical) tablist.setAttribute('aria-orientation', 'vertical');
  if (!enabled.length) {
    return {
      destroy: () => undefined,
    };
  }
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  selectedIndex = focusedIndex = enabled[0];
  sync();
  return {
    destroy: () => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
    },
  };
}
