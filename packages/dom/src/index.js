const initialized = new WeakMap();
const registry = new Map();

export function registerComponent(component) {
  registry.set(component.name, component);
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function closest(el, selector) {
  return el.closest(selector);
}

export function resolveTarget(sourceEl, targetExpression = 'self') {
  if (targetExpression === 'self') return sourceEl;
  if (targetExpression === 'parent') return sourceEl.parentElement;
  if (targetExpression.startsWith('closest:')) return sourceEl.closest(targetExpression.slice(8));
  if (targetExpression.startsWith('#') || targetExpression.startsWith('.')) return document.querySelector(targetExpression);
  return null;
}

export function mount(root = document) {
  qsa('[data-uif]', root).forEach((el) => {
    if (initialized.has(el)) return;
    const key = el.getAttribute('data-uif');
    if (!key) return;
    const component = registry.get(key);
    if (!component) return;
    component.init(el);
    initialized.set(el, component);
  });
}

export function unmount(root = document) {
  qsa('[data-uif]', root).forEach((el) => {
    const comp = initialized.get(el);
    if (comp?.destroy) comp.destroy(el);
    initialized.delete(el);
  });
}

export function autoInit(root = document) { mount(root); }

export function observe(root = document.body) {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) autoInit(node);
      });
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}
