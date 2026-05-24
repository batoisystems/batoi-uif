// src/attributes.ts
var uifAttributes = [
  "data-uif",
  "data-uif-id",
  "data-uif-role",
  "data-uif-action",
  "data-uif-target",
  "data-uif-src",
  "data-uif-method",
  "data-uif-trigger",
  "data-uif-state",
  "data-uif-bind",
  "data-uif-model",
  "data-uif-value",
  "data-uif-route",
  "data-uif-mode",
  "data-uif-options",
  "data-uif-confirm",
  "data-uif-disabled",
  "data-uif-loading",
  "data-uif-success",
  "data-uif-error",
  "data-uif-swap",
  "data-uif-cache",
  "data-uif-validate",
  "data-uif-rule",
  "data-uif-event",
  "data-uif-on",
  "data-uif-refresh",
  "data-uif-persist"
];
var uifValues = [
  "button",
  "modal",
  "drawer",
  "dropdown",
  "tabs",
  "toast",
  "accordion",
  "table",
  "form",
  "ajax",
  "route",
  "shell",
  "nav",
  "chart",
  "realtime",
  "push",
  "mobile-shell",
  "ai-action",
  "tool-approval"
];
var uifActions = [
  "open",
  "close",
  "toggle",
  "submit",
  "load",
  "reload",
  "delete",
  "save",
  "reset",
  "clear",
  "select",
  "activate",
  "deactivate",
  "navigate",
  "swap",
  "append",
  "prepend",
  "remove",
  "toast",
  "subscribe",
  "connect",
  "disconnect",
  "approve",
  "reject"
];
var uifStates = [
  "idle",
  "loading",
  "loaded",
  "error",
  "success",
  "active",
  "inactive",
  "open",
  "closed",
  "disabled",
  "selected",
  "expanded",
  "collapsed",
  "connected",
  "disconnected",
  "pending",
  "approved",
  "rejected"
];

// src/index.ts
var plugins = /* @__PURE__ */ new Map();
function coerceValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}
function parseOptions(el) {
  const raw = el.getAttribute("data-uif-options");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return raw.split(";").reduce((acc, pair) => {
      const [key, ...rest] = pair.split(":");
      const name = key?.trim();
      if (!name) return acc;
      const value = rest.join(":").trim();
      acc[name] = value === "" ? true : coerceValue(value);
      return acc;
    }, {});
  }
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
  target.style.setProperty("--uif-accent", color);
  target.style.setProperty("--uif-color-primary", color);
}
function init(root = document, options = {}) {
  emit("uif:before-init", { root, options }, root);
  const app = {
    root,
    options,
    destroy() {
      emit("uif:before-destroy", { root }, root);
      emit("uif:destroy", { root }, root);
    }
  };
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
  emit,
  init,
  on,
  parseOptions,
  registerPlugin,
  setAccent,
  setDensity,
  uifActions,
  uifAttributes,
  uifStates,
  uifValues
};
