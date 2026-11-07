// src/index.ts
import { cancelAnimation, hide, show } from "@batoi/uif-effects";
var stack = [];
var operations = /* @__PURE__ */ new WeakMap();
var closing = /* @__PURE__ */ new WeakMap();
var destroying = /* @__PURE__ */ new WeakSet();
var backgroundState = /* @__PURE__ */ new Map();
function top() {
  return stack[stack.length - 1];
}
function onKey(event) {
  if (event.defaultPrevented) return;
  const entry = top();
  if (event.key === "Escape" && entry && entry.options.closeOnEscape !== false) {
    event.preventDefault();
    void closeOverlay(entry.el);
  }
  if (event.key === "Tab" && entry?.options.modal) {
    const candidates = focusableElements(entry.el);
    const first = candidates[0];
    const last = candidates.at(-1);
    if (!first || !last) {
      event.preventDefault();
      focusOverlay(entry.el);
    } else if (!candidates.includes(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
function isAvailable(el) {
  if (!el.isConnected || el.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
  for (let node = el; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
  }
  return true;
}
function focusableElements(el) {
  return [...el.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,[tabindex],[contenteditable="true"]')].filter((candidate) => candidate.tabIndex >= 0 && !candidate.matches(":disabled") && isAvailable(candidate));
}
function focusOverlay(el) {
  const first = focusableElements(el)[0];
  if (first) {
    first.focus();
    return;
  }
  const dialog = el.querySelector('[data-uif-role="dialog"]') ?? el;
  if (!isAvailable(dialog)) return;
  if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
  dialog.focus();
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
  document.body.classList.toggle("uif-modal-open", stack.some((entry) => entry.el.dataset.uif === "modal"));
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
  if (destroying.has(el) || stack.some((entry2) => entry2.el === el)) return;
  const operation = /* @__PURE__ */ Symbol("open");
  operations.set(el, operation);
  closing.delete(el);
  if (!stack.length) document.addEventListener("keydown", onKey);
  const entry = { el, opener: options.opener ?? document.activeElement, options };
  stack.push(entry);
  el.setAttribute("aria-hidden", "false");
  const pending = show(el);
  syncOverlayState();
  if (top() === entry) focusOverlay(el);
  emitOverlay("uif:overlay-open", entry);
  await pending;
  if (operations.get(el) !== operation || !stack.includes(entry)) return;
  emitOverlay("uif:overlay-opened", entry);
}
async function closeOverlay(el = top()?.el) {
  if (!el) return;
  const descendants = stack.filter((entry2) => entry2.el !== el && el.contains(entry2.el)).reverse();
  const pendingChildren = descendants.map((entry2) => closeOverlay(entry2.el));
  const index = stack.findIndex((entry2) => entry2.el === el);
  const wasTop = top()?.el === el;
  const [entry] = index >= 0 ? stack.splice(index, 1) : [];
  if (!entry) return;
  const operation = /* @__PURE__ */ Symbol("close");
  operations.set(el, operation);
  closing.set(el, entry);
  el.setAttribute("aria-hidden", "true");
  const pending = hide(el);
  syncOverlayState();
  if (!stack.length) document.removeEventListener("keydown", onKey);
  emitOverlay("uif:overlay-close", entry);
  await Promise.all([pending, ...pendingChildren]);
  if (operations.get(el) !== operation) return;
  closing.delete(el);
  operations.delete(el);
  const opener = entry.opener;
  if (wasTop && entry.options.restoreFocus !== false && opener && isAvailable(opener) && (!top() || top()?.el.contains(opener))) opener.focus();
  emitOverlay("uif:overlay-closed", entry);
}
function destroyOverlay(el) {
  if (destroying.has(el)) return;
  destroying.add(el);
  try {
    stack.filter((entry2) => entry2.el !== el && el.contains(entry2.el)).reverse().forEach((entry2) => destroyOverlay(entry2.el));
    const index = stack.findIndex((entry2) => entry2.el === el);
    const entry = index >= 0 ? stack.splice(index, 1)[0] : closing.get(el);
    operations.delete(el);
    closing.delete(el);
    cancelAnimation(el);
    if (entry && index >= 0) emitOverlay("uif:overlay-close", entry);
    el.hidden = true;
    el.dataset.uifState = "closed";
    el.classList.remove("uif-is-visible");
    el.setAttribute("aria-hidden", "true");
    syncOverlayState();
    if (!stack.length) document.removeEventListener("keydown", onKey);
    if (entry) emitOverlay("uif:overlay-closed", entry);
  } finally {
    destroying.delete(el);
  }
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
  destroyOverlay,
  getOverlayStack,
  openOverlay,
  positionOverlay,
  toggleOverlay
};
