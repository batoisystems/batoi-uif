// src/index.ts
import { emit } from "@batoi/uif-core";
import { autoInit, isSafeURL, resolveTarget, safeQuerySelector, swapTrustedHTML } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
var swapModes = /* @__PURE__ */ new Set(["inner", "outer", "append", "prepend", "before", "after"]);
var bodylessMethods = /* @__PURE__ */ new Set(["GET", "HEAD"]);
var boundRoots = /* @__PURE__ */ new WeakMap();
var requestKeys = /* @__PURE__ */ new WeakMap();
var requestRevisions = /* @__PURE__ */ new WeakMap();
var allowedMethods = /* @__PURE__ */ new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
var requestSequence = 0;
var MAX_HTML_LENGTH = 1e6;
var MAX_COLLECTION_ITEMS = 100;
var MAX_MESSAGE_LENGTH = 1e4;
function normalizeSwapMode(mode) {
  return swapModes.has(mode ?? "") ? mode : "inner";
}
function setLoading(sourceEl, loading) {
  sourceEl.toggleAttribute("aria-busy", loading);
  const loadingTarget = sourceEl.dataset.uifLoading ? safeQuerySelector(sourceEl.dataset.uifLoading) : null;
  loadingTarget?.toggleAttribute("hidden", !loading);
}
function notify(message, type = "success") {
  if (!message) return;
  emit(type === "error" ? "uif:error" : "uif:success", { message });
}
function applyEvents(events) {
  events?.forEach((event) => {
    const target = event.target ? safeQuerySelector(event.target) : document;
    emit(event.name, event.detail, target ?? document);
  });
}
function applyActions(actions) {
  actions?.forEach((action) => {
    if (action.type === "toast") notify(String(action.message ?? ""), action.level || "success");
    if (action.type === "focus" && typeof action.target === "string") safeQuerySelector(action.target)?.focus();
    if (action.type === "redirect" && typeof action.url === "string" && isSafeURL(action.url, { context: "navigation", sameOrigin: true })) window.location.assign(action.url);
  });
}
function getAttr(sourceEl, name) {
  return sourceEl.getAttribute(name);
}
function requestUrl(src, sourceEl, method) {
  const allowCrossOrigin = sourceEl.dataset.uifAllowCrossOrigin === "true";
  if (!isSafeURL(src, { context: "network", allowHash: false, sameOrigin: !allowCrossOrigin })) throw new Error("Batoi UIF blocked an unsafe RAD request URL");
  if (!(sourceEl instanceof HTMLFormElement) || !bodylessMethods.has(method)) return src;
  const url = new URL(src, window.location.href);
  new FormData(sourceEl).forEach((value, key) => {
    url.searchParams.append(key, typeof value === "string" ? value : value.name);
  });
  return url.toString();
}
function requestPayload(sourceEl, method) {
  if (bodylessMethods.has(method)) return void 0;
  if (sourceEl instanceof HTMLFormElement) return new FormData(sourceEl);
  if (method === "POST") return new FormData();
  return void 0;
}
function normalizeResponse(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("UIF_RAD_INVALID");
  const payload = result;
  if (payload.version !== void 0 && payload.version !== 1 && payload.version !== 2) throw new Error("UIF_RAD_VERSION");
  if (payload.html !== void 0 && (typeof payload.html !== "string" || payload.html.length > MAX_HTML_LENGTH)) throw new Error("UIF_RAD_LIMIT");
  if (payload.events && (!Array.isArray(payload.events) || payload.events.length > MAX_COLLECTION_ITEMS)) throw new Error("UIF_RAD_LIMIT");
  if (payload.actions && (!Array.isArray(payload.actions) || payload.actions.length > MAX_COLLECTION_ITEMS)) throw new Error("UIF_RAD_LIMIT");
  if (payload.errors && (typeof payload.errors !== "object" || Array.isArray(payload.errors) || Object.keys(payload.errors).length > MAX_COLLECTION_ITEMS)) throw new Error("UIF_RAD_LIMIT");
  payload.message = typeof payload.message === "string" ? payload.message.slice(0, MAX_MESSAGE_LENGTH) : void 0;
  payload.events = payload.events?.filter((event) => event && typeof event.name === "string" && event.name.length > 0 && event.name.length <= 200);
  payload.actions = payload.actions?.filter((action) => action && ["toast", "focus", "redirect"].includes(action.type));
  payload.errors = payload.errors ? Object.fromEntries(Object.entries(payload.errors).map(([name, messages]) => [name, Array.isArray(messages) ? messages.slice(0, 10).map((message) => String(message).slice(0, 2e3)) : []])) : void 0;
  return payload;
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
  const requestedMethod = (sourceEl.dataset.uifMethod || getAttr(sourceEl, "method") || "GET").toUpperCase();
  const method = allowedMethods.has(requestedMethod) ? requestedMethod : "GET";
  const url = requestUrl(src, sourceEl, method);
  const key = requestKeys.get(sourceEl) ?? `rad:${++requestSequence}`;
  requestKeys.set(sourceEl, key);
  const revision = (requestRevisions.get(sourceEl) ?? 0) + 1;
  requestRevisions.set(sourceEl, revision);
  setLoading(sourceEl, true);
  emit("uif:before-load", { source: sourceEl, src: url, method }, sourceEl);
  try {
    const result = await request(url, { key, method, body: requestPayload(sourceEl, method), credentials: "same-origin", timeout: 15e3 });
    const fallbackTarget = resolveTarget(sourceEl, sourceEl.dataset.uifTarget ?? "self");
    const payload = typeof result === "string" ? normalizeResponse({ ok: true, html: result }) : normalizeResponse(result);
    if (payload?.ok === false) throw new Error(payload.message || "Request failed");
    if (payload.redirect && isSafeURL(payload.redirect, { context: "navigation", sameOrigin: true })) {
      window.location.assign(payload.redirect);
      return payload;
    }
    const target = payload?.target ? safeQuerySelector(payload.target) : fallbackTarget;
    if (target && payload?.html) {
      const updated = swapContent(target, payload.html, payload.swap || sourceEl.dataset.uifSwap || "inner");
      rehydrate(updated);
    }
    if (payload.errors) emit("uif:field-errors", { source: sourceEl, errors: payload.errors }, sourceEl);
    applyEvents(payload.events);
    applyActions(payload.actions);
    if (payload.focus) safeQuerySelector(payload.focus)?.focus();
    notify(payload?.message || sourceEl.dataset.uifSuccess);
    emit("uif:load", { source: sourceEl, payload }, sourceEl);
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    notify(sourceEl.dataset.uifError || (error instanceof Error ? error.message : "Unable to load content"), "error");
    throw error;
  } finally {
    if (requestRevisions.get(sourceEl) === revision) setLoading(sourceEl, false);
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
    root.querySelectorAll('[data-uif-src],[data-uif="ajax"]').forEach((source) => {
      const key = requestKeys.get(source);
      if (key) cancelRequest(key);
      setLoading(source, false);
      requestKeys.delete(source);
      requestRevisions.delete(source);
    });
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
