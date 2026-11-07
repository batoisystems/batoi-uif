import { describe, it, expect } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve, sep } from 'node:path';
import { cssRules, buildCSSFamily, selectStyleRules } from './v4-css.mjs';

describe('v4 CSS family builds', () => {
  it('preserves comments, strings, and nested rules without splitting selectors', () => {
    expect(cssRules('/* a */ .a{content:"}"}@media(x){.b{color:red}}')).toHaveLength(2);
    expect(() => cssRules('.a{')).toThrow();
  });
  it('retains essential controls and explicit layers', () => {
    const css = buildCSSFamily(pathToFileURL(resolve('.') + sep), 'essential');
    expect(css).toContain('@layer uif.reset');
    expect(css).toContain('.uif-modal');
    expect(css).toContain('.uif-tabs');
    expect(css).not.toContain('.uif-editor-surface table');
    expect(css).not.toContain('.uif-desktop');
    expect(css).not.toContain('.uif-chart');
  });
  it('filters nested conditional blocks while retaining shared whole selectors', () => {
    const css = '@media(x){.uif-card,.uif-editor{color:red}@supports(y){.uif-chart{color:blue}.uif-modal{color:green}}}';
    expect(selectStyleRules(css, ['foundation'])).toBe('@media(x){.uif-card,.uif-editor{color:red}}');
    expect(selectStyleRules(css, ['essential'])).toBe('@media(x){@supports(y){.uif-modal{color:green}}}');
    expect(selectStyleRules('@media(x){.uif-editor{color:red}}', ['foundation'])).toBe('');
  });
  it('includes declared profile families without unrelated chart/editor rules', () => {
    const root = pathToFileURL(resolve('.') + sep);
    expect(buildCSSFamily(root, 'rad')).toContain('.uif-table');
    expect(buildCSSFamily(root, 'mobile')).toContain('.uif-mobile-bottom-nav');
    expect(buildCSSFamily(root, 'desktop')).toContain('.uif-desktop-panel');
    for (const profile of ['rad', 'mobile', 'desktop']) {
      const css = buildCSSFamily(root, profile);
      expect(css).not.toContain('.uif-editor-surface');
      expect(css).not.toContain('.uif-chart-svg');
    }
  });
});
