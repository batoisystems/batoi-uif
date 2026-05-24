import { describe, expect, it, vi } from 'vitest';
import { isInitialized, mount, registerComponent, resolveTarget, setText, setTrustedHTML, swapTrustedHTML, unmount } from './index.js';

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

  it('renders text safely and makes trusted HTML explicit', () => {
    const target = document.createElement('div');
    setText(target, '<img src=x onerror=alert(1)>');
    expect(target.innerHTML).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(() => setTrustedHTML(target, '<strong>Unsafe</strong>')).toThrow(/untrusted HTML/);
    setTrustedHTML(target, '<strong>Trusted</strong>', { trusted: true });
    expect(target.innerHTML).toBe('<strong>Trusted</strong>');
  });

  it('swaps trusted HTML and returns the updated element', () => {
    document.body.innerHTML = '<section id="target">Old</section>';
    const target = document.querySelector('#target') as HTMLElement;
    const updated = swapTrustedHTML(target, '<article id="next">New</article>', 'outer');
    expect(updated.id).toBe('next');
    expect(document.querySelector('#target')).toBeNull();
  });
});
