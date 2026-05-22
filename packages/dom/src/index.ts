export interface UIFDomComponent {
  name: string;
  init(el: HTMLElement): void;
  destroy?(el: HTMLElement): void;
}

type Root = Document | HTMLElement | DocumentFragment;

const initialized = new WeakMap<HTMLElement, UIFDomComponent>();
const registry = new Map<string, UIFDomComponent>();

export function registerComponent(name: string, component: Omit<UIFDomComponent, 'name'>): void;
export function registerComponent(component: UIFDomComponent): void;
export function registerComponent(
  nameOrComponent: string | UIFDomComponent,
  component?: Omit<UIFDomComponent, 'name'>,
): void {
  const entry =
    typeof nameOrComponent === 'string'
      ? ({ name: nameOrComponent, ...component } as UIFDomComponent)
      : nameOrComponent;
  registry.set(entry.name, entry);
}

export function qs<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function qsa<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function closest<T extends Element = Element>(el: Element, selector: string): T | null {
  return el.closest<T>(selector);
}

export function resolveTarget(sourceEl: HTMLElement, targetExpression = 'self'): HTMLElement | null {
  if (targetExpression === 'self') return sourceEl;
  if (targetExpression === 'parent') return sourceEl.parentElement;
  if (targetExpression.startsWith('closest:')) return sourceEl.closest<HTMLElement>(targetExpression.slice(8));
  if (targetExpression.startsWith('#') || targetExpression.startsWith('.')) {
    return document.querySelector<HTMLElement>(targetExpression);
  }
  return document.querySelector<HTMLElement>(targetExpression);
}

function candidates(root: Root): HTMLElement[] {
  const own = root instanceof HTMLElement && root.matches('[data-uif]') ? [root] : [];
  return own.concat(qsa<HTMLElement>('[data-uif]', root));
}

export function mount(root: Root = document): void {
  candidates(root).forEach((el) => {
    if (initialized.has(el)) return;
    const key = el.getAttribute('data-uif');
    if (!key) return;
    const component = registry.get(key);
    if (!component) return;
    component.init(el);
    initialized.set(el, component);
  });
}

export function unmount(root: Root = document): void {
  candidates(root).forEach((el) => {
    const component = initialized.get(el);
    component?.destroy?.(el);
    initialized.delete(el);
  });
}

export function autoInit(root: Root = document): void {
  mount(root);
}

export function observe(root: HTMLElement = document.body): MutationObserver {
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

export function isInitialized(el: HTMLElement): boolean {
  return initialized.has(el);
}
