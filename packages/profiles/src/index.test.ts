import { describe, expect, it } from 'vitest';
import { getUIFProfile, uifProfiles } from './index.js';

describe('public profiles', () => {
  it('defines every approved v3 profile with stable package metadata', () => {
    expect(Object.keys(uifProfiles)).toEqual(['all', 'rad', 'dashboard', 'mobile', 'desktop', 'agent']);
    expect(getUIFProfile('agent')).toMatchObject({ version: 3, entryPoint: '@batoi/uif-profiles/agent' });
    expect(getUIFProfile('rad').packages).toContain('rad-adapter');
    expect(Object.isFrozen(getUIFProfile('mobile').packages)).toBe(true);
  });
});
