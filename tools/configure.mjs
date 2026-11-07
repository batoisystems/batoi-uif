import { build, transform } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import process from 'node:process';
import { components } from './theme/catalog.mjs';
import { workspaceSource } from '../scripts/workspace-source.mjs';
import { buildCSSFamily } from '../scripts/v4-css.mjs';

const root = new URL('../', import.meta.url);
export async function configureApplication(input) {
  if (!input || Object.keys(input).some((k) => !['components', 'icons'].includes(k))) throw new Error('Expected an explicit component/icon manifest');
  const selected = input.components;
  const names = input.icons ?? [];
  if (!Array.isArray(selected) || selected.length > components.length || new Set(selected).size !== selected.length || selected.some((name) => !components.some((c) => c.name === name))) throw new Error('Unsupported or duplicate component');
  if (!Array.isArray(names) || names.length > 64 || new Set(names).size !== names.length || names.some((name) => typeof name !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(name))) throw new Error('Expected at most 64 explicit icon names');
  const definitions = components.filter((c) => selected.includes(c.name));
  const imports = definitions.map((c) => `import { ${c.initializer} } from '${c.module}';`).join('\n');
  const iconSource = names.length ? await import('../packages/icons/dist/index.js') : undefined;
  const subset = Object.fromEntries(names.sort().map((name) => {
    if (!Object.hasOwn(iconSource.icons, name)) throw new Error(`Unknown icon: ${name}`);
    return [name, iconSource.icons[name]];
  }));
  const source = `import {createUIF} from '@batoi/uif-components/application';\n${imports}\n${names.length ? `import {createIconRenderer} from '@batoi/uif-icons/runtime';const icons=createIconRenderer(${JSON.stringify(subset)});` : ''}\nexport function start(root=document){const app=createUIF(root,[${definitions.map((c) => `{name:'${c.name}',init:${c.initializer}}`).join(',')}]);app.refresh();${names.length ? 'icons.mount(root);' : ''}return app;}`;
  const result = await build({ stdin: { contents: source, resolveDir: fileURLToPath(root), sourcefile: 'uif-application.ts', loader: 'ts' }, bundle: true, minify: true, format: 'esm', target: 'es2022', write: false, metafile: true, plugins: [workspaceSource] });
  const inputs = Object.keys(result.metafile.inputs).sort();
  if (inputs.some((p) => /(?:\/icons\/src\/(?:icons|sets|metadata)|\/charts\/|\/editor\/|micro-app|tools\/theme)/.test(p))) throw new Error('Optional catalog/capability entered consumer graph');
  const css = await transform(buildCSSFamily(root, selected.length ? 'essential' : 'foundation'), { loader: 'css', minify: true });
  const files = { 'application.js': result.outputFiles[0].contents, 'application.css': Buffer.from(css.code) };
  const version = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).version;
  const artifacts = Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, { bytes: bytes.length, gzip: gzipSync(bytes).length, brotli: brotliCompressSync(bytes).length, integrity: `sha384-${createHash('sha384').update(bytes).digest('base64')}` }]));
  return { files, manifest: { schemaVersion: 1, frameworkVersion: version, components: selected.slice().sort(), icons: names, inputs, artifacts, initialRequests: 2, note: 'One ESM and one CSS include; external bootstrap and application content/assets are additional. Styles use a supported whole family, not a markup purge.' } };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [input, destination] = process.argv.slice(2);
    if (!input || !destination) throw new Error('Usage: npm run configure -- manifest.json new-output-directory');
    const source = readFileSync(resolve(input));
    if (source.length > 4096) throw new Error('Application manifest exceeds 4,096 bytes');
    const result = await configureApplication(JSON.parse(source.toString('utf8')));
    const out = resolve(destination);
    mkdirSync(out); // Refuse existing directories; never overwrite application files.
    for (const [name, bytes] of Object.entries(result.files)) writeFileSync(resolve(out, name), bytes, { flag: 'wx' });
    writeFileSync(resolve(out, 'manifest.json'), JSON.stringify(result.manifest, null, 2) + '\n', { flag: 'wx' });
    process.stdout.write(JSON.stringify(result.manifest, null, 2) + '\n');
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
