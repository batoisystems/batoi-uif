import { describe, expect, it } from 'vitest';
import { uifActions, uifAttributes, uifStates, uifValues } from './attributes.js';

describe('attribute registry', () => {
  it('contains blueprint attributes, values, actions, and states', () => {
    expect(uifAttributes).toContain('data-uif-value');
    expect(uifAttributes).toContain('data-uif-persist');
    expect(uifValues).toContain('tool-approval');
    expect(uifActions).toContain('approve');
    expect(uifStates).toContain('connected');
  });
});
