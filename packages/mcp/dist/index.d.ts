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
declare function renderToolApproval(el: HTMLElement): void;
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
declare function renderToolReviewFlow(el: HTMLElement, request: ToolReviewRequest, options?: ToolRenderOptions): void;
declare const toolApproval: {
    name: string;
    init: typeof renderToolApproval;
};

export { type ToolPolicyCheck, type ToolRenderOptions, type ToolReviewRequest, renderApprovalPolicy, renderDiff, renderToolApproval, renderToolAuditTrail, renderToolProgress, renderToolResult, renderToolReviewFlow, renderToolTimeline, toolApproval };
