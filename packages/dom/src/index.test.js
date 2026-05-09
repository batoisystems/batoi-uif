import { describe, expect, it, vi } from 'vitest';
import { mount, registerComponent, resolveTarget } from './index.js';

describe('dom target resolver', () => {
  it('resolves target expressions', () => {
    const parent = document.createElement('div');
    const el = document.createElement('button');
    el.id = 'x';
    parent.appendChild(el);
    document.body.appendChild(parent);
    expect(resolveTarget(el, 'self')).toBe(el);
    expect(resolveTarget(el, 'parent')).toBe(parent);
    expect(resolveTarget(el, '#x')).toBe(el);
  });

  it('mounts the root node when it has data-uif', () => {
    const init = vi.fn();
    registerComponent({ name: 'sample', init });
    const el = document.createElement('div');
    el.dataset.uif = 'sample';
    mount(el);
    expect(init).toHaveBeenCalledWith(el);
  });
});
