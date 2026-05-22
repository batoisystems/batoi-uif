import { describe, expect, it, vi } from 'vitest';
import { emit, init, on, parseOptions, registerPlugin } from './index.js';

describe('core', () => {
  it('parses json options', () => {
    const el = document.createElement('div');
    el.setAttribute('data-uif-options', '{"open":true}');
    expect(parseOptions(el)).toEqual({ open: true });
  });

  it('parses semicolon options', () => {
    const el = document.createElement('div');
    el.setAttribute('data-uif-options', 'delay:20;enabled:true;name:demo');
    expect(parseOptions(el)).toEqual({ delay: 20, enabled: true, name: 'demo' });
  });

  it('emits and listens', () => {
    const fn = vi.fn();
    const off = on('uif:test', fn);
    emit('uif:test', { ok: true });
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });

  it('runs plugins during init lifecycle', () => {
    const setup = vi.fn();
    registerPlugin({ name: 'test-plugin', setup });
    const app = init(document.createElement('main'), { mode: 'test' });
    expect(setup).toHaveBeenCalledWith(app);
  });
});
