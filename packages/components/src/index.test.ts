import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOverlayStack } from '@batoi/uif-overlays';
import { destroyComponent, initAll, showToast } from './index.js';

afterEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('components', () => {
  it('initializes tabs with aria state', () => {
    document.body.innerHTML = `
      <div data-uif="tabs">
        <button data-uif-role="tab">One</button>
        <button data-uif-role="tab">Two</button>
        <div data-uif-role="tabpanel">A</div>
        <div data-uif-role="tabpanel">B</div>
      </div>`;
    initAll(document);
    expect(document.querySelector('[data-uif-role="tab"]')?.getAttribute('aria-selected')).toBe('true');
    expect((document.querySelectorAll('[data-uif-role="tabpanel"]')[1] as HTMLElement).hidden).toBe(true);
  });

  it('creates toast notifications', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = showToast('Saved', { type: 'success' });
    expect(el.textContent).toBe('Saved');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('binds root actions only once', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = '<button data-uif-action="toast" data-uif-message="Saved">Notify</button>';
    initAll(document);
    initAll(document);
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.querySelectorAll('.uif-toast')).toHaveLength(1);
  });

  it('creates text-safe tooltip panels from title text and cleans them up', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = '<button id="help" data-uif="tooltip" title="<script>alert(1)</script>">Help</button>';
    initAll(document);

    const trigger = document.querySelector<HTMLElement>('#help');
    const panel = document.querySelector<HTMLElement>('[role="tooltip"]');

    expect(trigger?.hasAttribute('title')).toBe(false);
    expect(trigger?.getAttribute('aria-describedby')).toBe(panel?.id);
    expect(panel?.textContent).toBe('<script>alert(1)</script>');
    expect(panel?.innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');

    trigger?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(panel?.hidden).toBe(false);
    trigger?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(panel?.hidden).toBe(true);

    if (trigger) destroyComponent(trigger);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('opens and closes drawers through delegated actions', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <button id="open" data-uif-action="open" data-uif-target="#drawer">Open</button>
      <aside id="drawer" data-uif="drawer" hidden>
        <button id="close" data-uif-action="close">Close</button>
      </aside>`;
    initAll(document);

    const drawer = document.querySelector<HTMLElement>('#drawer');
    document.querySelector('#open')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(drawer?.hidden).toBe(false);
    expect(drawer?.dataset.uifState).toBe('open');
    expect(getOverlayStack()).toContain(drawer);

    document.querySelector('#close')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(drawer?.hidden).toBe(true);
    expect(drawer?.dataset.uifState).toBe('closed');
    expect(getOverlayStack()).not.toContain(drawer);
  });

  it('supports offcanvas as a drawer alias', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <button data-uif-action="open" data-uif-target="#nav-panel">Open nav</button>
      <aside id="nav-panel" data-uif="offcanvas" hidden>
        <button data-uif-action="close">Close</button>
      </aside>`;
    initAll(document);

    const panel = document.querySelector<HTMLElement>('#nav-panel');
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel?.hidden).toBe(false);
    expect(panel?.dataset.uifState).toBe('open');
  });

  it('initializes workspace shells with persisted sidebar, density, skip link, and active route state', () => {
    window.localStorage.setItem('workspace-sidebar', 'collapsed');
    window.localStorage.setItem('workspace-density', 'compact');
    document.body.innerHTML = `
      <div id="workspace-shell" data-uif="shell" data-uif-route="guard" data-uif-sidebar-key="workspace-sidebar" data-uif-density-key="workspace-density">
        <a data-uif-role="skip-link">Skip</a>
        <aside data-uif-role="sidebar">
          <nav data-uif-role="nav">
            <a href="/core" data-uif-route="core">Core</a>
            <a href="/guard" data-uif-route="guard">Guard</a>
            <button data-uif-action="toggle-section" data-uif-state="expanded">Build</button>
            <div data-uif-role="section-panel"><a href="/build">Routes</a></div>
          </nav>
        </aside>
        <button id="toggle" data-uif-action="toggle" data-uif-target="#workspace-shell">Toggle sidebar</button>
        <button id="density" data-uif-action="set-density" data-uif-density="comfortable">Comfortable</button>
        <main data-uif-role="main">Workspace</main>
      </div>`;
    initAll(document);

    const shell = document.querySelector<HTMLElement>('#workspace-shell');
    const main = document.querySelector<HTMLElement>('[data-uif-role="main"]');
    const skip = document.querySelector<HTMLAnchorElement>('[data-uif-role="skip-link"]');
    const active = document.querySelector<HTMLAnchorElement>('a[data-uif-route="guard"]');
    const sectionTrigger = document.querySelector<HTMLButtonElement>('[data-uif-action="toggle-section"]');
    const sectionPanel = document.querySelector<HTMLElement>('[data-uif-role="section-panel"]');

    expect(shell?.dataset.uifSidebar).toBe('collapsed');
    expect(shell?.dataset.uifDensity).toBe('compact');
    expect(shell?.classList.contains('uif-shell-sidebar-collapsed')).toBe(true);
    expect(main?.id).toBe('workspace-shell-main');
    expect(skip?.getAttribute('href')).toBe('#workspace-shell-main');
    expect(active?.getAttribute('aria-current')).toBe('page');
    expect(active?.classList.contains('is-active')).toBe(true);
    expect(sectionTrigger?.getAttribute('aria-expanded')).toBe('true');
    expect(sectionPanel?.hidden).toBe(false);

    document.querySelector('#toggle')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(shell?.dataset.uifSidebar).toBe('expanded');
    expect(window.localStorage.getItem('workspace-sidebar')).toBe('expanded');

    document.querySelector('#density')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(shell?.dataset.uifDensity).toBe('comfortable');
    expect(window.localStorage.getItem('workspace-density')).toBe('comfortable');

    sectionTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(sectionTrigger?.getAttribute('aria-expanded')).toBe('false');
    expect(sectionPanel?.hidden).toBe(true);
  });
});
