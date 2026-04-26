import { describe, expect, it } from 'vitest';
import { resolveTarget } from './index.js';

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
});
