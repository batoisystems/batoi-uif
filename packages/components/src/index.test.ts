import { describe, expect, it, vi } from 'vitest';
import { initAll, showToast } from './index.js';

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
});
