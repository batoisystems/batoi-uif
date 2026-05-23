import { describe, expect, it } from 'vitest';
import { hasIcon, icon, iconElement, mountIcons, registerIcon } from './index.js';

describe('icons', () => {
  it('renders decorative SVG markup', () => {
    const markup = icon('search');
    expect(markup).toContain('class="uif-icon"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('<circle');
  });

  it('renders titled accessible SVG markup and escapes the title', () => {
    const markup = icon('alert', { title: 'Risk <high>' });
    expect(markup).toContain('role="img"');
    expect(markup).not.toContain('aria-hidden="true"');
    expect(markup).toContain('<title>Risk &lt;high&gt;</title>');
  });

  it('creates SVG elements', () => {
    const el = iconElement('plus', { className: 'extra', size: 18 });
    expect(el.classList.contains('uif-icon')).toBe(true);
    expect(el.classList.contains('extra')).toBe(true);
    expect(el.getAttribute('width')).toBe('18px');
  });

  it('supports custom icon registration', () => {
    registerIcon('custom-mark', '<path d="M1 1h22v22H1z"></path>');
    expect(hasIcon('custom-mark')).toBe(true);
    expect(icon('custom-mark')).toContain('M1 1h22v22H1z');
  });

  it('mounts declarative icons idempotently', () => {
    document.body.innerHTML = '<span data-uif-icon="search" data-uif-icon-title="Search"></span>';
    mountIcons(document);
    mountIcons(document);
    const host = document.querySelector('[data-uif-icon="search"]') as HTMLElement;
    expect(host.dataset.uifIconMounted).toBe('true');
    expect(host.querySelectorAll('svg')).toHaveLength(1);
    expect(host.querySelector('title')?.textContent).toBe('Search');
  });

  it('mounts a root element and fragment after partial swaps', () => {
    const root = document.createElement('span');
    root.dataset.uifIcon = 'bell';
    mountIcons(root);
    expect(root.querySelector('svg')).not.toBeNull();

    const fragment = document.createDocumentFragment();
    const target = document.createElement('span');
    target.dataset.uifIcon = 'calendar';
    fragment.append(target);
    mountIcons(fragment);
    expect(target.querySelector('svg')).not.toBeNull();
  });

  it('marks missing declarative icons without throwing', () => {
    document.body.innerHTML = '<span data-uif-icon="not-real"></span>';
    mountIcons(document);
    expect(document.querySelector('span')?.dataset.uifIconMissing).toBe('not-real');
  });
});
