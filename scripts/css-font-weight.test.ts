import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const unsupportedWeight = /font-weight\s*:\s*(650|680|700|750|760|800|820|830|840|850)\b/g;

function filesBelow(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

describe('UIF font-weight hierarchy', () => {
  it('defines semantic role tokens and graduated heading defaults', () => {
    const tokens = readFileSync(resolve(root, 'packages/css/tokens.css'), 'utf8');
    const reset = readFileSync(resolve(root, 'packages/css/reset.css'), 'utf8');

    expect(tokens).toContain('--uif-weight-body:var(--uif-weight-regular)');
    expect(tokens).toContain('--uif-weight-component-title:var(--uif-weight-medium)');
    expect(tokens).toContain('--uif-weight-page-title:var(--uif-weight-semibold)');
    expect(reset).toContain('h1,h2{font-weight:var(--uif-weight-page-title)}');
    expect(reset).toContain('h3,h4,h5,h6{font-weight:var(--uif-weight-component-title)}');
  });

  it('does not ship unsupported heavy literal weights in shared CSS or examples', () => {
    const paths = [
      ...filesBelow(resolve(root, 'packages/css')),
      ...filesBelow(resolve(root, 'examples')),
    ].filter((path) => /\.(css|html)$/.test(path));

    const violations = paths.flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return [...source.matchAll(unsupportedWeight)].map((match) => ({ path, weight: match[1] }));
    });

    expect(violations).toEqual([]);
  });
});
