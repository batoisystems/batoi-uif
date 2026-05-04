import { describe, expect, it } from 'vitest';
import { initAll } from './index.js';

describe('component init guard', () => {
  it('does not fail on duplicate init', () => {
    const el = document.createElement('div');
    el.dataset.uif = 'modal';
    document.body.appendChild(el);
    initAll();
    initAll();
    expect(el.getAttribute('role')).toBe('dialog');
  });
});
