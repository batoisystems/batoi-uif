// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

describe('stable documentation publication', () => {
  it('preserves docs, legacy examples and package runtime paths without backend tools', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'uif-pages-test-'));
    const output = join(temporary, 'site');
    try {
      execFileSync(process.execPath, ['scripts/build-pages.mjs', output]);
      const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
      expect(JSON.parse(readFileSync(join(output, 'release.json'), 'utf8')).version).toBe(version);
      expect(readFileSync(join(output, 'index.html'), 'utf8')).toContain(`Batoi UIF ${version}`);
      expect(readFileSync(join(output, 'apps/docs/index.html'), 'utf8')).toContain(`Batoi UIF ${version}`);
      for (const path of ['apps/docs/index.html', 'apps/docs/examples/v4-rad/index.html', 'apps/docs/reference/theme-authoring.md', 'examples/rad-crud/index.html', 'dist/uif.iife.js', 'packages/dom/dist/index.js']) expect(existsSync(join(output, path))).toBe(true);
      for (const path of ['tools', 'specs', 'node_modules', 'packages/dom/src']) expect(existsSync(join(output, path))).toBe(false);
      expect(() => execFileSync(process.execPath, ['scripts/build-pages.mjs', output], { stdio: 'pipe' })).toThrow();
    } finally { rmSync(temporary, { recursive: true, force: true }); }
  });
});
