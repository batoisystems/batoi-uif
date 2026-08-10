import {
  defaultUIFResourceLimits,
  findUnsafeObjectPaths,
  type UIFResourceLimits,
} from './contracts.js';

export type AgentEnvelopeKind =
  | 'message'
  | 'notice'
  | 'stream-delta'
  | 'stream-complete'
  | 'tool-plan'
  | 'tool-review'
  | 'tool-progress'
  | 'tool-result'
  | 'receipt'
  | 'error';

export type AgentEnvelopeStatus =
  | 'draft'
  | 'pending'
  | 'streaming'
  | 'waiting-approval'
  | 'approved'
  | 'rejected'
  | 'executing'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'superseded';

export type AgentActorRole = 'user' | 'assistant' | 'system' | 'tool' | 'reviewer';
export type AgentRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AgentActor {
  role: AgentActorRole;
  label?: string;
}

export interface AgentTextPart {
  type: 'text';
  text: string;
}

export interface AgentSourcePart {
  type: 'source';
  id: string;
  label: string;
  url?: string;
  retrievedAt?: string;
  unavailable?: boolean;
}

export interface AgentArtifactPart {
  type: 'artifact';
  id: string;
  label: string;
  mediaType?: string;
  url?: string;
  checksum?: string;
}

export interface AgentDataPart {
  type: 'data';
  label?: string;
  value: unknown;
}

export type AgentContentPart = AgentTextPart | AgentSourcePart | AgentArtifactPart | AgentDataPart;

export interface AgentUsageDisclosure {
  model?: string;
  route?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  currency?: string;
  latencyMilliseconds?: number;
  retention?: string;
}

export interface AgentRiskDisclosure {
  level: AgentRiskLevel;
  reversible?: boolean;
  summary?: string;
  affectedResources?: string[];
  externalRecipients?: string[];
  dataClassification?: string;
}

export interface AgentInteractionEnvelope {
  version: 3;
  kind: AgentEnvelopeKind;
  id: string;
  threadId?: string;
  turnId?: string;
  parentId?: string;
  requestId?: string;
  correlationId?: string;
  auditRef?: string;
  sequence?: number;
  createdAt?: string;
  expiresAt?: string;
  status: AgentEnvelopeStatus;
  actor?: AgentActor;
  content: AgentContentPart[];
  usage?: AgentUsageDisclosure;
  risk?: AgentRiskDisclosure;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export interface AgentEnvelopeIssue {
  path: string;
  code: 'invalid' | 'unsupported' | 'unsafe' | 'limit' | 'truncated';
  message: string;
}

export interface AgentEnvelopeResult {
  envelope: AgentInteractionEnvelope;
  issues: AgentEnvelopeIssue[];
  valid: boolean;
}

export const agentEnvelopeKinds = Object.freeze([
  'message', 'notice', 'stream-delta', 'stream-complete', 'tool-plan', 'tool-review',
  'tool-progress', 'tool-result', 'receipt', 'error',
] satisfies AgentEnvelopeKind[]);

export const agentEnvelopeStatuses = Object.freeze([
  'draft', 'pending', 'streaming', 'waiting-approval', 'approved', 'rejected', 'executing',
  'completed', 'partial', 'failed', 'cancelled', 'expired', 'superseded',
] satisfies AgentEnvelopeStatus[]);

export const agentContentPartTypes = Object.freeze(['text', 'source', 'artifact', 'data'] as const);

export const agentEnvelopeContract = Object.freeze({
  name: 'agent-interaction',
  version: 3,
  authority: 'presentation-only',
  kinds: agentEnvelopeKinds,
  statuses: agentEnvelopeStatuses,
  contentPartTypes: agentContentPartTypes,
  requiredFields: Object.freeze(['version', 'kind', 'id', 'status', 'content']),
  privilegedExecution: false,
});

const kinds = new Set<AgentEnvelopeKind>(agentEnvelopeKinds);
const statuses = new Set<AgentEnvelopeStatus>(agentEnvelopeStatuses);
const actorRoles = new Set<AgentActorRole>(['user', 'assistant', 'system', 'tool', 'reviewer']);
const risks = new Set<AgentRiskLevel>(['low', 'medium', 'high', 'critical']);
const identifierPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown, max: number, path: string, issues: AgentEnvelopeIssue[]): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    issues.push({ path, code: 'invalid', message: `${path} must be a string.` });
    return undefined;
  }
  if (value.length <= max) return value;
  issues.push({ path, code: 'truncated', message: `${path} exceeded ${max} characters and was truncated.` });
  return value.slice(0, max);
}

function identifier(value: unknown, path: string, issues: AgentEnvelopeIssue[], fallback?: string): string | undefined {
  const normalized = text(value, 200, path, issues);
  if (normalized && identifierPattern.test(normalized)) return normalized;
  if (normalized) issues.push({ path, code: 'invalid', message: `${path} is not a valid identifier.` });
  return fallback;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function date(value: unknown, path: string, issues: AgentEnvelopeIssue[]): string | undefined {
  const normalized = text(value, 100, path, issues);
  if (!normalized) return undefined;
  if (Number.isNaN(Date.parse(normalized))) {
    issues.push({ path, code: 'invalid', message: `${path} must be an ISO-compatible date.` });
    return undefined;
  }
  return normalized;
}

function contentParts(
  value: unknown,
  limits: Required<UIFResourceLimits>,
  issues: AgentEnvelopeIssue[],
): AgentContentPart[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) issues.push({ path: 'content', code: 'invalid', message: 'content must be an array.' });
    return [];
  }
  if (value.length > limits.maxItems) {
    issues.push({ path: 'content', code: 'limit', message: `content exceeds ${limits.maxItems} items.` });
  }
  return value.slice(0, limits.maxItems).flatMap((raw, index): AgentContentPart[] => {
    const source = record(raw);
    const path = `content.${index}`;
    if (source.type === 'text') {
      return [{ type: 'text', text: text(source.text, limits.maxCharacters, `${path}.text`, issues) ?? '' }];
    }
    if (source.type === 'source') {
      const id = identifier(source.id, `${path}.id`, issues);
      const label = text(source.label, 1_000, `${path}.label`, issues);
      if (!id || !label) return [];
      return [{
        type: 'source',
        id,
        label,
        url: text(source.url, 4_000, `${path}.url`, issues),
        retrievedAt: date(source.retrievedAt, `${path}.retrievedAt`, issues),
        unavailable: source.unavailable === true,
      }];
    }
    if (source.type === 'artifact') {
      const id = identifier(source.id, `${path}.id`, issues);
      const label = text(source.label, 1_000, `${path}.label`, issues);
      if (!id || !label) return [];
      return [{
        type: 'artifact',
        id,
        label,
        mediaType: text(source.mediaType, 200, `${path}.mediaType`, issues),
        url: text(source.url, 4_000, `${path}.url`, issues),
        checksum: text(source.checksum, 500, `${path}.checksum`, issues),
      }];
    }
    if (source.type === 'data') {
      if (findUnsafeObjectPaths(source.value, { maxDepth: limits.maxDepth, maxKeys: limits.maxKeys }).length) {
        issues.push({ path: `${path}.value`, code: 'unsafe', message: 'Data part contains unsafe or excessively complex object paths.' });
        return [];
      }
      return [{ type: 'data', label: text(source.label, 1_000, `${path}.label`, issues), value: source.value }];
    }
    issues.push({ path: `${path}.type`, code: 'unsupported', message: `Unsupported content part: ${String(source.type)}` });
    return [];
  });
}

export function validateAgentEnvelope(
  input: unknown,
  limits: UIFResourceLimits = {},
): AgentEnvelopeResult {
  const resolvedLimits = {
    ...defaultUIFResourceLimits,
    ...Object.fromEntries(Object.entries(limits).map(([key, value]) => [key, Math.max(1, Math.floor(value ?? 1))])),
  } as Required<UIFResourceLimits>;
  const issues: AgentEnvelopeIssue[] = [];
  const source = record(input);
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    issues.push({ path: '$', code: 'invalid', message: 'Agent envelope must be an object.' });
  }
  findUnsafeObjectPaths(source, resolvedLimits).forEach((path) => {
    issues.push({ path, code: 'unsafe', message: `Unsafe or excessively complex envelope path: ${path}` });
  });
  if (source.version !== 3) {
    issues.push({ path: 'version', code: 'unsupported', message: `Unsupported agent envelope version: ${String(source.version)}` });
  }
  const kind = kinds.has(source.kind as AgentEnvelopeKind) ? (source.kind as AgentEnvelopeKind) : 'error';
  if (!kinds.has(source.kind as AgentEnvelopeKind)) issues.push({ path: 'kind', code: 'unsupported', message: `Unsupported agent envelope kind: ${String(source.kind)}` });
  const status = statuses.has(source.status as AgentEnvelopeStatus) ? (source.status as AgentEnvelopeStatus) : 'failed';
  if (!statuses.has(source.status as AgentEnvelopeStatus)) issues.push({ path: 'status', code: 'unsupported', message: `Unsupported agent status: ${String(source.status)}` });
  const id = identifier(source.id, 'id', issues, 'invalid-envelope')!;
  const actorSource = record(source.actor);
  const actor = source.actor === undefined ? undefined : {
    role: actorRoles.has(actorSource.role as AgentActorRole) ? (actorSource.role as AgentActorRole) : 'system',
    label: text(actorSource.label, 500, 'actor.label', issues),
  };
  if (source.actor !== undefined && !actorRoles.has(actorSource.role as AgentActorRole)) {
    issues.push({ path: 'actor.role', code: 'unsupported', message: `Unsupported actor role: ${String(actorSource.role)}` });
  }
  const usageSource = record(source.usage);
  const riskSource = record(source.risk);
  const errorSource = record(source.error);
  const envelope: AgentInteractionEnvelope = {
    version: 3,
    kind,
    id,
    threadId: identifier(source.threadId, 'threadId', issues),
    turnId: identifier(source.turnId, 'turnId', issues),
    parentId: identifier(source.parentId, 'parentId', issues),
    requestId: identifier(source.requestId, 'requestId', issues),
    correlationId: identifier(source.correlationId, 'correlationId', issues),
    auditRef: identifier(source.auditRef, 'auditRef', issues),
    sequence: finiteNumber(source.sequence),
    createdAt: date(source.createdAt, 'createdAt', issues),
    expiresAt: date(source.expiresAt, 'expiresAt', issues),
    status,
    actor,
    content: contentParts(source.content, resolvedLimits, issues),
    usage: source.usage === undefined ? undefined : {
      model: text(usageSource.model, 500, 'usage.model', issues),
      route: text(usageSource.route, 500, 'usage.route', issues),
      inputTokens: finiteNumber(usageSource.inputTokens),
      outputTokens: finiteNumber(usageSource.outputTokens),
      cost: finiteNumber(usageSource.cost),
      currency: text(usageSource.currency, 20, 'usage.currency', issues),
      latencyMilliseconds: finiteNumber(usageSource.latencyMilliseconds),
      retention: text(usageSource.retention, 1_000, 'usage.retention', issues),
    },
    risk: source.risk === undefined ? undefined : {
      level: risks.has(riskSource.level as AgentRiskLevel) ? (riskSource.level as AgentRiskLevel) : 'critical',
      reversible: typeof riskSource.reversible === 'boolean' ? riskSource.reversible : undefined,
      summary: text(riskSource.summary, 5_000, 'risk.summary', issues),
      affectedResources: Array.isArray(riskSource.affectedResources) ? riskSource.affectedResources.slice(0, resolvedLimits.maxItems).map((item) => String(item).slice(0, 1_000)) : undefined,
      externalRecipients: Array.isArray(riskSource.externalRecipients) ? riskSource.externalRecipients.slice(0, resolvedLimits.maxItems).map((item) => String(item).slice(0, 1_000)) : undefined,
      dataClassification: text(riskSource.dataClassification, 500, 'risk.dataClassification', issues),
    },
    error: source.error === undefined ? undefined : {
      code: identifier(errorSource.code, 'error.code', issues, 'AGENT_ERROR')!,
      message: text(errorSource.message, 10_000, 'error.message', issues) ?? 'Agent interaction failed.',
      retryable: errorSource.retryable === true,
    },
  };
  if (source.risk !== undefined && !risks.has(riskSource.level as AgentRiskLevel)) {
    issues.push({ path: 'risk.level', code: 'unsupported', message: `Unsupported risk level: ${String(riskSource.level)}` });
  }
  return { envelope, issues, valid: issues.length === 0 };
}

export function parseAgentEnvelope(input: unknown, limits: UIFResourceLimits = {}): AgentInteractionEnvelope {
  const result = validateAgentEnvelope(input, limits);
  if (!result.valid) throw new Error(`Invalid agent envelope: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
  return result.envelope;
}
