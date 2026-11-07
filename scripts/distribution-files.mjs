import { readdirSync } from 'node:fs';
import { URL } from 'node:url';

export function distributionFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = `${prefix}${entry.name}`;
    return entry.isDirectory() ? distributionFiles(new URL(`${entry.name}/`, directory), `${name}/`) : [name];
  }).filter((name) => name !== 'integrity.json').sort();
}
