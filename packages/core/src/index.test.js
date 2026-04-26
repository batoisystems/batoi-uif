import { describe, expect, it, vi } from 'vitest';
import { emit, on, parseOptions } from './index.js';

describe('core', () => {
  it('parses options json', () => {
    const el = document.createElement('div');
    el.setAttribute('data-uif-options', '{"a":1}');
    expect(parseOptions(el)).toEqual({ a: 1 });
  });

  it('emits and listens', () => {
    const fn = vi.fn();
    const off = on('uif:test', fn);
    emit('uif:test', { ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });
});
