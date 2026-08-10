// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import {
  clearStoragePartition,
  configureStoragePartition,
  getStoragePartition,
  partitionStorageKey,
} from './storage-partition.js';

afterEach(() => {
  configureStoragePartition(null);
  window.localStorage.clear();
});

describe('storage partition', () => {
  it('partitions application data by tenant and principal', () => {
    configureStoragePartition({ applicationId: 'sales', tenantId: 'acme', principalId: 'user-42' });
    expect(getStoragePartition()).toEqual({ applicationId: 'sales', tenantId: 'acme', principalId: 'user-42' });
    expect(partitionStorageKey('density')).toBe('uif:sales:acme:user-42:density');
  });

  it('clears only the active principal partition', () => {
    configureStoragePartition({ applicationId: 'sales', tenantId: 'acme', principalId: 'one' });
    window.localStorage.setItem(partitionStorageKey('density'), 'compact');
    window.localStorage.setItem('uif:sales:acme:two:density', 'roomy');
    expect(clearStoragePartition()).toBe(1);
    expect(window.localStorage.getItem('uif:sales:acme:two:density')).toBe('roomy');
  });

  it('preserves v2 keys until an application configures a partition', () => {
    expect(partitionStorageKey('workspace-density')).toBe('workspace-density');
    expect(() => configureStoragePartition({ applicationId: 'bad:value', principalId: 'user' })).toThrow('Invalid UIF storage partition');
  });
});
