import { writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { collectReleaseMetadata } from './release-metadata.mjs';

const root = new URL('..', import.meta.url);
const { sbom, provenance } = collectReleaseMetadata(root);
writeFileSync(new URL('dist/sbom.cdx.json', root), `${JSON.stringify(sbom, null, 2)}\n`);
writeFileSync(new URL('dist/provenance.json', root), `${JSON.stringify(provenance, null, 2)}\n`);
