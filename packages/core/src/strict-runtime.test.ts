import { afterEach, describe, expect, it } from 'vitest';
import { parseOptions as strictOptions } from './runtime.js';
import { parseOptions as legacyOptions } from './index.js';
import { configureCompatibility, getCompatibilityMode } from './compatibility.js';
import { claimApplicationRoot } from './ownership.js';

afterEach(() => {
  configureCompatibility(null);
  document.body.replaceChildren();
});
describe('strict isolated runtime', () => {
  it('rejects legacy/unsafe configuration without changing facade compatibility', () => {
    configureCompatibility({ mode: 'v2' });
    const el = document.createElement('div');
    el.dataset.uifOptions = 'enabled:true;count:2';
    expect(strictOptions(el)).toEqual({});
    expect(legacyOptions(el)).toEqual({ enabled: true, count: 2 });
    expect(getCompatibilityMode()).toBe('v2');
    el.dataset.uifOptions = '{"ok":true,"__proto__":{"injected":true}}';
    expect(strictOptions(el)).toEqual({});
    el.dataset.uifOptions = '{"ok":true}';
    expect(strictOptions(el)).toEqual({ ok: true });
  });
  it('coordinates strict and compatibility roots and detects moved roots', () => {
    const outer = document.createElement('main');
    const inner = document.createElement('div');
    document.body.append(outer);
    const legacy = claimApplicationRoot(outer, 'compatibility');
    const selected = claimApplicationRoot(inner);
    outer.append(inner);
    expect(() => selected.assert()).toThrow(/overlap/);
    selected.destroy();
    expect(() => claimApplicationRoot(inner)).toThrow(/overlap/);
    legacy.destroy();
    const remounted = claimApplicationRoot(inner);
    remounted.assert();
    remounted.destroy();
    remounted.destroy();
  });
});
