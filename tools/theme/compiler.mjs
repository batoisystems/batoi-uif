import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { components, profiles, layouts } from './catalog.mjs';

export const themeSchemaVersion = 1;
export const themeProfiles = profiles;
export const themeComponents = Object.freeze(components.map((c) => c.name));
const safeKey = (key) => /^[a-z][a-z0-9-]{0,63}$/.test(key) && !['constructor', 'prototype', '__proto__'].includes(key);
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const units = new Set(['px', 'rem', 'em', '%', 'vh', 'vw', 'dvh', 'ch']);

export function stableJSON(value) {
  if (Array.isArray(value)) return `[${value.map(stableJSON).join(',')}]`;
  if (record(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJSON(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function color(value) {
  if (typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value)) return value.toLowerCase();
  if (record(value) && value.colorSpace === 'srgb' && Array.isArray(value.components) && value.components.length === 3 && value.components.every((v) => Number.isFinite(v) && v >= 0 && v <= 1) && (value.alpha === undefined || value.alpha === 1)) {
    return `#${value.components.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
  }
  throw new Error('Color must be opaque six-digit hex or DTCG sRGB');
}

function cssValue(type, value) {
  if (type === 'color') return color(value);
  if (['dimension', 'duration'].includes(type)) {
    const allowedUnits = type === 'duration' ? new Set(['ms', 's']) : units;
    if (!record(value) || !Number.isFinite(value.value) || Math.abs(value.value) > 10000 || !allowedUnits.has(value.unit)) throw new Error(`Invalid ${type}`);
    return `${value.value}${value.unit}`;
  }
  if (type === 'number' || type === 'fontWeight') {
    if (!Number.isFinite(value) || Math.abs(value) > 10000 || (type === 'fontWeight' && (value < 1 || value > 1000))) throw new Error('Invalid numeric token');
    return String(value);
  }
  if (type === 'fontFamily') {
    const families = Array.isArray(value) ? value : [value];
    if (!families.length || families.length > 10 || families.some((v) => typeof v !== 'string' || !/^[a-zA-Z0-9 -]{1,80}$/.test(v))) throw new Error('Invalid font family');
    const generic = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded']);
    return families.map((v) => generic.has(v) ? v : `"${v}"`).join(',');
  }
  if (type === 'cubicBezier' && Array.isArray(value) && value.length === 4 && value.every(Number.isFinite) && value[0] >= 0 && value[0] <= 1 && value[2] >= 0 && value[2] <= 1 && value.every((v) => Math.abs(v) <= 10)) return `cubic-bezier(${value.join(',')})`;
  throw new Error(`Unsupported token type: ${type}`);
}

function flatten(tree, output = Object.create(null), path = [], depth = 0) {
  if (depth > 16 || !record(tree)) throw new Error('Token tree must be an object with depth at most 16');
  for (const [key, value] of Object.entries(tree)) {
    if (key === '$description') continue;
    if (!safeKey(key)) throw new Error(`Invalid token path: ${[...path, key].join('.')}`);
    const next = [...path, key];
    if (!record(value)) throw new Error(`Token must be an object: ${next.join('.')}`);
    if ('$value' in value) {
      if (Object.keys(value).some((k) => !['$value', '$type', '$description'].includes(k))) throw new Error('Unknown token property');
      if (Object.keys(output).length >= 512) throw new Error('Token count exceeds 512');
      const name = next.join('.');
      if (Object.values(output).some((t) => t.cssName === next.join('-'))) throw new Error('Token names collide after CSS normalization');
      output[name] = { ...value, cssName: next.join('-') };
    } else flatten(value, output, next, depth + 1);
  }
  return output;
}

function resolveTokens(tokens) {
  const result = Object.create(null);
  const visit = (name, seen = new Set()) => {
    if (result[name]) return result[name];
    if (!tokens[name]) throw new Error(`Unknown token alias: ${name}`);
    if (seen.has(name) || seen.size > 32) throw new Error(`Cyclic or deep alias: ${name}`);
    const token = tokens[name];
    const alias = typeof token.$value === 'string' ? token.$value.match(/^\{([a-z0-9.-]+)\}$/) : null;
    let type = token.$type;
    let value;
    if (alias) {
      const linked = visit(alias[1], new Set([...seen, name]));
      if (type && type !== linked.type) throw new Error(`Alias type mismatch: ${name}`);
      type = linked.type;
      value = linked.value;
    } else value = cssValue(type, token.$value);
    return result[name] = { type, value, cssName: token.cssName };
  };
  Object.keys(tokens).sort().forEach((name) => visit(name));
  return result;
}

export function contrast(a, b) {
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((i) => parseInt(color(hex).slice(i, i + 2), 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const [x, y] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (x + 0.05) / (y + 0.05);
}

export function validateTheme(input) {
  const issues = [];
  const issue = (path, message) => issues.push({ path, message });
  let source;
  try {
    source = typeof input === 'string' ? input : stableJSON(input);
    if (typeof source !== 'string' || Buffer.byteLength(source) > 100000) throw new Error('Theme exceeds 100,000 bytes');
    input = JSON.parse(source);
  } catch (error) { return { valid: false, issues: [{ path: '$', message: error.message }], modes: {} }; }
  if (!record(input)) return { valid: false, issues: [{ path: '$', message: 'Theme must be an object' }], modes: {} };
  const allowed = ['schemaVersion', 'name', 'framework', 'profiles', 'components', 'tokens', 'modes', 'layouts', 'assets'];
  for (const key of Object.keys(input)) if (!allowed.includes(key)) issue(`$.${key}`, 'Unknown theme field');
  if (input.schemaVersion !== 1) issue('$.schemaVersion', 'Expected schema version 1');
  if (typeof input.name !== 'string' || !safeKey(input.name)) issue('$.name', 'Expected lowercase theme identifier');
  if (input.framework !== '^4.0.0') issue('$.framework', 'Expected framework ^4.0.0');
  if (!Array.isArray(input.profiles) || !input.profiles.length || input.profiles.length > 3 || input.profiles.some((p) => !themeProfiles.includes(p)) || new Set(input.profiles).size !== input.profiles.length) issue('$.profiles', 'Choose unique web/mobile/desktop profiles');
  if (!Array.isArray(input.components) || input.components.length > themeComponents.length || input.components.some((c) => !themeComponents.includes(c)) || new Set(input.components).size !== input.components.length) issue('$.components', 'Unsupported or duplicate components');
  const selectedProfiles = Array.isArray(input.profiles) ? input.profiles.filter((p) => typeof p === 'string') : [];
  if (!record(input.layouts) || Object.entries(input.layouts).some(([p, l]) => !Object.hasOwn(layouts, p) || !layouts[p].includes(l)) || selectedProfiles.some((p) => !Object.hasOwn(input.layouts, p))) issue('$.layouts', 'Choose a supported layout for each profile');
  // The schema and every authoring path agree: assets are reserved, not materialized.
  if (input.assets !== undefined && (!Array.isArray(input.assets) || input.assets.length > 0)) issue('$.assets', 'Asset materialization is not enabled; assets must be empty');
  const modes = Object.create(null);
  try {
    const base = flatten(input.tokens);
    if (!record(input.modes) || !input.modes.light || Object.keys(input.modes).some((m) => !['light', 'dark', 'high-contrast'].includes(m))) throw new Error('Modes require light and optionally dark/high-contrast');
    for (const [name, tree] of Object.entries(input.modes)) {
      const combined = { ...base, ...flatten(tree) };
      if (Object.keys(combined).length > 512) throw new Error('Combined mode token count exceeds 512');
      if (new Set(Object.values(combined).map((t) => t.cssName)).size !== Object.keys(combined).length) throw new Error('Mode token CSS names collide');
      modes[name] = resolveTokens(combined);
      const values = Object.fromEntries(Object.values(modes[name]).map((t) => [t.cssName, t.value]));
      for (const [fg, bg] of [['text', 'bg'], ['text', 'surface'], ['on-primary', 'color-primary']]) {
        if (!values[fg] || !values[bg] || contrast(values[fg], values[bg]) < 4.5) issue(`$.modes.${name}`, `${fg}/${bg} text contrast must be at least 4.5:1`);
      }
    }
  } catch (error) { issue('$.tokens', error.message); }
  return { valid: issues.length === 0, issues, modes, theme: input };
}

export function compileTheme(input) {
  const validation = validateTheme(input);
  if (!validation.valid) throw new Error(validation.issues.map((i) => `${i.path}: ${i.message}`).join('\n'));
  const { theme, modes } = validation;
  const scope = `[data-uif-theme="${theme.name}"]`;
  const css = Object.keys(modes).sort().map((mode) => `${mode === 'light' ? scope : `${scope}[data-theme="${mode}"]`}{${Object.values(modes[mode]).sort((a,b) => a.cssName < b.cssName ? -1 : a.cssName > b.cssName ? 1 : 0).map((t) => `--uif-${t.cssName}:${t.value};`).join('')}}`).join('\n') + '\n';
  const foundationPath = '../../packages/css/foundation.css';
  const files = { 'theme.css': css, 'foundation.css': readFileSync(new URL(foundationPath, import.meta.url), 'utf8'), 'preview.css': previewCSS, 'uif.theme.json': stableJSON(theme) + '\n' };
  for (const profile of theme.profiles) files[`${profile}.html`] = previewHTML(theme, profile);
  const contrastPairs = Object.fromEntries(Object.entries(modes).map(([mode, tokens]) => {
    const values = Object.fromEntries(Object.values(tokens).map((t) => [t.cssName, t.value]));
    return [mode, Object.fromEntries([['text', 'bg'], ['text', 'surface'], ['on-primary', 'color-primary']].map(([fg, bg]) => [`${fg}/${bg}`, contrast(values[fg], values[bg])]))];
  }));
  const manifest = { schemaVersion: 1, compilerVersion: '1.0.0-alpha.1', framework: theme.framework, name: theme.name, inputHash: hash(stableJSON(theme)), contrastPairs, files: Object.fromEntries(Object.entries(files).map(([name, value]) => [name, { bytes: Buffer.byteLength(value), gzipBytes: gzipSync(value).length, sha256: hash(value) }])) };
  if (manifest.files['theme.css'].gzipBytes > 4000) throw new Error('Theme delta exceeds 4,000 gzip bytes');
  files['manifest.json'] = stableJSON(manifest) + '\n';
  return { id: hash(stableJSON(files)), files, manifest, validation };
}

export function previewHTML(theme, profile) {
  return `<!doctype html><html lang="en" data-uif-theme="${escape(theme.name)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'"><title>${escape(theme.name)} — ${profile}</title><link rel="stylesheet" href="foundation.css"><link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="preview.css"></head><body data-profile="${profile}" data-layout="${theme.layouts[profile]}"><a class="skip" href="#main">Skip to content</a><header><h1>${escape(theme.name)}</h1><p>${profile} / ${escape(theme.layouts[profile])}</p></header><nav aria-label="Workspace"><a href="#main" aria-current="page">Overview</a><a href="#states">Controls</a></nav><main id="main" tabindex="-1"><h2>Workspace overview</h2><section class="uif-card"><h3>Welcome</h3><p>Responsive content with semantic HTML. Static preview controls do not submit data.</p><button class="uif-btn" type="button">Primary action</button></section><section id="states"><h2>Control states</h2><label class="uif-field">Name<input class="uif-input" value="Sample"></label><label class="uif-field">Invalid field<input class="uif-input" aria-invalid="true" aria-describedby="error"></label><p id="error">Please enter a value.</p><button type="button" disabled>Disabled</button><p role="status">Changes saved.</p></section></main><aside aria-label="Activity"><h2>Activity</h2><p>No pending changes. Sample data only.</p></aside><footer>UIF theme preview · static sample data · browser layout, not a native application</footer></body></html>`;
}

export const previewCSS = `body{margin:0;padding:1rem;background:var(--uif-bg);color:var(--uif-text);font-family:var(--uif-font-sans,system-ui);overflow-wrap:anywhere}header,nav,main,aside,footer{min-width:0;padding:1rem}nav{display:flex;gap:1rem;flex-wrap:wrap}main{display:grid;align-content:start;gap:1rem}button,input,nav a{min-height:2.75rem}nav a{display:inline-flex;align-items:center}input{max-width:100%;box-sizing:border-box;background:var(--uif-surface);color:var(--uif-text)}.uif-btn{background:var(--uif-color-primary);color:var(--uif-on-primary)}a{color:var(--uif-color-primary)}.uif-card{background:var(--uif-surface);color:var(--uif-text)}:focus-visible{outline:3px solid currentColor;outline-offset:3px}.skip{position:absolute;inset-block-start:-10rem}.skip:focus{inset-block-start:0;background:var(--uif-surface);padding:1rem;z-index:2}body[data-layout="bottom-nav"]{padding-block-end:6rem}body[data-layout="bottom-nav"] nav{position:fixed;inset-block-end:0;inset-inline:0;z-index:1;background:var(--uif-surface);padding-block-end:max(1rem,env(safe-area-inset-bottom))}[data-uif-density="compact"] main{gap:.5rem}@media(min-width:48rem){body[data-layout="sidebar"],body[data-layout="workspace"]{display:grid;grid-template-columns:14rem minmax(0,1fr);max-width:100rem;margin-inline:auto}header,footer,.skip{grid-column:1/-1}body[data-layout="sidebar"] nav,body[data-layout="workspace"] nav{flex-direction:column;align-self:start}body[data-layout="workspace"]{grid-template-columns:14rem minmax(0,1fr) 16rem}body[data-layout="sidebar"] aside{grid-column:2}}@media(forced-colors:active){body,.uif-card,nav{background:Canvas!important;color:CanvasText!important}.uif-btn{background:ButtonFace;color:ButtonText}}`;

export function starterTheme(name = 'workspace') {
  const colorToken = ($value) => ({ $type: 'color', $value });
  return { schemaVersion: 1, name, framework: '^4.0.0', profiles: [...themeProfiles], components: [...themeComponents], tokens: { text: colorToken('#1c2a3a'), bg: colorToken('#f6f9fc'), surface: colorToken('#ffffff'), 'color-primary': colorToken('#0e68b0'), 'on-primary': colorToken('#ffffff') }, modes: { light: {}, dark: { text: colorToken('#f0f4f8'), bg: colorToken('#101820'), surface: colorToken('#17232e'), 'color-primary': colorToken('#72bfff'), 'on-primary': colorToken('#101820') } }, layouts: { web: 'sidebar', mobile: 'bottom-nav', desktop: 'workspace' }, assets: [] };
}
