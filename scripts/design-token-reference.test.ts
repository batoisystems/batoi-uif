// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collectDesignTokenReference, renderDesignTokenReference } from './design-token-reference.mjs';

const root = new URL('..', import.meta.url);

describe('generated design token reference', () => {
  it('matches the shipped CSS token contract exactly', () => {
    const current = collectDesignTokenReference(root);
    expect(JSON.parse(readFileSync(new URL('docs/generated/design-tokens.json', root), 'utf8'))).toEqual(current);
    expect(readFileSync(new URL('docs/generated/design-tokens.md', root), 'utf8')).toBe(renderDesignTokenReference(current));
  });

  it('classifies every token and includes accessibility modes', () => {
    const current = collectDesignTokenReference(root);
    expect(Object.values(current.tokens).every((token) => token.category && token.stability)).toBe(true);
    expect(current.modes).toEqual(expect.arrayContaining(['compact', 'dark', 'forced-colors', 'high-contrast', 'light', 'reduced-motion']));
  });
});
