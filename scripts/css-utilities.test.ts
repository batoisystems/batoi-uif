import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

describe('UIF layout utilities', () => {
  it('ships every 12-column span', () => {
    const components = readFileSync(resolve(root, 'packages/css/components.css'), 'utf8');
    for (let span = 1; span <= 12; span += 1) {
      expect(components).toContain(`.uif-col-${span}`);
      expect(components).toContain(`grid-column: span ${span};`);
    }
  });

  it('ships logical margin and padding helpers from zero through five', () => {
    const utilities = readFileSync(resolve(root, 'packages/css/utilities.css'), 'utf8');
    for (const property of [
      'm',
      'mt',
      'mb',
      'ms',
      'me',
      'mx',
      'my',
      'p',
      'pt',
      'pb',
      'ps',
      'pe',
      'px',
      'py',
    ]) {
      for (let size = 0; size <= 5; size += 1) {
        expect(utilities).toMatch(new RegExp(`\\.uif-${property}-${size}\\s*\\{`));
      }
    }
  });
});
