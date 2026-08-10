import { describe, expect, it } from 'vitest';
import { createLocalStore, createSyncQueue } from './index.js';

describe('local Micro App storage', () => {
  it('stores, exports, and imports namespaced values', async () => {
    const store = createLocalStore({ namespace: 'test-local', driver: 'memory' });

    await store.set('draft', { title: 'Plan' });

    expect(await store.get('draft')).toEqual({ title: 'Plan' });
    expect(await store.exportJSON()).toContain('Plan');

    await store.importJSON('{"layout":{"cols":2}}');
    expect(await store.get('draft')).toBeUndefined();
    expect(await store.get('layout')).toEqual({ cols: 2 });
  });

  it('maintains a sync queue', async () => {
    const store = createLocalStore({ namespace: 'test-sync', driver: 'memory' });
    const queue = createSyncQueue<{ id: number }>(store);

    const item = await queue.enqueue('save', { id: 1 }, 'item-1');
    await queue.update(item.id, { status: 'failed', attempts: 1, lastError: 'offline' });

    expect(await queue.list('queued')).toHaveLength(0);
    expect(await queue.list('failed')).toMatchObject([{ id: 'item-1', attempts: 1, lastError: 'offline' }]);
  });

  it('partitions, expires, bounds, and resolves governed sync work', async () => {
    const store = createLocalStore({ namespace: 'governed-sync', driver: 'memory' });
    let current = new Date('2026-01-01T00:00:00Z');
    const queue = createSyncQueue<{ value: number }>(store, 'sync-queue', {
      owner: 'principal-1',
      maxItems: 2,
      maxAttempts: 2,
      ttlMilliseconds: 1_000,
      now: () => current,
    });
    const first = await queue.enqueue('save', { value: 1 }, 'item-1');
    expect(first.owner).toBe('principal-1');
    await queue.update(first.id, { status: 'conflict' });
    expect(await queue.resolveConflict(first.id, { value: 2 })).toMatchObject({ status: 'queued', attempts: 0, payload: { value: 2 } });
    current = new Date('2026-01-01T00:00:02Z');
    expect(await queue.list('expired')).toHaveLength(1);
    await expect(queue.update(first.id, { attempts: 3 })).rejects.toThrow('between 0 and 2');
    await queue.clearOwner();
    expect(await queue.list()).toHaveLength(0);
  });

  it('enforces payload, entry, key, and namespace version boundaries', async () => {
    const store = createLocalStore({ namespace: 'bounded', driver: 'memory', maxBytes: 12, maxEntries: 1, version: 3 });
    expect(store.version).toBe(3);
    await store.set('one', 'small');
    await expect(store.set('two', 'small')).rejects.toThrow('1 entry limit');
    await expect(store.set('one', 'value larger than limit')).rejects.toThrow('12 byte limit');
    await expect(store.set('', 'bad')).rejects.toThrow('1-200 characters');

    window.localStorage.clear();
    createLocalStore({ namespace: 'versioned', version: 1 });
    expect(() => createLocalStore({ namespace: 'versioned', version: 2 })).toThrow('namespace version 1 does not match 2');
  });

  it('reports malformed persisted JSON without exposing raw parse errors', async () => {
    window.localStorage.clear();
    const store = createLocalStore({ namespace: 'malformed' });
    window.localStorage.setItem('malformed:draft', '{bad');

    await expect(store.get('draft')).rejects.toThrow('Local store read for draft failed');
    await expect(store.list()).rejects.toThrow('Local store list failed');
  });

  it('validates an import before replacing existing data', async () => {
    const store = createLocalStore({ namespace: 'atomic-import', driver: 'memory', maxBytes: 100, maxEntries: 1 });
    await store.set('existing', { saved: true });

    await expect(store.importJSON('{"one":1,"two":2}')).rejects.toThrow('1 entry limit');
    expect(await store.get('existing')).toEqual({ saved: true });
    await expect(store.importJSON('{"__uif_meta__":1}')).rejects.toThrow('not reserved');
    expect(await store.get('existing')).toEqual({ saved: true });
  });

  it('normalizes circular and unsupported values as storage errors', async () => {
    const store = createLocalStore({ namespace: 'serialization', driver: 'memory' });
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    await expect(store.set('circular', circular)).rejects.toThrow('Local store serialization failed');
    await expect(store.set('undefined', undefined)).rejects.toThrow('JSON-serializable');
  });

  it('fails explicitly when the requested IndexedDB capability is unavailable', () => {
    expect(() => createLocalStore({ namespace: 'indexed', driver: 'indexeddb' })).toThrow('IndexedDB is unavailable');
  });
});
