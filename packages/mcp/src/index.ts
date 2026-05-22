import { emit } from '@batoi/uif-core';

export function renderToolApproval(el: HTMLElement): void {
  const tool = el.dataset.uifTool || 'tool';
  const risk = el.dataset.uifRisk || 'medium';
  el.innerHTML = `
    <div class="uif-tool-approval" data-risk="${risk}">
      <strong>${tool}</strong>
      <span>${risk}</span>
      <button data-uif-action="approve">Approve</button>
      <button data-uif-action="reject">Reject</button>
    </div>`;
  el.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-action]') : null;
    const action = target?.dataset.uifAction;
    if (action === 'approve' || action === 'reject') emit(`uif:tool-${action}`, { tool, risk }, el);
  });
}

export function renderToolProgress(el: HTMLElement, message: string): void {
  el.innerHTML = `<div class="uif-tool-progress" role="status">${message}</div>`;
}

export function renderToolResult(el: HTMLElement, result: unknown): void {
  el.innerHTML = `<pre class="uif-tool-result">${JSON.stringify(result, null, 2)}</pre>`;
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
