import { describe, expect, it } from 'vitest';
import { getPresence, publishLocal, removePresence, subscribe, updatePresence } from './index.js';

describe('realtime helpers', () => {
  it('publishes local channel events', () => {
    const received: unknown[] = [];
    const unsubscribe = subscribe('ops', (payload) => received.push(payload));

    publishLocal('ops', { status: 'open' });
    unsubscribe();
    publishLocal('ops', { status: 'ignored' });

    expect(received).toEqual([{ status: 'open' }]);
  });

  it('tracks presence per channel', () => {
    updatePresence('board', { id: 'ada', name: 'Ada' });
    updatePresence('board', { id: 'grace', name: 'Grace' });
    removePresence('board', 'ada');

    expect(getPresence('board')).toMatchObject([{ id: 'grace', name: 'Grace' }]);
  });
});
