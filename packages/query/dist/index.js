// src/index.ts
import { setTrustedHTML, swapTrustedHTML } from "@batoi/uif-dom";
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
    return this.each((el) => setTrustedHTML(el, value, { trusted: true, context: "query html" }));
  }
  text(value) {
    if (value === void 0) return this.elements[0]?.textContent ?? "";
    return this.each((el) => el.textContent = value);
  }
  append(content) {
    return this.each((el) => {
      if (typeof content === "string") swapTrustedHTML(el, content, "append");
      else el.append(content.cloneNode(true));
    });
  }
  prepend(content) {
    return this.each((el) => {
      if (typeof content === "string") swapTrustedHTML(el, content, "prepend");
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
function serialize(form) {
  const result = {};
  new FormData(form).forEach((value, key) => {
    const existing = result[key];
    if (existing === void 0) result[key] = value;
    else result[key] = Array.isArray(existing) ? existing.concat(value) : [existing, value];
  });
  return result;
}
function fragment(html) {
  const template = document.createElement("template");
  setTrustedHTML(template, html, { trusted: true, context: "query fragment" });
  return template.content;
}
export {
  UIFQuery,
  delegate,
  fragment,
  ready,
  serialize,
  trigger,
  uif
};
