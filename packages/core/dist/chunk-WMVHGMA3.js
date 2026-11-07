import {
  UIFError,
  parseUIFConfiguration
} from "./chunk-JL4ZCOE3.js";

// src/runtime.ts
var plugins = /* @__PURE__ */ new Map();
var apps = /* @__PURE__ */ new WeakMap();
function parseOptions(el) {
  const raw = el.getAttribute("data-uif-options");
  if (!raw) return {};
  const result = parseUIFConfiguration(raw);
  if (!result.valid) emit("uif:runtime:diagnostic", { component: el.dataset.uif, issues: result.issues }, el);
  return result.valid ? result.value : {};
}
function emit(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}
function on(name, handler, target = document) {
  target.addEventListener(name, handler);
  return () => target.removeEventListener(name, handler);
}
function registerPlugin(plugin) {
  plugins.set(plugin.name, plugin);
}
function setDensity(density, target = document.documentElement) {
  target.dataset.uifDensity = density;
}
function setAccent(color, target = document.documentElement) {
  const value = color.trim();
  const supported = typeof CSS !== "undefined" && typeof CSS.supports === "function" ? CSS.supports("color", value) : (() => {
    const probe = document.createElement("span");
    probe.style.color = value;
    return Boolean(probe.style.color);
  })();
  if (!supported) {
    throw new UIFError("Batoi UIF refused an invalid accent color", {
      code: "UIF_INVALID_ACCENT",
      category: "security",
      package: "core",
      phase: "theme",
      recoverable: true
    });
  }
  target.style.setProperty("--uif-accent", value);
  target.style.setProperty("--uif-color-primary", value);
}
function init(root = document, options = {}) {
  const existing = apps.get(root);
  if (existing && !existing.destroyed) return existing;
  emit("uif:before-init", { root, options }, root);
  const app = {
    root,
    options,
    destroyed: false,
    destroy() {
      if (app.destroyed) return;
      emit("uif:before-destroy", { root }, root);
      app.destroyed = true;
      apps.delete(root);
      emit("uif:destroy", { root }, root);
    },
    restart(nextOptions = options) {
      app.destroy();
      return init(root, nextOptions);
    }
  };
  apps.set(root, app);
  for (const plugin of plugins.values()) {
    try {
      plugin.setup(app);
    } catch (error) {
      emit("uif:error", { error, plugin: plugin.name }, root);
    }
  }
  emit("uif:init", { root, options }, root);
  return app;
}

export {
  parseOptions,
  emit,
  on,
  registerPlugin,
  setDensity,
  setAccent,
  init
};
