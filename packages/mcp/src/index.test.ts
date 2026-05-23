import { describe, expect, it, vi } from 'vitest';
import { renderToolApproval, renderToolProgress, renderToolResult } from './index.js';

describe('mcp', () => {
  it('renders approval and emits approve events', () => {
    const el = document.createElement('div');
    el.dataset.uifTool = 'create_database';
    const fn = vi.fn();
    el.addEventListener('uif:tool-approve', fn);
    renderToolApproval(el);
    (el.querySelector('[data-uif-action="approve"]') as HTMLButtonElement).click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('renders progress and result states', () => {
    const el = document.createElement('div');
    renderToolProgress(el, 'Working');
    expect(el.textContent).toContain('Working');
    renderToolResult(el, { ok: true });
    expect(el.textContent).toContain('"ok": true');
  });
});
