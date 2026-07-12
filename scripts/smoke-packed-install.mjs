import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const node = process.execPath;
const work = mkdtempSync(join(tmpdir(), 'batoi-uif-pack-'));
const cache = join(tmpdir(), 'batoi-uif-npm-cache');

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, npm_config_cache: cache } });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout).trim());
  return result.stdout;
}

try {
  const dependencies = {};
  const imports = [];
  for (const directory of readdirSync(new URL('../packages/', import.meta.url)).sort()) {
    const packagePath = new URL(`../packages/${directory}/package.json`, import.meta.url);
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    const packed = JSON.parse(run(npm, ['pack', '--json', '--pack-destination', work, '--workspace', pkg.name]))[0];
    dependencies[pkg.name] = `file:${join(work, packed.filename)}`;
    if (directory !== 'css') imports.push(pkg.name);
  }
  writeFileSync(join(work, 'package.json'), `${JSON.stringify({ private: true, type: 'module', dependencies }, null, 2)}\n`);
  run(npm, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], work);
  run(node, ['--input-type=module', '--eval', `await Promise.all(${JSON.stringify(imports)}.map((name) => import(name)));`], work);
} finally {
  rmSync(work, { recursive: true, force: true });
}

process.stdout.write('Packed install smoke test passed\n');
