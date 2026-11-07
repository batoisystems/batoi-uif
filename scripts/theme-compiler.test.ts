import { describe, expect, it } from 'vitest';
import { compileTheme, starterTheme, validateTheme, contrast } from '../tools/theme/compiler.mjs';
import { gzipSync } from 'node:zlib';

describe('portable theme compiler', () => {
  // Curated compiler fixtures, not claimed results from Claude/ChatGPT hosts.
  it.each(['content', 'commerce', 'dense-admin', 'field-work', 'rtl-dashboard', 'high-contrast', 'health-admin', 'education', 'municipal', 'finance', 'portfolio', 'travel', 'support', 'analytics', 'developer', 'logistics', 'publishing', 'nonprofit', 'inventory', 'appointments'])('validates and reproducibly exports the %s recipe fixture', (name) => {
    const theme = starterTheme(name);
    theme.tokens['space-4'] = { $type: 'dimension', $value: { value: name.length % 2 ? 1 : .75, unit: 'rem' } };
    theme.tokens['font-sans'] = { $type: 'fontFamily', $value: ['system-ui', 'sans-serif'] };
    theme.tokens['chart-accent'] = { $type: 'color', $value: '{color-primary}' };
    const artifact = compileTheme(theme);
    expect(compileTheme(JSON.parse(artifact.files['uif.theme.json'])).id).toBe(artifact.id);
    expect(gzipSync(artifact.files['theme.css']).length).toBeLessThan(4000);
    expect(artifact.files['theme.css']).toContain('--uif-font-sans:system-ui,sans-serif');
    expect(artifact.files['mobile.html']).toContain('data-layout="bottom-nav"');
    expect(artifact.files['desktop.html']).toContain('data-layout="workspace"');
  });
  it('builds deterministic web, mobile and desktop artifacts', () => {
    const theme = starterTheme();
    const first = compileTheme(theme);
    const second = compileTheme(JSON.parse(JSON.stringify(theme)));
    expect(first.id).toBe(second.id);
    expect(Object.keys(first.files)).toEqual(['theme.css', 'foundation.css', 'preview.css', 'uif.theme.json', 'web.html', 'mobile.html', 'desktop.html', 'manifest.json']);
    expect(first.files['theme.css']).toContain('--uif-color-primary:');
    expect(first.files['mobile.html']).toContain("default-src 'none'");
    expect(contrast('#000000', '#ffffff')).toBe(21);
  });

  it.each([
    ['unknown fields', (t) => { t.script = 'evil()'; }],
    ['poor contrast', (t) => { t.tokens.text.$value = '#ffffff'; }],
    ['CSS injection', (t) => { t.tokens.text.$value = 'red; background:url(https://evil.test)'; }],
    ['alias cycle', (t) => { t.tokens.text.$value = '{text}'; }],
    ['alias missing', (t) => { t.tokens.text.$value = '{missing}'; }],
    ['remote assets', (t) => { t.assets = [{ path: 'https://evil.test/asset.svg' }]; }],
    ['path traversal', (t) => { t.assets = [{ path: 'assets/../secret.png' }]; }],
    ['invalid profile', (t) => { t.profiles = ['native-ios']; }],
    ['unknown mode', (t) => { t.modes.script = {}; }],
    ['dangerous name', (t) => { t.name = 'x"><script>'; }],
  ])('rejects %s', (_name, mutate) => {
    const theme = starterTheme();
    mutate(theme);
    expect(validateTheme(theme).valid).toBe(false);
    expect(() => compileTheme(theme)).toThrow();
  });

  it('resolves typed DTCG aliases and rejects collisions between modes', () => {
    const theme = starterTheme();
    theme.tokens.brand = { $type: 'color', $value: { colorSpace: 'srgb', components: [0, 0, 0] } };
    theme.tokens.text = { $type: 'color', $value: '{brand}' };
    expect(compileTheme(theme).files['theme.css']).toContain('--uif-text:#000000');
    theme.modes.light.color = { primary: { $type: 'color', $value: '#000000' } };
    expect(validateTheme(theme).valid).toBe(false);
  });

  it('bounds serialized input and token nesting', () => {
    expect(validateTheme(' '.repeat(100001)).valid).toBe(false);
    const theme = starterTheme();
    let tree = theme.tokens;
    for (let i = 0; i < 20; i++) tree = tree.next = {};
    expect(validateTheme(theme).valid).toBe(false);
  });
});
