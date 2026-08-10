import { describe, expect, it, vi } from 'vitest';
import {
  createGovernedToolTransport,
  renderAgentToolEnvelope,
  renderApprovalPolicy,
  renderToolApproval,
  renderToolPermissions,
  renderToolPlan,
  renderToolProgress,
  renderToolReceipt,
  renderToolResult,
  renderToolReviewFlow,
} from './index.js';

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

  it('cleans up replaced approval controllers', () => {
    const el = document.createElement('div');
    const fn = vi.fn();
    el.addEventListener('uif:tool-approve', fn);
    renderToolApproval(el);
    const current = renderToolApproval(el);
    (el.querySelector('[data-uif-action="approve"]') as HTMLButtonElement).click();
    expect(fn).toHaveBeenCalledOnce();
    current.destroy();
    (el.querySelector('[data-uif-action="approve"]') as HTMLButtonElement).click();
    expect(fn).toHaveBeenCalledOnce();
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
    expect(acceptedHost.querySelector('.uif-tool-review')?.getAttribute('data-uif-state')).toBe('decision-pending');
    expect(acceptedHost.querySelector('.uif-tool-review')?.getAttribute('aria-busy')).toBe('true');
  });

  it('renders bounded plans and permission states as text', () => {
    const plan = document.createElement('div');
    renderToolPlan(plan, [{
      id: 'step-1',
      tool: 'db.preview',
      summary: '<img src=x onerror=alert(1)>',
      dependsOn: ['policy-check'],
      expectedOutput: 'Read-only preview',
      approval: 'required',
    }]);
    expect(plan.querySelector('img')).toBeNull();
    expect(plan.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(plan.querySelector('[data-uif-plan-id="step-1"]')).not.toBeNull();

    const permissions = document.createElement('div');
    renderToolPermissions(permissions, [
      { name: 'records.read', state: 'granted' },
      { name: 'records.write', state: 'missing', detail: 'Owner approval required' },
    ]);
    expect(permissions.querySelector('[data-uif-state="missing"]')?.textContent).toContain('Owner approval required');
  });

  it('distinguishes server-reported and verified receipts', () => {
    const receipt = document.createElement('div');
    renderToolReceipt(receipt, {
      id: 'receipt-1',
      status: 'completed',
      summary: 'Index creation reported complete.',
      verified: false,
      auditRef: 'audit-1',
      artifacts: [{ label: 'Log', reference: 'artifact:log-1', checksum: 'sha256:abc' }],
    });
    expect(receipt.textContent).toContain('Server-reported execution receipt');
    expect(receipt.dataset.uifVerified).toBeUndefined();
    expect(receipt.querySelector('[data-uif-verified="false"]')).not.toBeNull();
  });

  it('renders shared agent tool envelopes and rejects incompatible input', () => {
    const el = document.createElement('div');
    const errors = vi.fn();
    el.addEventListener('uif:agent:error', errors);
    const envelope = renderAgentToolEnvelope(el, {
      version: 3,
      kind: 'tool-plan',
      id: 'plan-1',
      requestId: 'request-1',
      status: 'waiting-approval',
      content: [{
        type: 'data',
        value: [{ id: 'step-1', tool: 'files.preview', summary: 'Preview changes' }],
      }],
    });
    expect(envelope?.id).toBe('plan-1');
    expect(el.dataset.uifEnvelopeId).toBe('plan-1');
    expect(el.textContent).toContain('Preview changes');
    expect(renderAgentToolEnvelope(el, { version: 99 })).toBeNull();
    expect(errors).toHaveBeenCalledTimes(1);
  });

  it('submits correlated decisions only through a governed same-origin gateway', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      version: 3,
      kind: 'tool-progress',
      id: 'progress-1',
      requestId: 'request-1',
      status: 'executing',
      content: [{ type: 'text', text: 'Queued by server' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const transport = createGovernedToolTransport({ src: '/agent/tools', csrfToken: 'token' });
    const response = await transport.submitDecision({ requestId: 'request-1', envelopeId: 'review-1', decision: 'approve' });
    expect(response.kind).toBe('tool-progress');
    expect(fetchMock).toHaveBeenCalledWith('/agent/tools', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: expect.objectContaining({ 'content-type': 'application/json', 'x-csrf-token': 'token' }),
    }));
    await expect(transport.submitDecision({ requestId: '../unsafe', decision: 'reject' })).rejects.toThrow('request identifier');
    transport.cancel();
    vi.unstubAllGlobals();
  });
});
