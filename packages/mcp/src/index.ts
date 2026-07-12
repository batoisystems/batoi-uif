import { emit } from '@batoi/uif-core';
import { appendTextElement } from '@batoi/uif-dom';

export interface ToolPolicyCheck {
  label: string;
  state: 'pass' | 'warn' | 'fail' | 'pending';
  detail?: string;
}

export interface ToolReviewRequest {
  tool: string;
  requestId?: string;
  expiresAt?: string;
  auditRef?: string;
  risk?: string;
  irreversible?: boolean;
  payload?: unknown;
  policy?: ToolPolicyCheck[];
  timeline?: Array<{ label: string; state?: string }>;
  audit?: Array<{ actor?: string; action: string; at?: string }>;
  diff?: { before: string; after: string };
  result?: unknown;
}

export interface ToolRenderOptions {
  maxCharacters?: number;
  maxItems?: number;
}

function boundedItems<T>(items: T[], options: ToolRenderOptions): T[] {
  return items.slice(0, Math.max(1, Math.floor(options.maxItems ?? 100)));
}

function serializeToolValue(value: unknown, options: ToolRenderOptions = {}): string {
  const limit = Math.max(1, Math.floor(options.maxCharacters ?? 100_000));
  let serialized: string;
  try {
    serialized = JSON.stringify(value, null, 2) ?? 'null';
  } catch {
    return '[Unserializable tool payload]';
  }
  return serialized.length > limit ? `${serialized.slice(0, limit)}\n[truncated]` : serialized;
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

export function renderApprovalPolicy(el: HTMLElement, checks: ToolPolicyCheck[], options: ToolRenderOptions = {}): void {
  const section = document.createElement('section');
  section.className = 'uif-tool-policy';
  section.setAttribute('role', 'region');
  appendTextElement(section, 'h3', 'Policy checks');
  const list = document.createElement('ul');
  boundedItems(checks, options).forEach((check) => {
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

export function renderToolTimeline(el: HTMLElement, steps: Array<{ label: string; state?: string }>, options: ToolRenderOptions = {}): void {
  const list = document.createElement('ol');
  list.className = 'uif-tool-timeline';
  boundedItems(steps, options).forEach((step) => {
    const item = appendTextElement(list, 'li', step.label);
    item.dataset.uifState = step.state ?? 'pending';
  });
  el.replaceChildren(list);
}

export function renderToolAuditTrail(el: HTMLElement, entries: Array<{ actor?: string; action: string; at?: string }>, options: ToolRenderOptions = {}): void {
  const list = document.createElement('ol');
  list.className = 'uif-tool-audit';
  boundedItems(entries, options).forEach((entry) => {
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

export function renderToolResult(el: HTMLElement, result: unknown, options: ToolRenderOptions = {}): void {
  const pre = appendTextElement(document.createElement('div'), 'pre', serializeToolValue(result, options), 'uif-tool-result');
  el.replaceChildren(pre);
}

export function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest, options: ToolRenderOptions = {}): void {
  const review = document.createElement('section');
  review.className = 'uif-tool-review';
  review.dataset.risk = request.risk ?? 'medium';
  if (request.requestId) review.dataset.uifRequestId = request.requestId;
  if (request.expiresAt) review.dataset.uifExpiresAt = request.expiresAt;
  review.setAttribute('role', 'region');

  const header = document.createElement('header');
  appendTextElement(header, 'strong', request.tool);
  appendTextElement(header, 'span', `${request.risk ?? 'medium'}${request.irreversible ? ' irreversible' : ''}`, 'uif-risk-badge');
  review.append(header);

  if (request.payload !== undefined) {
    const payload = document.createElement('section');
    payload.className = 'uif-tool-payload';
    appendTextElement(payload, 'h3', 'Payload preview');
    appendTextElement(payload, 'pre', serializeToolValue(request.payload, options));
    review.append(payload);
  }

  if (request.policy?.length) {
    const policyHost = document.createElement('div');
    renderApprovalPolicy(policyHost, request.policy, options);
    review.append(...Array.from(policyHost.childNodes));
  }

  if (request.timeline?.length) {
    const timelineHost = document.createElement('div');
    renderToolTimeline(timelineHost, request.timeline, options);
    review.append(...Array.from(timelineHost.childNodes));
  }

  if (request.diff) {
    const diffHost = document.createElement('div');
    renderDiff(diffHost, request.diff.before, request.diff.after);
    review.append(...Array.from(diffHost.childNodes));
  }

  if (request.result !== undefined) {
    const resultHost = document.createElement('div');
    renderToolResult(resultHost, request.result, options);
    review.append(...Array.from(resultHost.childNodes));
  }

  if (request.audit?.length) {
    const auditHost = document.createElement('div');
    renderToolAuditTrail(auditHost, request.audit, options);
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
  let decided = false;
  el.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-action]') : null;
    const action = target?.dataset.uifAction;
    if (action !== 'approve' && action !== 'reject') return;
    if (decided) {
      emit('uif:tool-replay-blocked', { tool: request.tool, requestId: request.requestId }, el);
      return;
    }
    if (action === 'approve' && request.expiresAt && Date.parse(request.expiresAt) <= Date.now()) {
      emit('uif:tool-expired', { tool: request.tool, requestId: request.requestId, expiresAt: request.expiresAt }, el);
      return;
    }
    decided = true;
    review.dataset.uifDecision = action;
    actions.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = true; });
    emit(`uif:tool-${action}`, { tool: request.tool, risk: request.risk ?? 'medium', irreversible: Boolean(request.irreversible), payload: request.payload, requestId: request.requestId, expiresAt: request.expiresAt, auditRef: request.auditRef }, el);
  });
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
