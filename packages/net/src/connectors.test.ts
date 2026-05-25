import { describe, expect, it, vi } from 'vitest';
import { csvToObjects, loadConnector } from './index.js';

describe('data connectors', () => {
  it('parses CSV into objects', () => {
    expect(csvToObjects('name,value\nBookings,248\n"Open, Incidents",3')).toEqual([
      { name: 'Bookings', value: '248' },
      { name: 'Open, Incidents', value: '3' },
    ]);
  });

  it('loads static connector data', async () => {
    await expect(loadConnector({ type: 'static', data: [{ label: 'A', value: 1 }] })).resolves.toEqual([{ label: 'A', value: 1 }]);
  });

  it('loads CSV connector data through fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('label,value\nA,1', { headers: { 'content-type': 'text/csv' } })),
    );

    await expect(loadConnector({ type: 'csv', src: '/metrics.csv' })).resolves.toEqual([{ label: 'A', value: '1' }]);
    vi.unstubAllGlobals();
  });
});
