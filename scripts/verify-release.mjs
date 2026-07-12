import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { URL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { JSDOM } from 'jsdom';
import { declarationAPI } from './release-api.mjs';

const root = new URL('..', import.meta.url);
const failures = [];
const budgets = readJson('release-budgets.json');
const rootPackage = readJson('package.json');
const lockfile = readJson('package-lock.json');
const apiBaseline = readJson('release-api.json');
const securityBoundaries = readJson('security-boundaries.json');

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, root), 'utf8'));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const [path, entry] of Object.entries(lockfile.packages ?? {})) {
  if (!path.startsWith('node_modules/') || typeof entry?.resolved !== 'string' || !entry.resolved.startsWith('https://registry.npmjs.org/')) continue;
  const tarball = new URL(entry.resolved).pathname;
  assert(tarball.endsWith(`-${entry.version}.tgz`), `${path} lockfile tarball does not match version ${entry.version}`);
}

const packages = await readdir(new URL('packages', root), { withFileTypes: true });
const packageDirectories = packages.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const boundaryPackages = Object.keys(securityBoundaries.packages ?? {}).sort();
assert(securityBoundaries.schemaVersion === 1, `security boundary schema ${securityBoundaries.schemaVersion ?? 'missing'} is not supported`);
assert(JSON.stringify(boundaryPackages) === JSON.stringify(packageDirectories), 'security boundary package inventory is incomplete or stale');
const boundaryCategories = new Set(securityBoundaries.categories ?? []);
for (const [name, entry] of Object.entries(securityBoundaries.packages ?? {})) {
  assert(Array.isArray(entry.boundaries) && entry.boundaries.every((category) => boundaryCategories.has(category)), `${name} has an invalid security boundary category`);
  assert(typeof entry.policy === 'string' && entry.policy.trim().length >= 20, `${name} is missing a security boundary policy`);
}
for (const entry of packages) {
  if (!entry.isDirectory()) continue;
  const pkgPath = `packages/${entry.name}/package.json`;
  const pkg = readJson(pkgPath);
  assert(pkg.version === rootPackage.version, `${pkg.name} version ${pkg.version} does not match ${rootPackage.version}`);
  assert(pkg.license === rootPackage.license, `${pkg.name} license ${pkg.license ?? 'missing'} does not match ${rootPackage.license}`);
  const deps = Object.keys(pkg.dependencies ?? {});
  assert(deps.every((name) => name.startsWith('@batoi/')), `${pkg.name} has external runtime dependencies: ${deps.join(', ')}`);
  if (entry.name === 'css') {
    assert(pkg.exports?.['.'], `${pkg.name} is missing CSS export`);
    assert(pkg.files?.includes('*.css'), `${pkg.name} publish files must include CSS files`);
    const cssExport = pkg.exports?.['.'];
    if (typeof cssExport === 'string') assert(existsSync(new URL(`packages/${entry.name}/${cssExport.replace(/^\.\//, '')}`, root)), `${pkg.name} CSS export ${cssExport} is missing`);
    continue;
  }
  assert(pkg.files?.includes('dist'), `${pkg.name} publish files must include dist`);
  assert(pkg.exports?.['.']?.import, `${pkg.name} is missing package import export`);
  assert(pkg.exports?.['.']?.types, `${pkg.name} is missing package type export`);
  for (const field of ['import', 'types']) {
    const target = pkg.exports?.['.']?.[field];
    if (target) assert(existsSync(new URL(`packages/${entry.name}/${target.replace(/^\.\//, '')}`, root)), `${pkg.name} ${field} export ${target} is missing`);
  }
  const packageBudget = budgets.packageGzipBytes[entry.name];
  assert(Number.isFinite(packageBudget), `${pkg.name} is missing a package gzip budget`);
  const dist = new URL(`packages/${entry.name}/dist/`, root);
  if (Number.isFinite(packageBudget) && existsSync(dist)) {
    assert(!readdirSync(dist, { recursive: true }).some((file) => typeof file === 'string' && file.endsWith('.map')), `${pkg.name} contains undeclared source maps`);
    const files = readdirSync(dist, { recursive: true })
      .filter((file) => typeof file === 'string' && file.endsWith('.js'))
      .map((file) => readFileSync(new URL(file, dist)));
    if (files.length) {
      const gzip = gzipSync(Buffer.concat(files)).length;
      assert(gzip <= packageBudget, `${pkg.name} package gzip size ${gzip} exceeds ${packageBudget} bytes`);
    }
  }
}

for (const name of readdirSync(new URL('examples/', root)).sort()) {
  const path = `examples/${name}/package.json`;
  if (!existsSync(new URL(path, root))) continue;
  const example = readJson(path);
  if (example.version) {
    assert(example.version === rootPackage.version, `${example.name} version ${example.version} does not match ${rootPackage.version}`);
    assert(lockfile.packages?.[`examples/${name}`]?.version === example.version, `${example.name} lockfile version is stale`);
  }
  assert(example.private === true, `${example.name} example workspace must remain private`);
}

const messagingFiles = ['README.md', 'apps/docs/index.html', 'examples/index.html', 'examples/desktop-shell/index.html', ...readdirSync(new URL('examples/professional-showcase/', root)).filter((name) => name.endsWith('.html')).map((name) => `examples/professional-showcase/${name}`)];
const currentMessaging = messagingFiles.map((path) => readFileSync(new URL(path, root), 'utf8')).join('\n');
for (const obsolete of ['Expected v1 `data-uif`', 'v0 moves from core foundation', 'Examples · v2.6', '"version":"v1.0"']) {
  assert(!currentMessaging.includes(obsolete), `current release messaging still contains: ${obsolete}`);
}

assert(apiBaseline.version === rootPackage.version, `API baseline version ${apiBaseline.version} does not match ${rootPackage.version}`);
assert(apiBaseline.schemaVersion === 2, `API baseline schema ${apiBaseline.schemaVersion ?? 'missing'} is not supported`);
for (const [name, expected] of Object.entries(apiBaseline.packages ?? {})) {
  const declaration = new URL(`packages/${name}/dist/index.d.ts`, root);
  assert(existsSync(declaration), `${name} public declaration is missing`);
  if (!existsSync(declaration)) continue;
  const current = declarationAPI(declaration);
  const currentNames = new Set(current.exports);
  const removed = expected.exports.filter((entry) => !currentNames.has(entry));
  const changed = expected.exports.filter((entry) => currentNames.has(entry) && expected.signatures?.[entry] !== current.signatures[entry]);
  assert(!removed.length, `${name} removed public exports: ${removed.join(', ')}`);
  assert(!changed.length, `${name} changed public signatures: ${changed.join(', ')}`);
}

for (const file of ['dist/uif.esm.js', 'dist/uif.iife.js', 'dist/uif.css']) {
  const url = new URL(file, root);
  assert(existsSync(url), `${file} is missing`);
  if (existsSync(url)) {
    const bytes = statSync(url).size;
    const gzip = gzipSync(readFileSync(url)).length;
    assert(bytes > 0 && gzip > 0, `${file} is empty`);
    const budget = budgets.artifactGzipBytes?.[file] ?? budgets.browserGzipBytes;
    assert(gzip <= budget, `${file} gzip size ${gzip} exceeds ${budget} bytes`);
  }
}

const integrityPath = new URL('dist/integrity.json', root);
assert(existsSync(integrityPath), 'dist/integrity.json is missing');
if (existsSync(integrityPath)) {
  const integrity = readJson('dist/integrity.json');
  assert(integrity.version === rootPackage.version, `integrity manifest version ${integrity.version} does not match ${rootPackage.version}`);
  const artifactNames = readdirSync(new URL('dist/', root)).filter((name) => name !== 'integrity.json').sort();
  assert(!artifactNames.some((name) => name.endsWith('.map')), 'root distribution contains undeclared source maps');
  const manifestNames = Object.keys(integrity.files ?? {}).sort();
  assert(JSON.stringify(manifestNames) === JSON.stringify(artifactNames), 'integrity manifest artifact list is stale');
  for (const name of artifactNames) {
    const bytes = readFileSync(new URL(`dist/${name}`, root));
    const entry = integrity.files?.[name];
    assert(entry?.bytes === bytes.length, `${name} integrity byte size is stale`);
    assert(entry?.gzipBytes === gzipSync(bytes).length, `${name} integrity gzip size is stale`);
    assert(entry?.sha256 === createHash('sha256').update(bytes).digest('hex'), `${name} SHA-256 checksum is stale`);
    assert(entry?.sri === `sha384-${createHash('sha384').update(bytes).digest('base64')}`, `${name} SRI checksum is stale`);
  }
}

const uif = await import(new URL('dist/uif.esm.js', root).href);

function createSmokeDom() {
  const dom = new JSDOM(
    '<!doctype html><button data-uif="button" data-uif-action="open" data-uif-target="#modal"><span data-uif-icon="plus"></span>Open</button><div id="modal" data-uif="modal" hidden><button>Close</button></div><div data-uif="progress" data-uif-value="50"></div><input data-uif-filter-target="[data-row]"><article data-row>Alpha</article><article data-row>Beta</article>',
    { url: 'http://localhost/' },
  );
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.CSS = dom.window.CSS;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  globalThis.matchMedia = dom.window.matchMedia;
  return dom;
}

let dom = createSmokeDom();
const timings = [];
for (let i = 0; i < 3; i += 1) {
  dom = createSmokeDom();
  const started = performance.now();
  uif.start(dom.window.document);
  timings.push(performance.now() - started);
}
const elapsed = Math.min(...timings);
const modal = dom.window.document.querySelector('#modal');
const progress = dom.window.document.querySelector('[data-uif="progress"]');
const filter = dom.window.document.querySelector('[data-uif-filter-target]');
const icon = dom.window.document.querySelector('[data-uif-icon="plus"] svg');

assert(elapsed < budgets.initMilliseconds, `component init smoke test exceeded ${budgets.initMilliseconds} ms: ${timings.map((timing) => timing.toFixed(2)).join(', ')} ms`);
assert(icon?.classList.contains('uif-icon'), 'icon smoke test did not mount data-uif-icon');
assert(modal?.getAttribute('role') === 'dialog', 'modal smoke test did not set dialog role');
assert(progress?.getAttribute('role') === 'progressbar', 'progress smoke test did not set progressbar role');
assert(progress?.getAttribute('aria-valuenow') === '50', 'progress smoke test did not set aria-valuenow');
filter.value = 'alpha';
filter.dispatchEvent(new dom.window.Event('input'));
assert(dom.window.document.querySelectorAll('[data-row]')[1].hidden, 'declarative filter smoke test did not hide unmatched row');

if (failures.length) {
  process.stderr.write(`${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Release verification passed\n');
