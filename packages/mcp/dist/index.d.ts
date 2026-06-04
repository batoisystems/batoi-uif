interface ToolPolicyCheck {
    label: string;
    state: 'pass' | 'warn' | 'fail' | 'pending';
    detail?: string;
}
interface ToolReviewRequest {
    tool: string;
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
declare function renderToolApproval(el: HTMLElement): void;
declare function renderApprovalPolicy(el: HTMLElement, checks: ToolPolicyCheck[]): void;
declare function renderToolProgress(el: HTMLElement, message: string): void;
declare function renderToolTimeline(el: HTMLElement, steps: Array<{
    label: string;
    state?: string;
}>): void;
declare function renderToolAuditTrail(el: HTMLElement, entries: Array<{
    actor?: string;
    action: string;
    at?: string;
}>): void;
declare function renderDiff(el: HTMLElement, before: string, after: string): void;
declare function renderToolResult(el: HTMLElement, result: unknown): void;
declare function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest): void;
declare const toolApproval: {
    name: string;
    init: typeof renderToolApproval;
};

export { type ToolPolicyCheck, type ToolReviewRequest, renderApprovalPolicy, renderDiff, renderToolApproval, renderToolAuditTrail, renderToolProgress, renderToolResult, renderToolReviewFlow, renderToolTimeline, toolApproval };
