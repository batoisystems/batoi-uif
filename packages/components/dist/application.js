import {
  bindComponentActions,
  destroyComponent,
  mountComponent
} from "./chunk-KE65AGYK.js";
import "./chunk-KT6YEKUB.js";
import "./chunk-D73MWFXY.js";

// src/application.ts
import { createComponentRegistry } from "@batoi/uif-core/registry";
var roots = /* @__PURE__ */ new Set();
function createUIF(root, components = []) {
  for (const active of roots) {
    if (active === root || active.contains(root) || root.contains(active))
      throw new Error("UIF application roots must not overlap");
  }
  const registry = createComponentRegistry();
  const elements = /* @__PURE__ */ new Map();
  let destroyed = false;
  const register = (component) => {
    if (destroyed) throw new Error("UIF application has been destroyed");
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
      }
    });
  };
  components.forEach(register);
  const unbind = bindComponentActions(root);
  roots.add(root);
  return {
    register,
    refresh(target = root) {
      if (destroyed) return;
      if (target !== root && !root.contains(target))
        throw new Error("UIF target is outside its application root");
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
    }
  };
}
export {
  createUIF
};
