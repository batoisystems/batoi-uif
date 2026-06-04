// src/index.ts
import { emit } from "@batoi/uif-core";
import { setSafeHTML, setText } from "@batoi/uif-dom";
import { animate, hide, show, toggle } from "@batoi/uif-effects";
var handlers = /* @__PURE__ */ new Map();
var boundRoots = /* @__PURE__ */ new WeakMap();
var debounceTimers = /* @__PURE__ */ new WeakMap();
var throttleTimes = /* @__PURE__ */ new WeakMap();
var diagnostics = [];
function getActionDiagnostics() {
  return [...diagnostics];
}
function clearActionDiagnostics() {
  diagnostics.length = 0;
}
function reportDiagnostic(diagnostic) {
  diagnostics.push(diagnostic);
  diagnostic.source.dataset.uifDiagnostic = diagnostic.message;
  emit("uif:action-diagnostic", diagnostic, diagnostic.source);
}
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
  if (!handler) {
    reportDiagnostic({ level: "warning", message: `Unknown action: ${action}`, source: context.source, action });
    return;
  }
  context.source.dataset.uifBusy = "true";
  context.source.setAttribute("aria-busy", "true");
  try {
    await handler({ ...context, action });
    context.source.dataset.uifState = "success";
  } catch (error) {
    context.source.dataset.uifState = "error";
    context.source.dataset.uifError = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    delete context.source.dataset.uifBusy;
    context.source.removeAttribute("aria-busy");
  }
}
async function dispatchActions(actions, context) {
  for (const action of actions) {
    if (!conditionMatches(action.condition)) continue;
    if (action.confirm && !window.confirm(action.confirm)) continue;
    const target = resolveActionTarget(context.source, action.target);
    if (action.target && !target) reportDiagnostic({ level: "warning", message: `Missing target: ${action.target}`, source: context.source, action: action.action });
    await dispatchAction(action.action, {
      ...context,
      target,
      value: action.value ?? context.value,
      params: { ...action.params, className: action.className, attribute: action.attribute }
    });
  }
}
function keyMatches(event, key) {
  if (!key || !(event instanceof KeyboardEvent)) return true;
  const normalized = key.toLowerCase();
  const actual = event.key.toLowerCase();
  return actual === normalized || normalized === "space" && actual === " " || normalized === "esc" && actual === "escape";
}
function parseActionSpec(el) {
  const specs = [];
  const parseMods = (mods) => ({
    prevent: mods.includes("prevent"),
    stop: mods.includes("stop"),
    once: mods.includes("once"),
    self: mods.includes("self"),
    outside: mods.includes("outside"),
    debounce: Number(mods.find((mod) => mod.startsWith("debounce:"))?.slice(9) || "") || void 0,
    throttle: Number(mods.find((mod) => mod.startsWith("throttle:"))?.slice(9) || "") || void 0,
    key: mods.find((mod) => !["prevent", "stop", "once", "self", "outside"].includes(mod) && !mod.startsWith("debounce:") && !mod.startsWith("throttle:"))
  });
  const rawActions = el.dataset.uifActions;
  if (rawActions) {
    const [event, ...mods] = (el.dataset.uifEvent || "click").split(".");
    let parsed = [];
    try {
      parsed = JSON.parse(rawActions);
    } catch {
      reportDiagnostic({ level: "error", message: "Invalid data-uif-actions JSON.", source: el });
    }
    specs.push({
      event,
      action: parsed[0]?.action || "",
      target: parsed[0]?.target,
      value: parsed[0]?.value,
      className: parsed[0]?.class,
      attribute: parsed[0]?.attribute,
      confirm: parsed[0]?.confirm ?? el.dataset.uifConfirm,
      condition: parsed[0]?.if ?? el.dataset.uifIf,
      params: parsed[0]?.params,
      chain: parsed.map((item) => ({
        event,
        action: item.action,
        target: item.target,
        value: item.value,
        className: item.class,
        attribute: item.attribute,
        confirm: item.confirm,
        condition: item.if,
        params: item.params
      })),
      ...parseMods(mods)
    });
  }
  const raw = el.dataset.uifOn;
  if (raw) {
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      reportDiagnostic({ level: "error", message: "Invalid data-uif-on JSON.", source: el });
    }
    Object.entries(parsed).forEach(([eventSpec, value]) => {
      const [event, ...mods] = eventSpec.split(".");
      const parsedMods = parseMods(mods);
      specs.push({
        ...parsedMods,
        event,
        action: value.action,
        target: value.target,
        prevent: value.prevent ?? parsedMods.prevent,
        stop: value.stop ?? parsedMods.stop,
        once: value.once ?? parsedMods.once,
        value: value.value,
        className: value.class,
        attribute: value.attribute,
        confirm: value.confirm ?? el.dataset.uifConfirm,
        condition: value.if ?? el.dataset.uifIf,
        params: value.params
      });
    });
  }
  if (el.dataset.uifEvent && el.dataset.uifAction) {
    const [event, ...mods] = el.dataset.uifEvent.split(".");
    const parsedMods = parseMods(mods);
    specs.push({
      event,
      action: el.dataset.uifAction,
      target: el.dataset.uifTarget,
      value: el.dataset.uifValue,
      className: el.dataset.uifClass,
      attribute: el.dataset.uifAttribute,
      confirm: el.dataset.uifConfirm,
      condition: el.dataset.uifIf,
      ...parsedMods,
      key: el.dataset.uifKey || parsedMods.key
    });
  }
  return specs;
}
function conditionMatches(condition) {
  if (!condition) return true;
  if (condition === "online") return navigator.onLine;
  if (condition === "offline") return !navigator.onLine;
  if (condition.startsWith("!")) return !document.querySelector(condition.slice(1));
  return Boolean(document.querySelector(condition));
}
function shouldRun(source, spec, event) {
  if (!keyMatches(event, spec.key)) return false;
  if (!conditionMatches(spec.condition)) return false;
  if (spec.self && event.target !== source) return false;
  if (spec.outside && source.contains(event.target)) return false;
  if (spec.throttle) {
    const timers = throttleTimes.get(source) ?? /* @__PURE__ */ new Map();
    throttleTimes.set(source, timers);
    const now = Date.now();
    const id = `${spec.event}:${spec.action}`;
    if (now - (timers.get(id) ?? 0) < spec.throttle) return false;
    timers.set(id, now);
  }
  return true;
}
function schedule(source, spec, run) {
  if (!spec.debounce) {
    run();
    return;
  }
  const timers = debounceTimers.get(source) ?? /* @__PURE__ */ new Map();
  debounceTimers.set(source, timers);
  const id = `${spec.event}:${spec.action}`;
  const existing = timers.get(id);
  if (existing) window.clearTimeout(existing);
  timers.set(id, window.setTimeout(run, spec.debounce));
}
function bindActions(root = document) {
  const existing = boundRoots.get(root);
  if (existing) return existing;
  const cleanups = [];
  root.querySelectorAll("[data-uif-event][data-uif-action],[data-uif-on],[data-uif-actions]").forEach((el) => {
    parseActionSpec(el).forEach((spec) => {
      const listener = (event) => {
        if (!shouldRun(el, spec, event)) return;
        if (spec.prevent) event.preventDefault();
        if (spec.stop) event.stopPropagation();
        schedule(el, spec, () => {
          if (spec.confirm && !window.confirm(spec.confirm)) return;
          if (spec.chain?.length) {
            void dispatchActions(spec.chain, { source: el, target: null, event, value: spec.value ?? el.dataset.uifValue });
            return;
          }
          const target = resolveActionTarget(el, spec.target ?? el.dataset.uifTarget);
          if ((spec.target ?? el.dataset.uifTarget) && !target) reportDiagnostic({ level: "warning", message: `Missing target: ${spec.target ?? el.dataset.uifTarget}`, source: el, action: spec.action });
          void dispatchAction(spec.action, {
            source: el,
            target,
            event,
            value: spec.value ?? el.dataset.uifValue,
            params: { ...spec.params, className: spec.className, attribute: spec.attribute }
          });
        });
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
registerAction("animate", ({ source, target, value, params }) => {
  if (target) void animate(target, String(params?.animation ?? value ?? source.dataset.uifAnimation ?? "pop"));
});
registerAction("add-class", ({ source, target, params }) => {
  const className = String(params?.className ?? source.dataset.uifClass ?? "");
  if (target && className) target.classList.add(className);
});
registerAction("remove-class", ({ source, target, params }) => {
  const className = String(params?.className ?? source.dataset.uifClass ?? "");
  if (target && className) target.classList.remove(className);
});
registerAction("toggle-class", ({ source, target, params }) => {
  const className = String(params?.className ?? source.dataset.uifClass ?? "");
  if (target && className) {
    const active = target.classList.toggle(className);
    source.setAttribute("aria-pressed", String(active));
    source.setAttribute("aria-expanded", String(active));
  }
});
registerAction("set-attribute", ({ source, target, params, value }) => {
  const attr = String(params?.attribute ?? source.dataset.uifAttribute ?? "");
  if (target && attr) target.setAttribute(attr, value ?? source.dataset.uifValue ?? "");
});
registerAction("remove-attribute", ({ source, target, params }) => {
  const attr = String(params?.attribute ?? source.dataset.uifAttribute ?? "");
  if (target && attr) target.removeAttribute(attr);
});
registerAction("set-value", ({ target, value }) => {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) target.value = value ?? "";
});
registerAction("set-text", ({ target, value }) => {
  setText(target, value ?? "");
});
registerAction("set-html-safe", ({ target, value }) => {
  setSafeHTML(target, value ?? "");
});
registerAction("copy", async ({ target, source }) => {
  const text = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.value : target?.textContent || source.dataset.uifValue || "";
  await navigator.clipboard?.writeText(text);
});
registerAction("scroll-to", ({ target }) => target?.scrollIntoView({ behavior: "smooth", block: "start" }));
registerAction("focus", ({ target }) => target?.focus());
registerAction("toggle-attribute", ({ source, target, params, value }) => {
  const attr = String(params?.attribute ?? source.dataset.uifAttribute ?? "");
  if (!target || !attr) return;
  if (target.hasAttribute(attr)) target.removeAttribute(attr);
  else target.setAttribute(attr, value ?? source.dataset.uifValue ?? "true");
});
registerAction("toggle-state", ({ source, target }) => {
  const state = source.dataset.uifValue || "active";
  if (!target) return;
  target.dataset.uifState = target.dataset.uifState === state ? "idle" : state;
});
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
  clearActionDiagnostics,
  dispatchAction,
  dispatchActions,
  getActionDiagnostics,
  parseActionSpec,
  registerAction,
  resolveActionTarget,
  unregisterAction
};
