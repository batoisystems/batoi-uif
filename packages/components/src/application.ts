import { createComponentRegistry } from '@batoi/uif-core/registry';
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

const roots = new Set<Document | HTMLElement>();

/** Explicit, per-application registration. Importing this module mounts nothing. */
export function createUIF(
  root: Document | HTMLElement,
  components: readonly SelectedComponent[] = [],
) {
  for (const active of roots) {
    if (active === root || active.contains(root) || root.contains(active))
      throw new Error('UIF application roots must not overlap');
  }
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
        mountComponent(element, component.init, root);
        elements.set(element, component.name);
        return () => {
          elements.delete(element);
          destroyComponent(element);
        };
      },
    });
  };
  components.forEach(register);
  const unbind = bindComponentActions(root);
  roots.add(root);
  return {
    register,
    refresh(target: Document | HTMLElement = root) {
      if (destroyed) return;
      if (target !== root && !root.contains(target))
        throw new Error('UIF target is outside its application root');
      elements.forEach((name, element) => {
        if (!root.contains(element) || element.dataset.uif !== name) registry.destroy(element);
      });
      registry.refresh(target);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      roots.delete(root);
      Array.from(elements.keys()).forEach((element) => registry.destroy(element));
      unbind();
    },
  };
}
