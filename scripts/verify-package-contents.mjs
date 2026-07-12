import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const failures = [];

function targets(value, result = []) {
  if (typeof value === 'string' && value.startsWith('./')) result.push(value.slice(2));
  else if (value && typeof value === 'object') Object.values(value).forEach((entry) => targets(entry, result));
  return result;
}

for (const directory of readdirSync(new URL('../packages/', import.meta.url)).sort()) {
  const packagePath = new URL(`../packages/${directory}/package.json`, import.meta.url);
  if (!existsSync(packagePath)) continue;
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  const packed = spawnSync(npm, ['pack', '--dry-run', '--json', '--workspace', pkg.name], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: '/tmp/batoi-uif-npm-cache' },
  });
  if (packed.status !== 0) {
    failures.push(`${pkg.name} npm pack failed: ${(packed.stderr || packed.stdout).trim()}`);
    continue;
  }
  let manifest;
  try {
    manifest = JSON.parse(packed.stdout)[0];
  } catch {
    failures.push(`${pkg.name} npm pack returned invalid JSON`);
    continue;
  }
  const files = new Set(manifest.files.map((file) => file.path));
  const expected = new Set(['package.json', ...targets(pkg.exports), ...targets(pkg.main), ...targets(pkg.module), ...targets(pkg.types)]);
  expected.forEach((file) => {
    if (file.includes('*')) {
      const pattern = new RegExp(`^${file.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+')}$`);
      if (![...files].some((packedFile) => pattern.test(packedFile))) failures.push(`${pkg.name} packed output does not satisfy ${file}`);
    } else if (!files.has(file)) failures.push(`${pkg.name} packed output is missing ${file}`);
  });
  files.forEach((file) => {
    const allowed = file === 'package.json' || /^readme(?:\.md)?$/i.test(file) || /^licen[cs]e(?:\.md)?$/i.test(file) || file.startsWith('dist/') || (directory === 'css' && file.endsWith('.css'));
    if (!allowed || file.endsWith('.map') || /(^|\/)src\/|\.test\.|\.spec\./.test(file)) failures.push(`${pkg.name} packed unexpected file ${file}`);
  });
}

if (failures.length) {
  process.stderr.write(`${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Package content verification passed\n');
