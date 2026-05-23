import { icons, type IconName } from './icons.js';
import type { IconDefinition, IconOptions } from './types.js';

const customIcons: Record<string, IconDefinition> = {};

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function iconBody(definition: IconDefinition): string {
  return Array.isArray(definition.body) ? definition.body.join('') : definition.body;
}

function definitionFor(name: string): IconDefinition | undefined {
  return customIcons[name] ?? icons[name as IconName];
}

function normalizeSize(size: number | string | undefined): string | undefined {
  if (size === undefined) return undefined;
  return typeof size === 'number' ? `${size}px` : size;
}

export function hasIcon(name: string): boolean {
  return Boolean(definitionFor(name));
}

export function registerIcon(name: string, body: string | string[], viewBox = '0 0 24 24'): void {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
  customIcons[name] = { body, viewBox };
}

export function icon(name: IconName | string, options: IconOptions = {}): string {
  const definition = definitionFor(name);
  if (!definition) return '';

  const className = ['uif-icon', options.className].filter(Boolean).join(' ');
  const size = normalizeSize(options.size);
  const hidden = options.title ? false : options.hidden !== false;
  const attrs = [
    `class="${escapeAttribute(className)}"`,
    `viewBox="${escapeAttribute(definition.viewBox ?? '0 0 24 24')}"`,
    size ? `width="${escapeAttribute(size)}"` : '',
    size ? `height="${escapeAttribute(size)}"` : '',
    options.title ? 'role="img"' : '',
    hidden ? 'aria-hidden="true"' : '',
    'fill="none"',
    'xmlns="http://www.w3.org/2000/svg"',
  ].filter(Boolean);

  const title = options.title ? `<title>${escapeAttribute(options.title)}</title>` : '';
  return `<svg ${attrs.join(' ')}>${title}${iconBody(definition)}</svg>`;
}

export function iconElement(name: IconName | string, options: IconOptions = {}): SVGSVGElement {
  const markup = icon(name, options);
  if (!markup) throw new Error(`Unknown icon: ${name}`);
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.firstElementChild as SVGSVGElement;
}
