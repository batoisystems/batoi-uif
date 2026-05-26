// src/index.ts
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
  el.classList.add("uif-is-animating", className);
  await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 220));
  el.classList.remove("uif-is-animating", className);
}
async function sequence(steps, options = {}) {
  for (const step of steps) await animate(step.el, step.animation, { ...options, ...step.options });
}
async function stagger(elements, animation, options = {}) {
  const delay = options.delay ?? 60;
  await Promise.all([...elements].map((el, index) => animate(el, animation, { ...options, delay: delay * index })));
}
function initAnimation(el) {
  const animation = el.dataset.uifAnimation || "fade-in";
  const duration = Number(el.dataset.uifDuration || "") || void 0;
  const delay = Number(el.dataset.uifDelay || "") || void 0;
  const trigger = el.dataset.uifTrigger || "load";
  const run = () => void animate(el, animation, { duration, delay });
  if (trigger === "load") run();
  if (trigger === "hover") {
    el.addEventListener("mouseenter", run);
    return;
  }
  if (trigger === "focus") {
    el.addEventListener("focusin", run);
    return;
  }
  if (trigger === "click") {
    el.addEventListener("click", run);
    return;
  }
  if (trigger === "intersect" && "IntersectionObserver" in window) {
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
  root.dataset.uifMotion = prefersReducedMotion() ? "reduce" : "safe";
}
export {
  animate,
  collapse,
  expand,
  hide,
  initAnimation,
  initAnimationTriggers,
  observeMotion,
  sequence,
  show,
  stagger,
  toggle,
  transition
};
