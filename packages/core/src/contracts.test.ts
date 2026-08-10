import { describe, expect, it } from 'vitest';
import {
  assertSafeObject,
  assertSafePropertyPath,
  findUnsafeObjectPaths,
  isSafePropertyPath,
  parseUIFConfiguration,
  UIFError,
} from './contracts.js';

describe('shared contracts', () => {
  it('rejects reserved object and property path segments', () => {
    expect(isSafePropertyPath('workspace.filters.status')).toBe(true);
    expect(isSafePropertyPath('workspace.__proto__.polluted')).toBe(false);
    expect(() => assertSafePropertyPath('constructor.prototype.polluted')).toThrow(UIFError);
    const value = JSON.parse('{"safe":{"__proto__":{"polluted":true}}}') as unknown;
    expect(findUnsafeObjectPaths(value)).toContain('safe.__proto__');
    expect(() => assertSafeObject(value)).toThrow(/unsafe/i);
  });

  it('bounds object complexity and reports unsafe paths', () => {
    expect(findUnsafeObjectPaths({ a: { b: { c: true } } }, { maxDepth: 1 })).toContain('a.b');
    expect(findUnsafeObjectPaths({ a: 1, b: 2 }, { maxKeys: 1 })).toContain('b');
  });

  it('parses strict JSON configuration into a null-prototype record', () => {
    const result = parseUIFConfiguration('{"enabled":true,"unknown":1}', {
      allowedKeys: ['enabled'],
    });
    expect(result.valid).toBe(false);
    expect(result.value).toEqual({ enabled: true });
    expect(Object.getPrototypeOf(result.value)).toBeNull();
    expect(result.issues).toContainEqual(expect.objectContaining({ path: 'unknown', code: 'unknown-key' }));
  });

  it('removes reserved keys from nested configuration records', () => {
    const result = parseUIFConfiguration(
      '{"safe":{"name":"demo","__proto__":{"polluted":true}}}',
    );
    expect(result.valid).toBe(false);
    expect(result.value).toEqual({ safe: { name: 'demo' } });
    expect(Object.getPrototypeOf(result.value.safe as object)).toBeNull();
  });

  it('returns typed issues for malformed and non-object configuration', () => {
    expect(parseUIFConfiguration('{').issues[0]?.code).toBe('invalid-json');
    expect(parseUIFConfiguration('[]').issues[0]?.code).toBe('not-object');
  });
});
