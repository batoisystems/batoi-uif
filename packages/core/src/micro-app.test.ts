import { describe, expect, it } from 'vitest';
import { listMicroAppConnectorWorkflows, parseMicroAppManifest, validateMicroAppConnectorWorkflows, validateMicroAppManifest } from './micro-app.js';

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

  it('summarizes connector workflows and network permissions', () => {
    const manifest = parseMicroAppManifest({
      name: 'Connector App',
      type: 'micro-app',
      connectors: [
        { type: 'static', name: 'Seed data' },
        { type: 'json', name: 'Same origin', src: '/data.json' },
        { type: 'api', name: 'Blocked API', src: 'https://api.example.com/records' },
        { type: 'csv', name: 'Allowed CSV', src: 'https://data.example.com/export.csv' },
      ],
      permissions: { network: ['self', 'https://data.example.com'], storage: true },
    });

    expect(listMicroAppConnectorWorkflows(manifest)).toMatchObject([
      { name: 'Seed data', permission: 'local' },
      { name: 'Same origin', permission: 'allowed' },
      { name: 'Blocked API', permission: 'blocked' },
      { name: 'Allowed CSV', permission: 'allowed' },
    ]);
    expect(validateMicroAppConnectorWorkflows(manifest)).toEqual([
      { path: 'connectors.2.src', message: 'Connector source is not listed in permissions.network.' },
    ]);
  });
});
