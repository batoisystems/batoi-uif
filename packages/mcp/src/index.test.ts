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

  it('bounds and safely serializes tool payloads', () => {
    const el = document.createElement('div');
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    renderToolResult(el, circular, { maxCharacters: 20 });
    expect(el.textContent).toContain('[Unserializable tool payload]');
    renderToolResult(el, { value: '1234567890' }, { maxCharacters: 8 });
    expect(el.textContent).toContain('[truncated]');
  });

  it('blocks expired approvals and makes accepted decisions one-shot and correlated', () => {
    const expiredHost = document.createElement('div');
    const expired = vi.fn();
    const approve = vi.fn();
    expiredHost.addEventListener('uif:tool-expired', expired);
    expiredHost.addEventListener('uif:tool-approve', approve);
    renderToolReviewFlow(expiredHost, { tool: 'deploy', requestId: 'req-expired', expiresAt: '2000-01-01T00:00:00.000Z' });
    (expiredHost.querySelector('[data-uif-action="approve"]') as HTMLButtonElement).click();
    expect(expired).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ requestId: 'req-expired' }) }));
    expect(approve).not.toHaveBeenCalled();

    const acceptedHost = document.createElement('div');
    const accepted = vi.fn();
    acceptedHost.addEventListener('uif:tool-approve', accepted);
    renderToolReviewFlow(acceptedHost, { tool: 'deploy', requestId: 'req-1', auditRef: 'audit-7', expiresAt: '2999-01-01T00:00:00.000Z' });
    const button = acceptedHost.querySelector('[data-uif-action="approve"]') as HTMLButtonElement;
    button.click();
    button.click();
    expect(accepted).toHaveBeenCalledOnce();
    expect(accepted).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ requestId: 'req-1', auditRef: 'audit-7' }) }));
    expect(button.disabled).toBe(true);
    expect(acceptedHost.querySelector('.uif-tool-review')?.getAttribute('data-uif-decision')).toBe('approve');
  });
});
