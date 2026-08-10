import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
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
  const packages = join(work, 'packages');
  mkdirSync(packages);
  const directories = readdirSync(new URL('../packages/', import.meta.url)).sort();
  const localDirectories = new Map();
  for (const directory of directories) {
    const pkg = JSON.parse(readFileSync(new URL(`../packages/${directory}/package.json`, import.meta.url), 'utf8'));
    localDirectories.set(pkg.name, directory);
  }
  for (const directory of directories) {
    const packagePath = new URL(`../packages/${directory}/package.json`, import.meta.url);
    const packageRoot = fileURLToPath(new URL(`../packages/${directory}/`, import.meta.url));
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    const packed = JSON.parse(run(npm, ['pack', '--json', '--pack-destination', work, '--workspace', pkg.name]))[0];
    const workspace = join(packages, directory);
    for (const file of packed.files) {
      const target = join(workspace, file.path);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(packageRoot, file.path), target);
    }
    dependencies[pkg.name] = `file:packages/${directory}`;
    if (directory !== 'css') imports.push(pkg.name);
  }
  for (const directory of directories) {
    const manifestPath = join(packages, directory, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const name of Object.keys(manifest[field] ?? {})) {
        const dependencyDirectory = localDirectories.get(name);
        if (dependencyDirectory) manifest[field][name] = `file:../${dependencyDirectory}`;
      }
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  writeFileSync(join(work, 'package.json'), `${JSON.stringify({ private: true, type: 'module', workspaces: ['packages/*'], dependencies }, null, 2)}\n`);
  run(npm, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], work);
  run(node, ['--input-type=module', '--eval', `await Promise.all(${JSON.stringify(imports)}.map((name) => import(name)));`], work);
} finally {
  rmSync(work, { recursive: true, force: true });
}

process.stdout.write('Packed install smoke test passed\n');
