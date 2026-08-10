import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureCompatibility, emit, init, on, parseOptions, registerPlugin, setAccent, setDensity } from './index.js';

describe('core', () => {
  afterEach(() => configureCompatibility(null));
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

  it('diagnoses legacy options and rejects them in strict v3 mode', () => {
    const el = document.createElement('div');
    el.dataset.uif = 'sample';
    el.dataset.uifOptions = 'loading:true;delay:50';
    const diagnostic = vi.fn();
    el.addEventListener('uif:runtime:diagnostic', diagnostic);
    expect(parseOptions(el)).toEqual({ loading: true, delay: 50 });
    configureCompatibility({ mode: 'v3' });
    expect(parseOptions(el)).toEqual({});
    expect(diagnostic).toHaveBeenLastCalledWith(expect.objectContaining({
      detail: expect.objectContaining({ issues: [expect.objectContaining({ code: 'legacy-options-rejected' })] }),
    }));
  });

  it('strips unsafe option keys from JSON and compatibility syntax', () => {
    const json = document.createElement('div');
    json.setAttribute('data-uif-options', '{"safe":true,"__proto__":{"polluted":true}}');
    const legacy = document.createElement('div');
    legacy.setAttribute('data-uif-options', 'safe:true;constructor:blocked');
    expect(parseOptions(json)).toEqual({ safe: true });
    expect(parseOptions(legacy)).toEqual({ safe: true });
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
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

  it('returns the active app for repeated init calls and destroys once', () => {
    const root = document.createElement('main');
    const destroyed = vi.fn();
    root.addEventListener('uif:destroy', destroyed);
    const first = init(root, { mode: 'first' });
    const second = init(root, { mode: 'second' });
    expect(second).toBe(first);
    expect(second.options).toEqual({ mode: 'first' });
    first.destroy();
    first.destroy();
    expect(first.destroyed).toBe(true);
    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  it('restarts a destroyed root with new options', () => {
    const root = document.createElement('main');
    const first = init(root, { mode: 'first' });
    const second = first.restart({ mode: 'second' });
    expect(first.destroyed).toBe(true);
    expect(second).not.toBe(first);
    expect(second.options).toEqual({ mode: 'second' });
  });

  it('applies density and accent hooks', () => {
    setDensity('compact');
    setAccent('#123456');
    expect(document.documentElement.dataset.uifDensity).toBe('compact');
    expect(document.documentElement.style.getPropertyValue('--uif-accent')).toBe('#123456');
  });

  it('rejects invalid accent values', () => {
    expect(() => setAccent('not a color; background: url(https://evil.example)')).toThrow(
      /invalid accent color/i,
    );
  });
});
