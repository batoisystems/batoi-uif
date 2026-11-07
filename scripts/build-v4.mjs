import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { constants, gzipSync, brotliCompressSync } from 'node:zlib';
import { build, transform } from 'esbuild';
import { buildCSSFamily, styleDependencies } from './v4-css.mjs';
import { workspaceSource } from './workspace-source.mjs';
import { compileTheme, starterTheme } from '../tools/theme/compiler.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/v4/', root);
mkdirSync(out, { recursive: true });
const budgets = JSON.parse(readFileSync(new URL('release-budgets.json', root), 'utf8')).consumerGzipBytes;
const consumers = {};
const files = {};
for (const profile of ['essential', 'web', 'rad', 'mobile', 'desktop']) {
  const entry = profile === 'essential' ? 'essential.ts' : `v4/${profile}.ts`;
  const result = await build({ entryPoints: [`packages/profiles/src/${entry}`], plugins: [workspaceSource], bundle: true, minify: true, format: 'esm', target: 'es2022', write: false, metafile: true });
  const inputs = Object.keys(result.metafile.inputs).sort();
  const forbidden = inputs.filter((name) => /(?:micro-app|agent|\/icons\/|\/editor\/|\/charts\/|\/migration)/.test(name));
  if (forbidden.length) throw new Error(`${profile} graph contains optional modules: ${forbidden.join(', ')}`);
  if (result.outputFiles.length !== 1 || Object.values(result.metafile.outputs).some((output) => output.imports.length)) throw new Error(`${profile} must be one self-contained ESM file`);
  files[`${profile}.js`] = result.outputFiles[0].contents;
  consumers[profile] = { inputs, styles: styleDependencies[profile], javascript: `${profile}.js`, css: `${profile}.css`, initialRequests: 2 };
}
for (const family of Object.keys(styleDependencies)) {
  files[`${family}.css`] = Buffer.from((await transform(buildCSSFamily(root, family), { loader: 'css', minify: true })).code);
  if (family !== 'full') writeFileSync(new URL(`packages/css/${family}.css`, root), files[`${family}.css`]);
}
const artifacts = {};
for (const [name, contents] of Object.entries(files)) {
  writeFileSync(new URL(name, out), contents);
  artifacts[name] = { bytes: contents.length, gzip: gzipSync(contents, { level: 6 }).length, brotli: brotliCompressSync(contents, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC } }).length, integrity: `sha384-${createHash('sha384').update(contents).digest('base64')}` };
}
const frameworkVersion = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).version;
for (const [name, budget] of Object.entries(budgets)) {
  const javascript = artifacts[`${name}.js`]?.gzip ?? 0;
  const css = artifacts[`${name}.css`].gzip;
  if (javascript > budget.javascript || css > budget.css || javascript + css > budget.total) throw new Error(`${name} consumer budget exceeded: JS=${javascript}, CSS=${css}`);
  if (consumers[name]) consumers[name].gzipBytes = { javascript, css, total: javascript + css };
}
const report = { schemaVersion: 1, contractVersion: 4, frameworkVersion, compression: { gzipLevel: 6, brotliQuality: 11, brotliMode: 'generic' }, artifacts, consumers, initialRequests: 2, essentialInputs: consumers.essential.inputs, note: 'Include exactly one standalone profile; each owns its module graph. Bootstrap, app content/assets and optional lazy features are additional.' };
writeFileSync(new URL('manifest.json', out), `${JSON.stringify(report, null, 2)}\n`);
const theme = compileTheme(starterTheme());
const themeOut = new URL('theme/', out);
mkdirSync(themeOut, { recursive: true });
for (const [name, contents] of Object.entries(theme.files)) writeFileSync(new URL(name, themeOut), contents);
const js = artifacts['essential.js'].gzip;
const css = artifacts['essential.css'].gzip;
process.stdout.write(`V4 essential: JS ${js} + CSS ${css} = ${js + css} gzip bytes; foundation ${artifacts['foundation.css'].gzip}\n`);
for (const [name, entry] of Object.entries(consumers)) process.stdout.write(`${name}: ${JSON.stringify(entry.gzipBytes)}\n`);
