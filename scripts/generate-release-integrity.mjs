import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = new URL('..', import.meta.url);
const dist = new URL('dist/', root);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const files = {};

for (const name of readdirSync(dist).filter((entry) => entry !== 'integrity.json').sort()) {
  const bytes = readFileSync(new URL(name, dist));
  files[name] = {
    bytes: bytes.length,
    gzipBytes: gzipSync(bytes).length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    sri: `sha384-${createHash('sha384').update(bytes).digest('base64')}`,
  };
}

const manifest = { version: pkg.version, files };
writeFileSync(new URL('integrity.json', dist), `${JSON.stringify(manifest, null, 2)}\n`);
