// packages/core/dist/index.js
function emit(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

// packages/effects/dist/index.js
var animationPresets = [
  { name: "fade-in", category: "entrance", duration: 180, description: "Fade content into view." },
  { name: "fade-out", category: "exit", duration: 180, description: "Fade content out of view." },
  { name: "slide-up", category: "entrance", duration: 220, description: "Slide upward into place." },
  { name: "slide-down", category: "entrance", duration: 220, description: "Slide downward into place." },
  { name: "slide-left", category: "entrance", duration: 220, description: "Slide left into place." },
  { name: "slide-right", category: "entrance", duration: 220, description: "Slide right into place." },
  { name: "slide-out-up", category: "exit", duration: 200, description: "Slide upward out of view." },
  { name: "slide-out-down", category: "exit", duration: 200, description: "Slide downward out of view." },
  { name: "scale-in", category: "entrance", duration: 180, description: "Scale content into view." },
  { name: "scale-out", category: "exit", duration: 180, description: "Scale content out of view." },
  { name: "pop", category: "attention", duration: 220, description: "Short emphasized pop." },
  { name: "pulse", category: "attention", duration: 420, repeat: true, description: "Pulse focus ring for attention." },
  { name: "shake", category: "attention", duration: 260, description: "Shake to show invalid state." },
  { name: "highlight", category: "attention", duration: 500, description: "Highlight changed content." },
  { name: "flash", category: "attention", duration: 380, description: "Flash content briefly." },
  { name: "bounce", category: "attention", duration: 420, description: "Bounce content into emphasis." },
  { name: "wiggle", category: "attention", duration: 420, description: "Small rotational attention motion." },
  { name: "shimmer", category: "loading", duration: 1100, repeat: true, description: "Loading shimmer." },
  { name: "spin", category: "loading", duration: 900, repeat: true, description: "Spinner rotation." },
  { name: "skeleton-pulse", category: "loading", duration: 1200, repeat: true, description: "Skeleton loading pulse." },
  { name: "crossfade", category: "layout", duration: 220, description: "Soft layout/content transition." }
];
var activeAnimations = /* @__PURE__ */ new WeakMap();
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
async function transition(el, className, options = {}) {
  if (prefersReducedMotion()) {
    el.classList.add(className);
    return;
  }
  await nextFrame();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  el.classList.add(className);
  await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
}
async function show(el, options = {}) {
  el.hidden = false;
  el.dataset.uifState = "open";
  await transition(el, options.className ?? "uif-is-visible", options);
}
async function hide(el, options = {}) {
  el.dataset.uifState = "closed";
  el.classList.remove(options.className ?? "uif-is-visible");
  if (!prefersReducedMotion()) await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
  el.hidden = true;
}
async function toggle(el, options = {}) {
  if (el.hidden || el.dataset.uifState === "closed") await show(el, options);
  else await hide(el, options);
}
async function expand(el, options = {}) {
  el.style.height = "0px";
  el.hidden = false;
  await nextFrame();
  el.style.height = `${el.scrollHeight}px`;
  await transition(el, options.className ?? "uif-is-expanded", options);
  el.style.height = "";
}
async function collapse(el, options = {}) {
  el.style.height = `${el.scrollHeight}px`;
  await nextFrame();
  el.style.height = "0px";
  await hide(el, options);
  el.style.height = "";
}
async function animate(el, animation, options = {}) {
  const className = options.className ?? `uif-animate-${animation}`;
  el.classList.remove(className, "uif-is-animating");
  if (prefersReducedMotion()) {
    el.dataset.uifAnimation = animation;
    return;
  }
  await nextFrame();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  const preset = animationPresets.find((item) => item.name === animation);
  const duration = options.duration ?? preset?.duration ?? 220;
  el.style.animationDuration = `${duration}ms`;
  if (options.easing) el.style.animationTimingFunction = options.easing;
  if (options.repeat) el.style.animationIterationCount = String(options.repeat);
  if (options.direction) el.style.animationDirection = options.direction;
  if (options.fill) el.style.animationFillMode = options.fill;
  el.classList.add("uif-is-animating", className);
  const token = Date.now();
  activeAnimations.set(el, token);
  await new Promise((resolve) => window.setTimeout(resolve, duration * (options.repeat ?? 1)));
  if (activeAnimations.get(el) !== token) return;
  el.classList.remove("uif-is-animating", className);
  el.style.animationDuration = "";
  el.style.animationTimingFunction = "";
  el.style.animationIterationCount = "";
  el.style.animationDirection = "";
  el.style.animationFillMode = "";
}

// packages/actions/src/index.ts
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
    const id2 = `${spec.event}:${spec.action}`;
    if (now - (timers.get(id2) ?? 0) < spec.throttle) return false;
    timers.set(id2, now);
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
  const id2 = `${spec.event}:${spec.action}`;
  const existing = timers.get(id2);
  if (existing) window.clearTimeout(existing);
  timers.set(id2, window.setTimeout(run, spec.debounce));
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
  if (target) target.textContent = value ?? "";
});
registerAction("set-html-safe", ({ target, value }) => {
  if (!target) return;
  const template = document.createElement("template");
  template.innerHTML = value ?? "";
  template.content.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((el) => el.remove());
  target.replaceChildren(template.content.cloneNode(true));
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

// packages/dom/dist/index.js
var initialized = /* @__PURE__ */ new WeakMap();
var registry = /* @__PURE__ */ new Map();
function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}
function resolveTarget(sourceEl, targetExpression = "self") {
  if (targetExpression === "self") return sourceEl;
  if (targetExpression === "parent") return sourceEl.parentElement;
  if (targetExpression.startsWith("closest:")) return sourceEl.closest(targetExpression.slice(8));
  if (targetExpression.startsWith("#") || targetExpression.startsWith(".")) {
    return document.querySelector(targetExpression);
  }
  return document.querySelector(targetExpression);
}
function setText(target, value) {
  if (!target) return;
  target.textContent = value == null ? "" : String(value);
}
function appendTextElement(parent, tagName, text, className) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  setText(el, text);
  parent.append(el);
  return el;
}
function setTrustedHTML(target, html, options = {}) {
  if (!target) return;
  if (!options.trusted) {
    throw new Error(`Batoi UIF refused untrusted HTML${options.context ? ` for ${options.context}` : ""}`);
  }
  target.innerHTML = html;
}
function swapTrustedHTML(targetEl, html, mode = "inner") {
  if (mode === "inner") {
    setTrustedHTML(targetEl, html, { trusted: true, context: "swap" });
    return targetEl;
  }
  if (mode === "append") targetEl.insertAdjacentHTML("beforeend", html);
  if (mode === "prepend") targetEl.insertAdjacentHTML("afterbegin", html);
  if (mode === "before") targetEl.insertAdjacentHTML("beforebegin", html);
  if (mode === "after") targetEl.insertAdjacentHTML("afterend", html);
  if (mode === "outer") {
    targetEl.insertAdjacentHTML("afterend", html);
    const updated = targetEl.nextElementSibling;
    targetEl.remove();
    return updated instanceof HTMLElement ? updated : document.body;
  }
  return targetEl;
}
function candidates(root) {
  const own = root instanceof HTMLElement && root.matches("[data-uif]") ? [root] : [];
  return own.concat(qsa("[data-uif]", root));
}
function mount(root = document) {
  candidates(root).forEach((el) => {
    if (initialized.has(el)) return;
    const key = el.getAttribute("data-uif");
    if (!key) return;
    const component = registry.get(key);
    if (!component) return;
    component.init(el);
    initialized.set(el, component);
  });
}
function autoInit(root = document) {
  mount(root);
}

// packages/ai/src/index.ts
function renderAIAction(el) {
  const agent = el.dataset.uifAgent || "assistant";
  const tool = el.dataset.uifTool || "action";
  const card2 = document.createElement("div");
  card2.className = "uif-ai-card";
  appendTextElement(card2, "strong", agent);
  appendTextElement(card2, "p", tool);
  const button2 = document.createElement("button");
  button2.type = "button";
  button2.dataset.uifAction = "open";
  button2.textContent = "Start";
  card2.append(button2);
  el.replaceChildren(card2);
}
function renderPromptPanel(el, history2 = []) {
  const form2 = document.createElement("form");
  form2.className = "uif-ai-prompt";
  form2.dataset.uifRole = "prompt";
  const textarea = document.createElement("textarea");
  textarea.name = "prompt";
  textarea.dataset.uifRole = "input";
  const historyEl = document.createElement("div");
  historyEl.className = "uif-ai-history";
  history2.forEach((item) => {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.textContent = item;
    historyEl.append(button2);
  });
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Send";
  form2.append(textarea, historyEl, submit);
  el.replaceChildren(form2);
}
function renderAssistantResponse(el, content) {
  const response = document.createElement("div");
  response.className = "uif-ai-response";
  response.textContent = content;
  response.setAttribute("role", "status");
  el.replaceChildren(response);
}
function appendStreamingChunk(el, chunk) {
  el.textContent = `${el.textContent || ""}${chunk}`;
}
function createStreamSurface(el) {
  const controller = new AbortController();
  el.dataset.uifState = "streaming";
  return {
    append(chunk) {
      if (!controller.signal.aborted) appendStreamingChunk(el, chunk);
    },
    cancel() {
      controller.abort();
      el.dataset.uifState = "cancelled";
    }
  };
}
function renderAIResultCard(el, content) {
  const card2 = document.createElement("div");
  card2.className = "uif-ai-result";
  card2.setAttribute("role", "region");
  const contentEl = appendTextElement(card2, "div", content);
  contentEl.dataset.uifRole = "content";
  ["accept", "reject", "copy", "insert"].forEach((action) => {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.dataset.uifAction = action;
    button2.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card2.append(button2);
  });
  el.replaceChildren(card2);
}
var aiAction = { name: "ai-action", init: renderAIAction };

// packages/net/dist/index.js
var requestInterceptors = [];
var responseInterceptors = [];
var controllers = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
async function parseResponse(response, parseAs) {
  if (parseAs === "response") return response;
  const contentType = response.headers.get("content-type") || "";
  if (parseAs === "json" || parseAs !== "text" && contentType.includes("application/json")) {
    return response.status === 204 ? null : response.json();
  }
  return response.text();
}
function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function requestKey(url, options) {
  return options.key || `${options.method || "GET"} ${url}`;
}
function cancelRequest(key) {
  controllers.get(key)?.abort();
  controllers.delete(key);
  pending.delete(key);
}
function withCsrf(headers, options) {
  if (!options.csrfToken) return headers;
  return { ...headers ?? {}, [options.csrfHeader || "x-csrf-token"]: options.csrfToken };
}
async function request(url, options = {}) {
  const key = requestKey(url, options);
  if (options.dedupe && pending.has(key)) return pending.get(key);
  cancelRequest(key);
  const controller = new AbortController();
  controllers.set(key, controller);
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : void 0;
  let req = { ...options, headers: withCsrf(options.headers, options), signal: controller.signal };
  const runner = async () => {
    for (const interceptor of requestInterceptors) {
      const next = await interceptor(url, req);
      if (next) req = next;
    }
    emit("uif:request", { url, options: req });
    const attempts = Math.max(0, req.retries ?? 0) + 1;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        let response = await fetch(url, req);
        for (const interceptor of responseInterceptors) {
          const next = await interceptor(response);
          if (next) response = next;
        }
        emit("uif:response", { url, response, attempt });
        const data = await parseResponse(response, req.parseAs);
        emit(response.ok ? "uif:success" : "uif:error", { url, response, data, attempt });
        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`);
          error.status = response.status;
          error.response = response;
          error.data = data;
          throw error;
        }
        return data;
      } catch (error) {
        lastError = error;
        if (attempt >= attempts || controller.signal.aborted) break;
        await delay(req.retryDelay ?? 250 * attempt);
      }
    }
    emit("uif:error", { url, error: lastError });
    throw lastError;
  };
  const promise = runner().finally(() => {
    if (timeout) window.clearTimeout(timeout);
    controllers.delete(key);
    pending.delete(key);
    emit("uif:complete", { url, key });
  });
  pending.set(key, promise);
  return promise;
}

// packages/charts/src/index.ts
var controllers2 = /* @__PURE__ */ new WeakMap();
var exportBindings = /* @__PURE__ */ new WeakMap();
var defaultPalette = [
  "var(--uif-chart-1,var(--uif-color-primary))",
  "var(--uif-chart-2,var(--uif-color-success))",
  "var(--uif-chart-3,var(--uif-color-warning))",
  "var(--uif-chart-4,var(--uif-color-danger))",
  "var(--uif-chart-5,var(--uif-color-info))",
  "var(--uif-chart-6,#7c3aed)",
  "var(--uif-chart-7,#0f766e)",
  "var(--uif-chart-8,#9333ea)"
];
var namedPalettes = {
  default: defaultPalette,
  professional: ["#0b72bd", "#00a88f", "#e4a700", "#df3158", "#7c3aed", "#0f766e"],
  categorical: ["#0b72bd", "#00a88f", "#e4a700", "#df3158", "#7c3aed", "#d9468f", "#475467"],
  status: ["#00a88f", "#0b72bd", "#e4a700", "#df3158"],
  sequential: ["#d9ecff", "#9dccf4", "#5ba6df", "#1f7dc1", "#0b4f86"],
  diverging: ["#df3158", "#f59e0b", "#e5e7eb", "#00a88f", "#0b72bd"]
};
var chartIdCounter = 0;
function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function uid(options, type) {
  const seed = `${options.id || options.label || type}-${options.width || 0}-${options.height || 0}`.toLowerCase();
  const clean = seed.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `uif-chart-${clean || type}`;
}
function paletteFor(options) {
  if (Array.isArray(options.palette)) return options.palette;
  return namedPalettes[options.palette ?? "default"] ?? defaultPalette;
}
function cleanValues(values) {
  return values.map(Number).filter(Number.isFinite);
}
function quantile(values, q) {
  const sorted = cleanValues(values).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + ((sorted[base + 1] ?? sorted[base]) - sorted[base]) * rest;
}
function summaryStats(values) {
  const nums = cleanValues(values);
  const count = nums.length;
  const sum = nums.reduce((total, value) => total + value, 0);
  const mean = count ? sum / count : 0;
  const variance = count ? nums.reduce((total, value) => total + (value - mean) ** 2, 0) / count : 0;
  const q1 = quantile(nums, 0.25);
  const q3 = quantile(nums, 0.75);
  return {
    count,
    min: count ? Math.min(...nums) : 0,
    max: count ? Math.max(...nums) : 0,
    sum,
    mean,
    median: quantile(nums, 0.5),
    variance,
    stddev: Math.sqrt(variance),
    q1,
    q3,
    iqr: q3 - q1
  };
}
function movingAverage(values, windowSize) {
  const nums = cleanValues(values);
  const size = Math.max(1, Math.floor(windowSize));
  return nums.map((_, index) => {
    const slice = nums.slice(Math.max(0, index - size + 1), index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}
function cumulativeSum(values) {
  let total = 0;
  return cleanValues(values).map((value) => {
    total += value;
    return total;
  });
}
function percentChange(values) {
  const nums = cleanValues(values);
  return nums.map((value, index) => {
    const previous = nums[index - 1];
    return index === 0 || !previous ? 0 : (value - previous) / Math.abs(previous) * 100;
  });
}
function zScores(values) {
  const stats = summaryStats(values);
  return cleanValues(values).map((value) => stats.stddev ? (value - stats.mean) / stats.stddev : 0);
}
function histogramBins(values, options = {}) {
  const nums = cleanValues(values);
  if (!nums.length) return [];
  const min = options.min ?? Math.min(...nums);
  const max = options.max ?? Math.max(...nums);
  const binCount = Math.max(1, Math.floor(options.bins ?? Math.ceil(Math.sqrt(nums.length))));
  const span = max - min || 1;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    x0: min + span / binCount * index,
    x1: min + span / binCount * (index + 1),
    count: 0
  }));
  nums.forEach((value) => {
    const index = value === max ? binCount - 1 : Math.floor((value - min) / span * binCount);
    bins[Math.max(0, Math.min(binCount - 1, index))].count += 1;
  });
  return bins;
}
function correlation(pointsOrX, yValues) {
  const points = Array.isArray(yValues) ? pointsOrX.map((x, index) => ({ x, y: yValues[index] })) : pointsOrX;
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return 0;
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const xDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0));
  const yDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0));
  return xDen && yDen ? numerator / (xDen * yDen) : 0;
}
function linearRegression(points) {
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return { slope: 0, intercept: clean[0]?.y ?? 0, r: 0, r2: 0, predict: (x) => clean[0]?.y ?? x * 0 };
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  const r = correlation(clean);
  return { slope, intercept, r, r2: r * r, predict: (x) => slope * x + intercept };
}
function margins(options) {
  return { top: 16, right: 18, bottom: options.axes === false ? 18 : 34, left: options.axes === false ? 18 : 42, ...options.margin };
}
function coerceNumber(raw, options) {
  const value = Number(raw);
  if (Number.isFinite(value)) return value;
  if (options.invalidValue === "error") throw new Error(`Invalid chart value: ${String(raw)}`);
  return options.invalidValue === "skip" ? void 0 : 0;
}
function valueOf(datum, options) {
  const raw = options.y && datum[options.y] != null ? datum[options.y] : datum.value;
  return coerceNumber(raw, options);
}
function labelOf(datum, options) {
  const raw = options.x && datum[options.x] != null ? datum[options.x] : datum.label;
  return String(raw ?? "");
}
function normalizeData(data, options) {
  return data.map((item) => ({ ...item, label: labelOf(item, options), value: valueOf(item, options) })).filter((item) => item.value != null || options.invalidValue !== "skip");
}
function coerceData(data) {
  return data.map((item, index) => typeof item === "number" ? { label: String(index + 1), value: item } : item);
}
function inferSeries(data, options) {
  if (options.series?.length) return options.series;
  const keys = /* @__PURE__ */ new Set();
  data.forEach((datum) => Object.keys(datum.values ?? {}).forEach((key) => keys.add(key)));
  return [...keys];
}
function fmt(value, options) {
  return options.formatValue ? options.formatValue(value) : String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
}
function extent(values, options) {
  const min = options.min ?? Math.min(0, ...values);
  const max = options.max ?? Math.max(1, ...values);
  return min === max ? [Math.min(0, min), max + 1] : [min, max];
}
function scaleLinear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + (value - d0) / span * (r1 - r0);
}
function pointString(points) {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
}
function round(value) {
  return Math.round(value * 100) / 100;
}
function polar(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}
function arcPath(cx, cy, outer, start2, end, inner = 0) {
  const large = end - start2 > Math.PI ? 1 : 0;
  const [sx, sy] = polar(cx, cy, outer, start2);
  const [ex, ey] = polar(cx, cy, outer, end);
  if (inner <= 0) return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} Z`;
  const [isx, isy] = polar(cx, cy, inner, end);
  const [iex, iey] = polar(cx, cy, inner, start2);
  return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}
function fullDonutPath(cx, cy, outer, inner) {
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx + outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx - outer} ${cy} M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx - inner} ${cy} Z`;
}
function markAttrs(label, options, meta = {}) {
  const interactive = options.focusable || Boolean(options.drilldown);
  const focus = interactive ? ' tabindex="0" role="button"' : "";
  const aria = interactive ? ` aria-label="${esc(label)}"` : "";
  const index = meta.index == null ? "" : ` data-uif-chart-index="${meta.index}"`;
  const value = meta.value == null ? "" : ` data-uif-chart-value="${esc(meta.value)}"`;
  const series = meta.series == null ? "" : ` data-uif-series="${esc(meta.series)}"`;
  return `class="uif-chart-mark"${focus}${aria} data-uif-chart-label="${esc(label)}"${index}${value}${series}`;
}
function axisAndGrid(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const yy = y(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${yy + 4}" text-anchor="end">${esc(fmt(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function verticalValueGrid(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const xx = x(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${xx}" y1="${plot.top}" x2="${xx}" y2="${height - plot.bottom}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${xx}" y="${height - 8}" text-anchor="middle">${esc(fmt(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function svgWrap(type, width, height, content, data, options) {
  const id2 = uid(options, type);
  const title = options.label || `${type} chart`;
  const desc = options.description || data.map((d) => `${d.label ?? "item"} ${fmt(valueOf(d, options) ?? 0, options)}`).join(", ");
  const table2 = options.table ? chartDataTable(data, options, id2) : "";
  return `<svg class="uif-chart-svg uif-chart-${type}" viewBox="0 0 ${width} ${height}" role="img" aria-roledescription="chart" aria-labelledby="${id2}-title ${id2}-desc"><title id="${id2}-title">${esc(title)}</title><desc id="${id2}-desc">${esc(desc)}</desc>${content}</svg>${table2}`;
}
function chartDataTable(data, options, id2) {
  const series = inferSeries(data, options);
  const headers = ["Label", ...series.length ? series : ["Value"]];
  const rows2 = data.map((datum) => {
    const cells = series.length ? series.map((key) => fmt(Number(datum.values?.[key] ?? 0), options)) : [fmt(datum.value ?? 0, options)];
    return `<tr><th scope="row">${esc(datum.label ?? "")}</th>${cells.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`;
  }).join("");
  const hidden = options.table === "sr-only" ? " uif-sr-only" : "";
  return `<table id="${id2}-table" class="uif-chart-data-table${hidden}"><caption>${esc(options.label || "Chart data")}</caption><thead><tr>${headers.map((header) => `<th scope="col">${esc(header)}</th>`).join("")}</tr></thead><tbody>${rows2}</tbody></table>`;
}
function legend(items, options) {
  if (!options.legend || !items.length) return "";
  const palette = paletteFor(options);
  return `<div class="uif-chart-legend" data-uif-placement="${options.legend === true ? "bottom" : options.legend}">${items.map((item, i) => `<span><i style="background:${palette[i % palette.length]}"></i>${esc(item)}</span>`).join("")}</div>`;
}
function renderLineLike(data, options, area = false, sparkline = false) {
  const width = options.width ?? (sparkline ? 160 : 360);
  const height = options.height ?? (sparkline ? 64 : 200);
  const plot = sparkline ? { top: 6, right: 6, bottom: 6, left: 6 } : margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = paletteFor(options);
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const y = scaleLinear(extent(values, options), [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const renderSeries = (name, index) => {
    const points = normalized.map((d, i) => [plot.left + i * xStep, y(name ? Number(d.values?.[name] ?? 0) : d.value ?? 0)]);
    const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="${esc(name ?? "value")}" points="${pointString(points)}" fill="none" style="stroke:${palette[index % palette.length]}"></polyline>`;
    const fill = area ? `<polygon class="uif-chart-area" points="${plot.left},${height - plot.bottom} ${pointString(points)} ${width - plot.right},${height - plot.bottom}" style="fill:${palette[index % palette.length]}"></polygon>` : "";
    const marks = sparkline || options.labels === false ? "" : points.map(([cx, cy], i) => {
      const value = name ? Number(normalized[i].values?.[name] ?? 0) : normalized[i].value ?? 0;
      const label = `${name ? `${name} ` : ""}${normalized[i].label ?? ""}: ${fmt(value, options)}`;
      return `<circle ${markAttrs(label, options, { index: i, value, series: name ?? void 0 })} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
    }).join("");
    return `${fill}${line}${marks}`;
  };
  const body = `${sparkline ? "" : axisAndGrid(width, height, plot, extent(values, options), options)}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`;
  return `${svgWrap(sparkline ? "sparkline" : area ? "area" : "line", width, height, body, normalized, options)}${legend(series, options)}`;
}
function renderBars(data, options, mode) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const palette = paletteFor(options);
  const values = series.length && mode === "stacked-bar" ? normalized.flatMap((d) => {
    let positive = 0;
    let negative = 0;
    series.forEach((key) => {
      const value = Number(d.values?.[key] ?? 0);
      if (value >= 0) positive += value;
      else negative += value;
    });
    return [negative, positive];
  }) : series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const domain = extent(values, options);
  const vertical = mode !== "horizontal-bar";
  const major = vertical ? width - plot.left - plot.right : height - plot.top - plot.bottom;
  const band = major / Math.max(1, normalized.length);
  const zeroY = scaleLinear(domain, [height - plot.bottom, plot.top])(0);
  const zeroX = scaleLinear(domain, [plot.left, width - plot.right])(0);
  const yScale = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const xScale = scaleLinear(domain, [plot.left, width - plot.right]);
  const bars = normalized.map((d, i) => {
    if (series.length && mode === "stacked-bar") {
      let positiveOffset = 0;
      let negativeOffset = 0;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const start2 = value2 >= 0 ? positiveOffset : negativeOffset;
        const end = start2 + value2;
        if (value2 >= 0) positiveOffset = end;
        else negativeOffset = end;
        const y0 = yScale(start2);
        const y1 = yScale(end);
        const x2 = plot.left + i * band + band * 0.18;
        const w = band * 0.64;
        const h = Math.abs(y1 - y0);
        const label2 = `${d.label ?? ""} ${key}: ${fmt(value2, options)}`;
        return `<rect ${markAttrs(label2, options, { index: i, value: value2, series: key })} x="${round(x2)}" y="${round(Math.min(y0, y1))}" width="${round(w)}" height="${round(h)}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label2)}</title></rect>`;
      }).join("");
    }
    if (series.length && mode === "grouped-bar") {
      const inner = band * 0.72 / series.length;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const y2 = yScale(value2);
        const x2 = plot.left + i * band + band * 0.14 + s * inner;
        const label2 = `${d.label ?? ""} ${key}: ${fmt(value2, options)}`;
        return `<rect ${markAttrs(label2, options, { index: i, value: value2, series: key })} x="${round(x2)}" y="${round(Math.min(y2, zeroY))}" width="${round(inner * 0.86)}" height="${round(Math.abs(zeroY - y2))}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc(label2)}</title></rect>`;
      }).join("");
    }
    const value = d.value ?? 0;
    const label = `${d.label ?? ""}: ${fmt(value, options)}`;
    if (!vertical) {
      const x2 = xScale(value);
      const y2 = plot.top + i * band + band * 0.18;
      return `<rect ${markAttrs(label, options, { index: i, value })} x="${round(Math.min(x2, zeroX))}" y="${round(y2)}" width="${round(Math.abs(x2 - zeroX))}" height="${round(band * 0.64)}" rx="3"><title>${esc(label)}</title></rect>`;
    }
    const y = yScale(value);
    const x = plot.left + i * band + band * 0.18;
    return `<rect ${markAttrs(label, options, { index: i, value })} x="${round(x)}" y="${round(Math.min(y, zeroY))}" width="${round(band * 0.64)}" height="${round(Math.abs(zeroY - y))}" rx="3"><title>${esc(label)}</title></rect>`;
  }).join("");
  const labels = options.axes === false ? "" : normalized.map(
    (d, i) => vertical ? `<text class="uif-chart-axis-label" x="${round(plot.left + i * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc(d.label)}</text>` : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${round(plot.top + i * band + band / 2 + 4)}" text-anchor="end">${esc(d.label)}</text>`
  ).join("");
  const grid = vertical ? axisAndGrid(width, height, plot, domain, options) : verticalValueGrid(width, height, plot, domain, options);
  return `${svgWrap(mode, width, height, `${grid}${bars}${labels}`, normalized, options)}${legend(series, options)}`;
}
function renderPie(data, options, donut = false) {
  const width = options.width ?? 180;
  const height = options.height ?? 180;
  const normalized = normalizeData(data, options).filter((d) => (d.value ?? 0) > 0);
  const palette = paletteFor(options);
  const total = normalized.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (!total) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No positive values to chart")}</div>`;
  const radius = Math.min(width, height) / 2 - 10;
  const inner = donut ? radius * 0.55 : 0;
  let angle = -Math.PI / 2;
  const paths = normalized.map((d, i) => {
    const next = angle + (d.value ?? 0) / total * Math.PI * 2;
    const label = `${d.label ?? ""}: ${fmt(d.value ?? 0, options)}`;
    const fill = d.color || palette[i % palette.length];
    const path = normalized.length === 1 && !donut ? `<circle ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} cx="${width / 2}" cy="${height / 2}" r="${radius}" style="fill:${fill}"><title>${esc(label)}</title></circle>` : `<path ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} d="${normalized.length === 1 && donut ? fullDonutPath(width / 2, height / 2, radius, inner) : arcPath(width / 2, height / 2, radius, angle, next, inner)}" ${normalized.length === 1 && donut ? 'fill-rule="evenodd" ' : ""}style="fill:${fill}"><title>${esc(label)}</title></path>`;
    angle = next;
    return path;
  }).join("");
  return `${svgWrap(donut ? "donut" : "pie", width, height, paths, normalized, options)}${legend(
    normalized.map((d) => d.label ?? ""),
    options
  )}`;
}
function renderRadar(data, options) {
  const width = options.width ?? 260;
  const height = options.height ?? 260;
  const normalized = normalizeData(data, options);
  const series = inferSeries(normalized, options);
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const max = options.max ?? Math.max(1, ...values);
  const min = options.min ?? 0;
  const palette = paletteFor(options);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 34;
  const axes = normalized.map((d, i) => {
    const angle = -Math.PI / 2 + i / normalized.length * Math.PI * 2;
    const [x, y] = polar(cx, cy, radius, angle);
    const [lx, ly] = polar(cx, cy, radius + 16, angle);
    return `<line class="uif-chart-grid" x1="${cx}" y1="${cy}" x2="${round(x)}" y2="${round(y)}"></line><text class="uif-chart-axis-label" x="${round(lx)}" y="${round(ly)}" text-anchor="middle">${esc(d.label)}</text>`;
  }).join("");
  const rings = [0.25, 0.5, 0.75, 1].map((factor) => {
    const pts = normalized.map((_, i) => polar(cx, cy, radius * factor, -Math.PI / 2 + i / normalized.length * Math.PI * 2));
    return `<polygon class="uif-chart-grid-polygon" points="${pointString(pts)}"></polygon>`;
  }).join("");
  const renderSeries = (name, index) => {
    const pts = normalized.map((d, i) => {
      const value = name ? Number(d.values?.[name] ?? 0) : d.value ?? 0;
      const r = (value - min) / (max - min || 1) * radius;
      return polar(cx, cy, r, -Math.PI / 2 + i / normalized.length * Math.PI * 2);
    });
    return `<polygon class="uif-chart-radar-area" data-uif-series="${esc(name ?? "value")}" points="${pointString(pts)}" style="stroke:${palette[index % palette.length]};fill:${palette[index % palette.length]}"></polygon>`;
  };
  return `${svgWrap("radar", width, height, `${rings}${axes}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`, normalized, options)}${legend(series, options)}`;
}
function renderSparkline(data, options) {
  if (options.sparklineType === "bar") return renderBars(data, { ...options, width: options.width ?? 160, height: options.height ?? 56, axes: false, grid: false }, "bar");
  return renderLineLike(data, { ...options, axes: false, grid: false, labels: false }, false, true);
}
function renderMetric(data, options) {
  const first = normalizeData(data, options)[0];
  return `<div class="uif-chart-metric" role="img" aria-label="${esc(options.label || first?.label || "Metric")}: ${esc(fmt(first?.value ?? 0, options))}"><strong>${esc(fmt(first?.value ?? 0, options))}</strong><span>${esc(first?.label ?? options.label ?? "Metric")}</span></div>`;
}
function renderRing(data, options, type) {
  const width = options.width ?? 140;
  const height = options.height ?? (type === "gauge" ? 90 : 140);
  const datum = normalizeData(data, options)[0];
  const value = datum?.value ?? 0;
  const max = options.max ?? datum?.max ?? 100;
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  if (type === "gauge") {
    const start2 = Math.PI;
    const end = Math.PI + pct * Math.PI;
    const bg = arcPath(width / 2, height - 8, 58, Math.PI, Math.PI * 2, 46);
    const fg = arcPath(width / 2, height - 8, 58, start2, end, 46);
    return svgWrap("gauge", width, height, `<path class="uif-chart-ring-bg" d="${bg}"></path><path class="uif-chart-value" d="${fg}"></path><text x="${width / 2}" y="${height - 18}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
  }
  const dash = round(pct * 283);
  return svgWrap(type, width, height, `<circle class="uif-chart-ring-bg" cx="${width / 2}" cy="${height / 2}" r="45"></circle><circle class="uif-chart-value" cx="${width / 2}" cy="${height / 2}" r="45" stroke-dasharray="${dash} 283"></circle><text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle">${esc(fmt(value, options))}</text>`, [datum], options);
}
function renderBullet(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 72;
  const datum = normalizeData(data, options)[0];
  const max = options.max ?? datum?.max ?? 100;
  const x = scaleLinear([0, max], [24, width - 18]);
  const value = Math.max(0, Math.min(max || 0, datum?.value ?? 0));
  const target = datum?.target ?? max;
  const content = `<rect class="uif-chart-range" x="24" y="24" width="${width - 42}" height="18"></rect><rect class="uif-chart-value-bar" x="24" y="24" width="${round(x(value) - 24)}" height="18"></rect><line class="uif-chart-target" x1="${round(x(target))}" y1="18" x2="${round(x(target))}" y2="48"></line><text class="uif-chart-axis-label" x="24" y="62">${esc(datum?.label ?? "")}</text>`;
  return svgWrap("bullet", width, height, content, [datum], options);
}
function renderHeatmap(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const normalized = normalizeData(data, options);
  const cols = Math.ceil(Math.sqrt(normalized.length || 1));
  const cell = Math.min((width - 20) / cols, (height - 20) / Math.ceil(normalized.length / cols));
  const max = Math.max(1, ...normalized.map((d) => d.value ?? 0));
  const cells = normalized.map((d, i) => {
    const opacity = 0.2 + (d.value ?? 0) / max * 0.8;
    const x = 10 + i % cols * cell;
    const y = 10 + Math.floor(i / cols) * cell;
    const label = `${d.label ?? ""}: ${fmt(d.value ?? 0, options)}`;
    return `<rect ${markAttrs(label, options, { index: i, value: d.value ?? 0 })} x="${round(x)}" y="${round(y)}" width="${round(cell - 3)}" height="${round(cell - 3)}" rx="3" style="opacity:${round(opacity)}"><title>${esc(label)}</title></rect>`;
  }).join("");
  return svgWrap("heatmap", width, height, cells, normalized, options);
}
function renderHistogram(data, options, distribution = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const bins = histogramBins(normalized.map((d) => d.value ?? 0), { bins: options.bins, min: options.min, max: options.max });
  if (!bins.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  const x = scaleLinear([bins[0].x0, bins[bins.length - 1].x1], [plot.left, width - plot.right]);
  const y = scaleLinear([0, Math.max(1, ...bins.map((bin) => bin.count))], [height - plot.bottom, plot.top]);
  if (distribution) {
    const points = bins.map((bin) => [x((bin.x0 + bin.x1) / 2), y(bin.count)]);
    const body = `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}<polyline class="uif-chart-series uif-chart-line" points="${pointString(points)}" fill="none"></polyline>`;
    return svgWrap("distribution", width, height, body, normalized, { ...options, description: options.description || "Binned distribution line" });
  }
  const bars = bins.map((bin, binIndex) => {
    const x0 = x(bin.x0);
    const x1 = x(bin.x1);
    const yy = y(bin.count);
    const label = `${fmt(bin.x0, options)}-${fmt(bin.x1, options)}: ${bin.count}`;
    return `<rect ${markAttrs(label, options, { index: binIndex, value: bin.count })} x="${round(x0 + 1)}" y="${round(yy)}" width="${round(Math.max(1, x1 - x0 - 2))}" height="${round(height - plot.bottom - yy)}" rx="2"><title>${esc(label)}</title></rect>`;
  }).join("");
  return svgWrap("histogram", width, height, `${axisAndGrid(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}${bars}`, normalized, options);
}
function renderBoxPlot(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const plot = margins({ ...options, margin: { top: 18, right: 20, bottom: 28, left: 34, ...options.margin } });
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  if (!stats.count) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  const domain = extent([stats.min, stats.max], options);
  const x = scaleLinear(domain, [plot.left, width - plot.right]);
  const cy = (height - plot.bottom + plot.top) / 2;
  const boxTop = cy - 22;
  const boxHeight = 44;
  const content = `${verticalValueGrid(width, height, plot, domain, options)}<line class="uif-chart-grid" x1="${round(x(stats.min))}" y1="${cy}" x2="${round(x(stats.max))}" y2="${cy}"></line><rect ${markAttrs(`Q1 ${fmt(stats.q1, options)} to Q3 ${fmt(stats.q3, options)}`, options, { value: stats.median }).replace('class="uif-chart-mark"', 'class="uif-chart-mark uif-chart-box"')} x="${round(x(stats.q1))}" y="${boxTop}" width="${round(Math.max(1, x(stats.q3) - x(stats.q1)))}" height="${boxHeight}" rx="3"><title>Q1 ${esc(fmt(stats.q1, options))}, median ${esc(fmt(stats.median, options))}, Q3 ${esc(fmt(stats.q3, options))}</title></rect><line class="uif-chart-target" x1="${round(x(stats.median))}" y1="${boxTop - 4}" x2="${round(x(stats.median))}" y2="${boxTop + boxHeight + 4}"></line><line class="uif-chart-target" x1="${round(x(stats.min))}" y1="${cy - 14}" x2="${round(x(stats.min))}" y2="${cy + 14}"></line><line class="uif-chart-target" x1="${round(x(stats.max))}" y1="${cy - 14}" x2="${round(x(stats.max))}" y2="${cy + 14}"></line>`;
  return svgWrap("box-plot", width, height, content, normalized, { ...options, description: options.description || `Median ${fmt(stats.median, options)}, IQR ${fmt(stats.iqr, options)}` });
}
function pointsFromData(data, options) {
  return normalizeData(data, options).map((d, index) => ({
    x: Number(options.x && d[options.x] != null ? d[options.x] : d.x ?? index + 1),
    y: Number(options.y && d[options.y] != null ? d[options.y] : d.y ?? d.value ?? 0)
  }));
}
function renderScatter(data, options, forceRegression = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins(options);
  const normalized = normalizeData(data, options);
  const points = pointsFromData(data, options).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No plottable points")}</div>`;
  const xDomain = extent(points.map((point) => point.x), { min: options.min });
  const yDomain = extent(points.map((point) => point.y), { max: options.max });
  const x = scaleLinear(xDomain, [plot.left, width - plot.right]);
  const y = scaleLinear(yDomain, [height - plot.bottom, plot.top]);
  const marks = points.map((point, index) => {
    const label = `${normalized[index]?.label || `Point ${index + 1}`}: ${fmt(point.x, options)}, ${fmt(point.y, options)}`;
    return `<circle ${markAttrs(label, options, { index, value: point.y })} cx="${round(x(point.x))}" cy="${round(y(point.y))}" r="4"><title>${esc(label)}</title></circle>`;
  }).join("");
  const reg = options.regression || forceRegression ? linearRegression(points) : null;
  const line = reg ? `<line class="uif-chart-regression" x1="${round(x(xDomain[0]))}" y1="${round(y(reg.predict(xDomain[0])))}" x2="${round(x(xDomain[1]))}" y2="${round(y(reg.predict(xDomain[1])))}"><title>y = ${esc(fmt(reg.slope, options))}x + ${esc(fmt(reg.intercept, options))}, R2 ${esc(fmt(reg.r2, options))}</title></line>` : "";
  return svgWrap(forceRegression ? "regression" : "scatter", width, height, `${axisAndGrid(width, height, plot, yDomain, options)}${verticalValueGrid(width, height, plot, xDomain, options)}${marks}${line}`, normalized, options);
}
function renderControlChart(data, options) {
  const normalized = normalizeData(data, options);
  const stats = summaryStats(normalized.map((d) => d.value ?? 0));
  if (!stats.count) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  const width = options.width ?? 360;
  const height = options.height ?? 200;
  const plot = margins(options);
  const sigma = stats.stddev || 1;
  const min = Math.min(stats.min, stats.mean - sigma * 3);
  const max = Math.max(stats.max, stats.mean + sigma * 3);
  const domain = extent([min, max], options);
  const referenceLines = [stats.mean, stats.mean + sigma * 3, stats.mean - sigma * 3];
  const y = scaleLinear(domain, [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const points = normalized.map((d, i) => [plot.left + i * xStep, y(d.value ?? 0)]);
  const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="value" points="${pointString(points)}" fill="none"></polyline>`;
  const marks = points.map(([cx, cy], i) => {
    const value = normalized[i].value ?? 0;
    const label = `${normalized[i].label ?? ""}: ${fmt(value, options)}`;
    return `<circle ${markAttrs(label, options, { index: i, value })} cx="${round(cx)}" cy="${round(cy)}" r="3"><title>${esc(label)}</title></circle>`;
  }).join("");
  const refs = referenceLines.map((value, index) => {
    const yy = round(y(value));
    return `<line class="uif-chart-reference ${index === 0 ? "uif-chart-mean" : ""}" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"><title>${index === 0 ? "Mean" : "Control limit"} ${esc(fmt(value, options))}</title></line>`;
  }).join("");
  const body = `${axisAndGrid(width, height, plot, domain, options)}${refs}${line}${marks}`;
  return svgWrap("control-chart", width, height, body, normalized, { ...options, description: options.description || "Control chart with mean and three sigma limits" });
}
function renderPareto(data, options) {
  const sorted = normalizeData(data, options).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = sorted.reduce((sum, item) => sum + Math.max(0, item.value ?? 0), 0) || 1;
  let running = 0;
  const cumulative = sorted.map((item) => {
    running += Math.max(0, item.value ?? 0);
    return { ...item, values: { Count: item.value ?? 0, Cumulative: running / total * 100 } };
  });
  return `${renderBars(cumulative, { ...options, type: "bar", series: [], y: void 0 }, "bar")}${renderLineLike(
    cumulative.map((item) => ({ label: item.label, value: Number(item.values?.Cumulative ?? 0) })),
    { ...options, label: options.label || "Cumulative percent", min: 0, max: 100 }
  )}`;
}
function renderChart(data, options = {}) {
  const type = options.type ?? "bar";
  const normalized = normalizeData(coerceData(data), options);
  if (!normalized.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc(options.description || "No data")}</div>`;
  if (type === "metric") return renderMetric(normalized, options);
  if (type === "line") return renderLineLike(normalized, options);
  if (type === "area") return renderLineLike(normalized, options, true);
  if (type === "horizontal-bar") return renderBars(normalized, options, "horizontal-bar");
  if (type === "grouped-bar") return renderBars(normalized, options, "grouped-bar");
  if (type === "stacked-bar") return renderBars(normalized, options, "stacked-bar");
  if (type === "pie") return renderPie(normalized, options);
  if (type === "donut" || type === "doughnut") return renderPie(normalized, options, true);
  if (type === "radar") return renderRadar(normalized, options);
  if (type === "sparkline") return renderSparkline(normalized, options);
  if (type === "progress" || type === "ring" || type === "gauge") return renderRing(normalized, options, type);
  if (type === "bullet") return renderBullet(normalized, options);
  if (type === "heatmap" || type === "status-heatmap") return renderHeatmap(normalized, options);
  if (type === "timeline") return renderBars(normalized, { ...options, axes: false }, "bar");
  if (type === "histogram") return renderHistogram(normalized, options);
  if (type === "box-plot") return renderBoxPlot(normalized, options);
  if (type === "scatter") return renderScatter(normalized, options);
  if (type === "regression") return renderScatter(normalized, options, true);
  if (type === "control-chart") return renderControlChart(normalized, options);
  if (type === "distribution") return renderHistogram(normalized, options, true);
  if (type === "pareto") return renderPareto(normalized, options);
  return renderBars(normalized, options, "bar");
}
function parseChartData(el) {
  const raw = el.dataset.uifData;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return coerceData(parsed);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) return coerceData(parsed.data);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.rows)) return coerceData(parsed.rows);
    return [];
  } catch {
    return [];
  }
}
function adaptTable(table2, options = {}) {
  const headers = Array.from(table2.tHead?.rows[0]?.cells ?? []).map((cell) => cell.textContent?.trim() ?? "");
  const columnIndex = (column, fallback) => typeof column === "number" ? column : typeof column === "string" ? Math.max(0, headers.indexOf(column)) : fallback;
  const labelColumn = columnIndex(options.labelColumn, 0);
  const valueColumn = columnIndex(options.valueColumn, 1);
  const seriesColumns = options.seriesColumns ?? [];
  return Array.from(table2.tBodies[0]?.rows ?? []).map((row) => {
    const label = row.cells[labelColumn]?.textContent?.trim() ?? "";
    if (seriesColumns.length) {
      const values = Object.fromEntries(
        seriesColumns.map((column) => {
          const index = columnIndex(column, 1);
          return [headers[index] || `Series ${index}`, Number(row.cells[index]?.textContent?.replace(/[^0-9.-]/g, "") || 0)];
        })
      );
      return { label, values };
    }
    return { label, value: Number(row.cells[valueColumn]?.textContent?.replace(/[^0-9.-]/g, "") || 0) };
  });
}
function adaptRecords(records, mapping = {}) {
  const labelKey = mapping.label ?? mapping.x ?? "label";
  const valueKey = mapping.value ?? mapping.y ?? "value";
  return records.map((record, index) => {
    const values = mapping.series?.length ? Object.fromEntries(mapping.series.map((key) => [key, Number(record[key]) || 0])) : void 0;
    return {
      ...record,
      label: String(record[labelKey] ?? index + 1),
      value: values ? void 0 : Number(record[valueKey]) || 0,
      values
    };
  });
}
async function loadChartData(el) {
  if (el.dataset.uifTable) {
    const table2 = document.querySelector(el.dataset.uifTable);
    if (table2) return adaptTable(table2);
  }
  if (el.dataset.uifSrc) {
    const response = await request(el.dataset.uifSrc, { method: "GET" });
    if (Array.isArray(response)) return response;
    return response.data ?? response.rows ?? [];
  }
  return Promise.resolve(parseChartData(el));
}
function optionsFromElement(el) {
  let parsed = {};
  try {
    parsed = JSON.parse(el.dataset.uifOptions || "{}");
  } catch {
    parsed = {};
  }
  return {
    ...parsed,
    type: el.dataset.uifChart || parsed.type || "bar",
    x: el.dataset.uifX || parsed.x,
    y: el.dataset.uifY || parsed.y,
    label: el.dataset.uifLabel || parsed.label,
    id: el.dataset.uifId || parsed.id || (el.dataset.uifChartInstanceId ||= `instance-${++chartIdCounter}`),
    palette: el.dataset.uifPalette || parsed.palette,
    table: el.dataset.uifChartTable === "sr-only" ? "sr-only" : el.dataset.uifChartTable != null ? el.dataset.uifChartTable !== "false" : parsed.table,
    drilldown: parsed.drilldown || Boolean(el.dataset.uifDrilldown || el.dataset.uifDrilldownTarget || el.dataset.uifDrilldownUrl),
    series: el.dataset.uifSeries ? el.dataset.uifSeries.split(",").map((item) => item.trim()).filter(Boolean) : parsed.series
  };
}
function responsiveOptions(el, options) {
  if (options.responsive === false || options.width) return options;
  const width = Math.round(el.getBoundingClientRect().width || el.clientWidth || 0);
  if (!width) return options;
  return { ...options, width, height: options.height ?? Math.round(width / (options.aspectRatio || 1.8)) };
}
function chartDrilldownOptions(el, options) {
  if (!options.drilldown && !el.dataset.uifDrilldown && !el.dataset.uifDrilldownTarget && !el.dataset.uifDrilldownUrl) return null;
  const configured = typeof options.drilldown === "object" ? options.drilldown : {};
  return {
    ...configured,
    action: el.dataset.uifDrilldown || configured.action || (el.dataset.uifDrilldownTarget ? "target" : el.dataset.uifDrilldownUrl ? "url" : "event"),
    target: el.dataset.uifDrilldownTarget || configured.target,
    url: el.dataset.uifDrilldownUrl || configured.url,
    param: el.dataset.uifDrilldownParam || configured.param || "label"
  };
}
function buildSelectionDetail(target, data, options) {
  const indexRaw = target.getAttribute("data-uif-chart-index");
  const index = indexRaw == null ? void 0 : Number(indexRaw);
  const datum = index != null && Number.isInteger(index) ? data[index] : data.find((item) => String(item.label ?? "") && target.getAttribute("data-uif-chart-label")?.startsWith(String(item.label)));
  const valueRaw = target.getAttribute("data-uif-chart-value");
  const value = valueRaw == null ? datum ? valueOf(datum, options) : void 0 : Number(valueRaw);
  const label = target.getAttribute("data-uif-chart-label") || target.getAttribute("aria-label") || String(datum?.label ?? "");
  const series = target.getAttribute("data-uif-series") || void 0;
  const params = {
    label,
    type: options.type ?? "bar"
  };
  if (index != null && Number.isFinite(index)) params.index = String(index);
  if (value != null && Number.isFinite(value)) params.value = String(value);
  if (series) params.series = series;
  if (datum?.label != null) params.datumLabel = String(datum.label);
  return { label, value: Number.isFinite(value) ? value : void 0, index, series, type: options.type ?? "bar", datum, params };
}
function resolveDrilldownUrl(url, detail, param) {
  const resolved = url.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, key) => encodeURIComponent(detail.params[key] ?? String(detail.datum?.[key] ?? "")));
  const parsed = new URL(resolved, window.location.href);
  if (!url.includes("{")) parsed.searchParams.set(param, detail.params[param] ?? detail.label);
  return parsed.toString();
}
async function runDrilldown(el, detail, options) {
  el.dispatchEvent(new CustomEvent("uif:chart-drilldown", { detail: { ...detail, drilldown: options }, bubbles: true }));
  if (options.action === "event") return;
  if (options.action === "route" || options.action === "url" && !options.target) {
    if (options.url) window.location.assign(resolveDrilldownUrl(options.url, detail, options.param || "label"));
    return;
  }
  if (!options.target || !options.url) return;
  const target = document.querySelector(options.target);
  if (!target) return;
  target.dataset.uifState = "loading";
  try {
    target.innerHTML = await request(resolveDrilldownUrl(options.url, detail, options.param || "label"), { method: "GET", parseAs: "text" });
    target.dataset.uifState = "loaded";
  } catch (error) {
    target.dataset.uifState = "error";
    el.dispatchEvent(new CustomEvent("uif:chart-drilldown-error", { detail: { error, selection: detail, drilldown: options }, bubbles: true }));
  }
}
function initChart(el) {
  controllers2.get(el)?.destroy();
  let options = optionsFromElement(el);
  let data = [];
  let timer;
  let resizeTimer;
  const refresh = async () => {
    el.dataset.uifState = "loading";
    try {
      data = await loadChartData(el);
      options = optionsFromElement(el);
      el.innerHTML = renderChart(data, responsiveOptions(el, options));
      el.dataset.uifState = data.length ? "refreshed" : "empty";
      el.dispatchEvent(new CustomEvent("uif:chart-refresh", { detail: { data, options }, bubbles: true }));
    } catch (error) {
      el.dataset.uifState = "error";
      el.innerHTML = `<div class="uif-chart-state" data-uif-state="error">${esc(el.dataset.uifError || "Unable to load chart")}</div>`;
      el.dispatchEvent(new CustomEvent("uif:chart-error", { detail: { error }, bubbles: true }));
      throw error;
    }
  };
  const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      el.innerHTML = renderChart(data, responsiveOptions(el, options));
    }, 80);
  }) : null;
  resize?.observe(el);
  if (el.dataset.uifRefresh === "interval" || el.dataset.uifInterval) timer = window.setInterval(() => void refresh(), Number(el.dataset.uifInterval || 3e4));
  const select = (event) => {
    const target = event.target instanceof Element ? event.target.closest(".uif-chart-mark") : null;
    if (!target) return;
    if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key)) return;
    if (event instanceof KeyboardEvent) event.preventDefault();
    const detail = buildSelectionDetail(target, data, options);
    el.dispatchEvent(
      new CustomEvent("uif:chart-select", {
        detail,
        bubbles: true
      })
    );
    const drilldown = chartDrilldownOptions(el, options);
    if (drilldown) void runDrilldown(el, detail, drilldown);
  };
  const announceMark = (event) => {
    const target = event.target instanceof Element ? event.target.closest(".uif-chart-mark") : null;
    if (!target) return;
    const name = event.type === "focusin" ? "uif:chart-focus" : "uif:chart-hover";
    el.dispatchEvent(new CustomEvent(name, { detail: buildSelectionDetail(target, data, options), bubbles: true }));
  };
  el.addEventListener("click", select);
  el.addEventListener("keydown", select);
  el.addEventListener("focusin", announceMark);
  el.addEventListener("mouseover", announceMark);
  const controller = {
    refresh,
    destroy() {
      resize?.disconnect();
      if (timer) window.clearInterval(timer);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      el.removeEventListener("click", select);
      el.removeEventListener("keydown", select);
      el.removeEventListener("focusin", announceMark);
      el.removeEventListener("mouseover", announceMark);
      controllers2.delete(el);
    }
  };
  controllers2.set(el, controller);
  void refresh();
  return controller;
}
function refreshChart(el) {
  return controllers2.get(el)?.refresh() ?? Promise.resolve();
}
function destroyChart(el) {
  controllers2.get(el)?.destroy();
}
function csvCell(value) {
  return JSON.stringify(value ?? "");
}
function chartSvgFrom(target) {
  return target instanceof SVGSVGElement ? target : target.querySelector("svg");
}
function svgSize(svg) {
  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number) ?? [];
  const rect = svg.getBoundingClientRect();
  return {
    width: Number(svg.getAttribute("width")) || viewBox[2] || rect.width || 360,
    height: Number(svg.getAttribute("height")) || viewBox[3] || rect.height || 220
  };
}
function inlineSvgStyles(svg) {
  const clone = svg.cloneNode(true);
  const sourceElements = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll("*"))];
  sourceElements.forEach((source, index) => {
    const target = cloneElements[index];
    if (!target || typeof window === "undefined" || !window.getComputedStyle) return;
    const style = window.getComputedStyle(source);
    const properties = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "font-family", "font-size", "font-weight", "text-anchor"];
    const inline = properties.map((property) => `${property}:${style.getPropertyValue(property)}`).join(";");
    target.setAttribute("style", `${target.getAttribute("style") || ""};${inline}`);
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("width")) {
    const { width } = svgSize(svg);
    clone.setAttribute("width", String(Math.round(width)));
  }
  if (!clone.getAttribute("height")) {
    const { height } = svgSize(svg);
    clone.setAttribute("height", String(Math.round(height)));
  }
  return clone;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function exportChartSvg(target) {
  const svg = chartSvgFrom(target);
  if (!svg) return "";
  const serialized = new XMLSerializer().serializeToString(inlineSvgStyles(svg));
  return serialized.startsWith("<?xml") ? serialized : `<?xml version="1.0" encoding="UTF-8"?>
${serialized}`;
}
function downloadChartSvg(target, filename = "chart.svg") {
  const svg = exportChartSvg(target);
  if (!svg) return;
  downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}
async function exportChartPng(target, options = {}) {
  const svg = chartSvgFrom(target);
  if (!svg) throw new Error("No chart SVG found");
  const source = exportChartSvg(svg);
  const size = svgSize(svg);
  const width = options.width ?? size.width;
  const height = options.height ?? size.height;
  const scale = options.scale ?? 2;
  const image = new Image();
  const svgUrl = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render chart SVG"));
      image.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to export chart PNG")), "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
async function downloadChartPng(target, filename = "chart.png", options = {}) {
  downloadBlob(await exportChartPng(target, options), filename);
}
function bindChartExports(root = document) {
  exportBindings.get(root)?.();
  const onClick = (event) => {
    const button2 = event.target instanceof Element ? event.target.closest("[data-uif-chart-export]") : null;
    if (!button2) return;
    const format = button2.dataset.uifChartExport || "svg";
    const targetSelector = button2.dataset.uifChartTarget || button2.getAttribute("aria-controls");
    const target = targetSelector ? root.querySelector(targetSelector) : button2.closest("[data-uif-chart-host], .uif-card, article")?.querySelector('[data-uif="chart"]');
    if (!target) return;
    const filename = button2.dataset.uifFilename || `chart.${format}`;
    if (format === "svg") downloadChartSvg(target, filename.endsWith(".svg") ? filename : `${filename}.svg`);
    if (format === "png") void downloadChartPng(target, filename.endsWith(".png") ? filename : `${filename}.png`, { background: button2.dataset.uifBackground || void 0 });
    if (format === "csv") {
      const data = parseChartData(target);
      downloadBlob(new Blob([exportChartData(data, "csv")], { type: "text/csv;charset=utf-8" }), filename.endsWith(".csv") ? filename : `${filename}.csv`);
    }
    button2.dispatchEvent(new CustomEvent("uif:chart-export", { detail: { format, target }, bubbles: true }));
  };
  root.addEventListener("click", onClick);
  const dispose = () => {
    root.removeEventListener("click", onClick);
    exportBindings.delete(root);
  };
  exportBindings.set(root, dispose);
  return dispose;
}
function exportChartData(data, format = "json") {
  if (format === "csv" || format === "tsv") {
    const delimiter = format === "tsv" ? "	" : ",";
    const series = [...new Set(data.flatMap((d) => Object.keys(d.values ?? {})))];
    const extra = [...new Set(data.flatMap((d) => Object.keys(d).filter((key) => !["label", "value", "values"].includes(key) && typeof d[key] !== "object")))];
    const headers = ["label", "value", ...series, ...extra];
    const rows2 = data.map(
      (d) => headers.map((key) => {
        const value = key in (d.values ?? {}) ? d.values?.[key] : d[key];
        return format === "tsv" ? String(value ?? "").replace(/\t/g, " ") : csvCell(value);
      }).join(delimiter)
    );
    return [headers.join(delimiter), ...rows2].join("\n");
  }
  return JSON.stringify(data);
}
var chart = {
  name: "chart",
  init: (el) => {
    initChart(el);
  },
  destroy: destroyChart
};

// packages/overlays/dist/index.js
var stack = [];
function top() {
  return stack[stack.length - 1];
}
function onKey(event) {
  if (event.key === "Escape") closeOverlay(top()?.el);
}
async function openOverlay(el, options = {}) {
  if (!stack.length) document.addEventListener("keydown", onKey);
  if (!stack.some((entry) => entry.el === el)) stack.push({ el, opener: options.opener ?? document.activeElement, options });
  if (options.modal) document.body.classList.add("uif-overlay-open");
  el.setAttribute("aria-hidden", "false");
  await show(el);
  el.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus();
}
async function closeOverlay(el = top()?.el) {
  if (!el) return;
  const index = stack.findIndex((entry2) => entry2.el === el);
  const [entry] = index >= 0 ? stack.splice(index, 1) : [];
  el.setAttribute("aria-hidden", "true");
  await hide(el);
  if (entry?.options.restoreFocus !== false) entry?.opener?.focus?.();
  if (!stack.length) {
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("uif-overlay-open");
  }
}
async function toggleOverlay(el, options = {}) {
  if (stack.some((entry) => entry.el === el)) await closeOverlay(el);
  else await openOverlay(el, options);
}
function positionOverlay(anchor, panel, options = {}) {
  const rect = anchor.getBoundingClientRect();
  const placement = options.placement ?? "bottom-start";
  panel.style.position = "absolute";
  panel.style.top = placement.startsWith("top") ? `${rect.top + window.scrollY - panel.offsetHeight}px` : `${rect.bottom + window.scrollY}px`;
  panel.style.left = placement.endsWith("end") ? `${rect.right + window.scrollX - panel.offsetWidth}px` : `${rect.left + window.scrollX}px`;
}

// packages/components/src/index.ts
var instances = /* @__PURE__ */ new WeakMap();
var actionBindings = /* @__PURE__ */ new WeakMap();
var focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function setState(el, open) {
  el.dataset.uifState = open ? "open" : "closed";
  el.toggleAttribute("hidden", !open);
  emit(open ? "uif:open" : "uif:close", { component: el.dataset.uif, el }, el);
}
function resolveComponentTarget(source) {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest("[data-uif]");
  if (expr === "self") return source;
  if (expr === "parent") return source.parentElement;
  if (expr.startsWith("closest:")) return source.closest(expr.slice(8));
  return document.querySelector(expr);
}
function eventElement(event) {
  return event.target instanceof HTMLElement ? event.target : null;
}
function initModal(el) {
  const mode = el.dataset.uifMode ?? "dismissible";
  const dialog = el.dataset.uifRole === "dialog" ? el : el.querySelector('[data-uif-role="dialog"]') || el;
  const open = () => {
    void openOverlay(el, { modal: true, restoreFocus: true });
    setState(el, true);
    document.body.classList.add("uif-modal-open");
    dialog.querySelector(focusableSelector)?.focus();
  };
  const close = () => {
    if (mode === "locked") return;
    void closeOverlay(el);
    setState(el, false);
    document.body.classList.remove("uif-modal-open");
  };
  const toggle3 = () => el.dataset.uifState === "open" ? close() : open();
  const onKey3 = (event) => {
    if (event.key === "Escape") close();
    if (event.key !== "Tab" || el.dataset.uifState !== "open") return;
    const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const onClick = (event) => {
    const target = eventElement(event);
    const action = target?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
    if (target?.dataset.uifRole === "backdrop") close();
  };
  dialog.setAttribute("role", dialog.getAttribute("role") || "dialog");
  dialog.setAttribute("aria-modal", "true");
  if (!el.dataset.uifState) setState(el, false);
  document.addEventListener("keydown", onKey3);
  el.addEventListener("click", onClick);
  return {
    destroy: () => {
      document.removeEventListener("keydown", onKey3);
      el.removeEventListener("click", onClick);
    },
    open,
    close,
    toggle: toggle3
  };
}
function initDrawer(el) {
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.dataset.uifMode = el.dataset.uifMode ?? "left";
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => void 0,
    open: () => {
      void openOverlay(el, { modal: true, restoreFocus: true });
      setState(el, true);
    },
    close: () => {
      void closeOverlay(el);
      setState(el, false);
    },
    toggle: () => {
      void toggleOverlay(el, { modal: true, restoreFocus: true });
      setState(el, el.dataset.uifState !== "open");
    }
  };
}
function initDropdown(el) {
  const trigger2 = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  const open = () => {
    if (trigger2 && panel) positionOverlay(trigger2, panel);
    if (panel) void show(panel);
    trigger2?.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    if (panel) void hide(panel);
    trigger2?.setAttribute("aria-expanded", "false");
  };
  const toggle3 = () => panel?.hasAttribute("hidden") ? open() : close();
  const onDoc = (event) => {
    const target = eventElement(event);
    if (target && !el.contains(target)) close();
  };
  const onKey3 = (event) => {
    if (event.key === "Escape") close();
  };
  const onClick = (event) => {
    const role = eventElement(event)?.closest("[data-uif-role]")?.dataset.uifRole;
    if (role === "trigger") toggle3();
    if (role === "item") close();
  };
  trigger2?.setAttribute("aria-haspopup", "menu");
  trigger2?.setAttribute("aria-expanded", "false");
  panel?.setAttribute("role", "menu");
  panel?.setAttribute("hidden", "");
  el.addEventListener("click", onClick);
  document.addEventListener("click", onDoc);
  document.addEventListener("keydown", onKey3);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey3);
    },
    open,
    close,
    toggle: toggle3
  };
}
function initTabs(el) {
  const tabs2 = Array.from(el.querySelectorAll('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll('[data-uif-role="tabpanel"]'));
  const activate = (idx) => {
    tabs2.forEach((tab, i) => {
      const panel = panels[i];
      if (panel && !panel.id) panel.id = `${el.id || "uif-tabs"}-panel-${i}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(i === idx));
      tab.setAttribute("tabindex", i === idx ? "0" : "-1");
      if (panel) tab.setAttribute("aria-controls", panel.id);
    });
    panels.forEach((panel, i) => {
      panel.setAttribute("role", "tabpanel");
      panel.hidden = i !== idx;
    });
    tabs2[idx]?.focus();
  };
  const onClick = (event) => {
    const tab = eventElement(event)?.closest('[data-uif-role="tab"]');
    if (tab) activate(tabs2.indexOf(tab));
  };
  const onKey3 = (event) => {
    const idx = tabs2.indexOf(event.target);
    if (idx < 0 || tabs2.length === 0) return;
    if (event.key === "ArrowRight") activate((idx + 1) % tabs2.length);
    if (event.key === "ArrowLeft") activate((idx - 1 + tabs2.length) % tabs2.length);
  };
  el.setAttribute("role", "tablist");
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", onKey3);
  activate(0);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey3);
    }
  };
}
function initToast(el) {
  el.setAttribute("role", el.dataset.uifType === "danger" ? "alert" : "status");
  if (!el.dataset.uifState) setState(el, true);
  return { destroy: () => void 0, close: () => el.remove() };
}
function initAccordion(el) {
  const trigger2 = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  if (panel && !panel.id) panel.id = `${el.id || "uif-accordion"}-panel`;
  const setExpanded = (expanded) => {
    el.dataset.uifState = expanded ? "expanded" : "collapsed";
    trigger2?.setAttribute("aria-expanded", String(expanded));
    if (panel) void (expanded ? expand(panel) : collapse(panel));
  };
  const toggle3 = () => setExpanded(trigger2?.getAttribute("aria-expanded") !== "true");
  const onKey3 = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle3();
    }
  };
  trigger2?.setAttribute("aria-controls", panel?.id || "");
  trigger2?.addEventListener("keydown", onKey3);
  trigger2?.addEventListener("click", toggle3);
  setExpanded(el.dataset.uifState === "expanded");
  return {
    destroy: () => {
      trigger2?.removeEventListener("keydown", onKey3);
      trigger2?.removeEventListener("click", toggle3);
    },
    toggle: toggle3
  };
}
function initButton(el) {
  el.addEventListener("click", handleAction);
  return { destroy: () => el.removeEventListener("click", handleAction) };
}
function initPassive(el) {
  if (el.dataset.uif === "table") el.setAttribute("role", el.getAttribute("role") || "table");
  if (el.dataset.uif === "nav") el.setAttribute("role", el.getAttribute("role") || "navigation");
  return { destroy: () => void 0 };
}
function initDismissible(el) {
  const close = () => {
    void hide(el);
    el.dataset.uifState = "closed";
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
  };
  el.addEventListener("click", onClick);
  return { destroy: () => el.removeEventListener("click", onClick), close };
}
function initCollapse(el) {
  if (!el.dataset.uifState) el.dataset.uifState = el.hidden ? "collapsed" : "expanded";
  const toggle3 = () => {
    const expanded = el.dataset.uifState !== "expanded";
    el.dataset.uifState = expanded ? "expanded" : "collapsed";
    void (expanded ? expand(el) : collapse(el));
  };
  return { destroy: () => void 0, toggle: toggle3 };
}
function initTooltip(el) {
  const panel = document.createElement("div");
  panel.className = "uif-tooltip";
  panel.id = el.getAttribute("aria-describedby") || `${el.id || "uif-tooltip"}-panel`;
  panel.setAttribute("role", "tooltip");
  panel.textContent = el.dataset.uifMessage || el.getAttribute("title") || "";
  panel.hidden = true;
  el.removeAttribute("title");
  el.setAttribute("aria-describedby", panel.id);
  document.body.appendChild(panel);
  const open = () => {
    positionOverlay(el, panel);
    void show(panel);
  };
  const close = () => void hide(panel);
  el.addEventListener("mouseenter", open);
  el.addEventListener("focus", open);
  el.addEventListener("mouseleave", close);
  el.addEventListener("blur", close);
  return {
    destroy: () => {
      el.removeEventListener("mouseenter", open);
      el.removeEventListener("focus", open);
      el.removeEventListener("mouseleave", close);
      el.removeEventListener("blur", close);
      panel.remove();
    },
    open,
    close
  };
}
function initPopover(el) {
  const trigger2 = el.querySelector('[data-uif-role="trigger"]') || el;
  const panel = el.querySelector('[data-uif-role="panel"]');
  const open = () => {
    if (!panel) return;
    positionOverlay(trigger2, panel);
    void openOverlay(panel, { restoreFocus: true });
  };
  const close = () => {
    if (panel) void closeOverlay(panel);
  };
  const toggle3 = () => panel?.dataset.uifState === "open" ? close() : open();
  trigger2.addEventListener("click", toggle3);
  panel?.setAttribute("role", panel.getAttribute("role") || "dialog");
  panel?.setAttribute("hidden", "");
  return { destroy: () => trigger2.removeEventListener("click", toggle3), open, close, toggle: toggle3 };
}
function initProgress(el) {
  const value = Number(el.dataset.uifValue || el.getAttribute("aria-valuenow") || 0);
  const max = Number(el.dataset.uifMax || el.getAttribute("aria-valuemax") || 100);
  el.setAttribute("role", "progressbar");
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", String(max));
  el.setAttribute("aria-valuenow", String(value));
  el.style.setProperty("--uif-progress", `${Math.max(0, Math.min(100, value / max * 100))}%`);
  return { destroy: () => void 0 };
}
function initPagination(el) {
  el.setAttribute("role", "navigation");
  el.querySelectorAll("[data-uif-page]").forEach((item) => {
    const active = item.dataset.uifState === "active" || item.getAttribute("aria-current") === "page";
    item.setAttribute("aria-current", active ? "page" : "false");
  });
  return { destroy: () => void 0 };
}
function initCommandMenu(el) {
  const input = el.querySelector('[data-uif-role="search"]');
  const items = Array.from(el.querySelectorAll('[data-uif-role="item"]'));
  let active = 0;
  const activate = (idx) => {
    active = (idx + items.length) % Math.max(1, items.length);
    items.forEach((item, i) => {
      item.tabIndex = i === active ? 0 : -1;
      item.dataset.uifState = i === active ? "active" : "inactive";
    });
    items[active]?.focus();
  };
  const filter = () => {
    const query = input?.value.trim().toLowerCase() || "";
    items.forEach((item) => {
      item.hidden = query !== "" && !item.textContent?.toLowerCase().includes(query);
    });
  };
  const onKey3 = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activate(active + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activate(active - 1);
    }
    if (event.key === "Home") activate(0);
    if (event.key === "End") activate(items.length - 1);
  };
  el.setAttribute("role", "menu");
  input?.addEventListener("input", filter);
  el.addEventListener("keydown", onKey3);
  if (items.length) activate(0);
  return {
    destroy: () => {
      input?.removeEventListener("input", filter);
      el.removeEventListener("keydown", onKey3);
    }
  };
}
function initFileUpload(el) {
  const input = el.querySelector('input[type="file"]');
  const label = el.querySelector('[data-uif-role="file-list"]');
  const update = () => {
    if (!label || !input) return;
    label.textContent = Array.from(input.files || []).map((file) => file.name).join(", ");
  };
  input?.addEventListener("change", update);
  return { destroy: () => input?.removeEventListener("change", update) };
}
function initCombobox(el) {
  const input = el.querySelector('input,[data-uif-role="input"]');
  const options = Array.from(el.querySelectorAll('[data-uif-role="option"]'));
  const filter = () => {
    const query = input?.value.toLowerCase() || "";
    options.forEach((option) => {
      option.hidden = query !== "" && !option.textContent?.toLowerCase().includes(query);
    });
  };
  const select = (option) => {
    if (input) input.value = option.dataset.uifValue || option.textContent?.trim() || "";
    emit("uif:select", { value: input?.value, option }, el);
  };
  const onClick = (event) => {
    const option = eventElement(event)?.closest('[data-uif-role="option"]');
    if (option) select(option);
  };
  el.setAttribute("role", "combobox");
  input?.setAttribute("aria-autocomplete", "list");
  input?.addEventListener("input", filter);
  el.addEventListener("click", onClick);
  return {
    destroy: () => {
      input?.removeEventListener("input", filter);
      el.removeEventListener("click", onClick);
    }
  };
}
function handleAction(event) {
  const actionEl = eventElement(event)?.closest("[data-uif-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === "toast") {
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || "Notification", {
      type: actionEl.dataset.uifType || "info"
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const instance = target ? instances.get(target) : null;
  const command = action && instance ? instance[action] : void 0;
  if (typeof command === "function") {
    event.preventDefault();
    command.call(instance);
  }
}
var inits = {
  modal: initModal,
  drawer: initDrawer,
  offcanvas: initDrawer,
  dropdown: initDropdown,
  tabs: initTabs,
  toast: initToast,
  accordion: initAccordion,
  alert: initDismissible,
  badge: initPassive,
  breadcrumb: initPassive,
  collapse: initCollapse,
  tooltip: initTooltip,
  popover: initPopover,
  progress: initProgress,
  spinner: initPassive,
  skeleton: initPassive,
  pagination: initPagination,
  "command-menu": initCommandMenu,
  navbar: initPassive,
  sidebar: initPassive,
  stepper: initPassive,
  wizard: initPassive,
  "file-upload": initFileUpload,
  combobox: initCombobox,
  button: initButton,
  card: initPassive,
  nav: initPassive,
  table: initPassive
};
function initComponent(el) {
  if (instances.has(el)) return;
  const name = el.dataset.uif;
  if (!name || !inits[name]) return;
  instances.set(el, inits[name](el));
  emit("uif:init", { component: name, el }, el);
}
function destroyComponent(el) {
  instances.get(el)?.destroy();
  instances.delete(el);
  emit("uif:destroy", { el }, el);
}
function initAll(root = document) {
  root.querySelectorAll("[data-uif]").forEach(initComponent);
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
function showToast(message, options = {}) {
  const toastEl = document.createElement("div");
  toastEl.dataset.uif = "toast";
  toastEl.dataset.uifState = "open";
  toastEl.dataset.uifType = options.type ?? "info";
  toastEl.textContent = message;
  toastEl.setAttribute("role", options.type === "danger" ? "alert" : "status");
  toastEl.className = `uif-toast uif-toast-${options.type ?? "info"}`;
  document.body.appendChild(toastEl);
  emit("uif:toast", { message, options, el: toastEl }, toastEl);
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => toastEl.remove(), reduce ? 0 : options.duration ?? 3e3);
  return toastEl;
}
var button = { name: "button", init: initButton, destroy: destroyComponent };
var modal = { name: "modal", init: initModal, destroy: destroyComponent };
var drawer = { name: "drawer", init: initDrawer, destroy: destroyComponent };
var offcanvas = { name: "offcanvas", init: initDrawer, destroy: destroyComponent };
var dropdown = { name: "dropdown", init: initDropdown, destroy: destroyComponent };
var tabs = { name: "tabs", init: initTabs, destroy: destroyComponent };
var toast = { name: "toast", init: initToast, destroy: destroyComponent };
var accordion = { name: "accordion", init: initAccordion, destroy: destroyComponent };
var alert = { name: "alert", init: initDismissible, destroy: destroyComponent };
var badge = { name: "badge", init: initPassive, destroy: destroyComponent };
var breadcrumb = { name: "breadcrumb", init: initPassive, destroy: destroyComponent };
var collapseComponent = { name: "collapse", init: initCollapse, destroy: destroyComponent };
var tooltip = { name: "tooltip", init: initTooltip, destroy: destroyComponent };
var popover = { name: "popover", init: initPopover, destroy: destroyComponent };
var progress = { name: "progress", init: initProgress, destroy: destroyComponent };
var spinner = { name: "spinner", init: initPassive, destroy: destroyComponent };
var skeleton = { name: "skeleton", init: initPassive, destroy: destroyComponent };
var pagination = { name: "pagination", init: initPagination, destroy: destroyComponent };
var commandMenu = { name: "command-menu", init: initCommandMenu, destroy: destroyComponent };
var navbar = { name: "navbar", init: initPassive, destroy: destroyComponent };
var sidebar = { name: "sidebar", init: initPassive, destroy: destroyComponent };
var stepper = { name: "stepper", init: initPassive, destroy: destroyComponent };
var wizard = { name: "wizard", init: initPassive, destroy: destroyComponent };
var fileUpload = { name: "file-upload", init: initFileUpload, destroy: destroyComponent };
var combobox = { name: "combobox", init: initCombobox, destroy: destroyComponent };
var card = { name: "card", init: initPassive, destroy: destroyComponent };
var nav = { name: "nav", init: initPassive, destroy: destroyComponent };
var table = { name: "table", init: initPassive, destroy: destroyComponent };

// packages/charts/dist/index.js
var defaultPalette2 = [
  "var(--uif-chart-1,var(--uif-color-primary))",
  "var(--uif-chart-2,var(--uif-color-success))",
  "var(--uif-chart-3,var(--uif-color-warning))",
  "var(--uif-chart-4,var(--uif-color-danger))",
  "var(--uif-chart-5,var(--uif-color-info))",
  "var(--uif-chart-6,#7c3aed)",
  "var(--uif-chart-7,#0f766e)",
  "var(--uif-chart-8,#9333ea)"
];
var namedPalettes2 = {
  default: defaultPalette2,
  professional: ["#0b72bd", "#00a88f", "#e4a700", "#df3158", "#7c3aed", "#0f766e"],
  categorical: ["#0b72bd", "#00a88f", "#e4a700", "#df3158", "#7c3aed", "#d9468f", "#475467"],
  status: ["#00a88f", "#0b72bd", "#e4a700", "#df3158"],
  sequential: ["#d9ecff", "#9dccf4", "#5ba6df", "#1f7dc1", "#0b4f86"],
  diverging: ["#df3158", "#f59e0b", "#e5e7eb", "#00a88f", "#0b72bd"]
};
function esc2(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function uid2(options, type) {
  const seed = `${options.id || options.label || type}-${options.width || 0}-${options.height || 0}`.toLowerCase();
  const clean = seed.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `uif-chart-${clean || type}`;
}
function paletteFor2(options) {
  if (Array.isArray(options.palette)) return options.palette;
  return namedPalettes2[options.palette ?? "default"] ?? defaultPalette2;
}
function cleanValues2(values) {
  return values.map(Number).filter(Number.isFinite);
}
function quantile2(values, q) {
  const sorted = cleanValues2(values).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * Math.max(0, Math.min(1, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base] + ((sorted[base + 1] ?? sorted[base]) - sorted[base]) * rest;
}
function summaryStats2(values) {
  const nums = cleanValues2(values);
  const count = nums.length;
  const sum = nums.reduce((total, value) => total + value, 0);
  const mean = count ? sum / count : 0;
  const variance = count ? nums.reduce((total, value) => total + (value - mean) ** 2, 0) / count : 0;
  const q1 = quantile2(nums, 0.25);
  const q3 = quantile2(nums, 0.75);
  return {
    count,
    min: count ? Math.min(...nums) : 0,
    max: count ? Math.max(...nums) : 0,
    sum,
    mean,
    median: quantile2(nums, 0.5),
    variance,
    stddev: Math.sqrt(variance),
    q1,
    q3,
    iqr: q3 - q1
  };
}
function histogramBins2(values, options = {}) {
  const nums = cleanValues2(values);
  if (!nums.length) return [];
  const min = options.min ?? Math.min(...nums);
  const max = options.max ?? Math.max(...nums);
  const binCount = Math.max(1, Math.floor(options.bins ?? Math.ceil(Math.sqrt(nums.length))));
  const span = max - min || 1;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    x0: min + span / binCount * index,
    x1: min + span / binCount * (index + 1),
    count: 0
  }));
  nums.forEach((value) => {
    const index = value === max ? binCount - 1 : Math.floor((value - min) / span * binCount);
    bins[Math.max(0, Math.min(binCount - 1, index))].count += 1;
  });
  return bins;
}
function correlation2(pointsOrX, yValues) {
  const points = Array.isArray(yValues) ? pointsOrX.map((x, index) => ({ x, y: yValues[index] })) : pointsOrX;
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return 0;
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const xDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0));
  const yDen = Math.sqrt(clean.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0));
  return xDen && yDen ? numerator / (xDen * yDen) : 0;
}
function linearRegression2(points) {
  const clean = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (clean.length < 2) return { slope: 0, intercept: clean[0]?.y ?? 0, r: 0, r2: 0, predict: (x) => clean[0]?.y ?? x * 0 };
  const xMean = clean.reduce((sum, point) => sum + point.x, 0) / clean.length;
  const yMean = clean.reduce((sum, point) => sum + point.y, 0) / clean.length;
  const numerator = clean.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = clean.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const slope = denominator ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  const r = correlation2(clean);
  return { slope, intercept, r, r2: r * r, predict: (x) => slope * x + intercept };
}
function margins2(options) {
  return { top: 16, right: 18, bottom: options.axes === false ? 18 : 34, left: options.axes === false ? 18 : 42, ...options.margin };
}
function coerceNumber2(raw, options) {
  const value = Number(raw);
  if (Number.isFinite(value)) return value;
  if (options.invalidValue === "error") throw new Error(`Invalid chart value: ${String(raw)}`);
  return options.invalidValue === "skip" ? void 0 : 0;
}
function valueOf2(datum, options) {
  const raw = options.y && datum[options.y] != null ? datum[options.y] : datum.value;
  return coerceNumber2(raw, options);
}
function labelOf2(datum, options) {
  const raw = options.x && datum[options.x] != null ? datum[options.x] : datum.label;
  return String(raw ?? "");
}
function normalizeData2(data, options) {
  return data.map((item) => ({ ...item, label: labelOf2(item, options), value: valueOf2(item, options) })).filter((item) => item.value != null || options.invalidValue !== "skip");
}
function coerceData2(data) {
  return data.map((item, index) => typeof item === "number" ? { label: String(index + 1), value: item } : item);
}
function inferSeries2(data, options) {
  if (options.series?.length) return options.series;
  const keys = /* @__PURE__ */ new Set();
  data.forEach((datum) => Object.keys(datum.values ?? {}).forEach((key) => keys.add(key)));
  return [...keys];
}
function fmt2(value, options) {
  return options.formatValue ? options.formatValue(value) : String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
}
function extent2(values, options) {
  const min = options.min ?? Math.min(0, ...values);
  const max = options.max ?? Math.max(1, ...values);
  return min === max ? [Math.min(0, min), max + 1] : [min, max];
}
function scaleLinear2(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + (value - d0) / span * (r1 - r0);
}
function pointString2(points) {
  return points.map(([x, y]) => `${round2(x)},${round2(y)}`).join(" ");
}
function round2(value) {
  return Math.round(value * 100) / 100;
}
function polar2(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}
function arcPath2(cx, cy, outer, start2, end, inner = 0) {
  const large = end - start2 > Math.PI ? 1 : 0;
  const [sx, sy] = polar2(cx, cy, outer, start2);
  const [ex, ey] = polar2(cx, cy, outer, end);
  if (inner <= 0) return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} Z`;
  const [isx, isy] = polar2(cx, cy, inner, end);
  const [iex, iey] = polar2(cx, cy, inner, start2);
  return `M ${sx} ${sy} A ${outer} ${outer} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}
function fullDonutPath2(cx, cy, outer, inner) {
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx + outer} ${cy} A ${outer} ${outer} 0 1 0 ${cx - outer} ${cy} M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 1 ${cx - inner} ${cy} Z`;
}
function markAttrs2(label, options, meta = {}) {
  const interactive = options.focusable || Boolean(options.drilldown);
  const focus = interactive ? ' tabindex="0" role="button"' : "";
  const aria = interactive ? ` aria-label="${esc2(label)}"` : "";
  const index = meta.index == null ? "" : ` data-uif-chart-index="${meta.index}"`;
  const value = meta.value == null ? "" : ` data-uif-chart-value="${esc2(meta.value)}"`;
  const series = meta.series == null ? "" : ` data-uif-series="${esc2(meta.series)}"`;
  return `class="uif-chart-mark"${focus}${aria} data-uif-chart-label="${esc2(label)}"${index}${value}${series}`;
}
function axisAndGrid2(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const y = scaleLinear2(domain, [height - plot.bottom, plot.top]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const yy = y(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${yy + 4}" text-anchor="end">${esc2(fmt2(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function verticalValueGrid2(width, height, plot, domain, options) {
  if (options.axes === false && options.grid === false) return "";
  const x = scaleLinear2(domain, [plot.left, width - plot.right]);
  const ticks = Array.from({ length: 5 }, (_, i) => domain[0] + (domain[1] - domain[0]) / 4 * i);
  return ticks.map((tick) => {
    const xx = x(tick);
    const grid = options.grid === false ? "" : `<line class="uif-chart-grid" x1="${xx}" y1="${plot.top}" x2="${xx}" y2="${height - plot.bottom}"></line>`;
    const label = options.axes === false ? "" : `<text class="uif-chart-axis-label" x="${xx}" y="${height - 8}" text-anchor="middle">${esc2(fmt2(tick, options))}</text>`;
    return `${grid}${label}`;
  }).join("");
}
function svgWrap2(type, width, height, content, data, options) {
  const id2 = uid2(options, type);
  const title = options.label || `${type} chart`;
  const desc = options.description || data.map((d) => `${d.label ?? "item"} ${fmt2(valueOf2(d, options) ?? 0, options)}`).join(", ");
  const table2 = options.table ? chartDataTable2(data, options, id2) : "";
  return `<svg class="uif-chart-svg uif-chart-${type}" viewBox="0 0 ${width} ${height}" role="img" aria-roledescription="chart" aria-labelledby="${id2}-title ${id2}-desc"><title id="${id2}-title">${esc2(title)}</title><desc id="${id2}-desc">${esc2(desc)}</desc>${content}</svg>${table2}`;
}
function chartDataTable2(data, options, id2) {
  const series = inferSeries2(data, options);
  const headers = ["Label", ...series.length ? series : ["Value"]];
  const rows2 = data.map((datum) => {
    const cells = series.length ? series.map((key) => fmt2(Number(datum.values?.[key] ?? 0), options)) : [fmt2(datum.value ?? 0, options)];
    return `<tr><th scope="row">${esc2(datum.label ?? "")}</th>${cells.map((cell) => `<td>${esc2(cell)}</td>`).join("")}</tr>`;
  }).join("");
  const hidden = options.table === "sr-only" ? " uif-sr-only" : "";
  return `<table id="${id2}-table" class="uif-chart-data-table${hidden}"><caption>${esc2(options.label || "Chart data")}</caption><thead><tr>${headers.map((header) => `<th scope="col">${esc2(header)}</th>`).join("")}</tr></thead><tbody>${rows2}</tbody></table>`;
}
function legend2(items, options) {
  if (!options.legend || !items.length) return "";
  const palette = paletteFor2(options);
  return `<div class="uif-chart-legend" data-uif-placement="${options.legend === true ? "bottom" : options.legend}">${items.map((item, i) => `<span><i style="background:${palette[i % palette.length]}"></i>${esc2(item)}</span>`).join("")}</div>`;
}
function renderLineLike2(data, options, area = false, sparkline = false) {
  const width = options.width ?? (sparkline ? 160 : 360);
  const height = options.height ?? (sparkline ? 64 : 200);
  const plot = sparkline ? { top: 6, right: 6, bottom: 6, left: 6 } : margins2(options);
  const normalized = normalizeData2(data, options);
  const series = inferSeries2(normalized, options);
  const palette = paletteFor2(options);
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const y = scaleLinear2(extent2(values, options), [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const renderSeries = (name, index) => {
    const points = normalized.map((d, i) => [plot.left + i * xStep, y(name ? Number(d.values?.[name] ?? 0) : d.value ?? 0)]);
    const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="${esc2(name ?? "value")}" points="${pointString2(points)}" fill="none" style="stroke:${palette[index % palette.length]}"></polyline>`;
    const fill = area ? `<polygon class="uif-chart-area" points="${plot.left},${height - plot.bottom} ${pointString2(points)} ${width - plot.right},${height - plot.bottom}" style="fill:${palette[index % palette.length]}"></polygon>` : "";
    const marks = sparkline || options.labels === false ? "" : points.map(([cx, cy], i) => {
      const value = name ? Number(normalized[i].values?.[name] ?? 0) : normalized[i].value ?? 0;
      const label = `${name ? `${name} ` : ""}${normalized[i].label ?? ""}: ${fmt2(value, options)}`;
      return `<circle ${markAttrs2(label, options, { index: i, value, series: name ?? void 0 })} cx="${round2(cx)}" cy="${round2(cy)}" r="3"><title>${esc2(label)}</title></circle>`;
    }).join("");
    return `${fill}${line}${marks}`;
  };
  const body = `${sparkline ? "" : axisAndGrid2(width, height, plot, extent2(values, options), options)}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`;
  return `${svgWrap2(sparkline ? "sparkline" : area ? "area" : "line", width, height, body, normalized, options)}${legend2(series, options)}`;
}
function renderBars2(data, options, mode) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins2(options);
  const normalized = normalizeData2(data, options);
  const series = inferSeries2(normalized, options);
  const palette = paletteFor2(options);
  const values = series.length && mode === "stacked-bar" ? normalized.flatMap((d) => {
    let positive = 0;
    let negative = 0;
    series.forEach((key) => {
      const value = Number(d.values?.[key] ?? 0);
      if (value >= 0) positive += value;
      else negative += value;
    });
    return [negative, positive];
  }) : series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const domain = extent2(values, options);
  const vertical = mode !== "horizontal-bar";
  const major = vertical ? width - plot.left - plot.right : height - plot.top - plot.bottom;
  const band = major / Math.max(1, normalized.length);
  const zeroY = scaleLinear2(domain, [height - plot.bottom, plot.top])(0);
  const zeroX = scaleLinear2(domain, [plot.left, width - plot.right])(0);
  const yScale = scaleLinear2(domain, [height - plot.bottom, plot.top]);
  const xScale = scaleLinear2(domain, [plot.left, width - plot.right]);
  const bars = normalized.map((d, i) => {
    if (series.length && mode === "stacked-bar") {
      let positiveOffset = 0;
      let negativeOffset = 0;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const start2 = value2 >= 0 ? positiveOffset : negativeOffset;
        const end = start2 + value2;
        if (value2 >= 0) positiveOffset = end;
        else negativeOffset = end;
        const y0 = yScale(start2);
        const y1 = yScale(end);
        const x2 = plot.left + i * band + band * 0.18;
        const w = band * 0.64;
        const h = Math.abs(y1 - y0);
        const label2 = `${d.label ?? ""} ${key}: ${fmt2(value2, options)}`;
        return `<rect ${markAttrs2(label2, options, { index: i, value: value2, series: key })} x="${round2(x2)}" y="${round2(Math.min(y0, y1))}" width="${round2(w)}" height="${round2(h)}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc2(label2)}</title></rect>`;
      }).join("");
    }
    if (series.length && mode === "grouped-bar") {
      const inner = band * 0.72 / series.length;
      return series.map((key, s) => {
        const value2 = Number(d.values?.[key] ?? 0);
        const y2 = yScale(value2);
        const x2 = plot.left + i * band + band * 0.14 + s * inner;
        const label2 = `${d.label ?? ""} ${key}: ${fmt2(value2, options)}`;
        return `<rect ${markAttrs2(label2, options, { index: i, value: value2, series: key })} x="${round2(x2)}" y="${round2(Math.min(y2, zeroY))}" width="${round2(inner * 0.86)}" height="${round2(Math.abs(zeroY - y2))}" rx="3" style="fill:${palette[s % palette.length]}"><title>${esc2(label2)}</title></rect>`;
      }).join("");
    }
    const value = d.value ?? 0;
    const label = `${d.label ?? ""}: ${fmt2(value, options)}`;
    if (!vertical) {
      const x2 = xScale(value);
      const y2 = plot.top + i * band + band * 0.18;
      return `<rect ${markAttrs2(label, options, { index: i, value })} x="${round2(Math.min(x2, zeroX))}" y="${round2(y2)}" width="${round2(Math.abs(x2 - zeroX))}" height="${round2(band * 0.64)}" rx="3"><title>${esc2(label)}</title></rect>`;
    }
    const y = yScale(value);
    const x = plot.left + i * band + band * 0.18;
    return `<rect ${markAttrs2(label, options, { index: i, value })} x="${round2(x)}" y="${round2(Math.min(y, zeroY))}" width="${round2(band * 0.64)}" height="${round2(Math.abs(zeroY - y))}" rx="3"><title>${esc2(label)}</title></rect>`;
  }).join("");
  const labels = options.axes === false ? "" : normalized.map(
    (d, i) => vertical ? `<text class="uif-chart-axis-label" x="${round2(plot.left + i * band + band / 2)}" y="${height - 8}" text-anchor="middle">${esc2(d.label)}</text>` : `<text class="uif-chart-axis-label" x="${plot.left - 8}" y="${round2(plot.top + i * band + band / 2 + 4)}" text-anchor="end">${esc2(d.label)}</text>`
  ).join("");
  const grid = vertical ? axisAndGrid2(width, height, plot, domain, options) : verticalValueGrid2(width, height, plot, domain, options);
  return `${svgWrap2(mode, width, height, `${grid}${bars}${labels}`, normalized, options)}${legend2(series, options)}`;
}
function renderPie2(data, options, donut = false) {
  const width = options.width ?? 180;
  const height = options.height ?? 180;
  const normalized = normalizeData2(data, options).filter((d) => (d.value ?? 0) > 0);
  const palette = paletteFor2(options);
  const total = normalized.reduce((sum, d) => sum + (d.value ?? 0), 0);
  if (!total) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No positive values to chart")}</div>`;
  const radius = Math.min(width, height) / 2 - 10;
  const inner = donut ? radius * 0.55 : 0;
  let angle = -Math.PI / 2;
  const paths = normalized.map((d, i) => {
    const next = angle + (d.value ?? 0) / total * Math.PI * 2;
    const label = `${d.label ?? ""}: ${fmt2(d.value ?? 0, options)}`;
    const fill = d.color || palette[i % palette.length];
    const path = normalized.length === 1 && !donut ? `<circle ${markAttrs2(label, options, { index: i, value: d.value ?? 0 })} cx="${width / 2}" cy="${height / 2}" r="${radius}" style="fill:${fill}"><title>${esc2(label)}</title></circle>` : `<path ${markAttrs2(label, options, { index: i, value: d.value ?? 0 })} d="${normalized.length === 1 && donut ? fullDonutPath2(width / 2, height / 2, radius, inner) : arcPath2(width / 2, height / 2, radius, angle, next, inner)}" ${normalized.length === 1 && donut ? 'fill-rule="evenodd" ' : ""}style="fill:${fill}"><title>${esc2(label)}</title></path>`;
    angle = next;
    return path;
  }).join("");
  return `${svgWrap2(donut ? "donut" : "pie", width, height, paths, normalized, options)}${legend2(
    normalized.map((d) => d.label ?? ""),
    options
  )}`;
}
function renderRadar2(data, options) {
  const width = options.width ?? 260;
  const height = options.height ?? 260;
  const normalized = normalizeData2(data, options);
  const series = inferSeries2(normalized, options);
  const values = series.length ? normalized.flatMap((d) => series.map((key) => Number(d.values?.[key] ?? 0))) : normalized.map((d) => d.value ?? 0);
  const max = options.max ?? Math.max(1, ...values);
  const min = options.min ?? 0;
  const palette = paletteFor2(options);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 34;
  const axes = normalized.map((d, i) => {
    const angle = -Math.PI / 2 + i / normalized.length * Math.PI * 2;
    const [x, y] = polar2(cx, cy, radius, angle);
    const [lx, ly] = polar2(cx, cy, radius + 16, angle);
    return `<line class="uif-chart-grid" x1="${cx}" y1="${cy}" x2="${round2(x)}" y2="${round2(y)}"></line><text class="uif-chart-axis-label" x="${round2(lx)}" y="${round2(ly)}" text-anchor="middle">${esc2(d.label)}</text>`;
  }).join("");
  const rings = [0.25, 0.5, 0.75, 1].map((factor) => {
    const pts = normalized.map((_, i) => polar2(cx, cy, radius * factor, -Math.PI / 2 + i / normalized.length * Math.PI * 2));
    return `<polygon class="uif-chart-grid-polygon" points="${pointString2(pts)}"></polygon>`;
  }).join("");
  const renderSeries = (name, index) => {
    const pts = normalized.map((d, i) => {
      const value = name ? Number(d.values?.[name] ?? 0) : d.value ?? 0;
      const r = (value - min) / (max - min || 1) * radius;
      return polar2(cx, cy, r, -Math.PI / 2 + i / normalized.length * Math.PI * 2);
    });
    return `<polygon class="uif-chart-radar-area" data-uif-series="${esc2(name ?? "value")}" points="${pointString2(pts)}" style="stroke:${palette[index % palette.length]};fill:${palette[index % palette.length]}"></polygon>`;
  };
  return `${svgWrap2("radar", width, height, `${rings}${axes}${series.length ? series.map(renderSeries).join("") : renderSeries(null, 0)}`, normalized, options)}${legend2(series, options)}`;
}
function renderSparkline2(data, options) {
  if (options.sparklineType === "bar") return renderBars2(data, { ...options, width: options.width ?? 160, height: options.height ?? 56, axes: false, grid: false }, "bar");
  return renderLineLike2(data, { ...options, axes: false, grid: false, labels: false }, false, true);
}
function renderMetric2(data, options) {
  const first = normalizeData2(data, options)[0];
  return `<div class="uif-chart-metric" role="img" aria-label="${esc2(options.label || first?.label || "Metric")}: ${esc2(fmt2(first?.value ?? 0, options))}"><strong>${esc2(fmt2(first?.value ?? 0, options))}</strong><span>${esc2(first?.label ?? options.label ?? "Metric")}</span></div>`;
}
function renderRing2(data, options, type) {
  const width = options.width ?? 140;
  const height = options.height ?? (type === "gauge" ? 90 : 140);
  const datum = normalizeData2(data, options)[0];
  const value = datum?.value ?? 0;
  const max = options.max ?? datum?.max ?? 100;
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  if (type === "gauge") {
    const start2 = Math.PI;
    const end = Math.PI + pct * Math.PI;
    const bg = arcPath2(width / 2, height - 8, 58, Math.PI, Math.PI * 2, 46);
    const fg = arcPath2(width / 2, height - 8, 58, start2, end, 46);
    return svgWrap2("gauge", width, height, `<path class="uif-chart-ring-bg" d="${bg}"></path><path class="uif-chart-value" d="${fg}"></path><text x="${width / 2}" y="${height - 18}" text-anchor="middle">${esc2(fmt2(value, options))}</text>`, [datum], options);
  }
  const dash = round2(pct * 283);
  return svgWrap2(type, width, height, `<circle class="uif-chart-ring-bg" cx="${width / 2}" cy="${height / 2}" r="45"></circle><circle class="uif-chart-value" cx="${width / 2}" cy="${height / 2}" r="45" stroke-dasharray="${dash} 283"></circle><text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle">${esc2(fmt2(value, options))}</text>`, [datum], options);
}
function renderBullet2(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 72;
  const datum = normalizeData2(data, options)[0];
  const max = options.max ?? datum?.max ?? 100;
  const x = scaleLinear2([0, max], [24, width - 18]);
  const value = Math.max(0, Math.min(max || 0, datum?.value ?? 0));
  const target = datum?.target ?? max;
  const content = `<rect class="uif-chart-range" x="24" y="24" width="${width - 42}" height="18"></rect><rect class="uif-chart-value-bar" x="24" y="24" width="${round2(x(value) - 24)}" height="18"></rect><line class="uif-chart-target" x1="${round2(x(target))}" y1="18" x2="${round2(x(target))}" y2="48"></line><text class="uif-chart-axis-label" x="24" y="62">${esc2(datum?.label ?? "")}</text>`;
  return svgWrap2("bullet", width, height, content, [datum], options);
}
function renderHeatmap2(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const normalized = normalizeData2(data, options);
  const cols = Math.ceil(Math.sqrt(normalized.length || 1));
  const cell = Math.min((width - 20) / cols, (height - 20) / Math.ceil(normalized.length / cols));
  const max = Math.max(1, ...normalized.map((d) => d.value ?? 0));
  const cells = normalized.map((d, i) => {
    const opacity = 0.2 + (d.value ?? 0) / max * 0.8;
    const x = 10 + i % cols * cell;
    const y = 10 + Math.floor(i / cols) * cell;
    const label = `${d.label ?? ""}: ${fmt2(d.value ?? 0, options)}`;
    return `<rect ${markAttrs2(label, options, { index: i, value: d.value ?? 0 })} x="${round2(x)}" y="${round2(y)}" width="${round2(cell - 3)}" height="${round2(cell - 3)}" rx="3" style="opacity:${round2(opacity)}"><title>${esc2(label)}</title></rect>`;
  }).join("");
  return svgWrap2("heatmap", width, height, cells, normalized, options);
}
function renderHistogram2(data, options, distribution = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins2(options);
  const normalized = normalizeData2(data, options);
  const bins = histogramBins2(normalized.map((d) => d.value ?? 0), { bins: options.bins, min: options.min, max: options.max });
  if (!bins.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No data")}</div>`;
  const x = scaleLinear2([bins[0].x0, bins[bins.length - 1].x1], [plot.left, width - plot.right]);
  const y = scaleLinear2([0, Math.max(1, ...bins.map((bin) => bin.count))], [height - plot.bottom, plot.top]);
  if (distribution) {
    const points = bins.map((bin) => [x((bin.x0 + bin.x1) / 2), y(bin.count)]);
    const body = `${axisAndGrid2(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}<polyline class="uif-chart-series uif-chart-line" points="${pointString2(points)}" fill="none"></polyline>`;
    return svgWrap2("distribution", width, height, body, normalized, { ...options, description: options.description || "Binned distribution line" });
  }
  const bars = bins.map((bin, binIndex) => {
    const x0 = x(bin.x0);
    const x1 = x(bin.x1);
    const yy = y(bin.count);
    const label = `${fmt2(bin.x0, options)}-${fmt2(bin.x1, options)}: ${bin.count}`;
    return `<rect ${markAttrs2(label, options, { index: binIndex, value: bin.count })} x="${round2(x0 + 1)}" y="${round2(yy)}" width="${round2(Math.max(1, x1 - x0 - 2))}" height="${round2(height - plot.bottom - yy)}" rx="2"><title>${esc2(label)}</title></rect>`;
  }).join("");
  return svgWrap2("histogram", width, height, `${axisAndGrid2(width, height, plot, [0, Math.max(1, ...bins.map((bin) => bin.count))], options)}${bars}`, normalized, options);
}
function renderBoxPlot2(data, options) {
  const width = options.width ?? 320;
  const height = options.height ?? 160;
  const plot = margins2({ ...options, margin: { top: 18, right: 20, bottom: 28, left: 34, ...options.margin } });
  const normalized = normalizeData2(data, options);
  const stats = summaryStats2(normalized.map((d) => d.value ?? 0));
  if (!stats.count) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No data")}</div>`;
  const domain = extent2([stats.min, stats.max], options);
  const x = scaleLinear2(domain, [plot.left, width - plot.right]);
  const cy = (height - plot.bottom + plot.top) / 2;
  const boxTop = cy - 22;
  const boxHeight = 44;
  const content = `${verticalValueGrid2(width, height, plot, domain, options)}<line class="uif-chart-grid" x1="${round2(x(stats.min))}" y1="${cy}" x2="${round2(x(stats.max))}" y2="${cy}"></line><rect ${markAttrs2(`Q1 ${fmt2(stats.q1, options)} to Q3 ${fmt2(stats.q3, options)}`, options, { value: stats.median }).replace('class="uif-chart-mark"', 'class="uif-chart-mark uif-chart-box"')} x="${round2(x(stats.q1))}" y="${boxTop}" width="${round2(Math.max(1, x(stats.q3) - x(stats.q1)))}" height="${boxHeight}" rx="3"><title>Q1 ${esc2(fmt2(stats.q1, options))}, median ${esc2(fmt2(stats.median, options))}, Q3 ${esc2(fmt2(stats.q3, options))}</title></rect><line class="uif-chart-target" x1="${round2(x(stats.median))}" y1="${boxTop - 4}" x2="${round2(x(stats.median))}" y2="${boxTop + boxHeight + 4}"></line><line class="uif-chart-target" x1="${round2(x(stats.min))}" y1="${cy - 14}" x2="${round2(x(stats.min))}" y2="${cy + 14}"></line><line class="uif-chart-target" x1="${round2(x(stats.max))}" y1="${cy - 14}" x2="${round2(x(stats.max))}" y2="${cy + 14}"></line>`;
  return svgWrap2("box-plot", width, height, content, normalized, { ...options, description: options.description || `Median ${fmt2(stats.median, options)}, IQR ${fmt2(stats.iqr, options)}` });
}
function pointsFromData2(data, options) {
  return normalizeData2(data, options).map((d, index) => ({
    x: Number(options.x && d[options.x] != null ? d[options.x] : d.x ?? index + 1),
    y: Number(options.y && d[options.y] != null ? d[options.y] : d.y ?? d.value ?? 0)
  }));
}
function renderScatter2(data, options, forceRegression = false) {
  const width = options.width ?? 360;
  const height = options.height ?? 220;
  const plot = margins2(options);
  const normalized = normalizeData2(data, options);
  const points = pointsFromData2(data, options).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No plottable points")}</div>`;
  const xDomain = extent2(points.map((point) => point.x), { min: options.min });
  const yDomain = extent2(points.map((point) => point.y), { max: options.max });
  const x = scaleLinear2(xDomain, [plot.left, width - plot.right]);
  const y = scaleLinear2(yDomain, [height - plot.bottom, plot.top]);
  const marks = points.map((point, index) => {
    const label = `${normalized[index]?.label || `Point ${index + 1}`}: ${fmt2(point.x, options)}, ${fmt2(point.y, options)}`;
    return `<circle ${markAttrs2(label, options, { index, value: point.y })} cx="${round2(x(point.x))}" cy="${round2(y(point.y))}" r="4"><title>${esc2(label)}</title></circle>`;
  }).join("");
  const reg = options.regression || forceRegression ? linearRegression2(points) : null;
  const line = reg ? `<line class="uif-chart-regression" x1="${round2(x(xDomain[0]))}" y1="${round2(y(reg.predict(xDomain[0])))}" x2="${round2(x(xDomain[1]))}" y2="${round2(y(reg.predict(xDomain[1])))}"><title>y = ${esc2(fmt2(reg.slope, options))}x + ${esc2(fmt2(reg.intercept, options))}, R2 ${esc2(fmt2(reg.r2, options))}</title></line>` : "";
  return svgWrap2(forceRegression ? "regression" : "scatter", width, height, `${axisAndGrid2(width, height, plot, yDomain, options)}${verticalValueGrid2(width, height, plot, xDomain, options)}${marks}${line}`, normalized, options);
}
function renderControlChart2(data, options) {
  const normalized = normalizeData2(data, options);
  const stats = summaryStats2(normalized.map((d) => d.value ?? 0));
  if (!stats.count) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No data")}</div>`;
  const width = options.width ?? 360;
  const height = options.height ?? 200;
  const plot = margins2(options);
  const sigma = stats.stddev || 1;
  const min = Math.min(stats.min, stats.mean - sigma * 3);
  const max = Math.max(stats.max, stats.mean + sigma * 3);
  const domain = extent2([min, max], options);
  const referenceLines = [stats.mean, stats.mean + sigma * 3, stats.mean - sigma * 3];
  const y = scaleLinear2(domain, [height - plot.bottom, plot.top]);
  const xStep = normalized.length > 1 ? (width - plot.left - plot.right) / (normalized.length - 1) : 0;
  const points = normalized.map((d, i) => [plot.left + i * xStep, y(d.value ?? 0)]);
  const line = `<polyline class="uif-chart-series uif-chart-line" data-uif-series="value" points="${pointString2(points)}" fill="none"></polyline>`;
  const marks = points.map(([cx, cy], i) => {
    const value = normalized[i].value ?? 0;
    const label = `${normalized[i].label ?? ""}: ${fmt2(value, options)}`;
    return `<circle ${markAttrs2(label, options, { index: i, value })} cx="${round2(cx)}" cy="${round2(cy)}" r="3"><title>${esc2(label)}</title></circle>`;
  }).join("");
  const refs = referenceLines.map((value, index) => {
    const yy = round2(y(value));
    return `<line class="uif-chart-reference ${index === 0 ? "uif-chart-mean" : ""}" x1="${plot.left}" y1="${yy}" x2="${width - plot.right}" y2="${yy}"><title>${index === 0 ? "Mean" : "Control limit"} ${esc2(fmt2(value, options))}</title></line>`;
  }).join("");
  const body = `${axisAndGrid2(width, height, plot, domain, options)}${refs}${line}${marks}`;
  return svgWrap2("control-chart", width, height, body, normalized, { ...options, description: options.description || "Control chart with mean and three sigma limits" });
}
function renderPareto2(data, options) {
  const sorted = normalizeData2(data, options).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = sorted.reduce((sum, item) => sum + Math.max(0, item.value ?? 0), 0) || 1;
  let running = 0;
  const cumulative = sorted.map((item) => {
    running += Math.max(0, item.value ?? 0);
    return { ...item, values: { Count: item.value ?? 0, Cumulative: running / total * 100 } };
  });
  return `${renderBars2(cumulative, { ...options, type: "bar", series: [], y: void 0 }, "bar")}${renderLineLike2(
    cumulative.map((item) => ({ label: item.label, value: Number(item.values?.Cumulative ?? 0) })),
    { ...options, label: options.label || "Cumulative percent", min: 0, max: 100 }
  )}`;
}
function renderChart2(data, options = {}) {
  const type = options.type ?? "bar";
  const normalized = normalizeData2(coerceData2(data), options);
  if (!normalized.length) return `<div class="uif-chart-state" data-uif-state="empty">${esc2(options.description || "No data")}</div>`;
  if (type === "metric") return renderMetric2(normalized, options);
  if (type === "line") return renderLineLike2(normalized, options);
  if (type === "area") return renderLineLike2(normalized, options, true);
  if (type === "horizontal-bar") return renderBars2(normalized, options, "horizontal-bar");
  if (type === "grouped-bar") return renderBars2(normalized, options, "grouped-bar");
  if (type === "stacked-bar") return renderBars2(normalized, options, "stacked-bar");
  if (type === "pie") return renderPie2(normalized, options);
  if (type === "donut" || type === "doughnut") return renderPie2(normalized, options, true);
  if (type === "radar") return renderRadar2(normalized, options);
  if (type === "sparkline") return renderSparkline2(normalized, options);
  if (type === "progress" || type === "ring" || type === "gauge") return renderRing2(normalized, options, type);
  if (type === "bullet") return renderBullet2(normalized, options);
  if (type === "heatmap" || type === "status-heatmap") return renderHeatmap2(normalized, options);
  if (type === "timeline") return renderBars2(normalized, { ...options, axes: false }, "bar");
  if (type === "histogram") return renderHistogram2(normalized, options);
  if (type === "box-plot") return renderBoxPlot2(normalized, options);
  if (type === "scatter") return renderScatter2(normalized, options);
  if (type === "regression") return renderScatter2(normalized, options, true);
  if (type === "control-chart") return renderControlChart2(normalized, options);
  if (type === "distribution") return renderHistogram2(normalized, options, true);
  if (type === "pareto") return renderPareto2(normalized, options);
  return renderBars2(normalized, options, "bar");
}

// packages/dashboard/src/index.ts
function esc3(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeWidget(widget, index) {
  return {
    ...widget,
    id: widget.id || `widget-${index + 1}`,
    title: widget.title || `Widget ${index + 1}`,
    type: widget.type || "metric",
    span: widget.span ?? 1
  };
}
function createDashboardConfig(config) {
  return {
    ...config,
    title: config.title || "Dashboard",
    density: config.density ?? "default",
    columns: config.columns ?? 3,
    filters: config.filters ?? [],
    widgets: (config.widgets ?? []).map(normalizeWidget)
  };
}
function applyDashboardFilters(rows2, filters = []) {
  return rows2.filter(
    (row) => filters.every((filter) => {
      const value = row[filter.field];
      const operator = filter.operator ?? "equals";
      if (operator === "contains") return String(value ?? "").toLowerCase().includes(String(filter.value ?? "").toLowerCase());
      if (operator === "gte") return Number(value) >= Number(filter.value);
      if (operator === "lte") return Number(value) <= Number(filter.value);
      if (operator === "between" && Array.isArray(filter.value)) return Number(value) >= Number(filter.value[0]) && Number(value) <= Number(filter.value[1]);
      return value === filter.value;
    })
  );
}
function summarizeDashboard(rows2, field) {
  const values = rows2.map((row) => Number(row[field])).filter(Number.isFinite);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    count: values.length,
    sum,
    average: values.length ? sum / values.length : 0,
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0
  };
}
function renderRows(rows2, columns) {
  const visibleColumns = columns?.length ? columns : Object.keys(rows2[0] ?? {});
  if (!rows2.length) return '<p class="uif-text-muted">No records</p>';
  return `<div class="uif-table-wrap"><table class="uif-table"><thead><tr>${visibleColumns.map((column) => `<th>${esc3(column)}</th>`).join("")}</tr></thead><tbody>${rows2.map((row) => `<tr>${visibleColumns.map((column) => `<td>${esc3(row[column])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function chartData(data) {
  return (data ?? []).map((item) => {
    const row = asRecord(item);
    return {
      ...row,
      label: String(row.label ?? row.name ?? ""),
      value: Number(row.value ?? 0)
    };
  });
}
function renderDashboardWidget(widget, options = {}) {
  const span = widget.span === "full" ? "full" : String(widget.span ?? 1);
  const body = widget.type === "chart" ? renderChart2(chartData(widget.data), { type: "bar", palette: "professional", table: "sr-only", ...widget.chart ?? {} }) : widget.type === "table" ? renderRows((widget.data ?? []).map(asRecord), widget.columns) : widget.type === "list" ? `<ul class="uif-list">${(widget.data ?? []).map((item) => `<li>${esc3(asRecord(item).label ?? item)}</li>`).join("")}</ul>` : widget.type === "custom" ? widget.html ?? "" : `<strong class="uif-dashboard-metric">${esc3(widget.value ?? 0)}</strong>${widget.change ? `<span class="uif-badge uif-badge-success">${esc3(widget.change)}</span>` : ""}`;
  return `<article class="uif-card uif-dashboard-widget" data-uif-dashboard-span="${esc3(span)}"><div class="uif-card-head"><div><h3>${esc3(widget.title)}</h3>${widget.description ? `<p>${esc3(widget.description)}</p>` : ""}</div></div><div class="uif-card-body">${body || `<p class="uif-text-muted">${esc3(options.emptyText ?? "No data")}</p>`}</div></article>`;
}
function renderDashboard(input, options = {}) {
  const config = createDashboardConfig(input);
  const className = ["uif-dashboard", options.className].filter(Boolean).join(" ");
  return `<section class="${esc3(className)}" data-uif-dashboard-columns="${config.columns}" data-uif-dashboard-density="${esc3(config.density)}"><header class="uif-dashboard-head"><div><h2>${esc3(config.title)}</h2>${config.description ? `<p>${esc3(config.description)}</p>` : ""}</div></header><div class="uif-dashboard-grid">${config.widgets.map((widget) => renderDashboardWidget(widget, options)).join("")}</div></section>`;
}
function initDashboard(el) {
  const raw = el.dataset.uifDashboard || el.dataset.uifOptions;
  if (!raw) return;
  const config = createDashboardConfig(JSON.parse(raw));
  el.innerHTML = renderDashboard(config);
}

// packages/desktop/src/index.ts
function esc4(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function parseJSON(value) {
  if (!value) return void 0;
  return JSON.parse(value);
}
function safeStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : void 0;
  } catch {
    return void 0;
  }
}
function platformFromRuntime() {
  const globalValue = globalThis;
  if (globalValue.__TAURI_INTERNALS__) return "tauri";
  if (globalValue.process?.versions?.electron) return "electron";
  if (typeof window !== "undefined") return "browser";
  return "unknown";
}
function normalizeManifest(input) {
  return {
    ...input,
    workspaceMode: input.workspaceMode ?? "none",
    offlineMode: input.offlineMode ?? "none",
    aiMode: input.aiMode ?? "none",
    capabilities: input.capabilities ?? [],
    navigation: input.navigation ?? []
  };
}
function validateDesktopManifest(manifest) {
  const errors = [];
  if (!manifest.id || typeof manifest.id !== "string") errors.push("Desktop manifest requires a string id.");
  if (!manifest.name || typeof manifest.name !== "string") errors.push("Desktop manifest requires a string name.");
  if (manifest.navigation?.some((item) => !item.id || !item.label)) errors.push("Every desktop navigation item requires id and label.");
  return { valid: errors.length === 0, errors };
}
function createDesktopManifest(input) {
  const result = validateDesktopManifest(input);
  if (!result.valid) throw new Error(result.errors.join(" "));
  return normalizeManifest(input);
}
function parseDesktopManifestElement(element) {
  const options = parseJSON(element.dataset.uifOptions || element.dataset.uifDesktop);
  return createDesktopManifest({
    id: element.dataset.uifDesktopApp || options?.id || "desktop-app",
    name: options?.name || element.dataset.uifDesktopName || element.getAttribute("aria-label") || "Desktop App",
    version: options?.version || element.dataset.uifDesktopVersion,
    workspaceMode: options?.workspaceMode,
    offlineMode: options?.offlineMode,
    aiMode: options?.aiMode,
    capabilities: options?.capabilities,
    navigation: options?.navigation
  });
}
function detectDesktopPlatform() {
  return platformFromRuntime();
}
function hasDesktopCapability(capability, manifest) {
  if (manifest?.capabilities?.includes(capability)) return true;
  if (capability === "offline") return typeof navigator !== "undefined" && "onLine" in navigator;
  if (capability === "notifications") return typeof Notification !== "undefined";
  return false;
}
function createDesktopShell(options) {
  return {
    ...createDesktopManifest(options),
    title: options.title || options.name,
    subtitle: options.subtitle,
    status: {
      online: options.status?.online ?? (typeof navigator === "undefined" ? true : navigator.onLine),
      sync: options.status?.sync ?? "idle",
      queued: options.status?.queued ?? 0,
      message: options.status?.message,
      lastSyncedAt: options.status?.lastSyncedAt
    },
    actions: options.actions ?? [],
    bodyHtml: options.bodyHtml ?? ""
  };
}
function renderNav(items = []) {
  return items.map(
    (item) => `<a class="uif-desktop-nav-item" href="${esc4(item.href || "#")}"${item.active ? ' aria-current="page"' : ""}${item.permission ? ` data-uif-permission="${esc4(item.permission)}"` : ""}>${item.icon ? `<span data-uif-icon="${esc4(item.icon)}"></span>` : ""}<span>${esc4(item.label)}</span>${item.badge !== void 0 ? `<em>${esc4(item.badge)}</em>` : ""}</a>`
  ).join("");
}
function renderDesktopSyncStatus(status) {
  const state = status.sync ?? status.state ?? "idle";
  const queued = status.queued ?? 0;
  const label = status.message || (state === "offline" ? "Offline" : state === "failed" ? "Sync failed" : queued ? `${queued} queued` : "Synced");
  return `<span class="uif-desktop-status-pill" data-uif-sync-status="${esc4(state)}"><span aria-hidden="true"></span>${esc4(label)}</span>`;
}
function renderDesktopShell(options) {
  const shell = createDesktopShell(options);
  return `<section class="uif-desktop-shell" data-uif-desktop-app="${esc4(shell.id)}" data-uif-desktop-platform="${esc4(detectDesktopPlatform())}">
    <aside class="uif-desktop-sidebar">
      <div class="uif-desktop-brand"><strong>${esc4(shell.name)}</strong>${shell.version ? `<span>${esc4(shell.version)}</span>` : ""}</div>
      <nav class="uif-desktop-nav" data-uif="desktop-nav">${renderNav(shell.navigation)}</nav>
    </aside>
    <main class="uif-desktop-main">
      <header class="uif-desktop-topbar">
        <div><h1>${esc4(shell.title)}</h1>${shell.subtitle ? `<p>${esc4(shell.subtitle)}</p>` : ""}</div>
        <div class="uif-desktop-actions">${renderNav(shell.actions)}${renderDesktopSyncStatus(shell.status ?? {})}</div>
      </header>
      <div class="uif-desktop-content">${shell.bodyHtml}</div>
      <footer class="uif-desktop-statusbar" data-uif="desktop-status">${renderDesktopSyncStatus(shell.status ?? {})}</footer>
    </main>
  </section>`;
}
function setDesktopStatus(element, status) {
  element.querySelectorAll('[data-uif="desktop-status"], .uif-desktop-actions').forEach((target) => {
    const current = target.matches('[data-uif="desktop-status"]') ? target : target.querySelector("[data-uif-sync-status]");
    if (!current) return;
    current.outerHTML = renderDesktopSyncStatus(status);
  });
}
function initDesktopShell(element) {
  const raw = element.dataset.uifOptions || element.dataset.uifDesktop;
  if (raw) element.innerHTML = renderDesktopShell(parseJSON(raw));
  const dispose = bindDesktopOfflineIndicator(element);
  return dispose;
}
function createMemorySettingsStore(namespace = "uif-desktop") {
  const values = /* @__PURE__ */ new Map();
  const keyFor = (key) => `${namespace}:${key}`;
  return {
    get(key) {
      return values.get(keyFor(key)) ?? null;
    },
    set(key, value) {
      values.set(keyFor(key), value);
    },
    remove(key) {
      values.delete(keyFor(key));
    },
    clear() {
      [...values.keys()].filter((key) => key.startsWith(`${namespace}:`)).forEach((key) => values.delete(key));
    }
  };
}
function createLocalSettingsStore(namespace) {
  const storage = safeStorage();
  const fallback = createMemorySettingsStore(namespace);
  const keyFor = (key) => `${namespace}:${key}`;
  if (!storage) return fallback;
  return {
    get(key) {
      const value = storage.getItem(keyFor(key));
      return value === null ? null : JSON.parse(value);
    },
    set(key, value) {
      storage.setItem(keyFor(key), JSON.stringify(value));
    },
    remove(key) {
      storage.removeItem(keyFor(key));
    },
    clear() {
      Object.keys(storage).filter((key) => key.startsWith(`${namespace}:`)).forEach((key) => storage.removeItem(key));
    }
  };
}
function bindDesktopSettings(element, store) {
  element.querySelectorAll("[data-uif-setting]").forEach(async (field) => {
    const key = field.dataset.uifSetting;
    if (!key) return;
    const value = await store.get(key);
    if (field instanceof HTMLInputElement && field.type === "checkbox") field.checked = Boolean(value);
    else if (value !== null) field.value = String(value);
    field.addEventListener("change", () => {
      const next = field instanceof HTMLInputElement && field.type === "checkbox" ? field.checked : field.value;
      void store.set(key, next);
    });
  });
}
function createWorkspaceSession(input) {
  return {
    ...input,
    roles: input.roles ?? [],
    permissions: input.permissions ?? []
  };
}
function canUseDesktopAction(session, permission) {
  if (!permission) return true;
  if (!session) return false;
  return Boolean(session.permissions?.includes(permission) || session.permissions?.includes("*"));
}
function applyPermissionNavigation(root, session) {
  root.querySelectorAll("[data-uif-permission]").forEach((element) => {
    const allowed = canUseDesktopAction(session, element.dataset.uifPermission || "");
    element.hidden = !allowed;
    element.setAttribute("aria-hidden", String(!allowed));
  });
}
function renderWorkspaceIdentity(session) {
  const normalized = createWorkspaceSession(session);
  return `<div class="uif-desktop-identity"><strong>${esc4(normalized.workspaceName)}</strong><span>${esc4(normalized.userName)}${normalized.roles?.length ? ` \xB7 ${esc4(normalized.roles.join(", "))}` : ""}</span></div>`;
}
function summarizeDesktopQueue(queueItems) {
  const queued = queueItems.filter((item) => item.status === "queued" || !item.status).length;
  const failed = queueItems.filter((item) => item.status === "failed").length;
  const syncing = queueItems.filter((item) => item.status === "syncing").length;
  const state = failed ? "failed" : syncing ? "syncing" : queued ? "queued" : "synced";
  return {
    state,
    queued,
    failed,
    syncing,
    message: failed ? `${failed} failed` : queued ? `${queued} queued` : syncing ? `${syncing} syncing` : "All changes synced"
  };
}
function createDesktopSyncStatus(input = {}) {
  return {
    state: input.state ?? "idle",
    queued: input.queued ?? 0,
    failed: input.failed ?? 0,
    syncing: input.syncing ?? 0,
    message: input.message ?? "Ready",
    lastSyncedAt: input.lastSyncedAt
  };
}
function bindDesktopOfflineIndicator(element, options = {}) {
  const update = () => {
    const online = typeof navigator === "undefined" ? true : navigator.onLine;
    element.toggleAttribute("data-uif-offline", !online);
    element.querySelectorAll("[data-uif-offline-label]").forEach((label) => {
      label.textContent = online ? options.onlineText ?? "Online" : options.offlineText ?? "Offline";
    });
  };
  update();
  if (typeof window === "undefined") return () => void 0;
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  return () => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  };
}

// packages/effects/src/index.ts
var animationPresets2 = [
  { name: "fade-in", category: "entrance", duration: 180, description: "Fade content into view." },
  { name: "fade-out", category: "exit", duration: 180, description: "Fade content out of view." },
  { name: "slide-up", category: "entrance", duration: 220, description: "Slide upward into place." },
  { name: "slide-down", category: "entrance", duration: 220, description: "Slide downward into place." },
  { name: "slide-left", category: "entrance", duration: 220, description: "Slide left into place." },
  { name: "slide-right", category: "entrance", duration: 220, description: "Slide right into place." },
  { name: "slide-out-up", category: "exit", duration: 200, description: "Slide upward out of view." },
  { name: "slide-out-down", category: "exit", duration: 200, description: "Slide downward out of view." },
  { name: "scale-in", category: "entrance", duration: 180, description: "Scale content into view." },
  { name: "scale-out", category: "exit", duration: 180, description: "Scale content out of view." },
  { name: "pop", category: "attention", duration: 220, description: "Short emphasized pop." },
  { name: "pulse", category: "attention", duration: 420, repeat: true, description: "Pulse focus ring for attention." },
  { name: "shake", category: "attention", duration: 260, description: "Shake to show invalid state." },
  { name: "highlight", category: "attention", duration: 500, description: "Highlight changed content." },
  { name: "flash", category: "attention", duration: 380, description: "Flash content briefly." },
  { name: "bounce", category: "attention", duration: 420, description: "Bounce content into emphasis." },
  { name: "wiggle", category: "attention", duration: 420, description: "Small rotational attention motion." },
  { name: "shimmer", category: "loading", duration: 1100, repeat: true, description: "Loading shimmer." },
  { name: "spin", category: "loading", duration: 900, repeat: true, description: "Spinner rotation." },
  { name: "skeleton-pulse", category: "loading", duration: 1200, repeat: true, description: "Skeleton loading pulse." },
  { name: "crossfade", category: "layout", duration: 220, description: "Soft layout/content transition." }
];
var activeAnimations2 = /* @__PURE__ */ new WeakMap();
function prefersReducedMotion2() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
function nextFrame2() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
async function transition2(el, className, options = {}) {
  if (prefersReducedMotion2()) {
    el.classList.add(className);
    return;
  }
  await nextFrame2();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  el.classList.add(className);
  await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
}
async function show2(el, options = {}) {
  el.hidden = false;
  el.dataset.uifState = "open";
  await transition2(el, options.className ?? "uif-is-visible", options);
}
async function hide2(el, options = {}) {
  el.dataset.uifState = "closed";
  el.classList.remove(options.className ?? "uif-is-visible");
  if (!prefersReducedMotion2()) await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
  el.hidden = true;
}
async function toggle2(el, options = {}) {
  if (el.hidden || el.dataset.uifState === "closed") await show2(el, options);
  else await hide2(el, options);
}
async function expand2(el, options = {}) {
  el.style.height = "0px";
  el.hidden = false;
  await nextFrame2();
  el.style.height = `${el.scrollHeight}px`;
  await transition2(el, options.className ?? "uif-is-expanded", options);
  el.style.height = "";
}
async function collapse2(el, options = {}) {
  el.style.height = `${el.scrollHeight}px`;
  await nextFrame2();
  el.style.height = "0px";
  await hide2(el, options);
  el.style.height = "";
}
async function animate2(el, animation, options = {}) {
  const className = options.className ?? `uif-animate-${animation}`;
  el.classList.remove(className, "uif-is-animating");
  if (prefersReducedMotion2()) {
    el.dataset.uifAnimation = animation;
    return;
  }
  await nextFrame2();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  const preset = animationPresets2.find((item) => item.name === animation);
  const duration = options.duration ?? preset?.duration ?? 220;
  el.style.animationDuration = `${duration}ms`;
  if (options.easing) el.style.animationTimingFunction = options.easing;
  if (options.repeat) el.style.animationIterationCount = String(options.repeat);
  if (options.direction) el.style.animationDirection = options.direction;
  if (options.fill) el.style.animationFillMode = options.fill;
  el.classList.add("uif-is-animating", className);
  const token = Date.now();
  activeAnimations2.set(el, token);
  await new Promise((resolve) => window.setTimeout(resolve, duration * (options.repeat ?? 1)));
  if (activeAnimations2.get(el) !== token) return;
  el.classList.remove("uif-is-animating", className);
  el.style.animationDuration = "";
  el.style.animationTimingFunction = "";
  el.style.animationIterationCount = "";
  el.style.animationDirection = "";
  el.style.animationFillMode = "";
}
async function sequence(steps, options = {}) {
  for (const step of steps) await animate2(step.el, step.animation, { ...options, ...step.options });
}
async function timeline(steps, options = {}) {
  await sequence(steps, options);
}
async function stagger(elements, animation, options = {}) {
  const delay3 = options.delay ?? 60;
  await Promise.all([...elements].map((el, index) => animate2(el, animation, { ...options, delay: delay3 * index })));
}
async function animateGroup(root, selector, animation, options = {}) {
  await stagger(root.querySelectorAll(selector), animation, options);
}
function cancelAnimation(el) {
  activeAnimations2.delete(el);
  el.classList.remove("uif-is-animating");
  [...el.classList].filter((name) => name.startsWith("uif-animate-")).forEach((name) => el.classList.remove(name));
  el.style.animationDuration = "";
  el.style.animationTimingFunction = "";
  el.style.animationIterationCount = "";
  el.style.animationDirection = "";
  el.style.animationFillMode = "";
}
function initAnimation(el) {
  const animation = el.dataset.uifAnimation || "fade-in";
  const duration = Number(el.dataset.uifDuration || "") || void 0;
  const delay3 = Number(el.dataset.uifDelay || "") || void 0;
  const repeat = Number(el.dataset.uifRepeat || "") || void 0;
  const easing = el.dataset.uifEasing || void 0;
  const once = el.dataset.uifOnce !== "false";
  const trigger2 = el.dataset.uifTrigger || "load";
  let hasRun = false;
  const run = () => {
    if (once && hasRun) return;
    hasRun = true;
    void animate2(el, animation, { duration, delay: delay3, repeat, easing, once });
  };
  if (trigger2 === "load") run();
  if (trigger2 === "hover") {
    el.addEventListener("mouseenter", run);
    return;
  }
  if (trigger2 === "focus") {
    el.addEventListener("focusin", run);
    return;
  }
  if (trigger2 === "click") {
    el.addEventListener("click", run);
    return;
  }
  if (trigger2 === "intersect" && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        observer.disconnect();
      }
    });
    observer.observe(el);
  }
}
function initAnimationTriggers(root = document) {
  root.querySelectorAll('[data-uif="animate"]').forEach(initAnimation);
}
function observeMotion(root = document.documentElement) {
  root.dataset.uifMotion = prefersReducedMotion2() ? "reduce" : "safe";
}

// packages/editor/src/index.ts
var editors = /* @__PURE__ */ new WeakMap();
var editorListeners = /* @__PURE__ */ new WeakMap();
var editorInitialValue = /* @__PURE__ */ new WeakMap();
var editorHistory = /* @__PURE__ */ new WeakMap();
var editorActiveTableCell = /* @__PURE__ */ new WeakMap();
var commandHandlers = /* @__PURE__ */ new Map();
var hookHandlers = /* @__PURE__ */ new Map();
var editorAutosaveTimers = /* @__PURE__ */ new WeakMap();
var defaultToolbar = ["undo", "redo", "bold", "italic", "heading", "quote", "code", "ul", "ol", "link", "preview", "source"];
var commandLabels = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  heading: "Heading",
  paragraph: "Paragraph",
  quote: "Quote",
  code: "Code",
  hr: "Horizontal rule",
  ul: "Bulleted list",
  ol: "Numbered list",
  task: "Task list",
  link: "Link",
  "link-edit": "Edit link",
  "link-remove": "Remove link",
  image: "Image",
  "image-edit": "Edit image",
  "image-remove": "Remove image",
  table: "Table",
  "table-row-before": "Add row before",
  "table-row-after": "Add row",
  "table-row-delete": "Delete row",
  "table-col-before": "Add column before",
  "table-col-after": "Add column",
  "table-col-delete": "Delete column",
  "table-delete": "Delete table",
  "table-header-toggle": "Toggle header",
  undo: "Undo",
  redo: "Redo",
  preview: "Preview",
  source: "Source",
  fullscreen: "Fullscreen",
  clear: "Clear formatting"
};
var commandIcons = {
  bold: '<path d="M7 5h6a4 4 0 0 1 0 8H7z"></path><path d="M7 13h7a4 4 0 0 1 0 8H7z"></path>',
  italic: '<path d="M10 5h8"></path><path d="M6 19h8"></path><path d="m14 5-4 14"></path>',
  underline: '<path d="M7 5v6a5 5 0 0 0 10 0V5"></path><path d="M5 21h14"></path>',
  strike: '<path d="M5 12h14"></path><path d="M16 6.5A4.5 4.5 0 0 0 12 5c-2.5 0-4 1.2-4 3"></path><path d="M8 17c.8 1.3 2.2 2 4 2 2.5 0 4-1.2 4-3"></path>',
  heading: '<path d="M6 5v14"></path><path d="M18 5v14"></path><path d="M6 12h12"></path>',
  paragraph: '<path d="M13 20V5"></path><path d="M17 20V5"></path><path d="M17 5H9a4 4 0 0 0 0 8h4"></path>',
  quote: '<path d="M9 7H5v6h4v4l3-4V7z"></path><path d="M19 7h-4v6h4v4l3-4V7z"></path>',
  code: '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  hr: '<path d="M5 12h14"></path>',
  ul: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
  ol: '<path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M4 14h2l-2 4h2"></path>',
  task: '<path d="m4 7 2 2 4-4"></path><path d="M12 8h8"></path><path d="m4 17 2 2 4-4"></path><path d="M12 18h8"></path>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2"></path>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="10" r="2"></circle><path d="m21 15-4-4-5 5-2-2-4 5"></path>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 4v16"></path>',
  undo: '<path d="M3 7v6h6"></path><path d="M3 13a8 8 0 1 1 2.3 5.7"></path>',
  redo: '<path d="M21 7v6h-6"></path><path d="M21 13a8 8 0 1 0-2.3 5.7"></path>',
  preview: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
  source: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>',
  fullscreen: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path>',
  clear: '<path d="m16 3 5 5-9 9H7l-4-4 13-10z"></path><path d="M14 21H3"></path>'
};
function registerEditorCommand(name, handler) {
  commandHandlers.set(name, handler);
}
function unregisterEditorCommand(name) {
  commandHandlers.delete(name);
}
function registerEditorHook(name, handler) {
  const handlers3 = hookHandlers.get(name) ?? /* @__PURE__ */ new Set();
  handlers3.add(handler);
  hookHandlers.set(name, handlers3);
  return () => handlers3.delete(handler);
}
async function runEditorHooks(name, context) {
  const handlers3 = hookHandlers.get(name);
  if (!handlers3?.size) return [];
  const results = [];
  for (const handler of handlers3) results.push(await handler(context));
  return results;
}
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
function editorCommandLabel(command) {
  return commandLabels[command] ?? command.replaceAll("-", " ");
}
function editorCommandIcon(command) {
  const body = commandIcons[command] ?? '<circle cx="12" cy="12" r="8"></circle>';
  return `<svg class="uif-icon uif-editor-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
function isSafeUrl(value) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(value.trim());
}
function safeUrl(value, fallback) {
  const candidate = String(value ?? "").trim();
  return isSafeUrl(candidate) ? candidate : fallback;
}
function linesToList(lines, ordered) {
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((line) => line.replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, "")).map((line) => `<li>${inlineMarkdown(line)}</li>`).join("");
  return `<${tag}>${items}</${tag}>`;
}
function inlineMarkdown(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_match, alt, url) => {
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}">`;
  });
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g, (_match, label, url) => {
    return `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`;
  });
  output = output.replace(/(?<!href=")\bhttps?:\/\/[^\s<]+/g, (url) => `<a href="${escapeAttr(url)}">${escapeHtml(url)}</a>`);
  return output;
}
function tableToHtml(lines) {
  const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const [headerLine, , ...bodyLines] = lines;
  const header = cells(headerLine ?? "");
  const body = bodyLines.map(cells);
  return `<table><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i]?.startsWith("```")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      i += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+\[[ xX]\]\s+/.test(lines[i] ?? "")) {
        const checked = /\[[xX]\]/.test(lines[i] ?? "");
        items.push((lines[i] ?? "").replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, `${checked ? "[x] " : "[ ] "}`));
        i += 1;
      }
      blocks.push(
        `<ul class="uif-task-list">${items.map((item) => `<li><input type="checkbox" disabled${item.startsWith("[x]") ? " checked" : ""}> ${inlineMarkdown(item.slice(4))}</li>`).join("")}</ul>`
      );
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
        items.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(linesToList(items, false));
      continue;
    }
    if (/^\|.+\|$/.test(line) && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1] ?? "")) {
      const tableLines = [line, lines[i + 1] ?? ""];
      i += 2;
      while (i < lines.length && /^\|.+\|$/.test(lines[i] ?? "")) {
        tableLines.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(tableToHtml(tableLines));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push(linesToList(items, true));
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quotes = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i] ?? "")) {
        quotes.push((lines[i] ?? "").replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${quotes.map(inlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) {
      blocks.push("<hr>");
      i += 1;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i]?.trim() && !/^(#{1,6})\s+/.test(lines[i] ?? "") && !/^\s*[-*+]\s+/.test(lines[i] ?? "") && !/^\s*\d+\.\s+/.test(lines[i] ?? "") && !/^\s*>\s?/.test(lines[i] ?? "") && !lines[i]?.startsWith("```")) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push(`<p>${para.map(inlineMarkdown).join("<br>")}</p>`);
  }
  return blocks.join("\n");
}
function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("strong,b").forEach((el) => el.replaceWith(`**${el.textContent ?? ""}**`));
  doc.querySelectorAll("em,i").forEach((el) => el.replaceWith(`*${el.textContent ?? ""}*`));
  doc.querySelectorAll("del,s").forEach((el) => el.replaceWith(`~~${el.textContent ?? ""}~~`));
  doc.querySelectorAll("code").forEach((el) => el.replaceWith(`\`${el.textContent ?? ""}\``));
  doc.querySelectorAll("img").forEach((el) => el.replaceWith(`![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})`));
  doc.querySelectorAll("a").forEach((el) => el.replaceWith(`[${el.textContent ?? ""}](${el.getAttribute("href") ?? "#"})`));
  doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((el) => {
    const level = Number(el.tagName.slice(1));
    el.replaceWith(`${"#".repeat(level)} ${el.textContent ?? ""}

`);
  });
  doc.querySelectorAll("li").forEach((el) => el.replaceWith(`- ${el.textContent ?? ""}
`));
  doc.querySelectorAll("p,blockquote,pre").forEach((el) => el.replaceWith(`${el.textContent ?? ""}

`));
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
function cleanEditorHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) el.removeAttribute(attr.name);
      if ((attr.name === "href" || attr.name === "src") && !isSafeUrl(attr.value)) el.removeAttribute(attr.name);
      if (attr.name === "style") el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
}
function asInput(el) {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el;
  const input = el.querySelector('textarea,input[type="hidden"],input[type="text"]');
  if (!input) throw new Error("Editor requires a textarea or input.");
  return input;
}
function parseOptions(el, options = {}) {
  const configuredMaxLength = Number(el.dataset.uifMaxlength || "");
  const inputMaxLength = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement ? el.maxLength > 0 ? el.maxLength : 0 : 0;
  return {
    mode: options.mode ?? el.dataset.uifMode ?? "html",
    toolbar: options.toolbar ?? el.dataset.uifToolbar?.split(/\s+/).filter(Boolean) ?? defaultToolbar,
    preview: options.preview ?? el.dataset.uifPreview ?? "manual",
    height: options.height ?? el.dataset.uifEditorHeight ?? "14rem",
    layout: options.layout ?? el.dataset.uifEditorLayout ?? "source",
    status: options.status ?? el.dataset.uifEditorStatus !== "false",
    placeholder: options.placeholder ?? el.dataset.uifPlaceholder ?? "",
    autosave: options.autosave ?? el.dataset.uifAutosave === "true",
    autosaveDelay: options.autosaveDelay ?? (Number(el.dataset.uifAutosaveDelay || "") || 1200),
    autosaveUrl: options.autosaveUrl ?? el.dataset.uifAutosaveUrl ?? "",
    required: options.required ?? (el.dataset.uifRequired === "true" || el instanceof HTMLTextAreaElement && el.required),
    maxLength: options.maxLength ?? (configuredMaxLength || inputMaxLength)
  };
}
function wrapSelection(surface, before, after = before, fallback = "text") {
  const start2 = surface.selectionStart;
  const end = surface.selectionEnd;
  const selected = surface.value.slice(start2, end) || fallback;
  const next = `${surface.value.slice(0, start2)}${before}${selected}${after}${surface.value.slice(end)}`;
  surface.value = next;
  const cursorStart = start2 + before.length;
  surface.setSelectionRange(cursorStart, cursorStart + selected.length);
  return next;
}
function insertAtSelection(surface, value) {
  const start2 = surface.selectionStart;
  const end = surface.selectionEnd;
  const next = `${surface.value.slice(0, start2)}${value}${surface.value.slice(end)}`;
  surface.value = next;
  surface.setSelectionRange(start2 + value.length, start2 + value.length);
  return next;
}
function currentTextareaLine(surface) {
  const before = surface.value.slice(0, surface.selectionStart);
  const after = surface.value.slice(surface.selectionStart);
  const start2 = before.lastIndexOf("\n") + 1;
  const nextBreak = after.indexOf("\n");
  const end = nextBreak === -1 ? surface.value.length : surface.selectionStart + nextBreak;
  return { start: start2, end, line: surface.value.slice(start2, end) };
}
function handleMarkdownTaskKey(surface, event) {
  const { start: start2, end, line } = currentTextareaLine(surface);
  const task = /^(\s*[-*+]\s+\[[ xX]\]\s*)(.*)$/.exec(line);
  if (!task) return false;
  if (event.key === "Enter") {
    event.preventDefault();
    if (!task[2].trim()) {
      const removeStart = start2 > 0 && surface.value[start2 - 1] === "\n" ? start2 - 1 : start2;
      surface.value = `${surface.value.slice(0, removeStart)}${surface.value.slice(end + (surface.value[end] === "\n" ? 1 : 0))}`;
      surface.setSelectionRange(removeStart, removeStart);
      return true;
    }
    const insert = `
${task[1].replace(/\[[xX]\]/, "[ ]")}`;
    insertAtSelection(surface, insert);
    return true;
  }
  if (event.key === "Backspace" && !task[2].trim() && surface.selectionStart === end && surface.selectionEnd === end) {
    event.preventDefault();
    surface.value = `${surface.value.slice(0, start2)}${surface.value.slice(end)}`;
    surface.setSelectionRange(start2, start2);
    return true;
  }
  return false;
}
function richSurface(editor) {
  return editor.surface instanceof HTMLTextAreaElement ? null : editor.surface;
}
function richRange(editor) {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  if (selection?.rangeCount) {
    const range2 = selection.getRangeAt(0);
    if (surface.contains(range2.commonAncestorContainer)) return range2;
  }
  const range = document.createRange();
  range.selectNodeContents(surface);
  range.collapse(false);
  return range;
}
function setRichCaretAfter(node) {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
function insertRichHtml(editor, html) {
  const range = richRange(editor);
  if (!range) return;
  const template = document.createElement("template");
  template.innerHTML = cleanEditorHtml(html);
  const fragment2 = template.content;
  const last = fragment2.lastChild;
  range.deleteContents();
  range.insertNode(fragment2);
  if (last) setRichCaretAfter(last);
}
function wrapRichSelection(editor, tagName, fallback, attrs = {}) {
  const range = richRange(editor);
  if (!range) return;
  const node = document.createElement(tagName);
  Object.entries(attrs).forEach(([name, attrValue]) => node.setAttribute(name, attrValue));
  if (range.collapsed) {
    node.textContent = fallback;
  } else {
    node.append(range.extractContents());
  }
  range.deleteContents();
  range.insertNode(node);
  setRichCaretAfter(node);
}
function selectedRichText(editor, fallback) {
  const range = richRange(editor);
  return range && !range.collapsed ? range.toString() : fallback;
}
function currentRichElement(editor, selector) {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const selectedNode = range?.startContainer.childNodes.item(range.startOffset);
  if (selectedNode instanceof Element) {
    const selected = selectedNode.matches(selector) ? selectedNode : selectedNode.querySelector(selector);
    if (selected instanceof Element && surface.contains(selected)) return selected;
  }
  const element = node instanceof Element ? node : node?.parentElement;
  const closest2 = element?.closest(selector);
  return closest2 && surface.contains(closest2) ? closest2 : null;
}
function currentLink(editor) {
  return currentRichElement(editor, "a[href]");
}
function currentImage(editor) {
  const image = currentRichElement(editor, "img");
  if (image) return image;
  return currentRichElement(editor, "figure")?.querySelector("img") ?? null;
}
function currentTaskItem(editor) {
  return currentRichElement(editor, ".uif-task-list li");
}
function setCaretInside(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
function handleRichTaskKey(editor, event) {
  const item = currentTaskItem(editor);
  if (!item) return false;
  const label = item.querySelector("label") ?? item;
  const text = (label.textContent ?? "").trim();
  if (event.key === "Enter") {
    event.preventDefault();
    if (!text) {
      item.remove();
      return true;
    }
    const next = document.createElement("li");
    next.innerHTML = '<label><input type="checkbox"> </label>';
    item.after(next);
    setCaretInside(next.querySelector("label") ?? next);
    return true;
  }
  if (event.key === "Backspace" && !text) {
    event.preventDefault();
    item.remove();
    return true;
  }
  return false;
}
function applyLinkAttributes(linkEl, link) {
  linkEl.href = link.href;
  linkEl.setAttribute("href", link.href);
  if (link.text) linkEl.textContent = link.text;
  if (link.title) linkEl.title = link.title;
  else linkEl.removeAttribute("title");
  if (link.target === "_blank") {
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
  } else {
    linkEl.removeAttribute("target");
    linkEl.removeAttribute("rel");
  }
}
function applyImageAttributes(imageEl, image) {
  imageEl.src = image.src;
  imageEl.setAttribute("src", image.src);
  imageEl.alt = image.alt;
}
function linkValue(value, fallbackText = "Link text") {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      text: String(data.text || fallbackText),
      href: safeUrl(data.href, "#"),
      title: String(data.title || ""),
      target: data.target === "_blank" ? "_blank" : "_self"
    };
  }
  return { text: fallbackText, href: safeUrl(value, "#"), title: "", target: "_self" };
}
function imageValue(value) {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      src: safeUrl(data.src, "/favicon.ico"),
      alt: String(data.alt || "Image"),
      caption: String(data.caption || "")
    };
  }
  return { src: safeUrl(value, "/favicon.ico"), alt: "Image", caption: "" };
}
function tableValue(value) {
  if (typeof value === "object" && value) {
    const data = value;
    return {
      rows: Math.max(1, Math.min(12, Number(data.rows) || 2)),
      columns: Math.max(1, Math.min(8, Number(data.columns) || 2)),
      header: data.header !== false
    };
  }
  return { rows: 2, columns: 2, header: true };
}
function tableHtml(value) {
  const config = tableValue(value);
  const headers = Array.from({ length: config.columns }, (_item, index) => `<th>Column ${String.fromCharCode(65 + index)}</th>`).join("");
  const bodyRows = Array.from({ length: config.rows }, () => {
    const cells = Array.from({ length: config.columns }, (_item, index) => `<td>Value ${String.fromCharCode(65 + index)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table>${config.header ? `<thead><tr>${headers}</tr></thead>` : ""}<tbody>${bodyRows}</tbody></table>`;
}
function currentTableCell() {
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest("td,th") ?? null;
}
function currentTable() {
  return currentTableCell()?.closest("table") ?? null;
}
function applyTableCommand(editor, command) {
  const table2 = currentTable();
  const cell = currentTableCell() ?? editorActiveTableCell.get(editor) ?? null;
  const activeTable = table2 ?? cell?.closest("table") ?? null;
  if (!activeTable || !cell) return false;
  const row = cell.parentElement;
  const cellIndex = cell.cellIndex;
  if (command === "table-row-before") {
    const previous = row.cloneNode(true);
    previous.querySelectorAll("th,td").forEach((item) => item.textContent = "");
    row.before(previous);
    previous.querySelector("td,th")?.focus();
    return true;
  }
  if (command === "table-row-after") {
    const next = row.cloneNode(true);
    next.querySelectorAll("th,td").forEach((item) => item.textContent = "");
    row.after(next);
    next.querySelector("td,th")?.focus();
    return true;
  }
  if (command === "table-row-delete") {
    row.remove();
    if (!activeTable.querySelector("tr")) activeTable.remove();
    return true;
  }
  if (command === "table-col-before") {
    let insertedCurrent = null;
    activeTable.querySelectorAll("tr").forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === "TH" ? "th" : "td";
      const next = document.createElement(tag);
      next.textContent = "";
      ref?.before(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === "table-col-after") {
    let insertedCurrent = null;
    activeTable.querySelectorAll("tr").forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === "TH" ? "th" : "td";
      const next = document.createElement(tag);
      next.textContent = "";
      ref?.after(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === "table-col-delete") {
    activeTable.querySelectorAll("tr").forEach((tableRow) => tableRow.children.item(cellIndex)?.remove());
    if (!activeTable.querySelector("td,th")) activeTable.remove();
    return true;
  }
  if (command === "table-delete") {
    activeTable.remove();
    return true;
  }
  if (command === "table-header-toggle") {
    const head = activeTable.tHead;
    if (head) {
      const first = head.rows.item(0);
      if (first) activeTable.tBodies.item(0)?.prepend(first);
      head.remove();
    } else {
      const first = activeTable.tBodies.item(0)?.rows.item(0);
      if (first) {
        const thead = activeTable.createTHead();
        thead.append(first);
        first.querySelectorAll("td").forEach((td) => {
          const th = document.createElement("th");
          th.innerHTML = td.innerHTML;
          td.replaceWith(th);
        });
      }
    }
    return true;
  }
  return false;
}
function applyRichHtmlCommand(editor, command, value) {
  if (command === "bold") wrapRichSelection(editor, "strong", "bold text");
  else if (command === "italic") wrapRichSelection(editor, "em", "italic text");
  else if (command === "underline") wrapRichSelection(editor, "u", "underlined text");
  else if (command === "strike") wrapRichSelection(editor, "s", "deleted text");
  else if (command === "heading") insertRichHtml(editor, `<h2>${escapeHtml(selectedRichText(editor, "Heading"))}</h2>`);
  else if (command === "paragraph") insertRichHtml(editor, `<p>${escapeHtml(selectedRichText(editor, "Paragraph text"))}</p>`);
  else if (command === "quote") insertRichHtml(editor, `<blockquote>${escapeHtml(selectedRichText(editor, "Quote"))}</blockquote>`);
  else if (command === "code") insertRichHtml(editor, `<pre><code>${escapeHtml(selectedRichText(editor, "code"))}</code></pre>`);
  else if (command === "ul") insertRichHtml(editor, `<ul><li>${escapeHtml(selectedRichText(editor, "Item"))}</li></ul>`);
  else if (command === "ol") insertRichHtml(editor, `<ol><li>${escapeHtml(selectedRichText(editor, "Item"))}</li></ol>`);
  else if (command === "task") insertRichHtml(editor, '<ul class="uif-task-list"><li><label><input type="checkbox"> Task</label></li></ul>');
  else if (command === "hr") insertRichHtml(editor, "<hr>");
  else if (command === "link" || command === "link-edit") {
    const link = linkValue(value, selectedRichText(editor, "Link text"));
    const existing = currentLink(editor);
    if (existing) {
      applyLinkAttributes(existing, link);
      return;
    }
    const attrs = { href: link.href };
    if (link.title) attrs.title = link.title;
    if (link.target === "_blank") {
      attrs.target = "_blank";
      attrs.rel = "noopener noreferrer";
    }
    wrapRichSelection(editor, "a", link.text, attrs);
  } else if (command === "link-remove") {
    const existing = currentLink(editor);
    if (!existing) return;
    existing.replaceWith(document.createTextNode(existing.textContent ?? ""));
  } else if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    const existing = currentImage(editor);
    if (existing) {
      applyImageAttributes(existing, image);
      const figure = existing.closest("figure");
      if (figure) {
        let caption = figure.querySelector("figcaption");
        if (image.caption) {
          if (!caption) {
            caption = document.createElement("figcaption");
            figure.append(caption);
          }
          caption.textContent = image.caption;
        } else {
          caption?.remove();
        }
      }
      return;
    }
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    insertRichHtml(editor, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  } else if (command === "image-remove") {
    const existing = currentImage(editor);
    if (!existing) return;
    const figure = existing.closest("figure");
    if (figure) figure.remove();
    else existing.remove();
  } else if (command === "table") insertRichHtml(editor, tableHtml(value));
  else if (command.startsWith("table-")) applyTableCommand(editor, command);
  else if (command === "clear") {
    const surface = richSurface(editor);
    if (surface) surface.textContent = surface.textContent ?? "";
  } else if (command !== "preview" && command !== "source" && command !== "fullscreen") {
    document.execCommand(command);
  }
}
function applyHtmlSourceCommand(editor, command, value) {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === "bold") return wrapSelection(surface, "<strong>", "</strong>", "bold text");
  if (command === "italic") return wrapSelection(surface, "<em>", "</em>", "italic text");
  if (command === "underline") return wrapSelection(surface, "<u>", "</u>", "underlined text");
  if (command === "strike") return wrapSelection(surface, "<s>", "</s>", "deleted text");
  if (command === "heading") return wrapSelection(surface, `<${value || "h2"}>`, `</${value || "h2"}>`, "Heading");
  if (command === "paragraph") return wrapSelection(surface, "<p>", "</p>", "Paragraph text");
  if (command === "quote") return wrapSelection(surface, "<blockquote>", "</blockquote>", "Quote");
  if (command === "code") return wrapSelection(surface, "<pre><code>", "</code></pre>", "code");
  if (command === "hr") return insertAtSelection(surface, "\n<hr>\n");
  if (command === "ul") return insertAtSelection(surface, "\n<ul><li>Item</li></ul>\n");
  if (command === "ol") return insertAtSelection(surface, "\n<ol><li>Item</li></ol>\n");
  if (command === "task") return insertAtSelection(surface, '\n<ul class="uif-task-list"><li><input type="checkbox" disabled> Task</li></ul>\n');
  if (command === "link" || command === "link-edit") {
    const link = linkValue(value, "link");
    const target = link.target === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const title = link.title ? ` title="${escapeAttr(link.title)}"` : "";
    return wrapSelection(surface, `<a href="${escapeAttr(link.href)}"${title}${target}>`, "</a>", link.text);
  }
  if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    return insertAtSelection(surface, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  }
  if (command === "table") return insertAtSelection(surface, `
${tableHtml(value)}
`);
  if (command === "clear") return cleanEditorHtml(surface.value);
  return surface.value;
}
function markdownTable(value) {
  const config = tableValue(value);
  const header = `| ${Array.from({ length: config.columns }, (_item, index) => `Column ${String.fromCharCode(65 + index)}`).join(" | ")} |`;
  const rule = `| ${Array.from({ length: config.columns }, () => "---").join(" | ")} |`;
  const rows2 = Array.from({ length: config.rows }, () => `| ${Array.from({ length: config.columns }, (_item, index) => `Value ${String.fromCharCode(65 + index)}`).join(" | ")} |`);
  return `
${[header, rule, ...rows2].join("\n")}
`;
}
function applyMarkdownCommand(editor, command, value) {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === "bold") return wrapSelection(surface, "**", "**", "bold text");
  if (command === "italic") return wrapSelection(surface, "*", "*", "italic text");
  if (command === "strike") return wrapSelection(surface, "~~", "~~", "deleted text");
  if (command === "heading") return insertAtSelection(surface, "\n## Heading\n");
  if (command === "paragraph") return insertAtSelection(surface, "\nParagraph text\n");
  if (command === "quote") return insertAtSelection(surface, "\n> Quote\n");
  if (command === "code") return insertAtSelection(surface, "\n```\ncode\n```\n");
  if (command === "hr") return insertAtSelection(surface, "\n---\n");
  if (command === "ul") return insertAtSelection(surface, "\n- Item\n");
  if (command === "ol") return insertAtSelection(surface, "\n1. Item\n");
  if (command === "task") return insertAtSelection(surface, "\n- [ ] Task\n");
  if (command === "link" || command === "link-edit") {
    const link = linkValue(value, "link");
    if (surface.selectionStart === surface.selectionEnd) return insertAtSelection(surface, `[${link.text}](${link.href})`);
    return wrapSelection(surface, "[", `](${link.href})`, link.text);
  }
  if (command === "image" || command === "image-edit") {
    const image = imageValue(value);
    return insertAtSelection(surface, `
![${image.alt}](${image.src})${image.caption ? `

${image.caption}` : ""}
`);
  }
  if (command === "table") return insertAtSelection(surface, markdownTable(value));
  if (command === "clear") return "";
  return surface.value;
}
function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
function updateStatus(instance) {
  if (!instance.status) return;
  const value = instance.getValue();
  const words = countWords(value);
  const chars = value.length;
  const state = instance.dirty ? "Unsaved changes" : "Clean";
  instance.status.textContent = `${words} words \xB7 ${chars} characters \xB7 ${state}`;
}
function syncRichControlAttributes(root) {
  root.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach((input) => {
    if (input.checked) input.setAttribute("checked", "");
    else input.removeAttribute("checked");
  });
  root.querySelectorAll("option").forEach((option) => {
    if (option.selected) option.setAttribute("selected", "");
    else option.removeAttribute("selected");
  });
}
function validateEditor(editor) {
  const value = editor.getValue();
  const errors = [];
  const required = editor.input.dataset.uifRequired === "true" || editor.input.required;
  const maxLength = Number(editor.input.dataset.uifMaxlength || "") || (editor.input.maxLength > 0 ? editor.input.maxLength : 0);
  if (required && !value.trim()) errors.push("This field is required.");
  if (maxLength && value.length > maxLength) errors.push(`Maximum length is ${maxLength} characters.`);
  editor.element.dataset.uifValidation = errors.length ? "invalid" : "valid";
  editor.input.setAttribute("aria-invalid", errors.length ? "true" : "false");
  emit("uif:editor-validate", { editor, errors }, editor.element);
  void runEditorHooks("validate", { editor, value });
  return errors;
}
async function autosaveEditor(editor, url) {
  const value = editor.getValue();
  editor.element.dataset.uifAutosaveState = "saving";
  await runEditorHooks("autosave", { editor, value });
  if (url) {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editor.input.name, value })
    });
  }
  editor.element.dataset.uifAutosaveState = "saved";
  editor.dirty = false;
  editorInitialValue.set(editor, value);
  updateStatus(editor);
  emit("uif:editor-autosave", { editor, value }, editor.element);
}
function scheduleAutosave(editor, delay3, url) {
  const existing = editorAutosaveTimers.get(editor);
  if (existing) window.clearTimeout(existing);
  editorAutosaveTimers.set(
    editor,
    window.setTimeout(() => {
      void autosaveEditor(editor, url).catch((error) => {
        editor.element.dataset.uifAutosaveState = "error";
        emit("uif:editor-error", { editor, error }, editor.element);
      });
    }, delay3)
  );
}
function pushHistory(instance, next) {
  const history2 = editorHistory.get(instance);
  if (!history2 || history2.last === next) return;
  history2.undo.push(history2.last);
  if (history2.undo.length > 60) history2.undo.shift();
  history2.redo = [];
  history2.last = next;
}
function restoreHistory(instance, direction) {
  const history2 = editorHistory.get(instance);
  if (!history2) return;
  const from = direction === "undo" ? history2.undo : history2.redo;
  const to = direction === "undo" ? history2.redo : history2.undo;
  const value = from.pop();
  if (value === void 0) return;
  to.push(instance.getValue());
  history2.last = value;
  instance.setValue(value);
}
function queryEditorCommand(editor, command) {
  if (command === "preview") return !editor.preview?.hidden;
  if (command === "source") return editor.sourceMode;
  if (editor.mode !== "html") return false;
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}
function runEditorCommand(editor, command, value) {
  const custom = commandHandlers.get(command);
  if (custom) {
    void runEditorHooks("beforeCommand", { editor, value: editor.getValue(), command });
    custom({ editor, command, value });
    void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
    return;
  }
  void runEditorHooks("beforeCommand", { editor, value: editor.getValue(), command });
  if (editor.mode === "html") {
    if (editor.surface instanceof HTMLTextAreaElement) {
      if (command === "undo") restoreHistory(editor, "undo");
      else if (command === "redo") restoreHistory(editor, "redo");
      else editor.setValue(applyHtmlSourceCommand(editor, command, value));
      void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
      return;
    }
    editor.surface.focus();
    if (command === "undo") restoreHistory(editor, "undo");
    else if (command === "redo") restoreHistory(editor, "redo");
    else {
      if (command === "image") void runEditorHooks("uploadImage", { editor, value: imageValue(value).src });
      applyRichHtmlCommand(editor, command, value);
    }
    syncRichControlAttributes(editor.surface);
    editor.setValue(cleanEditorHtml(editor.surface.innerHTML));
    void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
    return;
  }
  if (command === "undo") restoreHistory(editor, "undo");
  else if (command === "redo") restoreHistory(editor, "redo");
  else editor.setValue(applyMarkdownCommand(editor, command, value));
  void runEditorHooks("afterCommand", { editor, value: editor.getValue(), command });
}
function formatEditor(editor, command, value) {
  runEditorCommand(editor, command, value);
}
function syncPreview(instance) {
  if (!instance.preview) return;
  instance.preview.innerHTML = instance.mode === "markdown" ? markdownToHtml(instance.getValue()) : cleanEditorHtml(instance.getValue());
}
function openPreviewOverlay(editor, layout) {
  if (!editor.preview) return;
  syncPreview(editor);
  const backdrop = document.createElement("div");
  backdrop.className = "uif-editor-preview-backdrop";
  const panel = document.createElement("div");
  panel.className = layout === "drawer" ? "uif-editor-preview-drawer" : "uif-editor-preview-modal";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.innerHTML = `<div class="uif-editor-preview-head"><strong>Preview</strong><button type="button" class="uif-editor-preview-close" aria-label="Close preview">&times;</button></div><div class="uif-editor-preview-content">${editor.preview.innerHTML}</div>`;
  const close = () => {
    panel.remove();
    backdrop.remove();
    editor.surface.focus();
  };
  backdrop.addEventListener("click", close);
  const closeButton = panel.querySelector("button");
  closeButton?.addEventListener("click", close);
  closeButton?.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    close();
  });
  document.addEventListener("keydown", function onKeydown(event) {
    if (event.key !== "Escape") return;
    document.removeEventListener("keydown", onKeydown);
    close();
  });
  document.body.append(backdrop, panel);
  panel.querySelector("button")?.focus();
}
function setEditorPreviewLayout(editor, layout) {
  editor.element.dataset.uifEditorLayout = layout;
  const body = editor.element.querySelector(".uif-editor-body");
  body?.classList.toggle("uif-editor-body-split", layout === "split");
  body?.classList.toggle("uif-editor-body-tabs", layout === "tabs");
  if (editor.mode === "markdown" && editor.preview) {
    syncPreview(editor);
    editor.surface.hidden = layout === "preview";
    editor.preview.hidden = layout === "source" || layout === "modal" || layout === "drawer";
    if (layout === "split") {
      editor.surface.hidden = false;
      editor.preview.hidden = false;
    }
    if (layout === "tabs") {
      editor.surface.hidden = !editor.sourceMode;
      editor.preview.hidden = editor.sourceMode;
    }
    editor.sourceMode = !editor.surface.hidden;
  }
  emit("uif:editor-layout-change", { editor, layout }, editor.element);
}
function formField(name, label, value = "", type = "text") {
  return `<label class="uif-editor-dialog-field"><span>${escapeHtml(label)}</span><input class="uif-input" type="${type}" name="${escapeAttr(name)}" value="${escapeAttr(value)}"></label>`;
}
function currentLinkValue(editor) {
  const link = currentLink(editor);
  return {
    text: link?.textContent || selectedRichText(editor, "Link text"),
    href: link?.getAttribute("href") || "https://example.com",
    title: link?.getAttribute("title") || "",
    target: link?.getAttribute("target") === "_blank" ? "_blank" : "_self"
  };
}
function currentImageValue(editor) {
  const image = currentImage(editor);
  const figure = image?.closest("figure");
  return {
    src: image?.getAttribute("src") || "/favicon.ico",
    alt: image?.getAttribute("alt") || "Image",
    caption: figure?.querySelector("figcaption")?.textContent || ""
  };
}
function positionEditorCommandDialog(dialog, anchor) {
  const margin = 8;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  dialog.style.removeProperty("right");
  dialog.style.removeProperty("bottom");
  if (viewportWidth <= 640) {
    dialog.dataset.uifEditorDialogPlacement = "sheet";
    dialog.style.left = `${margin}px`;
    dialog.style.right = `${margin}px`;
    dialog.style.top = "auto";
    dialog.style.bottom = `${margin}px`;
    return;
  }
  dialog.dataset.uifEditorDialogPlacement = "popover";
  const anchorRect = anchor?.getBoundingClientRect() || editorToolbarAnchorRect(dialog);
  const width = dialog.offsetWidth || 360;
  const height = dialog.offsetHeight || 240;
  const left = Math.min(Math.max(anchorRect.left, margin), Math.max(margin, viewportWidth - width - margin));
  const preferredTop = anchorRect.bottom + margin;
  const top3 = preferredTop + height > viewportHeight - margin ? Math.max(margin, anchorRect.top - height - margin) : preferredTop;
  dialog.style.left = `${left}px`;
  dialog.style.top = `${top3}px`;
}
function editorToolbarAnchorRect(dialog) {
  const fallback = dialog.getBoundingClientRect();
  return new DOMRect(fallback.left, fallback.top, fallback.width, fallback.height);
}
function openEditorCommandDialog(editor, command, apply, anchor) {
  document.querySelectorAll(".uif-editor-dialog").forEach((existing) => existing.remove());
  const dialog = document.createElement("form");
  dialog.className = "uif-editor-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", editorCommandLabel(command));
  if (command === "link") {
    const link = editor.mode === "html" ? currentLinkValue(editor) : { text: "link", href: "https://example.com", title: "", target: "_self" };
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("text", "Text", link.text)}${formField("href", "URL", link.href)}${formField("title", "Title", link.title)}<label class="uif-editor-dialog-check"><input type="checkbox" name="blank"${link.target === "_blank" ? " checked" : ""}> Open in new tab</label></div>`;
  } else if (command === "image") {
    const image = editor.mode === "html" ? currentImageValue(editor) : { src: "/favicon.ico", alt: "Image", caption: "" };
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("src", "Image URL", image.src)}${formField("alt", "Alt text", image.alt)}${formField("caption", "Caption", image.caption)}</div>`;
  } else if (command === "table") {
    dialog.innerHTML = `<div class="uif-editor-dialog-grid">${formField("rows", "Rows", "2", "number")}${formField("columns", "Columns", "2", "number")}<label class="uif-editor-dialog-check"><input type="checkbox" name="header" checked> Header row</label></div>`;
  }
  dialog.insertAdjacentHTML("beforeend", '<div class="uif-editor-dialog-actions"><button type="button" class="uif-btn uif-btn-secondary" data-uif-editor-dialog-cancel>Cancel</button><button type="submit" class="uif-btn">Apply</button></div>');
  const closeDialog = (restoreFocus = true) => {
    dialog.remove();
    document.removeEventListener("pointerdown", handleOutsidePointer, true);
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("scroll", handleViewportChange, true);
    if (restoreFocus) editor.focus();
  };
  const handleOutsidePointer = (event) => {
    const target = event.target instanceof Node ? event.target : null;
    if (!target || dialog.contains(target) || anchor?.contains(target)) return;
    closeDialog(false);
  };
  const handleViewportChange = () => positionEditorCommandDialog(dialog, anchor);
  dialog.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(dialog);
    if (command === "link") apply({ text: data.get("text"), href: data.get("href"), title: data.get("title"), target: data.get("blank") ? "_blank" : "_self" });
    if (command === "image") apply({ src: data.get("src"), alt: data.get("alt"), caption: data.get("caption") });
    if (command === "table") apply({ rows: data.get("rows"), columns: data.get("columns"), header: Boolean(data.get("header")) });
    closeDialog(false);
  });
  dialog.querySelector("[data-uif-editor-dialog-cancel]")?.addEventListener("click", () => {
    closeDialog();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDialog();
  });
  document.body.append(dialog);
  positionEditorCommandDialog(dialog, anchor);
  document.addEventListener("pointerdown", handleOutsidePointer, true);
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
  dialog.querySelector("input")?.focus();
}
function createEditor(el, options = {}) {
  if (editors.has(el)) return editors.get(el);
  const input = asInput(el);
  const config = parseOptions(el, options);
  const wrapper = document.createElement("div");
  wrapper.className = "uif-editor";
  wrapper.dataset.uifMode = config.mode;
  const toolbar = document.createElement("div");
  toolbar.className = "uif-editor-toolbar";
  toolbar.setAttribute("role", "toolbar");
  const body = document.createElement("div");
  body.className = "uif-editor-body";
  const surface = config.mode === "markdown" || config.mode === "plain" ? document.createElement("textarea") : document.createElement("div");
  surface.className = config.mode === "markdown" || config.mode === "plain" ? "uif-editor-source" : "uif-editor-surface";
  surface.style.minHeight = config.height;
  if (config.placeholder) surface.setAttribute("aria-placeholder", config.placeholder);
  if (surface instanceof HTMLTextAreaElement) {
    surface.value = input.value;
    surface.spellcheck = true;
    surface.placeholder = config.placeholder;
  } else {
    surface.contentEditable = "true";
    surface.innerHTML = config.mode === "html" ? cleanEditorHtml(input.value) : escapeHtml(input.value);
  }
  const preview = document.createElement("div");
  preview.className = "uif-editor-preview";
  preview.hidden = config.preview === "none";
  const status = document.createElement("div");
  status.className = "uif-editor-status";
  status.setAttribute("role", "status");
  config.toolbar.forEach((command) => {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "uif-editor-button";
    button2.dataset.uifEditorCommand = command;
    const label = editorCommandLabel(command);
    button2.setAttribute("aria-label", label);
    button2.title = label;
    button2.innerHTML = `${editorCommandIcon(command)}<span class="uif-sr-only">${escapeHtml(label)}</span>`;
    if (command === "source") button2.setAttribute("aria-pressed", String(config.mode !== "html"));
    if (command === "preview") button2.setAttribute("aria-pressed", String(!preview.hidden));
    toolbar.append(button2);
  });
  input.hidden = true;
  input.setAttribute("data-uif-editor-input", "true");
  input.insertAdjacentElement("afterend", wrapper);
  body.append(surface, preview);
  wrapper.append(toolbar, body);
  const tableTools = document.createElement("div");
  tableTools.className = "uif-editor-table-tools";
  tableTools.hidden = true;
  tableTools.innerHTML = [
    ["table-row-before", "Row before"],
    ["table-row-after", "Row"],
    ["table-col-before", "Column before"],
    ["table-col-after", "Column"],
    ["table-row-delete", "Delete row"],
    ["table-col-delete", "Delete column"],
    ["table-header-toggle", "Header"],
    ["table-delete", "Delete table"]
  ].map(([command, label]) => `<button type="button" class="uif-editor-tool-chip" data-uif-editor-command="${command}">${label}</button>`).join("");
  if (config.mode === "html") wrapper.append(tableTools);
  if (config.status) wrapper.append(status);
  const instance = {
    element: wrapper,
    mode: config.mode,
    input,
    surface,
    preview,
    status: config.status ? status : void 0,
    dirty: false,
    sourceMode: config.mode !== "html",
    getValue() {
      return input.value;
    },
    setValue(next) {
      const previous = input.value;
      if (previous !== next) pushHistory(instance, next);
      input.value = next;
      if (surface instanceof HTMLTextAreaElement && surface.value !== next) surface.value = next;
      if (!(surface instanceof HTMLTextAreaElement) && surface.innerHTML !== next) surface.innerHTML = config.mode === "html" ? cleanEditorHtml(next) : escapeHtml(next);
      instance.dirty = next !== editorInitialValue.get(instance);
      syncPreview(instance);
      updateStatus(instance);
      emit("uif:editor-change", { value: next, editor: instance }, wrapper);
      validateEditor(instance);
      if (config.autosave && instance.dirty) scheduleAutosave(instance, config.autosaveDelay, config.autosaveUrl || void 0);
    },
    focus() {
      surface.focus();
    },
    destroy() {
      wrapper.remove();
      input.hidden = false;
      editors.delete(el);
      editorListeners.get(instance)?.forEach((cleanup) => cleanup());
      const autosaveTimer = editorAutosaveTimers.get(instance);
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      editorListeners.delete(instance);
      emit("uif:editor-destroy", { editor: instance }, input);
    }
  };
  editorInitialValue.set(instance, input.value);
  editorHistory.set(instance, { undo: [], redo: [], last: input.value });
  editorListeners.set(instance, []);
  let savedRange = null;
  const saveRichSelection = () => {
    if (surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return;
    savedRange = range.cloneRange();
  };
  const restoreRichSelection = () => {
    if (!savedRange || surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRange);
  };
  const syncFromSurface = () => {
    if (!(surface instanceof HTMLTextAreaElement)) syncRichControlAttributes(surface);
    const value = surface instanceof HTMLTextAreaElement ? surface.value : cleanEditorHtml(surface.innerHTML);
    void runEditorHooks("beforeInput", { editor: instance, value });
    instance.setValue(value);
    void runEditorHooks("afterInput", { editor: instance, value });
  };
  const updateActiveTableCell = (target) => {
    const cell = target instanceof Element ? target.closest("td,th") : null;
    if (cell && surface.contains(cell)) editorActiveTableCell.set(instance, cell);
  };
  const updateTableTools = (target) => {
    if (config.mode !== "html") return;
    updateActiveTableCell(target ?? null);
    const cell = currentTableCell() ?? editorActiveTableCell.get(instance) ?? null;
    tableTools.hidden = !cell?.closest("table");
  };
  surface.addEventListener("input", syncFromSurface);
  surface.addEventListener("change", syncFromSurface);
  surface.addEventListener("keyup", (event) => {
    saveRichSelection();
    updateTableTools(event.target);
  });
  surface.addEventListener("mouseup", (event) => {
    saveRichSelection();
    updateTableTools(event.target);
  });
  surface.addEventListener("focus", () => emit("uif:editor-focus", { editor: instance }, wrapper));
  surface.addEventListener("blur", () => emit("uif:editor-blur", { editor: instance }, wrapper));
  toolbar.addEventListener("mousedown", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-uif-editor-command]")) event.preventDefault();
  });
  toolbar.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    const button2 = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    if (!button2) return;
    event.preventDefault();
    button2.click();
  });
  toolbar.addEventListener("click", (event) => {
    const button2 = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    const command = button2?.dataset.uifEditorCommand;
    if (!button2 || !command) return;
    if (command === "preview") {
      const layout = instance.element.dataset.uifEditorLayout ?? config.layout;
      if (config.mode === "markdown" && (layout === "modal" || layout === "drawer")) {
        openPreviewOverlay(instance, layout);
        return;
      }
      void runEditorHooks("beforePreview", { editor: instance, value: instance.getValue(), command });
      preview.hidden = !preview.hidden;
      button2.setAttribute("aria-pressed", String(!preview.hidden));
      syncPreview(instance);
      emit("uif:editor-preview", { editor: instance, visible: !preview.hidden }, wrapper);
      void runEditorHooks("afterPreview", { editor: instance, value: instance.getValue(), command });
      return;
    }
    if (command === "source" && config.mode === "html") {
      instance.sourceMode = !instance.sourceMode;
      button2.setAttribute("aria-pressed", String(instance.sourceMode));
      if (instance.sourceMode) {
        const source = document.createElement("textarea");
        source.className = "uif-editor-source";
        source.style.minHeight = config.height;
        source.value = instance.getValue();
        body.replaceChild(source, surface);
        instance.surface = source;
        source.addEventListener("input", () => instance.setValue(source.value));
        source.focus();
      } else {
        body.replaceChild(surface, instance.surface);
        instance.surface = surface;
        surface.innerHTML = cleanEditorHtml(instance.getValue());
        surface.focus();
      }
      emit("uif:editor-mode-change", { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    if (command === "source" && config.mode === "markdown") {
      instance.sourceMode = !instance.sourceMode;
      button2.setAttribute("aria-pressed", String(instance.sourceMode));
      surface.hidden = !instance.sourceMode;
      preview.hidden = instance.sourceMode;
      if (instance.sourceMode) {
        surface.focus();
      } else {
        syncPreview(instance);
        preview.tabIndex = 0;
        preview.focus();
      }
      emit("uif:editor-mode-change", { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    emit("uif:editor-command", { editor: instance, command }, wrapper);
    restoreRichSelection();
    if ((command === "link" || command === "image" || command === "table") && !(event instanceof CustomEvent)) {
      openEditorCommandDialog(instance, command, (value) => {
        restoreRichSelection();
        formatEditor(instance, command, value);
        saveRichSelection();
        updateTableTools();
      }, button2);
      return;
    }
    formatEditor(instance, command);
    saveRichSelection();
    updateTableTools();
  });
  tableTools.addEventListener("click", (event) => {
    const button2 = event.target instanceof Element ? event.target.closest("[data-uif-editor-command]") : null;
    const command = button2?.dataset.uifEditorCommand;
    if (!command) return;
    formatEditor(instance, command);
    updateTableTools();
  });
  surface.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (surface instanceof HTMLTextAreaElement && handleMarkdownTaskKey(surface, event)) {
      syncFromSurface();
      return;
    }
    if (!(surface instanceof HTMLTextAreaElement) && handleRichTaskKey(instance, event)) {
      syncFromSurface();
      return;
    }
    const key = event.key.toLowerCase();
    if (!(event.metaKey || event.ctrlKey)) return;
    if (key === "b") {
      event.preventDefault();
      formatEditor(instance, "bold");
    }
    if (key === "i") {
      event.preventDefault();
      formatEditor(instance, "italic");
    }
    if (key === "k") {
      event.preventDefault();
      formatEditor(instance, "link");
    }
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      formatEditor(instance, "redo");
    } else if (key === "z") {
      event.preventDefault();
      formatEditor(instance, "undo");
    }
  });
  surface.addEventListener("paste", () => {
    void runEditorHooks("beforePaste", { editor: instance, value: instance.getValue() });
    window.setTimeout(() => {
      syncFromSurface();
      void runEditorHooks("afterPaste", { editor: instance, value: instance.getValue() });
    });
  });
  editors.set(el, instance);
  instance.setValue(input.value);
  setEditorPreviewLayout(instance, config.layout);
  emit("uif:editor-init", { editor: instance }, wrapper);
  return instance;
}
function initEditor(el, options) {
  return createEditor(el, options);
}
function getEditorValue(editor) {
  return editor.getValue();
}
function setEditorValue(editor, value) {
  editor.setValue(value);
}

// packages/forms/src/index.ts
var ruleHandlers = {
  required: (value) => value.trim().length > 0,
  email: (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  number: (value) => value === "" || !Number.isNaN(Number(value)),
  integer: (value) => value === "" || /^-?\d+$/.test(value),
  min: (value, arg) => value === "" || Number(value) >= Number(arg),
  max: (value, arg) => value === "" || Number(value) <= Number(arg),
  minLength: (value, arg) => value.length >= Number(arg),
  maxLength: (value, arg) => value.length <= Number(arg),
  pattern: (value, arg) => {
    try {
      return new RegExp(arg ?? "").test(value);
    } catch {
      return false;
    }
  },
  sameAs: (value, arg, form2) => {
    const other = arg ? form2.elements.namedItem(arg) : null;
    return other instanceof HTMLInputElement || other instanceof HTMLTextAreaElement ? value === other.value : false;
  }
};
var asyncRuleHandlers = /* @__PURE__ */ new Map();
var initializedForms = /* @__PURE__ */ new WeakSet();
var initializedRepeatables = /* @__PURE__ */ new WeakSet();
function registerAsyncRule(name, handler) {
  asyncRuleHandlers.set(name, handler);
}
function fieldName(fieldEl) {
  return fieldEl.name || fieldEl.id || "field";
}
function cssEscape(value) {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(value) : value.replace(/["\\#.;,[\]=:]/g, "\\$&");
}
function resolveFormTarget(formEl) {
  const expr = formEl.dataset.uifTarget;
  if (!expr) return null;
  if (expr === "self") return formEl;
  if (expr === "parent") return formEl.parentElement;
  if (expr.startsWith("closest:")) return formEl.closest(expr.slice(8));
  return document.querySelector(expr);
}
function swap(target, html, mode = "inner") {
  if (!target) return;
  const safeMode = ["inner", "outer", "append", "prepend", "before", "after"].includes(mode) ? mode : "inner";
  swapTrustedHTML(target, html, safeMode);
}
function validateField(fieldEl) {
  const form2 = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!form2 || !spec) return [];
  const errors = spec.split("|").flatMap((ruleSpec) => {
    const [name, ...rest] = ruleSpec.split(":");
    const arg = rest.join(":") || void 0;
    const passed = ruleHandlers[name]?.(fieldEl.value, arg, form2) ?? true;
    return passed ? [] : [`${fieldName(fieldEl)} failed ${name}`];
  });
  fieldEl.setAttribute("aria-invalid", String(errors.length > 0));
  return errors;
}
function validateForm(formEl) {
  const errors = {};
  formEl.querySelectorAll("[data-uif-rule]").forEach((field) => {
    const fieldErrors = validateField(field);
    if (fieldErrors.length) errors[fieldName(field)] = fieldErrors;
  });
  return errors;
}
function clearErrors(formEl) {
  formEl.querySelectorAll(".uif-error").forEach((el) => el.remove());
  formEl.querySelectorAll(".uif-error-summary").forEach((el) => el.remove());
  formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute("aria-invalid", "false"));
}
function showErrors(formEl, errors) {
  Object.entries(errors).forEach(([name, messages]) => {
    const field = formEl.elements.namedItem(name);
    const fieldEl = field instanceof HTMLElement ? field : formEl.querySelector(`#${cssEscape(name)}`);
    if (!fieldEl) return;
    const msg = document.createElement("div");
    msg.className = "uif-error";
    msg.id = `${fieldEl.id || name}-error`;
    msg.textContent = messages[0] ?? "Invalid value";
    msg.setAttribute("role", "alert");
    fieldEl.setAttribute("aria-invalid", "true");
    fieldEl.setAttribute("aria-describedby", msg.id);
    fieldEl.insertAdjacentElement("afterend", msg);
  });
}
function showErrorSummary(formEl, errors) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  const summary = document.createElement("div");
  summary.className = "uif-error-summary";
  summary.setAttribute("role", "alert");
  const heading = document.createElement("strong");
  heading.textContent = `Please correct ${entries.length} field${entries.length === 1 ? "" : "s"}.`;
  const list = document.createElement("ul");
  entries.forEach(([name, messages]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${cssEscape(name)}`;
    link.textContent = messages[0] ?? "Invalid value";
    item.append(link);
    list.append(item);
  });
  summary.append(heading, list);
  formEl.prepend(summary);
  return summary;
}
async function validateFormAsync(formEl) {
  const errors = validateForm(formEl);
  const asyncFields = Array.from(
    formEl.querySelectorAll("[data-uif-validate-async]")
  );
  await Promise.all(
    asyncFields.map(async (field) => {
      const name = fieldName(field);
      const handler = asyncRuleHandlers.get(field.dataset.uifValidateAsync || "");
      const fieldErrors = handler ? await handler(field, formEl) : [];
      if (fieldErrors.length) errors[name] = [...errors[name] ?? [], ...fieldErrors];
    })
  );
  return errors;
}
function setFormState(formEl, state) {
  formEl.dataset.uifState = state;
  formEl.toggleAttribute("aria-busy", state === "submitting");
  emit(`uif:form-${state}`, { form: formEl }, formEl);
}
function initRepeatableGroup(root) {
  if (initializedRepeatables.has(root)) return;
  initializedRepeatables.add(root);
  root.addEventListener("click", (event) => {
    const action = event.target instanceof HTMLElement ? event.target.closest("[data-uif-repeat-action]") : null;
    if (!action) return;
    const template = root.querySelector('template[data-uif-role="template"]');
    const list = root.querySelector('[data-uif-role="items"]') || root;
    if (action.dataset.uifRepeatAction === "add" && template) list.append(template.content.cloneNode(true));
    if (action.dataset.uifRepeatAction === "remove") action.closest('[data-uif-role="item"]')?.remove();
  });
}
function initForm(formEl) {
  if (initializedForms.has(formEl)) return;
  initializedForms.add(formEl);
  formEl.dataset.uifState ||= "idle";
  formEl.querySelectorAll('[data-uif="repeatable"]').forEach(initRepeatableGroup);
  formEl.addEventListener("input", (event) => {
    const field = event.target instanceof HTMLElement ? event.target.closest("input,select,textarea") : null;
    field?.setAttribute("data-uif-touched", "true");
    formEl.dataset.uifDirty = "true";
  });
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(formEl);
    if (formEl.dataset.uifValidate !== "false") {
      const errors = await validateFormAsync(formEl);
      if (Object.keys(errors).length) {
        showErrors(formEl, errors);
        showErrorSummary(formEl, errors);
        setFormState(formEl, "error");
        return;
      }
    }
    setFormState(formEl, "submitting");
    const url = formEl.dataset.uifSrc || formEl.getAttribute("action") || window.location.href;
    const method = (formEl.dataset.uifMethod || formEl.getAttribute("method") || "POST").toUpperCase();
    try {
      const result = await request(url, {
        method,
        body: new FormData(formEl)
      });
      const target = resolveFormTarget(formEl);
      const mode = formEl.dataset.uifSwap || "inner";
      if (typeof result === "string") {
        swap(target, result, mode);
      } else if (result?.errors) {
        showErrors(formEl, result.errors);
        showErrorSummary(formEl, result.errors);
        setFormState(formEl, "error");
        return;
      } else if (result?.html) {
        swap(result.target ? document.querySelector(result.target) : target, result.html, result.swap || mode);
      }
      if (typeof result !== "string" && result?.focus) document.querySelector(result.focus)?.focus();
      setFormState(formEl, "success");
    } catch (error) {
      setFormState(formEl, "error");
      throw error;
    }
  });
}
var form = {
  name: "form",
  init: initForm
};

// packages/icons/src/icons.ts
var icons = {
  activity: { body: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"></path>' },
  alert: { body: '<path d="m12 3 10 18H2L12 3z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>' },
  approval: { body: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path>' },
  archive: { body: '<rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path>' },
  "area-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-5 3 3 5-7v12H7z"></path>' },
  "arrow-down": { body: '<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>' },
  "arrow-left": { body: '<path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path>' },
  "arrow-right": { body: '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>' },
  "arrow-up": { body: '<path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path>' },
  "at-sign": { body: '<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 1 0 3-3"></path><path d="M19.1 17A9 9 0 1 1 21 12"></path>' },
  audit: { body: '<path d="M3 3v18h18"></path><path d="m7 14 3-3 3 2 5-6"></path>' },
  award: { body: '<circle cx="12" cy="8" r="5"></circle><path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8"></path>' },
  bank: { body: '<path d="m3 10 9-6 9 6"></path><path d="M4 10h16"></path><path d="M6 10v8"></path><path d="M10 10v8"></path><path d="M14 10v8"></path><path d="M18 10v8"></path><path d="M4 18h16"></path>' },
  "bar-chart": { body: '<path d="M3 3v18h18"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path>' },
  batoi: {
    body: '<path fill="currentColor" stroke="none" d="M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z"></path><path fill="currentColor" stroke="none" d="M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z"></path>'
  },
  battery: { body: '<rect x="3" y="7" width="16" height="10" rx="2"></rect><path d="M21 11v2"></path><path d="M7 11v2"></path><path d="M10 11v2"></path><path d="M13 11v2"></path>' },
  bell: { body: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path>' },
  bluetooth: { body: '<path d="m7 7 10 10-5 4V3l5 4L7 17"></path>' },
  bot: { body: '<rect x="5" y="8" width="14" height="10" rx="3"></rect><path d="M12 8V4"></path><path d="M8 13h.01"></path><path d="M16 13h.01"></path><path d="M9 18v2"></path><path d="M15 18v2"></path>' },
  box: { body: '<path d="m21 8-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>' },
  brain: { body: '<path d="M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9 4z"></path><path d="M15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 15 4z"></path><path d="M7 10h4"></path><path d="M13 14h4"></path>' },
  briefcase: { body: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 12h18"></path><path d="M10 12v2h4v-2"></path>' },
  building: { body: '<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M8 7h.01"></path><path d="M12 7h.01"></path><path d="M16 7h.01"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M9 21v-5h6v5"></path>' },
  calculator: { body: '<rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8"></path><path d="M8 11h.01"></path><path d="M12 11h.01"></path><path d="M16 11h.01"></path><path d="M8 15h.01"></path><path d="M12 15h.01"></path><path d="M16 15h.01"></path>' },
  calendar: { body: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path>' },
  camera: { body: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z"></path><circle cx="12" cy="13" r="3"></circle>' },
  card: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h3"></path><path d="M14 15h3"></path>' },
  cart: { body: '<circle cx="9" cy="20" r="1"></circle><circle cx="17" cy="20" r="1"></circle><path d="M3 4h2l2.5 11h10L20 7H6"></path>' },
  cash: { body: '<rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 9v6"></path><path d="M18 9v6"></path>' },
  chart: { body: '<path d="M3 3v18h18"></path><path d="m7 14 3-3 3 2 5-6"></path>' },
  check: { body: '<path d="m20 6-11 11-5-5"></path>' },
  "check-circle": { body: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>' },
  "chevron-down": { body: '<path d="m6 9 6 6 6-6"></path>' },
  "chevron-left": { body: '<path d="m15 18-6-6 6-6"></path>' },
  "chevron-right": { body: '<path d="m9 18 6-6-6-6"></path>' },
  "chevron-up": { body: '<path d="m18 15-6-6-6 6"></path>' },
  "circle-dot": { body: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="2"></circle>' },
  clock: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>' },
  close: { body: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>' },
  cloud: { body: '<path d="M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z"></path>' },
  code: { body: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>' },
  command: { body: '<path d="M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z"></path>' },
  compass: { body: '<circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"></path>' },
  copy: { body: '<rect x="9" y="9" width="13" height="13" rx="2"></rect><rect x="2" y="2" width="13" height="13" rx="2"></rect>' },
  cpu: { body: '<rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M9 1v3"></path><path d="M15 1v3"></path><path d="M9 20v3"></path><path d="M15 20v3"></path><path d="M1 9h3"></path><path d="M1 15h3"></path><path d="M20 9h3"></path><path d="M20 15h3"></path>' },
  "credit-card": { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 10h18"></path><path d="M7 15h4"></path>' },
  dashboard: { body: '<path d="M4 13a8 8 0 1 1 16 0"></path><path d="M12 13l4-4"></path><path d="M5 19h14"></path>' },
  database: { body: '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path>' },
  desktop: { body: '<rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path><path d="M12 16v4"></path>' },
  document: { body: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h6"></path>' },
  "donut-chart": { body: '<path d="M12 3a9 9 0 1 1-8.5 6"></path><path d="M12 3v6"></path><circle cx="12" cy="12" r="3"></circle>' },
  drag: { body: '<path d="M9 5h.01"></path><path d="M15 5h.01"></path><path d="M9 12h.01"></path><path d="M15 12h.01"></path><path d="M9 19h.01"></path><path d="M15 19h.01"></path>' },
  download: { body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>' },
  edit: { body: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>' },
  error: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M15 9 9 15"></path><path d="m9 9 6 6"></path>' },
  "external-link": { body: '<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' },
  eye: { body: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>' },
  "eye-off": { body: '<path d="M2 2l20 20"></path><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1"></path><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9"></path><path d="M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1"></path>' },
  file: { body: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path>' },
  filter: { body: '<path d="M22 3H2l8 9v7l4 2v-9l8-9z"></path>' },
  flag: { body: '<path d="M5 22V4"></path><path d="M5 4h12l-2 4 2 4H5"></path>' },
  folder: { body: '<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"></path>' },
  "gauge-chart": { body: '<path d="M4 15a8 8 0 1 1 16 0"></path><path d="M12 15l5-5"></path><path d="M7 19h10"></path>' },
  globe: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path>' },
  grid: { body: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>' },
  hash: { body: '<path d="M5 9h14"></path><path d="M4 15h14"></path><path d="M10 3 8 21"></path><path d="M16 3l-2 18"></path>' },
  heart: { body: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>' },
  help: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2"></path><path d="M12 18h.01"></path>' },
  histogram: { body: '<path d="M3 3v18h18"></path><path d="M7 17v-5"></path><path d="M11 17V7"></path><path d="M15 17v-8"></path><path d="M19 17v-3"></path>' },
  home: { body: '<path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path>' },
  image: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="10" r="2"></circle><path d="m21 15-4-4-5 5-2-2-4 5"></path>' },
  inbox: { body: '<path d="M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z"></path><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>' },
  info: { body: '<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7h.01"></path>' },
  key: { body: '<circle cx="7.5" cy="12.5" r="3.5"></circle><path d="M11 12.5h10"></path><path d="M17 12.5v3"></path><path d="M20 12.5v3"></path>' },
  laptop: { body: '<rect x="5" y="4" width="14" height="10" rx="2"></rect><path d="M3 20h18l-2-4H5l-2 4z"></path>' },
  layers: { body: '<path d="m12 2 9 5-9 5-9-5 9-5z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path>' },
  link: { body: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2"></path>' },
  "line-chart": { body: '<path d="M3 3v18h18"></path><path d="m7 15 4-4 3 3 5-7"></path>' },
  list: { body: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>' },
  location: { body: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle>' },
  lock: { body: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>' },
  mail: { body: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>' },
  map: { body: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>' },
  maximize: { body: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path>' },
  message: { body: '<path d="M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z"></path>' },
  mic: { body: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v4"></path><path d="M8 22h8"></path>' },
  menu: { body: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>' },
  minus: { body: '<path d="M5 12h14"></path>' },
  moon: { body: '<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"></path>' },
  "more-horizontal": { body: '<path d="M5 12h.01"></path><path d="M12 12h.01"></path><path d="M19 12h.01"></path>' },
  "more-vertical": { body: '<path d="M12 5h.01"></path><path d="M12 12h.01"></path><path d="M12 19h.01"></path>' },
  offline: { body: '<path d="M2 2 22 22"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M5 13a10 10 0 0 1 4-2.4"></path><path d="M19 13a10 10 0 0 0-9.5-3"></path>' },
  package: { body: '<path d="m21 8-9-5-9 5 9 5 9-5z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M7.5 5.5 16.5 10.5"></path>' },
  paperclip: { body: '<path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8"></path>' },
  pause: { body: '<path d="M8 5v14"></path><path d="M16 5v14"></path>' },
  phone: { body: '<rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path>' },
  "pie-chart": { body: '<path d="M21 12A9 9 0 1 1 12 3v9h9z"></path><path d="M12 3a9 9 0 0 1 9 9h-9V3z"></path>' },
  play: { body: '<path d="m8 5 11 7-11 7V5z"></path>' },
  plus: { body: '<path d="M12 5v14"></path><path d="M5 12h14"></path>' },
  policy: { body: '<path d="M7 3h10l3 4v14H4V3h3z"></path><path d="M8 13h8"></path><path d="M8 17h5"></path><path d="M14 3v5h5"></path>' },
  printer: { body: '<path d="M7 9V3h10v6"></path><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path>' },
  "qr-code": { body: '<rect x="3" y="3" width="6" height="6"></rect><rect x="15" y="3" width="6" height="6"></rect><rect x="3" y="15" width="6" height="6"></rect><path d="M15 15h2v2h-2z"></path><path d="M19 15h2v6h-6v-2"></path><path d="M12 3v3"></path><path d="M12 12h3"></path>' },
  "radar-chart": { body: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5z"></path><path d="m12 7 4 3v4l-4 3-4-3v-4l4-3z"></path><path d="M12 3v18"></path><path d="M4 8l16 8"></path><path d="M20 8 4 16"></path>' },
  receipt: { body: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path>' },
  redo: { body: '<path d="M21 7v6h-6"></path><path d="M21 13a8 8 0 1 0-2.3 5.7"></path>' },
  refresh: { body: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"></path><path d="M3 21v-5h5"></path><path d="M3 12A9 9 0 0 1 18.4 5.6L21 8"></path><path d="M21 3v5h-5"></path>' },
  rocket: { body: '<path d="M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5"></path><path d="M9 15 4 20"></path><path d="M15 9l-6 6"></path><path d="M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z"></path>' },
  save: { body: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><path d="M17 21v-8H7v8"></path><path d="M7 3v5h8"></path>' },
  "scatter-chart": { body: '<path d="M3 3v18h18"></path><circle cx="8" cy="15" r="1.5"></circle><circle cx="12" cy="10" r="1.5"></circle><circle cx="17" cy="7" r="1.5"></circle><circle cx="16" cy="16" r="1.5"></circle>' },
  search: { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>' },
  send: { body: '<path d="m22 2-7 20-4-9-9-4 20-7z"></path><path d="M22 2 11 13"></path>' },
  server: { body: '<rect x="3" y="4" width="18" height="6" rx="2"></rect><rect x="3" y="14" width="18" height="6" rx="2"></rect><path d="M7 7h.01"></path><path d="M7 17h.01"></path>' },
  settings: { body: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z"></path>' },
  share: { body: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.6 6.8-4.2"></path><path d="m8.6 13.4 6.8 4.2"></path>' },
  shield: { body: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>' },
  sidebar: { body: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path>' },
  sliders: { body: '<path d="M4 6h8"></path><path d="M16 6h4"></path><path d="M14 4v4"></path><path d="M4 12h4"></path><path d="M12 12h8"></path><path d="M10 10v4"></path><path d="M4 18h10"></path><path d="M18 18h2"></path><path d="M16 16v4"></path>' },
  spark: { body: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"></path><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z"></path>' },
  sparkline: { body: '<path d="m3 16 4-4 3 2 4-6 3 4 4-5"></path>' },
  star: { body: '<path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z"></path>' },
  success: { body: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>' },
  sun: { body: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.9 4.9l1.4 1.4"></path><path d="M17.7 17.7l1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.9 19.1l1.4-1.4"></path><path d="M17.7 6.3l1.4-1.4"></path>' },
  sync: { body: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"></path><path d="M3 21v-5h5"></path><path d="M3 12A9 9 0 0 1 18.4 5.6L21 8"></path><path d="M21 3v5h-5"></path>' },
  table: { body: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 4v16"></path>' },
  tag: { body: '<path d="M20 12 12 20 3 11V3h8l9 9z"></path><path d="M7 7h.01"></path>' },
  target: { body: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>' },
  terminal: { body: '<path d="m4 17 6-5-6-5"></path><path d="M12 19h8"></path>' },
  theme: { body: '<path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M2 14h4"></path><path d="M10 8h4"></path><path d="M18 16h4"></path>' },
  tool: { body: '<path d="M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z"></path>' },
  trash: { body: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 15H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>' },
  undo: { body: '<path d="M3 7v6h6"></path><path d="M3 13a8 8 0 1 1 2.3 5.7"></path>' },
  unlock: { body: '<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 7.5-2"></path>' },
  upload: { body: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path>' },
  user: { body: '<path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle>' },
  users: { body: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
  video: { body: '<rect x="3" y="6" width="14" height="12" rx="2"></rect><path d="m17 10 4-3v10l-4-3"></path>' },
  wallet: { body: '<path d="M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12"></path><path d="M16 13h5"></path><path d="M17 13h.01"></path>' },
  warning: { body: '<path d="m12 3 10 18H2L12 3z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>' },
  wifi: { body: '<path d="M5 13a10 10 0 0 1 14 0"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M12 20h.01"></path>' },
  workflow: { body: '<rect x="3" y="4" width="6" height="6" rx="2"></rect><rect x="15" y="14" width="6" height="6" rx="2"></rect><path d="M9 7h3a3 3 0 0 1 3 3v4"></path><path d="M12 17H9a3 3 0 0 1-3-3v-4"></path>' },
  "x-circle": { body: '<circle cx="12" cy="12" r="9"></circle><path d="M15 9 9 15"></path><path d="m9 9 6 6"></path>' },
  "zoom-in": { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path><path d="M11 8v6"></path><path d="M8 11h6"></path>' },
  "zoom-out": { body: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path><path d="M8 11h6"></path>' }
};

// packages/icons/src/render.ts
var customIcons = {};
function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function iconBody(definition) {
  return Array.isArray(definition.body) ? definition.body.join("") : definition.body;
}
function definitionFor(name) {
  return customIcons[name] ?? icons[name];
}
function normalizeSize(size) {
  if (size === void 0) return void 0;
  return typeof size === "number" ? `${size}px` : size;
}
function hasIcon(name) {
  return Boolean(definitionFor(name));
}
function registerIcon(name, body, viewBox = "0 0 24 24") {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
  customIcons[name] = { body, viewBox };
}
function icon(name, options = {}) {
  const definition = definitionFor(name);
  if (!definition) return "";
  const className = ["uif-icon", options.className].filter(Boolean).join(" ");
  const size = normalizeSize(options.size);
  const hidden = options.title ? false : options.hidden !== false;
  const attrs = [
    `class="${escapeAttribute(className)}"`,
    `viewBox="${escapeAttribute(definition.viewBox ?? "0 0 24 24")}"`,
    size ? `width="${escapeAttribute(size)}"` : "",
    size ? `height="${escapeAttribute(size)}"` : "",
    options.title ? 'role="img"' : "",
    hidden ? 'aria-hidden="true"' : "",
    'fill="none"',
    'xmlns="http://www.w3.org/2000/svg"'
  ].filter(Boolean);
  const title = options.title ? `<title>${escapeAttribute(options.title)}</title>` : "";
  return `<svg ${attrs.join(" ")}>${title}${iconBody(definition)}</svg>`;
}
function iconElement(name, options = {}) {
  const markup = icon(name, options);
  if (!markup) throw new Error(`Unknown icon: ${name}`);
  const template = document.createElement("template");
  template.innerHTML = markup;
  return template.content.firstElementChild;
}

// packages/icons/src/mount.ts
function parseSize(value) {
  if (!value) return void 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== "" ? numeric : value;
}
function isIconHost(root, selector) {
  return "matches" in root && typeof root.matches === "function" && root.matches(selector);
}
function mountIcons(root = document, options = {}) {
  const selector = options.selector ?? "[data-uif-icon]";
  const targets = [
    ...isIconHost(root, selector) ? [root] : [],
    ...root.querySelectorAll(selector)
  ];
  targets.forEach((target) => {
    if (target.dataset.uifIconMounted === "true") return;
    const name = target.dataset.uifIcon;
    if (!name) return;
    const iconOptions = {
      className: target.dataset.uifIconClass,
      hidden: target.dataset.uifIconHidden === "false" ? false : void 0,
      size: parseSize(target.dataset.uifIconSize ?? null),
      title: target.dataset.uifIconTitle
    };
    try {
      const svg = iconElement(name, iconOptions);
      target.replaceChildren(svg);
      target.dataset.uifIconMounted = "true";
    } catch {
      target.dataset.uifIconMissing = name;
    }
  });
}

// packages/mcp/src/index.ts
function renderToolApproval(el) {
  const tool = el.dataset.uifTool || "tool";
  const risk = el.dataset.uifRisk || "medium";
  const irreversible = el.dataset.uifIrreversible === "true";
  const card2 = document.createElement("div");
  card2.className = "uif-tool-approval";
  card2.dataset.risk = risk;
  appendTextElement(card2, "strong", tool);
  appendTextElement(card2, "span", `${risk}${irreversible ? " irreversible" : ""}`, "uif-risk-badge");
  if (irreversible) {
    const input = document.createElement("input");
    input.dataset.uifRole = "confirm";
    input.placeholder = "Type APPROVE";
    card2.append(input);
  }
  ["approve", "reject"].forEach((action) => {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.dataset.uifAction = action;
    button2.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card2.append(button2);
  });
  el.replaceChildren(card2);
  el.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("[data-uif-action]") : null;
    const action = target?.dataset.uifAction;
    const confirmation = el.querySelector('[data-uif-role="confirm"]');
    if (action === "approve" && irreversible && confirmation?.value !== "APPROVE") {
      emit("uif:tool-confirmation-required", { tool, risk }, el);
      return;
    }
    if (action === "approve" || action === "reject") emit(`uif:tool-${action}`, { tool, risk, irreversible }, el);
  });
}
function renderToolProgress(el, message) {
  const progress2 = appendTextElement(document.createElement("div"), "div", message, "uif-tool-progress");
  progress2.setAttribute("role", "status");
  el.replaceChildren(progress2);
}
function renderToolTimeline(el, steps) {
  const list = document.createElement("ol");
  list.className = "uif-tool-timeline";
  steps.forEach((step) => {
    const item = appendTextElement(list, "li", step.label);
    item.dataset.uifState = step.state ?? "pending";
  });
  el.replaceChildren(list);
}
function renderToolAuditTrail(el, entries) {
  const list = document.createElement("ol");
  list.className = "uif-tool-audit";
  entries.forEach((entry) => {
    const item = document.createElement("li");
    appendTextElement(item, "strong", entry.actor ?? "system");
    item.append(` ${entry.action} `);
    appendTextElement(item, "time", entry.at ?? "");
    list.append(item);
  });
  el.replaceChildren(list);
}
function renderDiff(el, before, after) {
  const diff = document.createElement("div");
  diff.className = "uif-diff";
  const beforeEl = appendTextElement(diff, "pre", before);
  beforeEl.dataset.uifRole = "before";
  const afterEl = appendTextElement(diff, "pre", after);
  afterEl.dataset.uifRole = "after";
  el.replaceChildren(diff);
}
function renderToolResult(el, result) {
  const pre = appendTextElement(document.createElement("div"), "pre", JSON.stringify(result, null, 2), "uif-tool-result");
  el.replaceChildren(pre);
}
var toolApproval = { name: "tool-approval", init: renderToolApproval };

// packages/mobile/src/index.ts
function initMobileShell(el) {
  el.classList.add("uif-mobile-shell");
  el.querySelector('[data-uif-role="topbar"]')?.classList.add("uif-mobile-topbar");
  el.querySelector('[data-uif-role="content"]')?.classList.add("uif-mobile-content");
  el.querySelector('[data-uif-role="bottom-nav"]')?.classList.add("uif-mobile-bottom-nav");
  el.querySelectorAll('[data-uif-role="sheet"]').forEach(initSheetModal);
  el.querySelectorAll('[data-uif-role="swipe-action"]').forEach(initSwipeAction);
  el.querySelectorAll('[data-uif-role="pull-to-refresh"]').forEach(initPullToRefresh);
}
function showOfflineBanner(message = "Offline") {
  const banner = document.createElement("div");
  banner.className = "uif-offline-banner";
  banner.textContent = message;
  banner.setAttribute("role", "status");
  document.body.prepend(banner);
  return banner;
}
function initSegmentedControl(el) {
  el.setAttribute("role", "tablist");
  el.querySelectorAll('[data-uif-role="segment"]').forEach((segment, index) => {
    segment.setAttribute("role", "tab");
    segment.setAttribute("aria-selected", String(index === 0));
  });
}
function initSheetModal(el) {
  el.classList.add("uif-sheet-modal");
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.setAttribute("aria-modal", "true");
}
function initSwipeAction(el) {
  el.classList.add("uif-swipe-action");
  el.dataset.uifState = el.dataset.uifState || "idle";
}
function initPullToRefresh(el) {
  el.classList.add("uif-pull-to-refresh");
  el.dataset.uifState = el.dataset.uifState || "idle";
}
var mobileShell = { name: "mobile-shell", init: initMobileShell };

// packages/pwa/src/index.ts
var deferredPrompt = null;
var offlineQueue = [];
async function registerServiceWorker(path = "/sw.js") {
  if (!("serviceWorker" in navigator)) return void 0;
  return navigator.serviceWorker.register(path);
}
async function unregisterServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((registration) => registration.unregister()));
}
function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
  });
  return async () => {
    await deferredPrompt?.prompt();
  };
}
function onOnline(handler) {
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
function onOffline(handler) {
  window.addEventListener("offline", handler);
  return () => window.removeEventListener("offline", handler);
}
function onNetworkChange(handler) {
  const up = () => handler(true);
  const down = () => handler(false);
  window.addEventListener("online", up);
  window.addEventListener("offline", down);
  return () => {
    window.removeEventListener("online", up);
    window.removeEventListener("offline", down);
  };
}
var cacheStrategies = {
  networkFirst: "fetch(event.request).catch(() => caches.match(event.request))",
  cacheFirst: "caches.match(event.request).then((cached) => cached || fetch(event.request))",
  staleWhileRevalidate: "caches.match(event.request).then((cached) => { const fresh = fetch(event.request); return cached || fresh; })"
};
function createCacheStrategy(name) {
  return cacheStrategies[name];
}
function queueOfflineTask(task) {
  offlineQueue.push(task);
}
async function flushOfflineQueue() {
  while (offlineQueue.length) await offlineQueue.shift()?.();
}
function initOfflineQueue() {
  const flush = () => void flushOfflineQueue();
  window.addEventListener("online", flush);
  return () => window.removeEventListener("online", flush);
}
function onAppUpdate(handler) {
  if (!("serviceWorker" in navigator)) return () => void 0;
  const listener = () => {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) handler(registration);
    });
  };
  navigator.serviceWorker.addEventListener("controllerchange", listener);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", listener);
}
function initInstallPrompt(el) {
  const prompt = setupInstallPrompt();
  el.addEventListener("click", () => void prompt());
}

// packages/components/dist/index.js
var focusableSelector2 = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function showToast2(message, options = {}) {
  const toastEl = document.createElement("div");
  toastEl.dataset.uif = "toast";
  toastEl.dataset.uifState = "open";
  toastEl.dataset.uifType = options.type ?? "info";
  toastEl.textContent = message;
  toastEl.setAttribute("role", options.type === "danger" ? "alert" : "status");
  toastEl.className = `uif-toast uif-toast-${options.type ?? "info"}`;
  document.body.appendChild(toastEl);
  emit("uif:toast", { message, options, el: toastEl }, toastEl);
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => toastEl.remove(), reduce ? 0 : options.duration ?? 3e3);
  return toastEl;
}

// packages/pwa/dist/index.js
async function registerServiceWorker2(path = "/sw.js") {
  if (!("serviceWorker" in navigator)) return void 0;
  return navigator.serviceWorker.register(path);
}

// packages/push/src/index.ts
var notifications = [];
function addNotification(item) {
  const notification = { ...item, id: item.id || `n-${Date.now()}-${notifications.length}` };
  notifications.unshift(notification);
  window.dispatchEvent(new CustomEvent("uif:notification", { detail: notification }));
  return notification;
}
function getNotifications() {
  return [...notifications];
}
function unreadCount() {
  return notifications.filter((item) => !item.read).length;
}
function markNotificationsRead() {
  notifications.forEach((item) => {
    item.read = true;
  });
}
async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}
async function registerPushServiceWorker(path = "/sw.js") {
  return registerServiceWorker2(path);
}
async function subscribeToPush(options) {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe(options);
}
async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}
async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? subscription.unsubscribe() : true;
}
function showInAppNotification(message, options = {}) {
  addNotification({ message, type: options.type ?? "info" });
  return showToast2(message, { type: options.type ?? "info" });
}
async function postSubscription(src, payload) {
  if (!src) return;
  await fetch(src, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}
function initPush(el) {
  el.addEventListener("click", async () => {
    const action = el.dataset.uifAction || "notify";
    if (action === "subscribe") {
      const permission = await requestNotificationPermission();
      await postSubscription(el.dataset.uifSrc, { action, permission });
      showInAppNotification(permission === "granted" ? "Notifications enabled" : "Notification permission not granted");
    }
    if (action === "unsubscribe") {
      const ok = await unsubscribeFromPush();
      await postSubscription(el.dataset.uifSrc, { action, ok });
      showInAppNotification(ok ? "Notifications disabled" : "Unable to disable notifications");
    }
    if (action === "notify") showInAppNotification(el.dataset.uifMessage || el.textContent?.trim() || "Notification");
  });
}
var push = { name: "push", init: initPush };

// packages/rad-adapter/src/index.ts
var swapModes = /* @__PURE__ */ new Set(["inner", "outer", "append", "prepend", "before", "after"]);
var bodylessMethods = /* @__PURE__ */ new Set(["GET", "HEAD"]);
var boundRoots2 = /* @__PURE__ */ new WeakMap();
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
  const existing = boundRoots2.get(root);
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
    const form2 = target?.closest('form[data-uif="ajax"],form[data-uif-action="submit"],form[data-uif-action="save"]');
    if (!form2) return;
    event.preventDefault();
    void loadPartial(form2).catch(() => void 0);
  };
  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  const dispose = () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
    boundRoots2.delete(root);
  };
  boundRoots2.set(root, dispose);
  return dispose;
}

// packages/realtime/src/index.ts
var handlers2 = /* @__PURE__ */ new Map();
var connections = /* @__PURE__ */ new Map();
var states = /* @__PURE__ */ new Map();
var presence = /* @__PURE__ */ new Map();
var elementSubscriptions = /* @__PURE__ */ new WeakMap();
function setState2(channel, state) {
  states.set(channel, state);
  window.dispatchEvent(new CustomEvent("uif:realtime-state", { detail: { channel, state } }));
}
function getConnectionState(channel) {
  return states.get(channel) ?? "idle";
}
function parsePayload(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
function subscribe(channel, handler) {
  if (!handlers2.has(channel)) handlers2.set(channel, /* @__PURE__ */ new Set());
  handlers2.get(channel)?.add(handler);
  return () => handlers2.get(channel)?.delete(handler);
}
function publishLocal(channel, payload) {
  handlers2.get(channel)?.forEach((handler) => handler(payload));
}
function publishBatched(channel, payload) {
  window.requestAnimationFrame(() => publishLocal(channel, payload));
}
function connect(options) {
  const mode = options.mode ?? "poll";
  disconnect(options.channel);
  setState2(options.channel, "connecting");
  let attempts = 0;
  const reconnect = () => {
    if (options.reconnect === false) {
      setState2(options.channel, "disconnected");
      return;
    }
    attempts += 1;
    setState2(options.channel, "reconnecting");
    window.setTimeout(() => connect(options), (options.backoff ?? 500) * attempts);
  };
  if (mode === "sse" && options.src && "EventSource" in window) {
    const source = new EventSource(options.src);
    source.onopen = () => setState2(options.channel, "connected");
    source.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    source.onerror = reconnect;
    connections.set(options.channel, { close: () => source.close() });
    return;
  }
  if (mode === "websocket" && options.src && "WebSocket" in window) {
    const socket = new WebSocket(options.src);
    socket.onopen = () => setState2(options.channel, "connected");
    socket.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    socket.onerror = reconnect;
    socket.onclose = reconnect;
    connections.set(options.channel, { close: () => socket.close() });
    return;
  }
  let inFlight = false;
  const timer = window.setInterval(async () => {
    if (!options.src) return;
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await request(options.src, { method: "GET", parseAs: "json", key: `realtime:${options.channel}`, timeout: options.interval ?? 5e3 });
      setState2(options.channel, "connected");
      publishLocal(options.channel, response);
    } catch {
      setState2(options.channel, "error");
      reconnect();
    } finally {
      inFlight = false;
    }
  }, options.interval ?? 5e3);
  if (options.heartbeat) {
    window.setTimeout(() => {
      if (getConnectionState(options.channel) === "connecting") setState2(options.channel, "stale");
    }, options.heartbeat);
  }
  connections.set(options.channel, { close: () => window.clearInterval(timer) });
}
function bindRealtime(options) {
  const mode = options.transport === "polling" ? "poll" : options.transport;
  const disposers = [];
  if (options.onMessage) disposers.push(subscribe(options.channel, options.onMessage));
  if (options.onState) {
    const listener = (event) => {
      const detail = event.detail;
      if (detail?.channel === options.channel) options.onState?.(detail.state);
    };
    window.addEventListener("uif:realtime-state", listener);
    disposers.push(() => window.removeEventListener("uif:realtime-state", listener));
  }
  connect({ ...options, mode: mode ?? (options.fallback === "polling" ? "poll" : void 0) });
  disposers.push(() => disconnect(options.channel));
  return () => disposers.splice(0).forEach((dispose) => dispose());
}
function updatePresence(channel, user) {
  if (!presence.has(channel)) presence.set(channel, /* @__PURE__ */ new Map());
  const next = { ...user, lastSeen: user.lastSeen ?? (/* @__PURE__ */ new Date()).toISOString() };
  presence.get(channel)?.set(next.id, next);
  window.dispatchEvent(new CustomEvent("uif:presence", { detail: { channel, users: getPresence(channel) } }));
  return next;
}
function removePresence(channel, userId) {
  presence.get(channel)?.delete(userId);
  window.dispatchEvent(new CustomEvent("uif:presence", { detail: { channel, users: getPresence(channel) } }));
}
function getPresence(channel) {
  return Array.from(presence.get(channel)?.values() ?? []);
}
function disconnect(channel) {
  connections.get(channel)?.close();
  connections.delete(channel);
  setState2(channel, "disconnected");
}
function initRealtime(el) {
  const channel = el.dataset.uifChannel;
  if (!channel) return;
  elementSubscriptions.get(el)?.();
  const target = el.dataset.uifTarget ? document.querySelector(el.dataset.uifTarget) : el;
  const unsubscribe = subscribe(channel, (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    if (!target) return;
    target.replaceChildren();
    items.forEach((item) => appendTextElement(target, "div", typeof item === "string" ? item : JSON.stringify(item), "uif-feed-item"));
  });
  elementSubscriptions.set(el, unsubscribe);
  connect({
    channel,
    src: el.dataset.uifSrc,
    mode: el.dataset.uifMode || "poll",
    interval: Number(el.dataset.uifInterval || 5e3),
    reconnect: el.dataset.uifReconnect !== "false"
  });
}
var realtime = { name: "realtime", init: initRealtime };

// packages/table/src/index.ts
var initializedTables = /* @__PURE__ */ new WeakSet();
var initializedFilters = /* @__PURE__ */ new WeakSet();
function rows(table2) {
  return Array.from(table2.tBodies[0]?.rows ?? []);
}
function sortTable(table2, column, direction = "asc") {
  const body = table2.tBodies[0];
  if (!body) return;
  rows(table2).sort((a, b) => {
    const av = a.cells[column]?.textContent?.trim() ?? "";
    const bv = b.cells[column]?.textContent?.trim() ?? "";
    return direction === "asc" ? av.localeCompare(bv, void 0, { numeric: true }) : bv.localeCompare(av, void 0, { numeric: true });
  }).forEach((row) => body.append(row));
}
function filterTable(table2, query) {
  const normalized = query.trim().toLowerCase();
  rows(table2).forEach((row) => {
    row.hidden = normalized !== "" && !row.textContent?.toLowerCase().includes(normalized);
  });
}
function selectedRows(table2) {
  return rows(table2).filter((row) => row.querySelector('[data-uif-role="row-select"]')?.checked);
}
function setTableState(table2, state) {
  table2.dataset.uifState = state;
  const body = table2.tBodies[0];
  if (!body || !["empty", "loading", "error"].includes(state)) return;
  const columns = Math.max(1, table2.tHead?.rows[0]?.cells.length ?? 1);
  const row = document.createElement("tr");
  row.dataset.uifState = state;
  const cell = document.createElement("td");
  cell.colSpan = columns;
  cell.className = "uif-table-state";
  cell.textContent = state;
  row.append(cell);
  body.replaceChildren(row);
}
function applyResponsiveColumns(table2) {
  table2.querySelectorAll("[data-uif-hide]").forEach((cell) => {
    cell.classList.add(`uif-hide-${cell.dataset.uifHide}`);
  });
}
function renderRemoteRows(table2, data, columns) {
  const body = table2.tBodies[0] || table2.createTBody();
  if (data.html) {
    setTrustedHTML(body, data.html, { trusted: true, context: "remote table rows" });
    return;
  }
  const sourceRows = data.rows ?? [];
  if (!sourceRows.length) {
    setTableState(table2, "empty");
    return;
  }
  body.replaceChildren(
    ...sourceRows.map((row) => {
      const tr = document.createElement("tr");
      columns.forEach((column) => {
        const td = document.createElement("td");
        td.textContent = String(row[column] ?? "");
        tr.append(td);
      });
      return tr;
    })
  );
}
async function loadRemoteTable(table2, options = {}) {
  const src = options.src || table2.dataset.uifSrc;
  if (!src) return null;
  const url = new URL(src, window.location.href);
  url.searchParams.set("page", String(options.page ?? table2.dataset.uifPage ?? 1));
  url.searchParams.set("pageSize", String(options.pageSize ?? table2.dataset.uifPageSize ?? 25));
  setTableState(table2, "loading");
  try {
    const response = await fetch(url);
    const data = await response.json();
    const columns = options.columns ?? (table2.dataset.uifColumns?.split(",").map((item) => item.trim()).filter(Boolean) || []);
    renderRemoteRows(table2, data, columns);
    table2.dataset.uifPage = String(data.page ?? options.page ?? table2.dataset.uifPage ?? 1);
    table2.dataset.uifTotal = String(data.total ?? data.rows?.length ?? rows(table2).length);
    if (data.rows?.length || data.html) setTableState(table2, "loaded");
    return data;
  } catch (error) {
    setTableState(table2, "error");
    throw error;
  }
}
function exportTable(table2, options = {}) {
  const selected = selectedRows(table2);
  const sourceRows = selected.length ? selected : rows(table2);
  if (options.exportData) return options.exportData(sourceRows);
  return sourceRows.map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() ?? ""));
}
function filterElements(targetSelector, query, mode = "contains") {
  const normalized = query.trim().toLowerCase();
  document.querySelectorAll(targetSelector).forEach((item) => {
    const text = item.textContent?.trim().toLowerCase() ?? "";
    const matched = normalized === "" || (mode === "startsWith" ? text.startsWith(normalized) : mode === "token" ? text.split(/\s+/).includes(normalized) : text.includes(normalized));
    item.hidden = !matched;
  });
}
function initDeclarativeFilters(root = document) {
  root.querySelectorAll("[data-uif-filter-target]").forEach((filterInput) => {
    if (initializedFilters.has(filterInput)) return;
    initializedFilters.add(filterInput);
    const target = filterInput.dataset.uifFilterTarget;
    if (!target) return;
    const mode = filterInput.dataset.uifFilterMode || "contains";
    filterInput.addEventListener("input", () => filterElements(target, filterInput.value, mode));
    filterInput.addEventListener("change", () => filterElements(target, filterInput.value, mode));
  });
}
function initTable(table2, options = {}) {
  if (initializedTables.has(table2)) return;
  initializedTables.add(table2);
  table2.dataset.uifState = table2.dataset.uifState || "idle";
  applyResponsiveColumns(table2);
  table2.querySelectorAll("th[data-uif-sort]").forEach((header, index) => {
    header.tabIndex = 0;
    header.setAttribute("role", "button");
    const sort = () => {
      const direction = header.dataset.uifSort === "desc" ? "desc" : "asc";
      sortTable(table2, index, direction);
      header.dataset.uifSort = direction === "asc" ? "desc" : "asc";
    };
    header.addEventListener("click", sort);
    header.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        sort();
      }
    });
  });
  const filters = [
    ...options.filterInput ? [options.filterInput] : [],
    ...Array.from(document.querySelectorAll(`[data-uif-table-filter="#${CSS.escape(table2.id)}"]`))
  ];
  filters.forEach((filterInput) => filterInput.addEventListener("input", () => filterTable(table2, filterInput.value)));
  table2.addEventListener("keydown", (event) => {
    const cell = event.target instanceof HTMLElement ? event.target.closest("td,th") : null;
    if (!cell || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const rowIndex = cell.parentElement instanceof HTMLTableRowElement ? cell.parentElement.rowIndex : 0;
    const cellIndex = cell.cellIndex;
    const nextRow = table2.rows[rowIndex + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0)];
    const nextCell = nextRow?.cells[cellIndex + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0)];
    if (nextCell) {
      event.preventDefault();
      nextCell.tabIndex = 0;
      nextCell.focus();
    }
  });
  document.querySelectorAll(`[data-uif-table-action][data-uif-target="#${CSS.escape(table2.id)}"]`).forEach((actionEl) => {
    actionEl.addEventListener("click", () => {
      const action = actionEl.dataset.uifTableAction || actionEl.dataset.uifAction || "";
      options.onBulkAction?.(action, selectedRows(table2));
    });
  });
  table2.addEventListener("click", (event) => {
    const actionEl = event.target instanceof HTMLElement ? event.target.closest("[data-uif-row-action]") : null;
    const row = actionEl?.closest("tr");
    if (actionEl && row) options.onRowAction?.(actionEl.dataset.uifRowAction || "", row);
  });
  if (options.src || table2.dataset.uifSrc) void loadRemoteTable(table2, options);
}
var dataTable = { name: "table", init: (el) => initTable(el) };

// packages/core/src/attributes.ts
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
  "data-uif-persist",
  "data-uif-toolbar",
  "data-uif-preview",
  "data-uif-animation",
  "data-uif-duration",
  "data-uif-delay",
  "data-uif-placement",
  "data-uif-container",
  "data-uif-html",
  "data-uif-backdrop",
  "data-uif-scroll",
  "data-uif-breakpoint",
  "data-uif-class",
  "data-uif-attribute",
  "data-uif-key"
];
var uifValues = [
  "button",
  "modal",
  "drawer",
  "offcanvas",
  "dropdown",
  "tabs",
  "toast",
  "accordion",
  "tooltip",
  "popover",
  "table",
  "form",
  "editor",
  "ajax",
  "route",
  "shell",
  "nav",
  "chart",
  "animate",
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
  "animate",
  "add-class",
  "remove-class",
  "toggle-class",
  "set-attribute",
  "remove-attribute",
  "set-value",
  "copy",
  "scroll-to",
  "focus",
  "emit",
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

// packages/core/src/micro-app.ts
var storageModes = /* @__PURE__ */ new Set(["local-only", "local-first", "sync-optional", "connected", "shared"]);
var localStores = /* @__PURE__ */ new Set(["indexeddb", "localstorage", "memory", "none"]);
var transports = /* @__PURE__ */ new Set(["websocket", "sse", "polling"]);
var connectorTypes = /* @__PURE__ */ new Set(["api", "csv", "json", "spreadsheet", "google-sheet", "static"]);
var connectorModes = /* @__PURE__ */ new Set(["readonly", "readwrite"]);
function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function booleanValue(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function normalizeStorage(raw, issues) {
  const source = isRecord(raw) ? raw : {};
  const mode = stringValue(source.mode);
  const localStore = stringValue(source.localStore);
  if (mode && !storageModes.has(mode)) issues.push({ path: "storage.mode", message: `Unsupported storage mode: ${mode}` });
  if (localStore && !localStores.has(localStore)) issues.push({ path: "storage.localStore", message: `Unsupported local store: ${localStore}` });
  return {
    mode: storageModes.has(mode) ? mode : "local-first",
    localStore: localStores.has(localStore) ? localStore : "indexeddb",
    sharedStore: booleanValue(source.sharedStore, false),
    namespace: stringValue(source.namespace),
    encrypted: booleanValue(source.encrypted, false)
  };
}
function normalizeRealtime(raw, issues) {
  const source = isRecord(raw) ? raw : {};
  const transport = stringValue(source.transport);
  if (transport && !transports.has(transport)) issues.push({ path: "realtime.transport", message: `Unsupported transport: ${transport}` });
  return {
    enabled: booleanValue(source.enabled, false),
    channel: stringValue(source.channel),
    transport: transports.has(transport) ? transport : "polling",
    fallback: source.fallback === "none" ? "none" : "polling"
  };
}
function normalizeConnector(raw, index, issues) {
  if (!isRecord(raw)) {
    issues.push({ path: `connectors.${index}`, message: "Connector must be an object" });
    return void 0;
  }
  const type = stringValue(raw.type);
  const mode = stringValue(raw.mode);
  if (!type || !connectorTypes.has(type)) {
    issues.push({ path: `connectors.${index}.type`, message: type ? `Unsupported connector type: ${type}` : "Connector type is required" });
    return void 0;
  }
  if (mode && !connectorModes.has(mode)) issues.push({ path: `connectors.${index}.mode`, message: `Unsupported connector mode: ${mode}` });
  return {
    type,
    name: stringValue(raw.name),
    mode: connectorModes.has(mode) ? mode : "readonly",
    src: stringValue(raw.src),
    refreshInterval: typeof raw.refreshInterval === "number" ? raw.refreshInterval : void 0,
    schema: isRecord(raw.schema) ? raw.schema : void 0
  };
}
function normalizePermissions(raw) {
  const source = isRecord(raw) ? raw : {};
  return {
    network: Array.isArray(source.network) ? source.network.filter((item) => typeof item === "string") : [],
    storage: booleanValue(source.storage, true),
    realtime: booleanValue(source.realtime, false),
    ai: booleanValue(source.ai, false),
    mcp: booleanValue(source.mcp, false)
  };
}
function validateMicroAppManifest(input) {
  const issues = [];
  const source = isRecord(input) ? input : {};
  if (!isRecord(input)) issues.push({ path: "$", message: "Manifest must be an object" });
  const name = stringValue(source.name);
  if (!name) issues.push({ path: "name", message: "Micro App name is required" });
  if (source.type !== "micro-app") issues.push({ path: "type", message: 'Manifest type must be "micro-app"' });
  const connectors = Array.isArray(source.connectors) ? source.connectors.map((item, index) => normalizeConnector(item, index, issues)).filter((item) => Boolean(item)) : [];
  const manifest = {
    ...source,
    name: name ?? "Untitled Micro App",
    type: "micro-app",
    version: stringValue(source.version),
    description: stringValue(source.description),
    entry: stringValue(source.entry),
    storage: normalizeStorage(source.storage, issues),
    realtime: normalizeRealtime(source.realtime, issues),
    connectors,
    permissions: normalizePermissions(source.permissions),
    build: isRecord(source.build) ? { upgradeable: booleanValue(source.build.upgradeable, false), appType: stringValue(source.build.appType) } : void 0,
    ui: isRecord(source.ui) ? { mount: stringValue(source.ui.mount), title: stringValue(source.ui.title), icon: stringValue(source.ui.icon) } : void 0
  };
  return { manifest, issues, valid: issues.length === 0 };
}
function parseMicroAppManifest(input) {
  const result = validateMicroAppManifest(input);
  if (!result.valid) {
    const message = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Invalid Micro App manifest: ${message}`);
  }
  return result.manifest;
}

// packages/core/src/index.ts
var plugins = /* @__PURE__ */ new Map();
function coerceValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}
function parseOptions2(el) {
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
function emit2(name, detail, target = document) {
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
  emit2("uif:before-init", { root, options }, root);
  const app = {
    root,
    options,
    destroy() {
      emit2("uif:before-destroy", { root }, root);
      emit2("uif:destroy", { root }, root);
    }
  };
  for (const plugin of plugins.values()) {
    try {
      plugin.setup(app);
    } catch (error) {
      emit2("uif:error", { error, plugin: plugin.name }, root);
    }
  }
  emit2("uif:init", { root, options }, root);
  return app;
}

// packages/dom/src/index.ts
var initialized2 = /* @__PURE__ */ new WeakMap();
var registry2 = /* @__PURE__ */ new Map();
function registerComponent(nameOrComponent, component) {
  const entry = typeof nameOrComponent === "string" ? { name: nameOrComponent, ...component } : nameOrComponent;
  registry2.set(entry.name, entry);
}
function qs(selector, root = document) {
  return root.querySelector(selector);
}
function qsa2(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}
function closest(el, selector) {
  return el.closest(selector);
}
function resolveTarget2(sourceEl, targetExpression = "self") {
  if (targetExpression === "self") return sourceEl;
  if (targetExpression === "parent") return sourceEl.parentElement;
  if (targetExpression.startsWith("closest:")) return sourceEl.closest(targetExpression.slice(8));
  if (targetExpression.startsWith("#") || targetExpression.startsWith(".")) {
    return document.querySelector(targetExpression);
  }
  return document.querySelector(targetExpression);
}
function setText2(target, value) {
  if (!target) return;
  target.textContent = value == null ? "" : String(value);
}
function appendTextElement2(parent, tagName, text, className) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  setText2(el, text);
  parent.append(el);
  return el;
}
function setTrustedHTML2(target, html, options = {}) {
  if (!target) return;
  if (!options.trusted) {
    throw new Error(`Batoi UIF refused untrusted HTML${options.context ? ` for ${options.context}` : ""}`);
  }
  target.innerHTML = html;
}
function swapTrustedHTML2(targetEl, html, mode = "inner") {
  if (mode === "inner") {
    setTrustedHTML2(targetEl, html, { trusted: true, context: "swap" });
    return targetEl;
  }
  if (mode === "append") targetEl.insertAdjacentHTML("beforeend", html);
  if (mode === "prepend") targetEl.insertAdjacentHTML("afterbegin", html);
  if (mode === "before") targetEl.insertAdjacentHTML("beforebegin", html);
  if (mode === "after") targetEl.insertAdjacentHTML("afterend", html);
  if (mode === "outer") {
    targetEl.insertAdjacentHTML("afterend", html);
    const updated = targetEl.nextElementSibling;
    targetEl.remove();
    return updated instanceof HTMLElement ? updated : document.body;
  }
  return targetEl;
}
function candidates2(root) {
  const own = root instanceof HTMLElement && root.matches("[data-uif]") ? [root] : [];
  return own.concat(qsa2("[data-uif]", root));
}
function mount2(root = document) {
  candidates2(root).forEach((el) => {
    if (initialized2.has(el)) return;
    const key = el.getAttribute("data-uif");
    if (!key) return;
    const component = registry2.get(key);
    if (!component) return;
    component.init(el);
    initialized2.set(el, component);
  });
}
function unmount(root = document) {
  candidates2(root).forEach((el) => {
    const component = initialized2.get(el);
    component?.destroy?.(el);
    initialized2.delete(el);
  });
}
function autoInit2(root = document) {
  mount2(root);
}
function observe(root = document.body) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) autoInit2(node);
      });
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) unmount(node);
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}
function isInitialized(el) {
  return initialized2.has(el);
}

// packages/query/src/index.ts
function toElements(input, root = document) {
  if (!input) return [];
  if (typeof input === "string") return Array.from(root.querySelectorAll(input));
  if (input instanceof Element) return [input];
  return Array.from(input);
}
var UIFQuery = class _UIFQuery {
  elements;
  constructor(input, root = document) {
    this.elements = toElements(input, root);
  }
  get length() {
    return this.elements.length;
  }
  at(index) {
    return this.elements[index];
  }
  each(handler) {
    this.elements.forEach(handler);
    return this;
  }
  map(handler) {
    return this.elements.map(handler);
  }
  find(selector) {
    return new _UIFQuery(this.elements.flatMap((el) => Array.from(el.querySelectorAll(selector))));
  }
  closest(selector) {
    const matches = [];
    this.elements.forEach((el) => {
      const match = el.closest(selector);
      if (match) matches.push(match);
    });
    return new _UIFQuery(matches);
  }
  parent() {
    const parents = [];
    this.elements.forEach((el) => {
      if (el.parentElement) parents.push(el.parentElement);
    });
    return new _UIFQuery(parents);
  }
  children(selector) {
    const kids = this.elements.flatMap((el) => Array.from(el.children));
    return new _UIFQuery(selector ? kids.filter((el) => el.matches(selector)) : kids);
  }
  addClass(...names) {
    return this.each((el) => el.classList.add(...names));
  }
  removeClass(...names) {
    return this.each((el) => el.classList.remove(...names));
  }
  toggleClass(name, force) {
    return this.each((el) => el.classList.toggle(name, force));
  }
  attr(name, value) {
    if (value === void 0) return this.elements[0]?.getAttribute(name) ?? null;
    return this.each((el) => value === null ? el.removeAttribute(name) : el.setAttribute(name, value));
  }
  data(name, value) {
    const key = name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
    if (value === void 0) return this.elements[0]?.dataset[key];
    return this.each((el) => {
      const htmlEl = el;
      if (value === null) delete htmlEl.dataset[key];
      else htmlEl.dataset[key] = value;
    });
  }
  css(name, value) {
    if (value === void 0) return this.elements[0] ? getComputedStyle(this.elements[0]).getPropertyValue(name) : "";
    return this.each((el) => el.style[name] = value);
  }
  on(eventName, handler) {
    return this.each((el) => el.addEventListener(eventName, handler));
  }
  off(eventName, handler) {
    return this.each((el) => el.removeEventListener(eventName, handler));
  }
  trigger(name, detail) {
    return this.each((el) => trigger(el, name, detail));
  }
  html(value) {
    if (value === void 0) return this.elements[0]?.innerHTML ?? "";
    return this.each((el) => el.innerHTML = value);
  }
  text(value) {
    if (value === void 0) return this.elements[0]?.textContent ?? "";
    return this.each((el) => el.textContent = value);
  }
  append(content) {
    return this.each((el) => {
      if (typeof content === "string") el.insertAdjacentHTML("beforeend", content);
      else el.append(content.cloneNode(true));
    });
  }
  prepend(content) {
    return this.each((el) => {
      if (typeof content === "string") el.insertAdjacentHTML("afterbegin", content);
      else el.prepend(content.cloneNode(true));
    });
  }
  remove() {
    return this.each((el) => el.remove());
  }
  show() {
    return this.each((el) => el.hidden = false);
  }
  hide() {
    return this.each((el) => el.hidden = true);
  }
  toggle(force) {
    return this.each((el) => {
      const htmlEl = el;
      htmlEl.hidden = force === void 0 ? !htmlEl.hidden : !force;
    });
  }
};
function uif(input, root = document) {
  return new UIFQuery(input, root);
}
function ready(handler) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", handler, { once: true });
  else handler();
}
function delegate(root, eventName, selector, handler) {
  const listener = (event) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (target && root.contains(target)) handler(event, target);
  };
  root.addEventListener(eventName, listener);
  return () => root.removeEventListener(eventName, listener);
}
function trigger(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}
function serialize(form2) {
  const result = {};
  new FormData(form2).forEach((value, key) => {
    const existing = result[key];
    if (existing === void 0) result[key] = value;
    else result[key] = Array.isArray(existing) ? existing.concat(value) : [existing, value];
  });
  return result;
}
function fragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

// packages/extension-kit/src/index.ts
function createExtensionManifest(options) {
  const surfaces = options.surfaces ?? {};
  const manifest = {
    manifest_version: 3,
    name: options.name,
    version: options.version ?? "0.1.0",
    description: options.description,
    permissions: options.permissions ?? ["storage"],
    host_permissions: options.hostPermissions ?? [],
    icons: options.icons
  };
  if (surfaces.popup) manifest.action = { default_popup: surfaces.popup };
  if (surfaces.options) manifest.options_page = surfaces.options;
  if (surfaces.sidePanel) manifest.side_panel = { default_path: surfaces.sidePanel };
  if (surfaces.serviceWorker) manifest.background = { service_worker: surfaces.serviceWorker, type: "module" };
  if (surfaces.contentScript) {
    manifest.content_scripts = [
      {
        matches: options.hostPermissions?.length ? options.hostPermissions : ["<all_urls>"],
        js: [surfaces.contentScript]
      }
    ];
  }
  return manifest;
}
function isExtensionRuntime(runtime = globalThis.chrome?.runtime) {
  return Boolean(runtime && typeof runtime === "object");
}
function createExtensionMessage(type, payload, requestId = crypto.randomUUID()) {
  return { type, payload, requestId };
}

// packages/overlays/src/index.ts
var stack2 = [];
function top2() {
  return stack2[stack2.length - 1];
}
function onKey2(event) {
  if (event.key === "Escape") closeOverlay2(top2()?.el);
}
function getOverlayStack() {
  return stack2.map((entry) => entry.el);
}
async function openOverlay2(el, options = {}) {
  if (!stack2.length) document.addEventListener("keydown", onKey2);
  if (!stack2.some((entry) => entry.el === el)) stack2.push({ el, opener: options.opener ?? document.activeElement, options });
  if (options.modal) document.body.classList.add("uif-overlay-open");
  el.setAttribute("aria-hidden", "false");
  await show(el);
  el.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus();
}
async function closeOverlay2(el = top2()?.el) {
  if (!el) return;
  const index = stack2.findIndex((entry2) => entry2.el === el);
  const [entry] = index >= 0 ? stack2.splice(index, 1) : [];
  el.setAttribute("aria-hidden", "true");
  await hide(el);
  if (entry?.options.restoreFocus !== false) entry?.opener?.focus?.();
  if (!stack2.length) {
    document.removeEventListener("keydown", onKey2);
    document.body.classList.remove("uif-overlay-open");
  }
}
async function toggleOverlay2(el, options = {}) {
  if (stack2.some((entry) => entry.el === el)) await closeOverlay2(el);
  else await openOverlay2(el, options);
}
function positionOverlay2(anchor, panel, options = {}) {
  const rect = anchor.getBoundingClientRect();
  const placement = options.placement ?? "bottom-start";
  panel.style.position = "absolute";
  panel.style.top = placement.startsWith("top") ? `${rect.top + window.scrollY - panel.offsetHeight}px` : `${rect.bottom + window.scrollY}px`;
  panel.style.left = placement.endsWith("end") ? `${rect.right + window.scrollX - panel.offsetWidth}px` : `${rect.left + window.scrollX}px`;
}

// packages/net/src/index.ts
var requestInterceptors2 = [];
var responseInterceptors2 = [];
var controllers3 = /* @__PURE__ */ new Map();
var pending2 = /* @__PURE__ */ new Map();
function useRequestInterceptor(fn) {
  requestInterceptors2.push(fn);
  return () => requestInterceptors2.splice(requestInterceptors2.indexOf(fn), 1);
}
function useResponseInterceptor(fn) {
  responseInterceptors2.push(fn);
  return () => responseInterceptors2.splice(responseInterceptors2.indexOf(fn), 1);
}
async function parseResponse2(response, parseAs) {
  if (parseAs === "response") return response;
  const contentType = response.headers.get("content-type") || "";
  if (parseAs === "json" || parseAs !== "text" && contentType.includes("application/json")) {
    return response.status === 204 ? null : response.json();
  }
  return response.text();
}
function delay2(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function requestKey2(url, options) {
  return options.key || `${options.method || "GET"} ${url}`;
}
function cancelRequest2(key) {
  controllers3.get(key)?.abort();
  controllers3.delete(key);
  pending2.delete(key);
}
function withCsrf2(headers, options) {
  if (!options.csrfToken) return headers;
  return { ...headers ?? {}, [options.csrfHeader || "x-csrf-token"]: options.csrfToken };
}
async function request2(url, options = {}) {
  const key = requestKey2(url, options);
  if (options.dedupe && pending2.has(key)) return pending2.get(key);
  cancelRequest2(key);
  const controller = new AbortController();
  controllers3.set(key, controller);
  const timeout = options.timeout ? window.setTimeout(() => controller.abort(), options.timeout) : void 0;
  let req = { ...options, headers: withCsrf2(options.headers, options), signal: controller.signal };
  const runner = async () => {
    for (const interceptor of requestInterceptors2) {
      const next = await interceptor(url, req);
      if (next) req = next;
    }
    emit("uif:request", { url, options: req });
    const attempts = Math.max(0, req.retries ?? 0) + 1;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        let response = await fetch(url, req);
        for (const interceptor of responseInterceptors2) {
          const next = await interceptor(response);
          if (next) response = next;
        }
        emit("uif:response", { url, response, attempt });
        const data = await parseResponse2(response, req.parseAs);
        emit(response.ok ? "uif:success" : "uif:error", { url, response, data, attempt });
        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`);
          error.status = response.status;
          error.response = response;
          error.data = data;
          throw error;
        }
        return data;
      } catch (error) {
        lastError = error;
        if (attempt >= attempts || controller.signal.aborted) break;
        await delay2(req.retryDelay ?? 250 * attempt);
      }
    }
    emit("uif:error", { url, error: lastError });
    throw lastError;
  };
  const promise = runner().finally(() => {
    if (timeout) window.clearTimeout(timeout);
    controllers3.delete(key);
    pending2.delete(key);
    emit("uif:complete", { url, key });
  });
  pending2.set(key, promise);
  return promise;
}
function get(url, options = {}) {
  return request2(url, { ...options, method: "GET" });
}
function post(url, data, options = {}) {
  const isFormData = data instanceof FormData;
  const headers = isFormData ? options.headers : { "content-type": "application/json", ...options.headers ?? {} };
  const body = isFormData ? data : JSON.stringify(data ?? {});
  return request2(url, { ...options, method: "POST", body, headers });
}
function submitForm(formEl, options = {}) {
  const url = formEl.dataset.uifSrc || formEl.action || window.location.href;
  const method = (formEl.dataset.uifMethod || formEl.method || "POST").toUpperCase();
  return request2(url, { ...options, method, body: new FormData(formEl) });
}
function upload(url, formData, options = {}) {
  if (options.onUploadProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method ?? "POST", url);
      const headers = withCsrf2(options.headers, options);
      if (headers && !(headers instanceof Headers) && !Array.isArray(headers)) {
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, String(value)));
      }
      xhr.upload.addEventListener("progress", (event) => options.onUploadProgress?.(event.loaded, event.total));
      xhr.addEventListener("load", () => {
        try {
          resolve(JSON.parse(xhr.responseText || "null"));
        } catch {
          resolve(xhr.responseText);
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.send(formData);
    });
  }
  return request2(url, { ...options, method: options.method ?? "POST", body: formData });
}
function parseCSV(text) {
  const rows2 = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows2.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== "")) rows2.push(row);
  return rows2;
}
function csvToObjects(text) {
  const [head, ...rows2] = parseCSV(text);
  if (!head) return [];
  return rows2.map(
    (row) => head.reduce((acc, key, index) => {
      acc[key] = row[index] ?? "";
      return acc;
    }, {})
  );
}
async function loadConnector(connector, options = {}) {
  let value;
  if (connector.type === "static") {
    value = connector.data;
  } else {
    if (!connector.src) throw new Error(`Connector source is required for ${connector.type}`);
    const parseAs = connector.type === "csv" ? "text" : "auto";
    value = await request2(connector.src, {
      ...options,
      method: connector.method ?? "GET",
      headers: connector.headers ?? options.headers,
      timeout: connector.timeout ?? options.timeout,
      parseAs
    });
    if (connector.type === "csv") value = csvToObjects(String(value));
  }
  return connector.transform ? connector.transform(value) : value;
}
function bindConnector(connector, handler, options = {}) {
  let stopped = false;
  let timer;
  const load = async () => {
    const value = await loadConnector(connector, options);
    if (!stopped) await handler(value);
  };
  void load();
  if (connector.refreshInterval) timer = window.setInterval(() => void load(), connector.refreshInterval);
  return () => {
    stopped = true;
    if (timer) window.clearInterval(timer);
  };
}

// packages/router/src/index.ts
async function loadRoute(url, target, options = {}) {
  const source = options.routes?.[new URL(url, window.location.href).pathname] || url;
  const html = await request(source, { method: "GET", parseAs: "text" });
  if (target && typeof html === "string") {
    target.innerHTML = html;
    autoInit(target);
    if (options.restoreFocus !== false) target.querySelector("[tabindex],a,button,input,select,textarea")?.focus();
  }
  if (options.restoreScroll !== false && !navigator.userAgent.includes("jsdom")) {
    try {
      window.scrollTo({ top: 0 });
    } catch {
    }
  }
  options.afterNavigate?.(new URL(source, window.location.href), target);
}
function updateActiveLinks(root, activeClass) {
  root.querySelectorAll('a[data-uif="route"]').forEach((link) => {
    const active = link.href === window.location.href;
    link.classList.toggle(activeClass, active);
    link.setAttribute("aria-current", active ? "page" : "false");
  });
}
function initRouter(root = document, options = {}) {
  const defaultTarget = options.target ? document.querySelector(options.target) : null;
  const activeClass = options.activeClass || "is-active";
  updateActiveLinks(root, activeClass);
  root.addEventListener("click", async (event) => {
    const mouseEvent = event;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.metaKey || mouseEvent.ctrlKey) return;
    const url = new URL(link.href);
    const allowed = await options.beforeNavigate?.(url);
    if (allowed === false) return;
    event.preventDefault();
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
    history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, "", link.href);
  });
  window.addEventListener("popstate", (event) => {
    const targetExpr = event.state?.uifTarget || options.target;
    const routeTarget = targetExpr ? document.querySelector(targetExpr) : defaultTarget;
    void loadRoute(window.location.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
  });
}

// packages/state/src/index.ts
function getByPath(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") return acc[part];
    return void 0;
  }, obj);
}
function setByPath(obj, path, value) {
  const parts = path.split(".");
  const leaf = parts.pop();
  if (!leaf) return;
  let ref = obj;
  for (const part of parts) {
    if (typeof ref[part] !== "object" || ref[part] === null) ref[part] = {};
    ref = ref[part];
  }
  ref[leaf] = value;
}
function createStore(initialState) {
  return createAdvancedStore(initialState);
}
function createAdvancedStore(initialState, options = {}) {
  const storage = options.persist === "local" ? window.localStorage : options.persist === "session" ? window.sessionStorage : void 0;
  const persisted = storage && options.key ? storage.getItem(options.key) : null;
  let state = persisted ? JSON.parse(persisted) : structuredClone(initialState);
  const subscribers = /* @__PURE__ */ new Map();
  const notify2 = (path) => {
    if (storage && options.key) storage.setItem(options.key, JSON.stringify(state));
    subscribers.get(path)?.forEach((fn) => fn(getByPath(state, path)));
    if (path !== "*") subscribers.get("*")?.forEach((fn) => fn(state));
  };
  const nextState = () => options.immutable ? structuredClone(state) : state;
  const api = {
    get(path) {
      if (path && options.computed?.[path]) return options.computed[path](state);
      return path ? getByPath(state, path) : state;
    },
    replace(next) {
      state = structuredClone(next);
      notify2("*");
    },
    set(path, value) {
      state = nextState();
      setByPath(state, path, value);
      notify2(path);
    },
    update(path, updater) {
      this.set(path, updater(getByPath(state, path)));
    },
    push(path, value) {
      const list = getByPath(state, path);
      this.set(path, [...Array.isArray(list) ? list : [], value]);
    },
    removeAt(path, index) {
      const list = getByPath(state, path);
      if (!Array.isArray(list)) return;
      this.set(
        path,
        list.filter((_, i) => i !== index)
      );
    },
    subscribe(pathOrHandler, handler) {
      const path = typeof pathOrHandler === "string" ? pathOrHandler : "*";
      const cb = typeof pathOrHandler === "string" ? handler : pathOrHandler;
      if (!cb) return () => void 0;
      if (!subscribers.has(path)) subscribers.set(path, /* @__PURE__ */ new Set());
      subscribers.get(path)?.add(cb);
      return () => subscribers.get(path)?.delete(cb);
    },
    bind(root = document) {
      root.querySelectorAll("[data-uif-model]").forEach((el) => {
        const path = el.dataset.uifModel;
        if (!path) return;
        el.addEventListener("input", () => this.set(path, el.value));
      });
      root.querySelectorAll("[data-uif-bind]").forEach((el) => {
        const path = el.dataset.uifBind;
        if (!path) return;
        this.subscribe(path, (value) => {
          el.textContent = String(value ?? "");
        });
        el.textContent = String(this.get(path) ?? "");
      });
    },
    destroy() {
      subscribers.clear();
    }
  };
  return api;
}
function createMicroAppStore(initialState, options = {}) {
  const base = createAdvancedStore(initialState, { ...options, immutable: true });
  const historyLimit = Math.max(1, options.historyLimit ?? 50);
  const past = [];
  const future = [];
  const snapshot = () => structuredClone(base.get());
  const remember = () => {
    past.push(snapshot());
    if (past.length > historyLimit) past.shift();
    future.length = 0;
  };
  return {
    ...base,
    set(path, value) {
      remember();
      base.set(path, value);
    },
    update(path, updater) {
      remember();
      base.set(path, updater(base.get(path)));
    },
    push(path, value) {
      remember();
      base.push(path, value);
    },
    removeAt(path, index) {
      remember();
      base.removeAt(path, index);
    },
    reset() {
      remember();
      base.replace(structuredClone(initialState));
    },
    exportJSON(space = 2) {
      return JSON.stringify(base.get(), null, space);
    },
    importJSON(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Micro App state must be a JSON object");
      remember();
      base.replace(parsed);
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    undo() {
      const previous = past.pop();
      if (!previous) return false;
      future.push(snapshot());
      base.replace(previous);
      return true;
    },
    redo() {
      const next = future.pop();
      if (!next) return false;
      past.push(snapshot());
      base.replace(next);
      return true;
    }
  };
}
function createArtifactStore(initialState, options = {}) {
  return createMicroAppStore(initialState, options);
}
function makeScopedKey(namespace, key) {
  return `${namespace}:${key}`;
}
function stripScope(namespace, key) {
  return key.startsWith(`${namespace}:`) ? key.slice(namespace.length + 1) : key;
}
function makeMemoryStorage() {
  const map = /* @__PURE__ */ new Map();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    }
  };
}
function createLocalStore(options = {}) {
  const namespace = options.namespace || "uif";
  const storage = options.driver === "memory" ? makeMemoryStorage() : window.localStorage;
  const api = {
    namespace,
    async get(key) {
      const raw = storage.getItem(makeScopedKey(namespace, key));
      return raw === null ? void 0 : JSON.parse(raw);
    },
    async set(key, value) {
      storage.setItem(makeScopedKey(namespace, key), JSON.stringify(value));
    },
    async delete(key) {
      storage.removeItem(makeScopedKey(namespace, key));
    },
    async list() {
      const items = [];
      for (let index = 0; index < storage.length; index += 1) {
        const scopedKey = storage.key(index);
        if (!scopedKey?.startsWith(`${namespace}:`)) continue;
        const raw = storage.getItem(scopedKey);
        if (raw === null) continue;
        items.push({ key: stripScope(namespace, scopedKey), value: JSON.parse(raw) });
      }
      return items;
    },
    async clear() {
      const keys = await api.list();
      keys.forEach((item) => storage.removeItem(makeScopedKey(namespace, item.key)));
    },
    async exportJSON(space = 2) {
      const entries = await api.list();
      return JSON.stringify(
        entries.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {}),
        null,
        space
      );
    },
    async importJSON(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Local store import must be a JSON object");
      await api.clear();
      await Promise.all(Object.entries(parsed).map(([key, value]) => api.set(key, value)));
    }
  };
  return api;
}
function id(prefix = "sync") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function createSyncQueue(store, key = "sync-queue") {
  const read = async () => await store.get(key) ?? [];
  const write = (items) => store.set(key, items);
  return {
    async enqueue(action, payload, itemId = id()) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const item = { id: itemId, action, payload, status: "queued", attempts: 0, createdAt: now, updatedAt: now };
      await write([...await read(), item]);
      return item;
    },
    async list(status) {
      const items = await read();
      return status ? items.filter((item) => item.status === status) : items;
    },
    async update(itemId, patch) {
      const items = await read();
      const index = items.findIndex((item) => item.id === itemId);
      if (index < 0) throw new Error(`Sync queue item not found: ${itemId}`);
      const next = { ...items[index], ...patch, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      items[index] = next;
      await write(items);
      return next;
    },
    async remove(itemId) {
      await write((await read()).filter((item) => item.id !== itemId));
    },
    async clear(status) {
      await write(status ? (await read()).filter((item) => item.status !== status) : []);
    },
    async exportJSON(space = 2) {
      return JSON.stringify(await read(), null, space);
    },
    async importJSON(json) {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Sync queue import must be a JSON array");
      await write(parsed);
    }
  };
}

// index.ts
var apps = /* @__PURE__ */ new WeakMap();
function hydrate(root, disposers) {
  mountIcons(root);
  disposers.add(bindActions(root));
  disposers.add(initAll(root));
  disposers.add(bindRadActions(root));
  initDeclarativeFilters(root);
  disposers.add(bindChartExports(root));
  root.querySelectorAll("[data-uif]").forEach((el) => {
    const type = el.dataset.uif;
    if (type === "table" && el.tagName === "TABLE") initTable(el);
    if (type === "form" && el.tagName === "FORM") initForm(el);
    if (type === "editor") initEditor(el);
    if (type === "animate") initAnimation(el);
    if (type === "chart") initChart(el);
    if (type === "dashboard") initDashboard(el);
    if (type === "desktop-shell") disposers.add(initDesktopShell(el));
    if (type === "realtime") initRealtime(el);
    if (type === "push") initPush(el);
    if (type === "mobile-shell") initMobileShell(el);
    if (type === "ai-action") renderAIAction(el);
    if (type === "tool-approval") renderToolApproval(el);
    if (type === "install-prompt") initInstallPrompt(el);
  });
}
function start(root = document) {
  const existing = apps.get(root);
  if (existing) {
    existing.refresh(root);
    return existing;
  }
  const disposers = /* @__PURE__ */ new Set();
  const app = {
    root,
    refresh(target = root) {
      hydrate(target, disposers);
    },
    destroy() {
      disposers.forEach((dispose) => dispose());
      disposers.clear();
      apps.delete(root);
    }
  };
  apps.set(root, app);
  app.refresh(root);
  return app;
}
function autoStart(root = document) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => start(root), { once: true });
  else start(root);
}
export {
  UIFQuery,
  accordion,
  adaptRecords,
  adaptTable,
  addNotification,
  aiAction,
  alert,
  animate2 as animate,
  animateGroup,
  animationPresets2 as animationPresets,
  appendStreamingChunk,
  appendTextElement2 as appendTextElement,
  applyDashboardFilters,
  applyPermissionNavigation,
  applyResponsiveColumns,
  autoInit2 as autoInit,
  autoStart,
  badge,
  bindActions,
  bindChartExports,
  bindConnector,
  bindDesktopOfflineIndicator,
  bindDesktopSettings,
  bindRadActions,
  bindRealtime,
  breadcrumb,
  button,
  cacheStrategies,
  canUseDesktopAction,
  cancelAnimation,
  cancelRequest2 as cancelRequest,
  card,
  chart,
  cleanEditorHtml,
  clearActionDiagnostics,
  clearErrors,
  closeOverlay2 as closeOverlay,
  closest,
  collapse2 as collapse,
  collapseComponent,
  combobox,
  commandMenu,
  connect,
  correlation,
  createAdvancedStore,
  createArtifactStore,
  createCacheStrategy,
  createDashboardConfig,
  createDesktopManifest,
  createDesktopShell,
  createDesktopSyncStatus,
  createEditor,
  createExtensionManifest,
  createExtensionMessage,
  createLocalSettingsStore,
  createLocalStore,
  createMemorySettingsStore,
  createMicroAppStore,
  createStore,
  createStreamSurface,
  createSyncQueue,
  createWorkspaceSession,
  csvToObjects,
  cumulativeSum,
  dataTable,
  delegate,
  destroyChart,
  destroyComponent,
  detectDesktopPlatform,
  disconnect,
  dispatchAction,
  dispatchActions,
  downloadChartPng,
  downloadChartSvg,
  drawer,
  dropdown,
  emit2 as emit,
  escapeHtml,
  expand2 as expand,
  exportChartData,
  exportChartPng,
  exportChartSvg,
  exportTable,
  fileUpload,
  filterElements,
  filterTable,
  flushOfflineQueue,
  form,
  formatEditor,
  fragment,
  get,
  getActionDiagnostics,
  getConnectionState,
  getEditorValue,
  getNotifications,
  getOverlayStack,
  getPresence,
  getPushSubscription,
  hasDesktopCapability,
  hasIcon,
  hide2 as hide,
  histogramBins,
  htmlToMarkdown,
  icon,
  iconElement,
  icons,
  init,
  initAll,
  initAnimation,
  initAnimationTriggers,
  initChart,
  initComponent,
  initDashboard,
  initDeclarativeFilters,
  initDesktopShell,
  initEditor,
  initForm,
  initInstallPrompt,
  initMobileShell,
  initOfflineQueue,
  initPullToRefresh,
  initPush,
  initRealtime,
  initRepeatableGroup,
  initRouter,
  initSegmentedControl,
  initSheetModal,
  initSwipeAction,
  initTable,
  isExtensionRuntime,
  isInitialized,
  linearRegression,
  loadConnector,
  loadPartial,
  loadRemoteTable,
  markNotificationsRead,
  markdownToHtml,
  mobileShell,
  modal,
  mount2 as mount,
  mountIcons,
  movingAverage,
  nav,
  navbar,
  observe,
  observeMotion,
  offcanvas,
  on,
  onAppUpdate,
  onNetworkChange,
  onOffline,
  onOnline,
  openOverlay2 as openOverlay,
  pagination,
  parseActionSpec,
  parseCSV,
  parseChartData,
  parseDesktopManifestElement,
  parseMicroAppManifest,
  parseOptions2 as parseOptions,
  percentChange,
  popover,
  positionOverlay2 as positionOverlay,
  post,
  progress,
  publishBatched,
  publishLocal,
  push,
  qs,
  qsa2 as qsa,
  quantile,
  queryEditorCommand,
  queueOfflineTask,
  ready,
  realtime,
  refreshChart,
  registerAction,
  registerAsyncRule,
  registerComponent,
  registerEditorCommand,
  registerEditorHook,
  registerIcon,
  registerPlugin,
  registerPushServiceWorker,
  registerServiceWorker,
  rehydrate,
  removePresence,
  renderAIAction,
  renderAIResultCard,
  renderAssistantResponse,
  renderChart,
  renderDashboard,
  renderDashboardWidget,
  renderDesktopShell,
  renderDesktopSyncStatus,
  renderDiff,
  renderPromptPanel,
  renderToolApproval,
  renderToolAuditTrail,
  renderToolProgress,
  renderToolResult,
  renderToolTimeline,
  renderWorkspaceIdentity,
  request2 as request,
  requestNotificationPermission,
  resolveActionTarget,
  resolveTarget2 as resolveTarget,
  runEditorCommand,
  selectedRows,
  sequence,
  serialize,
  setAccent,
  setDensity,
  setDesktopStatus,
  setEditorPreviewLayout,
  setEditorValue,
  setTableState,
  setText2 as setText,
  setTrustedHTML2 as setTrustedHTML,
  setupInstallPrompt,
  show2 as show,
  showErrorSummary,
  showErrors,
  showInAppNotification,
  showOfflineBanner,
  showToast,
  sidebar,
  skeleton,
  sortTable,
  spinner,
  stagger,
  start,
  stepper,
  submitForm,
  subscribe,
  subscribeToPush,
  summarizeDashboard,
  summarizeDesktopQueue,
  summaryStats,
  swapContent,
  swapTrustedHTML2 as swapTrustedHTML,
  table,
  tabs,
  timeline,
  toast,
  toggle2 as toggle,
  toggleOverlay2 as toggleOverlay,
  toolApproval,
  tooltip,
  transition2 as transition,
  trigger,
  uif,
  uifActions,
  uifAttributes,
  uifStates,
  uifValues,
  unmount,
  unreadCount,
  unregisterAction,
  unregisterEditorCommand,
  unregisterServiceWorker,
  unsubscribeFromPush,
  updatePresence,
  upload,
  useRequestInterceptor,
  useResponseInterceptor,
  validateDesktopManifest,
  validateEditor,
  validateField,
  validateForm,
  validateFormAsync,
  validateMicroAppManifest,
  wizard,
  zScores
};
