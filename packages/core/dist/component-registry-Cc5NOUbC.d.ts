import { UIFResourceLimits, UIFErrorDetail, UIFError } from './contracts.js';

interface UIFResourceScope {
    readonly signal: AbortSignal;
    readonly destroyed: boolean;
    add(dispose: () => void): () => void;
    listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
    timeout(callback: () => void, delay: number): number;
    interval(callback: () => void, delay: number): number;
    observe(observer: {
        disconnect(): void;
    }): void;
    destroy(): void;
}
declare function createResourceScope(): UIFResourceScope;

interface UIFController {
    update?(reason: UIFUpdateReason): void | Promise<void>;
    suspend?(): void;
    resume?(): void;
    destroy(): void;
}
type UIFUpdateReason = 'refresh' | 'attribute' | 'content' | 'rehydrate';
interface UIFMountContext<Options extends Record<string, unknown>> {
    element: HTMLElement;
    root: Document | HTMLElement;
    options: Readonly<Options>;
    signal: AbortSignal;
    resources: UIFResourceScope;
    emit<T = unknown>(name: string, detail?: T): void;
    error(message: string, detail: Omit<UIFErrorDetail, 'package' | 'component'>): UIFError;
}
interface UIFComponentDefinition<Options extends Record<string, unknown> = Record<string, unknown>, Controller extends UIFController = UIFController> {
    name: string;
    version?: number;
    package?: string;
    defaults?: Readonly<Partial<Options>>;
    optionKeys?: readonly (keyof Options & string)[];
    attributes?: readonly string[];
    roles?: readonly string[];
    actions?: readonly string[];
    events?: readonly string[];
    states?: readonly string[];
    errors?: readonly string[];
    semanticFallback?: string;
    accessibility?: readonly string[];
    security?: readonly string[];
    limits?: UIFResourceLimits;
    mount(context: UIFMountContext<Options>): Controller | (() => void) | void;
}
interface UIFComponentRegistry {
    register(definition: UIFComponentDefinition): () => void;
    get(name: string): UIFComponentDefinition | undefined;
    definitions(): UIFComponentDefinition[];
    refresh(root?: Document | HTMLElement, reason?: UIFUpdateReason): void;
    suspend(root?: Document | HTMLElement): void;
    resume(root?: Document | HTMLElement): void;
    destroy(root?: Document | HTMLElement): void;
}
declare function createComponentRegistry(): UIFComponentRegistry;

export { type UIFComponentDefinition as U, type UIFComponentRegistry as a, type UIFController as b, type UIFMountContext as c, type UIFResourceScope as d, type UIFUpdateReason as e, createComponentRegistry as f, createResourceScope as g };
