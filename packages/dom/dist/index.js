// src/index.ts
var initialized = /* @__PURE__ */ new WeakMap();
var registry = /* @__PURE__ */ new Map();
var blockedSafeHTMLTags = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "BASE"]);
var defaultSafeHTMLAttributes = /* @__PURE__ */ new Set([
  "aria-describedby",
  "aria-label",
  "aria-labelledby",
  "aria-live",
  "class",
  "data-uif",
  "data-uif-action",
  "data-uif-icon",
  "data-uif-message",
  "data-uif-role",
  "data-uif-target",
  "hidden",
  "href",
  "id",
  "role",
  "title",
  "type"
]);
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
function isSafeURL(value) {
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized.startsWith("#") || normalized.startsWith("/") || normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("mailto:") || normalized.startsWith("tel:");
}
function cleanSafeHTMLNode(node, options) {
  if (!(node instanceof Element)) return;
  const tagName = node.tagName.toUpperCase();
  if (blockedSafeHTMLTags.has(tagName) || !options.allowedTags.includes(tagName.toLowerCase())) {
    node.remove();
    return;
  }
  Array.from(node.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;
    if (name.startsWith("on") || !options.allowedAttributes.includes(name)) {
      node.removeAttribute(attribute.name);
      return;
    }
    if ((name === "href" || name === "src") && !isSafeURL(value)) {
      node.removeAttribute(attribute.name);
    }
  });
  Array.from(node.childNodes).forEach((child) => cleanSafeHTMLNode(child, options));
}
function sanitizeHTML(html, options = {}) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const safeOptions = {
    allowedTags: options.allowedTags ?? [
      "a",
      "abbr",
      "b",
      "br",
      "code",
      "del",
      "div",
      "em",
      "i",
      "li",
      "mark",
      "ol",
      "p",
      "pre",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "ul"
    ],
    allowedAttributes: options.allowedAttributes ?? Array.from(defaultSafeHTMLAttributes)
  };
  Array.from(template.content.childNodes).forEach((node) => cleanSafeHTMLNode(node, safeOptions));
  return template.content;
}
function setSafeHTML(target, html, options = {}) {
  if (!target) return;
  target.replaceChildren(sanitizeHTML(html, options));
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
  if (mode === "append") {
    const template = document.createElement("template");
    setTrustedHTML(template, html, { trusted: true, context: "append swap" });
    targetEl.append(template.content);
  }
  if (mode === "prepend") {
    const template = document.createElement("template");
    setTrustedHTML(template, html, { trusted: true, context: "prepend swap" });
    targetEl.prepend(template.content);
  }
  if (mode === "before") {
    const template = document.createElement("template");
    setTrustedHTML(template, html, { trusted: true, context: "before swap" });
    targetEl.before(template.content);
  }
  if (mode === "after") {
    const template = document.createElement("template");
    setTrustedHTML(template, html, { trusted: true, context: "after swap" });
    targetEl.after(template.content);
  }
  if (mode === "outer") {
    const template = document.createElement("template");
    setTrustedHTML(template, html, { trusted: true, context: "outer swap" });
    const updated = template.content.firstElementChild;
    targetEl.replaceWith(template.content);
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
  sanitizeHTML,
  setSafeHTML,
  setText,
  setTrustedHTML,
  swapTrustedHTML,
  unmount
};
