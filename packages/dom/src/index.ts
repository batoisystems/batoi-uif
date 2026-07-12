export interface UIFDomComponent {
  name: string;
  init(el: HTMLElement): void;
  destroy?(el: HTMLElement): void;
}

type Root = Document | HTMLElement | DocumentFragment;
export type HTMLSwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';

export interface TrustedHTMLRenderOptions {
  trusted?: boolean;
  context?: string;
}

export interface SafeHTMLRenderOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
}

export interface UIFTrustedTypesPolicy {
  createHTML(input: string): unknown;
}

export type SafeURLContext = 'link' | 'image' | 'network' | 'navigation';

export interface SafeURLPolicy {
  context?: SafeURLContext;
  allowRelative?: boolean;
  allowHash?: boolean;
  sameOrigin?: boolean;
  protocols?: string[];
}

const initialized = new WeakMap<HTMLElement, UIFDomComponent>();
const registry = new Map<string, UIFDomComponent>();
let trustedTypesPolicy: UIFTrustedTypesPolicy | null = null;
const blockedSafeHTMLTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE']);
const defaultSafeHTMLAttributes = new Set([
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'aria-live',
  'class',
  'data-uif',
  'data-uif-action',
  'data-uif-icon',
  'data-uif-message',
  'data-uif-role',
  'data-uif-target',
  'hidden',
  'href',
  'id',
  'role',
  'title',
  'type',
]);

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
  try {
    return el.closest<T>(selector);
  } catch {
    return null;
  }
}

export function safeQuerySelector<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
  try {
    return root.querySelector<T>(selector);
  } catch {
    return null;
  }
}

export function resolveTarget(sourceEl: HTMLElement, targetExpression = 'self'): HTMLElement | null {
  if (targetExpression === 'self') return sourceEl;
  if (targetExpression === 'parent') return sourceEl.parentElement;
  if (targetExpression.startsWith('closest:')) return closest<HTMLElement>(sourceEl, targetExpression.slice(8));
  if (targetExpression.startsWith('#') || targetExpression.startsWith('.')) {
    return safeQuerySelector<HTMLElement>(targetExpression);
  }
  return safeQuerySelector<HTMLElement>(targetExpression);
}

export function setText(target: Element | null, value: unknown): void {
  if (!target) return;
  target.textContent = value == null ? '' : String(value);
}

export function appendTextElement<K extends keyof HTMLElementTagNameMap>(
  parent: Element,
  tagName: K,
  text: unknown,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  setText(el, text);
  parent.append(el);
  return el;
}

export function configureTrustedTypes(policy: UIFTrustedTypesPolicy | null): void {
  trustedTypesPolicy = policy;
}

export function getTrustedTypesPolicy(): UIFTrustedTypesPolicy | null {
  return trustedTypesPolicy;
}

function setHTMLSink(target: Element, html: string): void {
  const value = trustedTypesPolicy?.createHTML(html) ?? html;
  (target as unknown as { innerHTML: unknown }).innerHTML = value;
}

export function isSafeURL(value: string, policy: SafeURLPolicy = {}): boolean {
  const candidate = value.trim();
  if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate) || candidate.startsWith('//')) return false;
  const context = policy.context ?? 'link';
  const allowRelative = policy.allowRelative ?? true;
  const allowHash = policy.allowHash ?? context === 'link';
  if (allowHash && candidate.startsWith('#')) return true;
  if (allowRelative && (/^(?:\.\/|\.\.\/|\/)/.test(candidate) || !/^[a-z][a-z\d+.-]*:/i.test(candidate))) return true;
  const defaults: Record<SafeURLContext, string[]> = {
    link: ['http:', 'https:', 'mailto:', 'tel:'], image: ['http:', 'https:'], network: ['http:', 'https:'], navigation: ['http:', 'https:'],
  };
  try {
    const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href;
    const parsed = new URL(candidate, base);
    if (!(policy.protocols ?? defaults[context]).includes(parsed.protocol.toLowerCase())) return false;
    if (!policy.sameOrigin || typeof window === 'undefined') return true;
    if (parsed.origin === window.location.origin) return true;
    const websocketEquivalent = parsed.host === window.location.host && ((parsed.protocol === 'ws:' && window.location.protocol === 'http:') || (parsed.protocol === 'wss:' && window.location.protocol === 'https:'));
    return websocketEquivalent;
  } catch {
    return false;
  }
}

function cleanSafeHTMLNode(node: Node, options: Required<SafeHTMLRenderOptions>): void {
  if (!(node instanceof Element)) return;
  const tagName = node.tagName.toUpperCase();
  if (blockedSafeHTMLTags.has(tagName) || !options.allowedTags.includes(tagName.toLowerCase())) {
    node.remove();
    return;
  }

  Array.from(node.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;
    if (name.startsWith('on') || !options.allowedAttributes.includes(name)) {
      node.removeAttribute(attribute.name);
      return;
    }
    if (name === 'href' && !isSafeURL(value, { context: 'link' })) {
      node.removeAttribute(attribute.name);
    }
    if (name === 'src' && !isSafeURL(value, { context: 'image', allowHash: false })) {
      node.removeAttribute(attribute.name);
    }
  });

  Array.from(node.childNodes).forEach((child) => cleanSafeHTMLNode(child, options));
}

export function sanitizeHTML(html: string, options: SafeHTMLRenderOptions = {}): DocumentFragment {
  const template = document.createElement('template');
  setHTMLSink(template, html);
  const safeOptions: Required<SafeHTMLRenderOptions> = {
    allowedTags: options.allowedTags ?? [
      'a',
      'abbr',
      'b',
      'br',
      'code',
      'del',
      'div',
      'em',
      'i',
      'li',
      'mark',
      'ol',
      'p',
      'pre',
      'small',
      'span',
      'strong',
      'sub',
      'sup',
      'ul',
    ],
    allowedAttributes: options.allowedAttributes ?? Array.from(defaultSafeHTMLAttributes),
  };
  Array.from(template.content.childNodes).forEach((node) => cleanSafeHTMLNode(node, safeOptions));
  return template.content;
}

export function setSafeHTML(target: Element | null, html: string, options: SafeHTMLRenderOptions = {}): void {
  if (!target) return;
  target.replaceChildren(sanitizeHTML(html, options));
}

export function setTrustedHTML(target: Element | null, html: string, options: TrustedHTMLRenderOptions = {}): void {
  if (!target) return;
  if (!options.trusted) {
    throw new Error(`Batoi UIF refused untrusted HTML${options.context ? ` for ${options.context}` : ''}`);
  }
  setHTMLSink(target, html);
}

export function swapTrustedHTML(targetEl: HTMLElement, html: string, mode: HTMLSwapMode = 'inner'): HTMLElement {
  if (mode === 'inner') {
    setTrustedHTML(targetEl, html, { trusted: true, context: 'swap' });
    return targetEl;
  }
  if (mode === 'append') {
    const template = document.createElement('template');
    setTrustedHTML(template, html, { trusted: true, context: 'append swap' });
    targetEl.append(template.content);
  }
  if (mode === 'prepend') {
    const template = document.createElement('template');
    setTrustedHTML(template, html, { trusted: true, context: 'prepend swap' });
    targetEl.prepend(template.content);
  }
  if (mode === 'before') {
    const template = document.createElement('template');
    setTrustedHTML(template, html, { trusted: true, context: 'before swap' });
    targetEl.before(template.content);
  }
  if (mode === 'after') {
    const template = document.createElement('template');
    setTrustedHTML(template, html, { trusted: true, context: 'after swap' });
    targetEl.after(template.content);
  }
  if (mode === 'outer') {
    const template = document.createElement('template');
    setTrustedHTML(template, html, { trusted: true, context: 'outer swap' });
    const updated = template.content.firstElementChild;
    targetEl.replaceWith(template.content);
    return updated instanceof HTMLElement ? updated : document.body;
  }
  return targetEl;
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
