import { existsSync, readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { URL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { JSDOM } from 'jsdom';

const root = new URL('..', import.meta.url);
const failures = [];

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, root), 'utf8'));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const packages = await readdir(new URL('packages', root), { withFileTypes: true });
for (const entry of packages) {
  if (!entry.isDirectory()) continue;
  const pkgPath = `packages/${entry.name}/package.json`;
  const pkg = readJson(pkgPath);
  const deps = Object.keys(pkg.dependencies ?? {});
  assert(deps.every((name) => name.startsWith('@batoi/')), `${pkg.name} has external runtime dependencies: ${deps.join(', ')}`);
  if (entry.name === 'css') {
    assert(pkg.exports?.['.'], `${pkg.name} is missing CSS export`);
    continue;
  }
  assert(pkg.exports?.['.']?.import, `${pkg.name} is missing package import export`);
  assert(pkg.exports?.['.']?.types, `${pkg.name} is missing package type export`);
}

for (const file of ['dist/uif.esm.js', 'dist/uif.iife.js', 'dist/uif.css']) {
  const url = new URL(file, root);
  assert(existsSync(url), `${file} is missing`);
  if (existsSync(url)) {
    const bytes = statSync(url).size;
    const gzip = gzipSync(readFileSync(url)).length;
    assert(bytes > 0 && gzip > 0, `${file} is empty`);
    assert(gzip < 80_000, `${file} gzip size exceeds 80 KB`);
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

assert(elapsed < 50, `component init smoke test exceeded 50 ms: ${timings.map((timing) => timing.toFixed(2)).join(', ')} ms`);
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
