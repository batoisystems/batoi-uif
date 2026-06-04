import { describe, expect, it, vi } from 'vitest';
import { renderApprovalPolicy, renderToolApproval, renderToolProgress, renderToolResult, renderToolReviewFlow } from './index.js';

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

  it('renders policy checks with state markers', () => {
    const el = document.createElement('div');
    renderApprovalPolicy(el, [
      { label: 'Permission check', state: 'pass', detail: 'Allowed by policy' },
      { label: 'Risk threshold', state: 'warn' },
    ]);
    expect(el.querySelector('[data-uif-state="pass"]')?.textContent).toContain('Permission check');
    expect(el.querySelector('[data-uif-state="warn"]')?.textContent).toContain('Risk threshold');
  });

  it('renders review flow safely and emits server-mediated decisions', () => {
    const el = document.createElement('div');
    const approve = vi.fn();
    el.addEventListener('uif:tool-approve', approve);
    renderToolReviewFlow(el, {
      tool: 'db.create_index',
      risk: 'high',
      irreversible: true,
      payload: { sql: '<img src=x onerror=alert(1)>' },
      policy: [{ label: 'Owner approval', state: 'pending' }],
      timeline: [{ label: 'Queued', state: 'done' }],
      diff: { before: 'status: draft', after: '<script>alert(1)</script>' },
      result: { ok: true },
      audit: [{ actor: 'system', action: 'review created', at: '10:00' }],
    });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('script')).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(el.textContent).toContain('<script>alert(1)</script>');
    (el.querySelector('[data-uif-action="approve"]') as HTMLButtonElement).click();
    expect(approve).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ tool: 'db.create_index', risk: 'high', irreversible: true }) }));
  });
});
