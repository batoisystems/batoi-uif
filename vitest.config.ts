import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@batoi/uif-ai': new URL('./packages/ai/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-actions': new URL('./packages/actions/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-charts': new URL('./packages/charts/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-components': new URL('./packages/components/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-core': new URL('./packages/core/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-css': new URL('./packages/css/index.css', import.meta.url).pathname,
      '@batoi/uif-dashboard': new URL('./packages/dashboard/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-desktop': new URL('./packages/desktop/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-dom': new URL('./packages/dom/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-effects': new URL('./packages/effects/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-editor': new URL('./packages/editor/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-extension-kit': new URL('./packages/extension-kit/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-forms': new URL('./packages/forms/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-mcp': new URL('./packages/mcp/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-mobile': new URL('./packages/mobile/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-net': new URL('./packages/net/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-overlays': new URL('./packages/overlays/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-push': new URL('./packages/push/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-pwa': new URL('./packages/pwa/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-query': new URL('./packages/query/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-rad-adapter': new URL('./packages/rad-adapter/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-realtime': new URL('./packages/realtime/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-router': new URL('./packages/router/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-state': new URL('./packages/state/src/index.ts', import.meta.url).pathname,
      '@batoi/uif-table': new URL('./packages/table/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    include: ['packages/**/src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
