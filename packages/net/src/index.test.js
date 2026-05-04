import { describe, expect, it, vi } from 'vitest';
import { get } from './index.js';

describe('net', () => {
  it('handles json responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })));
    const res = await get('/api');
    expect(res).toEqual({ ok: true });
  });
});
