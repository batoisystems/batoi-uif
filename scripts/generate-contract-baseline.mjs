import { writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { collectContractBaseline } from './contract-baseline.mjs';

const root = new URL('..', import.meta.url);
const baseline = await collectContractBaseline(root);
writeFileSync(new URL('release-contracts.json', root), `${JSON.stringify(baseline, null, 2)}\n`);
