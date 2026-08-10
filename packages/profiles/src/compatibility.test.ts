import { afterEach, describe, expect, it } from 'vitest';
import { configureCompatibility, getCompatibilityMode } from '@batoi/uif-core';

afterEach(() => configureCompatibility(null));

describe('v3 compatibility build', () => {
  it('enables diagnostics while retaining v2 behavior', async () => {
    configureCompatibility(null);
    const module = await import('./compatibility.js');
    expect(getCompatibilityMode()).toBe('diagnostic');
    expect(module.compatibilityBuild).toMatchObject({ version: 3, mode: 'diagnostic', behavior: 'v2-compatible' });
  }, 60_000);
});
