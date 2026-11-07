import { expect, it } from 'vitest';
import { createIconRenderer } from './runtime.js';

it('renders only an explicit icon subset and escapes accessible labels', () => {
  const renderer = createIconRenderer({ plus: { body: '<path d="M0 1h2"/>' } });
  expect(renderer.icon('missing')).toBe('');
  expect(renderer.icon('plus', { title: '<script>' })).toContain('&lt;script&gt;');
  const el = document.createElement('span');
  el.dataset.uifIcon = 'plus';
  renderer.mount(el);
  expect(el.querySelector('svg')).not.toBeNull();
  expect(renderer.has('constructor')).toBe(false);
  expect(() => renderer.register('__proto__', { body: '' })).toThrow();
});
