import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { relative } from 'node:path';
import process from 'node:process';
import { declarationAPI } from './release-api.mjs';

const root = new URL('../', import.meta.url);
const baseline = JSON.parse(readFileSync(new URL('release-v3-baseline.json', root), 'utf8'));
if (!/^[a-f0-9]{40}$/.test(baseline.sourceCommit)) throw new Error('Expected immutable v3 source commit');
const historical = (url) => {
  const path = relative(fileURLToPath(root), fileURLToPath(url));
  if (path.startsWith('..')) throw new Error('Declaration escapes repository');
  try { return execFileSync('git', ['show', `${baseline.sourceCommit}:${path}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
};
const failures = [];
for (const name of Object.keys(baseline.packages)) {
  const entry = new URL(`packages/${name}/dist/index.d.ts`, root);
  const before = declarationAPI(entry, historical);
  const after = declarationAPI(entry);
  for (const exported of before.exports) {
    if (!after.exports.includes(exported)) failures.push(`${name}: removed ${exported}`);
    else if (before.signatures[exported] !== after.signatures[exported]) failures.push(`${name}: changed ${exported}`);
  }
}
if (failures.length) { process.stderr.write(failures.join('\n') + '\n'); process.exitCode = 1; }
else process.stdout.write(`V3 facade declarations retained against ${baseline.sourceCommit}; split re-exports and union order normalized.\n`);
