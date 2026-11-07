import { defineConfig } from 'vitest/config';
import { workspaceSourcePath } from './scripts/workspace-source.mjs';

export default defineConfig({
  plugins: [
    {
      name: 'uif-test-workspace-exports',
      enforce: 'pre',
      resolveId(source) {
        if (/^@batoi\/uif-/.test(source)) return workspaceSourcePath(source);
      },
    },
  ],
  test: {
    environment: 'jsdom',
    include: ['packages/**/src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
