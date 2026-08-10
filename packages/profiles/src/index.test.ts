import { describe, expect, it } from 'vitest';
import { getUIFCapabilityGroup, getUIFProfile, uifCapabilityGroups, uifProfiles } from './index.js';

describe('public profiles', () => {
  it('defines every approved v3 profile with stable package metadata', () => {
    expect(Object.keys(uifProfiles)).toEqual(['all', 'rad', 'dashboard', 'mobile', 'desktop', 'agent']);
    expect(getUIFProfile('agent')).toMatchObject({ version: 3, entryPoint: '@batoi/uif-profiles/agent' });
    expect(getUIFProfile('rad').packages).toContain('rad-adapter');
    expect(Object.isFrozen(getUIFProfile('mobile').packages)).toBe(true);
  });

  it('defines consolidated capability groups without hiding package boundaries', () => {
    expect(Object.keys(uifCapabilityGroups)).toEqual(['dom', 'interaction', 'shells', 'offline']);
    expect(getUIFCapabilityGroup('dom')).toMatchObject({ version: 3, preferredEntryPoints: ['@batoi/uif-dom'] });
    expect(getUIFCapabilityGroup('interaction').packages).toEqual(['actions', 'effects', 'overlays', 'components']);
    expect(Object.isFrozen(getUIFCapabilityGroup('offline').preferredEntryPoints)).toBe(true);
  });
});
