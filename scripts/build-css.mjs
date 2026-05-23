import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const files = [
  'packages/css/reset.css',
  'packages/css/tokens.css',
  'packages/css/utilities.css',
  'packages/css/components.css',
];

const css = `${await Promise.all(files.map((file) => readFile(file, 'utf8'))).then((parts) => parts.join('\n'))}\n`;

await mkdir('dist', { recursive: true });
await copyFile('dist/index.js', 'dist/uif.esm.js');
await copyFile('dist/index.global.js', 'dist/uif.iife.js');
await writeFile('dist/uif.css', css);
