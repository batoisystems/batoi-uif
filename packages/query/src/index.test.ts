import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureTrustedTypes } from '@batoi/uif-dom';
import { delegate, fragment, serialize, trigger, uif } from './index.js';

afterEach(() => configureTrustedTypes(null));

describe('query', () => {
  it('updates classes, attributes, text, and html', () => {
    document.body.innerHTML = '<div class="item"></div>';
    uif('.item').addClass('active').attr('role', 'status').text('Ready');
    expect(document.querySelector('.item')?.classList.contains('active')).toBe(true);
    expect(uif('.item').attr('role')).toBe('status');
    expect(uif('.item').text()).toBe('Ready');
  });

  it('delegates events', () => {
    document.body.innerHTML = '<section><button class="save">Save</button></section>';
    const fn = vi.fn();
    const off = delegate(document.body, 'click', '.save', fn);
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    off();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('serializes forms and creates fragments', () => {
    document.body.innerHTML = '<form><input name="name" value="Ada"><input name="tag" value="a"><input name="tag" value="b"></form>';
    expect(serialize(document.querySelector('form') as HTMLFormElement)).toEqual({ name: 'Ada', tag: ['a', 'b'] });
    expect(fragment('<p>Hi</p>').firstElementChild?.tagName).toBe('P');
  });

  it('routes trusted string insertion through the configured HTML policy', () => {
    const createHTML = vi.fn((value: string) => value);
    configureTrustedTypes({ createHTML });
    document.body.innerHTML = '<div class="item"></div>';

    uif('.item').html('<strong>One</strong>').append('<em>Two</em>').prepend('<span>Zero</span>');
    fragment('<p>Three</p>');

    expect(createHTML).toHaveBeenCalledTimes(4);
    expect(uif('.item').html()).toBe('<span>Zero</span><strong>One</strong><em>Two</em>');
  });

  it('triggers custom events', () => {
    const fn = vi.fn();
    document.addEventListener('demo', fn);
    trigger(document.body, 'demo', { ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
