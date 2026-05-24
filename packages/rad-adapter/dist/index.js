// src/index.ts
import { emit } from "@batoi/uif-core";
import { autoInit, resolveTarget, swapTrustedHTML } from "@batoi/uif-dom";
import { request } from "@batoi/uif-net";
var swapModes = /* @__PURE__ */ new Set(["inner", "outer", "append", "prepend", "before", "after"]);
var bodylessMethods = /* @__PURE__ */ new Set(["GET", "HEAD"]);
var boundRoots = /* @__PURE__ */ new WeakMap();
function normalizeSwapMode(mode) {
  return swapModes.has(mode ?? "") ? mode : "inner";
}
function setLoading(sourceEl, loading) {
  sourceEl.toggleAttribute("aria-busy", loading);
  const loadingTarget = sourceEl.dataset.uifLoading ? document.querySelector(sourceEl.dataset.uifLoading) : null;
  loadingTarget?.toggleAttribute("hidden", !loading);
}
function notify(message, type = "success") {
  if (!message) return;
  emit(type === "error" ? "uif:error" : "uif:success", { message });
}
function applyEvents(events) {
  events?.forEach((event) => {
    const target = event.target ? document.querySelector(event.target) : document;
    emit(event.name, event.detail, target ?? document);
  });
}
function applyActions(actions) {
  actions?.forEach((action) => {
    if (action.type === "toast") notify(String(action.message ?? ""), action.level || "success");
    if (action.type === "focus" && typeof action.target === "string") document.querySelector(action.target)?.focus();
    if (action.type === "redirect" && typeof action.url === "string") window.location.assign(action.url);
  });
}
function getAttr(sourceEl, name) {
  return sourceEl.getAttribute(name);
}
function requestUrl(src, sourceEl, method) {
  if (!(sourceEl instanceof HTMLFormElement) || !bodylessMethods.has(method)) return src;
  const url = new URL(src, window.location.href);
  new FormData(sourceEl).forEach((value, key) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}
function requestPayload(sourceEl, method) {
  if (bodylessMethods.has(method)) return void 0;
  if (sourceEl instanceof HTMLFormElement) return new FormData(sourceEl);
  if (method === "POST") return new FormData();
  return void 0;
}
function swapContent(targetEl, html, mode = "inner") {
  return swapTrustedHTML(targetEl, html, normalizeSwapMode(mode));
}
function rehydrate(targetEl) {
  autoInit(targetEl);
  emit("uif:rehydrate", { target: targetEl }, targetEl);
}
async function loadPartial(sourceEl) {
  const src = sourceEl.dataset.uifSrc || getAttr(sourceEl, "href") || getAttr(sourceEl, "action");
  if (!src) return null;
  if (sourceEl.dataset.uifConfirm && !window.confirm(sourceEl.dataset.uifConfirm)) return null;
  const method = (sourceEl.dataset.uifMethod || getAttr(sourceEl, "method") || "GET").toUpperCase();
  const url = requestUrl(src, sourceEl, method);
  setLoading(sourceEl, true);
  emit("uif:before-load", { source: sourceEl, src: url, method }, sourceEl);
  try {
    const result = await request(url, { method, body: requestPayload(sourceEl, method) });
    const fallbackTarget = resolveTarget(sourceEl, sourceEl.dataset.uifTarget ?? "self");
    const payload = typeof result === "string" ? { ok: true, html: result } : result;
    if (payload?.ok === false) throw new Error(payload.message || "Request failed");
    if (payload.redirect) {
      window.location.assign(payload.redirect);
      return payload;
    }
    const target = payload?.target ? document.querySelector(payload.target) : fallbackTarget;
    if (target && payload?.html) {
      const updated = swapContent(target, payload.html, payload.swap || sourceEl.dataset.uifSwap || "inner");
      rehydrate(updated);
    }
    if (payload.errors) emit("uif:field-errors", { source: sourceEl, errors: payload.errors }, sourceEl);
    applyEvents(payload.events);
    applyActions(payload.actions);
    if (payload.focus) document.querySelector(payload.focus)?.focus();
    notify(payload?.message || sourceEl.dataset.uifSuccess);
    emit("uif:load", { source: sourceEl, payload }, sourceEl);
    return payload;
  } catch (error) {
    notify(sourceEl.dataset.uifError || (error instanceof Error ? error.message : "Unable to load content"), "error");
    throw error;
  } finally {
    setLoading(sourceEl, false);
  }
}
function bindRadActions(root = document) {
  const existing = boundRoots.get(root);
  if (existing) return existing;
  const onClick = (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const el = target?.closest(
      '[data-uif="ajax"],[data-uif-action="load"],[data-uif-action="reload"],[data-uif-action="delete"],[data-uif-action="save"],[data-uif-action="swap"]'
    );
    if (!el) return;
    event.preventDefault();
    void loadPartial(el).catch(() => void 0);
  };
  const onSubmit = (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const form = target?.closest('form[data-uif="ajax"],form[data-uif-action="submit"],form[data-uif-action="save"]');
    if (!form) return;
    event.preventDefault();
    void loadPartial(form).catch(() => void 0);
  };
  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  const dispose = () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
    boundRoots.delete(root);
  };
  boundRoots.set(root, dispose);
  return dispose;
}
export {
  bindRadActions,
  loadPartial,
  rehydrate,
  swapContent
};
