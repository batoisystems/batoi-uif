// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { extractMatches, removedContractEntries } from './contract-baseline.mjs';

describe('contract baseline', () => {
  it('extracts unique sorted contract names', () => {
    expect(extractMatches("'uif:z' 'uif:a' 'uif:z'", /['\"](uif:[a-z]+)['\"]/g)).toEqual([
      'uif:a',
      'uif:z',
    ]);
  });

  it('reports removed public contract entries', () => {
    const expected = {
      declarative: { attributes: ['data-uif'], components: ['modal'], actions: ['open'], states: ['idle'] },
      events: ['uif:open'],
      css: { tokens: ['--uif-color'], classes: ['uif-modal'] },
      artifacts: ['uif.css'],
      packages: { core: { exports: ['.'] } },
    };
    const current = {
      declarative: { attributes: [], components: [], actions: [], states: [] },
      events: [],
      css: { tokens: [], classes: [] },
      artifacts: [],
      packages: { core: { exports: [] } },
    };
    expect(removedContractEntries(expected, current)).toEqual([
      'actions:open',
      'artifacts:uif.css',
      'attributes:data-uif',
      'components:modal',
      'css.classes:uif-modal',
      'css.tokens:--uif-color',
      'events:uif:open',
      'packages.core.exports:.',
      'states:idle',
    ]);
  });
});
