import { describe, expect, it } from 'vitest';
import { initMobileShell, showOfflineBanner } from './index.js';

describe('mobile', () => {
  it('initializes shell regions and placeholders', () => {
    document.body.innerHTML = `
      <main>
        <header data-uif-role="topbar"></header>
        <section data-uif-role="content"></section>
        <nav data-uif-role="bottom-nav"></nav>
        <section data-uif-role="sheet"></section>
      </main>`;
    const shell = document.querySelector('main') as HTMLElement;
    initMobileShell(shell);
    expect(shell.classList.contains('uif-mobile-shell')).toBe(true);
    expect(document.querySelector('[data-uif-role="sheet"]')?.classList.contains('uif-sheet-modal')).toBe(true);
  });

  it('shows offline banner', () => {
    expect(showOfflineBanner('Offline').textContent).toBe('Offline');
  });
});
