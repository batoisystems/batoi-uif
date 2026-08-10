import { AgentInteractionEnvelope } from '@batoi/uif-core';

interface ToolPolicyCheck {
    label: string;
    state: 'pass' | 'warn' | 'fail' | 'pending';
    detail?: string;
}
interface ToolReviewRequest {
    tool: string;
    requestId?: string;
    expiresAt?: string;
    auditRef?: string;
    risk?: string;
    irreversible?: boolean;
    payload?: unknown;
    policy?: ToolPolicyCheck[];
    timeline?: Array<{
        label: string;
        state?: string;
    }>;
    audit?: Array<{
        actor?: string;
        action: string;
        at?: string;
    }>;
    diff?: {
        before: string;
        after: string;
    };
    result?: unknown;
}
interface ToolRenderOptions {
    maxCharacters?: number;
    maxItems?: number;
}
interface ToolDecisionController {
    destroy(): void;
}
interface ToolPlanItem {
    id: string;
    tool: string;
    summary: string;
    dependsOn?: string[];
    expectedOutput?: string;
    approval?: 'none' | 'required' | 'separate';
}
interface ToolDiscoveryItem {
    name: string;
    title?: string;
    description?: string;
    risk?: 'low' | 'medium' | 'high' | 'critical';
    available?: boolean;
    approval?: 'none' | 'required' | 'separate';
    scopes?: string[];
}
interface ToolPermissionScope {
    name: string;
    state: 'requested' | 'granted' | 'missing' | 'denied' | 'expiring';
    detail?: string;
    expiresAt?: string;
}
interface ToolExecutionReceipt {
    id: string;
    requestId?: string;
    status: 'completed' | 'partial' | 'failed' | 'cancelled';
    issuedAt?: string;
    auditRef?: string;
    verified?: boolean;
    summary: string;
    artifacts?: Array<{
        label: string;
        reference: string;
        checksum?: string;
    }>;
}
interface GovernedToolTransportOptions {
    src: string;
    allowCrossOrigin?: boolean;
    timeout?: number;
    csrfToken?: string;
    csrfHeader?: string;
    credentials?: RequestCredentials;
    key?: string;
}
interface GovernedToolDecision {
    requestId: string;
    decision: 'approve' | 'reject';
    envelopeId?: string;
    reason?: string;
}
interface GovernedToolTransport {
    submitDecision(decision: GovernedToolDecision): Promise<AgentInteractionEnvelope>;
    poll(requestId: string): Promise<AgentInteractionEnvelope>;
    cancel(): void;
}
declare function createGovernedToolTransport(options: GovernedToolTransportOptions): GovernedToolTransport;
declare function renderToolPlan(el: HTMLElement, items: ToolPlanItem[], options?: ToolRenderOptions): void;
declare function renderToolDiscovery(el: HTMLElement, tools: ToolDiscoveryItem[], options?: ToolRenderOptions): void;
declare function renderToolPermissions(el: HTMLElement, scopes: ToolPermissionScope[], options?: ToolRenderOptions): void;
declare function renderToolReceipt(el: HTMLElement, receipt: ToolExecutionReceipt, options?: ToolRenderOptions): void;
declare function renderAgentToolEnvelope(el: HTMLElement, input: unknown, options?: ToolRenderOptions): AgentInteractionEnvelope | null;
declare function initAgentToolEnvelope(el: HTMLElement): ToolDecisionController | void;
declare function renderToolApproval(el: HTMLElement): ToolDecisionController;
declare function renderApprovalPolicy(el: HTMLElement, checks: ToolPolicyCheck[], options?: ToolRenderOptions): void;
declare function renderToolProgress(el: HTMLElement, message: string): void;
declare function renderToolTimeline(el: HTMLElement, steps: Array<{
    label: string;
    state?: string;
}>, options?: ToolRenderOptions): void;
declare function renderToolAuditTrail(el: HTMLElement, entries: Array<{
    actor?: string;
    action: string;
    at?: string;
}>, options?: ToolRenderOptions): void;
declare function renderDiff(el: HTMLElement, before: string, after: string): void;
declare function renderToolResult(el: HTMLElement, result: unknown, options?: ToolRenderOptions): void;
declare function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest, options?: ToolRenderOptions): ToolDecisionController;
declare const toolApproval: {
    name: string;
    init: typeof renderToolApproval;
};
declare const agentTool: {
    name: string;
    init: typeof initAgentToolEnvelope;
};

export { type GovernedToolDecision, type GovernedToolTransport, type GovernedToolTransportOptions, type ToolDecisionController, type ToolDiscoveryItem, type ToolExecutionReceipt, type ToolPermissionScope, type ToolPlanItem, type ToolPolicyCheck, type ToolRenderOptions, type ToolReviewRequest, agentTool, createGovernedToolTransport, initAgentToolEnvelope, renderAgentToolEnvelope, renderApprovalPolicy, renderDiff, renderToolApproval, renderToolAuditTrail, renderToolDiscovery, renderToolPermissions, renderToolPlan, renderToolProgress, renderToolReceipt, renderToolResult, renderToolReviewFlow, renderToolTimeline, toolApproval };
