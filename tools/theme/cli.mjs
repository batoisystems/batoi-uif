import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { compileTheme, starterTheme, validateTheme, stableJSON } from './compiler.mjs';
import { writeArtifact } from './workspace.mjs';

const [command, file, output, expectedBase] = process.argv.slice(2);
try {
  if (command === 'create') {
    if (!file) throw new Error('Usage: create <manifest.json> [theme-name]');
    writeFileSync(resolve(file), stableJSON(starterTheme(output)) + '\n', { flag: 'wx' });
    process.stdout.write('Theme manifest created\n');
  } else {
    if (!file) throw new Error('Usage: validate|check|build|preview|export <manifest.json> [output-directory]');
    const source = readFileSync(resolve(file), 'utf8');
    const validation = validateTheme(source);
    if (command === 'validate' || command === 'check') {
      process.stdout.write(JSON.stringify({ valid: validation.valid, issues: validation.issues }, null, 2) + '\n');
      if (!validation.valid) process.exitCode = 1;
    } else if (['build', 'preview', 'export', 'apply'].includes(command)) {
      if (!validation.valid) throw new Error(validation.issues.map((i) => `${i.path}: ${i.message}`).join('\n'));
      if (!output) throw new Error('An explicit output directory is required');
      const root = resolve(output, '..');
      mkdirSync(root, { recursive: true });
      const result = writeArtifact(root, resolve(output).slice(root.length + 1), validation.theme, { expectedBase, allowReplace: command === 'apply' });
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (command === 'diff') {
      if (!output) throw new Error('Usage: diff <base.json> <candidate.json>');
      const before = compileTheme(JSON.parse(source));
      const after = compileTheme(JSON.parse(readFileSync(resolve(output), 'utf8')));
      process.stdout.write(JSON.stringify({ base: before.id, candidate: after.id, changedFiles: Object.keys(after.files).filter((f) => after.files[f] !== before.files[f]) }, null, 2) + '\n');
    } else throw new Error('Unknown theme command');
  }
} catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
