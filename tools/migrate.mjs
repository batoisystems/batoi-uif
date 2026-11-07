import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, lstatSync, realpathSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { JSDOM } from 'jsdom';

const hash = (value) => createHash('sha256').update(value).digest('hex');
export function inspectMigration(source, name = 'input.html') {
  if (Buffer.byteLength(source) > 1000000) throw new Error('Migration input exceeds 1 MB');
  const diagnostics = [];
  const edits = [];
  const staticHTML = ['.html', '.htm'].includes(extname(name));
  const attributes = new Set();
  if (staticHTML) {
    // Parse inert HTML with source locations: never rewrite example text,
    // comments, script strings or textarea content just because a regex matches.
    const dom = new JSDOM(source, { includeNodeLocations: true });
    dom.window.document.querySelectorAll('[data-uif-options]').forEach((element) => {
      const location = dom.nodeLocation(element)?.attrs?.['data-uif-options'];
      if (location) attributes.add(location.startOffset);
    });
    dom.window.close();
  }
  const add = (code, index, message, fixable = false) => diagnostics.push({ code, line: source.slice(0, index).split('\n').length, message, fixable });
  for (const match of source.matchAll(/(?:autoStart|start)\s*\(\s*document\s*\)|uif\.(?:esm|iife)\.js/g)) add('compatibility-entry', match.index, 'Keep the full compatibility entry during migration; explicitly select v4 controls and styles before replacing startup.');
  for (const match of source.matchAll(/data-uif=["']tabs["']/g)) add('tabs-dom-review', match.index, 'Use a dedicated data-uif-role="tablist" containing tabs, with sibling panels. Verify IDs, labels and keyboard behavior.');
  for (const match of source.matchAll(/data-uif-options\s*=\s*(["'])(.*?)\1/g)) {
    const raw = match[2].trim();
    if (!raw || raw.startsWith('{')) continue;
    if (!staticHTML || !attributes.has(match.index) || /[&<>{}$`\\]/.test(raw)) {
      add('dynamic-options', match.index, 'Template/entity/executable context requires manual review; no automatic rewrite.'); continue;
    }
    const options = Object.create(null);
    let safe = true;
    for (const pair of raw.split(';').filter((v) => v.trim())) {
      const [key, ...tail] = pair.split(':');
      const field = key.trim();
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(field) || ['constructor', 'prototype', '__proto__'].includes(field) || Object.hasOwn(options, field)) { safe = false; break; }
      const value = tail.join(':').trim();
      if (!value || value === 'true') options[field] = true;
      else if (value === 'false') options[field] = false;
      else if (value === 'null') options[field] = null;
      else if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value) && Number.isFinite(Number(value))) options[field] = Number(value);
      else if (value !== '' && Number.isFinite(Number(value))) { safe = false; break; }
      else options[field] = value;
    }
    if (!safe) { add('ambiguous-options', match.index, 'Duplicate/unsafe keys or noncanonical numeric values require manual review.'); continue; }
    const encoded = JSON.stringify(options).replaceAll('&', '&amp;').replaceAll(match[1], match[1] === '"' ? '&quot;' : '&#39;');
    edits.push({ start: match.index, end: match.index + match[0].length, before: match[0], after: `data-uif-options=${match[1]}${encoded}${match[1]}` });
    add('legacy-options', match.index, 'Static legacy options can become JSON. Verify declared option keys before adopting the strict selective entry.', true);
  }
  let output = source;
  for (const edit of [...edits].reverse()) output = output.slice(0, edit.start) + edit.after + output.slice(edit.end);
  return { sourceHash: hash(source), diagnostics, edits, output, limitations: 'Conservative source-text scanner, not a JS/template parser. Fixes only static HTML attributes; no automatic startup, token, principal/storage or dynamic-template rewrites.' };
}

export function applyMigration(path, expectedHash) {
  if (lstatSync(path).isSymbolicLink()) throw new Error('Symlink inputs are not writable migration targets');
  const target = realpathSync(path);
  const source = readFileSync(target, 'utf8');
  const result = inspectMigration(source, target);
  if (!expectedHash || result.sourceHash !== expectedHash) throw new Error('Source changed; review a fresh dry run and supply its sourceHash');
  if (!result.edits.length) return { changed: false, sourceHash: result.sourceHash };
  const backup = `${target}.uif-v3-backup-${result.sourceHash.slice(0, 12)}`;
  writeFileSync(backup, source, { flag: 'wx', mode: lstatSync(target).mode & 0o777 });
  // Operate only in a user-owned, quiescent working tree; this is not an OS
  // sandbox or a transaction against concurrent hostile filesystem changes.
  if (hash(readFileSync(target)) !== expectedHash) throw new Error('Source changed after backup; nothing rewritten');
  writeFileSync(target, result.output);
  return { changed: true, backup, sourceHash: hash(result.output) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [file, operation, expected] = process.argv.slice(2);
    if (!file) throw new Error('Usage: npm run migrate -- file.html [--apply reviewed-sourceHash]');
    if (operation && operation !== '--apply') throw new Error('Only an explicit --apply operation may write');
    const result = operation === '--apply' ? applyMigration(resolve(file), expected) : inspectMigration(readFileSync(resolve(file), 'utf8'), file);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
