// src/index.ts
import { hide, show } from "@batoi/uif-effects";
var stack = [];
var opening = /* @__PURE__ */ new WeakSet();
var closing = /* @__PURE__ */ new WeakSet();
var backgroundState = /* @__PURE__ */ new Map();
function top() {
  return stack[stack.length - 1];
}
function onKey(event) {
  const entry = top();
  if (event.key === "Escape" && entry && entry.options.closeOnEscape !== false) closeOverlay(entry.el);
}
function emitOverlay(type, entry) {
  entry.el.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      detail: { el: entry.el, opener: entry.opener, options: entry.options, stack: getOverlayStack() }
    })
  );
}
function syncOverlayState() {
  const activeModal = stack.some((entry) => entry.options.modal);
  const inertBackground = stack.some((entry) => entry.options.modal && entry.options.inert !== false);
  document.body.classList.toggle("uif-overlay-open", activeModal);
  const protectedElements = /* @__PURE__ */ new Set();
  stack.forEach((entry) => {
    let node = entry.el;
    while (node && node !== document.body) {
      protectedElements.add(node);
      node = node.parentElement;
    }
  });
  const nextInert = /* @__PURE__ */ new Set();
  if (inertBackground) {
    stack.forEach((entry) => {
      if (!entry.options.modal || entry.options.inert === false) return;
      let node = entry.el;
      while (node && node !== document.body) {
        const parent = node.parentElement;
        if (!parent) break;
        Array.from(parent.children).forEach((child) => {
          if (child instanceof HTMLElement && !protectedElements.has(child)) nextInert.add(child);
        });
        node = parent;
      }
    });
  }
  backgroundState.forEach((state, node) => {
    if (nextInert.has(node)) return;
    node.inert = state.inert;
    node.toggleAttribute("inert", state.inertAttribute);
    if (state.ariaHidden === null) node.removeAttribute("aria-hidden");
    else node.setAttribute("aria-hidden", state.ariaHidden);
    backgroundState.delete(node);
  });
  nextInert.forEach((node) => {
    if (!backgroundState.has(node)) {
      backgroundState.set(node, {
        inert: node.inert,
        inertAttribute: node.hasAttribute("inert"),
        ariaHidden: node.getAttribute("aria-hidden")
      });
    }
    node.inert = true;
    node.setAttribute("inert", "");
    node.setAttribute("aria-hidden", "true");
  });
}
function getOverlayStack() {
  return stack.map((entry) => entry.el);
}
async function openOverlay(el, options = {}) {
  if (opening.has(el) || stack.some((entry2) => entry2.el === el)) return;
  opening.add(el);
  if (!stack.length) document.addEventListener("keydown", onKey);
  const entry = { el, opener: options.opener ?? document.activeElement, options };
  stack.push(entry);
  emitOverlay("uif:overlay-open", entry);
  syncOverlayState();
  el.setAttribute("aria-hidden", "false");
  try {
    await show(el);
  } finally {
    opening.delete(el);
  }
  el.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')?.focus();
  emitOverlay("uif:overlay-opened", entry);
}
async function closeOverlay(el = top()?.el) {
  if (!el) return;
  if (closing.has(el)) return;
  const index = stack.findIndex((entry2) => entry2.el === el);
  const [entry] = index >= 0 ? stack.splice(index, 1) : [];
  if (!entry) return;
  closing.add(el);
  emitOverlay("uif:overlay-close", entry);
  el.setAttribute("aria-hidden", "true");
  syncOverlayState();
  try {
    await hide(el);
  } finally {
    closing.delete(el);
  }
  if (entry?.options.restoreFocus !== false) entry?.opener?.focus?.();
  if (!stack.length) {
    document.removeEventListener("keydown", onKey);
  }
  emitOverlay("uif:overlay-closed", entry);
}
async function toggleOverlay(el, options = {}) {
  if (stack.some((entry) => entry.el === el)) await closeOverlay(el);
  else await openOverlay(el, options);
}
function positionOverlay(anchor, panel, options = {}) {
  const rect = anchor.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const panelWidth = panel.offsetWidth || panelRect.width;
  const panelHeight = panel.offsetHeight || panelRect.height;
  const offset = options.offset ?? 0;
  let placement = options.placement ?? "bottom-start";
  if (placement === "auto") placement = rect.bottom + panelHeight + offset <= window.innerHeight ? "bottom-start" : "top-start";
  let topValue = rect.bottom + offset;
  let leftValue = rect.left;
  if (placement.startsWith("top")) topValue = rect.top - panelHeight - offset;
  if (placement.startsWith("left")) {
    topValue = rect.top;
    leftValue = rect.left - panelWidth - offset;
  }
  if (placement.startsWith("right")) {
    topValue = rect.top;
    leftValue = rect.right + offset;
  }
  if (placement.endsWith("end")) {
    if (placement.startsWith("top") || placement.startsWith("bottom")) leftValue = rect.right - panelWidth;
    else topValue = rect.bottom - panelHeight;
  }
  if (placement.startsWith("bottom") && topValue + panelHeight > window.innerHeight) {
    placement = placement.replace("bottom", "top");
    topValue = rect.top - panelHeight - offset;
  } else if (placement.startsWith("top") && topValue < 0) {
    placement = placement.replace("top", "bottom");
    topValue = rect.bottom + offset;
  }
  if (placement.startsWith("right") && leftValue + panelWidth > window.innerWidth) {
    placement = placement.replace("right", "left");
    leftValue = rect.left - panelWidth - offset;
  } else if (placement.startsWith("left") && leftValue < 0) {
    placement = placement.replace("left", "right");
    leftValue = rect.right + offset;
  }
  const margin = 8;
  const maxLeft = Math.max(margin, window.innerWidth - panelWidth - margin);
  const maxTop = Math.max(margin, window.innerHeight - panelHeight - margin);
  panel.style.position = "fixed";
  panel.style.top = `${Math.min(Math.max(topValue, margin), maxTop)}px`;
  panel.style.left = `${Math.min(Math.max(leftValue, margin), maxLeft)}px`;
  panel.dataset.uifPlacement = placement;
}
export {
  closeOverlay,
  getOverlayStack,
  openOverlay,
  positionOverlay,
  toggleOverlay
};
