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
});
