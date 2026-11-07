import {
  emit
} from "./chunk-WMVHGMA3.js";
import {
  UIFError,
  parseUIFConfiguration
} from "./chunk-JL4ZCOE3.js";

// src/resource-scope.ts
function createResourceScope() {
  const controller = new AbortController();
  const disposers = /* @__PURE__ */ new Set();
  let destroyed = false;
  const add = (dispose) => {
    if (destroyed) {
      dispose();
      return () => void 0;
    }
    let active = true;
    const ownedDispose = () => {
      if (!active) return;
      active = false;
      disposers.delete(ownedDispose);
      dispose();
    };
    disposers.add(ownedDispose);
    return ownedDispose;
  };
  return {
    signal: controller.signal,
    get destroyed() {
      return destroyed;
    },
    add,
    listen(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      return add(() => target.removeEventListener(type, listener, options));
    },
    timeout(callback, delay) {
      const id = globalThis.setTimeout(callback, Math.max(0, delay));
      add(() => globalThis.clearTimeout(id));
      return Number(id);
    },
    interval(callback, delay) {
      const id = globalThis.setInterval(callback, Math.max(1, delay));
      add(() => globalThis.clearInterval(id));
      return Number(id);
    },
    observe(observer) {
      add(() => observer.disconnect());
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      controller.abort();
      Array.from(disposers).reverse().forEach((dispose) => dispose());
      disposers.clear();
    }
  };
}

// src/component-registry.ts
var componentNamePattern = /^[a-z][a-z0-9-]*$/;
function elementsFor(root) {
  const elements = Array.from(root.querySelectorAll("[data-uif]"));
  if (root instanceof HTMLElement && root.hasAttribute("data-uif")) elements.unshift(root);
  return elements;
}
function normalizeController(value) {
  if (typeof value === "function") return { destroy: value };
  return value ?? { destroy: () => void 0 };
}
function createComponentRegistry() {
  const definitions = /* @__PURE__ */ new Map();
  const mounted = /* @__PURE__ */ new WeakMap();
  const ownedElements = /* @__PURE__ */ new Set();
  const destroyMounted = (element, name) => {
    const entries = mounted.get(element);
    if (!entries) return;
    const targets = name ? [[name, entries.get(name)]] : Array.from(entries.entries());
    targets.forEach(([componentName, entry]) => {
      if (!entry) return;
      entry.resources.destroy();
      try {
        entry.controller.destroy();
      } catch (cause) {
        emit("uif:runtime:error", {
          code: "UIF_COMPONENT_DESTROY",
          category: "internal",
          package: "core",
          component: componentName,
          phase: "destroy",
          recoverable: true,
          cause
        }, element);
      }
      entries.delete(componentName);
    });
    if (!entries.size) {
      mounted.delete(element);
      ownedElements.delete(element);
    }
  };
  const api = {
    register(definition) {
      if (!componentNamePattern.test(definition.name)) {
        throw new UIFError(`Invalid UIF component name: ${definition.name}`, {
          code: "UIF_COMPONENT_NAME",
          category: "config",
          package: "core",
          component: definition.name,
          phase: "registration",
          recoverable: false
        });
      }
      if (definitions.has(definition.name)) {
        throw new UIFError(`UIF component is already registered: ${definition.name}`, {
          code: "UIF_COMPONENT_DUPLICATE",
          category: "config",
          package: "core",
          component: definition.name,
          phase: "registration",
          recoverable: false
        });
      }
      definitions.set(definition.name, Object.freeze({ ...definition }));
      return () => {
        definitions.delete(definition.name);
        Array.from(ownedElements).forEach((element) => destroyMounted(element, definition.name));
      };
    },
    get(name) {
      return definitions.get(name);
    },
    definitions() {
      return Array.from(definitions.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    refresh(root = document, reason = "refresh") {
      elementsFor(root).forEach((element) => {
        const name = element.dataset.uif;
        const definition = name ? definitions.get(name) : void 0;
        if (!name || !definition) return;
        const entries = mounted.get(element) ?? /* @__PURE__ */ new Map();
        const existing = entries.get(name);
        if (existing) {
          void existing.controller.update?.(reason);
          return;
        }
        const parsed = parseUIFConfiguration(element.dataset.uifOptions ?? "{}", {
          allowedKeys: definition.optionKeys,
          allowUnknown: definition.optionKeys === void 0,
          limits: definition.limits
        });
        if (!parsed.valid) {
          emit("uif:runtime:diagnostic", { component: name, issues: parsed.issues }, element);
          if ((definition.version ?? 3) >= 4) return;
        }
        const options = Object.freeze({ ...definition.defaults ?? {}, ...parsed.value });
        const resources = createResourceScope();
        try {
          const controller = normalizeController(definition.mount({
            element,
            root,
            options,
            signal: resources.signal,
            resources,
            emit: (eventName, detail) => emit(eventName, detail, element),
            error: (message, detail) => new UIFError(message, { ...detail, package: "core", component: name })
          }));
          entries.set(name, { controller, resources });
          mounted.set(element, entries);
          ownedElements.add(element);
          emit("uif:runtime:mounted", { component: name, version: definition.version ?? 3 }, element);
        } catch (cause) {
          resources.destroy();
          emit("uif:runtime:error", {
            code: "UIF_COMPONENT_MOUNT",
            category: "internal",
            package: "core",
            component: name,
            phase: "mount",
            recoverable: true,
            cause
          }, element);
        }
      });
    },
    suspend(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root !== document && root !== element && !root.contains(element)) return;
        mounted.get(element)?.forEach((entry) => entry.controller.suspend?.());
      });
    },
    resume(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root !== document && root !== element && !root.contains(element)) return;
        mounted.get(element)?.forEach((entry) => entry.controller.resume?.());
      });
    },
    destroy(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root === document || root === element || root.contains(element)) destroyMounted(element);
      });
    }
  };
  return api;
}

export {
  createResourceScope,
  createComponentRegistry
};
