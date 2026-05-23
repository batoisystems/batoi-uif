import { iconElement } from './render.js';
import type { IconOptions } from './types.js';

export interface MountIconsOptions {
  selector?: string;
}

function parseSize(value: string | null): IconOptions['size'] {
  if (!value) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) && value.trim() !== '' ? numeric : value;
}

function isIconHost(root: ParentNode, selector: string): root is ParentNode & HTMLElement {
  return 'matches' in root && typeof root.matches === 'function' && root.matches(selector);
}

export function mountIcons(root: ParentNode = document, options: MountIconsOptions = {}): void {
  const selector = options.selector ?? '[data-uif-icon]';
  const targets = [
    ...(isIconHost(root, selector) ? [root] : []),
    ...root.querySelectorAll<HTMLElement>(selector),
  ];

  targets.forEach((target) => {
    if (target.dataset.uifIconMounted === 'true') return;
    const name = target.dataset.uifIcon;
    if (!name) return;

    const iconOptions: IconOptions = {
      className: target.dataset.uifIconClass,
      hidden: target.dataset.uifIconHidden === 'false' ? false : undefined,
      size: parseSize(target.dataset.uifIconSize ?? null),
      title: target.dataset.uifIconTitle,
    };

    try {
      const svg = iconElement(name, iconOptions);
      target.replaceChildren(svg);
      target.dataset.uifIconMounted = 'true';
    } catch {
      target.dataset.uifIconMissing = name;
    }
  });
}
