import { createComponentRegistry } from '@batoi/uif-core/registry';
import { claimApplicationRoot } from '@batoi/uif-core/ownership';
import {
  bindComponentActions,
  destroyComponent,
  mountComponent,
  type ComponentInit,
} from './controller.js';

export interface SelectedComponent {
  name: string;
  init: ComponentInit;
  optionKeys?: readonly string[];
}

/** Explicit, per-application registration. Importing this module mounts nothing. */
export function createUIF(
  root: Document | HTMLElement,
  components: readonly SelectedComponent[] = [],
) {
  const registry = createComponentRegistry();
  const elements = new Map<HTMLElement, string>();
  let destroyed = false;
  const register = (component: SelectedComponent) => {
    if (destroyed) throw new Error('UIF application has been destroyed');
    return registry.register({
      name: component.name,
      version: 4,
      optionKeys: component.optionKeys ?? [],
      mount({ element }) {
        const controller = mountComponent(element, component.init, root);
        elements.set(element, component.name);
        return {
          update(reason) {
            if (typeof controller.update === 'function') return controller.update(reason);
            if (typeof controller.refresh === 'function') return controller.refresh();
          },
          suspend() { if (typeof controller.suspend === 'function') controller.suspend(); },
          resume() { if (typeof controller.resume === 'function') controller.resume(); },
          destroy() {
            elements.delete(element);
            destroyComponent(element);
          },
        };
      },
    });
  };
  components.forEach(register);
  const lease = claimApplicationRoot(root);
  let unbind: () => void;
  try { unbind = bindComponentActions(root); }
  catch (error) { lease.destroy(); throw error; }
  const assertTarget = (target: Document | HTMLElement) => {
    lease.assert();
    if (target !== root && !root.contains(target)) throw new Error('UIF target is outside its application root');
  };
  const api = {
    register,
    refresh(target: Document | HTMLElement = root) {
      if (destroyed) return;
      assertTarget(target);
      elements.forEach((name, element) => {
        if (!root.contains(element) || element.dataset.uif !== name) registry.destroy(element);
      });
      registry.refresh(target);
    },
    /** Use after replacing inner HTML/attributes of an existing component root. */
    rehydrate(target: Document | HTMLElement = root) {
      if (destroyed) return;
      assertTarget(target);
      registry.destroy(target);
      api.refresh(target);
    },
    suspend(target: Document | HTMLElement = root) {
      if (destroyed) return;
      assertTarget(target);
      registry.suspend(target);
    },
    resume(target: Document | HTMLElement = root) {
      if (destroyed) return;
      assertTarget(target);
      registry.resume(target);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      try { Array.from(elements.keys()).forEach((element) => registry.destroy(element)); }
      finally { unbind(); lease.destroy(); }
    },
  };
  return api;
}
