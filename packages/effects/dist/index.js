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
export {
  collapse,
  expand,
  hide,
  show,
  toggle,
  transition
};
