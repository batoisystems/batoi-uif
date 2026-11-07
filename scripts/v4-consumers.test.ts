// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { configureApplication } from '../tools/configure.mjs';
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import process from 'node:process';

describe('real selective consumers', () => {
  it('keeps a real compiled-package consumer small without source aliases', async () => {
    const result = await build({ stdin: { contents: "import {createUIF} from '@batoi/uif-components/application';import {initModal} from '@batoi/uif-components/modal';export const mount=root=>{const app=createUIF(root,[{name:'modal',init:initModal}]);app.refresh();return app;};", resolveDir: process.cwd() }, bundle: true, minify: true, format: 'esm', target: 'es2022', write: false, metafile: true });
    expect(gzipSync(result.outputFiles[0].contents).length).toBeLessThan(12000);
    const names = Object.keys(result.metafile.inputs);
    expect(names.some((name) => name.includes('packages/components/dist/controls/modal.js'))).toBe(true);
    expect(names.some((name) => /packages\/(charts|editor|icons)\//.test(name))).toBe(false);
    expect(names.some((name) => name.endsWith('packages/core/dist/index.js'))).toBe(false);
  });
  it('builds a modal and explicit icon subset without full catalogs or side effects', async () => {
    const result = await configureApplication({ components: ['modal'], icons: ['check'] });
    expect(result.manifest.inputs.some((name: string) => name.includes('controls/tabs'))).toBe(false);
    expect(result.manifest.inputs.some((name: string) => name.includes('icons/src/icons'))).toBe(false);
    expect(result.manifest.artifacts['application.js'].gzip).toBeLessThan(12000);
    expect(result.manifest.artifacts['application.css'].gzip).toBeLessThan(10000);
    const again = await configureApplication({ components: ['modal'], icons: ['check'] });
    expect(again.manifest.artifacts).toEqual(result.manifest.artifacts);
  });
  it('rejects invented capabilities and unknown icon names', async () => {
    await expect(configureApplication({ components: ['arbitrary-code'] })).rejects.toThrow();
    await expect(configureApplication({ components: [], icons: ['not-an-icon'] })).rejects.toThrow();
  });
});
