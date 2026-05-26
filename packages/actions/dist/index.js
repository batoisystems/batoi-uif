// src/index.ts
import { emit } from "@batoi/uif-core";
import { animate, hide, show, toggle } from "@batoi/uif-effects";
var handlers = /* @__PURE__ */ new Map();
var boundRoots = /* @__PURE__ */ new WeakMap();
function resolveActionTarget(source, targetExpr) {
  if (!targetExpr) return source;
  if (targetExpr === "self") return source;
  if (targetExpr === "parent") return source.parentElement;
  if (targetExpr.startsWith("closest:")) return source.closest(targetExpr.slice(8));
  return document.querySelector(targetExpr);
}
function registerAction(name, handler) {
  handlers.set(name, handler);
}
function unregisterAction(name) {
  handlers.delete(name);
}
async function dispatchAction(action, context) {
  const handler = handlers.get(action);
  if (!handler) return;
  await handler({ ...context, action });
}
function keyMatches(event, key) {
  if (!key || !(event instanceof KeyboardEvent)) return true;
  const normalized = key.toLowerCase();
  const actual = event.key.toLowerCase();
  return actual === normalized || normalized === "space" && actual === " " || normalized === "esc" && actual === "escape";
}
function parseActionSpec(el) {
  const specs = [];
  const raw = el.dataset.uifOn;
  if (raw) {
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([eventSpec, value]) => {
      const [event, ...mods] = eventSpec.split(".");
      specs.push({
        event,
        action: value.action,
        target: value.target,
        prevent: value.prevent ?? mods.includes("prevent"),
        stop: value.stop ?? mods.includes("stop"),
        once: value.once ?? mods.includes("once"),
        key: mods.find((mod) => !["prevent", "stop", "once", "self"].includes(mod))
      });
    });
  }
  if (el.dataset.uifEvent && el.dataset.uifAction) {
    const [event, ...mods] = el.dataset.uifEvent.split(".");
    specs.push({
      event,
      action: el.dataset.uifAction,
      target: el.dataset.uifTarget,
      prevent: mods.includes("prevent"),
      stop: mods.includes("stop"),
      once: mods.includes("once"),
      key: el.dataset.uifKey || mods.find((mod) => !["prevent", "stop", "once", "self"].includes(mod))
    });
  }
  return specs;
}
function bindActions(root = document) {
  const existing = boundRoots.get(root);
  if (existing) return existing;
  const cleanups = [];
  root.querySelectorAll("[data-uif-event][data-uif-action],[data-uif-on]").forEach((el) => {
    parseActionSpec(el).forEach((spec) => {
      const listener = (event) => {
        if (!keyMatches(event, spec.key)) return;
        if (spec.prevent) event.preventDefault();
        if (spec.stop) event.stopPropagation();
        const target = resolveActionTarget(el, spec.target ?? el.dataset.uifTarget);
        void dispatchAction(spec.action, { source: el, target, event, value: el.dataset.uifValue });
      };
      el.addEventListener(spec.event, listener, { once: spec.once });
      cleanups.push(() => el.removeEventListener(spec.event, listener));
    });
  });
  const dispose = () => {
    cleanups.forEach((cleanup) => cleanup());
    boundRoots.delete(root);
  };
  boundRoots.set(root, dispose);
  return dispose;
}
registerAction("show", ({ target }) => {
  if (target) void show(target);
});
registerAction("hide", ({ target }) => {
  if (target) void hide(target);
});
registerAction("toggle", ({ target }) => {
  if (target) void toggle(target);
});
registerAction("animate", ({ source, target }) => {
  if (target) void animate(target, source.dataset.uifAnimation || "pop");
});
registerAction("add-class", ({ source, target }) => {
  const className = source.dataset.uifClass;
  if (target && className) target.classList.add(className);
});
registerAction("remove-class", ({ source, target }) => {
  const className = source.dataset.uifClass;
  if (target && className) target.classList.remove(className);
});
registerAction("toggle-class", ({ source, target }) => {
  const className = source.dataset.uifClass;
  if (target && className) target.classList.toggle(className);
});
registerAction("set-attribute", ({ source, target }) => {
  const attr = source.dataset.uifAttribute;
  if (target && attr) target.setAttribute(attr, source.dataset.uifValue ?? "");
});
registerAction("remove-attribute", ({ source, target }) => {
  const attr = source.dataset.uifAttribute;
  if (target && attr) target.removeAttribute(attr);
});
registerAction("set-value", ({ target, value }) => {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) target.value = value ?? "";
});
registerAction("copy", async ({ target, source }) => {
  const text = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.value : target?.textContent || source.dataset.uifValue || "";
  await navigator.clipboard?.writeText(text);
});
registerAction("scroll-to", ({ target }) => target?.scrollIntoView({ behavior: "smooth", block: "start" }));
registerAction("focus", ({ target }) => target?.focus());
registerAction("submit", ({ target }) => {
  if (target instanceof HTMLFormElement) target.requestSubmit();
});
registerAction("reset", ({ target }) => {
  if (target instanceof HTMLFormElement) target.reset();
});
registerAction("emit", ({ source, target, value }) => {
  emit(value || source.dataset.uifEventName || "uif:action", { source, target }, target || source);
});
export {
  bindActions,
  dispatchAction,
  parseActionSpec,
  registerAction,
  resolveActionTarget,
  unregisterAction
};
