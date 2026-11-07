// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { collectPublicEntryAPIs, declarationAPIFromText, declarationAPI } from './release-api.mjs';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

describe('release API declarations', () => {
  it('includes every exported types subpath and the browser facade', () => {
    const root = mkdtempSync(join(tmpdir(), 'uif-api-entries-'));
    try {
      const directory = join(root, 'packages', 'sample');
      mkdirSync(join(directory, 'dist'), { recursive: true });
      mkdirSync(join(root, 'dist'));
      mkdirSync(join(directory, 'dist', 'sets'));
      writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: '@batoi/uif-sample', exports: { '.': { types: './dist/index.d.ts' }, './selected': { types: './dist/selected.d.ts' }, './sets/*': { types: './dist/sets/*.d.ts' }, './style': './style.css' } }));
      writeFileSync(join(directory, 'dist', 'index.d.ts'), 'export declare function legacy(): void;');
      writeFileSync(join(directory, 'dist', 'selected.d.ts'), 'export declare function selected(): void;');
      writeFileSync(join(root, 'dist', 'index.d.ts'), 'export declare function start(): void;');
      writeFileSync(join(directory, 'dist', 'sets', 'icons.d.ts'), 'export declare const icons: string[];');
      const entries = collectPublicEntryAPIs(pathToFileURL(`${root}/`));
      expect(Object.keys(entries)).toEqual(['@batoi/uif-sample', '@batoi/uif-sample/selected', '@batoi/uif-sample/sets/icons', 'batoi-uif/browser']);
      expect(entries['@batoi/uif-sample/selected'].exports).toEqual(['selected']);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it('compares declarations through split local exports and bundler aliases', () => {
    const root = mkdtempSync(join(tmpdir(), 'uif-api-'));
    try {
      writeFileSync(join(root, 'chunk.d.ts'), 'interface Value { id: string; }\nexport { Value as V };');
      writeFileSync(join(root, 'index.d.ts'), "export { V as Value } from './chunk.js';");
      const split = declarationAPI(pathToFileURL(join(root, 'index.d.ts')));
      const flat = declarationAPIFromText('interface Value { id: string; }\nexport { Value };');
      expect(split).toEqual(flat);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
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

  it('ignores union ordering but retains actual type changes', () => {
    const a = declarationAPIFromText("export type Mode = 'a' | 'b';");
    expect(declarationAPIFromText("export type Mode = 'b' | 'a';")).toEqual(a);
    expect(declarationAPIFromText("export type Mode = 'a' | 'c';")).not.toEqual(a);
  });

  it('keeps registry signatures stable behind a named public type', () => {
    const first = declarationAPIFromText(
      "type IconName = 'search' | 'home';\ntype IconMetadataRegistry<Name extends string> = Readonly<Record<Name, object>>;\ndeclare const iconMetadata: IconMetadataRegistry<IconName>;\nexport { iconMetadata };",
    );
    const reordered = declarationAPIFromText(
      "type IconName = 'home' | 'search';\ntype IconMetadataRegistry<Name extends string> = Readonly<Record<Name, object>>;\ndeclare const iconMetadata: IconMetadataRegistry<IconName>;\nexport { iconMetadata };",
    );
    expect(reordered.signatures.iconMetadata).toBe(first.signatures.iconMetadata);
  });
});
