import { lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { compileTheme, stableJSON } from './compiler.mjs';

export function containedPath(root, name) {
  if (typeof name !== 'string' || !name || isAbsolute(name) || name.includes('\\') || name.includes('\0')) throw new Error('Expected a relative workspace path');
  const base = realpathSync(root);
  const destination = resolve(base, name);
  const rel = relative(base, destination);
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error('Path escapes workspace');
  let current = base;
  for (const part of rel.split(sep)) {
    current = join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Symlinks are not permitted in theme destinations');
  }
  return destination;
}

export function writeArtifact(root, name, theme, { expectedBase, expectedArtifactId, allowReplace = false } = {}) {
  const lock = containedPath(root, '.uif-apply.lock');
  mkdirSync(lock);
  try { return writeUnlocked(root, name, theme, { expectedBase, expectedArtifactId, allowReplace }); }
  finally { rmSync(lock, { recursive: true }); }
}

function writeUnlocked(root, name, theme, { expectedBase, expectedArtifactId, allowReplace }) {
  const destination = containedPath(root, name);
  const artifact = compileTheme(theme);
  if (expectedArtifactId !== undefined && artifact.id !== expectedArtifactId) throw new Error('Compiler inputs changed since the reviewed artifact; rebuild and review before applying');
  if (theme.assets?.length) throw new Error('Asset materialization is not enabled; use a token-only pack or explicitly reviewed local assets');
  if (existsSync(destination)) {
    if (!allowReplace || !expectedBase) throw new Error('Existing themes require explicit replacement and the expected artifact hash');
    const receipt = JSON.parse(readFileSync(containedPath(destination, 'receipt.json'), 'utf8'));
    if (receipt.artifactId !== expectedBase) throw new Error('Theme changed since the reviewed base');
    const manifestText = readFileSync(containedPath(destination, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestText);
    const actual = { 'manifest.json': manifestText };
    for (const file of Object.keys(manifest.files ?? {})) {
      if (!/^[a-z-]+\.(css|html)$/.test(file) && file !== 'uif.theme.json') throw new Error('Unsafe artifact manifest');
      actual[file] = readFileSync(containedPath(destination, file), 'utf8');
    }
    if (createHash('sha256').update(stableJSON(actual)).digest('hex') !== expectedBase) throw new Error('Theme files changed since the reviewed base');
  } else if (expectedBase) throw new Error('Expected base does not exist');
  const stage = containedPath(root, `.stage-${randomUUID()}`);
  const backup = containedPath(root, `.rollback-${randomUUID()}`);
  mkdirSync(stage);
  let backedUp = false;
  try {
    for (const [file, data] of Object.entries(artifact.files)) writeFileSync(join(stage, file), data, { flag: 'wx' });
    writeFileSync(join(stage, 'receipt.json'), stableJSON({ schemaVersion: 1, artifactId: artifact.id, inputHash: artifact.manifest.inputHash }) + '\n');
    mkdirSync(dirname(destination), { recursive: true });
    if (existsSync(destination)) { renameSync(destination, backup); backedUp = true; }
    renameSync(stage, destination);
  } catch (error) {
    if (backedUp && !existsSync(destination)) renameSync(backup, destination);
    if (existsSync(stage)) rmSync(stage, { recursive: true });
    throw error;
  }
  return { artifactId: artifact.id, destination, rollback: backedUp ? backup : null, manifest: artifact.manifest };
}
