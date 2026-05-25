import { describe, expect, it } from 'vitest';
import { parseMicroAppManifest, validateMicroAppManifest } from './micro-app.js';

describe('Micro App manifest', () => {
  it('normalizes a valid manifest', () => {
    const manifest = parseMicroAppManifest({
      name: 'Sales Dashboard',
      type: 'micro-app',
      storage: { mode: 'local-first', localStore: 'indexeddb' },
      realtime: { enabled: true, transport: 'websocket' },
      connectors: [{ type: 'json', src: '/data/sales.json' }],
    });

    expect(manifest.storage.sharedStore).toBe(false);
    expect(manifest.realtime.fallback).toBe('polling');
    expect(manifest.connectors[0]).toMatchObject({ type: 'json', mode: 'readonly' });
  });

  it('returns issues instead of throwing during validation', () => {
    const result = validateMicroAppManifest({ name: '', type: 'page', connectors: [{ type: 'sql' }] });

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.path)).toContain('name');
    expect(result.issues.map((issue) => issue.path)).toContain('type');
    expect(result.issues.map((issue) => issue.path)).toContain('connectors.0.type');
  });
});
