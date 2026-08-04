import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

describe('UIF semantic icon color system', () => {
  it('keeps cards and controls on a restrained radius scale', () => {
    const tokens = readFileSync(resolve(root, 'packages/css/tokens.css'), 'utf8');
    expect(tokens).toContain('--uif-radius-sm:.25rem');
    expect(tokens).toContain('--uif-radius-md:.375rem');
    expect(tokens).toContain('--uif-radius-lg:.5rem');
    expect(tokens).toContain('--uif-radius-xl:.625rem');
  });

  it('ships paired foreground and background tokens for supported tones', () => {
    const tokens = readFileSync(resolve(root, 'packages/css/tokens.css'), 'utf8');
    for (const tone of ['blue', 'green', 'teal', 'cyan', 'violet', 'amber', 'red', 'neutral']) {
      expect(tokens).toContain(`--uif-icon-${tone}:`);
      expect(tokens).toContain(`--uif-icon-${tone}-bg:`);
    }
  });

  it('provides reusable icon-tile and horizontal metric-card primitives', () => {
    const components = readFileSync(resolve(root, 'packages/css/components.css'), 'utf8');
    expect(components).toContain('.uif-icon-tile{');
    expect(components).toContain('.uif-metric-card{');
    expect(components).toContain('grid-template-columns:auto minmax(0,1fr) auto');
    for (const tone of ['green', 'teal', 'cyan', 'violet', 'amber', 'red', 'neutral']) {
      expect(components).toContain(`data-uif-tone="${tone}"`);
    }
  });
});
