import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

const compatibilityTokens = new Set(['--uif-accent', '--uif-font-family']);

function category(name) {
  const value = name.replace('--uif-', '');
  if (value.startsWith('color-') || ['accent', 'bg', 'surface', 'text', 'border'].some((prefix) => value === prefix || value.startsWith(`${prefix}-`))) return 'color';
  if (value.startsWith('chart-')) return 'data-visualization';
  if (value.startsWith('icon-')) return 'icon';
  if (value.startsWith('space-')) return 'spacing';
  if (value.startsWith('radius-')) return 'radius';
  if (value.startsWith('shadow-')) return 'elevation';
  if (value.startsWith('z-')) return 'layer';
  if (value.startsWith('motion-') || value.startsWith('ease-')) return 'motion';
  if (value.startsWith('breakpoint-') || value === 'container') return 'responsive';
  if (value.startsWith('control-') || value.startsWith('density-')) return 'density';
  if (value.startsWith('focus-')) return 'focus';
  return 'typography';
}

function parseDeclarations(block) {
  return Object.fromEntries([...block.matchAll(/(--uif-[\w-]+)\s*:\s*([^;}]+)/g)].map((match) => [match[1], match[2].trim()]));
}

export function collectDesignTokenReference(root) {
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  const css = readFileSync(new URL('packages/css/tokens.css', root), 'utf8');
  const modes = {};
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    const context = `${css.slice(Math.max(0, (match.index ?? 0) - 80), match.index)}${selector}`;
    const declarations = parseDeclarations(match[2]);
    if (!Object.keys(declarations).length) continue;
    const mode = context.includes('prefers-reduced-motion') ? 'reduced-motion'
      : context.includes('forced-colors') ? 'forced-colors'
        : selector.includes('data-theme="dark"') ? 'dark'
          : selector.includes('data-theme="high-contrast"') ? 'high-contrast'
            : selector.includes('data-uif-density="compact"') ? 'compact'
              : 'light';
    modes[mode] = { ...(modes[mode] ?? {}), ...declarations };
  }
  const names = [...new Set(Object.values(modes).flatMap((values) => Object.keys(values)))].sort();
  const tokens = Object.fromEntries(names.map((name) => [name, {
    category: category(name),
    stability: compatibilityTokens.has(name) ? 'compatibility' : 'public',
    values: Object.fromEntries(Object.entries(modes).filter(([, values]) => name in values).map(([mode, values]) => [mode, values[name]])),
  }]));
  return {
    schemaVersion: 1,
    frameworkVersion: pkg.version,
    tokenContractVersion: 3,
    modes: Object.keys(modes).sort(),
    tokens,
  };
}

function cell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function renderDesignTokenReference(reference) {
  const lines = [
    '# Generated Batoi UIF Design Token Reference',
    '',
    `Framework ${reference.frameworkVersion}; token contract version ${reference.tokenContractVersion}. This file is generated from the CSS shipped by \`@batoi/uif-css\`.`,
    '',
    `Modes: ${reference.modes.map((mode) => `\`${mode}\``).join(', ')}`,
    '',
    '| Token | Category | Stability | Light/default value | Other modes |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const [name, token] of Object.entries(reference.tokens)) {
    const otherModes = Object.entries(token.values).filter(([mode]) => mode !== 'light').map(([mode, value]) => `${mode}: ${value}`).join('; ');
    lines.push(`| \`${name}\` | ${token.category} | ${token.stability} | ${cell(token.values.light ?? '')} | ${cell(otherModes)} |`);
  }
  return `${lines.join('\n')}\n`;
}
