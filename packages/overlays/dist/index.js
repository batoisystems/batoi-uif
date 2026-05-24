// src/index.ts
import { hide, show } from "@batoi/uif-effects";
var stack = [];
function top() {
  return stack[stack.length - 1];
}
function onKey(event) {
  if (event.key === "Escape") closeOverlay(top()?.el);
}
function getOverlayStack() {
  return stack.map((entry) => entry.el);
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
export {
  closeOverlay,
  getOverlayStack,
  openOverlay,
  positionOverlay,
  toggleOverlay
};
