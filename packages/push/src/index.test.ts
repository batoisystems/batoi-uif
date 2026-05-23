import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initPush, showInAppNotification } from './index.js';

describe('push', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('shows in-app notifications', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = showInAppNotification('Hello');
    expect(el.textContent).toBe('Hello');
  });

  it('handles declarative notify action', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const button = document.createElement('button');
    button.dataset.uifAction = 'notify';
    button.dataset.uifMessage = 'Saved';
    initPush(button);
    button.click();
    expect(document.querySelector('.uif-toast')?.textContent).toBe('Saved');
  });
});
