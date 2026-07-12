// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { declarationAPIFromText } from './release-api.mjs';

describe('release API declarations', () => {
  it('records sorted exports and stable declaration signatures', () => {
    const compact = declarationAPIFromText('export interface User { id: string; }\nexport declare function find(id: string): User;');
    const formatted = declarationAPIFromText(`
      export interface User {
        id: string;
      }
      export declare function find(id: string): User;
    `);
    expect(compact.exports).toEqual(['User', 'find']);
    expect(formatted.signatures).toEqual(compact.signatures);
  });

  it('changes only the affected signature when an additive export is introduced', () => {
    const before = declarationAPIFromText('interface Internal { id: string }\ndeclare function find(id: string): Internal;\nexport { find };');
    const after = declarationAPIFromText('interface Internal { id: string }\ndeclare function find(id: number): Internal;\ndeclare const added: boolean;\nexport { find, added };');
    expect(after.exports).toEqual(['added', 'find']);
    expect(after.signatures.find).not.toBe(before.signatures.find);
    expect(before.signatures.added).toBeUndefined();
  });

  it('tracks aliased exports by their public name', () => {
    const api = declarationAPIFromText('declare function internal(value: string): void;\nexport { internal as publicName };');
    expect(api.exports).toEqual(['publicName']);
    expect(api.signatures.publicName).toMatch(/^[a-f0-9]{64}$/);
  });
});
