// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';

describe('provider-neutral CLI', () => {
  it('creates, validates, builds, checks, diffs and exports the same portable source', () => {
    const root = mkdtempSync(join(tmpdir(), 'uif-cli-'));
    const cli = resolve('tools/theme/cli.mjs');
    const run = (...args: string[]) => execFileSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
    try {
      run('create', 'theme.json', 'test-brand');
      expect(JSON.parse(run('validate', 'theme.json')).valid).toBe(true);
      expect(JSON.parse(run('check', 'theme.json')).valid).toBe(true);
      const build = JSON.parse(run('build', 'theme.json', 'built'));
      const exported = JSON.parse(run('export', 'theme.json', 'exported'));
      const preview = JSON.parse(run('preview', 'theme.json', 'preview'));
      expect(exported.artifactId).toBe(build.artifactId);
      expect(preview.artifactId).toBe(build.artifactId);
      expect(JSON.parse(run('diff', 'theme.json', 'theme.json')).changedFiles).toEqual([]);
      expect(JSON.parse(readFileSync(join(root, 'exported/uif.theme.json'), 'utf8')).name).toBe('test-brand');
      expect(spawnSync(process.execPath, [cli, 'create', 'theme.json'], { cwd: root }).status).not.toBe(0);
      expect(spawnSync(process.execPath, [cli, 'apply', 'theme.json', 'built', 'stale'], { cwd: root }).status).not.toBe(0);
      expect(JSON.parse(run('apply', 'theme.json', 'built', build.artifactId)).rollback).toContain('.rollback-');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
