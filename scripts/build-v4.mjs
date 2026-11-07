import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { build, transform } from 'esbuild';
import { buildCSSFamily } from './v4-css.mjs';
import { workspaceSource } from './workspace-source.mjs';
import { compileTheme, starterTheme } from '../tools/theme/compiler.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/v4/', root);
mkdirSync(out, { recursive: true });
const result = await build({ entryPoints: ['packages/profiles/src/essential.ts'], plugins: [workspaceSource], bundle: true, minify: true, format: 'esm', target: 'es2022', write: false, metafile: true });
const forbidden = Object.keys(result.metafile.inputs).filter((name) => /(?:micro-app|agent|\/icons\/|\/editor\/|\/charts\/|\/migration)/.test(name));
if (forbidden.length) throw new Error(`Essential graph contains optional modules: ${forbidden.join(', ')}`);
const files = { 'essential.js': result.outputFiles[0].contents };
for (const family of ['foundation', 'essential', 'full']) {
  files[`${family}.css`] = Buffer.from((await transform(buildCSSFamily(root, family), { loader: 'css', minify: true })).code);
  if (family !== 'full') writeFileSync(new URL(`packages/css/${family}.css`, root), files[`${family}.css`]);
}
const artifacts = {};
for (const [name, contents] of Object.entries(files)) {
  writeFileSync(new URL(name, out), contents);
  artifacts[name] = { bytes: contents.length, gzip: gzipSync(contents).length, brotli: brotliCompressSync(contents).length, integrity: `sha384-${createHash('sha384').update(contents).digest('base64')}` };
}
const frameworkVersion = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).version;
const report = { schemaVersion: 1, contractVersion: 4, frameworkVersion, artifacts, initialRequests: 2, essentialInputs: Object.keys(result.metafile.inputs).sort() };
writeFileSync(new URL('manifest.json', out), `${JSON.stringify(report, null, 2)}\n`);
const theme = compileTheme(starterTheme());
const themeOut = new URL('theme/', out);
mkdirSync(themeOut, { recursive: true });
for (const [name, contents] of Object.entries(theme.files)) writeFileSync(new URL(name, themeOut), contents);
const js = artifacts['essential.js'].gzip;
const css = artifacts['essential.css'].gzip;
if (js > 24000 || css > 10000 || artifacts['foundation.css'].gzip > 8000) throw new Error(`V4 consumer budget exceeded: JS=${js}, CSS=${css}`);
process.stdout.write(`V4 essential: JS ${js} + CSS ${css} = ${js + css} gzip bytes; foundation ${artifacts['foundation.css'].gzip}\n`);
