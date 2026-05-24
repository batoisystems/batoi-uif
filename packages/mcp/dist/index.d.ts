declare function renderToolApproval(el: HTMLElement): void;
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
declare const toolApproval: {
    name: string;
    init: typeof renderToolApproval;
};

export { renderDiff, renderToolApproval, renderToolAuditTrail, renderToolProgress, renderToolResult, renderToolTimeline, toolApproval };
