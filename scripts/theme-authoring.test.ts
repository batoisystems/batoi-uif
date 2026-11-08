import { afterEach, describe, expect, it } from 'vitest';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { createAuthoringService, serveStdio } from '../tools/theme/server.mjs';
import { starterTheme } from '../tools/theme/compiler.mjs';
import { containedPath, writeArtifact } from '../tools/theme/workspace.mjs';

const workspaces: string[] = [];
const workspace = () => { const p = mkdtempSync(join(tmpdir(), 'uif-authoring-test-')); workspaces.push(p); return p; };
afterEach(() => workspaces.splice(0).forEach((p) => rmSync(p, { recursive: true, force: true })));

describe('governed authoring tools', () => {
  it('supports discovery, validation, build, preview, diff and export through MCP JSON-RPC', () => {
    const service = createAuthoringService();
    const init = service.rpc({ jsonrpc: '2.0', id: 1, method: 'initialize' });
    expect(init.result.serverInfo.name).toBe('batoi-uif-authoring');
    const catalog = service.rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    expect(catalog.result.tools).toHaveLength(7);
    expect(service.rpc({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeUndefined();
    const theme = starterTheme();
    const built = service.call('uif_theme_build', { theme });
    expect(service.call('uif_theme_validate', { theme }).valid).toBe(true);
    expect(service.call('uif_theme_preview', { artifactId: built.artifactId, profile: 'mobile' }).html).toContain('mobile');
    expect(service.call('uif_theme_export', { artifactId: built.artifactId }).files['theme.css']).toContain('--uif-text:');
    expect(service.call('uif_theme_diff', { base: built.artifactId, candidate: built.artifactId }).changedFiles).toEqual([]);
    expect(() => service.call('uif_theme_apply', { artifactId: built.artifactId })).toThrow(/disabled/);
  });

  it('requires an explicit backend write scope and rejects stale replacement', () => {
    const root = workspace();
    const service = createAuthoringService({ workspace: root, allowApply: true });
    const theme = starterTheme();
    const first = service.call('uif_theme_build', { theme });
    expect(service.call('uif_theme_apply', { artifactId: first.artifactId }).applied).toBe(true);
    expect(() => service.call('uif_theme_apply', { artifactId: first.artifactId })).toThrow(/expected/);
    theme.tokens.text.$value = '#000000';
    const next = service.call('uif_theme_build', { theme });
    expect(() => service.call('uif_theme_apply', { artifactId: next.artifactId, expectedBase: 'wrong' })).toThrow(/changed/);
    expect(service.call('uif_theme_apply', { artifactId: next.artifactId, expectedBase: first.artifactId }).rollbackAvailable).toBe(true);
    const audit = readFileSync(join(root, '.uif-audit.jsonl'), 'utf8');
    expect(audit).toContain(next.artifactId);
    expect(audit).not.toContain('#000000');
  });

  it('bounds artifact lifetime and rejects unknown/path arguments and symlinks', () => {
    let now = 0;
    const service = createAuthoringService({ now: () => now });
    const result = service.call('uif_theme_build', { theme: starterTheme() });
    now = 900001;
    expect(() => service.call('uif_theme_export', { artifactId: result.artifactId })).toThrow(/expired/);
    expect(() => service.call('uif_catalog', { path: '/etc/passwd' })).toThrow(/Unknown/);
    const root = workspace();
    expect(() => containedPath(root, '../outside')).toThrow();
    symlinkSync(join(root, 'absent'), join(root, 'link'));
    expect(() => containedPath(root, 'link/theme')).toThrow(/Symlink/);
    expect(() => writeArtifact(root, '../outside', starterTheme())).toThrow();
  });

  it('detects user edits, exports a rebuildable source and rejects audit symlinks before application', () => {
    const root = workspace();
    const theme = starterTheme();
    const first = writeArtifact(root, theme.name, theme);
    writeFileSync(join(root, theme.name, 'theme.css'), '/* user edit */');
    expect(() => writeArtifact(root, theme.name, theme, { expectedBase: first.artifactId, allowReplace: true })).toThrow(/files changed/);
    const service = createAuthoringService({ workspace: root, allowApply: true });
    const next = starterTheme('another');
    const built = service.call('uif_theme_build', { theme: next });
    expect(JSON.parse(service.call('uif_theme_export', { artifactId: built.artifactId }).files['uif.theme.json'])).toEqual(next);
    symlinkSync(join(root, 'absent'), join(root, '.uif-audit.jsonl'));
    expect(() => service.call('uif_theme_apply', { artifactId: built.artifactId })).toThrow(/Symlink/);
  });

  it('bounds stdio messages while receiving and recovers on the next line', () => {
    const input = new PassThrough();
    let output = '';
    serveStdio(input, { write(text: string) { output += text; } });
    input.write('x'.repeat(110001));
    input.write('\n{"jsonrpc":"2.0","id":9,"method":"ping"}\n');
    expect(JSON.parse(output).id).toBe(9);
    input.end();
  });

  it('rejects a changed candidate identity before creating or replacing a theme', () => {
    const root = workspace();
    const theme = starterTheme();
    expect(() => writeArtifact(root, theme.name, theme, { expectedArtifactId: 'wrong' })).toThrow(/reviewed artifact/);
    expect(existsSync(join(root, theme.name))).toBe(false);
    expect(existsSync(join(root, '.uif-apply.lock'))).toBe(false);
    const first = writeArtifact(root, theme.name, theme);
    const original = readFileSync(join(root, theme.name, 'theme.css'), 'utf8');
    theme.tokens.text.$value = '#000000';
    expect(() => writeArtifact(root, theme.name, theme, { allowReplace: true, expectedBase: first.artifactId, expectedArtifactId: first.artifactId })).toThrow(/reviewed artifact/);
    expect(readFileSync(join(root, theme.name, 'theme.css'), 'utf8')).toBe(original);
  });

  it('binds MCP apply to reviewed bytes when checkout compiler inputs change', () => {
    // Disposable checkout: never alter the running repository's foundation input.
    const checkout = workspace();
    mkdirSync(join(checkout, 'tools'));
    mkdirSync(join(checkout, 'packages/css'), { recursive: true });
    cpSync(resolve('tools/theme'), join(checkout, 'tools/theme'), { recursive: true });
    const foundation = join(checkout, 'packages/css/foundation.css');
    cpSync(resolve('packages/css/foundation.css'), foundation);
    const root = workspace();
    // Native Node imports this disposable checkout, not Vitest's transformed module cache.
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import { readFileSync, writeFileSync, existsSync } from 'node:fs';
      import { join } from 'node:path';
      const { createAuthoringService } = await import(process.argv[1]);
      const { starterTheme } = await import(new URL('./compiler.mjs', process.argv[1]));
      const service = createAuthoringService({ workspace: process.argv[3], allowApply: true });
      const built = service.call('uif_theme_build', { theme: starterTheme() });
      writeFileSync(process.argv[2], readFileSync(process.argv[2], 'utf8') + '\\n/* changed compiler input */\\n');
      assert.throws(() => service.call('uif_theme_apply', { artifactId: built.artifactId }), /reviewed artifact/);
      assert.equal(existsSync(join(process.argv[3], 'workspace')), false);
      const rebuilt = service.call('uif_theme_build', { theme: starterTheme() });
      assert.notEqual(rebuilt.artifactId, built.artifactId);
      assert.equal(service.call('uif_theme_apply', { artifactId: rebuilt.artifactId }).artifactId, rebuilt.artifactId);
      process.stdout.write('reviewed identity preserved');
    `, pathToFileURL(join(checkout, 'tools/theme/server.mjs')).href, foundation, root], { encoding: 'utf8', timeout: 10000 });
    expect(result).toBe('reviewed identity preserved');
  });
});
