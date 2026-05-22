import { describe, expect, it, vi } from 'vitest';
import { isInitialized, mount, registerComponent, resolveTarget, unmount } from './index.js';

describe('dom', () => {
  it('resolves target expressions', () => {
    document.body.innerHTML = '<section id="target"></section><div class="wrap"><button></button></div>';
    const button = document.querySelector('button') as HTMLElement;
    expect(resolveTarget(button, '#target')).toBe(document.querySelector('#target'));
    expect(resolveTarget(button, 'parent')).toBe(button.parentElement);
    expect(resolveTarget(button, 'closest:.wrap')).toBe(button.parentElement);
  });

  it('mounts components once and unmounts them', () => {
    document.body.innerHTML = '<div data-uif="demo"></div>';
    const init = vi.fn();
    const destroy = vi.fn();
    const el = document.querySelector('[data-uif]') as HTMLElement;
    registerComponent({ name: 'demo', init, destroy });
    mount(document.body);
    mount(document.body);
    expect(init).toHaveBeenCalledTimes(1);
    expect(isInitialized(el)).toBe(true);
    unmount(document.body);
    expect(destroy).toHaveBeenCalledWith(el);
  });
});
