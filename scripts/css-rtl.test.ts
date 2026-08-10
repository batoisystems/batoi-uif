// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const components = readFileSync(new URL('../packages/css/components.css', import.meta.url), 'utf8');
const utilities = readFileSync(new URL('../packages/css/utilities.css', import.meta.url), 'utf8');

describe('RTL and logical-direction CSS', () => {
  it('uses logical directional properties except physical left/right drawer compatibility classes', () => {
    const physical = components.match(/(?:margin|padding|border)-(?:left|right)\s*:[^;]+|(?:^|\s)(?:left|right)\s*:[^;]+/gm) ?? [];
    expect(physical.map((value) => value.trim())).toEqual([
      'border-left: 1px solid var(--uif-border)',
      'border-right: 1px solid var(--uif-border)',
    ]);
  });

  it('provides logical text alignment and mirrors the switch control', () => {
    expect(utilities).toContain('.uif-text-start{text-align:start}');
    expect(utilities).toContain('.uif-text-end{text-align:end}');
    expect(components).toContain("[dir='rtl'] .uif-switch input:checked + .uif-switch-track::after");
  });
});
