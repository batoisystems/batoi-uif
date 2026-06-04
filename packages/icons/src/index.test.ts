import { describe, expect, it } from 'vitest';
import {
  getIconMetadata,
  hasIcon,
  icon,
  iconElement,
  iconMetadata,
  icons,
  iconsByCategory,
  iconSets,
  mountIcons,
  registerIcon,
  searchIcons,
} from './index.js';

describe('icons', () => {
  const iconNamePattern = /^[a-z][a-z0-9-]*$/;
  const allowedBodyPattern = /^(<(path|circle|rect|ellipse|line|polyline|polygon)\b[^>]*><\/\2>|<(path|circle|rect|ellipse|line|polyline|polygon)\b[^>]*\/>)+$/;
  const allowedStatuses = new Set(['stable', 'draft', 'deprecated']);

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
    expect(Object.keys(icons).length).toBeGreaterThanOrEqual(380);
    [
      'archive',
      'automation',
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
      'database-lock',
      'donut-chart',
      'eye-off',
      'file-image',
      'file-code',
      'folder',
      'folder-lock',
      'folder-open',
      'gauge-chart',
      'git-pull-request',
      'kanban',
      'layout-dashboard',
      'mail',
      'megaphone',
      'package-check',
      'server',
      'shield-alert',
      'shield-lock',
      'shopping-bag',
      'shopping-cart-plus',
      'sort-asc',
      'store',
      'task-check',
      'truck',
      'user-plus',
      'warehouse',
      'wallet',
      'workflow',
    ].forEach((name) => {
      expect(hasIcon(name)).toBe(true);
      expect(icon(name)).toContain('<svg');
    });
  });

  it('organizes icons into category registries without duplicate aggregate names', () => {
    expect(Object.keys(iconSets)).toEqual([
      'brand',
      'core-ui',
      'charts',
      'commerce',
      'communication',
      'content',
      'devices',
      'admin-security',
      'workflow',
      'domain',
    ]);

    const categoryEntries = Object.entries(iconSets);
    categoryEntries.forEach(([, registry]) => {
      expect(Object.keys(registry).length).toBeGreaterThan(0);
    });

    expect(iconSets.brand).toHaveProperty('batoi');
    expect(iconSets['core-ui']).toHaveProperty('search');
    expect(iconSets.charts).toHaveProperty('chart-candlestick');
    expect(iconSets.commerce).toHaveProperty('shopping-bag');
    expect(iconSets.content).toHaveProperty('file-code');
    expect(iconSets.devices).toHaveProperty('server-cog');
    expect(iconSets['admin-security']).toHaveProperty('shield-lock');
    expect(iconSets.workflow).toHaveProperty('kanban');

    const categoryNames = categoryEntries.flatMap(([, registry]) => Object.keys(registry));
    expect(new Set(categoryNames).size).toBe(categoryNames.length);
    expect(categoryNames.length).toBe(Object.keys(icons).length);
  });

  it('provides searchable metadata for every built-in icon', () => {
    expect(Object.keys(iconMetadata).length).toBe(Object.keys(icons).length);

    const search = getIconMetadata('search');
    expect(search?.category).toBe('core-ui');
    expect(search?.aliases).toContain('find');
    expect(search?.tags).toContain('navigation');

    expect(iconsByCategory('commerce')).toContain('shopping-bag');
    expect(searchIcons('payment', { category: 'commerce' })).toContain('credit-card');
    expect(searchIcons('find')).toContain('search');
    expect(searchIcons('identity', { category: 'admin-security' })).toContain('user');
    expect(searchIcons('', { category: 'charts' })).toEqual(Object.keys(iconSets.charts).sort((a, b) => a.localeCompare(b)));
  });

  it('keeps the first-party icon registry valid for high-volume additions', () => {
    Object.entries(icons).forEach(([name, definition]) => {
      expect(name, `${name} should use lowercase kebab-case`).toMatch(iconNamePattern);
      expect(definition.body, `${name} should define a body`).toBeTruthy();
      expect(definition.viewBox ?? '0 0 24 24', `${name} should define a valid viewBox`).toMatch(/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);

      const bodies = Array.isArray(definition.body) ? definition.body : [definition.body];
      bodies.forEach((body) => {
        expect(body, `${name} should be an SVG fragment, not a full SVG`).not.toContain('<svg');
        expect(body, `${name} should not include scripts`).not.toMatch(/<script|on[a-z]+\s*=|javascript:/i);
        expect(body, `${name} should only use approved SVG primitives`).toMatch(allowedBodyPattern);
      });
    });
  });

  it('keeps icon metadata normalized and connected to real icons', () => {
    Object.entries(iconMetadata).forEach(([name, metadata]) => {
      expect(icons).toHaveProperty(name);
      expect(metadata.name).toBe(name);
      expect(iconSets).toHaveProperty(metadata.category);
      expect(allowedStatuses.has(metadata.status)).toBe(true);
      expect(new Set(metadata.aliases).size).toBe(metadata.aliases.length);
      expect(new Set(metadata.tags).size).toBe(metadata.tags.length);
      [...metadata.aliases, ...metadata.tags].forEach((value) => {
        expect(value).toBe(value.trim().toLowerCase());
      });
      expect(metadata.tags).toContain(metadata.category);
    });
  });

  it('keeps category subpath exports aligned with aggregate metadata categories', async () => {
    const [
      adminSecurity,
      brand,
      charts,
      commerce,
      communication,
      content,
      coreUi,
      devices,
      domain,
      workflow,
    ] = await Promise.all([
      import('./sets/admin-security.js'),
      import('./sets/brand.js'),
      import('./sets/charts.js'),
      import('./sets/commerce.js'),
      import('./sets/communication.js'),
      import('./sets/content.js'),
      import('./sets/core-ui.js'),
      import('./sets/devices.js'),
      import('./sets/domain.js'),
      import('./sets/workflow.js'),
    ]);

    expect(adminSecurity.adminSecurityIcons).toBe(iconSets['admin-security']);
    expect(brand.brandIcons).toBe(iconSets.brand);
    expect(charts.chartIcons).toBe(iconSets.charts);
    expect(commerce.commerceIcons).toBe(iconSets.commerce);
    expect(communication.communicationIcons).toBe(iconSets.communication);
    expect(content.contentIcons).toBe(iconSets.content);
    expect(coreUi.coreUiIcons).toBe(iconSets['core-ui']);
    expect(devices.deviceIcons).toBe(iconSets.devices);
    expect(domain.domainIcons).toBe(iconSets.domain);
    expect(workflow.workflowIcons).toBe(iconSets.workflow);
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
