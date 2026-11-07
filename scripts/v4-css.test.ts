import { describe, it, expect } from 'vitest';
import { pathToFileURL } from 'node:url';
import { resolve, sep } from 'node:path';
import { cssRules, buildCSSFamily } from './v4-css.mjs';

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
  });
});
