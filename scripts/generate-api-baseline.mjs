import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { declarationAPI } from './release-api.mjs';

const root = new URL('..', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const packages = {};

for (const name of readdirSync(new URL('packages/', root)).sort()) {
  const declaration = new URL(`packages/${name}/dist/index.d.ts`, root);
  if (existsSync(declaration)) packages[name] = declarationAPI(declaration);
}

writeFileSync(new URL('release-api.json', root), `${JSON.stringify({ schemaVersion: 2, version: pkg.version, packages }, null, 2)}\n`);
