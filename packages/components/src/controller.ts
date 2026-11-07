import { emit } from '@batoi/uif-core/runtime';
import { eventElement, resolveComponentTarget } from './internal.js';
import { showToast } from './controls/notification.js';
export interface ComponentInstance {
  destroy(): void;
  open?(): void;
  close?(): void;
  toggle?(): void;
  [action: string]: unknown;
}
export type ComponentInit = (el: HTMLElement) => ComponentInstance;
const instances = new WeakMap<HTMLElement, ComponentInstance>();
const owners = new WeakMap<HTMLElement, Document | HTMLElement>();
const actionBindings = new WeakMap<Document | HTMLElement, () => void>();
const handledEvents = new WeakSet<Event>();
export function handleAction(event: Event): void {
  if (handledEvents.has(event)) return;
  const actionEl = eventElement(event)?.closest<HTMLElement>('[data-uif-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === 'toast') {
    handledEvents.add(event);
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || 'Notification', {
      type: actionEl.dataset.uifType || 'info',
      duration: Number(actionEl.dataset.uifDuration) || undefined,
      placement: actionEl.dataset.uifPlacement,
      dismissible: actionEl.dataset.uifDismissible !== 'false',
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const owner = target ? owners.get(target) : undefined;
  if (owner && !owner.contains(actionEl)) return;
  const instance = target ? instances.get(target) : null;
  const command =
    action && instance && Object.hasOwn(instance, action)
      ? instance[action as keyof ComponentInstance]
      : undefined;
  if (typeof command === 'function') {
    handledEvents.add(event);
    event.preventDefault();
    if (action === 'open' || action === 'toggle') command.call(instance, actionEl);
    else command.call(instance);
  }
}
export function mountComponent(
  el: HTMLElement,
  init: ComponentInit,
  owner?: Document | HTMLElement,
): ComponentInstance {
  const existing = instances.get(el);
  if (existing) return existing;
  const controller = init(el);
  instances.set(el, controller);
  if (owner) owners.set(el, owner);
  emit('uif:init', { component: el.dataset.uif, el }, el);
  return controller;
}
export function destroyComponent(el: HTMLElement): void {
  const controller = instances.get(el);
  instances.delete(el);
  owners.delete(el);
  try { controller?.destroy(); }
  finally { emit('uif:destroy', { el }, el); }
}
export function bindComponentActions(root: Document | HTMLElement = document): () => void {
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
