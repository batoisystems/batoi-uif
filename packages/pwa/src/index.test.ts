import { describe, expect, it, vi } from 'vitest';
import { cacheStrategies, onNetworkChange, setupInstallPrompt } from './index.js';

describe('pwa', () => {
  it('exposes cache strategies and network change cleanup', () => {
    const fn = vi.fn();
    const off = onNetworkChange(fn);
    window.dispatchEvent(new Event('online'));
    off();
    expect(fn).toHaveBeenCalledWith(true);
    expect(cacheStrategies.networkFirst).toContain('fetch');
  });

  it('captures install prompt event', async () => {
    const prompt = vi.fn(async () => undefined);
    const runPrompt = setupInstallPrompt();
    const event = new Event('beforeinstallprompt') as Event & { prompt: typeof prompt };
    event.prompt = prompt;
    window.dispatchEvent(event);
    await runPrompt();
    expect(prompt).toHaveBeenCalled();
  });
});
