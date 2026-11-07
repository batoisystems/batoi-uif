// src/internal.ts
import { emit } from "@batoi/uif-core/runtime";
import { partitionStorageKey } from "@batoi/uif-core/storage-partition";
var focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function setComponentState(el, open) {
  el.dataset.uifState = open ? "open" : "closed";
  el.toggleAttribute("hidden", !open);
  emit(open ? "uif:open" : "uif:close", { component: el.dataset.uif, el }, el);
}
function resolveComponentTarget(source) {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest("[data-uif]");
  if (expr === "self") return source;
  if (expr === "parent") return source.parentElement;
  try {
    if (expr.startsWith("closest:")) return source.closest(expr.slice(8));
    return document.querySelector(expr);
  } catch {
    return null;
  }
}
function eventElement(event) {
  return event.target instanceof HTMLElement ? event.target : null;
}
function storageGet(key) {
  if (!key) return null;
  try {
    return window.localStorage?.getItem(partitionStorageKey(key)) ?? null;
  } catch {
    return null;
  }
}
function storageSet(key, value) {
  if (!key) return;
  try {
    window.localStorage?.setItem(partitionStorageKey(key), value);
  } catch {
  }
}

export {
  focusableSelector,
  setComponentState,
  resolveComponentTarget,
  eventElement,
  storageGet,
  storageSet
};
