import { emit } from '@batoi/uif-core';
import { appendTextElement } from '@batoi/uif-dom';

export function renderToolApproval(el: HTMLElement): void {
  const tool = el.dataset.uifTool || 'tool';
  const risk = el.dataset.uifRisk || 'medium';
  const irreversible = el.dataset.uifIrreversible === 'true';
  const card = document.createElement('div');
  card.className = 'uif-tool-approval';
  card.dataset.risk = risk;
  appendTextElement(card, 'strong', tool);
  appendTextElement(card, 'span', `${risk}${irreversible ? ' irreversible' : ''}`, 'uif-risk-badge');
  if (irreversible) {
    const input = document.createElement('input');
    input.dataset.uifRole = 'confirm';
    input.placeholder = 'Type APPROVE';
    card.append(input);
  }
  ['approve', 'reject'].forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    card.append(button);
  });
  el.replaceChildren(card);
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
  const progress = appendTextElement(document.createElement('div'), 'div', message, 'uif-tool-progress');
  progress.setAttribute('role', 'status');
  el.replaceChildren(progress);
}

export function renderToolTimeline(el: HTMLElement, steps: Array<{ label: string; state?: string }>): void {
  const list = document.createElement('ol');
  list.className = 'uif-tool-timeline';
  steps.forEach((step) => {
    const item = appendTextElement(list, 'li', step.label);
    item.dataset.uifState = step.state ?? 'pending';
  });
  el.replaceChildren(list);
}

export function renderToolAuditTrail(el: HTMLElement, entries: Array<{ actor?: string; action: string; at?: string }>): void {
  const list = document.createElement('ol');
  list.className = 'uif-tool-audit';
  entries.forEach((entry) => {
    const item = document.createElement('li');
    appendTextElement(item, 'strong', entry.actor ?? 'system');
    item.append(` ${entry.action} `);
    appendTextElement(item, 'time', entry.at ?? '');
    list.append(item);
  });
  el.replaceChildren(list);
}

export function renderDiff(el: HTMLElement, before: string, after: string): void {
  const diff = document.createElement('div');
  diff.className = 'uif-diff';
  const beforeEl = appendTextElement(diff, 'pre', before);
  beforeEl.dataset.uifRole = 'before';
  const afterEl = appendTextElement(diff, 'pre', after);
  afterEl.dataset.uifRole = 'after';
  el.replaceChildren(diff);
}

export function renderToolResult(el: HTMLElement, result: unknown): void {
  const pre = appendTextElement(document.createElement('div'), 'pre', JSON.stringify(result, null, 2), 'uif-tool-result');
  el.replaceChildren(pre);
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
