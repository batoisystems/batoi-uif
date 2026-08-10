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
  it('classifies every runtime workspace in the security-boundary inventory', () => {
    const packages = readdirSync(resolve(root, 'packages')).filter((name) => {
      try {
        JSON.parse(readFileSync(resolve(root, 'packages', name, 'package.json'), 'utf8'));
        return true;
      } catch {
        return false;
      }
    }).sort();
    const inventory = JSON.parse(readFileSync(resolve(root, 'security-boundaries.json'), 'utf8')) as { packages: Record<string, unknown> };
    expect(Object.keys(inventory.packages).sort()).toEqual(packages);
  });

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

  it('requires registered capabilities at every explicit cross-origin URL boundary', () => {
    const violations = sourceFiles().flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(/isSafeURL\([\s\S]*?\}\)/g)].flatMap((match, index) =>
        match[0].includes('allowCrossOrigin') && !match[0].includes('requireCapability') ? [`${file}:${index}`] : [],
      );
    });
    expect(violations).toEqual([]);
  });

  it('keeps declarative JSON payloads behind the bounded core parser', () => {
    const governed = ['actions', 'ai', 'charts', 'effects', 'mcp'];
    const violations = governed.filter((name) => readFileSync(resolve(root, 'packages', name, 'src/index.ts'), 'utf8').includes('JSON.parse('));
    expect(violations).toEqual([]);
  });

  it('uses reviewed GitHub Action versions or immutable commit pins', () => {
    const workflow = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8');
    const references = [...workflow.matchAll(/uses:\s*[^@\s]+@([^\s]+)/g)].map((match) => match[1]);
    expect(references.length).toBeGreaterThan(0);
    expect(references.every((reference) => /^v\d+(?:\.\d+(?:\.\d+)?)?$/.test(reference) || /^[a-f0-9]{40}$/.test(reference))).toBe(true);
  });

  it('does not contain credential-like literals in framework source', () => {
    const findings = sourceFiles().flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*['"][A-Za-z0-9_./+=-]{16,}['"]/i.test(source) ? [file] : [];
    });
    expect(findings).toEqual([]);
  });
});
