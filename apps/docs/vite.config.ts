import { defineConfig } from 'vite';
import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig(({ command }) => ({
  base: './',
  // The generated reference tree is also available from the development app
  // after npm run build, without maintaining a duplicate source documentation set.
  publicDir: command === 'serve' ? 'dist' : false,
  plugins: [{
    name: 'uif-local-references',
    closeBundle() {
      // Copy generated sources, rather than maintaining duplicate examples.
      mkdirSync(here('./dist/dist'), { recursive: true });
      mkdirSync(here('./dist/examples'), { recursive: true });
      cpSync(here('../../docs'), here('./dist/reference'), { recursive: true });
      cpSync(here('../../dist/v4'), here('./dist/dist/v4'), { recursive: true });
      for (const name of ['essential', 'web', 'rad', 'mobile', 'desktop']) cpSync(here(`../../examples/v4-${name}`), here(`./dist/examples/v4-${name}`), { recursive: true });
    },
  }],
}));
