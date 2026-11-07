import {
  showToast
} from "./chunk-X5CNZCAQ.js";
import {
  eventElement,
  resolveComponentTarget
} from "./chunk-TH7UJRFA.js";

// src/controller.ts
import { emit } from "@batoi/uif-core/runtime";
var instances = /* @__PURE__ */ new WeakMap();
var owners = /* @__PURE__ */ new WeakMap();
var actionBindings = /* @__PURE__ */ new WeakMap();
var handledEvents = /* @__PURE__ */ new WeakSet();
function handleAction(event) {
  if (handledEvents.has(event)) return;
  const actionEl = eventElement(event)?.closest("[data-uif-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === "toast") {
    handledEvents.add(event);
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || "Notification", {
      type: actionEl.dataset.uifType || "info",
      duration: Number(actionEl.dataset.uifDuration) || void 0,
      placement: actionEl.dataset.uifPlacement,
      dismissible: actionEl.dataset.uifDismissible !== "false"
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const owner = target ? owners.get(target) : void 0;
  if (owner && !owner.contains(actionEl)) return;
  const instance = target ? instances.get(target) : null;
  const command = action && instance && Object.hasOwn(instance, action) ? instance[action] : void 0;
  if (typeof command === "function") {
    handledEvents.add(event);
    event.preventDefault();
    if (action === "open" || action === "toggle") command.call(instance, actionEl);
    else command.call(instance);
  }
}
function mountComponent(el, init, owner) {
  const existing = instances.get(el);
  if (existing) return existing;
  const controller = init(el);
  instances.set(el, controller);
  if (owner) owners.set(el, owner);
  emit("uif:init", { component: el.dataset.uif, el }, el);
  return controller;
}
function destroyComponent(el) {
  const controller = instances.get(el);
  instances.delete(el);
  owners.delete(el);
  try {
    controller?.destroy();
  } finally {
    emit("uif:destroy", { el }, el);
  }
}
function bindComponentActions(root = document) {
  const existing = actionBindings.get(root);
  if (existing) return existing;
  root.addEventListener("click", handleAction);
  const dispose = () => {
    root.removeEventListener("click", handleAction);
    actionBindings.delete(root);
  };
  actionBindings.set(root, dispose);
  return dispose;
}

export {
  handleAction,
  mountComponent,
  destroyComponent,
  bindComponentActions
};
