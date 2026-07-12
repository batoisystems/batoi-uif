import { describe, expect, it, vi } from 'vitest';
import { configureTrustedTypes, getTrustedTypesPolicy, isInitialized, isSafeURL, mount, registerComponent, resolveTarget, safeQuerySelector, setSafeHTML, setText, setTrustedHTML, swapTrustedHTML, unmount } from './index.js';

describe('dom', () => {
  it('resolves target expressions', () => {
    document.body.innerHTML = '<section id="target"></section><div class="wrap"><button></button></div>';
    const button = document.querySelector('button') as HTMLElement;
    expect(resolveTarget(button, '#target')).toBe(document.querySelector('#target'));
    expect(resolveTarget(button, 'parent')).toBe(button.parentElement);
    expect(resolveTarget(button, 'closest:.wrap')).toBe(button.parentElement);
    expect(resolveTarget(button, '[invalid')).toBeNull();
    expect(safeQuerySelector('[invalid')).toBeNull();
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

  it('renders limited safe HTML without event handlers or unsafe URLs', () => {
    const target = document.createElement('div');
    setSafeHTML(target, '<p onclick="alert(1)">Hello <a href="javascript:alert(1)">link</a></p><script>alert(1)</script>');
    expect(target.querySelector('script')).toBeNull();
    expect(target.querySelector('p')?.hasAttribute('onclick')).toBe(false);
    expect(target.querySelector('a')?.hasAttribute('href')).toBe(false);
    expect(target.textContent).toContain('Hello link');
  });

  it('routes safe and trusted HTML sinks through an optional Trusted Types policy', () => {
    const calls: string[] = [];
    const policy = { createHTML: (input: string) => { calls.push(input); return input; } };
    configureTrustedTypes(policy);
    expect(getTrustedTypesPolicy()).toBe(policy);
    const target = document.createElement('div');
    setSafeHTML(target, '<strong>Safe</strong>');
    setTrustedHTML(target, '<em>Trusted</em>', { trusted: true });
    expect(calls).toEqual(['<strong>Safe</strong>', '<em>Trusted</em>']);
    configureTrustedTypes(null);
    expect(getTrustedTypesPolicy()).toBeNull();
  });

  it('applies URL policy by context and origin', () => {
    expect(isSafeURL('/docs', { context: 'navigation', sameOrigin: true })).toBe(true);
    expect(isSafeURL('mailto:team@example.com', { context: 'link' })).toBe(true);
    expect(isSafeURL('tel:+123456789', { context: 'link' })).toBe(true);
    expect(isSafeURL('javascript:alert(1)', { context: 'link' })).toBe(false);
    expect(isSafeURL('//evil.example/path', { context: 'network' })).toBe(false);
    expect(isSafeURL('data:image/svg+xml,<svg/>', { context: 'image' })).toBe(false);
    expect(isSafeURL('https://evil.example/path', { context: 'network', sameOrigin: true })).toBe(false);
  });

  it('swaps trusted HTML and returns the updated element', () => {
    document.body.innerHTML = '<section id="target">Old</section>';
    const target = document.querySelector('#target') as HTMLElement;
    const updated = swapTrustedHTML(target, '<article id="next">New</article>', 'outer');
    expect(updated.id).toBe('next');
    expect(document.querySelector('#target')).toBeNull();
  });
});
