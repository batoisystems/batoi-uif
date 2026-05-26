interface ActionContext {
    source: HTMLElement;
    target: HTMLElement | null;
    event?: Event;
    action: string;
    value?: string;
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
}
declare function resolveActionTarget(source: HTMLElement, targetExpr?: string): HTMLElement | null;
declare function registerAction(name: string, handler: ActionHandler): void;
declare function unregisterAction(name: string): void;
declare function dispatchAction(action: string, context: Omit<ActionContext, 'action'>): Promise<void>;
declare function parseActionSpec(el: HTMLElement): ParsedAction[];
declare function bindActions(root?: Document | HTMLElement): () => void;

export { type ActionContext, type ActionHandler, type ParsedAction, bindActions, dispatchAction, parseActionSpec, registerAction, resolveActionTarget, unregisterAction };
