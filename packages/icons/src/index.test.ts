import { describe, expect, it } from 'vitest';
import { hasIcon, icon, iconElement, icons, mountIcons, registerIcon } from './index.js';

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

  it('includes the Batoi brand mark', () => {
    const markup = icon('batoi', { title: 'Batoi' });
    expect(hasIcon('batoi')).toBe(true);
    expect(markup).toContain('<title>Batoi</title>');
    expect(markup).toContain('fill="currentColor"');
  });

  it('includes the Batoi UIF brand mark', () => {
    const markup = icon('uif', { title: 'Batoi UIF' });
    expect(hasIcon('uif')).toBe(true);
    expect(markup).toContain('viewBox="0 0 64 64"');
    expect(markup).toContain('<title>Batoi UIF</title>');
    expect(markup).toContain('stroke="currentColor"');
  });

  it('includes a broad first-party icon set for application interfaces', () => {
    expect(Object.keys(icons).length).toBeGreaterThanOrEqual(280);
    [
      'archive',
      'bank',
      'barcode',
      'book-open',
      'calendar-check',
      'cart',
      'chart-candlestick',
      'clipboard-list',
      'cloud-upload',
      'dashboard',
      'database-backup',
      'donut-chart',
      'eye-off',
      'file-code',
      'folder',
      'folder-open',
      'gauge-chart',
      'kanban',
      'layout-dashboard',
      'mail',
      'megaphone',
      'server',
      'shield-lock',
      'shopping-bag',
      'sort-asc',
      'store',
      'truck',
      'user-plus',
      'wallet',
      'workflow',
    ].forEach((name) => {
      expect(hasIcon(name)).toBe(true);
      expect(icon(name)).toContain('<svg');
    });
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
