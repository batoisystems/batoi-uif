import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureTrustedTypes } from '@batoi/uif-dom';
import {
  applyPermissionNavigation,
  canUseDesktopAction,
  createDesktopManifest,
  createDesktopShell,
  createLocalSettingsStore,
  createMemorySettingsStore,
  initDesktopShell,
  parseDesktopManifestElement,
  renderDesktopShell,
  summarizeDesktopQueue,
  validateDesktopManifest,
} from './index.js';

afterEach(() => configureTrustedTypes(null));

describe('@batoi/uif-desktop', () => {
  it('validates required manifest fields', () => {
    expect(validateDesktopManifest({}).valid).toBe(false);
    expect(createDesktopManifest({ id: 'ops', name: 'Ops Console' }).workspaceMode).toBe('none');
  });

  it('parses a manifest from a declarative element', () => {
    document.body.innerHTML = '<section data-uif-desktop-app="desk" data-uif-desktop-name="Desk" data-uif-desktop-version="1.0"></section>';
    const manifest = parseDesktopManifestElement(document.querySelector('section') as HTMLElement);
    expect(manifest).toMatchObject({ id: 'desk', name: 'Desk', version: '1.0' });
  });

  it('renders a desktop shell with navigation and sync status', () => {
    const shell = createDesktopShell({
      id: 'workspace',
      name: 'Workspace',
      navigation: [{ id: 'home', label: 'Home', href: '/', active: true }],
      status: { sync: 'queued', queued: 2 },
    });
    const html = renderDesktopShell(shell);
    expect(html).toContain('uif-desktop-shell');
    expect(html).toContain('Home');
    expect(html).toContain('2 queued');
  });

  it('blocks unsafe navigation URLs and uses the configured HTML policy', () => {
    const createHTML = vi.fn((value: string) => value);
    configureTrustedTypes({ createHTML });
    const element = document.createElement('div');
    element.dataset.uifDesktop = JSON.stringify({
      id: 'workspace',
      name: 'Workspace',
      navigation: [{ id: 'unsafe', label: 'Unsafe', href: 'javascript:alert(1)' }],
    });

    const dispose = initDesktopShell(element);

    expect(createHTML).toHaveBeenCalledOnce();
    expect(element.querySelector('a')?.getAttribute('href')).toBe('#');
    dispose();
  });

  it('leaves server content intact and reports malformed desktop options', () => {
    document.body.innerHTML = '<section data-uif-desktop="{bad"><p>Server fallback</p></section>';
    const element = document.querySelector('section') as HTMLElement;
    const errors: string[] = [];
    element.addEventListener('uif:desktop-error', (event) => errors.push((event as CustomEvent).detail.code));

    const dispose = initDesktopShell(element);

    expect(element.textContent).toContain('Server fallback');
    expect(errors).toEqual(['desktop-invalid-options']);
    dispose();
  });

  it('supports memory and local settings stores', () => {
    const memory = createMemorySettingsStore('test');
    memory.set('density', 'compact');
    expect(memory.get('density')).toBe('compact');
    memory.remove('density');
    expect(memory.get('density')).toBeNull();

    const local = createLocalSettingsStore('desktop-test');
    local.set('theme', 'light');
    expect(local.get('theme')).toBe('light');
    local.clear();
    expect(local.get('theme')).toBeNull();
  });

  it('falls back to memory for malformed or unavailable local settings storage', () => {
    window.localStorage.clear();
    window.localStorage.setItem('desktop-resilient:theme', '{bad');
    const local = createLocalSettingsStore('desktop-resilient');
    expect(local.get('theme')).toBeNull();

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    local.set('theme', 'dark');
    expect(local.get('theme')).toBe('dark');
    expect(() => local.remove('theme')).not.toThrow();
    expect(local.get('theme')).toBeNull();
    setItem.mockRestore();
  });

  it('filters permission-aware navigation', () => {
    document.body.innerHTML = '<nav><a data-uif-permission="admin">Admin</a><a data-uif-permission="read">Read</a></nav>';
    applyPermissionNavigation(document, {
      workspaceId: 'w1',
      workspaceName: 'Workspace',
      userId: 'u1',
      userName: 'Ada',
      permissions: ['read'],
    });
    expect((document.querySelector('[data-uif-permission="admin"]') as HTMLElement).hidden).toBe(true);
    expect((document.querySelector('[data-uif-permission="read"]') as HTMLElement).hidden).toBe(false);
    expect(canUseDesktopAction(undefined, 'admin')).toBe(false);
  });

  it('summarizes desktop queue state', () => {
    expect(summarizeDesktopQueue([{ status: 'queued' }, { status: 'failed' }])).toMatchObject({
      state: 'failed',
      queued: 1,
      failed: 1,
    });
    expect(summarizeDesktopQueue([]).message).toBe('All changes synced');
  });
});
