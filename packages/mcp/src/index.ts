import { emit } from '@batoi/uif-core';

export function renderToolApproval(el: HTMLElement): void {
  const tool = el.dataset.uifTool || 'tool';
  const risk = el.dataset.uifRisk || 'medium';
  const irreversible = el.dataset.uifIrreversible === 'true';
  el.innerHTML = `
    <div class="uif-tool-approval" data-risk="${risk}">
      <strong>${tool}</strong>
      <span class="uif-risk-badge">${risk}${irreversible ? ' irreversible' : ''}</span>
      ${irreversible ? '<input data-uif-role="confirm" placeholder="Type APPROVE">' : ''}
      <button data-uif-action="approve">Approve</button>
      <button data-uif-action="reject">Reject</button>
    </div>`;
  el.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-action]') : null;
    const action = target?.dataset.uifAction;
    const confirmation = el.querySelector<HTMLInputElement>('[data-uif-role="confirm"]');
    if (action === 'approve' && irreversible && confirmation?.value !== 'APPROVE') {
      emit('uif:tool-confirmation-required', { tool, risk }, el);
      return;
    }
    if (action === 'approve' || action === 'reject') emit(`uif:tool-${action}`, { tool, risk, irreversible }, el);
  });
}

export function renderToolProgress(el: HTMLElement, message: string): void {
  el.innerHTML = `<div class="uif-tool-progress" role="status">${message}</div>`;
}

export function renderToolTimeline(el: HTMLElement, steps: Array<{ label: string; state?: string }>): void {
  el.innerHTML = `<ol class="uif-tool-timeline">${steps
    .map((step) => `<li data-uif-state="${step.state ?? 'pending'}">${step.label}</li>`)
    .join('')}</ol>`;
}

export function renderToolAuditTrail(el: HTMLElement, entries: Array<{ actor?: string; action: string; at?: string }>): void {
  el.innerHTML = `<ol class="uif-tool-audit">${entries
    .map((entry) => `<li><strong>${entry.actor ?? 'system'}</strong> ${entry.action} <time>${entry.at ?? ''}</time></li>`)
    .join('')}</ol>`;
}

export function renderDiff(el: HTMLElement, before: string, after: string): void {
  el.innerHTML = `<div class="uif-diff"><pre data-uif-role="before">${before}</pre><pre data-uif-role="after">${after}</pre></div>`;
}

export function renderToolResult(el: HTMLElement, result: unknown): void {
  el.innerHTML = `<pre class="uif-tool-result">${JSON.stringify(result, null, 2)}</pre>`;
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
