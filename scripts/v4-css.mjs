import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

// Partition whole CSS rules, preserving their original order and complete at-rules.
// This is an explicit family build, not a consumer-markup purge.
export function cssRules(css) {
  const rules = [];
  let start = 0;
  let depth = 0;
  let quote = '';
  let comment = false;
  for (let i = 0; i < css.length; i += 1) {
    const c = css[i];
    if (comment) { if (c === '*' && css[i + 1] === '/') { comment = false; i += 1; } continue; }
    if (quote) { if (c === '\\') i += 1; else if (c === quote) quote = ''; continue; }
    if (c === '/' && css[i + 1] === '*') { comment = true; i += 1; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth += 1;
    if (c === '}') { depth -= 1; if (!depth) { rules.push(css.slice(start, i + 1)); start = i + 1; } }
    if (depth < 0) throw new Error('Unbalanced CSS');
  }
  if (depth || quote || comment || css.slice(start).trim()) throw new Error('Incomplete CSS rule');
  return rules;
}

const familyPrefixes = {
  foundation: ['card', 'field', 'input', 'label', 'container', 'stack', 'cluster', 'grid', 'text', 'surface', 'badge', 'alert', 'empty', 'skeleton', 'spinner', 'loading-target'],
  essential: ['btn', 'modal', 'dropdown', 'tabs', 'toast', 'accordion', 'collapse', 'tooltip', 'popover', 'overlay', 'show', 'hide', 'fade', 'sr-only', 'menu'],
  navigation: ['app-shell', 'shell', 'responsive-shell', 'sidebar', 'navbar', 'nav', 'topbar', 'main', 'toolbar', 'breadcrumbs', 'skip-link', 'scroll-region', 'page', 'drawer', 'offcanvas', 'bottom-sheet'],
  forms: ['form', 'field', 'input', 'error-summary', 'file-upload', 'combobox', 'uploader', 'col', 'selection-control'],
  data: ['table', 'data-grid', 'cell-stack', 'pagination', 'filter', 'chip'],
  mobile: ['mobile', 'sheet', 'bottom-sheet', 'segmented', 'offline'],
  desktop: ['desktop', 'panel', 'inspector', 'kv', 'section', 'search', 'list', 'note'],
  charts: ['chart', 'sparkline', 'stat', 'metric', 'dashboard'],
  editor: ['editor', 'task-list'],
  agent: ['ai', 'agent', 'tool', 'risk', 'diff'],
  media: ['carousel', 'lightbox', 'testimonial', 'masonry', 'typed-text'],
};

export const styleDependencies = Object.freeze({
  foundation: ['foundation'],
  essential: ['foundation', 'essential'],
  web: ['foundation', 'essential', 'navigation', 'forms'],
  rad: ['foundation', 'essential', 'navigation', 'forms', 'data'],
  mobile: ['foundation', 'essential', 'navigation', 'mobile'],
  desktop: ['foundation', 'essential', 'navigation', 'forms', 'desktop'],
  full: Object.keys(familyPrefixes),
});

function headerWithoutComments(rule) {
  return rule.slice(0, rule.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

/** Keep entire shared selector lists, but filter each nested conditional block. */
export function selectStyleRules(css, groups) {
  const prefixes = groups.flatMap((group) => familyPrefixes[group] ?? []);
  const selected = (header) => prefixes.some((prefix) => new RegExp(`(?:\\.uif-|\\buif-)${prefix}(?:-|[^a-z0-9-]|$)`).test(header));
  return cssRules(css).map((rule) => {
    const header = headerWithoutComments(rule);
    if (/^@(?:media|supports|container|layer)\b/.test(header)) {
      const body = selectStyleRules(rule.slice(rule.indexOf('{') + 1, -1), groups);
      return body ? `${header}{${body}}` : '';
    }
    if (header.startsWith('@') && !/^@(?:-webkit-)?keyframes\b/.test(header)) throw new Error(`Undeclared style rule: ${header}`);
    return selected(header) ? rule : '';
  }).filter(Boolean).join('\n');
}

export function buildCSSFamily(root, family = 'essential') {
  const groups = styleDependencies[family];
  if (!groups) throw new Error('Unknown style family');
  const read = (file) => readFileSync(new URL(file, root), 'utf8');
  const source = read('packages/css/components.css');
  const selected = family === 'full' ? source : selectStyleRules(source, groups);
  return `@layer uif.reset, uif.tokens, uif.utilities, uif.components, uif.theme;\n@layer uif.reset {${read('packages/css/reset.css')}}\n@layer uif.tokens {${read('packages/css/tokens.css')}}\n@layer uif.utilities {${read('packages/css/utilities.css')}}\n@layer uif.components {${selected}}\n`;
}
