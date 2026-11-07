import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));

export const workspaceSource = {
  name: 'uif-workspace-source',
  setup(build) {
    build.onResolve({ filter: /^@batoi\/uif-/ }, ({ path }) => {
      const [name, ...parts] = path.slice('@batoi/uif-'.length).split('/');
      const folder = resolve(root, 'packages', name);
      const manifest = JSON.parse(readFileSync(resolve(folder, 'package.json'), 'utf8'));
      const entry = manifest.exports[parts.length ? `./${parts.join('/')}` : '.'];
      const target = typeof entry === 'string' ? entry : entry?.import;
      if (!target) throw new Error(`Unknown UIF entry: ${path}`);
      const source = resolve(folder, target.replace('./dist/', './src/').replace(/\.js$/, '.ts'));
      if (!existsSync(source)) throw new Error(`Missing source for ${path}`);
      return { path: source };
    });
  },
};
