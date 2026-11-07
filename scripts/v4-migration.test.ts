// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { inspectMigration, applyMigration } from '../tools/migrate.mjs';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('conservative 3 to 4 migration', () => {
  it('preserves static option values and rejects dynamic/ambiguous rewrites', () => {
    const result = inspectMigration('<div data-uif-options="enabled:true;count:2;name:Sample"></div>');
    expect(result.edits).toHaveLength(1);
    expect(result.output).toContain('&quot;enabled&quot;:true');
    expect(result.output).toContain('&quot;count&quot;:2');
    for (const raw of ['key:{{ value }}', 'count:0x10', 'constructor:yes', 'key:one;key:two', 'name:&amp;']) expect(inspectMigration(`<div data-uif-options="${raw}"></div>`).edits).toEqual([]);
    expect(inspectMigration('<div data-uif-options="key:two"></div>', 'page.php').edits).toEqual([]);
    expect(inspectMigration('<script>const example = \'data-uif-options="key:two"\';</script><!-- data-uif-options="key:three" --><textarea>data-uif-options="key:four"</textarea>').edits).toEqual([]);
  });
  it('requires a reviewed source hash, preserves a backup and fails stale application', () => {
    const root = mkdtempSync(join(tmpdir(), 'uif-migration-'));
    try {
      const file = join(root, 'page.html');
      const original = '<div data-uif-options="enabled:true"></div>';
      writeFileSync(file, original);
      const scanned = inspectMigration(original);
      expect(() => applyMigration(file, 'wrong')).toThrow(/Source changed/);
      const applied = applyMigration(file, scanned.sourceHash);
      expect(readFileSync(applied.backup, 'utf8')).toBe(original);
      expect(readFileSync(file, 'utf8')).toBe(scanned.output);
      expect(() => applyMigration(file, scanned.sourceHash)).toThrow(/Source changed/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
