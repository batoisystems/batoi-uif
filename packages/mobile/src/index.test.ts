import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hideOfflineBanner, initMobileShell, initSegmentedControl, showOfflineBanner } from './index.js';

describe('mobile', () => {
  beforeEach(() => {
    hideOfflineBanner();
    document.body.innerHTML = '';
  });

  it('initializes shell regions and placeholders', () => {
    document.body.innerHTML = `
      <main>
        <header data-uif-role="topbar"></header>
        <section data-uif-role="content"></section>
        <nav data-uif-role="bottom-nav"></nav>
        <section data-uif-role="sheet"></section>
      </main>`;
    const shell = document.querySelector('main') as HTMLElement;
    const controller = initMobileShell(shell);
    expect(initMobileShell(shell)).toBe(controller);
    expect(shell.classList.contains('uif-mobile-shell')).toBe(true);
    expect(document.querySelector('[data-uif-role="sheet"]')?.classList.contains('uif-sheet-modal')).toBe(true);
  });

  it('shows offline banner', () => {
    const banner = showOfflineBanner('Offline');
    expect(showOfflineBanner('Connection unavailable')).toBe(banner);
    expect(banner.textContent).toBe('Connection unavailable');
    expect(document.querySelectorAll('.uif-offline-banner')).toHaveLength(1);
    hideOfflineBanner();
    expect(banner.isConnected).toBe(false);
  });

  it('preserves declared segments and supports roving keyboard selection', () => {
    document.body.innerHTML = `<div data-uif-role="segmented"><button data-uif-role="segment">One</button><button data-uif-role="segment" aria-selected="true" data-uif-value="two">Two</button><button data-uif-role="segment">Three</button></div>`;
    const el = document.querySelector<HTMLElement>('[data-uif-role="segmented"]')!;
    const segments = Array.from(el.querySelectorAll<HTMLElement>('[data-uif-role="segment"]'));
    const changed = vi.fn();
    el.addEventListener('uif:segment-change', changed);
    const controller = initSegmentedControl(el);
    expect(initSegmentedControl(el)).toBe(controller);
    expect(segments[1]?.getAttribute('aria-selected')).toBe('true');
    expect(segments.map((segment) => segment.tabIndex)).toEqual([-1, 0, -1]);
    segments[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(segments[2]?.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(segments[2]);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ detail: expect.objectContaining({ segment: segments[2] }) }));
    controller.destroy();
    segments[0]?.click();
    expect(segments[2]?.getAttribute('aria-selected')).toBe('true');
  });
});
