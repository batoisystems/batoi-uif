import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

function sourceFiles(): string[] {
  return readdirSync(resolve(root, 'packages'), { recursive: true })
    .filter((name): name is string => typeof name === 'string' && /src\/.+\.ts$/.test(name) && !name.endsWith('.test.ts'))
    .map((name) => resolve(root, 'packages', name));
}

describe('framework security policy', () => {
  it('keeps executable HTML writes behind the DOM trust boundary', () => {
    const assignments = sourceFiles().flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return /(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/.test(source) ? [file] : [];
    });
    expect(assignments).toEqual([resolve(root, 'packages/dom/src/index.ts')]);
    expect(readFileSync(assignments[0], 'utf8')).toContain('trustedTypesPolicy?.createHTML');
  });

  it('does not ship dynamic code execution primitives', () => {
    const findings = sourceFiles().flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return /\beval\s*\(|\bnew\s+Function\s*\(|document\.write\s*\(/.test(source) ? [file] : [];
    });
    expect(findings).toEqual([]);
  });

  it('keeps framework runtime dependencies inside the zero-dependency workspace', () => {
    const violations = readdirSync(resolve(root, 'packages')).flatMap((name) => {
      const manifestPath = resolve(root, 'packages', name, 'package.json');
      let manifest: { dependencies?: Record<string, string> };
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof manifest;
      } catch {
        return [];
      }
      return Object.keys(manifest.dependencies ?? {})
        .filter((dependency) => !dependency.startsWith('@batoi/uif-'))
        .map((dependency) => `${name}:${dependency}`);
    });
    expect(violations).toEqual([]);
  });
});
