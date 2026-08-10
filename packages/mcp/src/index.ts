import {
  emit,
  validateAgentEnvelope,
  type AgentInteractionEnvelope,
} from '@batoi/uif-core';
import { appendTextElement, isSafeURL } from '@batoi/uif-dom';
import { cancelRequest, request } from '@batoi/uif-net';

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

export interface ToolDecisionController {
  destroy(): void;
}

const decisionControllers = new WeakMap<HTMLElement, ToolDecisionController>();

function ownDecisionController(el: HTMLElement, abortController: AbortController): ToolDecisionController {
  decisionControllers.get(el)?.destroy();
  const controller: ToolDecisionController = {
    destroy() {
      abortController.abort();
      if (decisionControllers.get(el) === controller) decisionControllers.delete(el);
    },
  };
  decisionControllers.set(el, controller);
  return controller;
}

export interface ToolPlanItem {
  id: string;
  tool: string;
  summary: string;
  dependsOn?: string[];
  expectedOutput?: string;
  approval?: 'none' | 'required' | 'separate';
}

export interface ToolPermissionScope {
  name: string;
  state: 'requested' | 'granted' | 'missing' | 'denied' | 'expiring';
  detail?: string;
  expiresAt?: string;
}

export interface ToolExecutionReceipt {
  id: string;
  requestId?: string;
  status: 'completed' | 'partial' | 'failed' | 'cancelled';
  issuedAt?: string;
  auditRef?: string;
  verified?: boolean;
  summary: string;
  artifacts?: Array<{ label: string; reference: string; checksum?: string }>;
}

export interface GovernedToolTransportOptions {
  src: string;
  allowCrossOrigin?: boolean;
  timeout?: number;
  csrfToken?: string;
  csrfHeader?: string;
  credentials?: RequestCredentials;
  key?: string;
}

export interface GovernedToolDecision {
  requestId: string;
  decision: 'approve' | 'reject';
  envelopeId?: string;
  reason?: string;
}

export interface GovernedToolTransport {
  submitDecision(decision: GovernedToolDecision): Promise<AgentInteractionEnvelope>;
  poll(requestId: string): Promise<AgentInteractionEnvelope>;
  cancel(): void;
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

const governedIdentifierPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;

export function createGovernedToolTransport(options: GovernedToolTransportOptions): GovernedToolTransport {
  if (!isSafeURL(options.src, {
    context: 'network',
    allowHash: false,
    sameOrigin: !options.allowCrossOrigin,
  })) {
    throw new Error('Batoi UIF blocked an unsafe governed tool gateway URL');
  }
  const key = options.key ?? `tool:${crypto.randomUUID()}`;
  const validateResponse = (input: unknown): AgentInteractionEnvelope => {
    const result = validateAgentEnvelope(input);
    if (!result.valid || !['tool-review', 'tool-progress', 'tool-result', 'receipt', 'error'].includes(result.envelope.kind)) {
      throw new Error(`Invalid governed tool response: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ') || 'unexpected envelope kind'}`);
    }
    return result.envelope;
  };
  const baseRequest = {
    key,
    timeout: options.timeout ?? 30_000,
    credentials: options.credentials ?? 'same-origin',
    csrfToken: options.csrfToken,
    csrfHeader: options.csrfHeader,
    parseAs: 'json' as const,
    retries: 0,
  };
  const assertIdentifier = (value: string, label: string) => {
    if (!governedIdentifierPattern.test(value)) throw new Error(`Invalid governed tool ${label}`);
  };
  return {
    async submitDecision(decision) {
      assertIdentifier(decision.requestId, 'request identifier');
      if (decision.envelopeId) assertIdentifier(decision.envelopeId, 'envelope identifier');
      const response = await request<unknown>(options.src, {
        ...baseRequest,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          requestId: decision.requestId,
          decision: decision.decision,
          envelopeId: decision.envelopeId,
          reason: decision.reason?.slice(0, 4_000),
        }),
      });
      return validateResponse(response);
    },
    async poll(requestId) {
      assertIdentifier(requestId, 'request identifier');
      const url = new URL(options.src, window.location.href);
      url.searchParams.set('requestId', requestId);
      return validateResponse(await request<unknown>(url.href, { ...baseRequest, method: 'GET' }));
    },
    cancel() {
      cancelRequest(key);
    },
  };
}

export function renderToolPlan(
  el: HTMLElement,
  items: ToolPlanItem[],
  options: ToolRenderOptions = {},
): void {
  const section = document.createElement('section');
  section.className = 'uif-tool-plan';
  section.setAttribute('role', 'region');
  appendTextElement(section, 'h3', 'Proposed tool plan');
  const list = document.createElement('ol');
  boundedItems(items, options).forEach((entry) => {
    const item = document.createElement('li');
    item.dataset.uifPlanId = String(entry.id ?? '').slice(0, 200);
    item.dataset.uifApproval = entry.approval ?? 'required';
    appendTextElement(item, 'strong', String(entry.tool ?? '').slice(0, 1_000));
    appendTextElement(item, 'p', String(entry.summary ?? '').slice(0, 10_000));
    if (Array.isArray(entry.dependsOn) && entry.dependsOn.length) appendTextElement(item, 'p', `Depends on: ${entry.dependsOn.slice(0, 100).map(String).join(', ')}`);
    if (entry.expectedOutput) appendTextElement(item, 'p', `Expected output: ${String(entry.expectedOutput).slice(0, 10_000)}`);
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}

export function renderToolPermissions(
  el: HTMLElement,
  scopes: ToolPermissionScope[],
  options: ToolRenderOptions = {},
): void {
  const section = document.createElement('section');
  section.className = 'uif-tool-permissions';
  section.setAttribute('role', 'region');
  appendTextElement(section, 'h3', 'Permissions and scope');
  const list = document.createElement('ul');
  boundedItems(scopes, options).forEach((scope) => {
    const item = document.createElement('li');
    item.dataset.uifState = scope.state;
    appendTextElement(item, 'strong', String(scope.name ?? '').slice(0, 1_000));
    if (scope.detail) appendTextElement(item, 'span', String(scope.detail).slice(0, 10_000));
    if (scope.expiresAt) {
      const time = appendTextElement(item, 'time', scope.expiresAt);
      time.dateTime = scope.expiresAt;
    }
    list.append(item);
  });
  section.append(list);
  el.replaceChildren(section);
}

export function renderToolReceipt(
  el: HTMLElement,
  receipt: ToolExecutionReceipt,
  options: ToolRenderOptions = {},
): void {
  const section = document.createElement('section');
  section.className = 'uif-tool-receipt';
  section.dataset.uifState = receipt.status;
  section.dataset.uifVerified = String(receipt.verified === true);
  section.setAttribute('role', 'region');
  appendTextElement(section, 'h3', receipt.verified ? 'Verified execution receipt' : 'Server-reported execution receipt');
  appendTextElement(section, 'p', String(receipt.summary ?? '').slice(0, 10_000));
  if (receipt.auditRef) appendTextElement(section, 'p', `Audit reference: ${receipt.auditRef}`);
  if (receipt.issuedAt) {
    const time = appendTextElement(section, 'time', receipt.issuedAt);
    time.dateTime = receipt.issuedAt;
  }
  if (receipt.artifacts?.length) {
    const list = document.createElement('ul');
    boundedItems(receipt.artifacts, options).forEach((artifact) => {
      const item = document.createElement('li');
      appendTextElement(item, 'strong', String(artifact.label ?? '').slice(0, 1_000));
      appendTextElement(item, 'code', String(artifact.reference ?? '').slice(0, 4_000));
      if (artifact.checksum) appendTextElement(item, 'code', String(artifact.checksum).slice(0, 1_000));
      list.append(item);
    });
    section.append(list);
  }
  el.replaceChildren(section);
}

export function renderAgentToolEnvelope(
  el: HTMLElement,
  input: unknown,
  options: ToolRenderOptions = {},
): AgentInteractionEnvelope | null {
  const result = validateAgentEnvelope(input, options);
  if (!result.valid || !['tool-plan', 'tool-review', 'tool-progress', 'tool-result', 'receipt'].includes(result.envelope.kind)) {
    emit('uif:agent:error', { code: 'AGENT_TOOL_ENVELOPE_INVALID', issues: result.issues }, el);
    return null;
  }
  const envelope = result.envelope;
  const data = envelope.content.find((part) => part.type === 'data');
  const text = envelope.content.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
  if (envelope.kind === 'tool-plan') {
    const items = Array.isArray(data?.value) ? data.value as ToolPlanItem[] : [];
    renderToolPlan(el, items, options);
  } else if (envelope.kind === 'receipt') {
    const source = data?.value && typeof data.value === 'object' && !Array.isArray(data.value)
      ? data.value as Partial<ToolExecutionReceipt>
      : {};
    renderToolReceipt(el, {
      id: envelope.id,
      requestId: envelope.requestId,
      status: envelope.status === 'partial' || envelope.status === 'failed' || envelope.status === 'cancelled' ? envelope.status : 'completed',
      issuedAt: envelope.createdAt,
      auditRef: envelope.auditRef,
      verified: source.verified === true,
      summary: (source.summary ?? text) || 'Execution receipt received.',
      artifacts: source.artifacts,
    }, options);
  } else if (envelope.kind === 'tool-progress') {
    renderToolProgress(el, text || envelope.status);
  } else if (envelope.kind === 'tool-result') {
    renderToolResult(el, data?.value ?? text, options);
  } else {
    renderToolReviewFlow(el, {
      tool: envelope.actor?.label ?? 'Governed tool',
      requestId: envelope.requestId,
      expiresAt: envelope.expiresAt,
      auditRef: envelope.auditRef,
      risk: envelope.risk?.level,
      irreversible: envelope.risk?.reversible === false,
      payload: data?.value ?? text,
    }, options);
  }
  el.dataset.uifEnvelopeId = envelope.id;
  el.dataset.uifState = envelope.status;
  return envelope;
}

export function initAgentToolEnvelope(el: HTMLElement): ToolDecisionController | void {
  const raw = el.dataset.uifEnvelope;
  if (!raw) return;
  try {
    renderAgentToolEnvelope(el, JSON.parse(raw) as unknown);
    return decisionControllers.get(el);
  } catch (error) {
    emit('uif:agent:error', { code: 'AGENT_TOOL_ENVELOPE_JSON', error }, el);
  }
}

export function renderToolApproval(el: HTMLElement): ToolDecisionController {
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
  const abortController = new AbortController();
  el.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-action]') : null;
    const action = target?.dataset.uifAction;
    const confirmation = el.querySelector<HTMLInputElement>('[data-uif-role="confirm"]');
    if (action === 'approve' && irreversible && confirmation?.value !== 'APPROVE') {
      emit('uif:tool-confirmation-required', { tool, risk }, el);
      return;
    }
    if (action === 'approve' || action === 'reject') emit(`uif:tool-${action}`, { tool, risk, irreversible }, el);
  }, { signal: abortController.signal });
  return ownDecisionController(el, abortController);
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

export function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest, options: ToolRenderOptions = {}): ToolDecisionController {
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
  const abortController = new AbortController();
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
    review.dataset.uifState = 'decision-pending';
    review.setAttribute('aria-busy', 'true');
    actions.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = true; });
    emit(`uif:tool-${action}`, { tool: request.tool, risk: request.risk ?? 'medium', irreversible: Boolean(request.irreversible), payload: request.payload, requestId: request.requestId, expiresAt: request.expiresAt, auditRef: request.auditRef }, el);
  }, { signal: abortController.signal });
  return ownDecisionController(el, abortController);
}

export const toolApproval = { name: 'tool-approval', init: renderToolApproval };
export const agentTool = { name: 'agent-tool', init: initAgentToolEnvelope };
