import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
});
