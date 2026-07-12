export type QueryInput = string | Element | Iterable<Element> | NodeListOf<Element> | null | undefined;
export type QueryHandler = (event: Event, match: Element) => void;

function toElements(input: QueryInput, root: ParentNode = document): Element[] {
  if (!input) return [];
  if (typeof input === 'string') return Array.from(root.querySelectorAll(input));
  if (input instanceof Element) return [input];
  return Array.from(input);
}

export class UIFQuery {
  readonly elements: Element[];

  constructor(input: QueryInput, root: ParentNode = document) {
    this.elements = toElements(input, root);
  }

  get length(): number {
    return this.elements.length;
  }

  at(index: number): Element | undefined {
    return this.elements[index];
  }

  each(handler: (el: Element, index: number) => void): this {
    this.elements.forEach(handler);
    return this;
  }

  map<T>(handler: (el: Element, index: number) => T): T[] {
    return this.elements.map(handler);
  }

  find(selector: string): UIFQuery {
    return new UIFQuery(this.elements.flatMap((el) => Array.from(el.querySelectorAll(selector))));
  }

  closest(selector: string): UIFQuery {
    const matches: Element[] = [];
    this.elements.forEach((el) => {
      const match = el.closest(selector);
      if (match) matches.push(match);
    });
    return new UIFQuery(matches);
  }

  parent(): UIFQuery {
    const parents: Element[] = [];
    this.elements.forEach((el) => {
      if (el.parentElement) parents.push(el.parentElement);
    });
    return new UIFQuery(parents);
  }

  children(selector?: string): UIFQuery {
    const kids = this.elements.flatMap((el) => Array.from(el.children));
    return new UIFQuery(selector ? kids.filter((el) => el.matches(selector)) : kids);
  }

  addClass(...names: string[]): this {
    return this.each((el) => el.classList.add(...names));
  }

  removeClass(...names: string[]): this {
    return this.each((el) => el.classList.remove(...names));
  }

  toggleClass(name: string, force?: boolean): this {
    return this.each((el) => el.classList.toggle(name, force));
  }

  attr(name: string): string | null;
  attr(name: string, value: string | null): this;
  attr(name: string, value?: string | null): string | null | this {
    if (value === undefined) return this.elements[0]?.getAttribute(name) ?? null;
    return this.each((el) => (value === null ? el.removeAttribute(name) : el.setAttribute(name, value)));
  }

  data(name: string): string | undefined;
  data(name: string, value: string | null): this;
  data(name: string, value?: string | null): string | undefined | this {
    const key = name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
    if (value === undefined) return (this.elements[0] as HTMLElement | undefined)?.dataset[key];
    return this.each((el) => {
      const htmlEl = el as HTMLElement;
      if (value === null) delete htmlEl.dataset[key];
      else htmlEl.dataset[key] = value;
    });
  }

  css(name: string): string;
  css(name: string, value: string): this;
  css(name: string, value?: string): string | this {
    if (value === undefined) return this.elements[0] ? getComputedStyle(this.elements[0]).getPropertyValue(name) : '';
    return this.each((el) => ((el as HTMLElement).style as unknown as Record<string, string>)[name] = value);
  }

  on(eventName: string, handler: EventListener): this {
    return this.each((el) => el.addEventListener(eventName, handler));
  }

  off(eventName: string, handler: EventListener): this {
    return this.each((el) => el.removeEventListener(eventName, handler));
  }

  trigger(name: string, detail?: unknown): this {
    return this.each((el) => trigger(el, name, detail));
  }

  html(): string;
  html(value: string): this;
  html(value?: string): string | this {
    if (value === undefined) return this.elements[0]?.innerHTML ?? '';
    return this.each((el) => setTrustedHTML(el, value, { trusted: true, context: 'query html' }));
  }

  text(): string;
  text(value: string): this;
  text(value?: string): string | this {
    if (value === undefined) return this.elements[0]?.textContent ?? '';
    return this.each((el) => (el.textContent = value));
  }

  append(content: string | Node): this {
    return this.each((el) => {
      if (typeof content === 'string') swapTrustedHTML(el as HTMLElement, content, 'append');
      else el.append(content.cloneNode(true));
    });
  }

  prepend(content: string | Node): this {
    return this.each((el) => {
      if (typeof content === 'string') swapTrustedHTML(el as HTMLElement, content, 'prepend');
      else el.prepend(content.cloneNode(true));
    });
  }

  remove(): this {
    return this.each((el) => el.remove());
  }

  show(): this {
    return this.each((el) => ((el as HTMLElement).hidden = false));
  }

  hide(): this {
    return this.each((el) => ((el as HTMLElement).hidden = true));
  }

  toggle(force?: boolean): this {
    return this.each((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.hidden = force === undefined ? !htmlEl.hidden : !force;
    });
  }
}

export function uif(input: QueryInput, root: ParentNode = document): UIFQuery {
  return new UIFQuery(input, root);
}

export function ready(handler: () => void): void {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', handler, { once: true });
  else handler();
}

export function delegate(root: Element | Document, eventName: string, selector: string, handler: QueryHandler): () => void {
  const listener = (event: Event) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (target && root.contains(target)) handler(event, target);
  };
  root.addEventListener(eventName, listener);
  return () => root.removeEventListener(eventName, listener);
}

export function trigger(target: EventTarget, name: string, detail?: unknown): void {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

export function serialize(form: HTMLFormElement): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const result: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  new FormData(form).forEach((value, key) => {
    const existing = result[key];
    if (existing === undefined) result[key] = value;
    else result[key] = Array.isArray(existing) ? existing.concat(value) : [existing, value];
  });
  return result;
}

export function fragment(html: string): DocumentFragment {
  const template = document.createElement('template');
  setTrustedHTML(template, html, { trusted: true, context: 'query fragment' });
  return template.content;
}
import { setTrustedHTML, swapTrustedHTML } from '@batoi/uif-dom';
