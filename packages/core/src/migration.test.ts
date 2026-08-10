import { describe, expect, it } from 'vitest';
import { uifMigrationRules } from './migration.js';

describe('migration contract', () => {
  it('keeps unique, documented, strict-v3 migration rules', () => {
    expect(new Set(uifMigrationRules.map((rule) => rule.id)).size).toBe(uifMigrationRules.length);
    expect(uifMigrationRules.every((rule) => rule.strictIn === 3 && rule.replacement && rule.diagnostic)).toBe(true);
    expect(Object.isFrozen(uifMigrationRules)).toBe(true);
  });
});
