// src/index.ts
var initialized = /* @__PURE__ */ new WeakMap();
var registry = /* @__PURE__ */ new Map();
function registerComponent(nameOrComponent, component) {
  const entry = typeof nameOrComponent === "string" ? { name: nameOrComponent, ...component } : nameOrComponent;
  registry.set(entry.name, entry);
}
function qs(selector, root = document) {
  return root.querySelector(selector);
}
function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}
function closest(el, selector) {
  return el.closest(selector);
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
function unmount(root = document) {
  candidates(root).forEach((el) => {
    const component = initialized.get(el);
    component?.destroy?.(el);
    initialized.delete(el);
  });
}
function autoInit(root = document) {
  mount(root);
}
function observe(root = document.body) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) autoInit(node);
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
  return initialized.has(el);
}
export {
  appendTextElement,
  autoInit,
  closest,
  isInitialized,
  mount,
  observe,
  qs,
  qsa,
  registerComponent,
  resolveTarget,
  setText,
  setTrustedHTML,
  swapTrustedHTML,
  unmount
};
