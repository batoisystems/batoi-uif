import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, relative, sep } from 'node:path';
import process from 'node:process';

// Keep the repository-relative layout used by legacy examples and package imports.
const root = process.cwd();
const output = resolve(process.argv[2] ?? '.pages-site');
const rel = relative(root, output);
if (!rel || ['dist', 'docs', 'examples', 'packages', 'apps', 'scripts', 'tools'].some((name) => rel === name || rel.startsWith(`${name}${sep}`))) throw new Error('Choose a separate Pages output directory');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Pages publication requires a stable version');
if (existsSync(output)) throw new Error('Pages output already exists; choose a fresh directory');
mkdirSync(output);
const copy = (source, destination) => cpSync(join(root, source), join(output, destination), {
  recursive: true,
  filter: (path) => !path.split(sep).some((part) => ['node_modules', '.git', 'specs', '.DS_Store'].includes(part) || part === '.env' || part.startsWith('.env.')),
});
for (const path of ['dist', 'docs', 'examples']) copy(path, path);
for (const name of readdirSync(join(root, 'packages'))) {
  if (existsSync(join(root, 'packages', name, 'dist'))) copy(`packages/${name}/dist`, `packages/${name}/dist`);
}
copy('apps/docs/dist', 'apps/docs');
copy('apps/playground/dist', 'apps/playground');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
writeFileSync(join(output, '.nojekyll'), '');
writeFileSync(join(output, 'release.json'), JSON.stringify({ version, revision, documentation: 'apps/docs/index.html' }, null, 2) + '\n');
writeFileSync(join(output, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=./apps/docs/"><title>Batoi UIF ${version}</title></head><body><h1>Batoi UIF ${version}</h1><p><a href="./apps/docs/">Open the documentation and examples</a></p></body></html>\n`);
process.stdout.write(`Pages ${version} (${revision}) staged at ${output}\n`);
