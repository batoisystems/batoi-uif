import { setTrustedHTML } from '@batoi/uif-dom';
import type { IconDefinition, IconOptions, IconRegistry } from './types.js';

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** Definitions are reviewed application assets, never model/user-provided SVG. */
export function createIconRenderer(definitions: Readonly<IconRegistry>) {
  const registry: IconRegistry = Object.assign(Object.create(null), definitions);
  const icon = (name: string, options: IconOptions = {}): string => {
    const definition = registry[name];
    if (!definition) return '';
    const body = Array.isArray(definition.body) ? definition.body.join('') : definition.body;
    const title = options.title ? `<title>${escape(options.title)}</title>` : '';
    const size = options.size === undefined ? '' : ` width="${escape(String(options.size))}" height="${escape(String(options.size))}"`;
    return `<svg class="${escape(['uif-icon', options.className].filter(Boolean).join(' '))}" viewBox="${escape(definition.viewBox ?? '0 0 24 24')}"${size} ${options.title ? 'role="img"' : 'aria-hidden="true"'} fill="none" xmlns="http://www.w3.org/2000/svg">${title}${body}</svg>`;
  };
  return {
    icon,
    has: (name: string) => Object.hasOwn(registry, name),
    register(name: string, definition: IconDefinition) {
      if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Invalid icon name');
      registry[name] = definition;
    },
    mount(root: ParentNode = document) {
      const targets = [...root.querySelectorAll<HTMLElement>('[data-uif-icon]')];
      if (root instanceof HTMLElement && root.matches('[data-uif-icon]')) targets.unshift(root);
      targets.forEach((target) => {
        const name = target.dataset.uifIcon ?? '';
        if (target.dataset.uifIconMounted === 'true' || !Object.hasOwn(registry, name)) return;
        const markup = icon(name, { title: target.dataset.uifIconTitle, size: target.dataset.uifIconSize });
        setTrustedHTML(target, markup, { trusted: true, context: 'reviewed icon subset' });
        target.dataset.uifIconMounted = 'true';
      });
    },
  };
}
