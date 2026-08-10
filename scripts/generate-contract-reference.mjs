import { mkdirSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { collectContractReference, renderContractReference } from './contract-reference.mjs';

const root = new URL('..', import.meta.url);
const output = new URL('docs/generated/', root);
mkdirSync(output, { recursive: true });
const reference = await collectContractReference(root);
writeFileSync(new URL('contracts.json', output), `${JSON.stringify(reference, null, 2)}\n`);
writeFileSync(new URL('contracts.md', output), renderContractReference(reference));
