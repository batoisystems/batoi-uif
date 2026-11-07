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

const essential = /\.uif-(?:btn|modal|dropdown|tabs|toast|accordion|collapse|tooltip|popover|overlay|show|hide|fade|sr-only)(?:[\s.:#[>+~-]|$)/;
const foundation = /\.uif-(?:card|field|input|label|container|stack|cluster|grid|text|p-|m-|gap-|flex|surface)/;
export function buildCSSFamily(root, family = 'essential') {
  if (!['foundation', 'essential', 'full'].includes(family)) throw new Error('Unknown style family');
  const read = (file) => readFileSync(new URL(file, root), 'utf8');
  const rules = cssRules(read('packages/css/components.css'));
  const selected = family === 'full' ? rules : rules.filter((rule) => {
    const selector = rule.slice(0, rule.indexOf('{')).trim();
    // Shared responsive rules are retained intact; avoid unsafe selector pruning.
    return selector.startsWith('@') || foundation.test(selector) || (family === 'essential' && essential.test(selector));
  });
  return `@layer uif.reset, uif.tokens, uif.utilities, uif.components, uif.theme;\n@layer uif.reset {${read('packages/css/reset.css')}}\n@layer uif.tokens {${read('packages/css/tokens.css')}}\n@layer uif.utilities {${read('packages/css/utilities.css')}}\n@layer uif.components {${selected.join('\n')}}\n`;
}
