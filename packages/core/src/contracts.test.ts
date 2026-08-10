import { describe, expect, it } from 'vitest';
import {
  assertSafeObject,
  assertSafePropertyPath,
  findUnsafeObjectPaths,
  isSafePropertyPath,
  parseUIFJSON,
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

  it('rejects oversized configuration before parsing it', () => {
    const result = parseUIFConfiguration(`{"value":"${'x'.repeat(20)}"}`, {
      limits: { maxCharacters: 10, maxBytes: 10 },
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'limit' })]));
    expect(result.value).toEqual({});
  });

  it('normalizes bounded JSON payloads without prototype-bearing records', () => {
    const result = parseUIFJSON<Array<{ name: string }>>('[{"name":"demo","__proto__":{"polluted":true}}]', {
      shape: 'array',
      limits: { maxItems: 2, maxDepth: 4, maxKeys: 10 },
    });
    expect(result.valid).toBe(false);
    expect(result.value?.[0]).toEqual({ name: 'demo' });
    expect(Object.getPrototypeOf(result.value?.[0] as object)).toBeNull();
    expect(result.issues[0]?.code).toBe('unsafe-key');
    expect(parseUIFJSON('{}', { shape: 'array' }).issues[0]?.code).toBe('invalid-shape');
    expect(parseUIFJSON('[1,2,3]', { shape: 'array', limits: { maxItems: 2 } }).issues[0]?.code).toBe('limit');
  });
});
