// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collectContractReference, renderContractReference } from './contract-reference.mjs';

const root = new URL('..', import.meta.url);

describe('generated contract reference', () => {
  it('matches typed runtime definitions exactly', async () => {
    const current = await collectContractReference(root);
    const generated = JSON.parse(readFileSync(new URL('docs/generated/contracts.json', root), 'utf8'));
    expect(generated).toEqual(current);
    expect(readFileSync(new URL('docs/generated/contracts.md', root), 'utf8')).toBe(renderContractReference(current));
  });

  it('covers every profile and declarative component', async () => {
    const current = await collectContractReference(root);
    expect(Object.keys(current.profiles)).toEqual(['all', 'rad', 'dashboard', 'mobile', 'desktop', 'agent']);
    expect(Object.keys(current.components).sort()).toEqual([...current.registries.components].sort());
  });
});
