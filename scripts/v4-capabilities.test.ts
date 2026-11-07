// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('evidence-labelled capability inventory', () => {
  it('covers legacy names without presenting decorators or pending acceptance as implemented v4 engines', () => {
    const matrix = JSON.parse(readFileSync('docs/generated/v4-capabilities.json', 'utf8'));
    const reference = JSON.parse(readFileSync('docs/generated/contracts.json', 'utf8'));
    expect(matrix.components.map((c) => c.name).sort()).toEqual(Object.keys(reference.components).sort());
    expect(matrix.components.filter((c) => c.status === 'v4-canonical-automated')).toHaveLength(6);
    expect(matrix.components.find((c) => c.name === 'wizard').status).toBe('presentational-adapter');
    expect(matrix.components.find((c) => c.name === 'table').status).toBe('v3-compatibility-v4-pending');
    expect(matrix.components.every((c) => c.manualAcceptance === 'pending')).toBe(true);
  });
});
