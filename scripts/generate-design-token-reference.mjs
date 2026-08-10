import { mkdirSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { collectDesignTokenReference, renderDesignTokenReference } from './design-token-reference.mjs';

const root = new URL('..', import.meta.url);
const output = new URL('docs/generated/', root);
mkdirSync(output, { recursive: true });
const reference = collectDesignTokenReference(root);
writeFileSync(new URL('design-tokens.json', output), `${JSON.stringify(reference, null, 2)}\n`);
writeFileSync(new URL('design-tokens.md', output), renderDesignTokenReference(reference));
