import { collapse, expand } from '@batoi/uif-effects';
import type { ComponentInstance } from '../controller.js';
export function initCollapse(el: HTMLElement): ComponentInstance {
  if (!el.dataset.uifState) el.dataset.uifState = el.hidden ? 'collapsed' : 'expanded';
  const toggle = () => {
    const expanded = el.dataset.uifState !== 'expanded';
    el.dataset.uifState = expanded ? 'expanded' : 'collapsed';
    void (expanded ? expand(el) : collapse(el));
  };
  return { destroy: () => undefined, toggle };
}
