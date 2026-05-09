import { describe, expect, it, vi } from 'vitest';
import { initAll } from './index.js';

describe('components', () => {
  it('does not fail on duplicate init', () => {
    const el = document.createElement('div');
    el.dataset.uif = 'modal';
    document.body.appendChild(el);
    initAll();
    initAll();
    expect(el.getAttribute('role')).toBe('dialog');
  });

  it('toggles a drawer through data-uif-action', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button data-uif-action="toggle" data-uif-target="#drawer">Toggle</button>
      <aside id="drawer" data-uif="drawer" hidden></aside>
    `;
    document.body.appendChild(root);
    initAll(root);
    root.querySelector('button').click();
    expect(root.querySelector('#drawer').dataset.uifState).toBe('open');
  });

  it('supports declarative toast action', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const root = document.createElement('div');
    root.innerHTML = '<button data-uif-action="toast" data-uif-message="Saved">Toast</button>';
    document.body.appendChild(root);
    initAll(root);
    root.querySelector('button').click();
    expect(document.body.textContent).toContain('Saved');
  });
});
