interface ActionContext {
    source: HTMLElement;
    target: HTMLElement | null;
    event?: Event;
    action: string;
    value?: string;
    params?: Record<string, unknown>;
}
type ActionHandler = (context: ActionContext) => void | Promise<void>;
interface ParsedAction {
    event: string;
    action: string;
    target?: string;
    prevent?: boolean;
    stop?: boolean;
    once?: boolean;
    key?: string;
    self?: boolean;
    outside?: boolean;
    debounce?: number;
    throttle?: number;
    value?: string;
    className?: string;
    attribute?: string;
    confirm?: string;
    condition?: string;
    params?: Record<string, unknown>;
    chain?: ParsedAction[];
}
interface ActionDiagnostic {
    level: 'warning' | 'error';
    message: string;
    source: HTMLElement;
    action?: string;
}
declare function getActionDiagnostics(): ActionDiagnostic[];
declare function clearActionDiagnostics(): void;
declare function resolveActionTarget(source: HTMLElement, targetExpr?: string): HTMLElement | null;
declare function registerAction(name: string, handler: ActionHandler): void;
declare function unregisterAction(name: string): void;
declare function dispatchAction(action: string, context: Omit<ActionContext, 'action'>): Promise<void>;
declare function dispatchActions(actions: ParsedAction[], context: Omit<ActionContext, 'action'>): Promise<void>;
declare function parseActionSpec(el: HTMLElement): ParsedAction[];
declare function bindActions(root?: Document | HTMLElement): () => void;

export { type ActionContext, type ActionDiagnostic, type ActionHandler, type ParsedAction, bindActions, clearActionDiagnostics, dispatchAction, dispatchActions, getActionDiagnostics, parseActionSpec, registerAction, resolveActionTarget, unregisterAction };
