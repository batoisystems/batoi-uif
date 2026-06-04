import { emit } from '@batoi/uif-core';
import { appendTextElement } from '@batoi/uif-dom';

export interface ToolPolicyCheck {
  label: string;
  state: 'pass' | 'warn' | 'fail' | 'pending';
  detail?: string;
}

export interface ToolReviewRequest {
  tool: string;
  risk?: string;
  irreversible?: boolean;
  payload?: unknown;
  policy?: ToolPolicyCheck[];
  timeline?: Array<{ label: string; state?: string }>;
  audit?: Array<{ actor?: string; action: string; at?: string }>;
  diff?: { before: string; after: string };
  result?: unknown;
}

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

export function renderApprovalPolicy(el: HTMLElement, checks: ToolPolicyCheck[]): void {
  const section = document.createElement('section');
  section.className = 'uif-tool-policy';
  section.setAttribute('role', 'region');
  appendTextElement(section, 'h3', 'Policy checks');
  const list = document.createElement('ul');
  checks.forEach((check) => {
    const item = document.createElement('li');
    item.dataset.uifState = check.state;
    appendTextElement(item, 'strong', check.label);
    if (check.detail) appendTextElement(item, 'span', check.detail);
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
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

export function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest): void {
  const review = document.createElement('section');
  review.className = 'uif-tool-review';
  review.dataset.risk = request.risk ?? 'medium';
  review.setAttribute('role', 'region');

  const header = document.createElement('header');
  appendTextElement(header, 'strong', request.tool);
  appendTextElement(header, 'span', `${request.risk ?? 'medium'}${request.irreversible ? ' irreversible' : ''}`, 'uif-risk-badge');
  review.append(header);

  if (request.payload !== undefined) {
    const payload = document.createElement('section');
    payload.className = 'uif-tool-payload';
    appendTextElement(payload, 'h3', 'Payload preview');
    appendTextElement(payload, 'pre', JSON.stringify(request.payload, null, 2));
    review.append(payload);
  }

  if (request.policy?.length) {
    const policyHost = document.createElement('div');
    renderApprovalPolicy(policyHost, request.policy);
    review.append(...Array.from(policyHost.childNodes));
  }

  if (request.timeline?.length) {
    const timelineHost = document.createElement('div');
    renderToolTimeline(timelineHost, request.timeline);
    review.append(...Array.from(timelineHost.childNodes));
  }

  if (request.diff) {
    const diffHost = document.createElement('div');
    renderDiff(diffHost, request.diff.before, request.diff.after);
    review.append(...Array.from(diffHost.childNodes));
  }

  if (request.result !== undefined) {
    const resultHost = document.createElement('div');
    renderToolResult(resultHost, request.result);
    review.append(...Array.from(resultHost.childNodes));
  }

  if (request.audit?.length) {
    const auditHost = document.createElement('div');
    renderToolAuditTrail(auditHost, request.audit);
    review.append(...Array.from(auditHost.childNodes));
  }

  const actions = document.createElement('footer');
  ['approve', 'reject'].forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.uifAction = action;
    button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    actions.append(button);
  });
  review.append(actions);
  el.replaceChildren(review);
  el.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-action]') : null;
    const action = target?.dataset.uifAction;
    if (action === 'approve' || action === 'reject') emit(`uif:tool-${action}`, { tool: request.tool, risk: request.risk ?? 'medium', irreversible: Boolean(request.irreversible), payload: request.payload }, el);
  });
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
