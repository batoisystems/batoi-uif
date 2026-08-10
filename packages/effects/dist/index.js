// src/index.ts
import { getCompatibilityMode, parseUIFJSON } from "@batoi/uif-core";
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
async function sequence(steps, options = {}) {
  for (const step of steps) await animate(step.el, step.animation, { ...options, ...step.options });
}
async function timeline(steps, options = {}) {
  await sequence(steps, options);
}
async function stagger(elements, animation, options = {}) {
  const delay = options.delay ?? 60;
  await Promise.all([...elements].map((el, index) => animate(el, animation, { ...options, delay: delay * index })));
}
async function animateGroup(root, selector, animation, options = {}) {
  await stagger(root.querySelectorAll(selector), animation, options);
}
function cancelAnimation(el) {
  activeAnimations.delete(el);
  el.classList.remove("uif-is-animating");
  [...el.classList].filter((name) => name.startsWith("uif-animate-")).forEach((name) => el.classList.remove(name));
  el.style.animationDuration = "";
  el.style.animationTimingFunction = "";
  el.style.animationIterationCount = "";
  el.style.animationDirection = "";
  el.style.animationFillMode = "";
}
var animationControllers = /* @__PURE__ */ new WeakMap();
function initAnimation(el) {
  const existing = animationControllers.get(el);
  if (existing) return existing;
  const animation = el.dataset.uifAnimation || "fade-in";
  const duration = Number(el.dataset.uifDuration || "") || void 0;
  const delay = Number(el.dataset.uifDelay || "") || void 0;
  const repeat = Number(el.dataset.uifRepeat || "") || void 0;
  const easing = el.dataset.uifEasing || void 0;
  const once = el.dataset.uifOnce !== "false";
  const trigger = el.dataset.uifTrigger || "load";
  let hasRun = false;
  const run = () => {
    if (once && hasRun) return;
    hasRun = true;
    void animate(el, animation, { duration, delay, repeat, easing, once });
  };
  let observer = null;
  let eventName = null;
  if (trigger === "load") run();
  if (trigger === "hover") {
    eventName = "mouseenter";
    el.addEventListener(eventName, run);
  }
  if (trigger === "focus") {
    eventName = "focusin";
    el.addEventListener(eventName, run);
  }
  if (trigger === "click") {
    eventName = "click";
    el.addEventListener(eventName, run);
  }
  if (trigger === "intersect" && "IntersectionObserver" in window) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        intersectionObserver.disconnect();
      }
    });
    observer = intersectionObserver;
    intersectionObserver.observe(el);
  }
  const controller = {
    refresh() {
      hasRun = false;
      run();
    },
    destroy() {
      if (eventName) el.removeEventListener(eventName, run);
      observer?.disconnect();
      cancelAnimation(el);
      if (animationControllers.get(el) === controller) animationControllers.delete(el);
    }
  };
  animationControllers.set(el, controller);
  return controller;
}
function initAnimationTriggers(root = document) {
  const controllers = [...root.querySelectorAll('[data-uif="animate"]')].map(initAnimation);
  return () => controllers.forEach((controller) => controller.destroy());
}
var typedTextControllers = /* @__PURE__ */ new WeakMap();
function typedTextStrings(el, options) {
  if (options.strings?.length) return options.strings.map(String).filter(Boolean);
  const raw = el.dataset.uifStrings;
  if (raw) {
    const result = parseUIFJSON(raw, { shape: "array", limits: { maxItems: 100, maxCharacters: 1e4, maxBytes: 2e4, maxDepth: 2, maxKeys: 100 } });
    if (result.valid && result.value) return result.value.map(String).filter(Boolean);
    if (getCompatibilityMode() !== "v3") return raw.split("|").map((value) => value.trim()).filter(Boolean);
  }
  return el.textContent ? [el.textContent] : [];
}
function nonNegative(value, fallback) {
  return Number.isFinite(value) && value !== void 0 ? Math.max(0, value) : fallback;
}
function initTypedText(el, options = {}) {
  const existing = typedTextControllers.get(el);
  if (existing) return existing;
  const strings = typedTextStrings(el, options);
  const typeSpeed = nonNegative(options.typeSpeed ?? Number(el.dataset.uifTypeSpeed), 55);
  const deleteSpeed = nonNegative(options.deleteSpeed ?? Number(el.dataset.uifDeleteSpeed), 30);
  const pause = nonNegative(options.pause ?? Number(el.dataset.uifPause), 1200);
  const startDelay = nonNegative(options.startDelay ?? Number(el.dataset.uifStartDelay), 0);
  const loop = options.loop ?? el.dataset.uifLoop !== "false";
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  let timer;
  let destroyed = false;
  el.classList.add("uif-typed-text");
  el.setAttribute("aria-live", "off");
  const schedule = (callback, delay) => {
    timer = window.setTimeout(callback, delay);
  };
  const render = () => {
    if (destroyed || !strings.length) return;
    const phrase = strings[phraseIndex] ?? "";
    el.textContent = phrase.slice(0, characterIndex);
    if (!deleting && characterIndex < phrase.length) {
      characterIndex += 1;
      schedule(render, typeSpeed);
      return;
    }
    if (!deleting) {
      el.setAttribute("aria-label", phrase);
      const isLastPhrase = phraseIndex === strings.length - 1;
      if (!loop && isLastPhrase) return;
      deleting = true;
      schedule(render, pause);
      return;
    }
    if (characterIndex > 0) {
      characterIndex -= 1;
      schedule(render, deleteSpeed);
      return;
    }
    deleting = false;
    phraseIndex = (phraseIndex + 1) % strings.length;
    schedule(render, typeSpeed);
  };
  const restart = () => {
    if (timer !== void 0) window.clearTimeout(timer);
    destroyed = false;
    phraseIndex = 0;
    characterIndex = 0;
    deleting = false;
    if (!strings.length) return;
    if (prefersReducedMotion()) {
      el.textContent = strings[0] ?? "";
      el.setAttribute("aria-label", strings[0] ?? "");
      return;
    }
    schedule(render, startDelay);
  };
  const controller = {
    refresh: restart,
    destroy() {
      destroyed = true;
      if (timer !== void 0) window.clearTimeout(timer);
      timer = void 0;
      el.classList.remove("uif-typed-text");
      el.removeAttribute("aria-live");
      if (typedTextControllers.get(el) === controller) typedTextControllers.delete(el);
    }
  };
  typedTextControllers.set(el, controller);
  restart();
  return controller;
}
function observeMotion(root = document.documentElement) {
  root.dataset.uifMotion = prefersReducedMotion() ? "reduce" : "safe";
}
export {
  animate,
  animateGroup,
  animationPresets,
  cancelAnimation,
  collapse,
  expand,
  hide,
  initAnimation,
  initAnimationTriggers,
  initTypedText,
  observeMotion,
  sequence,
  show,
  stagger,
  timeline,
  toggle,
  transition
};
