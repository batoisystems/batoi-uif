import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeOverlay, getOverlayStack } from '@batoi/uif-overlays';
import { destroyComponent, initAll, showToast } from './index.js';

afterEach(async () => {
  vi.useRealTimers();
  while (getOverlayStack().length) {
    await closeOverlay(getOverlayStack().at(-1));
  }
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

  it('supports tabs Home/End and manual vertical activation', () => {
    document.body.innerHTML = `
      <div data-uif="tabs" data-uif-orientation="vertical" data-uif-activation="manual">
        <button id="one" data-uif-role="tab">One</button>
        <button id="two" data-uif-role="tab">Two</button>
        <button id="three" data-uif-role="tab">Three</button>
        <div id="panel-one" data-uif-role="tabpanel">A</div>
        <div id="panel-two" data-uif-role="tabpanel">B</div>
        <div id="panel-three" data-uif-role="tabpanel">C</div>
      </div>`;
    initAll(document);

    const one = document.querySelector<HTMLButtonElement>('#one');
    const two = document.querySelector<HTMLButtonElement>('#two');
    const three = document.querySelector<HTMLButtonElement>('#three');
    const panelOne = document.querySelector<HTMLElement>('#panel-one');
    const panelTwo = document.querySelector<HTMLElement>('#panel-two');
    const root = document.querySelector<HTMLElement>('[data-uif="tabs"]');

    expect(root?.getAttribute('aria-orientation')).toBe('vertical');
    expect(one?.getAttribute('aria-selected')).toBe('true');

    one?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(two);
    expect(two?.getAttribute('tabindex')).toBe('0');
    expect(two?.getAttribute('aria-selected')).toBe('false');
    expect(panelOne?.hidden).toBe(false);
    expect(panelTwo?.hidden).toBe(true);

    two?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(two?.getAttribute('aria-selected')).toBe('true');
    expect(panelOne?.hidden).toBe(true);
    expect(panelTwo?.hidden).toBe(false);

    two?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(three);
    expect(three?.getAttribute('aria-selected')).toBe('false');

    three?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(three?.getAttribute('aria-selected')).toBe('true');

    three?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(one);
    expect(one?.getAttribute('aria-selected')).toBe('false');
  });

  it('creates toast notifications', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = showToast('Saved', { type: 'success' });
    expect(el.querySelector('.uif-toast-message')?.textContent).toBe('Saved');
    expect(el.getAttribute('role')).toBe('status');
    expect(document.querySelector('.uif-toast-stack-bottom-end')?.contains(el)).toBe(true);
    expect(el.querySelector<HTMLButtonElement>('[data-uif-action="close"]')?.getAttribute('aria-label')).toBe('Close notification');
  });

  it('supports toast placement, close, and pause on hover or focus', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    const el = showToast('Queued', { type: 'info', placement: 'top-start', duration: 1000 });

    expect(document.querySelector('.uif-toast-stack-top-start')?.contains(el)).toBe(true);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(1200);
    expect(el.isConnected).toBe(true);

    el.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(999);
    expect(el.isConnected).toBe(true);
    vi.advanceTimersByTime(1);
    expect(el.isConnected).toBe(false);

    const closable = showToast('Close me', { duration: 5000 });
    closable.querySelector<HTMLButtonElement>('[data-uif-action="close"]')?.click();
    expect(closable.isConnected).toBe(false);
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

  it('opens modal dialogs with focus trap and Escape dismissal', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <button id="open" data-uif-action="open" data-uif-target="#modal">Open</button>
      <div id="modal" data-uif="modal" hidden>
        <div data-uif-role="dialog">
          <button id="first">First</button>
          <button id="last" data-uif-action="close">Close</button>
        </div>
      </div>`;
    initAll(document);

    const modal = document.querySelector<HTMLElement>('#modal');
    const first = document.querySelector<HTMLButtonElement>('#first');
    const last = document.querySelector<HTMLButtonElement>('#last');

    document.querySelector('#open')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal?.hidden).toBe(false);
    expect(modal?.dataset.uifState).toBe('open');
    expect(document.querySelector('[data-uif-role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(first);

    last?.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(modal?.hidden).toBe(true);
    expect(modal?.dataset.uifState).toBe('closed');
  });

  it('keeps static-backdrop modals open on backdrop click and Escape', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <button id="open" data-uif-action="open" data-uif-target="#modal">Open</button>
      <div id="modal" class="uif-modal" data-uif="modal" data-uif-backdrop="static" hidden>
        <div id="backdrop" data-uif-role="backdrop"></div>
        <div data-uif-role="dialog" class="uif-modal-dialog uif-modal-lg">
          <button id="close" data-uif-action="close">Close</button>
        </div>
      </div>`;
    initAll(document);

    const modal = document.querySelector<HTMLElement>('#modal');
    document.querySelector('#open')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal?.hidden).toBe(false);

    document.querySelector('#backdrop')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal?.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(modal?.hidden).toBe(false);

    document.querySelector('#close')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(modal?.hidden).toBe(true);
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

  it('toggles dropdown panels and closes on item selection', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <div data-uif="dropdown">
        <button id="trigger" data-uif-role="trigger">Menu</button>
        <div id="panel" data-uif-role="panel">
          <button data-uif-role="item">Archive</button>
        </div>
      </div>`;
    initAll(document);

    const trigger = document.querySelector<HTMLElement>('#trigger');
    const panel = document.querySelector<HTMLElement>('#panel');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(panel?.getAttribute('role')).toBe('menu');
    expect(panel?.hidden).toBe(true);

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hidden).toBe(false);

    document.querySelector('[data-uif-role="item"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);
  });

  it('supports dropdown menu keyboard navigation and disabled item skipping', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <div data-uif="dropdown">
        <button id="trigger" data-uif-role="trigger">Actions</button>
        <div id="panel" data-uif-role="panel">
          <button id="archive">Archive</button>
          <div id="separator" data-uif-role="separator"></div>
          <button id="disabled" disabled>Disabled</button>
          <button id="export">Export</button>
        </div>
      </div>`;
    initAll(document);

    const trigger = document.querySelector<HTMLButtonElement>('#trigger');
    const panel = document.querySelector<HTMLElement>('#panel');
    const archive = document.querySelector<HTMLButtonElement>('#archive');
    const disabled = document.querySelector<HTMLButtonElement>('#disabled');
    const exportButton = document.querySelector<HTMLButtonElement>('#export');
    const separator = document.querySelector<HTMLElement>('#separator');

    expect(archive?.getAttribute('role')).toBe('menuitem');
    expect(archive?.tabIndex).toBe(-1);
    expect(separator?.getAttribute('role')).toBe('separator');
    expect(disabled?.getAttribute('aria-disabled')).toBe('true');

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(panel?.hidden).toBe(false);
    expect(document.activeElement).toBe(archive);

    archive?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(exportButton);

    exportButton?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(archive);

    archive?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(exportButton);

    exportButton?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(archive);

    archive?.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(exportButton);

    archive?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(panel?.hidden).toBe(true);
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('toggles popovers through the shared overlay stack', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <div data-uif="popover">
        <button id="trigger" data-uif-role="trigger">Details</button>
        <div id="panel" data-uif-role="panel"><button>Close target</button></div>
      </div>`;
    initAll(document);

    const trigger = document.querySelector<HTMLElement>('#trigger');
    const panel = document.querySelector<HTMLElement>('#panel');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.dataset.uifState).toBe('closed');

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel?.hidden).toBe(false);
    expect(panel?.dataset.uifState).toBe('open');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(getOverlayStack()).toContain(panel);

    trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(panel?.hidden).toBe(true);
    expect(panel?.dataset.uifState).toBe('closed');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(getOverlayStack()).not.toContain(panel);
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
