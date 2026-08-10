import { describe, expect, it } from 'vitest';
import { uifValues } from './attributes.js';
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
});
