import { describe, expect, it } from 'vitest';
import { uifActions, uifAttributes, uifErrors, uifEvents, uifStates, uifValues } from './attributes.js';
import { getUIFComponentContract, uifComponentContracts } from './component-contracts.js';

describe('component contracts', () => {
  it('covers every declarative component with v3 metadata', () => {
    expect(Object.keys(uifComponentContracts).sort()).toEqual([...uifValues].sort());
    Object.values(uifComponentContracts).forEach((contract) => {
      expect(contract.version).toBe(3);
      expect(contract.package).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(contract.attributes).toContain('data-uif');
      expect(contract.semanticFallback.length).toBeGreaterThan(3);
      expect(contract.accessibility?.length).toBeGreaterThan(0);
      expect(contract.security?.length).toBeGreaterThan(0);
      expect(Object.isFrozen(contract)).toBe(true);
    });
  });

  it('returns undefined for extension-defined names', () => {
    expect(getUIFComponentContract('custom-widget')).toBeUndefined();
  });

  it('closes every component contract over the canonical registries', () => {
    const registries = {
      attributes: new Set<string>(uifAttributes),
      actions: new Set<string>(uifActions),
      events: new Set<string>(uifEvents),
      states: new Set<string>(uifStates),
      errors: new Set<string>(uifErrors),
    };
    Object.values(uifComponentContracts).forEach((contract) => {
      (Object.keys(registries) as Array<keyof typeof registries>).forEach((field) => {
        expect(contract[field].filter((value) => !registries[field].has(value)), `${contract.name}.${field}`).toEqual([]);
      });
    });
  });
});
