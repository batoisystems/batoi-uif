import { ChartDatum as ChartDatum$1, ChartOptions as ChartOptions$1 } from '@batoi/uif-charts';

declare const uifAttributes: readonly ["data-uif", "data-uif-id", "data-uif-role", "data-uif-action", "data-uif-target", "data-uif-src", "data-uif-method", "data-uif-trigger", "data-uif-state", "data-uif-bind", "data-uif-model", "data-uif-value", "data-uif-route", "data-uif-mode", "data-uif-options", "data-uif-confirm", "data-uif-disabled", "data-uif-loading", "data-uif-success", "data-uif-error", "data-uif-swap", "data-uif-cache", "data-uif-validate", "data-uif-rule", "data-uif-event", "data-uif-on", "data-uif-refresh", "data-uif-persist", "data-uif-density", "data-uif-sidebar-key", "data-uif-density-key", "data-uif-toolbar", "data-uif-preview", "data-uif-animation", "data-uif-duration", "data-uif-delay", "data-uif-placement", "data-uif-container", "data-uif-html", "data-uif-backdrop", "data-uif-scroll", "data-uif-breakpoint", "data-uif-class", "data-uif-attribute", "data-uif-key"];
declare const uifValues: readonly ["button", "modal", "drawer", "offcanvas", "dropdown", "tabs", "toast", "accordion", "tooltip", "popover", "table", "form", "editor", "ajax", "route", "shell", "nav", "chart", "animate", "realtime", "push", "mobile-shell", "ai-action", "tool-approval"];
declare const uifActions: readonly ["open", "close", "toggle", "toggle-sidebar", "toggle-section", "submit", "load", "reload", "delete", "save", "reset", "clear", "select", "activate", "deactivate", "navigate", "swap", "append", "prepend", "remove", "toast", "set-density", "animate", "add-class", "remove-class", "toggle-class", "set-attribute", "remove-attribute", "set-value", "copy", "scroll-to", "focus", "emit", "subscribe", "connect", "disconnect", "approve", "reject"];
declare const uifStates: readonly ["idle", "loading", "loaded", "error", "success", "active", "inactive", "open", "closed", "disabled", "selected", "expanded", "collapsed", "connected", "disconnected", "pending", "approved", "rejected"];
type UIFAttribute = (typeof uifAttributes)[number];
type UIFValue = (typeof uifValues)[number];
type UIFAction = (typeof uifActions)[number];
type UIFState = (typeof uifStates)[number];

type MicroAppStorageMode = 'local-only' | 'local-first' | 'sync-optional' | 'connected' | 'shared';
type MicroAppLocalStore = 'indexeddb' | 'localstorage' | 'memory' | 'none';
type MicroAppRealtimeTransport = 'websocket' | 'sse' | 'polling';
type MicroAppConnectorType = 'api' | 'csv' | 'json' | 'spreadsheet' | 'google-sheet' | 'static';
type MicroAppConnectorMode = 'readonly' | 'readwrite';
interface MicroAppStorageManifest {
    mode?: MicroAppStorageMode;
    localStore?: MicroAppLocalStore;
    sharedStore?: boolean;
    namespace?: string;
    encrypted?: boolean;
}
interface MicroAppRealtimeManifest {
    enabled?: boolean;
    channel?: string;
    transport?: MicroAppRealtimeTransport;
    fallback?: 'polling' | 'none';
}
interface MicroAppConnectorManifest {
    type: MicroAppConnectorType;
    name?: string;
    mode?: MicroAppConnectorMode;
    src?: string;
    refreshInterval?: number;
    schema?: Record<string, unknown>;
}
interface MicroAppPermissionsManifest {
    network?: string[];
    storage?: boolean;
    realtime?: boolean;
    ai?: boolean;
    mcp?: boolean;
}
interface MicroAppManifest {
    name: string;
    type: 'micro-app';
    version?: string;
    description?: string;
    entry?: string;
    storage: Required<Pick<MicroAppStorageManifest, 'mode' | 'localStore' | 'sharedStore'>> & MicroAppStorageManifest;
    realtime: Required<Pick<MicroAppRealtimeManifest, 'enabled'>> & MicroAppRealtimeManifest;
    connectors: MicroAppConnectorManifest[];
    permissions: MicroAppPermissionsManifest;
    build?: {
        upgradeable?: boolean;
        appType?: string;
    };
    ui?: {
        mount?: string;
        title?: string;
        icon?: string;
    };
    [key: string]: unknown;
}
interface MicroAppManifestIssue {
    path: string;
    message: string;
}
interface MicroAppManifestResult {
    manifest: MicroAppManifest;
    issues: MicroAppManifestIssue[];
    valid: boolean;
}
interface MicroAppConnectorWorkflow {
    name: string;
    type: MicroAppConnectorType;
    mode: MicroAppConnectorMode;
    src?: string;
    refreshInterval?: number;
    permission: 'local' | 'allowed' | 'blocked';
    reason?: string;
}
declare function validateMicroAppManifest(input: unknown): MicroAppManifestResult;
declare function parseMicroAppManifest(input: unknown): MicroAppManifest;
declare function listMicroAppConnectorWorkflows(manifest: MicroAppManifest): MicroAppConnectorWorkflow[];
declare function validateMicroAppConnectorWorkflows(manifest: MicroAppManifest): MicroAppManifestIssue[];

type UIFOptions = Record<string, unknown>;

interface UIFApp {
    root: Document | HTMLElement;
    options: UIFOptions;
    destroyed: boolean;
    destroy(): void;
    restart(options?: UIFOptions): UIFApp;
}
interface UIFPlugin {
    name: string;
    setup(app: UIFApp): void;
}
interface UIFComponent {
    name: string;
    init(el: HTMLElement): void;
    destroy?(el: HTMLElement): void;
}
interface UIFLifecycleEvent<T = unknown> extends CustomEvent<T> {
    type: 'uif:before-init' | 'uif:init' | 'uif:before-destroy' | 'uif:destroy' | 'uif:error';
}
declare function parseOptions(el: HTMLElement): UIFOptions;
declare function emit<T = unknown>(name: string, detail?: T, target?: EventTarget): void;
declare function on(name: string, handler: EventListener, target?: EventTarget): () => void;
declare function registerPlugin(plugin: UIFPlugin): void;
declare function setDensity(density: 'compact' | 'default' | 'roomy', target?: HTMLElement): void;
declare function setAccent(color: string, target?: HTMLElement): void;
declare function init(root?: Document | HTMLElement, options?: UIFOptions): UIFApp;

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

interface UIFDomComponent {
    name: string;
    init(el: HTMLElement): void;
    destroy?(el: HTMLElement): void;
}
type Root = Document | HTMLElement | DocumentFragment;
type HTMLSwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';
interface TrustedHTMLRenderOptions {
    trusted?: boolean;
    context?: string;
}
interface SafeHTMLRenderOptions {
    allowedTags?: string[];
    allowedAttributes?: string[];
}
declare function registerComponent(name: string, component: Omit<UIFDomComponent, 'name'>): void;
declare function registerComponent(component: UIFDomComponent): void;
declare function qs<T extends Element = Element>(selector: string, root?: ParentNode): T | null;
declare function qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[];
declare function closest<T extends Element = Element>(el: Element, selector: string): T | null;
declare function resolveTarget(sourceEl: HTMLElement, targetExpression?: string): HTMLElement | null;
declare function setText(target: Element | null, value: unknown): void;
declare function appendTextElement<K extends keyof HTMLElementTagNameMap>(parent: Element, tagName: K, text: unknown, className?: string): HTMLElementTagNameMap[K];
declare function sanitizeHTML(html: string, options?: SafeHTMLRenderOptions): DocumentFragment;
declare function setSafeHTML(target: Element | null, html: string, options?: SafeHTMLRenderOptions): void;
declare function setTrustedHTML(target: Element | null, html: string, options?: TrustedHTMLRenderOptions): void;
declare function swapTrustedHTML(targetEl: HTMLElement, html: string, mode?: HTMLSwapMode): HTMLElement;
declare function mount(root?: Root): void;
declare function unmount(root?: Root): void;
declare function autoInit(root?: Root): void;
declare function observe(root?: HTMLElement): MutationObserver;
declare function isInitialized(el: HTMLElement): boolean;

type QueryInput = string | Element | Iterable<Element> | NodeListOf<Element> | null | undefined;
type QueryHandler = (event: Event, match: Element) => void;
declare class UIFQuery {
    readonly elements: Element[];
    constructor(input: QueryInput, root?: ParentNode);
    get length(): number;
    at(index: number): Element | undefined;
    each(handler: (el: Element, index: number) => void): this;
    map<T>(handler: (el: Element, index: number) => T): T[];
    find(selector: string): UIFQuery;
    closest(selector: string): UIFQuery;
    parent(): UIFQuery;
    children(selector?: string): UIFQuery;
    addClass(...names: string[]): this;
    removeClass(...names: string[]): this;
    toggleClass(name: string, force?: boolean): this;
    attr(name: string): string | null;
    attr(name: string, value: string | null): this;
    data(name: string): string | undefined;
    data(name: string, value: string | null): this;
    css(name: string): string;
    css(name: string, value: string): this;
    on(eventName: string, handler: EventListener): this;
    off(eventName: string, handler: EventListener): this;
    trigger(name: string, detail?: unknown): this;
    html(): string;
    html(value: string): this;
    text(): string;
    text(value: string): this;
    append(content: string | Node): this;
    prepend(content: string | Node): this;
    remove(): this;
    show(): this;
    hide(): this;
    toggle(force?: boolean): this;
}
declare function uif(input: QueryInput, root?: ParentNode): UIFQuery;
declare function ready(handler: () => void): void;
declare function delegate(root: Element | Document, eventName: string, selector: string, handler: QueryHandler): () => void;
declare function trigger(target: EventTarget, name: string, detail?: unknown): void;
declare function serialize(form: HTMLFormElement): Record<string, FormDataEntryValue | FormDataEntryValue[]>;
declare function fragment(html: string): DocumentFragment;

interface EffectOptions {
    className?: string;
    duration?: number;
    delay?: number;
    easing?: string;
    repeat?: number;
    direction?: 'normal' | 'reverse' | 'alternate';
    fill?: FillMode;
    once?: boolean;
}
interface AnimationStep {
    el: HTMLElement;
    animation: string;
    options?: EffectOptions;
}
interface AnimationPreset {
    name: string;
    category: 'entrance' | 'exit' | 'attention' | 'loading' | 'layout';
    duration: number;
    repeat?: boolean;
    description: string;
}
declare const animationPresets: AnimationPreset[];
declare function transition(el: HTMLElement, className: string, options?: EffectOptions): Promise<void>;
declare function show(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function hide(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function toggle(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function expand(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function collapse(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function animate(el: HTMLElement, animation: string, options?: EffectOptions): Promise<void>;
declare function sequence(steps: AnimationStep[], options?: EffectOptions): Promise<void>;
declare function timeline(steps: AnimationStep[], options?: EffectOptions): Promise<void>;
declare function stagger(elements: Iterable<HTMLElement>, animation: string, options?: EffectOptions): Promise<void>;
declare function animateGroup(root: ParentNode, selector: string, animation: string, options?: EffectOptions): Promise<void>;
declare function cancelAnimation(el: HTMLElement): void;
declare function initAnimation(el: HTMLElement): void;
declare function initAnimationTriggers(root?: ParentNode): void;
declare function observeMotion(root?: HTMLElement): void;

type EditorMode = 'html' | 'markdown' | 'plain';
type EditorPreviewMode = 'none' | 'manual' | 'live';
type EditorLayout = 'source' | 'preview' | 'split' | 'tabs' | 'modal' | 'drawer';
type EditorCommand = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'paragraph' | 'quote' | 'code' | 'hr' | 'ul' | 'ol' | 'task' | 'link' | 'link-edit' | 'link-remove' | 'image' | 'image-edit' | 'image-remove' | 'table' | 'table-row-before' | 'table-row-after' | 'table-row-delete' | 'table-col-before' | 'table-col-after' | 'table-col-delete' | 'table-delete' | 'table-header-toggle' | 'undo' | 'redo' | 'preview' | 'source' | 'fullscreen' | 'clear';
interface EditorOptions {
    mode?: EditorMode;
    toolbar?: string[];
    preview?: EditorPreviewMode;
    height?: string;
    layout?: EditorLayout;
    status?: boolean;
    placeholder?: string;
    autosave?: boolean;
    autosaveDelay?: number;
    autosaveUrl?: string;
    required?: boolean;
    maxLength?: number;
}
interface EditorInstance {
    element: HTMLElement;
    mode: EditorMode;
    input: HTMLTextAreaElement | HTMLInputElement;
    surface: HTMLElement;
    preview?: HTMLElement;
    status?: HTMLElement;
    dirty: boolean;
    sourceMode: boolean;
    getValue(): string;
    setValue(value: string): void;
    focus(): void;
    destroy(): void;
}
interface EditorCommandContext {
    editor: EditorInstance;
    command: EditorCommand;
    value?: unknown;
}
type EditorCommandHandler = (context: EditorCommandContext) => void;
type EditorHookName = 'beforeInput' | 'afterInput' | 'beforeCommand' | 'afterCommand' | 'beforePaste' | 'afterPaste' | 'beforePreview' | 'afterPreview' | 'validate' | 'autosave' | 'uploadImage';
interface EditorHookContext {
    editor: EditorInstance;
    value: string;
    command?: EditorCommand;
    file?: File;
}
type EditorHookHandler = (context: EditorHookContext) => void | string | Promise<void | string>;
interface EditorLinkValue {
    text?: string;
    href?: string;
    title?: string;
    target?: '_self' | '_blank';
}
interface EditorImageValue {
    src?: string;
    alt?: string;
    caption?: string;
}
interface EditorTableValue {
    rows?: number;
    columns?: number;
    header?: boolean;
}
declare function registerEditorCommand(name: EditorCommand | string, handler: EditorCommandHandler): void;
declare function unregisterEditorCommand(name: EditorCommand | string): void;
declare function registerEditorHook(name: EditorHookName, handler: EditorHookHandler): () => void;
declare function escapeHtml(value: unknown): string;
declare function markdownToHtml(markdown: string): string;
declare function htmlToMarkdown(html: string): string;
declare function cleanEditorHtml(html: string): string;
declare function validateEditor(editor: EditorInstance): string[];
declare function queryEditorCommand(editor: EditorInstance, command: EditorCommand | string): boolean;
declare function runEditorCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): void;
declare function formatEditor(editor: EditorInstance, command: EditorCommand, value?: unknown): void;
declare function setEditorPreviewLayout(editor: EditorInstance, layout: EditorLayout): void;
declare function createEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function initEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function getEditorValue(editor: EditorInstance): string;
declare function setEditorValue(editor: EditorInstance, value: string): void;

interface ExtensionSurface {
    popup?: string;
    options?: string;
    sidePanel?: string;
    contentScript?: string;
    serviceWorker?: string;
}
interface ExtensionManifestOptions {
    name: string;
    version?: string;
    description?: string;
    permissions?: string[];
    hostPermissions?: string[];
    icons?: Record<string, string>;
    surfaces?: ExtensionSurface;
}
interface ExtensionMessage<T = unknown> {
    type: string;
    payload?: T;
    requestId?: string;
}
declare function createExtensionManifest(options: ExtensionManifestOptions): Record<string, unknown>;
declare function isExtensionRuntime(runtime?: unknown): boolean;
declare function createExtensionMessage<T = unknown>(type: string, payload?: T, requestId?: `${string}-${string}-${string}-${string}-${string}`): ExtensionMessage<T>;
declare global {
    interface Window {
        chrome?: {
            runtime?: unknown;
        };
    }
    var chrome: {
        runtime?: unknown;
    } | undefined;
}

interface OverlayOptions {
    opener?: HTMLElement | null;
    modal?: boolean;
    inert?: boolean;
    restoreFocus?: boolean;
    closeOnEscape?: boolean;
    placement?: 'auto' | 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    offset?: number;
}
declare function getOverlayStack(): HTMLElement[];
declare function openOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function closeOverlay(el?: HTMLElement | undefined): Promise<void>;
declare function toggleOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function positionOverlay(anchor: HTMLElement, panel: HTMLElement, options?: OverlayOptions): void;

interface RequestOptions extends RequestInit {
    timeout?: number;
    parseAs?: 'auto' | 'json' | 'text' | 'response';
    key?: string;
    dedupe?: boolean;
    retries?: number;
    retryDelay?: number;
    csrfToken?: string;
    csrfHeader?: string;
    onUploadProgress?: (loaded: number, total: number) => void;
}
interface UIFRequestError extends Error {
    status?: number;
    response?: Response;
    data?: unknown;
}
type ConnectorType = 'api' | 'json' | 'csv' | 'static' | 'spreadsheet' | 'google-sheet';
type ConnectorMode = 'readonly' | 'readwrite';
interface DataConnector<T = unknown> {
    type: ConnectorType;
    name?: string;
    mode?: ConnectorMode;
    src?: string;
    method?: string;
    headers?: HeadersInit;
    data?: T;
    timeout?: number;
    refreshInterval?: number;
    transform?: (value: unknown) => T | Promise<T>;
}
type RequestInterceptor = (url: string, options: RequestOptions) => void | RequestOptions | Promise<void | RequestOptions>;
type ResponseInterceptor = (response: Response) => void | Response | Promise<void | Response>;
declare function useRequestInterceptor(fn: RequestInterceptor): () => void;
declare function useResponseInterceptor(fn: ResponseInterceptor): () => void;
declare function cancelRequest(key: string): void;
declare function request<T = unknown>(url: string, options?: RequestOptions): Promise<T>;
declare function get<T = unknown>(url: string, options?: RequestOptions): Promise<T>;
declare function post<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<T>;
declare function submitForm<T = unknown>(formEl: HTMLFormElement, options?: RequestOptions): Promise<T>;
declare function upload<T = unknown>(url: string, formData: FormData, options?: RequestOptions): Promise<T>;
declare function parseCSV(text: string): string[][];
declare function csvToObjects(text: string): Array<Record<string, string>>;
declare function loadConnector<T = unknown>(connector: DataConnector<T>, options?: RequestOptions): Promise<T>;
declare function bindConnector<T = unknown>(connector: DataConnector<T>, handler: (value: T) => void | Promise<void>, options?: RequestOptions): () => void;

type FormErrors = Record<string, string[]>;
type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type AsyncRuleHandler = (field: FormField, form: HTMLFormElement, signal: AbortSignal) => Promise<string[]>;
type FieldAdapter = (field: FormField) => string;
type ValidationMessageHandler = (field: FormField, rule: string, arg: string | undefined) => string;
declare function registerAsyncRule(name: string, handler: AsyncRuleHandler): void;
declare function registerFieldAdapter(name: string, adapter: FieldAdapter): void;
declare function registerValidationMessage(name: string, handler: ValidationMessageHandler): void;
declare function validateField(fieldEl: FormField): string[];
declare function validateForm(formEl: HTMLFormElement): FormErrors;
declare function clearErrors(formEl: HTMLFormElement): void;
declare function showErrors(formEl: HTMLFormElement, errors: FormErrors): void;
declare function showErrorSummary(formEl: HTMLFormElement, errors: FormErrors): HTMLElement | null;
declare function validateFormAsync(formEl: HTMLFormElement): Promise<FormErrors>;
declare function initRepeatableGroup(root: HTMLElement): void;
declare function initForm(formEl: HTMLFormElement): void;
declare const form: {
    name: string;
    init: typeof initForm;
};

declare const icons: {
    readonly box: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path>";
    };
    readonly compass: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path>";
    };
    readonly globe: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path>";
    };
    readonly heart: {
        readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path>";
    };
    readonly location: {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>";
    };
    readonly map: {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path>";
    };
    readonly anchor: {
        readonly body: "<circle cx=\"12\" cy=\"5\" r=\"3\"></circle><path d=\"M12 8v13\"></path><path d=\"M5 12H2a10 10 0 0 0 20 0h-3\"></path>";
    };
    readonly flask: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M7 16h10\"></path>";
    };
    readonly 'heart-pulse': {
        readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path><path d=\"M3 13h4l2-4 3 8 2-4h7\"></path>";
    };
    readonly magnet: {
        readonly body: "<path d=\"M6 3v8a6 6 0 0 0 12 0V3\"></path><path d=\"M6 8h4\"></path><path d=\"M14 8h4\"></path><path d=\"M6 3h4\"></path><path d=\"M14 3h4\"></path>";
    };
    readonly presentation: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M12 16v5\"></path><path d=\"m8 21 4-5 4 5\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
    };
    readonly school: {
        readonly body: "<path d=\"m3 10 9-6 9 6-9 6-9-6z\"></path><path d=\"M7 12v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 10v6\"></path>";
    };
    readonly sitemap: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly suitcase: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path>";
    };
    readonly train: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M9 19 7 22\"></path><path d=\"m15 19 2 3\"></path><path d=\"M8 8h8\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path>";
    };
    readonly wand: {
        readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"m5 3 .7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3z\"></path>";
    };
    readonly ambulance: {
        readonly body: "<path d=\"M3 17h2\"></path><path d=\"M19 17h2\"></path><path d=\"M5 17V7h9l4 4h3v6\"></path><path d=\"M8 11h4\"></path><path d=\"M10 9v4\"></path><circle cx=\"7\" cy=\"17\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
    };
    readonly bed: {
        readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M12 12h6a3 3 0 0 1 3 3v-1\"></path>";
    };
    readonly bus: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M7 8h10\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M8 19 6 22\"></path><path d=\"m16 19 2 3\"></path>";
    };
    readonly car: {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><path d=\"M7 17v2\"></path><path d=\"M17 17v2\"></path><path d=\"M7 12h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly clinic: {
        readonly body: "<path d=\"M4 21V8l8-5 8 5v13\"></path><path d=\"M9 21v-6h6v6\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path>";
    };
    readonly dna: {
        readonly body: "<path d=\"M7 3c7 4 7 14 0 18\"></path><path d=\"M17 3c-7 4-7 14 0 18\"></path><path d=\"M8 7h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly factory: {
        readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path>";
    };
    readonly 'flag-triangle': {
        readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h14l-4 5 4 5H5\"></path>";
    };
    readonly 'globe-lock': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'graduation-cap': {
        readonly body: "<path d=\"m3 9 9-5 9 5-9 5-9-5z\"></path><path d=\"M7 11v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 9v6\"></path>";
    };
    readonly leaf: {
        readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path>";
    };
    readonly library: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'map-pin-check': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 10 2 2 4-4\"></path>";
    };
    readonly 'map-pin-plus': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
    };
    readonly 'map-pin-x': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 7 6 6\"></path><path d=\"m15 7-6 6\"></path>";
    };
    readonly microscope: {
        readonly body: "<path d=\"M6 18h12\"></path><path d=\"M8 22h8\"></path><path d=\"M12 18v4\"></path><path d=\"M9 3h6v5H9z\"></path><path d=\"M12 8v4a4 4 0 0 1-4 4\"></path><path d=\"M15 8l3 3\"></path>";
    };
    readonly plane: {
        readonly body: "<path d=\"M22 2 11 13\"></path><path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path>";
    };
    readonly pill: {
        readonly body: "<path d=\"M10 21 3 14a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z\"></path><path d=\"m8.5 8.5 7 7\"></path>";
    };
    readonly recycle: {
        readonly body: "<path d=\"m7 19-3-5 3-5\"></path><path d=\"M4 14h7\"></path><path d=\"m17 5 3 5-3 5\"></path><path d=\"M20 10h-7\"></path><path d=\"m9 5 3-3 3 3\"></path><path d=\"M12 2v7\"></path>";
    };
    readonly route: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path>";
    };
    readonly stethoscope: {
        readonly body: "<path d=\"M6 4v5a4 4 0 0 0 8 0V4\"></path><path d=\"M4 4h4\"></path><path d=\"M12 4h4\"></path><path d=\"M10 13v2a5 5 0 0 0 10 0v-1\"></path><circle cx=\"20\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly syringe: {
        readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M3 21l6-6\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"m12 12 4 4\"></path>";
    };
    readonly 'traffic-light': {
        readonly body: "<rect x=\"8\" y=\"2\" width=\"8\" height=\"20\" rx=\"4\"></rect><circle cx=\"12\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"17\" r=\"1.5\"></circle>";
    };
    readonly wheelchair: {
        readonly body: "<circle cx=\"10\" cy=\"5\" r=\"2\"></circle><path d=\"M10 7v6h5l3 6\"></path><path d=\"M8 11a6 6 0 1 0 5.6 8\"></path><path d=\"M10 13h4\"></path>";
    };
    readonly 'wind-turbine': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"2\"></circle><path d=\"M12 10v11\"></path><path d=\"M12 8 5 5\"></path><path d=\"M12 8l7-3\"></path><path d=\"M12 8l2 8\"></path>";
    };
    readonly 'blood-drop': {
        readonly body: "<path d=\"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z\"></path>";
    };
    readonly campus: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
    };
    readonly 'cargo-ship': {
        readonly body: "<path d=\"M4 17h16l-3 4H7l-3-4z\"></path><path d=\"M7 17V9h9l3 8\"></path><path d=\"M9 9V5h5v4\"></path><path d=\"M3 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0\"></path>";
    };
    readonly classroom: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"11\" rx=\"2\"></rect><path d=\"M8 21l4-6 4 6\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
    };
    readonly container: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"2\"></rect><path d=\"M7 7v10\"></path><path d=\"M11 7v10\"></path><path d=\"M15 7v10\"></path><path d=\"M19 7v10\"></path>";
    };
    readonly 'currency-dollar': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 6v12\"></path><path d=\"M16 8.5c-1-.8-2.3-1.2-4-1.2-2 0-3 .8-3 2s1 1.8 3 2.2 4 1 4 3-1.4 3.2-4 3.2c-1.8 0-3.2-.5-4.2-1.4\"></path>";
    };
    readonly 'currency-rupee': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9 7h7\"></path><path d=\"M9 10h7\"></path><path d=\"M14 7a3 3 0 0 1-3 5H9l6 5\"></path>";
    };
    readonly exam: {
        readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"m14 17 1.5 1.5L19 15\"></path>";
    };
    readonly 'first-aid': {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly forklift: {
        readonly body: "<path d=\"M5 16V7h7l3 5v4\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"15\" cy=\"18\" r=\"2\"></circle><path d=\"M15 12h5v8\"></path><path d=\"M20 16h2\"></path><path d=\"M8 10h4\"></path>";
    };
    readonly insurance: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path>";
    };
    readonly investment: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17v-5\"></path><path d=\"M12 17V7\"></path><path d=\"M18 17v-8\"></path><path d=\"m6 10 6-5 6 4\"></path><path d=\"M16 5h4v4\"></path>";
    };
    readonly 'lab-report': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 17h8\"></path><path d=\"M10 9h4\"></path><path d=\"M11 9v5l-2 3\"></path><path d=\"M13 9v5l2 3\"></path>";
    };
    readonly ledger: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path>";
    };
    readonly loan: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"M15 14l2 2 4-4\"></path>";
    };
    readonly 'medical-chart': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h3l2-5 2 7 2-4h3\"></path>";
    };
    readonly 'parcel-location': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 4-2.2\"></path><path d=\"M12 13v8\"></path><path d=\"M20 16c0 3-4 6-4 6s-4-3-4-6a4 4 0 1 1 8 0z\"></path><circle cx=\"16\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly patient: {
        readonly body: "<circle cx=\"12\" cy=\"7\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
    };
    readonly tax: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly vaccine: {
        readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M4 20l5-5\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"M7 18 4 21\"></path><path d=\"M12 12h4\"></path>";
    };
    readonly 'building-hospital': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path>";
    };
    readonly 'delivery-bike': {
        readonly body: "<circle cx=\"6\" cy=\"17\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M9 17h4l2-6h-4\"></path><path d=\"M13 11l3 6\"></path><path d=\"M8 11h3\"></path><path d=\"M5 8h4\"></path>";
    };
    readonly drone: {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"2\"></rect><circle cx=\"4\" cy=\"4\" r=\"2\"></circle><circle cx=\"20\" cy=\"4\" r=\"2\"></circle><circle cx=\"4\" cy=\"20\" r=\"2\"></circle><circle cx=\"20\" cy=\"20\" r=\"2\"></circle><path d=\"M9 9 5.5 5.5\"></path><path d=\"m15 9 3.5-3.5\"></path><path d=\"M9 15 5.5 18.5\"></path><path d=\"m15 15 3.5 3.5\"></path>";
    };
    readonly 'fleet-vehicle': {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M7 12h10\"></path><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path>";
    };
    readonly 'geo-fence': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'map-route': {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><path d=\"M6 9c3 4 9 1 12 5\"></path>";
    };
    readonly 'route-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 4 4\"></path><path d=\"M12 20h3\"></path>";
    };
    readonly 'route-plus': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M18 4v6\"></path><path d=\"M15 7h6\"></path>";
    };
    readonly satellite: {
        readonly body: "<path d=\"M5 12 2 9l7-7 3 3-7 7z\"></path><path d=\"m12 5 7 7\"></path><path d=\"M14 14a4 4 0 0 1-4-4\"></path><path d=\"M18 18a8 8 0 0 1-8-8\"></path><path d=\"M21 21a11 11 0 0 1-11-11\"></path>";
    };
    readonly 'traffic-cone': {
        readonly body: "<path d=\"m12 3 7 18H5l7-18z\"></path><path d=\"M9 11h6\"></path><path d=\"M7 17h10\"></path>";
    };
    readonly agriculture: {
        readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path><path d=\"M4 13c4 0 7 3 8 7\"></path>";
    };
    readonly 'case-management': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path>";
    };
    readonly crm: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M14 7h7\"></path><path d=\"M14 11h5\"></path><path d=\"M14 15h7\"></path><path d=\"M14 19h4\"></path>";
    };
    readonly energy: {
        readonly body: "<path d=\"M13 2 6 13h5l-2 9 8-12h-5l1-8z\"></path><path d=\"M4 21h16\"></path>";
    };
    readonly hospitality: {
        readonly body: "<path d=\"M4 21V8a4 4 0 0 1 8 0v13\"></path><path d=\"M12 11h8v10\"></path><path d=\"M16 15h.01\"></path><path d=\"M16 18h.01\"></path><path d=\"M8 15h.01\"></path>";
    };
    readonly hr: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><path d=\"M17 7h4\"></path><path d=\"M19 5v4\"></path><path d=\"M16 14h6\"></path><path d=\"M16 18h4\"></path>";
    };
    readonly legal: {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly manufacturing: {
        readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path><path d=\"M18 9h3\"></path>";
    };
    readonly 'public-sector': {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
    };
    readonly 'quality-control': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"m8 14 2 2 5-5\"></path><circle cx=\"18\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'real-estate': {
        readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M16 5h3v4\"></path>";
    };
    readonly recruiting: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><circle cx=\"18\" cy=\"10\" r=\"3\"></circle><path d=\"M18 13v6\"></path><path d=\"M15 16h6\"></path>";
    };
    readonly 'service-desk': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path>";
    };
    readonly 'support-case': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly 'ticket-queue': {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path><path d=\"M6 21h12\"></path>";
    };
    readonly tourism: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 9 8h6l3 13\"></path><path d=\"M12 8V3\"></path><path d=\"M9 3h6\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'asset-maintenance': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M16 15a3 3 0 1 1-4.5 2.6\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'care-team': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 13v5\"></path><path d=\"M9.5 15.5h5\"></path>";
    };
    readonly dispatch: {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path><path d=\"m12 3 3 3-3 3\"></path>";
    };
    readonly facilities: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M6 3V1\"></path>";
    };
    readonly 'field-service': {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M12 4v5\"></path><path d=\"M9.5 6.5h5\"></path>";
    };
    readonly 'fleet-route': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M5 14h4l1 2\"></path><path d=\"M3 16h8\"></path>";
    };
    readonly 'patient-portal': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"10\" cy=\"11\" r=\"2\"></circle><path d=\"M7 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
    };
    readonly 'repair-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M17 14v6\"></path><path d=\"M14 17h6\"></path>";
    };
    readonly 'site-visit': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M8 21h8\"></path><path d=\"M12 18v3\"></path>";
    };
    readonly triage: {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 13v6\"></path><path d=\"M13 16h6\"></path>";
    };
    readonly claims: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly construction: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21V9l6-5 6 5v12\"></path><path d=\"M9 21v-7h6v7\"></path><path d=\"M4 9h16\"></path>";
    };
    readonly 'hotel-room': {
        readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M15 8h4v4\"></path>";
    };
    readonly 'insurance-policy': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path>";
    };
    readonly lab: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><circle cx=\"11\" cy=\"13\" r=\"1\"></circle>";
    };
    readonly 'meter-reading': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly mining: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 12 4l6 17\"></path><path d=\"M8 15h8\"></path><path d=\"M10 10h4\"></path><path d=\"M5 6h14\"></path>";
    };
    readonly pharmacy: {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path><path d=\"M7 20h10\"></path>";
    };
    readonly radiology: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M12 7v10\"></path><path d=\"M7 12h10\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly restaurant: {
        readonly body: "<path d=\"M7 3v8\"></path><path d=\"M5 3v4a2 2 0 0 0 4 0V3\"></path><path d=\"M7 11v10\"></path><path d=\"M16 3v18\"></path><path d=\"M13 3h3a4 4 0 0 1 0 8h-3\"></path>";
    };
    readonly telemedicine: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
    };
    readonly 'utility-pole': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M5 11h14\"></path>";
    };
    readonly airport: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M12 3v12\"></path><path d=\"m4 10 8 3 8-3\"></path><path d=\"m8 18 4-3 4 3\"></path>";
    };
    readonly 'branch-office': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M4 14h16\"></path>";
    };
    readonly 'call-center': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"2\"></circle>";
    };
    readonly 'data-center': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h8\"></path><path d=\"M8 19h8\"></path><path d=\"M6 7h.01\"></path><path d=\"M6 11h.01\"></path><path d=\"M6 15h.01\"></path>";
    };
    readonly 'emergency-room': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path><path d=\"M18 5l3-3\"></path>";
    };
    readonly 'government-office': {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path><path d=\"M10 14h4\"></path>";
    };
    readonly 'insurance-claim': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h5\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'inventory-site': {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M12 3v5\"></path>";
    };
    readonly 'logistics-hub': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h6\"></path><path d=\"m8 8 3 7\"></path><path d=\"m16 8-3 7\"></path><path d=\"M12 3v3\"></path>";
    };
    readonly 'power-grid': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M4 15h16\"></path><circle cx=\"12\" cy=\"7\" r=\"2\"></circle><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle>";
    };
    readonly activity: {
        readonly body: "<path d=\"M22 12h-4l-3 8L9 4l-3 8H2\"></path>";
    };
    readonly calendar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path>";
    };
    readonly clock: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path>";
    };
    readonly command: {
        readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
    };
    readonly download: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"M7 10l5 5 5-5\"></path><path d=\"M12 15V3\"></path>";
    };
    readonly filter: {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path>";
    };
    readonly flag: {
        readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h12l-2 4 2 4H5\"></path>";
    };
    readonly inbox: {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path>";
    };
    readonly layers: {
        readonly body: "<path d=\"m12 2 9 5-9 5-9-5 9-5z\"></path><path d=\"m3 12 9 5 9-5\"></path><path d=\"m3 17 9 5 9-5\"></path>";
    };
    readonly link: {
        readonly body: "<path d=\"M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2\"></path><path d=\"M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2\"></path>";
    };
    readonly list: {
        readonly body: "<path d=\"M8 6h13\"></path><path d=\"M8 12h13\"></path><path d=\"M8 18h13\"></path><path d=\"M3 6h.01\"></path><path d=\"M3 12h.01\"></path><path d=\"M3 18h.01\"></path>";
    };
    readonly package: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M7.5 5.5 16.5 10.5\"></path>";
    };
    readonly 'qr-code': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"15\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\"></rect><path d=\"M15 15h2v2h-2z\"></path><path d=\"M19 15h2v6h-6v-2\"></path><path d=\"M12 3v3\"></path><path d=\"M12 12h3\"></path>";
    };
    readonly refresh: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
    };
    readonly rocket: {
        readonly body: "<path d=\"M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5\"></path><path d=\"M9 15 4 20\"></path><path d=\"M15 9l-6 6\"></path><path d=\"M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z\"></path>";
    };
    readonly sliders: {
        readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
    };
    readonly sync: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
    };
    readonly table: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
    };
    readonly tag: {
        readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path>";
    };
    readonly target: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle>";
    };
    readonly tool: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
    };
    readonly trash: {
        readonly body: "<path d=\"M3 6h18\"></path><path d=\"M8 6V4h8v2\"></path><path d=\"M19 6l-1 15H6L5 6\"></path><path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path>";
    };
    readonly branch: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M8.5 8.5 12 15\"></path><path d=\"m15.5 8.5-3.5 6.5\"></path>";
    };
    readonly bug: {
        readonly body: "<rect x=\"7\" y=\"8\" width=\"10\" height=\"12\" rx=\"5\"></rect><path d=\"M9 8 7 5\"></path><path d=\"m15 8 2-3\"></path><path d=\"M3 13h4\"></path><path d=\"M17 13h4\"></path><path d=\"M4 19l3-2\"></path><path d=\"m17 17 3 2\"></path><path d=\"M12 8v12\"></path>";
    };
    readonly 'calendar-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m8 16 2 2 5-5\"></path>";
    };
    readonly 'calendar-clock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
    };
    readonly 'calendar-days': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h.01\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly 'calendar-plus': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v6\"></path><path d=\"M9 17h6\"></path>";
    };
    readonly 'calendar-x': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m9 14 6 6\"></path><path d=\"m15 14-6 6\"></path>";
    };
    readonly grab: {
        readonly body: "<path d=\"M8 5h.01\"></path><path d=\"M12 5h.01\"></path><path d=\"M16 5h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 19h.01\"></path><path d=\"M12 19h.01\"></path><path d=\"M16 19h.01\"></path>";
    };
    readonly history: {
        readonly body: "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"></path><path d=\"M3 3v5h5\"></path><path d=\"M12 7v5l3 2\"></path>";
    };
    readonly kanban: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M6 8h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M18 9h.01\"></path>";
    };
    readonly 'list-check': {
        readonly body: "<path d=\"M10 6h11\"></path><path d=\"M10 12h11\"></path><path d=\"M10 18h11\"></path><path d=\"m3 6 1.5 1.5L8 4\"></path><path d=\"m3 12 1.5 1.5L8 10\"></path><path d=\"m3 18 1.5 1.5L8 16\"></path>";
    };
    readonly 'list-filter': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M7 12h10\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly 'loader-circle': {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path>";
    };
    readonly 'log-in': {
        readonly body: "<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"></path><path d=\"m10 17 5-5-5-5\"></path><path d=\"M15 12H3\"></path>";
    };
    readonly 'log-out': {
        readonly body: "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><path d=\"m16 17 5-5-5-5\"></path><path d=\"M21 12H9\"></path>";
    };
    readonly project: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"14\" y=\"13\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M10 7h2a3 3 0 0 1 3 3v3\"></path><path d=\"M6.5 11v4A2.5 2.5 0 0 0 9 17.5h5\"></path>";
    };
    readonly puzzle: {
        readonly body: "<path d=\"M8 3h4a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2 2v4h-3a2 2 0 1 0 0 4h3v4a2 2 0 0 1-2 2h-4v-3a2 2 0 1 0-4 0v3H6a2 2 0 0 1-2-2v-4h3a2 2 0 1 0 0-4H4V7a4 4 0 0 1 4-4z\"></path>";
    };
    readonly repeat: {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path>";
    };
    readonly 'reply-all': {
        readonly body: "<path d=\"m7 17-5-5 5-5\"></path><path d=\"m12 17-5-5 5-5\"></path><path d=\"M22 18v-2a4 4 0 0 0-4-4H7\"></path>";
    };
    readonly reply: {
        readonly body: "<path d=\"m9 17-5-5 5-5\"></path><path d=\"M20 18v-2a4 4 0 0 0-4-4H4\"></path>";
    };
    readonly 'sliders-horizontal': {
        readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
    };
    readonly 'sliders-vertical': {
        readonly body: "<path d=\"M6 4v8\"></path><path d=\"M6 16v4\"></path><path d=\"M4 14h4\"></path><path d=\"M12 4v4\"></path><path d=\"M12 12v8\"></path><path d=\"M10 10h4\"></path><path d=\"M18 4v10\"></path><path d=\"M18 18v2\"></path><path d=\"M16 16h4\"></path>";
    };
    readonly 'sort-asc': {
        readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 18 3-3 3 3\"></path><path d=\"M20 6v9\"></path>";
    };
    readonly 'sort-desc': {
        readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 12 3 3 3-3\"></path><path d=\"M20 6v9\"></path>";
    };
    readonly stamp: {
        readonly body: "<path d=\"M8 21h8\"></path><path d=\"M6 17h12\"></path><path d=\"M9 13h6l1-8a4 4 0 0 0-8 0l1 8z\"></path><path d=\"M5 17v4h14v-4\"></path>";
    };
    readonly step: {
        readonly body: "<path d=\"M6 4h4v16H6z\"></path><path d=\"M14 4h4v16h-4z\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly timer: {
        readonly body: "<circle cx=\"12\" cy=\"13\" r=\"8\"></circle><path d=\"M12 13l3-3\"></path><path d=\"M9 2h6\"></path><path d=\"M12 2v3\"></path>";
    };
    readonly wrench: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
    };
    readonly upload: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M12 3v12\"></path>";
    };
    readonly automation: {
        readonly body: "<path d=\"M4 7h5\"></path><path d=\"M15 7h5\"></path><circle cx=\"12\" cy=\"7\" r=\"3\"></circle><path d=\"M4 17h5\"></path><path d=\"M15 17h5\"></path><circle cx=\"12\" cy=\"17\" r=\"3\"></circle><path d=\"M12 10v4\"></path>";
    };
    readonly backlog: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"12\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"19\" width=\"12\" height=\"2\" rx=\"1\"></rect>";
    };
    readonly dependency: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 8h3a4 4 0 0 1 4 4v1\"></path><path d=\"m13 10 3 3 3-3\"></path>";
    };
    readonly 'git-branch': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6h3a6 6 0 0 1 6 6v3\"></path>";
    };
    readonly 'git-commit': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 12h6\"></path><path d=\"M16 12h6\"></path>";
    };
    readonly 'git-merge': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6c6 0 9 3 9 9\"></path>";
    };
    readonly 'git-pull-request': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 15V8a2 2 0 0 0-2-2h-3\"></path><path d=\"m14 3-3 3 3 3\"></path>";
    };
    readonly milestone: {
        readonly body: "<path d=\"M4 5h10l6 7-6 7H4z\"></path><path d=\"M9 9h5\"></path><path d=\"M9 13h7\"></path>";
    };
    readonly 'route-turn': {
        readonly body: "<path d=\"M4 6h8a4 4 0 0 1 4 4v11\"></path><path d=\"m12 17 4 4 4-4\"></path><circle cx=\"4\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'status-dot': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'task-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 2 2 5-5\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'task-clock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'task-x': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path>";
    };
    readonly timeline: {
        readonly body: "<path d=\"M5 4v16\"></path><circle cx=\"5\" cy=\"7\" r=\"2\"></circle><circle cx=\"5\" cy=\"17\" r=\"2\"></circle><path d=\"M9 7h12\"></path><path d=\"M9 17h12\"></path>";
    };
    readonly webhook: {
        readonly body: "<path d=\"M18 16.5A4 4 0 1 1 14 12\"></path><path d=\"M6 16.5A4 4 0 1 0 10 12\"></path><path d=\"M12 5a4 4 0 0 1 2 7.5\"></path><path d=\"M12 5a4 4 0 0 0-2 7.5\"></path>";
    };
    readonly 'column-add': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M12 9v6\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly 'column-delete': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m10 10 4 4\"></path><path d=\"m14 10-4 4\"></path>";
    };
    readonly 'data-join': {
        readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M9.5 9.5 14.5 14.5\"></path><path d=\"M14 8h4\"></path><path d=\"M16 6v4\"></path>";
    };
    readonly 'data-split': {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 12h3a3 3 0 0 0 3-3\"></path><path d=\"M9 12h3a3 3 0 0 1 3 3\"></path>";
    };
    readonly 'data-transform': {
        readonly body: "<path d=\"M4 7h8\"></path><path d=\"m9 4 3 3-3 3\"></path><path d=\"M20 17h-8\"></path><path d=\"m15 14-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
    };
    readonly 'filter-check': {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 2 2 5-5\"></path>";
    };
    readonly 'filter-x': {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 5 5\"></path><path d=\"m13 18-5 5\"></path>";
    };
    readonly 'row-add': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
    };
    readonly 'row-delete': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"m10 8 4 4\"></path><path d=\"m14 8-4 4\"></path>";
    };
    readonly 'table-export': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 14v6\"></path><path d=\"m16 17 3 3 3-3\"></path>";
    };
    readonly 'table-import': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 20v-6\"></path><path d=\"m16 17 3-3 3 3\"></path>";
    };
    readonly 'table-search': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v7\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
    };
    readonly 'table-settings': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><circle cx=\"16\" cy=\"16\" r=\"2\"></circle><path d=\"M16 12v1\"></path><path d=\"M16 19v1\"></path><path d=\"M12 16h1\"></path><path d=\"M19 16h1\"></path>";
    };
    readonly 'workflow-branch': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M12 10v6\"></path>";
    };
    readonly 'approval-pending': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path>";
    };
    readonly 'approval-rejected': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
    };
    readonly 'approval-request': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly escalation: {
        readonly body: "<path d=\"M4 18h16\"></path><path d=\"M7 18v-5\"></path><path d=\"M12 18V9\"></path><path d=\"M17 18V5\"></path><path d=\"m14 8 3-3 3 3\"></path>";
    };
    readonly handoff: {
        readonly body: "<path d=\"M4 13h8\"></path><path d=\"m9 10 3 3-3 3\"></path><circle cx=\"6\" cy=\"7\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M14 17h-2a4 4 0 0 1-4-4\"></path>";
    };
    readonly queue: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
    };
    readonly 'queue-next': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 8 4 4-4 4\"></path>";
    };
    readonly retry: {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-3-6.7\"></path><path d=\"M21 3v6h-6\"></path><path d=\"M12 8v4l3 2\"></path>";
    };
    readonly rollback: {
        readonly body: "<path d=\"M3 7h11a6 6 0 1 1 0 12H8\"></path><path d=\"m7 3-4 4 4 4\"></path>";
    };
    readonly runbook: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 16 2 2 4-4\"></path>";
    };
    readonly sla: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly 'task-priority': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"M17 8v6\"></path><path d=\"M17 18h.01\"></path>";
    };
    readonly 'ai-run': {
        readonly body: "<path d=\"m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"M5 21h14\"></path><path d=\"m14 18 3 3 3-3\"></path>";
    };
    readonly 'event-stream': {
        readonly body: "<path d=\"M4 6h4\"></path><path d=\"M4 12h8\"></path><path d=\"M4 18h4\"></path><path d=\"M14 6h6\"></path><path d=\"M16 12h4\"></path><path d=\"M14 18h6\"></path><path d=\"m10 6 4 6-4 6\"></path>";
    };
    readonly 'html-partial': {
        readonly body: "<path d=\"m8 6-5 6 5 6\"></path><path d=\"m16 6 5 6-5 6\"></path><path d=\"M10 4h4\"></path><path d=\"M10 20h4\"></path><path d=\"M12 4v16\"></path>";
    };
    readonly hydrate: {
        readonly body: "<path d=\"M4 8h8\"></path><path d=\"m9 5 3 3-3 3\"></path><path d=\"M20 16h-8\"></path><path d=\"m15 13-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
    };
    readonly job: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'job-failed': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"m14 14 5 5\"></path><path d=\"m19 14-5 5\"></path>";
    };
    readonly 'job-running': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 14a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'mcp-call': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 9 2 4 4-2\"></path>";
    };
    readonly 'mcp-result': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 17 2 2 5-5\"></path>";
    };
    readonly orchestration: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"m8 10 3 6\"></path><path d=\"m16 10-3 6\"></path>";
    };
    readonly 'partial-swap': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><rect x=\"13\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"m8 9 3 3-3 3\"></path><path d=\"m16 15-3-3 3-3\"></path>";
    };
    readonly polling: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly rehydrate: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly revalidate: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly sse: {
        readonly body: "<path d=\"M4 12h4\"></path><path d=\"M12 6v12\"></path><path d=\"M16 8c2 1 3 2.3 3 4s-1 3-3 4\"></path><path d=\"M19 5c3 2 4 4.3 4 7s-1 5-4 7\"></path>";
    };
    readonly websocket: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"m17 10-3 2 3 2\"></path><path d=\"M3 12h4\"></path><path d=\"M17 12h4\"></path>";
    };
    readonly appointment: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"m14 16 2 2 4-4\"></path>";
    };
    readonly booking: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
    };
    readonly 'checklist-clock': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10 1 1 2-2\"></path><path d=\"M13 10h3\"></path><circle cx=\"14\" cy=\"16\" r=\"3\"></circle><path d=\"M14 14.5V16l1 1\"></path>";
    };
    readonly 'dispatch-board': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h5\"></path><path d=\"M13 17h3\"></path><path d=\"M6 14h.01\"></path>";
    };
    readonly 'incident-alert': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M4 21h16\"></path>";
    };
    readonly maintenance: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><circle cx=\"18\" cy=\"18\" r=\"3\"></circle>";
    };
    readonly 'process-loop': {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly recurrence: {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><path d=\"M12 8v8\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly repair: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"M18 15v6\"></path><path d=\"M15 18h6\"></path>";
    };
    readonly rota: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15h4\"></path><path d=\"M7 18h3\"></path><path d=\"M13 18h5\"></path>";
    };
    readonly 'service-window': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"16\" r=\"3\"></circle><path d=\"M12 14.5V16l1 1\"></path>";
    };
    readonly shift: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M5 19h14\"></path><path d=\"M7 5l10 14\"></path>";
    };
    readonly 'triage-queue': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"M17 18v4\"></path><path d=\"M15 20h4\"></path>";
    };
    readonly 'work-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"m15 15 2 2 4-4\"></path>";
    };
    readonly workflow: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"14\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h3a3 3 0 0 1 3 3v4\"></path><path d=\"M12 17H9a3 3 0 0 1-3-3v-4\"></path>";
    };
    readonly 'batch-job': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 17 3 2-3 2\"></path>";
    };
    readonly 'blocked-task': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M8.5 8.5 15.5 15.5\"></path>";
    };
    readonly 'calendar-sync': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M16 15a4 4 0 1 1-3-3.9\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'change-request': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"M16 15h5\"></path><path d=\"m18 12 3 3-3 3\"></path>";
    };
    readonly 'decision-node': {
        readonly body: "<path d=\"m12 3 8 9-8 9-8-9 8-9z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'event-trigger': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l4 2\"></path><path d=\"M19 5l3-3\"></path><path d=\"M22 2v6h-6\"></path>";
    };
    readonly 'form-approval': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m9 17 2 2 5-5\"></path>";
    };
    readonly 'job-queue': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect><circle cx=\"19\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'manual-step': {
        readonly body: "<path d=\"M7 11V5a2 2 0 0 1 4 0v6\"></path><path d=\"M11 11V4a2 2 0 0 1 4 0v7\"></path><path d=\"M15 12V7a2 2 0 0 1 4 0v8a7 7 0 0 1-14 0v-2\"></path>";
    };
    readonly 'process-map': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"9\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M9 6.5h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly release: {
        readonly body: "<path d=\"M12 3l3 6 6 1-4.5 4.4 1 6.6L12 18l-5.5 3 1-6.6L3 10l6-1 3-6z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'rule-engine': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"M16 11v2\"></path><path d=\"M16 17v2\"></path><path d=\"M12 15h2\"></path><path d=\"M18 15h2\"></path>";
    };
    readonly 'task-delegated': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 14 3-3\"></path><path d=\"M21 11v4h-4\"></path>";
    };
    readonly 'workflow-template': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><rect x=\"6\" y=\"7\" width=\"5\" height=\"4\" rx=\"1\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"4\" rx=\"1\"></rect><path d=\"M11 9h3a3 3 0 0 1 3 3v1\"></path>";
    };
    readonly alert: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly approval: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
    };
    readonly audit: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly award: {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"m8.5 12.5-2 8 5.5-3 5.5 3-2-8\"></path>";
    };
    readonly brain: {
        readonly body: "<path d=\"M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9 4z\"></path><path d=\"M15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 15 4z\"></path><path d=\"M7 10h4\"></path><path d=\"M13 14h4\"></path>";
    };
    readonly briefcase: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path><path d=\"M10 12v2h4v-2\"></path>";
    };
    readonly building: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path>";
    };
    readonly calculator: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly error: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly eye: {
        readonly body: "<path d=\"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'eye-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1\"></path><path d=\"M14.1 14.1A3 3 0 0 1 9.9 9.9\"></path><path d=\"M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1\"></path>";
    };
    readonly help: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly info: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 10v6\"></path><path d=\"M12 7h.01\"></path>";
    };
    readonly key: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v3\"></path>";
    };
    readonly lock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path>";
    };
    readonly policy: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M14 3v5h5\"></path>";
    };
    readonly shield: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path>";
    };
    readonly success: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly accessibility: {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path>";
    };
    readonly badge: {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
    };
    readonly 'check-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly fingerprint: {
        readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path><path d=\"M3.6 15A8 8 0 0 0 4 12\"></path>";
    };
    readonly id: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"M6 16a3 3 0 0 1 6 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h3\"></path>";
    };
    readonly 'life-buoy': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"m4.9 4.9 4.3 4.3\"></path><path d=\"m14.8 14.8 4.3 4.3\"></path><path d=\"m19.1 4.9-4.3 4.3\"></path><path d=\"m9.2 14.8-4.3 4.3\"></path>";
    };
    readonly 'scale-balanced': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly 'shield-check': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
    };
    readonly 'shield-lock': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><rect x=\"8.5\" y=\"11\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M10 11V9a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'shield-x': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
    };
    readonly 'user-check': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m16 11 2 2 4-4\"></path>";
    };
    readonly 'user-cog': {
        readonly body: "<path d=\"M14 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8\" cy=\"7\" r=\"4\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M18 11v1\"></path><path d=\"M18 18v1\"></path><path d=\"m15.2 12.2.7.7\"></path><path d=\"m20.1 17.1.7.7\"></path>";
    };
    readonly 'user-minus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M16 11h6\"></path>";
    };
    readonly 'user-plus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
    };
    readonly 'user-x': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m17 8 5 5\"></path><path d=\"m22 8-5 5\"></path>";
    };
    readonly 'users-round': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
    };
    readonly unlock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path>";
    };
    readonly user: {
        readonly body: "<path d=\"M20 21a8 8 0 1 0-16 0\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>";
    };
    readonly users: {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
    };
    readonly warning: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'badge-alert': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'badge-check': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
    };
    readonly certificate: {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M8 12.5V22l4-2 4 2v-9.5\"></path>";
    };
    readonly 'key-round': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"4\"></circle><path d=\"M11.5 12.5H22\"></path><path d=\"M18 12.5v3\"></path><path d=\"M21 12.5v2\"></path>";
    };
    readonly keys: {
        readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><path d=\"M10 8h11\"></path><path d=\"M17 8v3\"></path><path d=\"M20 8v3\"></path><circle cx=\"7\" cy=\"17\" r=\"3\"></circle><path d=\"M10 17h8\"></path><path d=\"M15 17v3\"></path>";
    };
    readonly 'lock-keyhole': {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
    };
    readonly 'lock-open': {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
    };
    readonly permission: {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
    };
    readonly role: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 10v10\"></path><path d=\"M15 17h6\"></path>";
    };
    readonly 'scan-face': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M9 10h.01\"></path><path d=\"M15 10h.01\"></path><path d=\"M9 15a4 4 0 0 0 6 0\"></path>";
    };
    readonly 'shield-alert': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'shield-user': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M7.5 17a4.5 4.5 0 0 1 9 0\"></path>";
    };
    readonly 'user-round': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path>";
    };
    readonly 'user-round-check': {
        readonly body: "<circle cx=\"10\" cy=\"8\" r=\"5\"></circle><path d=\"M2 21a8 8 0 0 1 13-6.3\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'users-plus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
    };
    readonly agent: {
        readonly body: "<rect x=\"5\" y=\"7\" width=\"14\" height=\"12\" rx=\"4\"></rect><path d=\"M12 3v4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M9 17h6\"></path>";
    };
    readonly 'agent-check': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m15 18 2 2 5-5\"></path>";
    };
    readonly 'agent-x': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m17 16 5 5\"></path><path d=\"m22 16-5 5\"></path>";
    };
    readonly 'ai-spark': {
        readonly body: "<path d=\"M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z\"></path>";
    };
    readonly 'audit-log': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M17 14.5V16l1 1\"></path>";
    };
    readonly consent: {
        readonly body: "<path d=\"M7 21V8a4 4 0 0 1 8 0v5\"></path><path d=\"M15 13V6a3 3 0 0 1 6 0v8a7 7 0 0 1-7 7H7\"></path><path d=\"m5 14 2 2 4-4\"></path>";
    };
    readonly model: {
        readonly body: "<path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z\"></path><path d=\"M12 12 4 7.5\"></path><path d=\"m12 12 8-4.5\"></path><path d=\"M12 12v9\"></path>";
    };
    readonly prompt: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><path d=\"M12 15h5\"></path>";
    };
    readonly 'prompt-lock': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><rect x=\"13\" y=\"12\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 12v-1.5a1.5 1.5 0 0 1 3 0V12\"></path>";
    };
    readonly 'risk-score': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M8 17h8\"></path><path d=\"m9 13 2 2 4-5\"></path>";
    };
    readonly 'tool-approval': {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m16 19 2 2 4-4\"></path>";
    };
    readonly 'tool-denied': {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m17 17 4 4\"></path><path d=\"m21 17-4 4\"></path>";
    };
    readonly 'api-key': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path>";
    };
    readonly credential: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"M5.5 16a3 3 0 0 1 5 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly organization: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 21v-5h8v5\"></path>";
    };
    readonly 'org-chart': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly secret: {
        readonly body: "<path d=\"M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly 'service-account': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 11v10\"></path><path d=\"M15 18h6\"></path>";
    };
    readonly session: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle>";
    };
    readonly 'session-expired': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><circle cx=\"16\" cy=\"14\" r=\"3\"></circle><path d=\"M16 12.5V14l1 1\"></path><path d=\"m19 17 2 2\"></path>";
    };
    readonly tenant: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><rect x=\"13\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><path d=\"M7 8h.01\"></path><path d=\"M17 8h.01\"></path><path d=\"M7 12h.01\"></path><path d=\"M17 12h.01\"></path><path d=\"M7 20v-4\"></path><path d=\"M17 20v-4\"></path>";
    };
    readonly token: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m15.5 8.5 2 2\"></path><path d=\"m17.5 8.5-2 2\"></path>";
    };
    readonly workspace: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h4\"></path><path d=\"M13 17h3\"></path>";
    };
    readonly 'workspace-lock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><rect x=\"13\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 14v-1.5a1.5 1.5 0 0 1 3 0V14\"></path>";
    };
    readonly 'access-request': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 16h6\"></path><path d=\"M19 13v6\"></path>";
    };
    readonly 'approval-policy': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 9h4\"></path>";
    };
    readonly 'audit-trail': {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M19 6h2\"></path><path d=\"M19 12h2\"></path><path d=\"M19 18h2\"></path>";
    };
    readonly 'data-residency': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly governance: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"m9 15 2 2 4-4\"></path>";
    };
    readonly 'policy-lock': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'data-retention': {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
    };
    readonly scim: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 8h1\"></path><path d=\"M8 11v3\"></path><path d=\"M16 11v3\"></path>";
    };
    readonly sso: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path><path d=\"M4 19h16\"></path>";
    };
    readonly 'trust-center': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><circle cx=\"18\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'user-invite': {
        readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 8v6\"></path><path d=\"M15 11h6\"></path><path d=\"m17 17 2 2 4-4\"></path>";
    };
    readonly 'user-provision': {
        readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 7v8\"></path><path d=\"m15 12 3 3 3-3\"></path><path d=\"M15 7h6\"></path>";
    };
    readonly aria: {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><path d=\"M6 13h12\"></path>";
    };
    readonly 'assistive-mode': {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><circle cx=\"19\" cy=\"18\" r=\"3\"></circle><path d=\"m18 18 1 1 2-2\"></path>";
    };
    readonly 'compliance-evidence': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'consent-record': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m8 17 2 2 5-5\"></path><path d=\"M17 14h3\"></path>";
    };
    readonly 'incident-response': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M18 15a4 4 0 0 1-6.8 2.8L10 16\"></path><path d=\"M10 19v-3h3\"></path>";
    };
    readonly 'keyboard-access': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M8 17h8\"></path><path d=\"m16 14 2 2 4-4\"></path>";
    };
    readonly 'permission-review': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
    };
    readonly privacy: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M2 2l20 20\"></path><path d=\"M9.9 9.9A3 3 0 0 0 14.1 14.1\"></path>";
    };
    readonly 'screen-reader': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 9h10\"></path><path d=\"M7 12h6\"></path><path d=\"M18 18c2-2 2-4 0-6\"></path>";
    };
    readonly 'voice-access': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path><path d=\"m16 5 2-2\"></path><path d=\"m18 8 3-1\"></path>";
    };
    readonly 'access-expiry': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"m17 17 3 3\"></path>";
    };
    readonly 'audit-event': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"M16 14.5V16l1 1\"></path><path d=\"M20 5h2\"></path>";
    };
    readonly 'data-classification': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h6\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14l3 3\"></path><path d=\"M19 14l-3 3\"></path>";
    };
    readonly 'device-policy': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"m9 15 2 2 4-4\"></path>";
    };
    readonly 'encryption-key': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><rect x=\"13\" y=\"4\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 4V2.5a2 2 0 0 1 4 0V4\"></path>";
    };
    readonly 'identity-provider': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"6\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 12v7\"></path><path d=\"M15 16h6\"></path>";
    };
    readonly 'ip-allowlist': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'legal-hold': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M17 13v8\"></path><path d=\"M14 16h6\"></path>";
    };
    readonly 'tls-certificate': {
        readonly body: "<path d=\"M6 3h12v12H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M9 15v6l3-2 3 2v-6\"></path><path d=\"m15 5 2 2 4-4\"></path>";
    };
    readonly 'zero-trust': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 2l20 20\"></path>";
    };
    readonly 'x-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly battery: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path>";
    };
    readonly bluetooth: {
        readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path>";
    };
    readonly cloud: {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path>";
    };
    readonly cpu: {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path>";
    };
    readonly database: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path>";
    };
    readonly desktop: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
    };
    readonly laptop: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M3 20h18l-2-4H5l-2 4z\"></path>";
    };
    readonly offline: {
        readonly body: "<path d=\"M2 2 22 22\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M5 13a10 10 0 0 1 4-2.4\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path>";
    };
    readonly phone: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly server: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path>";
    };
    readonly chip: {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path><path d=\"M10 10h4v4h-4z\"></path>";
    };
    readonly 'cloud-download': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 11v8\"></path><path d=\"m8 15 4 4 4-4\"></path>";
    };
    readonly 'cloud-upload': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 19v-8\"></path><path d=\"m8 15 4-4 4 4\"></path>";
    };
    readonly 'database-backup': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v4c0 1.7 3.6 3 8 3\"></path><path d=\"M16 16h5v5\"></path><path d=\"M21 16a5 5 0 1 0-1.5 3.5\"></path>";
    };
    readonly 'database-zap': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m17 14-3 5h4l-2 4\"></path>";
    };
    readonly 'device-tablet': {
        readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly 'hard-drive': {
        readonly body: "<path d=\"M6 3h12l4 9v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7l4-9z\"></path><path d=\"M2 12h20\"></path><path d=\"M6 17h.01\"></path><path d=\"M10 17h.01\"></path>";
    };
    readonly headphones: {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect>";
    };
    readonly keyboard: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M7 13h.01\"></path><path d=\"M11 13h6\"></path><path d=\"M19 13h.01\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly monitor: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
    };
    readonly 'plug-zap': {
        readonly body: "<path d=\"M13 2 8 12h5l-2 10 5-12h-5l2-8z\"></path><path d=\"M4 14h4\"></path><path d=\"M3 18h6\"></path><path d=\"M16 6h5\"></path><path d=\"M15 10h6\"></path>";
    };
    readonly 'server-cog': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><circle cx=\"19\" cy=\"17\" r=\"2\"></circle><path d=\"M19 13v1\"></path><path d=\"M19 20v1\"></path><path d=\"M16.5 14.5l.7.7\"></path><path d=\"m20.8 18.8.7.7\"></path>";
    };
    readonly 'wifi-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M5 13a10 10 0 0 1 5.2-2.7\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
    };
    readonly 'bluetooth-connected': {
        readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
    };
    readonly 'cloud-check': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m9 14 2 2 5-5\"></path>";
    };
    readonly 'cloud-x': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m10 12 5 5\"></path><path d=\"m15 12-5 5\"></path>";
    };
    readonly 'database-check': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m14 18 2 2 5-5\"></path>";
    };
    readonly 'database-lock': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v5c0 1.5 2.8 2.7 6.5 3\"></path><rect x=\"14\" y=\"15\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 15v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly mouse: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"5\"></rect><path d=\"M12 6v4\"></path><path d=\"M7 10h10\"></path>";
    };
    readonly network: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly 'monitor-smartphone': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"13\" height=\"10\" rx=\"2\"></rect><path d=\"M7 18h6\"></path><path d=\"M10 14v4\"></path><rect x=\"17\" y=\"10\" width=\"5\" height=\"10\" rx=\"1\"></rect><path d=\"M19 18h1\"></path>";
    };
    readonly router: {
        readonly body: "<rect x=\"4\" y=\"12\" width=\"16\" height=\"7\" rx=\"2\"></rect><path d=\"M8 12V8\"></path><path d=\"M16 12V8\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path>";
    };
    readonly 'router-wifi': {
        readonly body: "<rect x=\"4\" y=\"13\" width=\"16\" height=\"6\" rx=\"2\"></rect><path d=\"M8 13V9\"></path><path d=\"M16 13V9\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path><path d=\"M8 6a6 6 0 0 1 8 0\"></path><path d=\"M10 9a3 3 0 0 1 4 0\"></path>";
    };
    readonly smartphone: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly tablet: {
        readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly usb: {
        readonly body: "<path d=\"M12 3v12\"></path><path d=\"m9 6 3-3 3 3\"></path><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M12 15H8\"></path><path d=\"M12 15h4\"></path><path d=\"M12 15v6\"></path><circle cx=\"12\" cy=\"21\" r=\"1\"></circle>";
    };
    readonly 'barcode-scanner': {
        readonly body: "<path d=\"M4 7V5a2 2 0 0 1 2-2h2\"></path><path d=\"M16 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M20 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M8 21H6a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 8v8\"></path><path d=\"M10 8v8\"></path><path d=\"M14 8v8\"></path><path d=\"M17 8v8\"></path>";
    };
    readonly 'battery-charging': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"m11 8-3 5h4l-2 4\"></path>";
    };
    readonly 'battery-full': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path><path d=\"M16 11v2\"></path>";
    };
    readonly 'battery-low': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path>";
    };
    readonly nfc: {
        readonly body: "<path d=\"M6 8a8 8 0 0 1 0 8\"></path><path d=\"M10 6a12 12 0 0 1 0 12\"></path><path d=\"M14 4a16 16 0 0 1 0 16\"></path><path d=\"M18 7a9 9 0 0 1 0 10\"></path>";
    };
    readonly 'printer-check': {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"m13 18 2 2 5-5\"></path>";
    };
    readonly 'server-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'server-lock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><rect x=\"16\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M17.5 15v-2a2 2 0 0 1 3 0v2\"></path>";
    };
    readonly signal: {
        readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20V8\"></path><path d=\"M20 20V4\"></path>";
    };
    readonly 'signal-low': {
        readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20\"></path><path d=\"M20 20\"></path>";
    };
    readonly smartwatch: {
        readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><path d=\"M11 12h2\"></path>";
    };
    readonly watch: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M9 2h6l1 4H8l1-4z\"></path><path d=\"M8 18h8l-1 4H9l-1-4z\"></path><path d=\"M12 9v3l2 1\"></path>";
    };
    readonly wifi: {
        readonly body: "<path d=\"M5 13a10 10 0 0 1 14 0\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
    };
    readonly 'app-window': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'mobile-camera': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><circle cx=\"12\" cy=\"11\" r=\"3\"></circle><path d=\"M10 7h4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-check': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 2 2 4-4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-home': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 3-3 3 3\"></path><path d=\"M10 12v3h4v-3\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-nav': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 16h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 8h6\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-rotate': {
        readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path>";
    };
    readonly 'mobile-scan': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10v4\"></path><path d=\"M14 10v4\"></path>";
    };
    readonly 'mobile-tab': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 16h8\"></path><path d=\"M10 16v3\"></path><path d=\"M14 16v3\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-vibrate': {
        readonly body: "<path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-x': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'offline-sync': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M21 12a9 9 0 0 1-4.2 7.6\"></path><path d=\"M3 12a9 9 0 0 1 13.7-7.7\"></path><path d=\"M3 16v5h5\"></path><path d=\"M21 8V3h-5\"></path>";
    };
    readonly 'pwa-install': {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v8\"></path><path d=\"m8 11 4 4 4-4\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly browser: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path>";
    };
    readonly cache: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"M17 15a4 4 0 1 1-3 6.7\"></path><path d=\"M17 13v4h-4\"></path>";
    };
    readonly 'desktop-app': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h4\"></path><path d=\"M7 11h8\"></path>";
    };
    readonly 'edge-device': {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 9h4\"></path><path d=\"M18 9h4\"></path><path d=\"M2 15h4\"></path><path d=\"M18 15h4\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly kiosk: {
        readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"16\" rx=\"2\"></rect><path d=\"M9 22h6\"></path><path d=\"M12 19v3\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly 'local-storage': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M4 10h16\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h4\"></path>";
    };
    readonly 'platform-desktop': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h10\"></path>";
    };
    readonly 'platform-mobile': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M10 7h4\"></path><path d=\"M10 11h4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'platform-web': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"M8 8h8\"></path>";
    };
    readonly 'push-device': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M18 6a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S18 9 18 6\"></path>";
    };
    readonly 'push-subscription': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h4\"></path><path d=\"M15 15a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S15 18 15 15\"></path>";
    };
    readonly 'service-worker': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 7v2\"></path><path d=\"M12 15v2\"></path><path d=\"M7 12h2\"></path><path d=\"M15 12h2\"></path><path d=\"m8.5 8.5 1.4 1.4\"></path><path d=\"m14.1 14.1 1.4 1.4\"></path>";
    };
    readonly storage: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path><path d=\"M8 17h.01\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly biometric: {
        readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path>";
    };
    readonly 'camera-capture': {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly geolocation: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path>";
    };
    readonly 'mobile-bottom-sheet': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path><path d=\"M11 5h2\"></path>";
    };
    readonly 'mobile-drawer': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M7 8h7\"></path><path d=\"M7 12h7\"></path><path d=\"M7 16h7\"></path><path d=\"m15 10 2 2-2 2\"></path>";
    };
    readonly 'mobile-gesture': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 13c2-5 5-5 7 0\"></path><path d=\"M10 13l2 2\"></path>";
    };
    readonly 'mobile-offline': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M9 8h6\"></path>";
    };
    readonly 'mobile-permission': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'mobile-sheet': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><rect x=\"8\" y=\"10\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M10 13h4\"></path><path d=\"M11 5h2\"></path>";
    };
    readonly 'orientation-lock': {
        readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path><rect x=\"9\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M10.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
    };
    readonly passkey: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M12 4a4 4 0 0 1 6 0\"></path>";
    };
    readonly 'sensor-alert': {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path><path d=\"M19 3v4\"></path><path d=\"M19 10h.01\"></path>";
    };
    readonly 'vibration-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly wearable: {
        readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly airplay: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m12 15 5 6H7l5-6z\"></path>";
    };
    readonly beacon: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M8 8a6 6 0 0 0 0 8\"></path><path d=\"M16 8a6 6 0 0 1 0 8\"></path><path d=\"M5 5a10 10 0 0 0 0 14\"></path><path d=\"M19 5a10 10 0 0 1 0 14\"></path>";
    };
    readonly 'bluetooth-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"m7 7 10 10-5 4V3l5 4-5 5\"></path><path d=\"M7 17l4-4\"></path>";
    };
    readonly 'camera-switch': {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M7 13h3\"></path><path d=\"m8 11-2 2 2 2\"></path><path d=\"M17 13h-3\"></path><path d=\"m16 15 2-2-2-2\"></path>";
    };
    readonly 'device-hub': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><path d=\"M12 9v3\"></path><path d=\"M6 15v-3h12v3\"></path>";
    };
    readonly 'display-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"m8 10 2 2 5-5\"></path>";
    };
    readonly firmware: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly gpu: {
        readonly body: "<rect x=\"5\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 10h3\"></path><path d=\"M19 10h3\"></path><path d=\"M9 10h6v4H9z\"></path>";
    };
    readonly 'iot-device': {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v5\"></path><path d=\"M12 17v5\"></path><path d=\"M2 12h5\"></path><path d=\"M17 12h5\"></path>";
    };
    readonly 'mobile-hotspot': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 8a4 4 0 0 1 4 0\"></path><path d=\"M8 6a7 7 0 0 1 8 0\"></path><path d=\"M12 11h.01\"></path>";
    };
    readonly 'printer-error': {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"M18 17v3\"></path><path d=\"M18 23h.01\"></path>";
    };
    readonly 'qr-scanner': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><rect x=\"7\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"14\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"7\" y=\"14\" width=\"3\" height=\"3\"></rect><path d=\"M14 14h3v3\"></path>";
    };
    readonly archive: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"4\" rx=\"1\"></rect><path d=\"M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly camera: {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>";
    };
    readonly copy: {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect>";
    };
    readonly document: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h6\"></path>";
    };
    readonly edit: {
        readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
    };
    readonly file: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path>";
    };
    readonly folder: {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path>";
    };
    readonly image: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path>";
    };
    readonly printer: {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 14h10v7H7z\"></path>";
    };
    readonly save: {
        readonly body: "<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><path d=\"M17 21v-8H7v8\"></path><path d=\"M7 3v5h8\"></path>";
    };
    readonly 'align-center': {
        readonly body: "<path d=\"M7 6h10\"></path><path d=\"M4 12h16\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'align-left': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h10\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly 'align-right': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M10 12h10\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly 'book-open': {
        readonly body: "<path d=\"M3 5a6 6 0 0 1 6-2l3 1v17l-3-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M21 5a6 6 0 0 0-6-2l-3 1v17l3-1a6 6 0 0 1 6 2V5z\"></path>";
    };
    readonly bookmark: {
        readonly body: "<path d=\"M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1z\"></path>";
    };
    readonly 'camera-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.5 4h5L16 7h3a2 2 0 0 1 2 2v8.5\"></path><path d=\"M18 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2\"></path><path d=\"M9.9 10.4A3 3 0 0 0 14 14.6\"></path>";
    };
    readonly clipboard: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M8 10h8\"></path><path d=\"M8 14h8\"></path><path d=\"M8 18h5\"></path>";
    };
    readonly 'clipboard-check': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'clipboard-list': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M9 11h.01\"></path><path d=\"M12 11h4\"></path><path d=\"M9 16h.01\"></path><path d=\"M12 16h4\"></path>";
    };
    readonly 'copy-check': {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect><path d=\"m12 16 2 2 5-5\"></path>";
    };
    readonly 'file-check': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'file-code': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path>";
    };
    readonly 'file-down': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"m9 15 3 3 3-3\"></path>";
    };
    readonly 'file-minus': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'file-plus': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'file-text': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M8 9h2\"></path>";
    };
    readonly 'file-up': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 18v-6\"></path><path d=\"m9 15 3-3 3 3\"></path>";
    };
    readonly 'file-x': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
    };
    readonly 'folder-open': {
        readonly body: "<path d=\"M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v1\"></path><path d=\"M3 10h18l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z\"></path>";
    };
    readonly 'folder-plus': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
    };
    readonly 'folder-sync': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v3\"></path><path d=\"M3 10v8a2 2 0 0 0 2 2h7\"></path><path d=\"M21 17a4 4 0 0 1-6.8 2.8L13 18\"></path><path d=\"M13 21v-3h3\"></path><path d=\"M15 14a4 4 0 0 1 6.8 2.8L23 18\"></path><path d=\"M23 15v3h-3\"></path>";
    };
    readonly 'image-plus': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M16 6v6\"></path><path d=\"M13 9h6\"></path>";
    };
    readonly indent: {
        readonly body: "<path d=\"M3 6h18\"></path><path d=\"M11 12h10\"></path><path d=\"M3 18h18\"></path><path d=\"m3 10 4 2-4 2v-4z\"></path>";
    };
    readonly pencil: {
        readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
    };
    readonly scissors: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M20 4 8.1 15.9\"></path><path d=\"M8.1 8.1 20 20\"></path>";
    };
    readonly sticky: {
        readonly body: "<path d=\"M5 3h14a2 2 0 0 1 2 2v10l-6 6H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"></path><path d=\"M15 21v-6h6\"></path>";
    };
    readonly 'clipboard-copy': {
        readonly body: "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"></path><path d=\"M12 13h4\"></path><path d=\"M14 11v4\"></path>";
    };
    readonly 'clipboard-x': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
    };
    readonly crop: {
        readonly body: "<path d=\"M6 2v14a2 2 0 0 0 2 2h14\"></path><path d=\"M18 22V8a2 2 0 0 0-2-2H2\"></path>";
    };
    readonly eraser: {
        readonly body: "<path d=\"m7 21-4-4 10-10a3 3 0 0 1 4 0l4 4-10 10H7z\"></path><path d=\"m12 12 5 5\"></path><path d=\"M7 21h14\"></path>";
    };
    readonly 'file-archive': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 12h4\"></path><path d=\"M10 16h4\"></path><path d=\"M12 12v8\"></path>";
    };
    readonly 'file-audio': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 17v-4l4-2v6l-4-2\"></path><path d=\"M16 13a3 3 0 0 1 0 4\"></path>";
    };
    readonly 'file-image': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"9\" cy=\"13\" r=\"1.5\"></circle><path d=\"m8 19 3-3 2 2 3-4 2 3\"></path>";
    };
    readonly 'file-json': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 13c-1 0-1 .8-1 1.5S9 16 8 16\"></path><path d=\"M14 13c1 0 1 .8 1 1.5S15 16 16 16\"></path>";
    };
    readonly 'file-lock': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'file-spreadsheet': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M12 13v6\"></path>";
    };
    readonly 'file-video': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"13\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"m14 15 3-2v5l-3-2\"></path>";
    };
    readonly 'folder-check': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m8 14 2 2 5-5\"></path>";
    };
    readonly 'folder-down': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 10v7\"></path><path d=\"m9 14 3 3 3-3\"></path>";
    };
    readonly 'folder-lock': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><rect x=\"8\" y=\"13\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 13v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'folder-up': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 17v-7\"></path><path d=\"m9 13 3-3 3 3\"></path>";
    };
    readonly 'folder-x': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly newspaper: {
        readonly body: "<path d=\"M4 5h14a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z\"></path><path d=\"M4 17H3a1 1 0 0 1-1-1V7\"></path><path d=\"M8 9h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path>";
    };
    readonly paintbrush: {
        readonly body: "<path d=\"M18 3a3 3 0 0 1 3 3c0 4-5 4-5 8\"></path><path d=\"M16 14a4 4 0 0 1-8 0c0-2 2-4 4-4s4 2 4 4z\"></path><path d=\"M8 18c0 2-2 3-5 3 1-2 1-4 3-5\"></path>";
    };
    readonly palette: {
        readonly body: "<path d=\"M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z\"></path><path d=\"M7.5 10h.01\"></path><path d=\"M10 7h.01\"></path><path d=\"M14 7h.01\"></path>";
    };
    readonly 'document-import': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v7\"></path><path d=\"m9 15 3-3 3 3\"></path>";
    };
    readonly 'document-export': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 19v-7\"></path><path d=\"m9 16 3 3 3-3\"></path>";
    };
    readonly 'document-search': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"11\" cy=\"15\" r=\"3\"></circle><path d=\"m13 17 3 3\"></path>";
    };
    readonly 'document-signature': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17c1-4 3-4 4 0 1-3 3-3 4 0\"></path>";
    };
    readonly 'file-csv': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 14h2\"></path><path d=\"M12 14h2\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'file-pdf': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17v-5h2a2 2 0 0 1 0 4H8\"></path><path d=\"M13 17v-5h1a3 3 0 0 1 0 5h-1\"></path>";
    };
    readonly 'file-template': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"12\" width=\"8\" height=\"6\" rx=\"1\"></rect><path d=\"M8 15h8\"></path>";
    };
    readonly 'image-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m14 8 2 2 4-4\"></path>";
    };
    readonly 'scan-document': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M8 7h8v10H8z\"></path><path d=\"M10 11h4\"></path>";
    };
    readonly 'template-plus': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M15 14v6\"></path><path d=\"M12 17h6\"></path>";
    };
    readonly asset: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"m20 15-4-4-5 5-2-2-4 5\"></path>";
    };
    readonly 'asset-library': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect>";
    };
    readonly collection: {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path><path d=\"M11 12h4\"></path><path d=\"M13 10v4\"></path>";
    };
    readonly 'content-calendar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h5\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly draft: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 16h8\"></path><path d=\"M8 12h5\"></path><path d=\"M15 11l3 3\"></path>";
    };
    readonly 'empty-file': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'empty-folder': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'file-diff': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h3\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly 'file-history': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"12\" cy=\"15\" r=\"4\"></circle><path d=\"M12 13v2l1.5 1\"></path>";
    };
    readonly 'knowledge-base': {
        readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path>";
    };
    readonly 'media-library': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 3h10\"></path><path d=\"M7 21h10\"></path>";
    };
    readonly version: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 7h3V4\"></path><path d=\"M7 7a7 7 0 0 1 10 0\"></path>";
    };
    readonly citation: {
        readonly body: "<path d=\"M6 5h12v16H6z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path><path d=\"M4 3h4\"></path><path d=\"M16 3h4\"></path>";
    };
    readonly 'code-block': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10-3 2 3 2\"></path><path d=\"m16 10 3 2-3 2\"></path><path d=\"M10 16h4\"></path>";
    };
    readonly glossary: {
        readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path><path d=\"M8 13h2\"></path>";
    };
    readonly markdown: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 15V9l3 4 3-4v6\"></path><path d=\"M17 9v6\"></path><path d=\"m15 13 2 2 2-2\"></path>";
    };
    readonly publish: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M12 18v-7\"></path><path d=\"m9 14 3-3 3 3\"></path>";
    };
    readonly redact: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M7 13h10\"></path>";
    };
    readonly 'review-changes': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 10h5\"></path><path d=\"M16 15h4\"></path>";
    };
    readonly 'rich-text': {
        readonly body: "<path d=\"M5 6h14\"></path><path d=\"M8 6v12\"></path><path d=\"M16 6v12\"></path><path d=\"M6 18h12\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly translation: {
        readonly body: "<path d=\"M4 5h9\"></path><path d=\"M8 5v12\"></path><path d=\"M3 17c4-3 7-7 8-12\"></path><path d=\"M13 19l3-8 3 8\"></path><path d=\"M14 16h4\"></path>";
    };
    readonly 'web-page': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'video-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
    };
    readonly video: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
    };
    readonly annotation: {
        readonly body: "<path d=\"M4 5h16v11H8l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'approval-document': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"m8 17 2 2 5-5\"></path>";
    };
    readonly 'content-block': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><rect x=\"8\" y=\"15\" width=\"8\" height=\"2\"></rect>";
    };
    readonly 'document-merge': {
        readonly body: "<path d=\"M5 3h6v7H5z\"></path><path d=\"M13 14h6v7h-6z\"></path><path d=\"M8 10v3a4 4 0 0 0 4 4h1\"></path><path d=\"m10 15 2 2-2 2\"></path>";
    };
    readonly 'document-split': {
        readonly body: "<path d=\"M5 3h14v6H5z\"></path><path d=\"M5 15h6v6H5z\"></path><path d=\"M13 15h6v6h-6z\"></path><path d=\"M12 9v3\"></path><path d=\"M8 15v-3h8v3\"></path>";
    };
    readonly 'file-xml': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path><path d=\"M12 12l-1 6\"></path>";
    };
    readonly 'folder-shared': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><circle cx=\"10\" cy=\"14\" r=\"2\"></circle><path d=\"M14 18a4 4 0 0 0-8 0\"></path><circle cx=\"17\" cy=\"13\" r=\"1.5\"></circle>";
    };
    readonly 'image-crop': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 3v13a2 2 0 0 0 2 2h11\"></path><path d=\"M16 21V8a2 2 0 0 0-2-2H3\"></path>";
    };
    readonly 'image-edit': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m15 7 3-3 2 2-3 3h-2V7z\"></path>";
    };
    readonly 'media-playlist': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h8\"></path><path d=\"M7 13h6\"></path><path d=\"M7 17h4\"></path><path d=\"m15 14 4 2-4 2v-4z\"></path>";
    };
    readonly 'page-break': {
        readonly body: "<path d=\"M6 3h12v7H6z\"></path><path d=\"M6 14h12v7H6z\"></path><path d=\"M3 12h2\"></path><path d=\"M8 12h2\"></path><path d=\"M14 12h2\"></path><path d=\"M19 12h2\"></path>";
    };
    readonly seo: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h10\"></path><path d=\"M7 14h5\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"m18 17 2 2\"></path>";
    };
    readonly snippet: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m9 10-3 2 3 2\"></path><path d=\"m15 10 3 2-3 2\"></path><path d=\"M10 17h4\"></path>";
    };
    readonly 'style-guide': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h4\"></path><circle cx=\"9\" cy=\"16\" r=\"1\"></circle><circle cx=\"13\" cy=\"16\" r=\"1\"></circle><circle cx=\"17\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly 'alt-text': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 21h10\"></path><path d=\"M9 21v-4\"></path><path d=\"M15 21v-4\"></path>";
    };
    readonly 'content-approval': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'form-template': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><rect x=\"8\" y=\"11\" width=\"8\" height=\"3\"></rect><path d=\"M8 17h4\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly 'media-caption': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m10 10 5 3-5 3v-6z\"></path><path d=\"M7 18h10\"></path><path d=\"M9 21h6\"></path>";
    };
    readonly 'version-compare': {
        readonly body: "<path d=\"M5 4h6v16H5z\"></path><path d=\"M13 4h6v16h-6z\"></path><path d=\"M8 8h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M16 8h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'at-sign': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path>";
    };
    readonly bell: {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly mail: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path>";
    };
    readonly message: {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path>";
    };
    readonly mic: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
    };
    readonly paperclip: {
        readonly body: "<path d=\"m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8\"></path>";
    };
    readonly send: {
        readonly body: "<path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path><path d=\"M22 2 11 13\"></path>";
    };
    readonly share: {
        readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
    };
    readonly 'bell-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly megaphone: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path>";
    };
    readonly 'phone-call': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 3a7 7 0 0 1 7 7\"></path><path d=\"M14 7a3 3 0 0 1 3 3\"></path>";
    };
    readonly broadcast: {
        readonly body: "<path d=\"M4 12a8 8 0 0 1 8-8\"></path><path d=\"M4 12a8 8 0 0 0 8 8\"></path><path d=\"M20 12a8 8 0 0 0-8-8\"></path><path d=\"M20 12a8 8 0 0 1-8 8\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'chat-check': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'chat-plus': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'chat-x': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly 'inbox-mail': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"m7 7 5 4 5-4\"></path>";
    };
    readonly 'mail-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'mail-open': {
        readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path>";
    };
    readonly 'mail-plus': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'mail-x': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly 'message-circle': {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-9 9H7l-4 2 2-4a9 9 0 1 1 16-7z\"></path>";
    };
    readonly 'message-square': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path>";
    };
    readonly 'mic-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 9.5 6.5\"></path><path d=\"M19 11a7 7 0 0 1-2.1 5\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
    };
    readonly 'notification-dot': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><circle cx=\"19\" cy=\"7\" r=\"3\"></circle>";
    };
    readonly 'phone-forwarded': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 6h6\"></path><path d=\"m18 3 3 3-3 3\"></path>";
    };
    readonly 'phone-incoming': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M21 3 15 9\"></path><path d=\"M15 3v6h6\"></path>";
    };
    readonly 'phone-missed': {
        readonly body: "<path d=\"M6 8c4-3 8-3 12 0l2-2\"></path><path d=\"M4 6l2 2\"></path><path d=\"m15 6 6 6\"></path><path d=\"m21 6-6 6\"></path><path d=\"M8 12l-3 5\"></path><path d=\"m16 12 3 5\"></path>";
    };
    readonly 'phone-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.3 1.8\"></path><path d=\"M15.5 14.5a2 2 0 0 1 1.8-.5l3 .5a2 2 0 0 1 1.7 2.4\"></path>";
    };
    readonly 'phone-outgoing': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 9 21 3\"></path><path d=\"M15 3h6v6\"></path>";
    };
    readonly 'rss-feed': {
        readonly body: "<path d=\"M4 11a9 9 0 0 1 9 9\"></path><path d=\"M4 4a16 16 0 0 1 16 16\"></path><circle cx=\"5\" cy=\"19\" r=\"1\"></circle>";
    };
    readonly 'share-2': {
        readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
    };
    readonly announcement: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path><path d=\"M21 4h.01\"></path>";
    };
    readonly 'comment-check': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'comment-x': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly feedback: {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
    };
    readonly 'inbox-alert': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
    };
    readonly mention: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M4 4 2 2\"></path><path d=\"M20 4l2-2\"></path>";
    };
    readonly 'message-lock': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><rect x=\"12\" y=\"10\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 10V8.5a1.5 1.5 0 0 1 3 0V10\"></path>";
    };
    readonly thread: {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path>";
    };
    readonly channel: {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 12h4\"></path>";
    };
    readonly 'channel-lock': {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><rect x=\"12\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
    };
    readonly 'channel-plus': {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M12 8v6\"></path><path d=\"M9 11h6\"></path>";
    };
    readonly collaboration: {
        readonly body: "<circle cx=\"8\" cy=\"9\" r=\"3\"></circle><circle cx=\"16\" cy=\"9\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M11 9h2\"></path>";
    };
    readonly conversation: {
        readonly body: "<path d=\"M4 5h13v8H7l-3 3V5z\"></path><path d=\"M9 16h8l3 3v-8\"></path><path d=\"M8 9h5\"></path><path d=\"M13 14h3\"></path>";
    };
    readonly meeting: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"M16 10h3\"></path><path d=\"M16 14h3\"></path>";
    };
    readonly moderation: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'notification-check': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'notification-snooze': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h12\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M16 16h5l-5 5h5\"></path>";
    };
    readonly 'presence-away': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M18 4.5V6l1 1\"></path>";
    };
    readonly 'presence-busy': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M16.5 6h3\"></path>";
    };
    readonly 'presence-online': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 6 1 1 2-2\"></path>";
    };
    readonly reaction: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 15a5 5 0 0 0 8 0\"></path><path d=\"M20 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path>";
    };
    readonly 'thread-resolved': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
    };
    readonly 'call-muted': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M2 2l20 20\"></path>";
    };
    readonly 'call-transfer': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 5h7\"></path><path d=\"m18 2 3 3-3 3\"></path>";
    };
    readonly 'comment-thread': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path><path d=\"M12 13h4\"></path>";
    };
    readonly 'conversation-star': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"m16 8 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L13 10.3l2-.3 1-2z\"></path>";
    };
    readonly 'escalation-message': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M12 14V8\"></path><path d=\"m9 11 3-3 3 3\"></path>";
    };
    readonly 'meeting-cancelled': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m16 10 4 4\"></path><path d=\"m20 10-4 4\"></path>";
    };
    readonly 'meeting-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m15 15 2 2 4-4\"></path>";
    };
    readonly 'mention-alert': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M21 3v4\"></path><path d=\"M21 10h.01\"></path>";
    };
    readonly 'notification-priority': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h15\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M19 5v6\"></path><path d=\"M19 15h.01\"></path>";
    };
    readonly 'presence-offline': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 4.5 3 3\"></path><path d=\"m19.5 4.5-3 3\"></path>";
    };
    readonly 'support-inbox': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 8v4\"></path><path d=\"M10 10h4\"></path>";
    };
    readonly survey: {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'targeted-broadcast': {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><circle cx=\"19\" cy=\"12\" r=\"3\"></circle><path d=\"M19 9v6\"></path><path d=\"M16 12h6\"></path>";
    };
    readonly transcript: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M16 16h.01\"></path>";
    };
    readonly voicemail: {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"4\"></circle><circle cx=\"18\" cy=\"12\" r=\"4\"></circle><path d=\"M6 16h12\"></path>";
    };
    readonly 'call-incoming': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M20 4h-6\"></path><path d=\"m17 1-3 3 3 3\"></path>";
    };
    readonly 'call-recording': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle>";
    };
    readonly 'chat-bot': {
        readonly body: "<path d=\"M4 8h16v10H7l-3 3V8z\"></path><path d=\"M12 8V4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M10 16h4\"></path>";
    };
    readonly 'chat-error': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'chat-resolved': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
    };
    readonly 'contact-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M14 10h4\"></path><path d=\"M14 14h4\"></path>";
    };
    readonly 'email-bounce': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 15v3\"></path><path d=\"M12 21h.01\"></path>";
    };
    readonly 'email-template': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M7 15h10\"></path><path d=\"M7 18h6\"></path>";
    };
    readonly 'notification-digest': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M8 12h8\"></path><path d=\"M8 15h6\"></path>";
    };
    readonly 'webhook-event': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M12 3v2\"></path>";
    };
    readonly 'auto-reply': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 13a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 11v3h-3\"></path>";
    };
    readonly 'call-queue': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M9 19h6\"></path><path d=\"M9 22h4\"></path>";
    };
    readonly campaign: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><circle cx=\"20\" cy=\"5\" r=\"2\"></circle>";
    };
    readonly 'chat-typing': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
    };
    readonly 'email-opened': {
        readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'email-sent': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M16 15h6\"></path><path d=\"m19 12 3 3-3 3\"></path>";
    };
    readonly 'inbox-priority': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
    };
    readonly 'live-chat': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'message-draft': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"m15 14 3-3 2 2-3 3h-2v-2z\"></path>";
    };
    readonly 'notification-muted': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly sms: {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 10h.01\"></path><path d=\"M12 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'support-agent': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"3\"></circle><path d=\"M7 21a5 5 0 0 1 10 0\"></path>";
    };
    readonly bank: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly card: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h3\"></path>";
    };
    readonly cart: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path>";
    };
    readonly cash: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 9v6\"></path>";
    };
    readonly 'credit-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path>";
    };
    readonly receipt: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path>";
    };
    readonly 'badge-dollar': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly 'badge-percent': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8 16 8-8\"></path><circle cx=\"9\" cy=\"9\" r=\"1\"></circle><circle cx=\"15\" cy=\"15\" r=\"1\"></circle>";
    };
    readonly barcode: {
        readonly body: "<path d=\"M4 5v14\"></path><path d=\"M7 5v14\"></path><path d=\"M11 5v14\"></path><path d=\"M13 5v14\"></path><path d=\"M17 5v14\"></path><path d=\"M20 5v14\"></path>";
    };
    readonly gift: {
        readonly body: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M3 12h18\"></path><path d=\"M12 8v13\"></path><path d=\"M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8z\"></path><path d=\"M12 8h3.5A2.5 2.5 0 1 0 13 5.5L12 8z\"></path>";
    };
    readonly invoice: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path>";
    };
    readonly landmark: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'shopping-bag': {
        readonly body: "<path d=\"M6 8h12l1 13H5L6 8z\"></path><path d=\"M9 8a3 3 0 0 1 6 0\"></path>";
    };
    readonly store: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M4 10a2 2 0 0 0 4 0\"></path><path d=\"M8 10a2 2 0 0 0 4 0\"></path><path d=\"M12 10a2 2 0 0 0 4 0\"></path><path d=\"M16 10a2 2 0 0 0 4 0\"></path>";
    };
    readonly ticket: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly truck: {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly vault: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 9h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly wallet: {
        readonly body: "<path d=\"M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12\"></path><path d=\"M16 13h5\"></path><path d=\"M17 13h.01\"></path>";
    };
    readonly coins: {
        readonly body: "<ellipse cx=\"8\" cy=\"6\" rx=\"5\" ry=\"3\"></ellipse><path d=\"M3 6v4c0 1.7 2.2 3 5 3s5-1.3 5-3V6\"></path><path d=\"M11 9.5c1-.9 2.5-1.5 4-1.5 2.8 0 5 1.3 5 3s-2.2 3-5 3c-1.5 0-3-.4-4-1.1\"></path><path d=\"M10 13v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-5\"></path>";
    };
    readonly coupon: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path>";
    };
    readonly 'dollar-sign': {
        readonly body: "<path d=\"M12 2v20\"></path><path d=\"M17 5.5A5 5 0 0 0 12 4c-3 0-5 1.5-5 3.5 0 5 10 2.5 10 7.5 0 2-2 3.5-5 3.5a6 6 0 0 1-5.5-2.5\"></path>";
    };
    readonly 'hand-coins': {
        readonly body: "<path d=\"M3 15h4l4 4h6a3 3 0 0 0 3-3\"></path><path d=\"M7 15l3-3h4a2 2 0 0 1 0 4h-3\"></path><circle cx=\"17\" cy=\"6\" r=\"3\"></circle><path d=\"M17 4v4\"></path><path d=\"M15 6h4\"></path>";
    };
    readonly 'package-check': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'package-open': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path><path d=\"m3 8 9 5 9-5\"></path>";
    };
    readonly 'package-plus': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
    };
    readonly 'package-x': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m9.5 12.5 5 5\"></path><path d=\"m14.5 12.5-5 5\"></path>";
    };
    readonly percent: {
        readonly body: "<path d=\"m19 5-14 14\"></path><circle cx=\"7\" cy=\"7\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
    };
    readonly refund: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"M12 8v8\"></path><path d=\"M15 10.5A3 3 0 0 0 12 9c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly scale: {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly ship: {
        readonly body: "<path d=\"M3 17h18l-2 4H5l-2-4z\"></path><path d=\"M5 17V8h14v9\"></path><path d=\"M9 8V4h6v4\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
    };
    readonly 'shopping-cart-check': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path>";
    };
    readonly 'shopping-cart-plus': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M13 9v6\"></path><path d=\"M10 12h6\"></path>";
    };
    readonly warehouse: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path>";
    };
    readonly billable: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path><path d=\"M18 18l3 3\"></path>";
    };
    readonly billing: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly checkout: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path><path d=\"M4 22h16\"></path>";
    };
    readonly dispute: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M12 13v2\"></path><path d=\"M12 17h.01\"></path><path d=\"m16 14 3 3\"></path><path d=\"m19 14-3 3\"></path>";
    };
    readonly dunning: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 14v3\"></path><path d=\"M15 20h.01\"></path>";
    };
    readonly estimate: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M8 9h4\"></path>";
    };
    readonly 'payment-failed': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"m9 13 6 4\"></path><path d=\"m15 13-6 4\"></path>";
    };
    readonly 'payment-link': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15a3 3 0 0 0 4.2 0l1-1a3 3 0 0 0-4.2-4.2l-.6.6\"></path>";
    };
    readonly 'payment-method': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h4\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly payout: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path>";
    };
    readonly 'price-tag': {
        readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path><path d=\"M12 8h4\"></path>";
    };
    readonly quote: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h8\"></path><path d=\"M8 11h5\"></path><path d=\"m16 17 2 2 4-4\"></path>";
    };
    readonly subscription: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"M16 15a3 3 0 1 0 2.8 4\"></path><path d=\"M19 15v3h-3\"></path>";
    };
    readonly 'tax-receipt': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 17 6-6\"></path><circle cx=\"10\" cy=\"12\" r=\"1\"></circle><circle cx=\"14\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly usage: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 16V9\"></path><path d=\"M12 16v-4\"></path><path d=\"M16 16v-7\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly 'cart-abandoned': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M12 9v4\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'discount-code': {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly fulfillment: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M17 15h4\"></path>";
    };
    readonly inventory: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M10 8h4\"></path>";
    };
    readonly 'inventory-alert': {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M12 7v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'order-cancelled': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly 'order-check': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"m10 16 2 2 5-5\"></path>";
    };
    readonly 'order-pending': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pos-terminal': {
        readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"18\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h2\"></path><path d=\"M14 15h1\"></path>";
    };
    readonly procurement: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly 'purchase-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M8 8h3\"></path>";
    };
    readonly return: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"m21 8-6-4-6 4 6 4 6-4z\"></path><path d=\"M9 8v6l6 4 6-4V8\"></path>";
    };
    readonly 'shipment-track': {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle><path d=\"M10 3h8\"></path><path d=\"m15 1 3 2-3 2\"></path>";
    };
    readonly 'shipping-label': {
        readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path><path d=\"M6 3l12 18\"></path>";
    };
    readonly 'account-payable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 15h5\"></path><path d=\"m17 13 3 2-3 2\"></path>";
    };
    readonly 'account-receivable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M20 15h-5\"></path><path d=\"m18 13-3 2 3 2\"></path>";
    };
    readonly 'bill-pay': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 17 2 2 5-5\"></path>";
    };
    readonly 'card-terminal': {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h2\"></path><path d=\"M13 15h3\"></path><path d=\"M9 19h6\"></path>";
    };
    readonly 'cash-register': {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M9 14h.01\"></path><path d=\"M13 14h.01\"></path><path d=\"M17 14h.01\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly chargeback: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 16H6v-3\"></path><path d=\"M6 13a5 5 0 0 0 8 4\"></path><path d=\"M15 13h3v3\"></path><path d=\"M18 16a5 5 0 0 0-8-4\"></path>";
    };
    readonly 'credit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'debit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'delivery-note': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M15 16h5\"></path><path d=\"m18 14 2 2-2 2\"></path>";
    };
    readonly 'payment-scheduled': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pricing-table': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 5v14\"></path><path d=\"M15 5v14\"></path><path d=\"M6 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'revenue-recognition': {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17V9\"></path><path d=\"M12 17V5\"></path><path d=\"M18 17v-6\"></path><path d=\"M8 5h8\"></path><path d=\"M12 3v4\"></path>";
    };
    readonly 'sales-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly vendor: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><circle cx=\"17\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'billing-cycle': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h5\"></path><path d=\"M16 15a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 13v3h-3\"></path>";
    };
    readonly 'collection-case': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14v5\"></path><path d=\"M16 22h.01\"></path>";
    };
    readonly 'contract-value': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 13v6\"></path><path d=\"M18 15a2 2 0 0 0-2-1.5c-1 0-2 .5-2 1.5 0 2 4 .8 4 3 0 .9-1 1.5-2 1.5a3 3 0 0 1-2.5-1\"></path>";
    };
    readonly 'payment-gateway': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M17 11v2\"></path><path d=\"M17 17v2\"></path><path d=\"M13 15h2\"></path><path d=\"M19 15h2\"></path>";
    };
    readonly remittance: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path><path d=\"M6 15H3v-3\"></path><path d=\"m3 15 5-5\"></path>";
    };
    readonly 'revenue-ledger': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path><path d=\"M16 6v12\"></path>";
    };
    readonly sku: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path>";
    };
    readonly supplier: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><path d=\"M16 4h4\"></path>";
    };
    readonly 'tax-id': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle><path d=\"M8 7h4\"></path>";
    };
    readonly till: {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M7 18h10\"></path>";
    };
    readonly trial: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M12 11v5\"></path><path d=\"M9.5 13.5h5\"></path>";
    };
    readonly wholesale: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M9 5h6\"></path>";
    };
    readonly 'area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-5 3 3 5-7v12H7z\"></path>";
    };
    readonly 'bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16V9\"></path><path d=\"M12 16V5\"></path><path d=\"M17 16v-4\"></path>";
    };
    readonly chart: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly dashboard: {
        readonly body: "<path d=\"M4 13a8 8 0 1 1 16 0\"></path><path d=\"M12 13l4-4\"></path><path d=\"M5 19h14\"></path>";
    };
    readonly 'donut-chart': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v6\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'gauge-chart': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly histogram: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17v-5\"></path><path d=\"M11 17V7\"></path><path d=\"M15 17v-8\"></path><path d=\"M19 17v-3\"></path>";
    };
    readonly 'line-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path>";
    };
    readonly 'pie-chart': {
        readonly body: "<path d=\"M21 12A9 9 0 1 1 12 3v9h9z\"></path><path d=\"M12 3a9 9 0 0 1 9 9h-9V3z\"></path>";
    };
    readonly 'radar-chart': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"m12 7 4 3v4l-4 3-4-3v-4l4-3z\"></path><path d=\"M12 3v18\"></path><path d=\"M4 8l16 8\"></path><path d=\"M20 8 4 16\"></path>";
    };
    readonly 'scatter-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"10\" r=\"1.5\"></circle><circle cx=\"17\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"16\" r=\"1.5\"></circle>";
    };
    readonly sparkline: {
        readonly body: "<path d=\"m3 16 4-4 3 2 4-6 3 4 4-5\"></path>";
    };
    readonly 'chart-candlestick': {
        readonly body: "<path d=\"M4 3v18h17\"></path><path d=\"M8 7v8\"></path><rect x=\"6\" y=\"9\" width=\"4\" height=\"4\"></rect><path d=\"M14 5v11\"></path><rect x=\"12\" y=\"7\" width=\"4\" height=\"6\"></rect><path d=\"M20 10v8\"></path><rect x=\"18\" y=\"12\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'chart-column': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect>";
    };
    readonly 'chart-no-axes': {
        readonly body: "<path d=\"m4 16 4-5 3 3 4-7 5 4\"></path><circle cx=\"8\" cy=\"11\" r=\"1\"></circle><circle cx=\"15\" cy=\"7\" r=\"1\"></circle><circle cx=\"20\" cy=\"11\" r=\"1\"></circle>";
    };
    readonly 'chart-stacked': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M7 12h10\"></path>";
    };
    readonly 'axis-x': {
        readonly body: "<path d=\"M3 18h18\"></path><path d=\"m18 15 3 3-3 3\"></path><path d=\"M7 6v12\"></path><path d=\"M12 10v8\"></path><path d=\"M17 13v5\"></path>";
    };
    readonly 'axis-y': {
        readonly body: "<path d=\"M6 21V3\"></path><path d=\"m3 6 3-3 3 3\"></path><path d=\"M6 18h12\"></path><path d=\"M6 13h8\"></path><path d=\"M6 8h5\"></path>";
    };
    readonly 'bubble-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"2\"></circle><circle cx=\"14\" cy=\"10\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"1.5\"></circle>";
    };
    readonly 'chart-combo': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path><path d=\"M7 17v-4\"></path><path d=\"M12 17v-7\"></path><path d=\"M17 17v-5\"></path>";
    };
    readonly 'chart-network': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path>";
    };
    readonly 'chart-spline': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16c3-8 6 4 9-4 1-3 3-5 5-5\"></path>";
    };
    readonly 'chart-step': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-5h4V7h5\"></path>";
    };
    readonly 'conversion-funnel': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M8 9h8\"></path>";
    };
    readonly dial: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l3-5\"></path><path d=\"M7 19h10\"></path><path d=\"M7 15h.01\"></path><path d=\"M17 15h.01\"></path>";
    };
    readonly forecast: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M18 7h3v3\"></path><path d=\"M7 8h.01\"></path><path d=\"M11 6h.01\"></path><path d=\"M15 5h.01\"></path>";
    };
    readonly 'funnel-chart': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly heatmap: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"3\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"10\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"10\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"17\" y=\"17\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'horizontal-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 8h10\"></path><path d=\"M7 12h14\"></path><path d=\"M7 16h7\"></path>";
    };
    readonly kpi: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 14h3\"></path><path d=\"M12 14h5\"></path><path d=\"m7 10 3 2 3-4 4 3\"></path>";
    };
    readonly meter: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M8 19h8\"></path><path d=\"M6 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'progress-ring': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v4\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
    };
    readonly regression: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"7\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"11\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"8\" r=\"1.5\"></circle><path d=\"M6 17 19 6\"></path>";
    };
    readonly scorecard: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M7 9h5\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h7\"></path><circle cx=\"17\" cy=\"9\" r=\"1\"></circle>";
    };
    readonly 'stacked-area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7v10H6z\"></path><path d=\"m6 17 4-3 4 1 4-4\"></path>";
    };
    readonly 'table-chart': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m6 17 3-3 3 2 5-5\"></path>";
    };
    readonly treemap: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M3 12h9\"></path><path d=\"M12 9h9\"></path><path d=\"M16 9v11\"></path>";
    };
    readonly 'trend-down': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 4\"></path><path d=\"M19 9v4h-4\"></path>";
    };
    readonly 'trend-up': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 5-5 4 4 4-8\"></path><path d=\"M15 7h4v4\"></path>";
    };
    readonly 'ab-test': {
        readonly body: "<path d=\"M4 19 8 5h2l4 14\"></path><path d=\"M6 14h6\"></path><path d=\"M15 5h3a3 3 0 0 1 0 6h-3V5z\"></path><path d=\"M15 11h4a4 4 0 0 1 0 8h-4v-8z\"></path>";
    };
    readonly cohort: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"9\" r=\"2\"></circle><circle cx=\"14\" cy=\"8\" r=\"2\"></circle><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M8 11v6\"></path><path d=\"M14 10v7\"></path><path d=\"M17 17v1\"></path>";
    };
    readonly experiment: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly 'goal-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"15\" cy=\"9\" r=\"5\"></circle><circle cx=\"15\" cy=\"9\" r=\"2\"></circle><path d=\"m7 17 4-4 2 2 6-6\"></path>";
    };
    readonly 'growth-loop': {
        readonly body: "<path d=\"M17 3h4v4\"></path><path d=\"M21 3 14 10\"></path><path d=\"M7 21H3v-4\"></path><path d=\"M3 21l7-7\"></path><path d=\"M4 9a8 8 0 0 1 13-4\"></path><path d=\"M20 15a8 8 0 0 1-13 4\"></path>";
    };
    readonly retention: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16c2-7 5-7 7 0 1.5 4 3.5 2 5-3\"></path><path d=\"M7 8h.01\"></path><path d=\"M12 8h.01\"></path><path d=\"M17 8h.01\"></path>";
    };
    readonly segment: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 3v9h9\"></path><path d=\"M12 12 6 18\"></path>";
    };
    readonly 'target-metric': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><path d=\"M17 7h4v4\"></path><path d=\"m21 7-5 5\"></path>";
    };
    readonly activation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17V6\"></path><path d=\"m14 9 3-3 3 3\"></path>";
    };
    readonly benchmark: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h12\"></path><path d=\"M6 12h8\"></path><path d=\"M6 8h4\"></path><path d=\"M18 5v14\"></path>";
    };
    readonly churn: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 6\"></path><path d=\"M19 11v4h-4\"></path>";
    };
    readonly 'expansion-revenue': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17V7\"></path><path d=\"M17 17V5\"></path><path d=\"m15 7 2-2 2 2\"></path>";
    };
    readonly 'forecast-band': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7\"></path><path d=\"m6 13 4-4 4 2 4-5\"></path><path d=\"m6 20 4-5 4 4 4-8\"></path>";
    };
    readonly ltv: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M6 8h3\"></path><path d=\"M6 11h5\"></path><path d=\"M17 7h4v4\"></path>";
    };
    readonly mrr: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17V9l3 4 3-4v8\"></path><path d=\"M15 17V9h3a2 2 0 0 1 0 4h-3\"></path><path d=\"m18 13 3 4\"></path>";
    };
    readonly nps: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 15a5 5 0 0 1 10 0\"></path><path d=\"M7 9h.01\"></path><path d=\"M17 9h.01\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly 'revenue-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly roi: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 16 4-4 3 3 4-7\"></path><path d=\"m16 8 2-2 2 2\"></path><path d=\"M8 8h.01\"></path><path d=\"M12 8h.01\"></path>";
    };
    readonly 'session-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-4\"></path><path d=\"M17 17V6\"></path><circle cx=\"17\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'win-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 3 3 7-10\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h3\"></path><path d=\"M17 8h4v4\"></path>";
    };
    readonly 'adoption-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-6\"></path><path d=\"M17 17V7\"></path><path d=\"m14 10 3-3 3 3\"></path>";
    };
    readonly 'capacity-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"8\" width=\"3\" height=\"9\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"11\"></rect><rect x=\"16\" y=\"11\" width=\"3\" height=\"6\"></rect><path d=\"M6 5h13\"></path>";
    };
    readonly 'cohort-grid': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"6\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"16\" width=\"3\" height=\"3\"></rect>";
    };
    readonly 'contribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"M7 8h10\"></path><path d=\"M12 12h5\"></path>";
    };
    readonly 'dependency-chart': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'error-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-5 3 4 5-8\"></path><path d=\"M16 14l4 4\"></path><path d=\"m20 14-4 4\"></path>";
    };
    readonly latency: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path><path d=\"M12 3v3\"></path><path d=\"M4 15h3\"></path><path d=\"M17 15h3\"></path>";
    };
    readonly percentile: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-7 4 3 4-8\"></path><path d=\"M6 12h12\"></path><path d=\"M6 8h8\"></path>";
    };
    readonly saturation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-3\"></path><path d=\"M5 7h14\"></path><path d=\"M5 13h14\"></path>";
    };
    readonly 'throughput-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-4h4V8h5\"></path><path d=\"m16 5 3 3-3 3\"></path>";
    };
    readonly 'vertical-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 17V9\"></path><path d=\"M12 17V6\"></path><path d=\"M16 17v-5\"></path>";
    };
    readonly 'waterfall-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"12\" width=\"3\" height=\"5\"></rect><rect x=\"11\" y=\"8\" width=\"3\" height=\"4\"></rect><rect x=\"16\" y=\"10\" width=\"3\" height=\"7\"></rect><path d=\"M9 12h2\"></path><path d=\"M14 10h2\"></path>";
    };
    readonly 'anomaly-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle><path d=\"M18 4v1\"></path><path d=\"M18 9v1\"></path>";
    };
    readonly 'baseline-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 12h13\"></path><path d=\"m6 16 4-5 4 3 5-7\"></path>";
    };
    readonly 'box-plot': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 7v10\"></path><rect x=\"6\" y=\"10\" width=\"4\" height=\"4\"></rect><path d=\"M16 5v14\"></path><rect x=\"14\" y=\"8\" width=\"4\" height=\"7\"></rect>";
    };
    readonly 'burndown-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 7 4 4 3 2 5 4\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'burnup-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-4 3-2 5-4\"></path><path d=\"M6 7h12\"></path>";
    };
    readonly 'control-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 8h13\"></path><path d=\"M6 16h13\"></path><path d=\"m6 12 4-2 4 4 5-2\"></path>";
    };
    readonly 'distribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17c2-8 4-8 6 0 2-8 4-8 6 0\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'gantt-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 7h7\"></path><path d=\"M10 12h8\"></path><path d=\"M6 17h10\"></path><path d=\"M7 5v14\"></path>";
    };
    readonly 'health-score': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 9h2l2 5 2-8 2 3h2\"></path>";
    };
    readonly 'leaderboard-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect><path d=\"M12 4h1\"></path>";
    };
    readonly 'map-chart': {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'matrix-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"5\"></rect>";
    };
    readonly 'pareto-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"m6 8 4 3 4-1 5-5\"></path>";
    };
    readonly 'sankey-chart': {
        readonly body: "<path d=\"M4 7h5\"></path><path d=\"M4 17h5\"></path><path d=\"M15 12h5\"></path><path d=\"M9 7c4 0 2 5 6 5\"></path><path d=\"M9 17c4 0 2-5 6-5\"></path><rect x=\"3\" y=\"5\" width=\"2\" height=\"4\"></rect><rect x=\"19\" y=\"10\" width=\"2\" height=\"4\"></rect>";
    };
    readonly 'bullet-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"9\" width=\"12\" height=\"6\"></rect><path d=\"M6 12h9\"></path><path d=\"M16 7v10\"></path>";
    };
    readonly 'funnel-stage': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path><circle cx=\"18\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly 'metric-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h5\"></path><path d=\"M7 14h10\"></path><path d=\"m14 10 2-2 3 3\"></path><path d=\"M16 8v6\"></path>";
    };
    readonly 'pivot-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><path d=\"M13 15h5\"></path><path d=\"m16 12 2 3-2 3\"></path>";
    };
    readonly 'variance-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M6 12h13\"></path><path d=\"m17 8 2 2 2-2\"></path>";
    };
    readonly 'arrow-down': {
        readonly body: "<path d=\"M12 5v14\"></path><path d=\"m19 12-7 7-7-7\"></path>";
    };
    readonly 'arrow-left': {
        readonly body: "<path d=\"M19 12H5\"></path><path d=\"m12 19-7-7 7-7\"></path>";
    };
    readonly 'arrow-right': {
        readonly body: "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>";
    };
    readonly 'arrow-up': {
        readonly body: "<path d=\"M12 19V5\"></path><path d=\"m5 12 7-7 7 7\"></path>";
    };
    readonly bot: {
        readonly body: "<rect x=\"5\" y=\"8\" width=\"14\" height=\"10\" rx=\"3\"></rect><path d=\"M12 8V4\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M9 18v2\"></path><path d=\"M15 18v2\"></path>";
    };
    readonly check: {
        readonly body: "<path d=\"m20 6-11 11-5-5\"></path>";
    };
    readonly 'check-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'chevron-down': {
        readonly body: "<path d=\"m6 9 6 6 6-6\"></path>";
    };
    readonly 'chevron-left': {
        readonly body: "<path d=\"m15 18-6-6 6-6\"></path>";
    };
    readonly 'chevron-right': {
        readonly body: "<path d=\"m9 18 6-6-6-6\"></path>";
    };
    readonly 'chevron-up': {
        readonly body: "<path d=\"m18 15-6-6-6 6\"></path>";
    };
    readonly 'circle-dot': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly close: {
        readonly body: "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>";
    };
    readonly code: {
        readonly body: "<path d=\"m16 18 6-6-6-6\"></path><path d=\"m8 6-6 6 6 6\"></path>";
    };
    readonly drag: {
        readonly body: "<path d=\"M9 5h.01\"></path><path d=\"M15 5h.01\"></path><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M9 19h.01\"></path><path d=\"M15 19h.01\"></path>";
    };
    readonly 'external-link': {
        readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>";
    };
    readonly grid: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect>";
    };
    readonly hash: {
        readonly body: "<path d=\"M5 9h14\"></path><path d=\"M4 15h14\"></path><path d=\"M10 3 8 21\"></path><path d=\"M16 3l-2 18\"></path>";
    };
    readonly home: {
        readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path>";
    };
    readonly maximize: {
        readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path>";
    };
    readonly menu: {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly minus: {
        readonly body: "<path d=\"M5 12h14\"></path>";
    };
    readonly moon: {
        readonly body: "<path d=\"M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z\"></path>";
    };
    readonly 'more-horizontal': {
        readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'more-vertical': {
        readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
    };
    readonly pause: {
        readonly body: "<path d=\"M8 5v14\"></path><path d=\"M16 5v14\"></path>";
    };
    readonly play: {
        readonly body: "<path d=\"m8 5 11 7-11 7V5z\"></path>";
    };
    readonly plus: {
        readonly body: "<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>";
    };
    readonly redo: {
        readonly body: "<path d=\"M21 7v6h-6\"></path><path d=\"M21 13a8 8 0 1 0-2.3 5.7\"></path>";
    };
    readonly search: {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path>";
    };
    readonly settings: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z\"></path>";
    };
    readonly sidebar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
    };
    readonly spark: {
        readonly body: "<path d=\"m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z\"></path><path d=\"m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z\"></path>";
    };
    readonly star: {
        readonly body: "<path d=\"m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z\"></path>";
    };
    readonly sun: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"M4.9 4.9l1.4 1.4\"></path><path d=\"M17.7 17.7l1.4 1.4\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"M4.9 19.1l1.4-1.4\"></path><path d=\"M17.7 6.3l1.4-1.4\"></path>";
    };
    readonly terminal: {
        readonly body: "<path d=\"m4 17 6-5-6-5\"></path><path d=\"M12 19h8\"></path>";
    };
    readonly theme: {
        readonly body: "<path d=\"M4 21v-7\"></path><path d=\"M4 10V3\"></path><path d=\"M12 21v-9\"></path><path d=\"M12 8V3\"></path><path d=\"M20 21v-5\"></path><path d=\"M20 12V3\"></path><path d=\"M2 14h4\"></path><path d=\"M10 8h4\"></path><path d=\"M18 16h4\"></path>";
    };
    readonly 'arrow-down-left': {
        readonly body: "<path d=\"M17 7 7 17\"></path><path d=\"M17 17H7V7\"></path>";
    };
    readonly 'arrow-down-right': {
        readonly body: "<path d=\"m7 7 10 10\"></path><path d=\"M7 17h10V7\"></path>";
    };
    readonly 'arrow-up-left': {
        readonly body: "<path d=\"M17 17 7 7\"></path><path d=\"M7 17V7h10\"></path>";
    };
    readonly 'arrow-up-right': {
        readonly body: "<path d=\"M7 17 17 7\"></path><path d=\"M7 7h10v10\"></path>";
    };
    readonly 'chevrons-down': {
        readonly body: "<path d=\"m7 7 5 5 5-5\"></path><path d=\"m7 13 5 5 5-5\"></path>";
    };
    readonly 'chevrons-left': {
        readonly body: "<path d=\"m11 17-5-5 5-5\"></path><path d=\"m18 17-5-5 5-5\"></path>";
    };
    readonly 'chevrons-right': {
        readonly body: "<path d=\"m6 17 5-5-5-5\"></path><path d=\"m13 17 5-5-5-5\"></path>";
    };
    readonly 'chevrons-up': {
        readonly body: "<path d=\"m7 17 5-5 5 5\"></path><path d=\"m7 11 5-5 5 5\"></path>";
    };
    readonly columns: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
    };
    readonly 'corner-down-left': {
        readonly body: "<path d=\"M9 10 4 15l5 5\"></path><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"></path>";
    };
    readonly 'corner-down-right': {
        readonly body: "<path d=\"m15 10 5 5-5 5\"></path><path d=\"M4 4v7a4 4 0 0 0 4 4h12\"></path>";
    };
    readonly 'corner-up-left': {
        readonly body: "<path d=\"M9 14 4 9l5-5\"></path><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\"></path>";
    };
    readonly 'corner-up-right': {
        readonly body: "<path d=\"m15 14 5-5-5-5\"></path><path d=\"M4 20v-7a4 4 0 0 1 4-4h12\"></path>";
    };
    readonly 'layout-dashboard': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"3\" width=\"8\" height=\"5\" rx=\"2\"></rect><rect x=\"13\" y=\"10\" width=\"8\" height=\"11\" rx=\"2\"></rect><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"2\"></rect>";
    };
    readonly 'layout-list': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"12\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"19\" width=\"18\" height=\"2\" rx=\"1\"></rect>";
    };
    readonly 'layout-panel-left': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M13 8h4\"></path><path d=\"M13 12h5\"></path>";
    };
    readonly 'layout-panel-top': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'panel-bottom': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 14h18\"></path>";
    };
    readonly 'panel-left': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
    };
    readonly 'panel-right': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path>";
    };
    readonly 'panel-top': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path>";
    };
    readonly 'play-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m10 8 6 4-6 4V8z\"></path>";
    };
    readonly 'plus-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'plus-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly power: {
        readonly body: "<path d=\"M12 2v10\"></path><path d=\"M18.4 6.6a9 9 0 1 1-12.8 0\"></path>";
    };
    readonly 'rotate-clockwise': {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-2.6-6.4\"></path><path d=\"M21 3v6h-6\"></path>";
    };
    readonly 'search-check': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8 11 2 2 4-4\"></path>";
    };
    readonly 'search-x': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8.5 8.5 5 5\"></path><path d=\"m13.5 8.5-5 5\"></path>";
    };
    readonly 'square-dot': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'square-stack': {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path>";
    };
    readonly stop: {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1\"></rect>";
    };
    readonly 'stop-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"></rect>";
    };
    readonly undo: {
        readonly body: "<path d=\"M3 7v6h6\"></path><path d=\"M3 13a8 8 0 1 1 2.3 5.7\"></path>";
    };
    readonly 'arrow-left-right': {
        readonly body: "<path d=\"M8 7 3 12l5 5\"></path><path d=\"M3 12h18\"></path><path d=\"m16 7 5 5-5 5\"></path>";
    };
    readonly 'arrow-up-down': {
        readonly body: "<path d=\"M7 8 12 3l5 5\"></path><path d=\"M12 3v18\"></path><path d=\"m7 16 5 5 5-5\"></path>";
    };
    readonly ban: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6 18.4 18.4\"></path>";
    };
    readonly 'check-check': {
        readonly body: "<path d=\"m3 12 3 3 5-6\"></path><path d=\"m12 12 3 3 6-8\"></path>";
    };
    readonly circle: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
    };
    readonly 'circle-alert': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'circle-help': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly ellipsis: {
        readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'ellipsis-vertical': {
        readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
    };
    readonly maximize2: {
        readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"m21 3-7 7\"></path><path d=\"M9 21H3v-6\"></path><path d=\"m3 21 7-7\"></path>";
    };
    readonly minimize: {
        readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path><path d=\"M8 8h8v8H8z\"></path>";
    };
    readonly minimize2: {
        readonly body: "<path d=\"M4 14h6v6\"></path><path d=\"m10 14-7 7\"></path><path d=\"M20 10h-6V4\"></path><path d=\"m14 10 7-7\"></path>";
    };
    readonly move: {
        readonly body: "<path d=\"M12 2v20\"></path><path d=\"m8 6 4-4 4 4\"></path><path d=\"m8 18 4 4 4-4\"></path><path d=\"M2 12h20\"></path><path d=\"m6 8-4 4 4 4\"></path><path d=\"m18 8 4 4-4 4\"></path>";
    };
    readonly 'move-horizontal': {
        readonly body: "<path d=\"M4 12h16\"></path><path d=\"m8 8-4 4 4 4\"></path><path d=\"m16 8 4 4-4 4\"></path>";
    };
    readonly 'move-vertical': {
        readonly body: "<path d=\"M12 4v16\"></path><path d=\"m8 8 4-4 4 4\"></path><path d=\"m8 16 4 4 4-4\"></path>";
    };
    readonly 'panel-close': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path>";
    };
    readonly 'panel-open': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path>";
    };
    readonly pin: {
        readonly body: "<path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2H5v-2l4-4-1-6z\"></path>";
    };
    readonly 'pin-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2h-4\"></path><path d=\"M9 15H5v-2l3-3\"></path>";
    };
    readonly 'rotate-counter-clockwise': {
        readonly body: "<path d=\"M3 12a9 9 0 1 0 2.6-6.4\"></path><path d=\"M3 3v6h6\"></path>";
    };
    readonly scan: {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 12h10\"></path>";
    };
    readonly 'scan-line': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M3 12h18\"></path>";
    };
    readonly select: {
        readonly body: "<path d=\"M4 4h16v16H4z\"></path><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'toggle-left': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'toggle-right': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"16\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly checkbox: {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect>";
    };
    readonly 'checkbox-checked': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'checkbox-minus': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 12h8\"></path>";
    };
    readonly 'field-required': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m16.5 7.5 1 1\"></path><path d=\"m17.5 7.5-1 1\"></path>";
    };
    readonly input: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h10\"></path>";
    };
    readonly 'input-error': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h7\"></path><path d=\"m16 10 3 3\"></path><path d=\"m19 10-3 3\"></path>";
    };
    readonly 'input-password': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 14v2\"></path>";
    };
    readonly 'input-search': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"10\" cy=\"12\" r=\"2\"></circle><path d=\"m12 14 3 2\"></path>";
    };
    readonly 'radio-checked': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
    };
    readonly 'radio-unchecked': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
    };
    readonly textarea: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'validation-error': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly breadcrumb: {
        readonly body: "<path d=\"M3 12h4\"></path><path d=\"m7 8 4 4-4 4\"></path><path d=\"M11 12h4\"></path><path d=\"m15 8 4 4-4 4\"></path><path d=\"M19 12h2\"></path>";
    };
    readonly 'command-palette': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"m7 13 3 2-3 2\"></path><path d=\"M12 17h5\"></path>";
    };
    readonly 'density-comfortable': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
    };
    readonly 'density-compact': {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"16\" width=\"16\" height=\"3\" rx=\"1\"></rect>";
    };
    readonly 'empty-box': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'empty-search': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly 'empty-state': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 10h8\"></path><path d=\"M9 14h6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'focus-mode': {
        readonly body: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"></path><path d=\"M16 3h3a2 2 0 0 1 2 2v3\"></path><path d=\"M21 16v3a2 2 0 0 1-2 2h-3\"></path><path d=\"M8 21H5a2 2 0 0 1-2-2v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly loading: {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path><path d=\"M21 12h-4\"></path>";
    };
    readonly 'nav-back': {
        readonly body: "<path d=\"M15 6 9 12l6 6\"></path><path d=\"M9 12h12\"></path><path d=\"M3 5v14\"></path>";
    };
    readonly 'nav-forward': {
        readonly body: "<path d=\"m9 6 6 6-6 6\"></path><path d=\"M3 12h12\"></path><path d=\"M21 5v14\"></path>";
    };
    readonly 'quick-action': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M13 3 7 14h5l-1 7 6-11h-5l1-7z\"></path>";
    };
    readonly 'sidebar-collapse': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path><path d=\"m19 9-3 3 3 3\"></path>";
    };
    readonly 'sidebar-expand': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path><path d=\"m16 9 3 3-3 3\"></path>";
    };
    readonly shortcut: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h6\"></path><path d=\"M15 13h2\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly skeleton: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"3\" rx=\"1.5\"></rect><rect x=\"4\" y=\"16\" width=\"14\" height=\"3\" rx=\"1.5\"></rect>";
    };
    readonly 'split-view': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M7 9h2\"></path><path d=\"M15 9h2\"></path><path d=\"M7 14h2\"></path><path d=\"M15 14h2\"></path>";
    };
    readonly spotlight: {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m11 6 1.2 3.3 3.3 1.2-3.3 1.2L11 15l-1.2-3.3L6.5 10.5l3.3-1.2L11 6z\"></path>";
    };
    readonly 'state-error': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'state-success': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'state-warning': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly tour: {
        readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"M9 8h6\"></path><path d=\"M9 11h4\"></path><path d=\"m18 17 3 3\"></path>";
    };
    readonly 'app-launcher': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"4\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect>";
    };
    readonly 'app-shell': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M8 9v11\"></path><path d=\"M12 13h5\"></path><path d=\"M12 17h4\"></path>";
    };
    readonly 'bottom-sheet': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M4 13h16\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10h4\"></path>";
    };
    readonly 'command-key': {
        readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
    };
    readonly dock: {
        readonly body: "<rect x=\"4\" y=\"16\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"6\" y=\"6\" width=\"3\" height=\"7\" rx=\"1\"></rect><rect x=\"11\" y=\"4\" width=\"3\" height=\"9\" rx=\"1\"></rect><rect x=\"16\" y=\"8\" width=\"3\" height=\"5\" rx=\"1\"></rect>";
    };
    readonly 'floating-action': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 18l3 3\"></path>";
    };
    readonly gesture: {
        readonly body: "<path d=\"M7 14c2-6 5-8 8-6 2 1 3 4 2 7\"></path><path d=\"M7 14l3 3\"></path><path d=\"M7 14l-3 3\"></path><path d=\"M12 21c3-1 5-3 6-6\"></path>";
    };
    readonly inspector: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M14 4v16\"></path><path d=\"M17 8h2\"></path><path d=\"M17 12h2\"></path><path d=\"M17 16h1\"></path><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly launcher: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m12 6 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z\"></path>";
    };
    readonly navigator: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path><path d=\"M12 3v3\"></path><path d=\"M12 18v3\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
    };
    readonly onboarding: {
        readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"m9 9 2 2 4-4\"></path><path d=\"M19 17l2 2\"></path>";
    };
    readonly resizer: {
        readonly body: "<path d=\"M4 14v6h6\"></path><path d=\"M20 10V4h-6\"></path><path d=\"m14 4 6 6\"></path><path d=\"m4 14 6 6\"></path><path d=\"M8 16l8-8\"></path>";
    };
    readonly 'shell-command': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"M12 15h5\"></path><path d=\"M3 9h18\"></path>";
    };
    readonly stepper: {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"12\" r=\"3\"></circle><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path>";
    };
    readonly 'status-bar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 16h18\"></path><path d=\"M7 18h.01\"></path><path d=\"M11 18h4\"></path><path d=\"M17 18h.01\"></path>";
    };
    readonly 'touch-target': {
        readonly body: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v3\"></path><path d=\"M12 19v3\"></path><path d=\"M2 12h3\"></path><path d=\"M19 12h3\"></path>";
    };
    readonly wizard: {
        readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"M7 5h4\"></path><path d=\"M7 9h2\"></path>";
    };
    readonly 'workspace-switcher': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"13\" y=\"12\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M11 8h3a3 3 0 0 1 3 3v1\"></path><path d=\"M13 16h-3a3 3 0 0 1-3-3v-1\"></path>";
    };
    readonly 'action-bar': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h.01\"></path><path d=\"M11 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'context-panel': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M13 4v16\"></path><path d=\"M16 8h2\"></path><path d=\"M16 12h2\"></path><path d=\"M16 16h1\"></path>";
    };
    readonly 'filter-chip': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\"></rect><path d=\"M8 12h6\"></path><path d=\"m16 10 2 2-2 2\"></path>";
    };
    readonly 'keyboard-shortcut': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h3\"></path><path d=\"M12 13h5\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'side-panel': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h4\"></path><path d=\"M7 16h3\"></path>";
    };
    readonly 'top-bar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h6\"></path>";
    };
    readonly 'x-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly 'zoom-in': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M11 8v6\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly 'zoom-out': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly batoi: {
        readonly body: "<path fill=\"currentColor\" stroke=\"none\" d=\"M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z\"></path><path fill=\"currentColor\" stroke=\"none\" d=\"M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z\"></path>";
    };
    readonly uif: {
        readonly body: "<path d=\"M18 16 L18 38 Q18 52 32 52 Q46 52 46 38 L46 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><rect x=\"46\" y=\"12\" width=\"12\" height=\"12\" rx=\"3\" fill=\"currentColor\" stroke=\"none\"></rect>";
        readonly viewBox: "0 0 64 64";
    };
};
type IconName = keyof typeof icons;

declare const brandIcons: {
    readonly batoi: {
        readonly body: "<path fill=\"currentColor\" stroke=\"none\" d=\"M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z\"></path><path fill=\"currentColor\" stroke=\"none\" d=\"M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z\"></path>";
    };
    readonly uif: {
        readonly body: "<path d=\"M18 16 L18 38 Q18 52 32 52 Q46 52 46 38 L46 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><rect x=\"46\" y=\"12\" width=\"12\" height=\"12\" rx=\"3\" fill=\"currentColor\" stroke=\"none\"></rect>";
        readonly viewBox: "0 0 64 64";
    };
};

declare const coreUiIcons: {
    readonly 'arrow-down': {
        readonly body: "<path d=\"M12 5v14\"></path><path d=\"m19 12-7 7-7-7\"></path>";
    };
    readonly 'arrow-left': {
        readonly body: "<path d=\"M19 12H5\"></path><path d=\"m12 19-7-7 7-7\"></path>";
    };
    readonly 'arrow-right': {
        readonly body: "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>";
    };
    readonly 'arrow-up': {
        readonly body: "<path d=\"M12 19V5\"></path><path d=\"m5 12 7-7 7 7\"></path>";
    };
    readonly bot: {
        readonly body: "<rect x=\"5\" y=\"8\" width=\"14\" height=\"10\" rx=\"3\"></rect><path d=\"M12 8V4\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M9 18v2\"></path><path d=\"M15 18v2\"></path>";
    };
    readonly check: {
        readonly body: "<path d=\"m20 6-11 11-5-5\"></path>";
    };
    readonly 'check-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'chevron-down': {
        readonly body: "<path d=\"m6 9 6 6 6-6\"></path>";
    };
    readonly 'chevron-left': {
        readonly body: "<path d=\"m15 18-6-6 6-6\"></path>";
    };
    readonly 'chevron-right': {
        readonly body: "<path d=\"m9 18 6-6-6-6\"></path>";
    };
    readonly 'chevron-up': {
        readonly body: "<path d=\"m18 15-6-6-6 6\"></path>";
    };
    readonly 'circle-dot': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly close: {
        readonly body: "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>";
    };
    readonly code: {
        readonly body: "<path d=\"m16 18 6-6-6-6\"></path><path d=\"m8 6-6 6 6 6\"></path>";
    };
    readonly drag: {
        readonly body: "<path d=\"M9 5h.01\"></path><path d=\"M15 5h.01\"></path><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M9 19h.01\"></path><path d=\"M15 19h.01\"></path>";
    };
    readonly 'external-link': {
        readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>";
    };
    readonly grid: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect>";
    };
    readonly hash: {
        readonly body: "<path d=\"M5 9h14\"></path><path d=\"M4 15h14\"></path><path d=\"M10 3 8 21\"></path><path d=\"M16 3l-2 18\"></path>";
    };
    readonly home: {
        readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path>";
    };
    readonly maximize: {
        readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path>";
    };
    readonly menu: {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly minus: {
        readonly body: "<path d=\"M5 12h14\"></path>";
    };
    readonly moon: {
        readonly body: "<path d=\"M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z\"></path>";
    };
    readonly 'more-horizontal': {
        readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'more-vertical': {
        readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
    };
    readonly pause: {
        readonly body: "<path d=\"M8 5v14\"></path><path d=\"M16 5v14\"></path>";
    };
    readonly play: {
        readonly body: "<path d=\"m8 5 11 7-11 7V5z\"></path>";
    };
    readonly plus: {
        readonly body: "<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>";
    };
    readonly redo: {
        readonly body: "<path d=\"M21 7v6h-6\"></path><path d=\"M21 13a8 8 0 1 0-2.3 5.7\"></path>";
    };
    readonly search: {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path>";
    };
    readonly settings: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z\"></path>";
    };
    readonly sidebar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
    };
    readonly spark: {
        readonly body: "<path d=\"m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z\"></path><path d=\"m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z\"></path>";
    };
    readonly star: {
        readonly body: "<path d=\"m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z\"></path>";
    };
    readonly sun: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"M4.9 4.9l1.4 1.4\"></path><path d=\"M17.7 17.7l1.4 1.4\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"M4.9 19.1l1.4-1.4\"></path><path d=\"M17.7 6.3l1.4-1.4\"></path>";
    };
    readonly terminal: {
        readonly body: "<path d=\"m4 17 6-5-6-5\"></path><path d=\"M12 19h8\"></path>";
    };
    readonly theme: {
        readonly body: "<path d=\"M4 21v-7\"></path><path d=\"M4 10V3\"></path><path d=\"M12 21v-9\"></path><path d=\"M12 8V3\"></path><path d=\"M20 21v-5\"></path><path d=\"M20 12V3\"></path><path d=\"M2 14h4\"></path><path d=\"M10 8h4\"></path><path d=\"M18 16h4\"></path>";
    };
    readonly 'arrow-down-left': {
        readonly body: "<path d=\"M17 7 7 17\"></path><path d=\"M17 17H7V7\"></path>";
    };
    readonly 'arrow-down-right': {
        readonly body: "<path d=\"m7 7 10 10\"></path><path d=\"M7 17h10V7\"></path>";
    };
    readonly 'arrow-up-left': {
        readonly body: "<path d=\"M17 17 7 7\"></path><path d=\"M7 17V7h10\"></path>";
    };
    readonly 'arrow-up-right': {
        readonly body: "<path d=\"M7 17 17 7\"></path><path d=\"M7 7h10v10\"></path>";
    };
    readonly 'chevrons-down': {
        readonly body: "<path d=\"m7 7 5 5 5-5\"></path><path d=\"m7 13 5 5 5-5\"></path>";
    };
    readonly 'chevrons-left': {
        readonly body: "<path d=\"m11 17-5-5 5-5\"></path><path d=\"m18 17-5-5 5-5\"></path>";
    };
    readonly 'chevrons-right': {
        readonly body: "<path d=\"m6 17 5-5-5-5\"></path><path d=\"m13 17 5-5-5-5\"></path>";
    };
    readonly 'chevrons-up': {
        readonly body: "<path d=\"m7 17 5-5 5 5\"></path><path d=\"m7 11 5-5 5 5\"></path>";
    };
    readonly columns: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
    };
    readonly 'corner-down-left': {
        readonly body: "<path d=\"M9 10 4 15l5 5\"></path><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"></path>";
    };
    readonly 'corner-down-right': {
        readonly body: "<path d=\"m15 10 5 5-5 5\"></path><path d=\"M4 4v7a4 4 0 0 0 4 4h12\"></path>";
    };
    readonly 'corner-up-left': {
        readonly body: "<path d=\"M9 14 4 9l5-5\"></path><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\"></path>";
    };
    readonly 'corner-up-right': {
        readonly body: "<path d=\"m15 14 5-5-5-5\"></path><path d=\"M4 20v-7a4 4 0 0 1 4-4h12\"></path>";
    };
    readonly 'layout-dashboard': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"3\" width=\"8\" height=\"5\" rx=\"2\"></rect><rect x=\"13\" y=\"10\" width=\"8\" height=\"11\" rx=\"2\"></rect><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"2\"></rect>";
    };
    readonly 'layout-list': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"12\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"19\" width=\"18\" height=\"2\" rx=\"1\"></rect>";
    };
    readonly 'layout-panel-left': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M13 8h4\"></path><path d=\"M13 12h5\"></path>";
    };
    readonly 'layout-panel-top': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'panel-bottom': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 14h18\"></path>";
    };
    readonly 'panel-left': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
    };
    readonly 'panel-right': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path>";
    };
    readonly 'panel-top': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path>";
    };
    readonly 'play-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m10 8 6 4-6 4V8z\"></path>";
    };
    readonly 'plus-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'plus-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly power: {
        readonly body: "<path d=\"M12 2v10\"></path><path d=\"M18.4 6.6a9 9 0 1 1-12.8 0\"></path>";
    };
    readonly 'rotate-clockwise': {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-2.6-6.4\"></path><path d=\"M21 3v6h-6\"></path>";
    };
    readonly 'search-check': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8 11 2 2 4-4\"></path>";
    };
    readonly 'search-x': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8.5 8.5 5 5\"></path><path d=\"m13.5 8.5-5 5\"></path>";
    };
    readonly 'square-dot': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'square-stack': {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path>";
    };
    readonly stop: {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1\"></rect>";
    };
    readonly 'stop-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"></rect>";
    };
    readonly undo: {
        readonly body: "<path d=\"M3 7v6h6\"></path><path d=\"M3 13a8 8 0 1 1 2.3 5.7\"></path>";
    };
    readonly 'arrow-left-right': {
        readonly body: "<path d=\"M8 7 3 12l5 5\"></path><path d=\"M3 12h18\"></path><path d=\"m16 7 5 5-5 5\"></path>";
    };
    readonly 'arrow-up-down': {
        readonly body: "<path d=\"M7 8 12 3l5 5\"></path><path d=\"M12 3v18\"></path><path d=\"m7 16 5 5 5-5\"></path>";
    };
    readonly ban: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6 18.4 18.4\"></path>";
    };
    readonly 'check-check': {
        readonly body: "<path d=\"m3 12 3 3 5-6\"></path><path d=\"m12 12 3 3 6-8\"></path>";
    };
    readonly circle: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
    };
    readonly 'circle-alert': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'circle-help': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly ellipsis: {
        readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'ellipsis-vertical': {
        readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
    };
    readonly maximize2: {
        readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"m21 3-7 7\"></path><path d=\"M9 21H3v-6\"></path><path d=\"m3 21 7-7\"></path>";
    };
    readonly minimize: {
        readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path><path d=\"M8 8h8v8H8z\"></path>";
    };
    readonly minimize2: {
        readonly body: "<path d=\"M4 14h6v6\"></path><path d=\"m10 14-7 7\"></path><path d=\"M20 10h-6V4\"></path><path d=\"m14 10 7-7\"></path>";
    };
    readonly move: {
        readonly body: "<path d=\"M12 2v20\"></path><path d=\"m8 6 4-4 4 4\"></path><path d=\"m8 18 4 4 4-4\"></path><path d=\"M2 12h20\"></path><path d=\"m6 8-4 4 4 4\"></path><path d=\"m18 8 4 4-4 4\"></path>";
    };
    readonly 'move-horizontal': {
        readonly body: "<path d=\"M4 12h16\"></path><path d=\"m8 8-4 4 4 4\"></path><path d=\"m16 8 4 4-4 4\"></path>";
    };
    readonly 'move-vertical': {
        readonly body: "<path d=\"M12 4v16\"></path><path d=\"m8 8 4-4 4 4\"></path><path d=\"m8 16 4 4 4-4\"></path>";
    };
    readonly 'panel-close': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path>";
    };
    readonly 'panel-open': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path>";
    };
    readonly pin: {
        readonly body: "<path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2H5v-2l4-4-1-6z\"></path>";
    };
    readonly 'pin-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2h-4\"></path><path d=\"M9 15H5v-2l3-3\"></path>";
    };
    readonly 'rotate-counter-clockwise': {
        readonly body: "<path d=\"M3 12a9 9 0 1 0 2.6-6.4\"></path><path d=\"M3 3v6h6\"></path>";
    };
    readonly scan: {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 12h10\"></path>";
    };
    readonly 'scan-line': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M3 12h18\"></path>";
    };
    readonly select: {
        readonly body: "<path d=\"M4 4h16v16H4z\"></path><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'toggle-left': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'toggle-right': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"16\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly checkbox: {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect>";
    };
    readonly 'checkbox-checked': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'checkbox-minus': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 12h8\"></path>";
    };
    readonly 'field-required': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m16.5 7.5 1 1\"></path><path d=\"m17.5 7.5-1 1\"></path>";
    };
    readonly input: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h10\"></path>";
    };
    readonly 'input-error': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h7\"></path><path d=\"m16 10 3 3\"></path><path d=\"m19 10-3 3\"></path>";
    };
    readonly 'input-password': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 14v2\"></path>";
    };
    readonly 'input-search': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"10\" cy=\"12\" r=\"2\"></circle><path d=\"m12 14 3 2\"></path>";
    };
    readonly 'radio-checked': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
    };
    readonly 'radio-unchecked': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
    };
    readonly textarea: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'validation-error': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly breadcrumb: {
        readonly body: "<path d=\"M3 12h4\"></path><path d=\"m7 8 4 4-4 4\"></path><path d=\"M11 12h4\"></path><path d=\"m15 8 4 4-4 4\"></path><path d=\"M19 12h2\"></path>";
    };
    readonly 'command-palette': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"m7 13 3 2-3 2\"></path><path d=\"M12 17h5\"></path>";
    };
    readonly 'density-comfortable': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
    };
    readonly 'density-compact': {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"16\" width=\"16\" height=\"3\" rx=\"1\"></rect>";
    };
    readonly 'empty-box': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'empty-search': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly 'empty-state': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 10h8\"></path><path d=\"M9 14h6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'focus-mode': {
        readonly body: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"></path><path d=\"M16 3h3a2 2 0 0 1 2 2v3\"></path><path d=\"M21 16v3a2 2 0 0 1-2 2h-3\"></path><path d=\"M8 21H5a2 2 0 0 1-2-2v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly loading: {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path><path d=\"M21 12h-4\"></path>";
    };
    readonly 'nav-back': {
        readonly body: "<path d=\"M15 6 9 12l6 6\"></path><path d=\"M9 12h12\"></path><path d=\"M3 5v14\"></path>";
    };
    readonly 'nav-forward': {
        readonly body: "<path d=\"m9 6 6 6-6 6\"></path><path d=\"M3 12h12\"></path><path d=\"M21 5v14\"></path>";
    };
    readonly 'quick-action': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M13 3 7 14h5l-1 7 6-11h-5l1-7z\"></path>";
    };
    readonly 'sidebar-collapse': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path><path d=\"m19 9-3 3 3 3\"></path>";
    };
    readonly 'sidebar-expand': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path><path d=\"m16 9 3 3-3 3\"></path>";
    };
    readonly shortcut: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h6\"></path><path d=\"M15 13h2\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly skeleton: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"3\" rx=\"1.5\"></rect><rect x=\"4\" y=\"16\" width=\"14\" height=\"3\" rx=\"1.5\"></rect>";
    };
    readonly 'split-view': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M7 9h2\"></path><path d=\"M15 9h2\"></path><path d=\"M7 14h2\"></path><path d=\"M15 14h2\"></path>";
    };
    readonly spotlight: {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m11 6 1.2 3.3 3.3 1.2-3.3 1.2L11 15l-1.2-3.3L6.5 10.5l3.3-1.2L11 6z\"></path>";
    };
    readonly 'state-error': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'state-success': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly 'state-warning': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly tour: {
        readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"M9 8h6\"></path><path d=\"M9 11h4\"></path><path d=\"m18 17 3 3\"></path>";
    };
    readonly 'app-launcher': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"4\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect>";
    };
    readonly 'app-shell': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M8 9v11\"></path><path d=\"M12 13h5\"></path><path d=\"M12 17h4\"></path>";
    };
    readonly 'bottom-sheet': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M4 13h16\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10h4\"></path>";
    };
    readonly 'command-key': {
        readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
    };
    readonly dock: {
        readonly body: "<rect x=\"4\" y=\"16\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"6\" y=\"6\" width=\"3\" height=\"7\" rx=\"1\"></rect><rect x=\"11\" y=\"4\" width=\"3\" height=\"9\" rx=\"1\"></rect><rect x=\"16\" y=\"8\" width=\"3\" height=\"5\" rx=\"1\"></rect>";
    };
    readonly 'floating-action': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 18l3 3\"></path>";
    };
    readonly gesture: {
        readonly body: "<path d=\"M7 14c2-6 5-8 8-6 2 1 3 4 2 7\"></path><path d=\"M7 14l3 3\"></path><path d=\"M7 14l-3 3\"></path><path d=\"M12 21c3-1 5-3 6-6\"></path>";
    };
    readonly inspector: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M14 4v16\"></path><path d=\"M17 8h2\"></path><path d=\"M17 12h2\"></path><path d=\"M17 16h1\"></path><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly launcher: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m12 6 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z\"></path>";
    };
    readonly navigator: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path><path d=\"M12 3v3\"></path><path d=\"M12 18v3\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
    };
    readonly onboarding: {
        readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"m9 9 2 2 4-4\"></path><path d=\"M19 17l2 2\"></path>";
    };
    readonly resizer: {
        readonly body: "<path d=\"M4 14v6h6\"></path><path d=\"M20 10V4h-6\"></path><path d=\"m14 4 6 6\"></path><path d=\"m4 14 6 6\"></path><path d=\"M8 16l8-8\"></path>";
    };
    readonly 'shell-command': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"M12 15h5\"></path><path d=\"M3 9h18\"></path>";
    };
    readonly stepper: {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"12\" r=\"3\"></circle><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path>";
    };
    readonly 'status-bar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 16h18\"></path><path d=\"M7 18h.01\"></path><path d=\"M11 18h4\"></path><path d=\"M17 18h.01\"></path>";
    };
    readonly 'touch-target': {
        readonly body: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v3\"></path><path d=\"M12 19v3\"></path><path d=\"M2 12h3\"></path><path d=\"M19 12h3\"></path>";
    };
    readonly wizard: {
        readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"M7 5h4\"></path><path d=\"M7 9h2\"></path>";
    };
    readonly 'workspace-switcher': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"13\" y=\"12\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M11 8h3a3 3 0 0 1 3 3v1\"></path><path d=\"M13 16h-3a3 3 0 0 1-3-3v-1\"></path>";
    };
    readonly 'action-bar': {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h.01\"></path><path d=\"M11 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M19 12h.01\"></path>";
    };
    readonly 'context-panel': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M13 4v16\"></path><path d=\"M16 8h2\"></path><path d=\"M16 12h2\"></path><path d=\"M16 16h1\"></path>";
    };
    readonly 'filter-chip': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\"></rect><path d=\"M8 12h6\"></path><path d=\"m16 10 2 2-2 2\"></path>";
    };
    readonly 'keyboard-shortcut': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h3\"></path><path d=\"M12 13h5\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'side-panel': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h4\"></path><path d=\"M7 16h3\"></path>";
    };
    readonly 'top-bar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h6\"></path>";
    };
    readonly 'x-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly 'zoom-in': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M11 8v6\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly 'zoom-out': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
    };
};

declare const chartIcons: {
    readonly 'area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-5 3 3 5-7v12H7z\"></path>";
    };
    readonly 'bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16V9\"></path><path d=\"M12 16V5\"></path><path d=\"M17 16v-4\"></path>";
    };
    readonly chart: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly dashboard: {
        readonly body: "<path d=\"M4 13a8 8 0 1 1 16 0\"></path><path d=\"M12 13l4-4\"></path><path d=\"M5 19h14\"></path>";
    };
    readonly 'donut-chart': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v6\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'gauge-chart': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly histogram: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17v-5\"></path><path d=\"M11 17V7\"></path><path d=\"M15 17v-8\"></path><path d=\"M19 17v-3\"></path>";
    };
    readonly 'line-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path>";
    };
    readonly 'pie-chart': {
        readonly body: "<path d=\"M21 12A9 9 0 1 1 12 3v9h9z\"></path><path d=\"M12 3a9 9 0 0 1 9 9h-9V3z\"></path>";
    };
    readonly 'radar-chart': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"m12 7 4 3v4l-4 3-4-3v-4l4-3z\"></path><path d=\"M12 3v18\"></path><path d=\"M4 8l16 8\"></path><path d=\"M20 8 4 16\"></path>";
    };
    readonly 'scatter-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"10\" r=\"1.5\"></circle><circle cx=\"17\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"16\" r=\"1.5\"></circle>";
    };
    readonly sparkline: {
        readonly body: "<path d=\"m3 16 4-4 3 2 4-6 3 4 4-5\"></path>";
    };
    readonly 'chart-candlestick': {
        readonly body: "<path d=\"M4 3v18h17\"></path><path d=\"M8 7v8\"></path><rect x=\"6\" y=\"9\" width=\"4\" height=\"4\"></rect><path d=\"M14 5v11\"></path><rect x=\"12\" y=\"7\" width=\"4\" height=\"6\"></rect><path d=\"M20 10v8\"></path><rect x=\"18\" y=\"12\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'chart-column': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect>";
    };
    readonly 'chart-no-axes': {
        readonly body: "<path d=\"m4 16 4-5 3 3 4-7 5 4\"></path><circle cx=\"8\" cy=\"11\" r=\"1\"></circle><circle cx=\"15\" cy=\"7\" r=\"1\"></circle><circle cx=\"20\" cy=\"11\" r=\"1\"></circle>";
    };
    readonly 'chart-stacked': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M7 12h10\"></path>";
    };
    readonly 'axis-x': {
        readonly body: "<path d=\"M3 18h18\"></path><path d=\"m18 15 3 3-3 3\"></path><path d=\"M7 6v12\"></path><path d=\"M12 10v8\"></path><path d=\"M17 13v5\"></path>";
    };
    readonly 'axis-y': {
        readonly body: "<path d=\"M6 21V3\"></path><path d=\"m3 6 3-3 3 3\"></path><path d=\"M6 18h12\"></path><path d=\"M6 13h8\"></path><path d=\"M6 8h5\"></path>";
    };
    readonly 'bubble-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"2\"></circle><circle cx=\"14\" cy=\"10\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"1.5\"></circle>";
    };
    readonly 'chart-combo': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path><path d=\"M7 17v-4\"></path><path d=\"M12 17v-7\"></path><path d=\"M17 17v-5\"></path>";
    };
    readonly 'chart-network': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path>";
    };
    readonly 'chart-spline': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16c3-8 6 4 9-4 1-3 3-5 5-5\"></path>";
    };
    readonly 'chart-step': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-5h4V7h5\"></path>";
    };
    readonly 'conversion-funnel': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M8 9h8\"></path>";
    };
    readonly dial: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l3-5\"></path><path d=\"M7 19h10\"></path><path d=\"M7 15h.01\"></path><path d=\"M17 15h.01\"></path>";
    };
    readonly forecast: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M18 7h3v3\"></path><path d=\"M7 8h.01\"></path><path d=\"M11 6h.01\"></path><path d=\"M15 5h.01\"></path>";
    };
    readonly 'funnel-chart': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly heatmap: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"3\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"10\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"10\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"17\" y=\"17\" width=\"4\" height=\"4\"></rect>";
    };
    readonly 'horizontal-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 8h10\"></path><path d=\"M7 12h14\"></path><path d=\"M7 16h7\"></path>";
    };
    readonly kpi: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 14h3\"></path><path d=\"M12 14h5\"></path><path d=\"m7 10 3 2 3-4 4 3\"></path>";
    };
    readonly meter: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M8 19h8\"></path><path d=\"M6 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'progress-ring': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v4\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
    };
    readonly regression: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"7\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"11\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"8\" r=\"1.5\"></circle><path d=\"M6 17 19 6\"></path>";
    };
    readonly scorecard: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M7 9h5\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h7\"></path><circle cx=\"17\" cy=\"9\" r=\"1\"></circle>";
    };
    readonly 'stacked-area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7v10H6z\"></path><path d=\"m6 17 4-3 4 1 4-4\"></path>";
    };
    readonly 'table-chart': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m6 17 3-3 3 2 5-5\"></path>";
    };
    readonly treemap: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M3 12h9\"></path><path d=\"M12 9h9\"></path><path d=\"M16 9v11\"></path>";
    };
    readonly 'trend-down': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 4\"></path><path d=\"M19 9v4h-4\"></path>";
    };
    readonly 'trend-up': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 5-5 4 4 4-8\"></path><path d=\"M15 7h4v4\"></path>";
    };
    readonly 'ab-test': {
        readonly body: "<path d=\"M4 19 8 5h2l4 14\"></path><path d=\"M6 14h6\"></path><path d=\"M15 5h3a3 3 0 0 1 0 6h-3V5z\"></path><path d=\"M15 11h4a4 4 0 0 1 0 8h-4v-8z\"></path>";
    };
    readonly cohort: {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"9\" r=\"2\"></circle><circle cx=\"14\" cy=\"8\" r=\"2\"></circle><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M8 11v6\"></path><path d=\"M14 10v7\"></path><path d=\"M17 17v1\"></path>";
    };
    readonly experiment: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly 'goal-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"15\" cy=\"9\" r=\"5\"></circle><circle cx=\"15\" cy=\"9\" r=\"2\"></circle><path d=\"m7 17 4-4 2 2 6-6\"></path>";
    };
    readonly 'growth-loop': {
        readonly body: "<path d=\"M17 3h4v4\"></path><path d=\"M21 3 14 10\"></path><path d=\"M7 21H3v-4\"></path><path d=\"M3 21l7-7\"></path><path d=\"M4 9a8 8 0 0 1 13-4\"></path><path d=\"M20 15a8 8 0 0 1-13 4\"></path>";
    };
    readonly retention: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16c2-7 5-7 7 0 1.5 4 3.5 2 5-3\"></path><path d=\"M7 8h.01\"></path><path d=\"M12 8h.01\"></path><path d=\"M17 8h.01\"></path>";
    };
    readonly segment: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 3v9h9\"></path><path d=\"M12 12 6 18\"></path>";
    };
    readonly 'target-metric': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><path d=\"M17 7h4v4\"></path><path d=\"m21 7-5 5\"></path>";
    };
    readonly activation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17V6\"></path><path d=\"m14 9 3-3 3 3\"></path>";
    };
    readonly benchmark: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h12\"></path><path d=\"M6 12h8\"></path><path d=\"M6 8h4\"></path><path d=\"M18 5v14\"></path>";
    };
    readonly churn: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 6\"></path><path d=\"M19 11v4h-4\"></path>";
    };
    readonly 'expansion-revenue': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17V7\"></path><path d=\"M17 17V5\"></path><path d=\"m15 7 2-2 2 2\"></path>";
    };
    readonly 'forecast-band': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7\"></path><path d=\"m6 13 4-4 4 2 4-5\"></path><path d=\"m6 20 4-5 4 4 4-8\"></path>";
    };
    readonly ltv: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M6 8h3\"></path><path d=\"M6 11h5\"></path><path d=\"M17 7h4v4\"></path>";
    };
    readonly mrr: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17V9l3 4 3-4v8\"></path><path d=\"M15 17V9h3a2 2 0 0 1 0 4h-3\"></path><path d=\"m18 13 3 4\"></path>";
    };
    readonly nps: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 15a5 5 0 0 1 10 0\"></path><path d=\"M7 9h.01\"></path><path d=\"M17 9h.01\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly 'revenue-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly roi: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 16 4-4 3 3 4-7\"></path><path d=\"m16 8 2-2 2 2\"></path><path d=\"M8 8h.01\"></path><path d=\"M12 8h.01\"></path>";
    };
    readonly 'session-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-4\"></path><path d=\"M17 17V6\"></path><circle cx=\"17\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'win-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 3 3 7-10\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h3\"></path><path d=\"M17 8h4v4\"></path>";
    };
    readonly 'adoption-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-6\"></path><path d=\"M17 17V7\"></path><path d=\"m14 10 3-3 3 3\"></path>";
    };
    readonly 'capacity-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"8\" width=\"3\" height=\"9\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"11\"></rect><rect x=\"16\" y=\"11\" width=\"3\" height=\"6\"></rect><path d=\"M6 5h13\"></path>";
    };
    readonly 'cohort-grid': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"6\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"16\" width=\"3\" height=\"3\"></rect>";
    };
    readonly 'contribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"M7 8h10\"></path><path d=\"M12 12h5\"></path>";
    };
    readonly 'dependency-chart': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'error-rate': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-5 3 4 5-8\"></path><path d=\"M16 14l4 4\"></path><path d=\"m20 14-4 4\"></path>";
    };
    readonly latency: {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path><path d=\"M12 3v3\"></path><path d=\"M4 15h3\"></path><path d=\"M17 15h3\"></path>";
    };
    readonly percentile: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-7 4 3 4-8\"></path><path d=\"M6 12h12\"></path><path d=\"M6 8h8\"></path>";
    };
    readonly saturation: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-3\"></path><path d=\"M5 7h14\"></path><path d=\"M5 13h14\"></path>";
    };
    readonly 'throughput-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-4h4V8h5\"></path><path d=\"m16 5 3 3-3 3\"></path>";
    };
    readonly 'vertical-bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 17V9\"></path><path d=\"M12 17V6\"></path><path d=\"M16 17v-5\"></path>";
    };
    readonly 'waterfall-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"12\" width=\"3\" height=\"5\"></rect><rect x=\"11\" y=\"8\" width=\"3\" height=\"4\"></rect><rect x=\"16\" y=\"10\" width=\"3\" height=\"7\"></rect><path d=\"M9 12h2\"></path><path d=\"M14 10h2\"></path>";
    };
    readonly 'anomaly-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle><path d=\"M18 4v1\"></path><path d=\"M18 9v1\"></path>";
    };
    readonly 'baseline-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 12h13\"></path><path d=\"m6 16 4-5 4 3 5-7\"></path>";
    };
    readonly 'box-plot': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 7v10\"></path><rect x=\"6\" y=\"10\" width=\"4\" height=\"4\"></rect><path d=\"M16 5v14\"></path><rect x=\"14\" y=\"8\" width=\"4\" height=\"7\"></rect>";
    };
    readonly 'burndown-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 7 4 4 3 2 5 4\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'burnup-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-4 3-2 5-4\"></path><path d=\"M6 7h12\"></path>";
    };
    readonly 'control-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 8h13\"></path><path d=\"M6 16h13\"></path><path d=\"m6 12 4-2 4 4 5-2\"></path>";
    };
    readonly 'distribution-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17c2-8 4-8 6 0 2-8 4-8 6 0\"></path><path d=\"M6 17h12\"></path>";
    };
    readonly 'gantt-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 7h7\"></path><path d=\"M10 12h8\"></path><path d=\"M6 17h10\"></path><path d=\"M7 5v14\"></path>";
    };
    readonly 'health-score': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 9h2l2 5 2-8 2 3h2\"></path>";
    };
    readonly 'leaderboard-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect><path d=\"M12 4h1\"></path>";
    };
    readonly 'map-chart': {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'matrix-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"5\"></rect>";
    };
    readonly 'pareto-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"m6 8 4 3 4-1 5-5\"></path>";
    };
    readonly 'sankey-chart': {
        readonly body: "<path d=\"M4 7h5\"></path><path d=\"M4 17h5\"></path><path d=\"M15 12h5\"></path><path d=\"M9 7c4 0 2 5 6 5\"></path><path d=\"M9 17c4 0 2-5 6-5\"></path><rect x=\"3\" y=\"5\" width=\"2\" height=\"4\"></rect><rect x=\"19\" y=\"10\" width=\"2\" height=\"4\"></rect>";
    };
    readonly 'bullet-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"9\" width=\"12\" height=\"6\"></rect><path d=\"M6 12h9\"></path><path d=\"M16 7v10\"></path>";
    };
    readonly 'funnel-stage': {
        readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path><circle cx=\"18\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly 'metric-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h5\"></path><path d=\"M7 14h10\"></path><path d=\"m14 10 2-2 3 3\"></path><path d=\"M16 8v6\"></path>";
    };
    readonly 'pivot-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><path d=\"M13 15h5\"></path><path d=\"m16 12 2 3-2 3\"></path>";
    };
    readonly 'variance-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M6 12h13\"></path><path d=\"m17 8 2 2 2-2\"></path>";
    };
};

declare const commerceIcons: {
    readonly bank: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly card: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h3\"></path>";
    };
    readonly cart: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path>";
    };
    readonly cash: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 9v6\"></path>";
    };
    readonly 'credit-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path>";
    };
    readonly receipt: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path>";
    };
    readonly 'badge-dollar': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly 'badge-percent': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8 16 8-8\"></path><circle cx=\"9\" cy=\"9\" r=\"1\"></circle><circle cx=\"15\" cy=\"15\" r=\"1\"></circle>";
    };
    readonly barcode: {
        readonly body: "<path d=\"M4 5v14\"></path><path d=\"M7 5v14\"></path><path d=\"M11 5v14\"></path><path d=\"M13 5v14\"></path><path d=\"M17 5v14\"></path><path d=\"M20 5v14\"></path>";
    };
    readonly gift: {
        readonly body: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M3 12h18\"></path><path d=\"M12 8v13\"></path><path d=\"M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8z\"></path><path d=\"M12 8h3.5A2.5 2.5 0 1 0 13 5.5L12 8z\"></path>";
    };
    readonly invoice: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path>";
    };
    readonly landmark: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'shopping-bag': {
        readonly body: "<path d=\"M6 8h12l1 13H5L6 8z\"></path><path d=\"M9 8a3 3 0 0 1 6 0\"></path>";
    };
    readonly store: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M4 10a2 2 0 0 0 4 0\"></path><path d=\"M8 10a2 2 0 0 0 4 0\"></path><path d=\"M12 10a2 2 0 0 0 4 0\"></path><path d=\"M16 10a2 2 0 0 0 4 0\"></path>";
    };
    readonly ticket: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly truck: {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle>";
    };
    readonly vault: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 9h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly wallet: {
        readonly body: "<path d=\"M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12\"></path><path d=\"M16 13h5\"></path><path d=\"M17 13h.01\"></path>";
    };
    readonly coins: {
        readonly body: "<ellipse cx=\"8\" cy=\"6\" rx=\"5\" ry=\"3\"></ellipse><path d=\"M3 6v4c0 1.7 2.2 3 5 3s5-1.3 5-3V6\"></path><path d=\"M11 9.5c1-.9 2.5-1.5 4-1.5 2.8 0 5 1.3 5 3s-2.2 3-5 3c-1.5 0-3-.4-4-1.1\"></path><path d=\"M10 13v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-5\"></path>";
    };
    readonly coupon: {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path>";
    };
    readonly 'dollar-sign': {
        readonly body: "<path d=\"M12 2v20\"></path><path d=\"M17 5.5A5 5 0 0 0 12 4c-3 0-5 1.5-5 3.5 0 5 10 2.5 10 7.5 0 2-2 3.5-5 3.5a6 6 0 0 1-5.5-2.5\"></path>";
    };
    readonly 'hand-coins': {
        readonly body: "<path d=\"M3 15h4l4 4h6a3 3 0 0 0 3-3\"></path><path d=\"M7 15l3-3h4a2 2 0 0 1 0 4h-3\"></path><circle cx=\"17\" cy=\"6\" r=\"3\"></circle><path d=\"M17 4v4\"></path><path d=\"M15 6h4\"></path>";
    };
    readonly 'package-check': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'package-open': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path><path d=\"m3 8 9 5 9-5\"></path>";
    };
    readonly 'package-plus': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
    };
    readonly 'package-x': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m9.5 12.5 5 5\"></path><path d=\"m14.5 12.5-5 5\"></path>";
    };
    readonly percent: {
        readonly body: "<path d=\"m19 5-14 14\"></path><circle cx=\"7\" cy=\"7\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
    };
    readonly refund: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"M12 8v8\"></path><path d=\"M15 10.5A3 3 0 0 0 12 9c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
    };
    readonly scale: {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly ship: {
        readonly body: "<path d=\"M3 17h18l-2 4H5l-2-4z\"></path><path d=\"M5 17V8h14v9\"></path><path d=\"M9 8V4h6v4\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
    };
    readonly 'shopping-cart-check': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path>";
    };
    readonly 'shopping-cart-plus': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M13 9v6\"></path><path d=\"M10 12h6\"></path>";
    };
    readonly warehouse: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path>";
    };
    readonly billable: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path><path d=\"M18 18l3 3\"></path>";
    };
    readonly billing: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly checkout: {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path><path d=\"M4 22h16\"></path>";
    };
    readonly dispute: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M12 13v2\"></path><path d=\"M12 17h.01\"></path><path d=\"m16 14 3 3\"></path><path d=\"m19 14-3 3\"></path>";
    };
    readonly dunning: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 14v3\"></path><path d=\"M15 20h.01\"></path>";
    };
    readonly estimate: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M8 9h4\"></path>";
    };
    readonly 'payment-failed': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"m9 13 6 4\"></path><path d=\"m15 13-6 4\"></path>";
    };
    readonly 'payment-link': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15a3 3 0 0 0 4.2 0l1-1a3 3 0 0 0-4.2-4.2l-.6.6\"></path>";
    };
    readonly 'payment-method': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h4\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly payout: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path>";
    };
    readonly 'price-tag': {
        readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path><path d=\"M12 8h4\"></path>";
    };
    readonly quote: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h8\"></path><path d=\"M8 11h5\"></path><path d=\"m16 17 2 2 4-4\"></path>";
    };
    readonly subscription: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"M16 15a3 3 0 1 0 2.8 4\"></path><path d=\"M19 15v3h-3\"></path>";
    };
    readonly 'tax-receipt': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 17 6-6\"></path><circle cx=\"10\" cy=\"12\" r=\"1\"></circle><circle cx=\"14\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly usage: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 16V9\"></path><path d=\"M12 16v-4\"></path><path d=\"M16 16v-7\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly 'cart-abandoned': {
        readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M12 9v4\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'discount-code': {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path><path d=\"M13 6v12\"></path>";
    };
    readonly fulfillment: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M17 15h4\"></path>";
    };
    readonly inventory: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M10 8h4\"></path>";
    };
    readonly 'inventory-alert': {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M12 7v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'order-cancelled': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly 'order-check': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"m10 16 2 2 5-5\"></path>";
    };
    readonly 'order-pending': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pos-terminal': {
        readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"18\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h2\"></path><path d=\"M14 15h1\"></path>";
    };
    readonly procurement: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly 'purchase-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M8 8h3\"></path>";
    };
    readonly return: {
        readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"m21 8-6-4-6 4 6 4 6-4z\"></path><path d=\"M9 8v6l6 4 6-4V8\"></path>";
    };
    readonly 'shipment-track': {
        readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle><path d=\"M10 3h8\"></path><path d=\"m15 1 3 2-3 2\"></path>";
    };
    readonly 'shipping-label': {
        readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path><path d=\"M6 3l12 18\"></path>";
    };
    readonly 'account-payable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 15h5\"></path><path d=\"m17 13 3 2-3 2\"></path>";
    };
    readonly 'account-receivable': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M20 15h-5\"></path><path d=\"m18 13-3 2 3 2\"></path>";
    };
    readonly 'bill-pay': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 17 2 2 5-5\"></path>";
    };
    readonly 'card-terminal': {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h2\"></path><path d=\"M13 15h3\"></path><path d=\"M9 19h6\"></path>";
    };
    readonly 'cash-register': {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M9 14h.01\"></path><path d=\"M13 14h.01\"></path><path d=\"M17 14h.01\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly chargeback: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 16H6v-3\"></path><path d=\"M6 13a5 5 0 0 0 8 4\"></path><path d=\"M15 13h3v3\"></path><path d=\"M18 16a5 5 0 0 0-8-4\"></path>";
    };
    readonly 'credit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'debit-note': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly 'delivery-note': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M15 16h5\"></path><path d=\"m18 14 2 2-2 2\"></path>";
    };
    readonly 'payment-scheduled': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
    };
    readonly 'pricing-table': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 5v14\"></path><path d=\"M15 5v14\"></path><path d=\"M6 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M18 15h.01\"></path>";
    };
    readonly 'revenue-recognition': {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17V9\"></path><path d=\"M12 17V5\"></path><path d=\"M18 17v-6\"></path><path d=\"M8 5h8\"></path><path d=\"M12 3v4\"></path>";
    };
    readonly 'sales-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly vendor: {
        readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><circle cx=\"17\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'billing-cycle': {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h5\"></path><path d=\"M16 15a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 13v3h-3\"></path>";
    };
    readonly 'collection-case': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14v5\"></path><path d=\"M16 22h.01\"></path>";
    };
    readonly 'contract-value': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 13v6\"></path><path d=\"M18 15a2 2 0 0 0-2-1.5c-1 0-2 .5-2 1.5 0 2 4 .8 4 3 0 .9-1 1.5-2 1.5a3 3 0 0 1-2.5-1\"></path>";
    };
    readonly 'payment-gateway': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M17 11v2\"></path><path d=\"M17 17v2\"></path><path d=\"M13 15h2\"></path><path d=\"M19 15h2\"></path>";
    };
    readonly remittance: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path><path d=\"M6 15H3v-3\"></path><path d=\"m3 15 5-5\"></path>";
    };
    readonly 'revenue-ledger': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path><path d=\"M16 6v12\"></path>";
    };
    readonly sku: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path>";
    };
    readonly supplier: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><path d=\"M16 4h4\"></path>";
    };
    readonly 'tax-id': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle><path d=\"M8 7h4\"></path>";
    };
    readonly till: {
        readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M7 18h10\"></path>";
    };
    readonly trial: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M12 11v5\"></path><path d=\"M9.5 13.5h5\"></path>";
    };
    readonly wholesale: {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M9 5h6\"></path>";
    };
};

declare const communicationIcons: {
    readonly 'at-sign': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path>";
    };
    readonly bell: {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly mail: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path>";
    };
    readonly message: {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path>";
    };
    readonly mic: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
    };
    readonly paperclip: {
        readonly body: "<path d=\"m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8\"></path>";
    };
    readonly send: {
        readonly body: "<path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path><path d=\"M22 2 11 13\"></path>";
    };
    readonly share: {
        readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
    };
    readonly 'bell-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly megaphone: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path>";
    };
    readonly 'phone-call': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 3a7 7 0 0 1 7 7\"></path><path d=\"M14 7a3 3 0 0 1 3 3\"></path>";
    };
    readonly broadcast: {
        readonly body: "<path d=\"M4 12a8 8 0 0 1 8-8\"></path><path d=\"M4 12a8 8 0 0 0 8 8\"></path><path d=\"M20 12a8 8 0 0 0-8-8\"></path><path d=\"M20 12a8 8 0 0 1-8 8\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly 'chat-check': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'chat-plus': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'chat-x': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly 'inbox-mail': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"m7 7 5 4 5-4\"></path>";
    };
    readonly 'mail-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'mail-open': {
        readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path>";
    };
    readonly 'mail-plus': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'mail-x': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly 'message-circle': {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-9 9H7l-4 2 2-4a9 9 0 1 1 16-7z\"></path>";
    };
    readonly 'message-square': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path>";
    };
    readonly 'mic-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 9.5 6.5\"></path><path d=\"M19 11a7 7 0 0 1-2.1 5\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
    };
    readonly 'notification-dot': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><circle cx=\"19\" cy=\"7\" r=\"3\"></circle>";
    };
    readonly 'phone-forwarded': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 6h6\"></path><path d=\"m18 3 3 3-3 3\"></path>";
    };
    readonly 'phone-incoming': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M21 3 15 9\"></path><path d=\"M15 3v6h6\"></path>";
    };
    readonly 'phone-missed': {
        readonly body: "<path d=\"M6 8c4-3 8-3 12 0l2-2\"></path><path d=\"M4 6l2 2\"></path><path d=\"m15 6 6 6\"></path><path d=\"m21 6-6 6\"></path><path d=\"M8 12l-3 5\"></path><path d=\"m16 12 3 5\"></path>";
    };
    readonly 'phone-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.3 1.8\"></path><path d=\"M15.5 14.5a2 2 0 0 1 1.8-.5l3 .5a2 2 0 0 1 1.7 2.4\"></path>";
    };
    readonly 'phone-outgoing': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 9 21 3\"></path><path d=\"M15 3h6v6\"></path>";
    };
    readonly 'rss-feed': {
        readonly body: "<path d=\"M4 11a9 9 0 0 1 9 9\"></path><path d=\"M4 4a16 16 0 0 1 16 16\"></path><circle cx=\"5\" cy=\"19\" r=\"1\"></circle>";
    };
    readonly 'share-2': {
        readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
    };
    readonly announcement: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path><path d=\"M21 4h.01\"></path>";
    };
    readonly 'comment-check': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'comment-x': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly feedback: {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
    };
    readonly 'inbox-alert': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
    };
    readonly mention: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M4 4 2 2\"></path><path d=\"M20 4l2-2\"></path>";
    };
    readonly 'message-lock': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><rect x=\"12\" y=\"10\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 10V8.5a1.5 1.5 0 0 1 3 0V10\"></path>";
    };
    readonly thread: {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path>";
    };
    readonly channel: {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 12h4\"></path>";
    };
    readonly 'channel-lock': {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><rect x=\"12\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
    };
    readonly 'channel-plus': {
        readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M12 8v6\"></path><path d=\"M9 11h6\"></path>";
    };
    readonly collaboration: {
        readonly body: "<circle cx=\"8\" cy=\"9\" r=\"3\"></circle><circle cx=\"16\" cy=\"9\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M11 9h2\"></path>";
    };
    readonly conversation: {
        readonly body: "<path d=\"M4 5h13v8H7l-3 3V5z\"></path><path d=\"M9 16h8l3 3v-8\"></path><path d=\"M8 9h5\"></path><path d=\"M13 14h3\"></path>";
    };
    readonly meeting: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"M16 10h3\"></path><path d=\"M16 14h3\"></path>";
    };
    readonly moderation: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'notification-check': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'notification-snooze': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h12\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M16 16h5l-5 5h5\"></path>";
    };
    readonly 'presence-away': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M18 4.5V6l1 1\"></path>";
    };
    readonly 'presence-busy': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M16.5 6h3\"></path>";
    };
    readonly 'presence-online': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 6 1 1 2-2\"></path>";
    };
    readonly reaction: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 15a5 5 0 0 0 8 0\"></path><path d=\"M20 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path>";
    };
    readonly 'thread-resolved': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
    };
    readonly 'call-muted': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M2 2l20 20\"></path>";
    };
    readonly 'call-transfer': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 5h7\"></path><path d=\"m18 2 3 3-3 3\"></path>";
    };
    readonly 'comment-thread': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path><path d=\"M12 13h4\"></path>";
    };
    readonly 'conversation-star': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"m16 8 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L13 10.3l2-.3 1-2z\"></path>";
    };
    readonly 'escalation-message': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M12 14V8\"></path><path d=\"m9 11 3-3 3 3\"></path>";
    };
    readonly 'meeting-cancelled': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m16 10 4 4\"></path><path d=\"m20 10-4 4\"></path>";
    };
    readonly 'meeting-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m15 15 2 2 4-4\"></path>";
    };
    readonly 'mention-alert': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M21 3v4\"></path><path d=\"M21 10h.01\"></path>";
    };
    readonly 'notification-priority': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h15\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M19 5v6\"></path><path d=\"M19 15h.01\"></path>";
    };
    readonly 'presence-offline': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 4.5 3 3\"></path><path d=\"m19.5 4.5-3 3\"></path>";
    };
    readonly 'support-inbox': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 8v4\"></path><path d=\"M10 10h4\"></path>";
    };
    readonly survey: {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'targeted-broadcast': {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><circle cx=\"19\" cy=\"12\" r=\"3\"></circle><path d=\"M19 9v6\"></path><path d=\"M16 12h6\"></path>";
    };
    readonly transcript: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M16 16h.01\"></path>";
    };
    readonly voicemail: {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"4\"></circle><circle cx=\"18\" cy=\"12\" r=\"4\"></circle><path d=\"M6 16h12\"></path>";
    };
    readonly 'call-incoming': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M20 4h-6\"></path><path d=\"m17 1-3 3 3 3\"></path>";
    };
    readonly 'call-recording': {
        readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle>";
    };
    readonly 'chat-bot': {
        readonly body: "<path d=\"M4 8h16v10H7l-3 3V8z\"></path><path d=\"M12 8V4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M10 16h4\"></path>";
    };
    readonly 'chat-error': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'chat-resolved': {
        readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
    };
    readonly 'contact-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M14 10h4\"></path><path d=\"M14 14h4\"></path>";
    };
    readonly 'email-bounce': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 15v3\"></path><path d=\"M12 21h.01\"></path>";
    };
    readonly 'email-template': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M7 15h10\"></path><path d=\"M7 18h6\"></path>";
    };
    readonly 'notification-digest': {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M8 12h8\"></path><path d=\"M8 15h6\"></path>";
    };
    readonly 'webhook-event': {
        readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M12 3v2\"></path>";
    };
    readonly 'auto-reply': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 13a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 11v3h-3\"></path>";
    };
    readonly 'call-queue': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M9 19h6\"></path><path d=\"M9 22h4\"></path>";
    };
    readonly campaign: {
        readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><circle cx=\"20\" cy=\"5\" r=\"2\"></circle>";
    };
    readonly 'chat-typing': {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
    };
    readonly 'email-opened': {
        readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'email-sent': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M16 15h6\"></path><path d=\"m19 12 3 3-3 3\"></path>";
    };
    readonly 'inbox-priority': {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
    };
    readonly 'live-chat': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'message-draft': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"m15 14 3-3 2 2-3 3h-2v-2z\"></path>";
    };
    readonly 'notification-muted': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly sms: {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 10h.01\"></path><path d=\"M12 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'support-agent': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"3\"></circle><path d=\"M7 21a5 5 0 0 1 10 0\"></path>";
    };
};

declare const contentIcons: {
    readonly archive: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"4\" rx=\"1\"></rect><path d=\"M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly camera: {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>";
    };
    readonly copy: {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect>";
    };
    readonly document: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h6\"></path>";
    };
    readonly edit: {
        readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
    };
    readonly file: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path>";
    };
    readonly folder: {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path>";
    };
    readonly image: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path>";
    };
    readonly printer: {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 14h10v7H7z\"></path>";
    };
    readonly save: {
        readonly body: "<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><path d=\"M17 21v-8H7v8\"></path><path d=\"M7 3v5h8\"></path>";
    };
    readonly 'align-center': {
        readonly body: "<path d=\"M7 6h10\"></path><path d=\"M4 12h16\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'align-left': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h10\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly 'align-right': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M10 12h10\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly 'book-open': {
        readonly body: "<path d=\"M3 5a6 6 0 0 1 6-2l3 1v17l-3-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M21 5a6 6 0 0 0-6-2l-3 1v17l3-1a6 6 0 0 1 6 2V5z\"></path>";
    };
    readonly bookmark: {
        readonly body: "<path d=\"M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1z\"></path>";
    };
    readonly 'camera-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.5 4h5L16 7h3a2 2 0 0 1 2 2v8.5\"></path><path d=\"M18 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2\"></path><path d=\"M9.9 10.4A3 3 0 0 0 14 14.6\"></path>";
    };
    readonly clipboard: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M8 10h8\"></path><path d=\"M8 14h8\"></path><path d=\"M8 18h5\"></path>";
    };
    readonly 'clipboard-check': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'clipboard-list': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M9 11h.01\"></path><path d=\"M12 11h4\"></path><path d=\"M9 16h.01\"></path><path d=\"M12 16h4\"></path>";
    };
    readonly 'copy-check': {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect><path d=\"m12 16 2 2 5-5\"></path>";
    };
    readonly 'file-check': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
    };
    readonly 'file-code': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path>";
    };
    readonly 'file-down': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"m9 15 3 3 3-3\"></path>";
    };
    readonly 'file-minus': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'file-plus': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'file-text': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M8 9h2\"></path>";
    };
    readonly 'file-up': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 18v-6\"></path><path d=\"m9 15 3-3 3 3\"></path>";
    };
    readonly 'file-x': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
    };
    readonly 'folder-open': {
        readonly body: "<path d=\"M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v1\"></path><path d=\"M3 10h18l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z\"></path>";
    };
    readonly 'folder-plus': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
    };
    readonly 'folder-sync': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v3\"></path><path d=\"M3 10v8a2 2 0 0 0 2 2h7\"></path><path d=\"M21 17a4 4 0 0 1-6.8 2.8L13 18\"></path><path d=\"M13 21v-3h3\"></path><path d=\"M15 14a4 4 0 0 1 6.8 2.8L23 18\"></path><path d=\"M23 15v3h-3\"></path>";
    };
    readonly 'image-plus': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M16 6v6\"></path><path d=\"M13 9h6\"></path>";
    };
    readonly indent: {
        readonly body: "<path d=\"M3 6h18\"></path><path d=\"M11 12h10\"></path><path d=\"M3 18h18\"></path><path d=\"m3 10 4 2-4 2v-4z\"></path>";
    };
    readonly pencil: {
        readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
    };
    readonly scissors: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M20 4 8.1 15.9\"></path><path d=\"M8.1 8.1 20 20\"></path>";
    };
    readonly sticky: {
        readonly body: "<path d=\"M5 3h14a2 2 0 0 1 2 2v10l-6 6H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"></path><path d=\"M15 21v-6h6\"></path>";
    };
    readonly 'clipboard-copy': {
        readonly body: "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"></path><path d=\"M12 13h4\"></path><path d=\"M14 11v4\"></path>";
    };
    readonly 'clipboard-x': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
    };
    readonly crop: {
        readonly body: "<path d=\"M6 2v14a2 2 0 0 0 2 2h14\"></path><path d=\"M18 22V8a2 2 0 0 0-2-2H2\"></path>";
    };
    readonly eraser: {
        readonly body: "<path d=\"m7 21-4-4 10-10a3 3 0 0 1 4 0l4 4-10 10H7z\"></path><path d=\"m12 12 5 5\"></path><path d=\"M7 21h14\"></path>";
    };
    readonly 'file-archive': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 12h4\"></path><path d=\"M10 16h4\"></path><path d=\"M12 12v8\"></path>";
    };
    readonly 'file-audio': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 17v-4l4-2v6l-4-2\"></path><path d=\"M16 13a3 3 0 0 1 0 4\"></path>";
    };
    readonly 'file-image': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"9\" cy=\"13\" r=\"1.5\"></circle><path d=\"m8 19 3-3 2 2 3-4 2 3\"></path>";
    };
    readonly 'file-json': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 13c-1 0-1 .8-1 1.5S9 16 8 16\"></path><path d=\"M14 13c1 0 1 .8 1 1.5S15 16 16 16\"></path>";
    };
    readonly 'file-lock': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'file-spreadsheet': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M12 13v6\"></path>";
    };
    readonly 'file-video': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"13\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"m14 15 3-2v5l-3-2\"></path>";
    };
    readonly 'folder-check': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m8 14 2 2 5-5\"></path>";
    };
    readonly 'folder-down': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 10v7\"></path><path d=\"m9 14 3 3 3-3\"></path>";
    };
    readonly 'folder-lock': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><rect x=\"8\" y=\"13\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 13v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'folder-up': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 17v-7\"></path><path d=\"m9 13 3-3 3 3\"></path>";
    };
    readonly 'folder-x': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
    };
    readonly newspaper: {
        readonly body: "<path d=\"M4 5h14a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z\"></path><path d=\"M4 17H3a1 1 0 0 1-1-1V7\"></path><path d=\"M8 9h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path>";
    };
    readonly paintbrush: {
        readonly body: "<path d=\"M18 3a3 3 0 0 1 3 3c0 4-5 4-5 8\"></path><path d=\"M16 14a4 4 0 0 1-8 0c0-2 2-4 4-4s4 2 4 4z\"></path><path d=\"M8 18c0 2-2 3-5 3 1-2 1-4 3-5\"></path>";
    };
    readonly palette: {
        readonly body: "<path d=\"M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z\"></path><path d=\"M7.5 10h.01\"></path><path d=\"M10 7h.01\"></path><path d=\"M14 7h.01\"></path>";
    };
    readonly 'document-import': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v7\"></path><path d=\"m9 15 3-3 3 3\"></path>";
    };
    readonly 'document-export': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 19v-7\"></path><path d=\"m9 16 3 3 3-3\"></path>";
    };
    readonly 'document-search': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"11\" cy=\"15\" r=\"3\"></circle><path d=\"m13 17 3 3\"></path>";
    };
    readonly 'document-signature': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17c1-4 3-4 4 0 1-3 3-3 4 0\"></path>";
    };
    readonly 'file-csv': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 14h2\"></path><path d=\"M12 14h2\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'file-pdf': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17v-5h2a2 2 0 0 1 0 4H8\"></path><path d=\"M13 17v-5h1a3 3 0 0 1 0 5h-1\"></path>";
    };
    readonly 'file-template': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"12\" width=\"8\" height=\"6\" rx=\"1\"></rect><path d=\"M8 15h8\"></path>";
    };
    readonly 'image-check': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m14 8 2 2 4-4\"></path>";
    };
    readonly 'scan-document': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M8 7h8v10H8z\"></path><path d=\"M10 11h4\"></path>";
    };
    readonly 'template-plus': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M15 14v6\"></path><path d=\"M12 17h6\"></path>";
    };
    readonly asset: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"m20 15-4-4-5 5-2-2-4 5\"></path>";
    };
    readonly 'asset-library': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect>";
    };
    readonly collection: {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path><path d=\"M11 12h4\"></path><path d=\"M13 10v4\"></path>";
    };
    readonly 'content-calendar': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h5\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly draft: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 16h8\"></path><path d=\"M8 12h5\"></path><path d=\"M15 11l3 3\"></path>";
    };
    readonly 'empty-file': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 15h8\"></path>";
    };
    readonly 'empty-folder': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'file-diff': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h3\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly 'file-history': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"12\" cy=\"15\" r=\"4\"></circle><path d=\"M12 13v2l1.5 1\"></path>";
    };
    readonly 'knowledge-base': {
        readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path>";
    };
    readonly 'media-library': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 3h10\"></path><path d=\"M7 21h10\"></path>";
    };
    readonly version: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 7h3V4\"></path><path d=\"M7 7a7 7 0 0 1 10 0\"></path>";
    };
    readonly citation: {
        readonly body: "<path d=\"M6 5h12v16H6z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path><path d=\"M4 3h4\"></path><path d=\"M16 3h4\"></path>";
    };
    readonly 'code-block': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10-3 2 3 2\"></path><path d=\"m16 10 3 2-3 2\"></path><path d=\"M10 16h4\"></path>";
    };
    readonly glossary: {
        readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path><path d=\"M8 13h2\"></path>";
    };
    readonly markdown: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 15V9l3 4 3-4v6\"></path><path d=\"M17 9v6\"></path><path d=\"m15 13 2 2 2-2\"></path>";
    };
    readonly publish: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M12 18v-7\"></path><path d=\"m9 14 3-3 3 3\"></path>";
    };
    readonly redact: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M7 13h10\"></path>";
    };
    readonly 'review-changes': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 10h5\"></path><path d=\"M16 15h4\"></path>";
    };
    readonly 'rich-text': {
        readonly body: "<path d=\"M5 6h14\"></path><path d=\"M8 6v12\"></path><path d=\"M16 6v12\"></path><path d=\"M6 18h12\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly translation: {
        readonly body: "<path d=\"M4 5h9\"></path><path d=\"M8 5v12\"></path><path d=\"M3 17c4-3 7-7 8-12\"></path><path d=\"M13 19l3-8 3 8\"></path><path d=\"M14 16h4\"></path>";
    };
    readonly 'web-page': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'video-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
    };
    readonly video: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
    };
    readonly annotation: {
        readonly body: "<path d=\"M4 5h16v11H8l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'approval-document': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"m8 17 2 2 5-5\"></path>";
    };
    readonly 'content-block': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><rect x=\"8\" y=\"15\" width=\"8\" height=\"2\"></rect>";
    };
    readonly 'document-merge': {
        readonly body: "<path d=\"M5 3h6v7H5z\"></path><path d=\"M13 14h6v7h-6z\"></path><path d=\"M8 10v3a4 4 0 0 0 4 4h1\"></path><path d=\"m10 15 2 2-2 2\"></path>";
    };
    readonly 'document-split': {
        readonly body: "<path d=\"M5 3h14v6H5z\"></path><path d=\"M5 15h6v6H5z\"></path><path d=\"M13 15h6v6h-6z\"></path><path d=\"M12 9v3\"></path><path d=\"M8 15v-3h8v3\"></path>";
    };
    readonly 'file-xml': {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path><path d=\"M12 12l-1 6\"></path>";
    };
    readonly 'folder-shared': {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><circle cx=\"10\" cy=\"14\" r=\"2\"></circle><path d=\"M14 18a4 4 0 0 0-8 0\"></path><circle cx=\"17\" cy=\"13\" r=\"1.5\"></circle>";
    };
    readonly 'image-crop': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 3v13a2 2 0 0 0 2 2h11\"></path><path d=\"M16 21V8a2 2 0 0 0-2-2H3\"></path>";
    };
    readonly 'image-edit': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m15 7 3-3 2 2-3 3h-2V7z\"></path>";
    };
    readonly 'media-playlist': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h8\"></path><path d=\"M7 13h6\"></path><path d=\"M7 17h4\"></path><path d=\"m15 14 4 2-4 2v-4z\"></path>";
    };
    readonly 'page-break': {
        readonly body: "<path d=\"M6 3h12v7H6z\"></path><path d=\"M6 14h12v7H6z\"></path><path d=\"M3 12h2\"></path><path d=\"M8 12h2\"></path><path d=\"M14 12h2\"></path><path d=\"M19 12h2\"></path>";
    };
    readonly seo: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h10\"></path><path d=\"M7 14h5\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"m18 17 2 2\"></path>";
    };
    readonly snippet: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m9 10-3 2 3 2\"></path><path d=\"m15 10 3 2-3 2\"></path><path d=\"M10 17h4\"></path>";
    };
    readonly 'style-guide': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h4\"></path><circle cx=\"9\" cy=\"16\" r=\"1\"></circle><circle cx=\"13\" cy=\"16\" r=\"1\"></circle><circle cx=\"17\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly 'alt-text': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 21h10\"></path><path d=\"M9 21v-4\"></path><path d=\"M15 21v-4\"></path>";
    };
    readonly 'content-approval': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'form-template': {
        readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><rect x=\"8\" y=\"11\" width=\"8\" height=\"3\"></rect><path d=\"M8 17h4\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly 'media-caption': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m10 10 5 3-5 3v-6z\"></path><path d=\"M7 18h10\"></path><path d=\"M9 21h6\"></path>";
    };
    readonly 'version-compare': {
        readonly body: "<path d=\"M5 4h6v16H5z\"></path><path d=\"M13 4h6v16h-6z\"></path><path d=\"M8 8h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M16 8h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 17h8\"></path>";
    };
};

declare const deviceIcons: {
    readonly battery: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path>";
    };
    readonly bluetooth: {
        readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path>";
    };
    readonly cloud: {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path>";
    };
    readonly cpu: {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path>";
    };
    readonly database: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path>";
    };
    readonly desktop: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
    };
    readonly laptop: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M3 20h18l-2-4H5l-2 4z\"></path>";
    };
    readonly offline: {
        readonly body: "<path d=\"M2 2 22 22\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M5 13a10 10 0 0 1 4-2.4\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path>";
    };
    readonly phone: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly server: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path>";
    };
    readonly chip: {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path><path d=\"M10 10h4v4h-4z\"></path>";
    };
    readonly 'cloud-download': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 11v8\"></path><path d=\"m8 15 4 4 4-4\"></path>";
    };
    readonly 'cloud-upload': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 19v-8\"></path><path d=\"m8 15 4-4 4 4\"></path>";
    };
    readonly 'database-backup': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v4c0 1.7 3.6 3 8 3\"></path><path d=\"M16 16h5v5\"></path><path d=\"M21 16a5 5 0 1 0-1.5 3.5\"></path>";
    };
    readonly 'database-zap': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m17 14-3 5h4l-2 4\"></path>";
    };
    readonly 'device-tablet': {
        readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly 'hard-drive': {
        readonly body: "<path d=\"M6 3h12l4 9v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7l4-9z\"></path><path d=\"M2 12h20\"></path><path d=\"M6 17h.01\"></path><path d=\"M10 17h.01\"></path>";
    };
    readonly headphones: {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect>";
    };
    readonly keyboard: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M7 13h.01\"></path><path d=\"M11 13h6\"></path><path d=\"M19 13h.01\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly monitor: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
    };
    readonly 'plug-zap': {
        readonly body: "<path d=\"M13 2 8 12h5l-2 10 5-12h-5l2-8z\"></path><path d=\"M4 14h4\"></path><path d=\"M3 18h6\"></path><path d=\"M16 6h5\"></path><path d=\"M15 10h6\"></path>";
    };
    readonly 'server-cog': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><circle cx=\"19\" cy=\"17\" r=\"2\"></circle><path d=\"M19 13v1\"></path><path d=\"M19 20v1\"></path><path d=\"M16.5 14.5l.7.7\"></path><path d=\"m20.8 18.8.7.7\"></path>";
    };
    readonly 'wifi-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M5 13a10 10 0 0 1 5.2-2.7\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
    };
    readonly 'bluetooth-connected': {
        readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
    };
    readonly 'cloud-check': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m9 14 2 2 5-5\"></path>";
    };
    readonly 'cloud-x': {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m10 12 5 5\"></path><path d=\"m15 12-5 5\"></path>";
    };
    readonly 'database-check': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m14 18 2 2 5-5\"></path>";
    };
    readonly 'database-lock': {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v5c0 1.5 2.8 2.7 6.5 3\"></path><rect x=\"14\" y=\"15\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 15v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly mouse: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"5\"></rect><path d=\"M12 6v4\"></path><path d=\"M7 10h10\"></path>";
    };
    readonly network: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly 'monitor-smartphone': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"13\" height=\"10\" rx=\"2\"></rect><path d=\"M7 18h6\"></path><path d=\"M10 14v4\"></path><rect x=\"17\" y=\"10\" width=\"5\" height=\"10\" rx=\"1\"></rect><path d=\"M19 18h1\"></path>";
    };
    readonly router: {
        readonly body: "<rect x=\"4\" y=\"12\" width=\"16\" height=\"7\" rx=\"2\"></rect><path d=\"M8 12V8\"></path><path d=\"M16 12V8\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path>";
    };
    readonly 'router-wifi': {
        readonly body: "<rect x=\"4\" y=\"13\" width=\"16\" height=\"6\" rx=\"2\"></rect><path d=\"M8 13V9\"></path><path d=\"M16 13V9\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path><path d=\"M8 6a6 6 0 0 1 8 0\"></path><path d=\"M10 9a3 3 0 0 1 4 0\"></path>";
    };
    readonly smartphone: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly tablet: {
        readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly usb: {
        readonly body: "<path d=\"M12 3v12\"></path><path d=\"m9 6 3-3 3 3\"></path><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M12 15H8\"></path><path d=\"M12 15h4\"></path><path d=\"M12 15v6\"></path><circle cx=\"12\" cy=\"21\" r=\"1\"></circle>";
    };
    readonly 'barcode-scanner': {
        readonly body: "<path d=\"M4 7V5a2 2 0 0 1 2-2h2\"></path><path d=\"M16 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M20 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M8 21H6a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 8v8\"></path><path d=\"M10 8v8\"></path><path d=\"M14 8v8\"></path><path d=\"M17 8v8\"></path>";
    };
    readonly 'battery-charging': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"m11 8-3 5h4l-2 4\"></path>";
    };
    readonly 'battery-full': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path><path d=\"M16 11v2\"></path>";
    };
    readonly 'battery-low': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path>";
    };
    readonly nfc: {
        readonly body: "<path d=\"M6 8a8 8 0 0 1 0 8\"></path><path d=\"M10 6a12 12 0 0 1 0 12\"></path><path d=\"M14 4a16 16 0 0 1 0 16\"></path><path d=\"M18 7a9 9 0 0 1 0 10\"></path>";
    };
    readonly 'printer-check': {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"m13 18 2 2 5-5\"></path>";
    };
    readonly 'server-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'server-lock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><rect x=\"16\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M17.5 15v-2a2 2 0 0 1 3 0v2\"></path>";
    };
    readonly signal: {
        readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20V8\"></path><path d=\"M20 20V4\"></path>";
    };
    readonly 'signal-low': {
        readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20\"></path><path d=\"M20 20\"></path>";
    };
    readonly smartwatch: {
        readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><path d=\"M11 12h2\"></path>";
    };
    readonly watch: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M9 2h6l1 4H8l1-4z\"></path><path d=\"M8 18h8l-1 4H9l-1-4z\"></path><path d=\"M12 9v3l2 1\"></path>";
    };
    readonly wifi: {
        readonly body: "<path d=\"M5 13a10 10 0 0 1 14 0\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
    };
    readonly 'app-window': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
    };
    readonly 'mobile-camera': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><circle cx=\"12\" cy=\"11\" r=\"3\"></circle><path d=\"M10 7h4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-check': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 2 2 4-4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-home': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 3-3 3 3\"></path><path d=\"M10 12v3h4v-3\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-nav': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 16h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 8h6\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-rotate': {
        readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path>";
    };
    readonly 'mobile-scan': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10v4\"></path><path d=\"M14 10v4\"></path>";
    };
    readonly 'mobile-tab': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 16h8\"></path><path d=\"M10 16v3\"></path><path d=\"M14 16v3\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-vibrate': {
        readonly body: "<path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly 'mobile-x': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'offline-sync': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M21 12a9 9 0 0 1-4.2 7.6\"></path><path d=\"M3 12a9 9 0 0 1 13.7-7.7\"></path><path d=\"M3 16v5h5\"></path><path d=\"M21 8V3h-5\"></path>";
    };
    readonly 'pwa-install': {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v8\"></path><path d=\"m8 11 4 4 4-4\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly browser: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path>";
    };
    readonly cache: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"M17 15a4 4 0 1 1-3 6.7\"></path><path d=\"M17 13v4h-4\"></path>";
    };
    readonly 'desktop-app': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h4\"></path><path d=\"M7 11h8\"></path>";
    };
    readonly 'edge-device': {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 9h4\"></path><path d=\"M18 9h4\"></path><path d=\"M2 15h4\"></path><path d=\"M18 15h4\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly kiosk: {
        readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"16\" rx=\"2\"></rect><path d=\"M9 22h6\"></path><path d=\"M12 19v3\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly 'local-storage': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M4 10h16\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h4\"></path>";
    };
    readonly 'platform-desktop': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h10\"></path>";
    };
    readonly 'platform-mobile': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M10 7h4\"></path><path d=\"M10 11h4\"></path><path d=\"M11 18h2\"></path>";
    };
    readonly 'platform-web': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"M8 8h8\"></path>";
    };
    readonly 'push-device': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M18 6a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S18 9 18 6\"></path>";
    };
    readonly 'push-subscription': {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h4\"></path><path d=\"M15 15a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S15 18 15 15\"></path>";
    };
    readonly 'service-worker': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 7v2\"></path><path d=\"M12 15v2\"></path><path d=\"M7 12h2\"></path><path d=\"M15 12h2\"></path><path d=\"m8.5 8.5 1.4 1.4\"></path><path d=\"m14.1 14.1 1.4 1.4\"></path>";
    };
    readonly storage: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path><path d=\"M8 17h.01\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly biometric: {
        readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path>";
    };
    readonly 'camera-capture': {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly geolocation: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path>";
    };
    readonly 'mobile-bottom-sheet': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path><path d=\"M11 5h2\"></path>";
    };
    readonly 'mobile-drawer': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M7 8h7\"></path><path d=\"M7 12h7\"></path><path d=\"M7 16h7\"></path><path d=\"m15 10 2 2-2 2\"></path>";
    };
    readonly 'mobile-gesture': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 13c2-5 5-5 7 0\"></path><path d=\"M10 13l2 2\"></path>";
    };
    readonly 'mobile-offline': {
        readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M9 8h6\"></path>";
    };
    readonly 'mobile-permission': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"M9 15h6\"></path>";
    };
    readonly 'mobile-sheet': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><rect x=\"8\" y=\"10\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M10 13h4\"></path><path d=\"M11 5h2\"></path>";
    };
    readonly 'orientation-lock': {
        readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path><rect x=\"9\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M10.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
    };
    readonly passkey: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M12 4a4 4 0 0 1 6 0\"></path>";
    };
    readonly 'sensor-alert': {
        readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path><path d=\"M19 3v4\"></path><path d=\"M19 10h.01\"></path>";
    };
    readonly 'vibration-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly wearable: {
        readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly airplay: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m12 15 5 6H7l5-6z\"></path>";
    };
    readonly beacon: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M8 8a6 6 0 0 0 0 8\"></path><path d=\"M16 8a6 6 0 0 1 0 8\"></path><path d=\"M5 5a10 10 0 0 0 0 14\"></path><path d=\"M19 5a10 10 0 0 1 0 14\"></path>";
    };
    readonly 'bluetooth-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"m7 7 10 10-5 4V3l5 4-5 5\"></path><path d=\"M7 17l4-4\"></path>";
    };
    readonly 'camera-switch': {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M7 13h3\"></path><path d=\"m8 11-2 2 2 2\"></path><path d=\"M17 13h-3\"></path><path d=\"m16 15 2-2-2-2\"></path>";
    };
    readonly 'device-hub': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><path d=\"M12 9v3\"></path><path d=\"M6 15v-3h12v3\"></path>";
    };
    readonly 'display-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"m8 10 2 2 5-5\"></path>";
    };
    readonly firmware: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
    };
    readonly gpu: {
        readonly body: "<rect x=\"5\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 10h3\"></path><path d=\"M19 10h3\"></path><path d=\"M9 10h6v4H9z\"></path>";
    };
    readonly 'iot-device': {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v5\"></path><path d=\"M12 17v5\"></path><path d=\"M2 12h5\"></path><path d=\"M17 12h5\"></path>";
    };
    readonly 'mobile-hotspot': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 8a4 4 0 0 1 4 0\"></path><path d=\"M8 6a7 7 0 0 1 8 0\"></path><path d=\"M12 11h.01\"></path>";
    };
    readonly 'printer-error': {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"M18 17v3\"></path><path d=\"M18 23h.01\"></path>";
    };
    readonly 'qr-scanner': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><rect x=\"7\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"14\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"7\" y=\"14\" width=\"3\" height=\"3\"></rect><path d=\"M14 14h3v3\"></path>";
    };
};

declare const adminSecurityIcons: {
    readonly alert: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly approval: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
    };
    readonly audit: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly award: {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"m8.5 12.5-2 8 5.5-3 5.5 3-2-8\"></path>";
    };
    readonly brain: {
        readonly body: "<path d=\"M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9 4z\"></path><path d=\"M15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 15 4z\"></path><path d=\"M7 10h4\"></path><path d=\"M13 14h4\"></path>";
    };
    readonly briefcase: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path><path d=\"M10 12v2h4v-2\"></path>";
    };
    readonly building: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path>";
    };
    readonly calculator: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly error: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly eye: {
        readonly body: "<path d=\"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'eye-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1\"></path><path d=\"M14.1 14.1A3 3 0 0 1 9.9 9.9\"></path><path d=\"M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1\"></path>";
    };
    readonly help: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly info: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 10v6\"></path><path d=\"M12 7h.01\"></path>";
    };
    readonly key: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v3\"></path>";
    };
    readonly lock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path>";
    };
    readonly policy: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M14 3v5h5\"></path>";
    };
    readonly shield: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path>";
    };
    readonly success: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly accessibility: {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path>";
    };
    readonly badge: {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
    };
    readonly 'check-square': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly fingerprint: {
        readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path><path d=\"M3.6 15A8 8 0 0 0 4 12\"></path>";
    };
    readonly id: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"M6 16a3 3 0 0 1 6 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h3\"></path>";
    };
    readonly 'life-buoy': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"m4.9 4.9 4.3 4.3\"></path><path d=\"m14.8 14.8 4.3 4.3\"></path><path d=\"m19.1 4.9-4.3 4.3\"></path><path d=\"m9.2 14.8-4.3 4.3\"></path>";
    };
    readonly 'scale-balanced': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly 'shield-check': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
    };
    readonly 'shield-lock': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><rect x=\"8.5\" y=\"11\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M10 11V9a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'shield-x': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
    };
    readonly 'user-check': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m16 11 2 2 4-4\"></path>";
    };
    readonly 'user-cog': {
        readonly body: "<path d=\"M14 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8\" cy=\"7\" r=\"4\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M18 11v1\"></path><path d=\"M18 18v1\"></path><path d=\"m15.2 12.2.7.7\"></path><path d=\"m20.1 17.1.7.7\"></path>";
    };
    readonly 'user-minus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M16 11h6\"></path>";
    };
    readonly 'user-plus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
    };
    readonly 'user-x': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m17 8 5 5\"></path><path d=\"m22 8-5 5\"></path>";
    };
    readonly 'users-round': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
    };
    readonly unlock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path>";
    };
    readonly user: {
        readonly body: "<path d=\"M20 21a8 8 0 1 0-16 0\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>";
    };
    readonly users: {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
    };
    readonly warning: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'badge-alert': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly 'badge-check': {
        readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
    };
    readonly certificate: {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M8 12.5V22l4-2 4 2v-9.5\"></path>";
    };
    readonly 'key-round': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"4\"></circle><path d=\"M11.5 12.5H22\"></path><path d=\"M18 12.5v3\"></path><path d=\"M21 12.5v2\"></path>";
    };
    readonly keys: {
        readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><path d=\"M10 8h11\"></path><path d=\"M17 8v3\"></path><path d=\"M20 8v3\"></path><circle cx=\"7\" cy=\"17\" r=\"3\"></circle><path d=\"M10 17h8\"></path><path d=\"M15 17v3\"></path>";
    };
    readonly 'lock-keyhole': {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
    };
    readonly 'lock-open': {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
    };
    readonly permission: {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
    };
    readonly role: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 10v10\"></path><path d=\"M15 17h6\"></path>";
    };
    readonly 'scan-face': {
        readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M9 10h.01\"></path><path d=\"M15 10h.01\"></path><path d=\"M9 15a4 4 0 0 0 6 0\"></path>";
    };
    readonly 'shield-alert': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'shield-user': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M7.5 17a4.5 4.5 0 0 1 9 0\"></path>";
    };
    readonly 'user-round': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path>";
    };
    readonly 'user-round-check': {
        readonly body: "<circle cx=\"10\" cy=\"8\" r=\"5\"></circle><path d=\"M2 21a8 8 0 0 1 13-6.3\"></path><path d=\"m16 18 2 2 4-4\"></path>";
    };
    readonly 'users-plus': {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
    };
    readonly agent: {
        readonly body: "<rect x=\"5\" y=\"7\" width=\"14\" height=\"12\" rx=\"4\"></rect><path d=\"M12 3v4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M9 17h6\"></path>";
    };
    readonly 'agent-check': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m15 18 2 2 5-5\"></path>";
    };
    readonly 'agent-x': {
        readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m17 16 5 5\"></path><path d=\"m22 16-5 5\"></path>";
    };
    readonly 'ai-spark': {
        readonly body: "<path d=\"M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z\"></path>";
    };
    readonly 'audit-log': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M17 14.5V16l1 1\"></path>";
    };
    readonly consent: {
        readonly body: "<path d=\"M7 21V8a4 4 0 0 1 8 0v5\"></path><path d=\"M15 13V6a3 3 0 0 1 6 0v8a7 7 0 0 1-7 7H7\"></path><path d=\"m5 14 2 2 4-4\"></path>";
    };
    readonly model: {
        readonly body: "<path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z\"></path><path d=\"M12 12 4 7.5\"></path><path d=\"m12 12 8-4.5\"></path><path d=\"M12 12v9\"></path>";
    };
    readonly prompt: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><path d=\"M12 15h5\"></path>";
    };
    readonly 'prompt-lock': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><rect x=\"13\" y=\"12\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 12v-1.5a1.5 1.5 0 0 1 3 0V12\"></path>";
    };
    readonly 'risk-score': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M8 17h8\"></path><path d=\"m9 13 2 2 4-5\"></path>";
    };
    readonly 'tool-approval': {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m16 19 2 2 4-4\"></path>";
    };
    readonly 'tool-denied': {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m17 17 4 4\"></path><path d=\"m21 17-4 4\"></path>";
    };
    readonly 'api-key': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path>";
    };
    readonly credential: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"M5.5 16a3 3 0 0 1 5 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h2\"></path>";
    };
    readonly organization: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 21v-5h8v5\"></path>";
    };
    readonly 'org-chart': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly secret: {
        readonly body: "<path d=\"M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly 'service-account': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 11v10\"></path><path d=\"M15 18h6\"></path>";
    };
    readonly session: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle>";
    };
    readonly 'session-expired': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><circle cx=\"16\" cy=\"14\" r=\"3\"></circle><path d=\"M16 12.5V14l1 1\"></path><path d=\"m19 17 2 2\"></path>";
    };
    readonly tenant: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><rect x=\"13\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><path d=\"M7 8h.01\"></path><path d=\"M17 8h.01\"></path><path d=\"M7 12h.01\"></path><path d=\"M17 12h.01\"></path><path d=\"M7 20v-4\"></path><path d=\"M17 20v-4\"></path>";
    };
    readonly token: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m15.5 8.5 2 2\"></path><path d=\"m17.5 8.5-2 2\"></path>";
    };
    readonly workspace: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h4\"></path><path d=\"M13 17h3\"></path>";
    };
    readonly 'workspace-lock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><rect x=\"13\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 14v-1.5a1.5 1.5 0 0 1 3 0V14\"></path>";
    };
    readonly 'access-request': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 16h6\"></path><path d=\"M19 13v6\"></path>";
    };
    readonly 'approval-policy': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 9h4\"></path>";
    };
    readonly 'audit-trail': {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M19 6h2\"></path><path d=\"M19 12h2\"></path><path d=\"M19 18h2\"></path>";
    };
    readonly 'data-residency': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly governance: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"m9 15 2 2 4-4\"></path>";
    };
    readonly 'policy-lock': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'data-retention': {
        readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
    };
    readonly scim: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 8h1\"></path><path d=\"M8 11v3\"></path><path d=\"M16 11v3\"></path>";
    };
    readonly sso: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path><path d=\"M4 19h16\"></path>";
    };
    readonly 'trust-center': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><circle cx=\"18\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'user-invite': {
        readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 8v6\"></path><path d=\"M15 11h6\"></path><path d=\"m17 17 2 2 4-4\"></path>";
    };
    readonly 'user-provision': {
        readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 7v8\"></path><path d=\"m15 12 3 3 3-3\"></path><path d=\"M15 7h6\"></path>";
    };
    readonly aria: {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><path d=\"M6 13h12\"></path>";
    };
    readonly 'assistive-mode': {
        readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><circle cx=\"19\" cy=\"18\" r=\"3\"></circle><path d=\"m18 18 1 1 2-2\"></path>";
    };
    readonly 'compliance-evidence': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'consent-record': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m8 17 2 2 5-5\"></path><path d=\"M17 14h3\"></path>";
    };
    readonly 'incident-response': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M18 15a4 4 0 0 1-6.8 2.8L10 16\"></path><path d=\"M10 19v-3h3\"></path>";
    };
    readonly 'keyboard-access': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M8 17h8\"></path><path d=\"m16 14 2 2 4-4\"></path>";
    };
    readonly 'permission-review': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
    };
    readonly privacy: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M2 2l20 20\"></path><path d=\"M9.9 9.9A3 3 0 0 0 14.1 14.1\"></path>";
    };
    readonly 'screen-reader': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 9h10\"></path><path d=\"M7 12h6\"></path><path d=\"M18 18c2-2 2-4 0-6\"></path>";
    };
    readonly 'voice-access': {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path><path d=\"m16 5 2-2\"></path><path d=\"m18 8 3-1\"></path>";
    };
    readonly 'access-expiry': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"m17 17 3 3\"></path>";
    };
    readonly 'audit-event': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"M16 14.5V16l1 1\"></path><path d=\"M20 5h2\"></path>";
    };
    readonly 'data-classification': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h6\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14l3 3\"></path><path d=\"M19 14l-3 3\"></path>";
    };
    readonly 'device-policy': {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"m9 15 2 2 4-4\"></path>";
    };
    readonly 'encryption-key': {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><rect x=\"13\" y=\"4\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 4V2.5a2 2 0 0 1 4 0V4\"></path>";
    };
    readonly 'identity-provider': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"6\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 12v7\"></path><path d=\"M15 16h6\"></path>";
    };
    readonly 'ip-allowlist': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly 'legal-hold': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M17 13v8\"></path><path d=\"M14 16h6\"></path>";
    };
    readonly 'tls-certificate': {
        readonly body: "<path d=\"M6 3h12v12H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M9 15v6l3-2 3 2v-6\"></path><path d=\"m15 5 2 2 4-4\"></path>";
    };
    readonly 'zero-trust': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 2l20 20\"></path>";
    };
    readonly 'x-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
};

declare const workflowIcons: {
    readonly activity: {
        readonly body: "<path d=\"M22 12h-4l-3 8L9 4l-3 8H2\"></path>";
    };
    readonly calendar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path>";
    };
    readonly clock: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path>";
    };
    readonly command: {
        readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
    };
    readonly download: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"M7 10l5 5 5-5\"></path><path d=\"M12 15V3\"></path>";
    };
    readonly filter: {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path>";
    };
    readonly flag: {
        readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h12l-2 4 2 4H5\"></path>";
    };
    readonly inbox: {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path>";
    };
    readonly layers: {
        readonly body: "<path d=\"m12 2 9 5-9 5-9-5 9-5z\"></path><path d=\"m3 12 9 5 9-5\"></path><path d=\"m3 17 9 5 9-5\"></path>";
    };
    readonly link: {
        readonly body: "<path d=\"M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2\"></path><path d=\"M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2\"></path>";
    };
    readonly list: {
        readonly body: "<path d=\"M8 6h13\"></path><path d=\"M8 12h13\"></path><path d=\"M8 18h13\"></path><path d=\"M3 6h.01\"></path><path d=\"M3 12h.01\"></path><path d=\"M3 18h.01\"></path>";
    };
    readonly package: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M7.5 5.5 16.5 10.5\"></path>";
    };
    readonly 'qr-code': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"15\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\"></rect><path d=\"M15 15h2v2h-2z\"></path><path d=\"M19 15h2v6h-6v-2\"></path><path d=\"M12 3v3\"></path><path d=\"M12 12h3\"></path>";
    };
    readonly refresh: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
    };
    readonly rocket: {
        readonly body: "<path d=\"M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5\"></path><path d=\"M9 15 4 20\"></path><path d=\"M15 9l-6 6\"></path><path d=\"M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z\"></path>";
    };
    readonly sliders: {
        readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
    };
    readonly sync: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
    };
    readonly table: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
    };
    readonly tag: {
        readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path>";
    };
    readonly target: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle>";
    };
    readonly tool: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
    };
    readonly trash: {
        readonly body: "<path d=\"M3 6h18\"></path><path d=\"M8 6V4h8v2\"></path><path d=\"M19 6l-1 15H6L5 6\"></path><path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path>";
    };
    readonly branch: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M8.5 8.5 12 15\"></path><path d=\"m15.5 8.5-3.5 6.5\"></path>";
    };
    readonly bug: {
        readonly body: "<rect x=\"7\" y=\"8\" width=\"10\" height=\"12\" rx=\"5\"></rect><path d=\"M9 8 7 5\"></path><path d=\"m15 8 2-3\"></path><path d=\"M3 13h4\"></path><path d=\"M17 13h4\"></path><path d=\"M4 19l3-2\"></path><path d=\"m17 17 3 2\"></path><path d=\"M12 8v12\"></path>";
    };
    readonly 'calendar-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m8 16 2 2 5-5\"></path>";
    };
    readonly 'calendar-clock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
    };
    readonly 'calendar-days': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h.01\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly 'calendar-plus': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v6\"></path><path d=\"M9 17h6\"></path>";
    };
    readonly 'calendar-x': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m9 14 6 6\"></path><path d=\"m15 14-6 6\"></path>";
    };
    readonly grab: {
        readonly body: "<path d=\"M8 5h.01\"></path><path d=\"M12 5h.01\"></path><path d=\"M16 5h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 19h.01\"></path><path d=\"M12 19h.01\"></path><path d=\"M16 19h.01\"></path>";
    };
    readonly history: {
        readonly body: "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"></path><path d=\"M3 3v5h5\"></path><path d=\"M12 7v5l3 2\"></path>";
    };
    readonly kanban: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M6 8h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M18 9h.01\"></path>";
    };
    readonly 'list-check': {
        readonly body: "<path d=\"M10 6h11\"></path><path d=\"M10 12h11\"></path><path d=\"M10 18h11\"></path><path d=\"m3 6 1.5 1.5L8 4\"></path><path d=\"m3 12 1.5 1.5L8 10\"></path><path d=\"m3 18 1.5 1.5L8 16\"></path>";
    };
    readonly 'list-filter': {
        readonly body: "<path d=\"M4 6h16\"></path><path d=\"M7 12h10\"></path><path d=\"M10 18h4\"></path>";
    };
    readonly 'loader-circle': {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path>";
    };
    readonly 'log-in': {
        readonly body: "<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"></path><path d=\"m10 17 5-5-5-5\"></path><path d=\"M15 12H3\"></path>";
    };
    readonly 'log-out': {
        readonly body: "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><path d=\"m16 17 5-5-5-5\"></path><path d=\"M21 12H9\"></path>";
    };
    readonly project: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"14\" y=\"13\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M10 7h2a3 3 0 0 1 3 3v3\"></path><path d=\"M6.5 11v4A2.5 2.5 0 0 0 9 17.5h5\"></path>";
    };
    readonly puzzle: {
        readonly body: "<path d=\"M8 3h4a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2 2v4h-3a2 2 0 1 0 0 4h3v4a2 2 0 0 1-2 2h-4v-3a2 2 0 1 0-4 0v3H6a2 2 0 0 1-2-2v-4h3a2 2 0 1 0 0-4H4V7a4 4 0 0 1 4-4z\"></path>";
    };
    readonly repeat: {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path>";
    };
    readonly 'reply-all': {
        readonly body: "<path d=\"m7 17-5-5 5-5\"></path><path d=\"m12 17-5-5 5-5\"></path><path d=\"M22 18v-2a4 4 0 0 0-4-4H7\"></path>";
    };
    readonly reply: {
        readonly body: "<path d=\"m9 17-5-5 5-5\"></path><path d=\"M20 18v-2a4 4 0 0 0-4-4H4\"></path>";
    };
    readonly 'sliders-horizontal': {
        readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
    };
    readonly 'sliders-vertical': {
        readonly body: "<path d=\"M6 4v8\"></path><path d=\"M6 16v4\"></path><path d=\"M4 14h4\"></path><path d=\"M12 4v4\"></path><path d=\"M12 12v8\"></path><path d=\"M10 10h4\"></path><path d=\"M18 4v10\"></path><path d=\"M18 18v2\"></path><path d=\"M16 16h4\"></path>";
    };
    readonly 'sort-asc': {
        readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 18 3-3 3 3\"></path><path d=\"M20 6v9\"></path>";
    };
    readonly 'sort-desc': {
        readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 12 3 3 3-3\"></path><path d=\"M20 6v9\"></path>";
    };
    readonly stamp: {
        readonly body: "<path d=\"M8 21h8\"></path><path d=\"M6 17h12\"></path><path d=\"M9 13h6l1-8a4 4 0 0 0-8 0l1 8z\"></path><path d=\"M5 17v4h14v-4\"></path>";
    };
    readonly step: {
        readonly body: "<path d=\"M6 4h4v16H6z\"></path><path d=\"M14 4h4v16h-4z\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly timer: {
        readonly body: "<circle cx=\"12\" cy=\"13\" r=\"8\"></circle><path d=\"M12 13l3-3\"></path><path d=\"M9 2h6\"></path><path d=\"M12 2v3\"></path>";
    };
    readonly wrench: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
    };
    readonly upload: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M12 3v12\"></path>";
    };
    readonly automation: {
        readonly body: "<path d=\"M4 7h5\"></path><path d=\"M15 7h5\"></path><circle cx=\"12\" cy=\"7\" r=\"3\"></circle><path d=\"M4 17h5\"></path><path d=\"M15 17h5\"></path><circle cx=\"12\" cy=\"17\" r=\"3\"></circle><path d=\"M12 10v4\"></path>";
    };
    readonly backlog: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"12\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"19\" width=\"12\" height=\"2\" rx=\"1\"></rect>";
    };
    readonly dependency: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 8h3a4 4 0 0 1 4 4v1\"></path><path d=\"m13 10 3 3 3-3\"></path>";
    };
    readonly 'git-branch': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6h3a6 6 0 0 1 6 6v3\"></path>";
    };
    readonly 'git-commit': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 12h6\"></path><path d=\"M16 12h6\"></path>";
    };
    readonly 'git-merge': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6c6 0 9 3 9 9\"></path>";
    };
    readonly 'git-pull-request': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 15V8a2 2 0 0 0-2-2h-3\"></path><path d=\"m14 3-3 3 3 3\"></path>";
    };
    readonly milestone: {
        readonly body: "<path d=\"M4 5h10l6 7-6 7H4z\"></path><path d=\"M9 9h5\"></path><path d=\"M9 13h7\"></path>";
    };
    readonly 'route-turn': {
        readonly body: "<path d=\"M4 6h8a4 4 0 0 1 4 4v11\"></path><path d=\"m12 17 4 4 4-4\"></path><circle cx=\"4\" cy=\"6\" r=\"2\"></circle>";
    };
    readonly 'status-dot': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'task-check': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 2 2 5-5\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly 'task-clock': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"M8 18h8\"></path>";
    };
    readonly 'task-x': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path>";
    };
    readonly timeline: {
        readonly body: "<path d=\"M5 4v16\"></path><circle cx=\"5\" cy=\"7\" r=\"2\"></circle><circle cx=\"5\" cy=\"17\" r=\"2\"></circle><path d=\"M9 7h12\"></path><path d=\"M9 17h12\"></path>";
    };
    readonly webhook: {
        readonly body: "<path d=\"M18 16.5A4 4 0 1 1 14 12\"></path><path d=\"M6 16.5A4 4 0 1 0 10 12\"></path><path d=\"M12 5a4 4 0 0 1 2 7.5\"></path><path d=\"M12 5a4 4 0 0 0-2 7.5\"></path>";
    };
    readonly 'column-add': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M12 9v6\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly 'column-delete': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m10 10 4 4\"></path><path d=\"m14 10-4 4\"></path>";
    };
    readonly 'data-join': {
        readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M9.5 9.5 14.5 14.5\"></path><path d=\"M14 8h4\"></path><path d=\"M16 6v4\"></path>";
    };
    readonly 'data-split': {
        readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 12h3a3 3 0 0 0 3-3\"></path><path d=\"M9 12h3a3 3 0 0 1 3 3\"></path>";
    };
    readonly 'data-transform': {
        readonly body: "<path d=\"M4 7h8\"></path><path d=\"m9 4 3 3-3 3\"></path><path d=\"M20 17h-8\"></path><path d=\"m15 14-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
    };
    readonly 'filter-check': {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 2 2 5-5\"></path>";
    };
    readonly 'filter-x': {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 5 5\"></path><path d=\"m13 18-5 5\"></path>";
    };
    readonly 'row-add': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
    };
    readonly 'row-delete': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"m10 8 4 4\"></path><path d=\"m14 8-4 4\"></path>";
    };
    readonly 'table-export': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 14v6\"></path><path d=\"m16 17 3 3 3-3\"></path>";
    };
    readonly 'table-import': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 20v-6\"></path><path d=\"m16 17 3-3 3 3\"></path>";
    };
    readonly 'table-search': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v7\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
    };
    readonly 'table-settings': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><circle cx=\"16\" cy=\"16\" r=\"2\"></circle><path d=\"M16 12v1\"></path><path d=\"M16 19v1\"></path><path d=\"M12 16h1\"></path><path d=\"M19 16h1\"></path>";
    };
    readonly 'workflow-branch': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M12 10v6\"></path>";
    };
    readonly 'approval-pending': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path>";
    };
    readonly 'approval-rejected': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
    };
    readonly 'approval-request': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly escalation: {
        readonly body: "<path d=\"M4 18h16\"></path><path d=\"M7 18v-5\"></path><path d=\"M12 18V9\"></path><path d=\"M17 18V5\"></path><path d=\"m14 8 3-3 3 3\"></path>";
    };
    readonly handoff: {
        readonly body: "<path d=\"M4 13h8\"></path><path d=\"m9 10 3 3-3 3\"></path><circle cx=\"6\" cy=\"7\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M14 17h-2a4 4 0 0 1-4-4\"></path>";
    };
    readonly queue: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
    };
    readonly 'queue-next': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 8 4 4-4 4\"></path>";
    };
    readonly retry: {
        readonly body: "<path d=\"M21 12a9 9 0 1 1-3-6.7\"></path><path d=\"M21 3v6h-6\"></path><path d=\"M12 8v4l3 2\"></path>";
    };
    readonly rollback: {
        readonly body: "<path d=\"M3 7h11a6 6 0 1 1 0 12H8\"></path><path d=\"m7 3-4 4 4 4\"></path>";
    };
    readonly runbook: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 16 2 2 4-4\"></path>";
    };
    readonly sla: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly 'task-priority': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"M17 8v6\"></path><path d=\"M17 18h.01\"></path>";
    };
    readonly 'ai-run': {
        readonly body: "<path d=\"m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"M5 21h14\"></path><path d=\"m14 18 3 3 3-3\"></path>";
    };
    readonly 'event-stream': {
        readonly body: "<path d=\"M4 6h4\"></path><path d=\"M4 12h8\"></path><path d=\"M4 18h4\"></path><path d=\"M14 6h6\"></path><path d=\"M16 12h4\"></path><path d=\"M14 18h6\"></path><path d=\"m10 6 4 6-4 6\"></path>";
    };
    readonly 'html-partial': {
        readonly body: "<path d=\"m8 6-5 6 5 6\"></path><path d=\"m16 6 5 6-5 6\"></path><path d=\"M10 4h4\"></path><path d=\"M10 20h4\"></path><path d=\"M12 4v16\"></path>";
    };
    readonly hydrate: {
        readonly body: "<path d=\"M4 8h8\"></path><path d=\"m9 5 3 3-3 3\"></path><path d=\"M20 16h-8\"></path><path d=\"m15 13-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
    };
    readonly job: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'job-failed': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"m14 14 5 5\"></path><path d=\"m19 14-5 5\"></path>";
    };
    readonly 'job-running': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 14a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'mcp-call': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 9 2 4 4-2\"></path>";
    };
    readonly 'mcp-result': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 17 2 2 5-5\"></path>";
    };
    readonly orchestration: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"m8 10 3 6\"></path><path d=\"m16 10-3 6\"></path>";
    };
    readonly 'partial-swap': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><rect x=\"13\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"m8 9 3 3-3 3\"></path><path d=\"m16 15-3-3 3-3\"></path>";
    };
    readonly polling: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly rehydrate: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly revalidate: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"m8 12 2 2 5-5\"></path>";
    };
    readonly sse: {
        readonly body: "<path d=\"M4 12h4\"></path><path d=\"M12 6v12\"></path><path d=\"M16 8c2 1 3 2.3 3 4s-1 3-3 4\"></path><path d=\"M19 5c3 2 4 4.3 4 7s-1 5-4 7\"></path>";
    };
    readonly websocket: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"m17 10-3 2 3 2\"></path><path d=\"M3 12h4\"></path><path d=\"M17 12h4\"></path>";
    };
    readonly appointment: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"m14 16 2 2 4-4\"></path>";
    };
    readonly booking: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
    };
    readonly 'checklist-clock': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10 1 1 2-2\"></path><path d=\"M13 10h3\"></path><circle cx=\"14\" cy=\"16\" r=\"3\"></circle><path d=\"M14 14.5V16l1 1\"></path>";
    };
    readonly 'dispatch-board': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h5\"></path><path d=\"M13 17h3\"></path><path d=\"M6 14h.01\"></path>";
    };
    readonly 'incident-alert': {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M4 21h16\"></path>";
    };
    readonly maintenance: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><circle cx=\"18\" cy=\"18\" r=\"3\"></circle>";
    };
    readonly 'process-loop': {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly recurrence: {
        readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><path d=\"M12 8v8\"></path><path d=\"M9 12h6\"></path>";
    };
    readonly repair: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"M18 15v6\"></path><path d=\"M15 18h6\"></path>";
    };
    readonly rota: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15h4\"></path><path d=\"M7 18h3\"></path><path d=\"M13 18h5\"></path>";
    };
    readonly 'service-window': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"16\" r=\"3\"></circle><path d=\"M12 14.5V16l1 1\"></path>";
    };
    readonly shift: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M5 19h14\"></path><path d=\"M7 5l10 14\"></path>";
    };
    readonly 'triage-queue': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"M17 18v4\"></path><path d=\"M15 20h4\"></path>";
    };
    readonly 'work-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"m15 15 2 2 4-4\"></path>";
    };
    readonly workflow: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"14\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h3a3 3 0 0 1 3 3v4\"></path><path d=\"M12 17H9a3 3 0 0 1-3-3v-4\"></path>";
    };
    readonly 'batch-job': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 17 3 2-3 2\"></path>";
    };
    readonly 'blocked-task': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M8.5 8.5 15.5 15.5\"></path>";
    };
    readonly 'calendar-sync': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M16 15a4 4 0 1 1-3-3.9\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'change-request': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"M16 15h5\"></path><path d=\"m18 12 3 3-3 3\"></path>";
    };
    readonly 'decision-node': {
        readonly body: "<path d=\"m12 3 8 9-8 9-8-9 8-9z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'event-trigger': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l4 2\"></path><path d=\"M19 5l3-3\"></path><path d=\"M22 2v6h-6\"></path>";
    };
    readonly 'form-approval': {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m9 17 2 2 5-5\"></path>";
    };
    readonly 'job-queue': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect><circle cx=\"19\" cy=\"7\" r=\"2\"></circle>";
    };
    readonly 'manual-step': {
        readonly body: "<path d=\"M7 11V5a2 2 0 0 1 4 0v6\"></path><path d=\"M11 11V4a2 2 0 0 1 4 0v7\"></path><path d=\"M15 12V7a2 2 0 0 1 4 0v8a7 7 0 0 1-14 0v-2\"></path>";
    };
    readonly 'process-map': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"9\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M9 6.5h6\"></path><path d=\"M12 9v6\"></path>";
    };
    readonly release: {
        readonly body: "<path d=\"M12 3l3 6 6 1-4.5 4.4 1 6.6L12 18l-5.5 3 1-6.6L3 10l6-1 3-6z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
    };
    readonly 'rule-engine': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"M16 11v2\"></path><path d=\"M16 17v2\"></path><path d=\"M12 15h2\"></path><path d=\"M18 15h2\"></path>";
    };
    readonly 'task-delegated': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 14 3-3\"></path><path d=\"M21 11v4h-4\"></path>";
    };
    readonly 'workflow-template': {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><rect x=\"6\" y=\"7\" width=\"5\" height=\"4\" rx=\"1\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"4\" rx=\"1\"></rect><path d=\"M11 9h3a3 3 0 0 1 3 3v1\"></path>";
    };
};

declare const domainIcons: {
    readonly box: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path>";
    };
    readonly compass: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path>";
    };
    readonly globe: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path>";
    };
    readonly heart: {
        readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path>";
    };
    readonly location: {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>";
    };
    readonly map: {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path>";
    };
    readonly anchor: {
        readonly body: "<circle cx=\"12\" cy=\"5\" r=\"3\"></circle><path d=\"M12 8v13\"></path><path d=\"M5 12H2a10 10 0 0 0 20 0h-3\"></path>";
    };
    readonly flask: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M7 16h10\"></path>";
    };
    readonly 'heart-pulse': {
        readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path><path d=\"M3 13h4l2-4 3 8 2-4h7\"></path>";
    };
    readonly magnet: {
        readonly body: "<path d=\"M6 3v8a6 6 0 0 0 12 0V3\"></path><path d=\"M6 8h4\"></path><path d=\"M14 8h4\"></path><path d=\"M6 3h4\"></path><path d=\"M14 3h4\"></path>";
    };
    readonly presentation: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M12 16v5\"></path><path d=\"m8 21 4-5 4 5\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
    };
    readonly school: {
        readonly body: "<path d=\"m3 10 9-6 9 6-9 6-9-6z\"></path><path d=\"M7 12v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 10v6\"></path>";
    };
    readonly sitemap: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
    };
    readonly suitcase: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path>";
    };
    readonly train: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M9 19 7 22\"></path><path d=\"m15 19 2 3\"></path><path d=\"M8 8h8\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path>";
    };
    readonly wand: {
        readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"m5 3 .7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3z\"></path>";
    };
    readonly ambulance: {
        readonly body: "<path d=\"M3 17h2\"></path><path d=\"M19 17h2\"></path><path d=\"M5 17V7h9l4 4h3v6\"></path><path d=\"M8 11h4\"></path><path d=\"M10 9v4\"></path><circle cx=\"7\" cy=\"17\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
    };
    readonly bed: {
        readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M12 12h6a3 3 0 0 1 3 3v-1\"></path>";
    };
    readonly bus: {
        readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M7 8h10\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M8 19 6 22\"></path><path d=\"m16 19 2 3\"></path>";
    };
    readonly car: {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><path d=\"M7 17v2\"></path><path d=\"M17 17v2\"></path><path d=\"M7 12h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly clinic: {
        readonly body: "<path d=\"M4 21V8l8-5 8 5v13\"></path><path d=\"M9 21v-6h6v6\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path>";
    };
    readonly dna: {
        readonly body: "<path d=\"M7 3c7 4 7 14 0 18\"></path><path d=\"M17 3c-7 4-7 14 0 18\"></path><path d=\"M8 7h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 17h8\"></path>";
    };
    readonly factory: {
        readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path>";
    };
    readonly 'flag-triangle': {
        readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h14l-4 5 4 5H5\"></path>";
    };
    readonly 'globe-lock': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
    };
    readonly 'graduation-cap': {
        readonly body: "<path d=\"m3 9 9-5 9 5-9 5-9-5z\"></path><path d=\"M7 11v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 9v6\"></path>";
    };
    readonly leaf: {
        readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path>";
    };
    readonly library: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path>";
    };
    readonly 'map-pin-check': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 10 2 2 4-4\"></path>";
    };
    readonly 'map-pin-plus': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
    };
    readonly 'map-pin-x': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 7 6 6\"></path><path d=\"m15 7-6 6\"></path>";
    };
    readonly microscope: {
        readonly body: "<path d=\"M6 18h12\"></path><path d=\"M8 22h8\"></path><path d=\"M12 18v4\"></path><path d=\"M9 3h6v5H9z\"></path><path d=\"M12 8v4a4 4 0 0 1-4 4\"></path><path d=\"M15 8l3 3\"></path>";
    };
    readonly plane: {
        readonly body: "<path d=\"M22 2 11 13\"></path><path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path>";
    };
    readonly pill: {
        readonly body: "<path d=\"M10 21 3 14a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z\"></path><path d=\"m8.5 8.5 7 7\"></path>";
    };
    readonly recycle: {
        readonly body: "<path d=\"m7 19-3-5 3-5\"></path><path d=\"M4 14h7\"></path><path d=\"m17 5 3 5-3 5\"></path><path d=\"M20 10h-7\"></path><path d=\"m9 5 3-3 3 3\"></path><path d=\"M12 2v7\"></path>";
    };
    readonly route: {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path>";
    };
    readonly stethoscope: {
        readonly body: "<path d=\"M6 4v5a4 4 0 0 0 8 0V4\"></path><path d=\"M4 4h4\"></path><path d=\"M12 4h4\"></path><path d=\"M10 13v2a5 5 0 0 0 10 0v-1\"></path><circle cx=\"20\" cy=\"12\" r=\"2\"></circle>";
    };
    readonly syringe: {
        readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M3 21l6-6\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"m12 12 4 4\"></path>";
    };
    readonly 'traffic-light': {
        readonly body: "<rect x=\"8\" y=\"2\" width=\"8\" height=\"20\" rx=\"4\"></rect><circle cx=\"12\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"17\" r=\"1.5\"></circle>";
    };
    readonly wheelchair: {
        readonly body: "<circle cx=\"10\" cy=\"5\" r=\"2\"></circle><path d=\"M10 7v6h5l3 6\"></path><path d=\"M8 11a6 6 0 1 0 5.6 8\"></path><path d=\"M10 13h4\"></path>";
    };
    readonly 'wind-turbine': {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"2\"></circle><path d=\"M12 10v11\"></path><path d=\"M12 8 5 5\"></path><path d=\"M12 8l7-3\"></path><path d=\"M12 8l2 8\"></path>";
    };
    readonly 'blood-drop': {
        readonly body: "<path d=\"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z\"></path>";
    };
    readonly campus: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
    };
    readonly 'cargo-ship': {
        readonly body: "<path d=\"M4 17h16l-3 4H7l-3-4z\"></path><path d=\"M7 17V9h9l3 8\"></path><path d=\"M9 9V5h5v4\"></path><path d=\"M3 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0\"></path>";
    };
    readonly classroom: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"11\" rx=\"2\"></rect><path d=\"M8 21l4-6 4 6\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
    };
    readonly container: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"2\"></rect><path d=\"M7 7v10\"></path><path d=\"M11 7v10\"></path><path d=\"M15 7v10\"></path><path d=\"M19 7v10\"></path>";
    };
    readonly 'currency-dollar': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 6v12\"></path><path d=\"M16 8.5c-1-.8-2.3-1.2-4-1.2-2 0-3 .8-3 2s1 1.8 3 2.2 4 1 4 3-1.4 3.2-4 3.2c-1.8 0-3.2-.5-4.2-1.4\"></path>";
    };
    readonly 'currency-rupee': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9 7h7\"></path><path d=\"M9 10h7\"></path><path d=\"M14 7a3 3 0 0 1-3 5H9l6 5\"></path>";
    };
    readonly exam: {
        readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"m14 17 1.5 1.5L19 15\"></path>";
    };
    readonly 'first-aid': {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
    };
    readonly forklift: {
        readonly body: "<path d=\"M5 16V7h7l3 5v4\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"15\" cy=\"18\" r=\"2\"></circle><path d=\"M15 12h5v8\"></path><path d=\"M20 16h2\"></path><path d=\"M8 10h4\"></path>";
    };
    readonly insurance: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path>";
    };
    readonly investment: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17v-5\"></path><path d=\"M12 17V7\"></path><path d=\"M18 17v-8\"></path><path d=\"m6 10 6-5 6 4\"></path><path d=\"M16 5h4v4\"></path>";
    };
    readonly 'lab-report': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 17h8\"></path><path d=\"M10 9h4\"></path><path d=\"M11 9v5l-2 3\"></path><path d=\"M13 9v5l2 3\"></path>";
    };
    readonly ledger: {
        readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path>";
    };
    readonly loan: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"M15 14l2 2 4-4\"></path>";
    };
    readonly 'medical-chart': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h3l2-5 2 7 2-4h3\"></path>";
    };
    readonly 'parcel-location': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 4-2.2\"></path><path d=\"M12 13v8\"></path><path d=\"M20 16c0 3-4 6-4 6s-4-3-4-6a4 4 0 1 1 8 0z\"></path><circle cx=\"16\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly patient: {
        readonly body: "<circle cx=\"12\" cy=\"7\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
    };
    readonly tax: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle>";
    };
    readonly vaccine: {
        readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M4 20l5-5\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"M7 18 4 21\"></path><path d=\"M12 12h4\"></path>";
    };
    readonly 'building-hospital': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path>";
    };
    readonly 'delivery-bike': {
        readonly body: "<circle cx=\"6\" cy=\"17\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M9 17h4l2-6h-4\"></path><path d=\"M13 11l3 6\"></path><path d=\"M8 11h3\"></path><path d=\"M5 8h4\"></path>";
    };
    readonly drone: {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"2\"></rect><circle cx=\"4\" cy=\"4\" r=\"2\"></circle><circle cx=\"20\" cy=\"4\" r=\"2\"></circle><circle cx=\"4\" cy=\"20\" r=\"2\"></circle><circle cx=\"20\" cy=\"20\" r=\"2\"></circle><path d=\"M9 9 5.5 5.5\"></path><path d=\"m15 9 3.5-3.5\"></path><path d=\"M9 15 5.5 18.5\"></path><path d=\"m15 15 3.5 3.5\"></path>";
    };
    readonly 'fleet-vehicle': {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M7 12h10\"></path><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path>";
    };
    readonly 'geo-fence': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
    };
    readonly 'map-route': {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><path d=\"M6 9c3 4 9 1 12 5\"></path>";
    };
    readonly 'route-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 4 4\"></path><path d=\"M12 20h3\"></path>";
    };
    readonly 'route-plus': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M18 4v6\"></path><path d=\"M15 7h6\"></path>";
    };
    readonly satellite: {
        readonly body: "<path d=\"M5 12 2 9l7-7 3 3-7 7z\"></path><path d=\"m12 5 7 7\"></path><path d=\"M14 14a4 4 0 0 1-4-4\"></path><path d=\"M18 18a8 8 0 0 1-8-8\"></path><path d=\"M21 21a11 11 0 0 1-11-11\"></path>";
    };
    readonly 'traffic-cone': {
        readonly body: "<path d=\"m12 3 7 18H5l7-18z\"></path><path d=\"M9 11h6\"></path><path d=\"M7 17h10\"></path>";
    };
    readonly agriculture: {
        readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path><path d=\"M4 13c4 0 7 3 8 7\"></path>";
    };
    readonly 'case-management': {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path>";
    };
    readonly crm: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M14 7h7\"></path><path d=\"M14 11h5\"></path><path d=\"M14 15h7\"></path><path d=\"M14 19h4\"></path>";
    };
    readonly energy: {
        readonly body: "<path d=\"M13 2 6 13h5l-2 9 8-12h-5l1-8z\"></path><path d=\"M4 21h16\"></path>";
    };
    readonly hospitality: {
        readonly body: "<path d=\"M4 21V8a4 4 0 0 1 8 0v13\"></path><path d=\"M12 11h8v10\"></path><path d=\"M16 15h.01\"></path><path d=\"M16 18h.01\"></path><path d=\"M8 15h.01\"></path>";
    };
    readonly hr: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><path d=\"M17 7h4\"></path><path d=\"M19 5v4\"></path><path d=\"M16 14h6\"></path><path d=\"M16 18h4\"></path>";
    };
    readonly legal: {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
    };
    readonly manufacturing: {
        readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path><path d=\"M18 9h3\"></path>";
    };
    readonly 'public-sector': {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
    };
    readonly 'quality-control': {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"m8 14 2 2 5-5\"></path><circle cx=\"18\" cy=\"16\" r=\"2\"></circle>";
    };
    readonly 'real-estate': {
        readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M16 5h3v4\"></path>";
    };
    readonly recruiting: {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><circle cx=\"18\" cy=\"10\" r=\"3\"></circle><path d=\"M18 13v6\"></path><path d=\"M15 16h6\"></path>";
    };
    readonly 'service-desk': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path>";
    };
    readonly 'support-case': {
        readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly 'ticket-queue': {
        readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path><path d=\"M6 21h12\"></path>";
    };
    readonly tourism: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 9 8h6l3 13\"></path><path d=\"M12 8V3\"></path><path d=\"M9 3h6\"></path><path d=\"M8 14h8\"></path>";
    };
    readonly 'asset-maintenance': {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M16 15a3 3 0 1 1-4.5 2.6\"></path><path d=\"M16 12v3h-3\"></path>";
    };
    readonly 'care-team': {
        readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 13v5\"></path><path d=\"M9.5 15.5h5\"></path>";
    };
    readonly dispatch: {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path><path d=\"m12 3 3 3-3 3\"></path>";
    };
    readonly facilities: {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M6 3V1\"></path>";
    };
    readonly 'field-service': {
        readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M12 4v5\"></path><path d=\"M9.5 6.5h5\"></path>";
    };
    readonly 'fleet-route': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M5 14h4l1 2\"></path><path d=\"M3 16h8\"></path>";
    };
    readonly 'patient-portal': {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"10\" cy=\"11\" r=\"2\"></circle><path d=\"M7 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
    };
    readonly 'repair-order': {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M17 14v6\"></path><path d=\"M14 17h6\"></path>";
    };
    readonly 'site-visit': {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M8 21h8\"></path><path d=\"M12 18v3\"></path>";
    };
    readonly triage: {
        readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 13v6\"></path><path d=\"M13 16h6\"></path>";
    };
    readonly claims: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m15 17 2 2 4-4\"></path>";
    };
    readonly construction: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21V9l6-5 6 5v12\"></path><path d=\"M9 21v-7h6v7\"></path><path d=\"M4 9h16\"></path>";
    };
    readonly 'hotel-room': {
        readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M15 8h4v4\"></path>";
    };
    readonly 'insurance-policy': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path>";
    };
    readonly lab: {
        readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><circle cx=\"11\" cy=\"13\" r=\"1\"></circle>";
    };
    readonly 'meter-reading': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
    };
    readonly mining: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 12 4l6 17\"></path><path d=\"M8 15h8\"></path><path d=\"M10 10h4\"></path><path d=\"M5 6h14\"></path>";
    };
    readonly pharmacy: {
        readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path><path d=\"M7 20h10\"></path>";
    };
    readonly radiology: {
        readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M12 7v10\"></path><path d=\"M7 12h10\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
    };
    readonly restaurant: {
        readonly body: "<path d=\"M7 3v8\"></path><path d=\"M5 3v4a2 2 0 0 0 4 0V3\"></path><path d=\"M7 11v10\"></path><path d=\"M16 3v18\"></path><path d=\"M13 3h3a4 4 0 0 1 0 8h-3\"></path>";
    };
    readonly telemedicine: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
    };
    readonly 'utility-pole': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M5 11h14\"></path>";
    };
    readonly airport: {
        readonly body: "<path d=\"M3 21h18\"></path><path d=\"M12 3v12\"></path><path d=\"m4 10 8 3 8-3\"></path><path d=\"m8 18 4-3 4 3\"></path>";
    };
    readonly 'branch-office': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M4 14h16\"></path>";
    };
    readonly 'call-center': {
        readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"2\"></circle>";
    };
    readonly 'data-center': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h8\"></path><path d=\"M8 19h8\"></path><path d=\"M6 7h.01\"></path><path d=\"M6 11h.01\"></path><path d=\"M6 15h.01\"></path>";
    };
    readonly 'emergency-room': {
        readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path><path d=\"M18 5l3-3\"></path>";
    };
    readonly 'government-office': {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path><path d=\"M10 14h4\"></path>";
    };
    readonly 'insurance-claim': {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h5\"></path><path d=\"m14 17 2 2 4-4\"></path>";
    };
    readonly 'inventory-site': {
        readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M12 3v5\"></path>";
    };
    readonly 'logistics-hub': {
        readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h6\"></path><path d=\"m8 8 3 7\"></path><path d=\"m16 8-3 7\"></path><path d=\"M12 3v3\"></path>";
    };
    readonly 'power-grid': {
        readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M4 15h16\"></path><circle cx=\"12\" cy=\"7\" r=\"2\"></circle><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle>";
    };
};

declare const iconSets: {
    readonly brand: {
        readonly batoi: {
            readonly body: "<path fill=\"currentColor\" stroke=\"none\" d=\"M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z\"></path><path fill=\"currentColor\" stroke=\"none\" d=\"M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z\"></path>";
        };
        readonly uif: {
            readonly body: "<path d=\"M18 16 L18 38 Q18 52 32 52 Q46 52 46 38 L46 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><rect x=\"46\" y=\"12\" width=\"12\" height=\"12\" rx=\"3\" fill=\"currentColor\" stroke=\"none\"></rect>";
            readonly viewBox: "0 0 64 64";
        };
    };
    readonly 'core-ui': {
        readonly 'arrow-down': {
            readonly body: "<path d=\"M12 5v14\"></path><path d=\"m19 12-7 7-7-7\"></path>";
        };
        readonly 'arrow-left': {
            readonly body: "<path d=\"M19 12H5\"></path><path d=\"m12 19-7-7 7-7\"></path>";
        };
        readonly 'arrow-right': {
            readonly body: "<path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path>";
        };
        readonly 'arrow-up': {
            readonly body: "<path d=\"M12 19V5\"></path><path d=\"m5 12 7-7 7 7\"></path>";
        };
        readonly bot: {
            readonly body: "<rect x=\"5\" y=\"8\" width=\"14\" height=\"10\" rx=\"3\"></rect><path d=\"M12 8V4\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M9 18v2\"></path><path d=\"M15 18v2\"></path>";
        };
        readonly check: {
            readonly body: "<path d=\"m20 6-11 11-5-5\"></path>";
        };
        readonly 'check-circle': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly 'chevron-down': {
            readonly body: "<path d=\"m6 9 6 6 6-6\"></path>";
        };
        readonly 'chevron-left': {
            readonly body: "<path d=\"m15 18-6-6 6-6\"></path>";
        };
        readonly 'chevron-right': {
            readonly body: "<path d=\"m9 18 6-6-6-6\"></path>";
        };
        readonly 'chevron-up': {
            readonly body: "<path d=\"m18 15-6-6-6 6\"></path>";
        };
        readonly 'circle-dot': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly close: {
            readonly body: "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>";
        };
        readonly code: {
            readonly body: "<path d=\"m16 18 6-6-6-6\"></path><path d=\"m8 6-6 6 6 6\"></path>";
        };
        readonly drag: {
            readonly body: "<path d=\"M9 5h.01\"></path><path d=\"M15 5h.01\"></path><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M9 19h.01\"></path><path d=\"M15 19h.01\"></path>";
        };
        readonly 'external-link': {
            readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>";
        };
        readonly grid: {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect>";
        };
        readonly hash: {
            readonly body: "<path d=\"M5 9h14\"></path><path d=\"M4 15h14\"></path><path d=\"M10 3 8 21\"></path><path d=\"M16 3l-2 18\"></path>";
        };
        readonly home: {
            readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path>";
        };
        readonly maximize: {
            readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path>";
        };
        readonly menu: {
            readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 18h16\"></path>";
        };
        readonly minus: {
            readonly body: "<path d=\"M5 12h14\"></path>";
        };
        readonly moon: {
            readonly body: "<path d=\"M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z\"></path>";
        };
        readonly 'more-horizontal': {
            readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
        };
        readonly 'more-vertical': {
            readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
        };
        readonly pause: {
            readonly body: "<path d=\"M8 5v14\"></path><path d=\"M16 5v14\"></path>";
        };
        readonly play: {
            readonly body: "<path d=\"m8 5 11 7-11 7V5z\"></path>";
        };
        readonly plus: {
            readonly body: "<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>";
        };
        readonly redo: {
            readonly body: "<path d=\"M21 7v6h-6\"></path><path d=\"M21 13a8 8 0 1 0-2.3 5.7\"></path>";
        };
        readonly search: {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path>";
        };
        readonly settings: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z\"></path>";
        };
        readonly sidebar: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
        };
        readonly spark: {
            readonly body: "<path d=\"m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z\"></path><path d=\"m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z\"></path>";
        };
        readonly star: {
            readonly body: "<path d=\"m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z\"></path>";
        };
        readonly sun: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"M4.9 4.9l1.4 1.4\"></path><path d=\"M17.7 17.7l1.4 1.4\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"M4.9 19.1l1.4-1.4\"></path><path d=\"M17.7 6.3l1.4-1.4\"></path>";
        };
        readonly terminal: {
            readonly body: "<path d=\"m4 17 6-5-6-5\"></path><path d=\"M12 19h8\"></path>";
        };
        readonly theme: {
            readonly body: "<path d=\"M4 21v-7\"></path><path d=\"M4 10V3\"></path><path d=\"M12 21v-9\"></path><path d=\"M12 8V3\"></path><path d=\"M20 21v-5\"></path><path d=\"M20 12V3\"></path><path d=\"M2 14h4\"></path><path d=\"M10 8h4\"></path><path d=\"M18 16h4\"></path>";
        };
        readonly 'arrow-down-left': {
            readonly body: "<path d=\"M17 7 7 17\"></path><path d=\"M17 17H7V7\"></path>";
        };
        readonly 'arrow-down-right': {
            readonly body: "<path d=\"m7 7 10 10\"></path><path d=\"M7 17h10V7\"></path>";
        };
        readonly 'arrow-up-left': {
            readonly body: "<path d=\"M17 17 7 7\"></path><path d=\"M7 17V7h10\"></path>";
        };
        readonly 'arrow-up-right': {
            readonly body: "<path d=\"M7 17 17 7\"></path><path d=\"M7 7h10v10\"></path>";
        };
        readonly 'chevrons-down': {
            readonly body: "<path d=\"m7 7 5 5 5-5\"></path><path d=\"m7 13 5 5 5-5\"></path>";
        };
        readonly 'chevrons-left': {
            readonly body: "<path d=\"m11 17-5-5 5-5\"></path><path d=\"m18 17-5-5 5-5\"></path>";
        };
        readonly 'chevrons-right': {
            readonly body: "<path d=\"m6 17 5-5-5-5\"></path><path d=\"m13 17 5-5-5-5\"></path>";
        };
        readonly 'chevrons-up': {
            readonly body: "<path d=\"m7 17 5-5 5 5\"></path><path d=\"m7 11 5-5 5 5\"></path>";
        };
        readonly columns: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
        };
        readonly 'corner-down-left': {
            readonly body: "<path d=\"M9 10 4 15l5 5\"></path><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"></path>";
        };
        readonly 'corner-down-right': {
            readonly body: "<path d=\"m15 10 5 5-5 5\"></path><path d=\"M4 4v7a4 4 0 0 0 4 4h12\"></path>";
        };
        readonly 'corner-up-left': {
            readonly body: "<path d=\"M9 14 4 9l5-5\"></path><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\"></path>";
        };
        readonly 'corner-up-right': {
            readonly body: "<path d=\"m15 14 5-5-5-5\"></path><path d=\"M4 20v-7a4 4 0 0 1 4-4h12\"></path>";
        };
        readonly 'layout-dashboard': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"3\" width=\"8\" height=\"5\" rx=\"2\"></rect><rect x=\"13\" y=\"10\" width=\"8\" height=\"11\" rx=\"2\"></rect><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"2\"></rect>";
        };
        readonly 'layout-list': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"12\" width=\"18\" height=\"4\" rx=\"1\"></rect><rect x=\"3\" y=\"19\" width=\"18\" height=\"2\" rx=\"1\"></rect>";
        };
        readonly 'layout-panel-left': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M13 8h4\"></path><path d=\"M13 12h5\"></path>";
        };
        readonly 'layout-panel-top': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h8\"></path>";
        };
        readonly 'panel-bottom': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 14h18\"></path>";
        };
        readonly 'panel-left': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
        };
        readonly 'panel-right': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path>";
        };
        readonly 'panel-top': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path>";
        };
        readonly 'play-circle': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m10 8 6 4-6 4V8z\"></path>";
        };
        readonly 'plus-circle': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly 'plus-square': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly power: {
            readonly body: "<path d=\"M12 2v10\"></path><path d=\"M18.4 6.6a9 9 0 1 1-12.8 0\"></path>";
        };
        readonly 'rotate-clockwise': {
            readonly body: "<path d=\"M21 12a9 9 0 1 1-2.6-6.4\"></path><path d=\"M21 3v6h-6\"></path>";
        };
        readonly 'search-check': {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8 11 2 2 4-4\"></path>";
        };
        readonly 'search-x': {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m8.5 8.5 5 5\"></path><path d=\"m13.5 8.5-5 5\"></path>";
        };
        readonly 'square-dot': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly 'square-stack': {
            readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path>";
        };
        readonly stop: {
            readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1\"></rect>";
        };
        readonly 'stop-circle': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"></rect>";
        };
        readonly undo: {
            readonly body: "<path d=\"M3 7v6h6\"></path><path d=\"M3 13a8 8 0 1 1 2.3 5.7\"></path>";
        };
        readonly 'arrow-left-right': {
            readonly body: "<path d=\"M8 7 3 12l5 5\"></path><path d=\"M3 12h18\"></path><path d=\"m16 7 5 5-5 5\"></path>";
        };
        readonly 'arrow-up-down': {
            readonly body: "<path d=\"M7 8 12 3l5 5\"></path><path d=\"M12 3v18\"></path><path d=\"m7 16 5 5 5-5\"></path>";
        };
        readonly ban: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M5.6 5.6 18.4 18.4\"></path>";
        };
        readonly 'check-check': {
            readonly body: "<path d=\"m3 12 3 3 5-6\"></path><path d=\"m12 12 3 3 6-8\"></path>";
        };
        readonly circle: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
        };
        readonly 'circle-alert': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly 'circle-help': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
        };
        readonly ellipsis: {
            readonly body: "<path d=\"M5 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M19 12h.01\"></path>";
        };
        readonly 'ellipsis-vertical': {
            readonly body: "<path d=\"M12 5h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M12 19h.01\"></path>";
        };
        readonly maximize2: {
            readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"m21 3-7 7\"></path><path d=\"M9 21H3v-6\"></path><path d=\"m3 21 7-7\"></path>";
        };
        readonly minimize: {
            readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path><path d=\"M8 8h8v8H8z\"></path>";
        };
        readonly minimize2: {
            readonly body: "<path d=\"M4 14h6v6\"></path><path d=\"m10 14-7 7\"></path><path d=\"M20 10h-6V4\"></path><path d=\"m14 10 7-7\"></path>";
        };
        readonly move: {
            readonly body: "<path d=\"M12 2v20\"></path><path d=\"m8 6 4-4 4 4\"></path><path d=\"m8 18 4 4 4-4\"></path><path d=\"M2 12h20\"></path><path d=\"m6 8-4 4 4 4\"></path><path d=\"m18 8 4 4-4 4\"></path>";
        };
        readonly 'move-horizontal': {
            readonly body: "<path d=\"M4 12h16\"></path><path d=\"m8 8-4 4 4 4\"></path><path d=\"m16 8 4 4-4 4\"></path>";
        };
        readonly 'move-vertical': {
            readonly body: "<path d=\"M12 4v16\"></path><path d=\"m8 8 4-4 4 4\"></path><path d=\"m8 16 4 4 4-4\"></path>";
        };
        readonly 'panel-close': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path>";
        };
        readonly 'panel-open': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path>";
        };
        readonly pin: {
            readonly body: "<path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2H5v-2l4-4-1-6z\"></path>";
        };
        readonly 'pin-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M12 17v5\"></path><path d=\"M8 3h8l-1 6 4 4v2h-4\"></path><path d=\"M9 15H5v-2l3-3\"></path>";
        };
        readonly 'rotate-counter-clockwise': {
            readonly body: "<path d=\"M3 12a9 9 0 1 0 2.6-6.4\"></path><path d=\"M3 3v6h6\"></path>";
        };
        readonly scan: {
            readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 12h10\"></path>";
        };
        readonly 'scan-line': {
            readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M3 12h18\"></path>";
        };
        readonly select: {
            readonly body: "<path d=\"M4 4h16v16H4z\"></path><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly 'toggle-left': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly 'toggle-right': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"5\"></rect><circle cx=\"16\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly checkbox: {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect>";
        };
        readonly 'checkbox-checked': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly 'checkbox-minus': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 12h8\"></path>";
        };
        readonly 'field-required': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m16.5 7.5 1 1\"></path><path d=\"m17.5 7.5-1 1\"></path>";
        };
        readonly input: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h10\"></path>";
        };
        readonly 'input-error': {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h7\"></path><path d=\"m16 10 3 3\"></path><path d=\"m19 10-3 3\"></path>";
        };
        readonly 'input-password': {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 14v2\"></path>";
        };
        readonly 'input-search': {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"10\" cy=\"12\" r=\"2\"></circle><path d=\"m12 14 3 2\"></path>";
        };
        readonly 'radio-checked': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
        };
        readonly 'radio-unchecked': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle>";
        };
        readonly textarea: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
        };
        readonly 'validation-error': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly breadcrumb: {
            readonly body: "<path d=\"M3 12h4\"></path><path d=\"m7 8 4 4-4 4\"></path><path d=\"M11 12h4\"></path><path d=\"m15 8 4 4-4 4\"></path><path d=\"M19 12h2\"></path>";
        };
        readonly 'command-palette': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h10\"></path><path d=\"m7 13 3 2-3 2\"></path><path d=\"M12 17h5\"></path>";
        };
        readonly 'density-comfortable': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
        };
        readonly 'density-compact': {
            readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"3\" rx=\"1\"></rect><rect x=\"4\" y=\"16\" width=\"16\" height=\"3\" rx=\"1\"></rect>";
        };
        readonly 'empty-box': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path>";
        };
        readonly 'empty-search': {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
        };
        readonly 'empty-state': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 10h8\"></path><path d=\"M9 14h6\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly 'focus-mode': {
            readonly body: "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"></path><path d=\"M16 3h3a2 2 0 0 1 2 2v3\"></path><path d=\"M21 16v3a2 2 0 0 1-2 2h-3\"></path><path d=\"M8 21H5a2 2 0 0 1-2-2v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly loading: {
            readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path><path d=\"M21 12h-4\"></path>";
        };
        readonly 'nav-back': {
            readonly body: "<path d=\"M15 6 9 12l6 6\"></path><path d=\"M9 12h12\"></path><path d=\"M3 5v14\"></path>";
        };
        readonly 'nav-forward': {
            readonly body: "<path d=\"m9 6 6 6-6 6\"></path><path d=\"M3 12h12\"></path><path d=\"M21 5v14\"></path>";
        };
        readonly 'quick-action': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M13 3 7 14h5l-1 7 6-11h-5l1-7z\"></path>";
        };
        readonly 'sidebar-collapse': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m15 9-3 3 3 3\"></path><path d=\"m19 9-3 3 3 3\"></path>";
        };
        readonly 'sidebar-expand': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"m12 9 3 3-3 3\"></path><path d=\"m16 9 3 3-3 3\"></path>";
        };
        readonly shortcut: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h6\"></path><path d=\"M15 13h2\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly skeleton: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"3\" rx=\"1.5\"></rect><rect x=\"4\" y=\"16\" width=\"14\" height=\"3\" rx=\"1.5\"></rect>";
        };
        readonly 'split-view': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M7 9h2\"></path><path d=\"M15 9h2\"></path><path d=\"M7 14h2\"></path><path d=\"M15 14h2\"></path>";
        };
        readonly spotlight: {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"m11 6 1.2 3.3 3.3 1.2-3.3 1.2L11 15l-1.2-3.3L6.5 10.5l3.3-1.2L11 6z\"></path>";
        };
        readonly 'state-error': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly 'state-success': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly 'state-warning': {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly tour: {
            readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"M9 8h6\"></path><path d=\"M9 11h4\"></path><path d=\"m18 17 3 3\"></path>";
        };
        readonly 'app-launcher': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"4\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"5\" height=\"5\" rx=\"1\"></rect>";
        };
        readonly 'app-shell': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M8 9v11\"></path><path d=\"M12 13h5\"></path><path d=\"M12 17h4\"></path>";
        };
        readonly 'bottom-sheet': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M4 13h16\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10h4\"></path>";
        };
        readonly 'command-key': {
            readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
        };
        readonly dock: {
            readonly body: "<rect x=\"4\" y=\"16\" width=\"16\" height=\"4\" rx=\"2\"></rect><rect x=\"6\" y=\"6\" width=\"3\" height=\"7\" rx=\"1\"></rect><rect x=\"11\" y=\"4\" width=\"3\" height=\"9\" rx=\"1\"></rect><rect x=\"16\" y=\"8\" width=\"3\" height=\"5\" rx=\"1\"></rect>";
        };
        readonly 'floating-action': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 18l3 3\"></path>";
        };
        readonly gesture: {
            readonly body: "<path d=\"M7 14c2-6 5-8 8-6 2 1 3 4 2 7\"></path><path d=\"M7 14l3 3\"></path><path d=\"M7 14l-3 3\"></path><path d=\"M12 21c3-1 5-3 6-6\"></path>";
        };
        readonly inspector: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M14 4v16\"></path><path d=\"M17 8h2\"></path><path d=\"M17 12h2\"></path><path d=\"M17 16h1\"></path><circle cx=\"8\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly launcher: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m12 6 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z\"></path>";
        };
        readonly navigator: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path><path d=\"M12 3v3\"></path><path d=\"M12 18v3\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
        };
        readonly onboarding: {
            readonly body: "<path d=\"M5 4h14v10H5z\"></path><path d=\"M8 18h8\"></path><path d=\"M12 14v4\"></path><path d=\"m9 9 2 2 4-4\"></path><path d=\"M19 17l2 2\"></path>";
        };
        readonly resizer: {
            readonly body: "<path d=\"M4 14v6h6\"></path><path d=\"M20 10V4h-6\"></path><path d=\"m14 4 6 6\"></path><path d=\"m4 14 6 6\"></path><path d=\"M8 16l8-8\"></path>";
        };
        readonly 'shell-command': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"M12 15h5\"></path><path d=\"M3 9h18\"></path>";
        };
        readonly stepper: {
            readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"12\" r=\"3\"></circle><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path>";
        };
        readonly 'status-bar': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 16h18\"></path><path d=\"M7 18h.01\"></path><path d=\"M11 18h4\"></path><path d=\"M17 18h.01\"></path>";
        };
        readonly 'touch-target': {
            readonly body: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v3\"></path><path d=\"M12 19v3\"></path><path d=\"M2 12h3\"></path><path d=\"M19 12h3\"></path>";
        };
        readonly wizard: {
            readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"M7 5h4\"></path><path d=\"M7 9h2\"></path>";
        };
        readonly 'workspace-switcher': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"13\" y=\"12\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M11 8h3a3 3 0 0 1 3 3v1\"></path><path d=\"M13 16h-3a3 3 0 0 1-3-3v-1\"></path>";
        };
        readonly 'action-bar': {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M7 12h.01\"></path><path d=\"M11 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M19 12h.01\"></path>";
        };
        readonly 'context-panel': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M13 4v16\"></path><path d=\"M16 8h2\"></path><path d=\"M16 12h2\"></path><path d=\"M16 16h1\"></path>";
        };
        readonly 'filter-chip': {
            readonly body: "<rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" rx=\"5\"></rect><path d=\"M8 12h6\"></path><path d=\"m16 10 2 2-2 2\"></path>";
        };
        readonly 'keyboard-shortcut': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M7 13h3\"></path><path d=\"M12 13h5\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly 'side-panel': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M15 4v16\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h4\"></path><path d=\"M7 16h3\"></path>";
        };
        readonly 'top-bar': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h6\"></path>";
        };
        readonly 'x-square': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
        };
        readonly 'zoom-in': {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M11 8v6\"></path><path d=\"M8 11h6\"></path>";
        };
        readonly 'zoom-out': {
            readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
        };
    };
    readonly charts: {
        readonly 'area-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-5 3 3 5-7v12H7z\"></path>";
        };
        readonly 'bar-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16V9\"></path><path d=\"M12 16V5\"></path><path d=\"M17 16v-4\"></path>";
        };
        readonly chart: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
        };
        readonly dashboard: {
            readonly body: "<path d=\"M4 13a8 8 0 1 1 16 0\"></path><path d=\"M12 13l4-4\"></path><path d=\"M5 19h14\"></path>";
        };
        readonly 'donut-chart': {
            readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v6\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly 'gauge-chart': {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path>";
        };
        readonly histogram: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17v-5\"></path><path d=\"M11 17V7\"></path><path d=\"M15 17v-8\"></path><path d=\"M19 17v-3\"></path>";
        };
        readonly 'line-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path>";
        };
        readonly 'pie-chart': {
            readonly body: "<path d=\"M21 12A9 9 0 1 1 12 3v9h9z\"></path><path d=\"M12 3a9 9 0 0 1 9 9h-9V3z\"></path>";
        };
        readonly 'radar-chart': {
            readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"m12 7 4 3v4l-4 3-4-3v-4l4-3z\"></path><path d=\"M12 3v18\"></path><path d=\"M4 8l16 8\"></path><path d=\"M20 8 4 16\"></path>";
        };
        readonly 'scatter-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"10\" r=\"1.5\"></circle><circle cx=\"17\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"16\" r=\"1.5\"></circle>";
        };
        readonly sparkline: {
            readonly body: "<path d=\"m3 16 4-4 3 2 4-6 3 4 4-5\"></path>";
        };
        readonly 'chart-candlestick': {
            readonly body: "<path d=\"M4 3v18h17\"></path><path d=\"M8 7v8\"></path><rect x=\"6\" y=\"9\" width=\"4\" height=\"4\"></rect><path d=\"M14 5v11\"></path><rect x=\"12\" y=\"7\" width=\"4\" height=\"6\"></rect><path d=\"M20 10v8\"></path><rect x=\"18\" y=\"12\" width=\"4\" height=\"4\"></rect>";
        };
        readonly 'chart-column': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect>";
        };
        readonly 'chart-no-axes': {
            readonly body: "<path d=\"m4 16 4-5 3 3 4-7 5 4\"></path><circle cx=\"8\" cy=\"11\" r=\"1\"></circle><circle cx=\"15\" cy=\"7\" r=\"1\"></circle><circle cx=\"20\" cy=\"11\" r=\"1\"></circle>";
        };
        readonly 'chart-stacked': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M7 12h10\"></path>";
        };
        readonly 'axis-x': {
            readonly body: "<path d=\"M3 18h18\"></path><path d=\"m18 15 3 3-3 3\"></path><path d=\"M7 6v12\"></path><path d=\"M12 10v8\"></path><path d=\"M17 13v5\"></path>";
        };
        readonly 'axis-y': {
            readonly body: "<path d=\"M6 21V3\"></path><path d=\"m3 6 3-3 3 3\"></path><path d=\"M6 18h12\"></path><path d=\"M6 13h8\"></path><path d=\"M6 8h5\"></path>";
        };
        readonly 'bubble-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"2\"></circle><circle cx=\"14\" cy=\"10\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"1.5\"></circle>";
        };
        readonly 'chart-combo': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path><path d=\"M7 17v-4\"></path><path d=\"M12 17v-7\"></path><path d=\"M17 17v-5\"></path>";
        };
        readonly 'chart-network': {
            readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path>";
        };
        readonly 'chart-spline': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16c3-8 6 4 9-4 1-3 3-5 5-5\"></path>";
        };
        readonly 'chart-step': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-5h4V7h5\"></path>";
        };
        readonly 'conversion-funnel': {
            readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M8 9h8\"></path>";
        };
        readonly dial: {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l3-5\"></path><path d=\"M7 19h10\"></path><path d=\"M7 15h.01\"></path><path d=\"M17 15h.01\"></path>";
        };
        readonly forecast: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M18 7h3v3\"></path><path d=\"M7 8h.01\"></path><path d=\"M11 6h.01\"></path><path d=\"M15 5h.01\"></path>";
        };
        readonly 'funnel-chart': {
            readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path>";
        };
        readonly heatmap: {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"3\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"3\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"10\" y=\"10\" width=\"5\" height=\"5\"></rect><rect x=\"17\" y=\"10\" width=\"4\" height=\"5\"></rect><rect x=\"3\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"10\" y=\"17\" width=\"5\" height=\"4\"></rect><rect x=\"17\" y=\"17\" width=\"4\" height=\"4\"></rect>";
        };
        readonly 'horizontal-bar-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 8h10\"></path><path d=\"M7 12h14\"></path><path d=\"M7 16h7\"></path>";
        };
        readonly kpi: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 14h3\"></path><path d=\"M12 14h5\"></path><path d=\"m7 10 3 2 3-4 4 3\"></path>";
        };
        readonly meter: {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M8 19h8\"></path><path d=\"M6 15h.01\"></path><path d=\"M18 15h.01\"></path>";
        };
        readonly 'progress-ring': {
            readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v4\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle>";
        };
        readonly regression: {
            readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"7\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"11\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"8\" r=\"1.5\"></circle><path d=\"M6 17 19 6\"></path>";
        };
        readonly scorecard: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M7 9h5\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h7\"></path><circle cx=\"17\" cy=\"9\" r=\"1\"></circle>";
        };
        readonly 'stacked-area-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7v10H6z\"></path><path d=\"m6 17 4-3 4 1 4-4\"></path>";
        };
        readonly 'table-chart': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m6 17 3-3 3 2 5-5\"></path>";
        };
        readonly treemap: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M12 4v16\"></path><path d=\"M3 12h9\"></path><path d=\"M12 9h9\"></path><path d=\"M16 9v11\"></path>";
        };
        readonly 'trend-down': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 4\"></path><path d=\"M19 9v4h-4\"></path>";
        };
        readonly 'trend-up': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 5-5 4 4 4-8\"></path><path d=\"M15 7h4v4\"></path>";
        };
        readonly 'ab-test': {
            readonly body: "<path d=\"M4 19 8 5h2l4 14\"></path><path d=\"M6 14h6\"></path><path d=\"M15 5h3a3 3 0 0 1 0 6h-3V5z\"></path><path d=\"M15 11h4a4 4 0 0 1 0 8h-4v-8z\"></path>";
        };
        readonly cohort: {
            readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"9\" r=\"2\"></circle><circle cx=\"14\" cy=\"8\" r=\"2\"></circle><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M8 11v6\"></path><path d=\"M14 10v7\"></path><path d=\"M17 17v1\"></path>";
        };
        readonly experiment: {
            readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M10 12h4\"></path>";
        };
        readonly 'goal-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"15\" cy=\"9\" r=\"5\"></circle><circle cx=\"15\" cy=\"9\" r=\"2\"></circle><path d=\"m7 17 4-4 2 2 6-6\"></path>";
        };
        readonly 'growth-loop': {
            readonly body: "<path d=\"M17 3h4v4\"></path><path d=\"M21 3 14 10\"></path><path d=\"M7 21H3v-4\"></path><path d=\"M3 21l7-7\"></path><path d=\"M4 9a8 8 0 0 1 13-4\"></path><path d=\"M20 15a8 8 0 0 1-13 4\"></path>";
        };
        readonly retention: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16c2-7 5-7 7 0 1.5 4 3.5 2 5-3\"></path><path d=\"M7 8h.01\"></path><path d=\"M12 8h.01\"></path><path d=\"M17 8h.01\"></path>";
        };
        readonly segment: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 3v9h9\"></path><path d=\"M12 12 6 18\"></path>";
        };
        readonly 'target-metric': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><path d=\"M17 7h4v4\"></path><path d=\"m21 7-5 5\"></path>";
        };
        readonly activation: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17V6\"></path><path d=\"m14 9 3-3 3 3\"></path>";
        };
        readonly benchmark: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h12\"></path><path d=\"M6 12h8\"></path><path d=\"M6 8h4\"></path><path d=\"M18 5v14\"></path>";
        };
        readonly churn: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 8 5 5 4-4 4 6\"></path><path d=\"M19 11v4h-4\"></path>";
        };
        readonly 'expansion-revenue': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17V7\"></path><path d=\"M17 17V5\"></path><path d=\"m15 7 2-2 2 2\"></path>";
        };
        readonly 'forecast-band': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-6 4 3 4-7\"></path><path d=\"m6 13 4-4 4 2 4-5\"></path><path d=\"m6 20 4-5 4 4 4-8\"></path>";
        };
        readonly ltv: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M6 8h3\"></path><path d=\"M6 11h5\"></path><path d=\"M17 7h4v4\"></path>";
        };
        readonly mrr: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17V9l3 4 3-4v8\"></path><path d=\"M15 17V9h3a2 2 0 0 1 0 4h-3\"></path><path d=\"m18 13 3 4\"></path>";
        };
        readonly nps: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 15a5 5 0 0 1 10 0\"></path><path d=\"M7 9h.01\"></path><path d=\"M17 9h.01\"></path><path d=\"M10 18h4\"></path>";
        };
        readonly 'revenue-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
        };
        readonly roi: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 16 4-4 3 3 4-7\"></path><path d=\"m16 8 2-2 2 2\"></path><path d=\"M8 8h.01\"></path><path d=\"M12 8h.01\"></path>";
        };
        readonly 'session-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-4\"></path><path d=\"M17 17V6\"></path><circle cx=\"17\" cy=\"6\" r=\"2\"></circle>";
        };
        readonly 'win-rate': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 3 3 7-10\"></path><path d=\"M7 8h4\"></path><path d=\"M7 12h3\"></path><path d=\"M17 8h4v4\"></path>";
        };
        readonly 'adoption-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-6\"></path><path d=\"M17 17V7\"></path><path d=\"m14 10 3-3 3 3\"></path>";
        };
        readonly 'capacity-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"8\" width=\"3\" height=\"9\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"11\"></rect><rect x=\"16\" y=\"11\" width=\"3\" height=\"6\"></rect><path d=\"M6 5h13\"></path>";
        };
        readonly 'cohort-grid': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"6\" width=\"3\" height=\"3\"></rect><rect x=\"6\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"11\" y=\"11\" width=\"3\" height=\"3\"></rect><rect x=\"16\" y=\"16\" width=\"3\" height=\"3\"></rect>";
        };
        readonly 'contribution-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"M7 8h10\"></path><path d=\"M12 12h5\"></path>";
        };
        readonly 'dependency-chart': {
            readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M3 21h18\"></path>";
        };
        readonly 'error-rate': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-5 3 4 5-8\"></path><path d=\"M16 14l4 4\"></path><path d=\"m20 14-4 4\"></path>";
        };
        readonly latency: {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path><path d=\"M12 3v3\"></path><path d=\"M4 15h3\"></path><path d=\"M17 15h3\"></path>";
        };
        readonly percentile: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-7 4 3 4-8\"></path><path d=\"M6 12h12\"></path><path d=\"M6 8h8\"></path>";
        };
        readonly saturation: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-3\"></path><path d=\"M5 7h14\"></path><path d=\"M5 13h14\"></path>";
        };
        readonly 'throughput-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 16h4v-4h4V8h5\"></path><path d=\"m16 5 3 3-3 3\"></path>";
        };
        readonly 'vertical-bar-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 17V9\"></path><path d=\"M12 17V6\"></path><path d=\"M16 17v-5\"></path>";
        };
        readonly 'waterfall-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"12\" width=\"3\" height=\"5\"></rect><rect x=\"11\" y=\"8\" width=\"3\" height=\"4\"></rect><rect x=\"16\" y=\"10\" width=\"3\" height=\"7\"></rect><path d=\"M9 12h2\"></path><path d=\"M14 10h2\"></path>";
        };
        readonly 'anomaly-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 16 4-4 3 3 5-8\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle><path d=\"M18 4v1\"></path><path d=\"M18 9v1\"></path>";
        };
        readonly 'baseline-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 12h13\"></path><path d=\"m6 16 4-5 4 3 5-7\"></path>";
        };
        readonly 'box-plot': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M8 7v10\"></path><rect x=\"6\" y=\"10\" width=\"4\" height=\"4\"></rect><path d=\"M16 5v14\"></path><rect x=\"14\" y=\"8\" width=\"4\" height=\"7\"></rect>";
        };
        readonly 'burndown-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 7 4 4 3 2 5 4\"></path><path d=\"M6 17h12\"></path>";
        };
        readonly 'burnup-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m6 17 4-4 3-2 5-4\"></path><path d=\"M6 7h12\"></path>";
        };
        readonly 'control-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 8h13\"></path><path d=\"M6 16h13\"></path><path d=\"m6 12 4-2 4 4 5-2\"></path>";
        };
        readonly 'distribution-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M6 17c2-8 4-8 6 0 2-8 4-8 6 0\"></path><path d=\"M6 17h12\"></path>";
        };
        readonly 'gantt-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 7h7\"></path><path d=\"M10 12h8\"></path><path d=\"M6 17h10\"></path><path d=\"M7 5v14\"></path>";
        };
        readonly 'health-score': {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 9h2l2 5 2-8 2 3h2\"></path>";
        };
        readonly 'leaderboard-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"11\" width=\"3\" height=\"6\"></rect><rect x=\"11\" y=\"7\" width=\"3\" height=\"10\"></rect><rect x=\"16\" y=\"13\" width=\"3\" height=\"4\"></rect><path d=\"M12 4h1\"></path>";
        };
        readonly 'map-chart': {
            readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly 'matrix-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"5\"></rect>";
        };
        readonly 'pareto-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V9\"></path><path d=\"M12 17v-5\"></path><path d=\"M17 17v-8\"></path><path d=\"m6 8 4 3 4-1 5-5\"></path>";
        };
        readonly 'sankey-chart': {
            readonly body: "<path d=\"M4 7h5\"></path><path d=\"M4 17h5\"></path><path d=\"M15 12h5\"></path><path d=\"M9 7c4 0 2 5 6 5\"></path><path d=\"M9 17c4 0 2-5 6-5\"></path><rect x=\"3\" y=\"5\" width=\"2\" height=\"4\"></rect><rect x=\"19\" y=\"10\" width=\"2\" height=\"4\"></rect>";
        };
        readonly 'bullet-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"9\" width=\"12\" height=\"6\"></rect><path d=\"M6 12h9\"></path><path d=\"M16 7v10\"></path>";
        };
        readonly 'funnel-stage': {
            readonly body: "<path d=\"M4 5h16l-6 7v5l-4 2v-7L4 5z\"></path><path d=\"M7 9h10\"></path><path d=\"M9 13h6\"></path><circle cx=\"18\" cy=\"18\" r=\"2\"></circle>";
        };
        readonly 'metric-card': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h5\"></path><path d=\"M7 14h10\"></path><path d=\"m14 10 2-2 3 3\"></path><path d=\"M16 8v6\"></path>";
        };
        readonly 'pivot-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><rect x=\"6\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"13\" y=\"6\" width=\"5\" height=\"5\"></rect><rect x=\"6\" y=\"13\" width=\"5\" height=\"5\"></rect><path d=\"M13 15h5\"></path><path d=\"m16 12 2 3-2 3\"></path>";
        };
        readonly 'variance-chart': {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17V8\"></path><path d=\"M12 17V5\"></path><path d=\"M17 17v-6\"></path><path d=\"M6 12h13\"></path><path d=\"m17 8 2 2 2-2\"></path>";
        };
    };
    readonly commerce: {
        readonly bank: {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M4 18h16\"></path>";
        };
        readonly card: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h3\"></path>";
        };
        readonly cart: {
            readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path>";
        };
        readonly cash: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 9v6\"></path>";
        };
        readonly 'credit-card': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path>";
        };
        readonly receipt: {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path>";
        };
        readonly 'badge-dollar': {
            readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
        };
        readonly 'badge-percent': {
            readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8 16 8-8\"></path><circle cx=\"9\" cy=\"9\" r=\"1\"></circle><circle cx=\"15\" cy=\"15\" r=\"1\"></circle>";
        };
        readonly barcode: {
            readonly body: "<path d=\"M4 5v14\"></path><path d=\"M7 5v14\"></path><path d=\"M11 5v14\"></path><path d=\"M13 5v14\"></path><path d=\"M17 5v14\"></path><path d=\"M20 5v14\"></path>";
        };
        readonly gift: {
            readonly body: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M3 12h18\"></path><path d=\"M12 8v13\"></path><path d=\"M12 8H8.5A2.5 2.5 0 1 1 11 5.5L12 8z\"></path><path d=\"M12 8h3.5A2.5 2.5 0 1 0 13 5.5L12 8z\"></path>";
        };
        readonly invoice: {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path>";
        };
        readonly landmark: {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M3 21h18\"></path>";
        };
        readonly 'shopping-bag': {
            readonly body: "<path d=\"M6 8h12l1 13H5L6 8z\"></path><path d=\"M9 8a3 3 0 0 1 6 0\"></path>";
        };
        readonly store: {
            readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M4 10a2 2 0 0 0 4 0\"></path><path d=\"M8 10a2 2 0 0 0 4 0\"></path><path d=\"M12 10a2 2 0 0 0 4 0\"></path><path d=\"M16 10a2 2 0 0 0 4 0\"></path>";
        };
        readonly ticket: {
            readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path>";
        };
        readonly truck: {
            readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle>";
        };
        readonly vault: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path><path d=\"M18 9h.01\"></path><path d=\"M18 15h.01\"></path>";
        };
        readonly wallet: {
            readonly body: "<path d=\"M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12\"></path><path d=\"M16 13h5\"></path><path d=\"M17 13h.01\"></path>";
        };
        readonly coins: {
            readonly body: "<ellipse cx=\"8\" cy=\"6\" rx=\"5\" ry=\"3\"></ellipse><path d=\"M3 6v4c0 1.7 2.2 3 5 3s5-1.3 5-3V6\"></path><path d=\"M11 9.5c1-.9 2.5-1.5 4-1.5 2.8 0 5 1.3 5 3s-2.2 3-5 3c-1.5 0-3-.4-4-1.1\"></path><path d=\"M10 13v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-5\"></path>";
        };
        readonly coupon: {
            readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path>";
        };
        readonly 'dollar-sign': {
            readonly body: "<path d=\"M12 2v20\"></path><path d=\"M17 5.5A5 5 0 0 0 12 4c-3 0-5 1.5-5 3.5 0 5 10 2.5 10 7.5 0 2-2 3.5-5 3.5a6 6 0 0 1-5.5-2.5\"></path>";
        };
        readonly 'hand-coins': {
            readonly body: "<path d=\"M3 15h4l4 4h6a3 3 0 0 0 3-3\"></path><path d=\"M7 15l3-3h4a2 2 0 0 1 0 4h-3\"></path><circle cx=\"17\" cy=\"6\" r=\"3\"></circle><path d=\"M17 4v4\"></path><path d=\"M15 6h4\"></path>";
        };
        readonly 'package-check': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path>";
        };
        readonly 'package-open': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path><path d=\"m3 8 9 5 9-5\"></path>";
        };
        readonly 'package-plus': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
        };
        readonly 'package-x': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m9.5 12.5 5 5\"></path><path d=\"m14.5 12.5-5 5\"></path>";
        };
        readonly percent: {
            readonly body: "<path d=\"m19 5-14 14\"></path><circle cx=\"7\" cy=\"7\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
        };
        readonly refund: {
            readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"M12 8v8\"></path><path d=\"M15 10.5A3 3 0 0 0 12 9c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path>";
        };
        readonly scale: {
            readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
        };
        readonly ship: {
            readonly body: "<path d=\"M3 17h18l-2 4H5l-2-4z\"></path><path d=\"M5 17V8h14v9\"></path><path d=\"M9 8V4h6v4\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
        };
        readonly 'shopping-cart-check': {
            readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path>";
        };
        readonly 'shopping-cart-plus': {
            readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M13 9v6\"></path><path d=\"M10 12h6\"></path>";
        };
        readonly warehouse: {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path>";
        };
        readonly billable: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v10\"></path><path d=\"M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 1-3 2.3 0 3.2 6 1.4 6 4.6 0 1.2-1.3 2.1-3 2.1a4 4 0 0 1-3.5-1.8\"></path><path d=\"M18 18l3 3\"></path>";
        };
        readonly billing: {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
        };
        readonly checkout: {
            readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"m9 11 2 2 5-5\"></path><path d=\"M4 22h16\"></path>";
        };
        readonly dispute: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M12 13v2\"></path><path d=\"M12 17h.01\"></path><path d=\"m16 14 3 3\"></path><path d=\"m19 14-3 3\"></path>";
        };
        readonly dunning: {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 14v3\"></path><path d=\"M15 20h.01\"></path>";
        };
        readonly estimate: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M8 9h4\"></path>";
        };
        readonly 'payment-failed': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"m9 13 6 4\"></path><path d=\"m15 13-6 4\"></path>";
        };
        readonly 'payment-link': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15a3 3 0 0 0 4.2 0l1-1a3 3 0 0 0-4.2-4.2l-.6.6\"></path>";
        };
        readonly 'payment-method': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h3\"></path><path d=\"M14 15h4\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
        };
        readonly payout: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path>";
        };
        readonly 'price-tag': {
            readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path><path d=\"M12 8h4\"></path>";
        };
        readonly quote: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h8\"></path><path d=\"M8 11h5\"></path><path d=\"m16 17 2 2 4-4\"></path>";
        };
        readonly subscription: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"M16 15a3 3 0 1 0 2.8 4\"></path><path d=\"M19 15v3h-3\"></path>";
        };
        readonly 'tax-receipt': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 17 6-6\"></path><circle cx=\"10\" cy=\"12\" r=\"1\"></circle><circle cx=\"14\" cy=\"16\" r=\"1\"></circle>";
        };
        readonly usage: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 16V9\"></path><path d=\"M12 16v-4\"></path><path d=\"M16 16v-7\"></path><path d=\"M7 19h10\"></path>";
        };
        readonly 'cart-abandoned': {
            readonly body: "<circle cx=\"9\" cy=\"20\" r=\"1\"></circle><circle cx=\"17\" cy=\"20\" r=\"1\"></circle><path d=\"M3 4h2l2.5 11h10L20 7H6\"></path><path d=\"M12 9v4\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'discount-code': {
            readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M8 9h.01\"></path><path d=\"M16 15h.01\"></path><path d=\"m9 16 6-8\"></path><path d=\"M13 6v12\"></path>";
        };
        readonly fulfillment: {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M17 15h4\"></path>";
        };
        readonly inventory: {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M10 8h4\"></path>";
        };
        readonly 'inventory-alert': {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M12 7v5\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'order-cancelled': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
        };
        readonly 'order-check': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"m10 16 2 2 5-5\"></path>";
        };
        readonly 'order-pending': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
        };
        readonly 'pos-terminal': {
            readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"18\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h2\"></path><path d=\"M14 15h1\"></path>";
        };
        readonly procurement: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><path d=\"m15 17 2 2 4-4\"></path>";
        };
        readonly 'purchase-order': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M8 8h3\"></path>";
        };
        readonly return: {
            readonly body: "<path d=\"M9 7H4v5\"></path><path d=\"M4 12a8 8 0 1 0 2.3-5.7\"></path><path d=\"m21 8-6-4-6 4 6 4 6-4z\"></path><path d=\"M9 8v6l6 4 6-4V8\"></path>";
        };
        readonly 'shipment-track': {
            readonly body: "<path d=\"M3 6h11v10H3z\"></path><path d=\"M14 10h4l3 3v3h-7v-6z\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"17\" cy=\"18\" r=\"2\"></circle><path d=\"M10 3h8\"></path><path d=\"m15 1 3 2-3 2\"></path>";
        };
        readonly 'shipping-label': {
            readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"M15 15h.01\"></path><path d=\"M6 3l12 18\"></path>";
        };
        readonly 'account-payable': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M15 15h5\"></path><path d=\"m17 13 3 2-3 2\"></path>";
        };
        readonly 'account-receivable': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M20 15h-5\"></path><path d=\"m18 13-3 2 3 2\"></path>";
        };
        readonly 'bill-pay': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 17 2 2 5-5\"></path>";
        };
        readonly 'card-terminal': {
            readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h2\"></path><path d=\"M13 15h3\"></path><path d=\"M9 19h6\"></path>";
        };
        readonly 'cash-register': {
            readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M9 14h.01\"></path><path d=\"M13 14h.01\"></path><path d=\"M17 14h.01\"></path><path d=\"M8 18h8\"></path>";
        };
        readonly chargeback: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 16H6v-3\"></path><path d=\"M6 13a5 5 0 0 0 8 4\"></path><path d=\"M15 13h3v3\"></path><path d=\"M18 16a5 5 0 0 0-8-4\"></path>";
        };
        readonly 'credit-note': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
        };
        readonly 'debit-note': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path><path d=\"M13 17h6\"></path>";
        };
        readonly 'delivery-note': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M15 16h5\"></path><path d=\"m18 14 2 2-2 2\"></path>";
        };
        readonly 'payment-scheduled': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"15\" r=\"3\"></circle><path d=\"M12 13.5V15l1 1\"></path>";
        };
        readonly 'pricing-table': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 5v14\"></path><path d=\"M15 5v14\"></path><path d=\"M6 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M18 15h.01\"></path>";
        };
        readonly 'revenue-recognition': {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17V9\"></path><path d=\"M12 17V5\"></path><path d=\"M18 17v-6\"></path><path d=\"M8 5h8\"></path><path d=\"M12 3v4\"></path>";
        };
        readonly 'sales-order': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"m15 17 2 2 4-4\"></path>";
        };
        readonly vendor: {
            readonly body: "<path d=\"M4 10h16l-1-5H5l-1 5z\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><circle cx=\"17\" cy=\"7\" r=\"2\"></circle>";
        };
        readonly 'billing-cycle': {
            readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h5\"></path><path d=\"M16 15a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 13v3h-3\"></path>";
        };
        readonly 'collection-case': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14v5\"></path><path d=\"M16 22h.01\"></path>";
        };
        readonly 'contract-value': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"M16 13v6\"></path><path d=\"M18 15a2 2 0 0 0-2-1.5c-1 0-2 .5-2 1.5 0 2 4 .8 4 3 0 .9-1 1.5-2 1.5a3 3 0 0 1-2.5-1\"></path>";
        };
        readonly 'payment-gateway': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle><path d=\"M17 11v2\"></path><path d=\"M17 17v2\"></path><path d=\"M13 15h2\"></path><path d=\"M19 15h2\"></path>";
        };
        readonly remittance: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M18 9h3v3\"></path><path d=\"m21 9-5 5\"></path><path d=\"M6 15H3v-3\"></path><path d=\"m3 15 5-5\"></path>";
        };
        readonly 'revenue-ledger': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path><path d=\"M16 6v12\"></path>";
        };
        readonly sku: {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path>";
        };
        readonly supplier: {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><circle cx=\"18\" cy=\"8\" r=\"2\"></circle><path d=\"M16 4h4\"></path>";
        };
        readonly 'tax-id': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle><path d=\"M8 7h4\"></path>";
        };
        readonly till: {
            readonly body: "<rect x=\"4\" y=\"10\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M8 10V5h8v5\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M7 18h10\"></path>";
        };
        readonly trial: {
            readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><path d=\"M12 11v5\"></path><path d=\"M9.5 13.5h5\"></path>";
        };
        readonly wholesale: {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M9 5h6\"></path>";
        };
    };
    readonly communication: {
        readonly 'at-sign': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path>";
        };
        readonly bell: {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
        };
        readonly mail: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path>";
        };
        readonly message: {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path>";
        };
        readonly mic: {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
        };
        readonly paperclip: {
            readonly body: "<path d=\"m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8\"></path>";
        };
        readonly send: {
            readonly body: "<path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path><path d=\"M22 2 11 13\"></path>";
        };
        readonly share: {
            readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
        };
        readonly 'bell-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
        };
        readonly megaphone: {
            readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path>";
        };
        readonly 'phone-call': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 3a7 7 0 0 1 7 7\"></path><path d=\"M14 7a3 3 0 0 1 3 3\"></path>";
        };
        readonly broadcast: {
            readonly body: "<path d=\"M4 12a8 8 0 0 1 8-8\"></path><path d=\"M4 12a8 8 0 0 0 8 8\"></path><path d=\"M20 12a8 8 0 0 0-8-8\"></path><path d=\"M20 12a8 8 0 0 1-8 8\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly 'chat-check': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
        };
        readonly 'chat-plus': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly 'chat-x': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
        };
        readonly 'inbox-mail': {
            readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"m7 7 5 4 5-4\"></path>";
        };
        readonly 'mail-check': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
        };
        readonly 'mail-open': {
            readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path>";
        };
        readonly 'mail-plus': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
        };
        readonly 'mail-x': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
        };
        readonly 'message-circle': {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-9 9H7l-4 2 2-4a9 9 0 1 1 16-7z\"></path>";
        };
        readonly 'message-square': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path>";
        };
        readonly 'mic-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 9.5 6.5\"></path><path d=\"M19 11a7 7 0 0 1-2.1 5\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
        };
        readonly 'notification-dot': {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><circle cx=\"19\" cy=\"7\" r=\"3\"></circle>";
        };
        readonly 'phone-forwarded': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 6h6\"></path><path d=\"m18 3 3 3-3 3\"></path>";
        };
        readonly 'phone-incoming': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M21 3 15 9\"></path><path d=\"M15 3v6h6\"></path>";
        };
        readonly 'phone-missed': {
            readonly body: "<path d=\"M6 8c4-3 8-3 12 0l2-2\"></path><path d=\"M4 6l2 2\"></path><path d=\"m15 6 6 6\"></path><path d=\"m21 6-6 6\"></path><path d=\"M8 12l-3 5\"></path><path d=\"m16 12 3 5\"></path>";
        };
        readonly 'phone-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.3 1.8\"></path><path d=\"M15.5 14.5a2 2 0 0 1 1.8-.5l3 .5a2 2 0 0 1 1.7 2.4\"></path>";
        };
        readonly 'phone-outgoing': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M15 9 21 3\"></path><path d=\"M15 3h6v6\"></path>";
        };
        readonly 'rss-feed': {
            readonly body: "<path d=\"M4 11a9 9 0 0 1 9 9\"></path><path d=\"M4 4a16 16 0 0 1 16 16\"></path><circle cx=\"5\" cy=\"19\" r=\"1\"></circle>";
        };
        readonly 'share-2': {
            readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
        };
        readonly announcement: {
            readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><path d=\"M8 15l2 6\"></path><path d=\"M21 4h.01\"></path>";
        };
        readonly 'comment-check': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m8 12 2 2 5-5\"></path>";
        };
        readonly 'comment-x': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
        };
        readonly feedback: {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
        };
        readonly 'inbox-alert': {
            readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
        };
        readonly mention: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M4 4 2 2\"></path><path d=\"M20 4l2-2\"></path>";
        };
        readonly 'message-lock': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><rect x=\"12\" y=\"10\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 10V8.5a1.5 1.5 0 0 1 3 0V10\"></path>";
        };
        readonly thread: {
            readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path>";
        };
        readonly channel: {
            readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 12h4\"></path>";
        };
        readonly 'channel-lock': {
            readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><rect x=\"12\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M13.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
        };
        readonly 'channel-plus': {
            readonly body: "<path d=\"M5 5h14v10H8l-3 3V5z\"></path><path d=\"M12 8v6\"></path><path d=\"M9 11h6\"></path>";
        };
        readonly collaboration: {
            readonly body: "<circle cx=\"8\" cy=\"9\" r=\"3\"></circle><circle cx=\"16\" cy=\"9\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M11 9h2\"></path>";
        };
        readonly conversation: {
            readonly body: "<path d=\"M4 5h13v8H7l-3 3V5z\"></path><path d=\"M9 16h8l3 3v-8\"></path><path d=\"M8 9h5\"></path><path d=\"M13 14h3\"></path>";
        };
        readonly meeting: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"M16 10h3\"></path><path d=\"M16 14h3\"></path>";
        };
        readonly moderation: {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly 'notification-check': {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h13\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"m16 18 2 2 4-4\"></path>";
        };
        readonly 'notification-snooze': {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h12\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M16 16h5l-5 5h5\"></path>";
        };
        readonly 'presence-away': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M18 4.5V6l1 1\"></path>";
        };
        readonly 'presence-busy': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"M16.5 6h3\"></path>";
        };
        readonly 'presence-online': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 6 1 1 2-2\"></path>";
        };
        readonly reaction: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 15a5 5 0 0 0 8 0\"></path><path d=\"M20 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path>";
        };
        readonly 'thread-resolved': {
            readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
        };
        readonly 'call-muted': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M2 2l20 20\"></path>";
        };
        readonly 'call-transfer': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M14 5h7\"></path><path d=\"m18 2 3 3-3 3\"></path>";
        };
        readonly 'comment-thread': {
            readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"M8 9h6\"></path><path d=\"M12 13h4\"></path>";
        };
        readonly 'conversation-star': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"m16 8 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L13 10.3l2-.3 1-2z\"></path>";
        };
        readonly 'escalation-message': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M12 14V8\"></path><path d=\"m9 11 3-3 3 3\"></path>";
        };
        readonly 'meeting-cancelled': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m16 10 4 4\"></path><path d=\"m20 10-4 4\"></path>";
        };
        readonly 'meeting-check': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 13a3 3 0 0 1 6 0\"></path><circle cx=\"11\" cy=\"9\" r=\"2\"></circle><path d=\"m15 15 2 2 4-4\"></path>";
        };
        readonly 'mention-alert': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path><path d=\"M21 3v4\"></path><path d=\"M21 10h.01\"></path>";
        };
        readonly 'notification-priority': {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h15\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M19 5v6\"></path><path d=\"M19 15h.01\"></path>";
        };
        readonly 'presence-offline': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><path d=\"m16.5 4.5 3 3\"></path><path d=\"m19.5 4.5-3 3\"></path>";
        };
        readonly 'support-inbox': {
            readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 8v4\"></path><path d=\"M10 10h4\"></path>";
        };
        readonly survey: {
            readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"m14 17 2 2 4-4\"></path>";
        };
        readonly 'targeted-broadcast': {
            readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><circle cx=\"19\" cy=\"12\" r=\"3\"></circle><path d=\"M19 9v6\"></path><path d=\"M16 12h6\"></path>";
        };
        readonly transcript: {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path><path d=\"M16 16h.01\"></path>";
        };
        readonly voicemail: {
            readonly body: "<circle cx=\"6\" cy=\"12\" r=\"4\"></circle><circle cx=\"18\" cy=\"12\" r=\"4\"></circle><path d=\"M6 16h12\"></path>";
        };
        readonly 'call-incoming': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><path d=\"M20 4h-6\"></path><path d=\"m17 1-3 3 3 3\"></path>";
        };
        readonly 'call-recording': {
            readonly body: "<path d=\"M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a14 14 0 0 0 5.6 5.6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 1.9z\"></path><circle cx=\"18\" cy=\"6\" r=\"3\"></circle>";
        };
        readonly 'chat-bot': {
            readonly body: "<path d=\"M4 8h16v10H7l-3 3V8z\"></path><path d=\"M12 8V4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M10 16h4\"></path>";
        };
        readonly 'chat-error': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'chat-resolved': {
            readonly body: "<path d=\"M4 5h14v8H7l-3 3V5z\"></path><path d=\"M8 16h9l3 3v-9\"></path><path d=\"m13 17 2 2 5-5\"></path>";
        };
        readonly 'contact-card': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M14 10h4\"></path><path d=\"M14 14h4\"></path>";
        };
        readonly 'email-bounce': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M12 15v3\"></path><path d=\"M12 21h.01\"></path>";
        };
        readonly 'email-template': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M7 15h10\"></path><path d=\"M7 18h6\"></path>";
        };
        readonly 'notification-digest': {
            readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path><path d=\"M8 12h8\"></path><path d=\"M8 15h6\"></path>";
        };
        readonly 'webhook-event': {
            readonly body: "<circle cx=\"6\" cy=\"8\" r=\"3\"></circle><circle cx=\"18\" cy=\"8\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 8h6\"></path><path d=\"m8 10 3 5\"></path><path d=\"m16 10-3 5\"></path><path d=\"M12 3v2\"></path>";
        };
        readonly 'auto-reply': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 13a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 11v3h-3\"></path>";
        };
        readonly 'call-queue': {
            readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M9 19h6\"></path><path d=\"M9 22h4\"></path>";
        };
        readonly campaign: {
            readonly body: "<path d=\"M3 11v2a2 2 0 0 0 2 2h3l7 4V5L8 9H5a2 2 0 0 0-2 2z\"></path><path d=\"M19 8a5 5 0 0 1 0 8\"></path><circle cx=\"20\" cy=\"5\" r=\"2\"></circle>";
        };
        readonly 'chat-typing': {
            readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path>";
        };
        readonly 'email-opened': {
            readonly body: "<path d=\"m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z\"></path><path d=\"m3 9 9 6 9-6\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly 'email-sent': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path><path d=\"M16 15h6\"></path><path d=\"m19 12 3 3-3 3\"></path>";
        };
        readonly 'inbox-priority': {
            readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path><path d=\"M12 7v4\"></path><path d=\"M12 14h.01\"></path>";
        };
        readonly 'live-chat': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"18\" cy=\"7\" r=\"2\"></circle>";
        };
        readonly 'message-draft': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"m15 14 3-3 2 2-3 3h-2v-2z\"></path>";
        };
        readonly 'notification-muted': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M6.2 6.2A6 6 0 0 0 6 8c0 7-3 7-3 7h12\"></path><path d=\"M18 14.8c-.7-1-1-2.7-1-6.8a5.9 5.9 0 0 0-8.8-5.1\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
        };
        readonly sms: {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M8 10h.01\"></path><path d=\"M12 10h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M8 14h8\"></path>";
        };
        readonly 'support-agent': {
            readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"3\"></circle><path d=\"M7 21a5 5 0 0 1 10 0\"></path>";
        };
    };
    readonly content: {
        readonly archive: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"4\" rx=\"1\"></rect><path d=\"M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path>";
        };
        readonly camera: {
            readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>";
        };
        readonly copy: {
            readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect>";
        };
        readonly document: {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h6\"></path>";
        };
        readonly edit: {
            readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
        };
        readonly file: {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path>";
        };
        readonly folder: {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path>";
        };
        readonly image: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path>";
        };
        readonly printer: {
            readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 14h10v7H7z\"></path>";
        };
        readonly save: {
            readonly body: "<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><path d=\"M17 21v-8H7v8\"></path><path d=\"M7 3v5h8\"></path>";
        };
        readonly 'align-center': {
            readonly body: "<path d=\"M7 6h10\"></path><path d=\"M4 12h16\"></path><path d=\"M8 18h8\"></path>";
        };
        readonly 'align-left': {
            readonly body: "<path d=\"M4 6h16\"></path><path d=\"M4 12h10\"></path><path d=\"M4 18h16\"></path>";
        };
        readonly 'align-right': {
            readonly body: "<path d=\"M4 6h16\"></path><path d=\"M10 12h10\"></path><path d=\"M4 18h16\"></path>";
        };
        readonly 'book-open': {
            readonly body: "<path d=\"M3 5a6 6 0 0 1 6-2l3 1v17l-3-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M21 5a6 6 0 0 0-6-2l-3 1v17l3-1a6 6 0 0 1 6 2V5z\"></path>";
        };
        readonly bookmark: {
            readonly body: "<path d=\"M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1z\"></path>";
        };
        readonly 'camera-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.5 4h5L16 7h3a2 2 0 0 1 2 2v8.5\"></path><path d=\"M18 20H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2\"></path><path d=\"M9.9 10.4A3 3 0 0 0 14 14.6\"></path>";
        };
        readonly clipboard: {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M8 10h8\"></path><path d=\"M8 14h8\"></path><path d=\"M8 18h5\"></path>";
        };
        readonly 'clipboard-check': {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
        };
        readonly 'clipboard-list': {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"M9 11h.01\"></path><path d=\"M12 11h4\"></path><path d=\"M9 16h.01\"></path><path d=\"M12 16h4\"></path>";
        };
        readonly 'copy-check': {
            readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect><path d=\"m12 16 2 2 5-5\"></path>";
        };
        readonly 'file-check': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m8 15 2 2 5-5\"></path>";
        };
        readonly 'file-code': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path>";
        };
        readonly 'file-down': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"m9 15 3 3 3-3\"></path>";
        };
        readonly 'file-minus': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 15h6\"></path>";
        };
        readonly 'file-plus': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v6\"></path><path d=\"M9 15h6\"></path>";
        };
        readonly 'file-text': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M8 9h2\"></path>";
        };
        readonly 'file-up': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 18v-6\"></path><path d=\"m9 15 3-3 3 3\"></path>";
        };
        readonly 'file-x': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
        };
        readonly 'folder-open': {
            readonly body: "<path d=\"M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v1\"></path><path d=\"M3 10h18l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z\"></path>";
        };
        readonly 'folder-plus': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 11v6\"></path><path d=\"M9 14h6\"></path>";
        };
        readonly 'folder-sync': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v3\"></path><path d=\"M3 10v8a2 2 0 0 0 2 2h7\"></path><path d=\"M21 17a4 4 0 0 1-6.8 2.8L13 18\"></path><path d=\"M13 21v-3h3\"></path><path d=\"M15 14a4 4 0 0 1 6.8 2.8L23 18\"></path><path d=\"M23 15v3h-3\"></path>";
        };
        readonly 'image-plus': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M16 6v6\"></path><path d=\"M13 9h6\"></path>";
        };
        readonly indent: {
            readonly body: "<path d=\"M3 6h18\"></path><path d=\"M11 12h10\"></path><path d=\"M3 18h18\"></path><path d=\"m3 10 4 2-4 2v-4z\"></path>";
        };
        readonly pencil: {
            readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
        };
        readonly scissors: {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M20 4 8.1 15.9\"></path><path d=\"M8.1 8.1 20 20\"></path>";
        };
        readonly sticky: {
            readonly body: "<path d=\"M5 3h14a2 2 0 0 1 2 2v10l-6 6H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"></path><path d=\"M15 21v-6h6\"></path>";
        };
        readonly 'clipboard-copy': {
            readonly body: "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"></path><path d=\"M12 13h4\"></path><path d=\"M14 11v4\"></path>";
        };
        readonly 'clipboard-x': {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M9 4a3 3 0 0 1 6 0\"></path><path d=\"M9 4h6\"></path><path d=\"m9 13 6 6\"></path><path d=\"m15 13-6 6\"></path>";
        };
        readonly crop: {
            readonly body: "<path d=\"M6 2v14a2 2 0 0 0 2 2h14\"></path><path d=\"M18 22V8a2 2 0 0 0-2-2H2\"></path>";
        };
        readonly eraser: {
            readonly body: "<path d=\"m7 21-4-4 10-10a3 3 0 0 1 4 0l4 4-10 10H7z\"></path><path d=\"m12 12 5 5\"></path><path d=\"M7 21h14\"></path>";
        };
        readonly 'file-archive': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 12h4\"></path><path d=\"M10 16h4\"></path><path d=\"M12 12v8\"></path>";
        };
        readonly 'file-audio': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M9 17v-4l4-2v6l-4-2\"></path><path d=\"M16 13a3 3 0 0 1 0 4\"></path>";
        };
        readonly 'file-image': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"9\" cy=\"13\" r=\"1.5\"></circle><path d=\"m8 19 3-3 2 2 3-4 2 3\"></path>";
        };
        readonly 'file-json': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M10 13c-1 0-1 .8-1 1.5S9 16 8 16\"></path><path d=\"M14 13c1 0 1 .8 1 1.5S15 16 16 16\"></path>";
        };
        readonly 'file-lock': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly 'file-spreadsheet': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M12 13v6\"></path>";
        };
        readonly 'file-video': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"13\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"m14 15 3-2v5l-3-2\"></path>";
        };
        readonly 'folder-check': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m8 14 2 2 5-5\"></path>";
        };
        readonly 'folder-down': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 10v7\"></path><path d=\"m9 14 3 3 3-3\"></path>";
        };
        readonly 'folder-lock': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><rect x=\"8\" y=\"13\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 13v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly 'folder-up': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M12 17v-7\"></path><path d=\"m9 13 3-3 3 3\"></path>";
        };
        readonly 'folder-x': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"m9 12 6 6\"></path><path d=\"m15 12-6 6\"></path>";
        };
        readonly newspaper: {
            readonly body: "<path d=\"M4 5h14a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z\"></path><path d=\"M4 17H3a1 1 0 0 1-1-1V7\"></path><path d=\"M8 9h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path>";
        };
        readonly paintbrush: {
            readonly body: "<path d=\"M18 3a3 3 0 0 1 3 3c0 4-5 4-5 8\"></path><path d=\"M16 14a4 4 0 0 1-8 0c0-2 2-4 4-4s4 2 4 4z\"></path><path d=\"M8 18c0 2-2 3-5 3 1-2 1-4 3-5\"></path>";
        };
        readonly palette: {
            readonly body: "<path d=\"M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1-3.7 1.5 1.5 0 0 1 1-2.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z\"></path><path d=\"M7.5 10h.01\"></path><path d=\"M10 7h.01\"></path><path d=\"M14 7h.01\"></path>";
        };
        readonly 'document-import': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 12v7\"></path><path d=\"m9 15 3-3 3 3\"></path>";
        };
        readonly 'document-export': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M12 19v-7\"></path><path d=\"m9 16 3 3 3-3\"></path>";
        };
        readonly 'document-search': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"11\" cy=\"15\" r=\"3\"></circle><path d=\"m13 17 3 3\"></path>";
        };
        readonly 'document-signature': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17c1-4 3-4 4 0 1-3 3-3 4 0\"></path>";
        };
        readonly 'file-csv': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 14h2\"></path><path d=\"M12 14h2\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h8\"></path>";
        };
        readonly 'file-pdf': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 17v-5h2a2 2 0 0 1 0 4H8\"></path><path d=\"M13 17v-5h1a3 3 0 0 1 0 5h-1\"></path>";
        };
        readonly 'file-template': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><rect x=\"8\" y=\"12\" width=\"8\" height=\"6\" rx=\"1\"></rect><path d=\"M8 15h8\"></path>";
        };
        readonly 'image-check': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m14 8 2 2 4-4\"></path>";
        };
        readonly 'scan-document': {
            readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M8 7h8v10H8z\"></path><path d=\"M10 11h4\"></path>";
        };
        readonly 'template-plus': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M15 14v6\"></path><path d=\"M12 17h6\"></path>";
        };
        readonly asset: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"m20 15-4-4-5 5-2-2-4 5\"></path>";
        };
        readonly 'asset-library': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"5\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect><rect x=\"14\" y=\"15\" width=\"7\" height=\"6\" rx=\"1\"></rect>";
        };
        readonly collection: {
            readonly body: "<rect x=\"7\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2\"></path><path d=\"M11 12h4\"></path><path d=\"M13 10v4\"></path>";
        };
        readonly 'content-calendar': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h5\"></path><path d=\"M8 18h8\"></path>";
        };
        readonly draft: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 16h8\"></path><path d=\"M8 12h5\"></path><path d=\"M15 11l3 3\"></path>";
        };
        readonly 'empty-file': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 15h8\"></path>";
        };
        readonly 'empty-folder': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><path d=\"M8 14h8\"></path>";
        };
        readonly 'file-diff': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h3\"></path><path d=\"M14 17h2\"></path>";
        };
        readonly 'file-history': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><circle cx=\"12\" cy=\"15\" r=\"4\"></circle><path d=\"M12 13v2l1.5 1\"></path>";
        };
        readonly 'knowledge-base': {
            readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path>";
        };
        readonly 'media-library': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 3h10\"></path><path d=\"M7 21h10\"></path>";
        };
        readonly version: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 7h3V4\"></path><path d=\"M7 7a7 7 0 0 1 10 0\"></path>";
        };
        readonly citation: {
            readonly body: "<path d=\"M6 5h12v16H6z\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path><path d=\"M4 3h4\"></path><path d=\"M16 3h4\"></path>";
        };
        readonly 'code-block': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10-3 2 3 2\"></path><path d=\"m16 10 3 2-3 2\"></path><path d=\"M10 16h4\"></path>";
        };
        readonly glossary: {
            readonly body: "<path d=\"M4 5a6 6 0 0 1 6-2l2 1v17l-2-1a6 6 0 0 0-6 2V5z\"></path><path d=\"M20 5a6 6 0 0 0-6-2l-2 1v17l2-1a6 6 0 0 1 6 2V5z\"></path><path d=\"M8 9h2\"></path><path d=\"M14 9h2\"></path><path d=\"M8 13h2\"></path>";
        };
        readonly markdown: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 15V9l3 4 3-4v6\"></path><path d=\"M17 9v6\"></path><path d=\"m15 13 2 2 2-2\"></path>";
        };
        readonly publish: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M12 18v-7\"></path><path d=\"m9 14 3-3 3 3\"></path>";
        };
        readonly redact: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h8\"></path><path d=\"M7 13h10\"></path>";
        };
        readonly 'review-changes': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 10h5\"></path><path d=\"M16 15h4\"></path>";
        };
        readonly 'rich-text': {
            readonly body: "<path d=\"M5 6h14\"></path><path d=\"M8 6v12\"></path><path d=\"M16 6v12\"></path><path d=\"M6 18h12\"></path><path d=\"M10 12h4\"></path>";
        };
        readonly translation: {
            readonly body: "<path d=\"M4 5h9\"></path><path d=\"M8 5v12\"></path><path d=\"M3 17c4-3 7-7 8-12\"></path><path d=\"M13 19l3-8 3 8\"></path><path d=\"M14 16h4\"></path>";
        };
        readonly 'web-page': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
        };
        readonly 'video-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
        };
        readonly video: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
        };
        readonly annotation: {
            readonly body: "<path d=\"M4 5h16v11H8l-4 4V5z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
        };
        readonly 'approval-document': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"m8 17 2 2 5-5\"></path>";
        };
        readonly 'content-block': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><rect x=\"8\" y=\"15\" width=\"8\" height=\"2\"></rect>";
        };
        readonly 'document-merge': {
            readonly body: "<path d=\"M5 3h6v7H5z\"></path><path d=\"M13 14h6v7h-6z\"></path><path d=\"M8 10v3a4 4 0 0 0 4 4h1\"></path><path d=\"m10 15 2 2-2 2\"></path>";
        };
        readonly 'document-split': {
            readonly body: "<path d=\"M5 3h14v6H5z\"></path><path d=\"M5 15h6v6H5z\"></path><path d=\"M13 15h6v6h-6z\"></path><path d=\"M12 9v3\"></path><path d=\"M8 15v-3h8v3\"></path>";
        };
        readonly 'file-xml': {
            readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"m10 13-2 2 2 2\"></path><path d=\"m14 13 2 2-2 2\"></path><path d=\"M12 12l-1 6\"></path>";
        };
        readonly 'folder-shared': {
            readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path><circle cx=\"10\" cy=\"14\" r=\"2\"></circle><path d=\"M14 18a4 4 0 0 0-8 0\"></path><circle cx=\"17\" cy=\"13\" r=\"1.5\"></circle>";
        };
        readonly 'image-crop': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 3v13a2 2 0 0 0 2 2h11\"></path><path d=\"M16 21V8a2 2 0 0 0-2-2H3\"></path>";
        };
        readonly 'image-edit': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"m15 7 3-3 2 2-3 3h-2V7z\"></path>";
        };
        readonly 'media-playlist': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h8\"></path><path d=\"M7 13h6\"></path><path d=\"M7 17h4\"></path><path d=\"m15 14 4 2-4 2v-4z\"></path>";
        };
        readonly 'page-break': {
            readonly body: "<path d=\"M6 3h12v7H6z\"></path><path d=\"M6 14h12v7H6z\"></path><path d=\"M3 12h2\"></path><path d=\"M8 12h2\"></path><path d=\"M14 12h2\"></path><path d=\"M19 12h2\"></path>";
        };
        readonly seo: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 10h10\"></path><path d=\"M7 14h5\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"m18 17 2 2\"></path>";
        };
        readonly snippet: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m9 10-3 2 3 2\"></path><path d=\"m15 10 3 2-3 2\"></path><path d=\"M10 17h4\"></path>";
        };
        readonly 'style-guide': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h4\"></path><circle cx=\"9\" cy=\"16\" r=\"1\"></circle><circle cx=\"13\" cy=\"16\" r=\"1\"></circle><circle cx=\"17\" cy=\"16\" r=\"1\"></circle>";
        };
        readonly 'alt-text': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path><path d=\"M7 21h10\"></path><path d=\"M9 21v-4\"></path><path d=\"M15 21v-4\"></path>";
        };
        readonly 'content-approval': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
        };
        readonly 'form-template': {
            readonly body: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><rect x=\"8\" y=\"11\" width=\"8\" height=\"3\"></rect><path d=\"M8 17h4\"></path><path d=\"M14 17h2\"></path>";
        };
        readonly 'media-caption': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m10 10 5 3-5 3v-6z\"></path><path d=\"M7 18h10\"></path><path d=\"M9 21h6\"></path>";
        };
        readonly 'version-compare': {
            readonly body: "<path d=\"M5 4h6v16H5z\"></path><path d=\"M13 4h6v16h-6z\"></path><path d=\"M8 8h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M16 8h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 17h8\"></path>";
        };
    };
    readonly devices: {
        readonly battery: {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path>";
        };
        readonly bluetooth: {
            readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path>";
        };
        readonly cloud: {
            readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path>";
        };
        readonly cpu: {
            readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path>";
        };
        readonly database: {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path>";
        };
        readonly desktop: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
        };
        readonly laptop: {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M3 20h18l-2-4H5l-2 4z\"></path>";
        };
        readonly offline: {
            readonly body: "<path d=\"M2 2 22 22\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M5 13a10 10 0 0 1 4-2.4\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path>";
        };
        readonly phone: {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly server: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path>";
        };
        readonly chip: {
            readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path><path d=\"M10 10h4v4h-4z\"></path>";
        };
        readonly 'cloud-download': {
            readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 11v8\"></path><path d=\"m8 15 4 4 4-4\"></path>";
        };
        readonly 'cloud-upload': {
            readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"M12 19v-8\"></path><path d=\"m8 15 4-4 4 4\"></path>";
        };
        readonly 'database-backup': {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v4c0 1.7 3.6 3 8 3\"></path><path d=\"M16 16h5v5\"></path><path d=\"M21 16a5 5 0 1 0-1.5 3.5\"></path>";
        };
        readonly 'database-zap': {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m17 14-3 5h4l-2 4\"></path>";
        };
        readonly 'device-tablet': {
            readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly 'hard-drive': {
            readonly body: "<path d=\"M6 3h12l4 9v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7l4-9z\"></path><path d=\"M2 12h20\"></path><path d=\"M6 17h.01\"></path><path d=\"M10 17h.01\"></path>";
        };
        readonly headphones: {
            readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect>";
        };
        readonly keyboard: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M7 13h.01\"></path><path d=\"M11 13h6\"></path><path d=\"M19 13h.01\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly monitor: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
        };
        readonly 'plug-zap': {
            readonly body: "<path d=\"M13 2 8 12h5l-2 10 5-12h-5l2-8z\"></path><path d=\"M4 14h4\"></path><path d=\"M3 18h6\"></path><path d=\"M16 6h5\"></path><path d=\"M15 10h6\"></path>";
        };
        readonly 'server-cog': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><circle cx=\"19\" cy=\"17\" r=\"2\"></circle><path d=\"M19 13v1\"></path><path d=\"M19 20v1\"></path><path d=\"M16.5 14.5l.7.7\"></path><path d=\"m20.8 18.8.7.7\"></path>";
        };
        readonly 'wifi-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M5 13a10 10 0 0 1 5.2-2.7\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
        };
        readonly 'bluetooth-connected': {
            readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path><path d=\"M3 12h3\"></path><path d=\"M18 12h3\"></path>";
        };
        readonly 'cloud-check': {
            readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m9 14 2 2 5-5\"></path>";
        };
        readonly 'cloud-x': {
            readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path><path d=\"m10 12 5 5\"></path><path d=\"m15 12-5 5\"></path>";
        };
        readonly 'database-check': {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"m14 18 2 2 5-5\"></path>";
        };
        readonly 'database-lock': {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v5c0 1.5 2.8 2.7 6.5 3\"></path><rect x=\"14\" y=\"15\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 15v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly mouse: {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"5\"></rect><path d=\"M12 6v4\"></path><path d=\"M7 10h10\"></path>";
        };
        readonly network: {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
        };
        readonly 'monitor-smartphone': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"13\" height=\"10\" rx=\"2\"></rect><path d=\"M7 18h6\"></path><path d=\"M10 14v4\"></path><rect x=\"17\" y=\"10\" width=\"5\" height=\"10\" rx=\"1\"></rect><path d=\"M19 18h1\"></path>";
        };
        readonly router: {
            readonly body: "<rect x=\"4\" y=\"12\" width=\"16\" height=\"7\" rx=\"2\"></rect><path d=\"M8 12V8\"></path><path d=\"M16 12V8\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path>";
        };
        readonly 'router-wifi': {
            readonly body: "<rect x=\"4\" y=\"13\" width=\"16\" height=\"6\" rx=\"2\"></rect><path d=\"M8 13V9\"></path><path d=\"M16 13V9\"></path><path d=\"M7 16h.01\"></path><path d=\"M11 16h.01\"></path><path d=\"M8 6a6 6 0 0 1 8 0\"></path><path d=\"M10 9a3 3 0 0 1 4 0\"></path>";
        };
        readonly smartphone: {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly tablet: {
            readonly body: "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly usb: {
            readonly body: "<path d=\"M12 3v12\"></path><path d=\"m9 6 3-3 3 3\"></path><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M12 15H8\"></path><path d=\"M12 15h4\"></path><path d=\"M12 15v6\"></path><circle cx=\"12\" cy=\"21\" r=\"1\"></circle>";
        };
        readonly 'barcode-scanner': {
            readonly body: "<path d=\"M4 7V5a2 2 0 0 1 2-2h2\"></path><path d=\"M16 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M20 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M8 21H6a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 8v8\"></path><path d=\"M10 8v8\"></path><path d=\"M14 8v8\"></path><path d=\"M17 8v8\"></path>";
        };
        readonly 'battery-charging': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"m11 8-3 5h4l-2 4\"></path>";
        };
        readonly 'battery-full': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path><path d=\"M16 11v2\"></path>";
        };
        readonly 'battery-low': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path>";
        };
        readonly nfc: {
            readonly body: "<path d=\"M6 8a8 8 0 0 1 0 8\"></path><path d=\"M10 6a12 12 0 0 1 0 12\"></path><path d=\"M14 4a16 16 0 0 1 0 16\"></path><path d=\"M18 7a9 9 0 0 1 0 10\"></path>";
        };
        readonly 'printer-check': {
            readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"m13 18 2 2 5-5\"></path>";
        };
        readonly 'server-check': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><path d=\"m16 18 2 2 4-4\"></path>";
        };
        readonly 'server-lock': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"12\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path><rect x=\"16\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M17.5 15v-2a2 2 0 0 1 3 0v2\"></path>";
        };
        readonly signal: {
            readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20V8\"></path><path d=\"M20 20V4\"></path>";
        };
        readonly 'signal-low': {
            readonly body: "<path d=\"M4 20h.01\"></path><path d=\"M8 20v-4\"></path><path d=\"M12 20v-8\"></path><path d=\"M16 20\"></path><path d=\"M20 20\"></path>";
        };
        readonly smartwatch: {
            readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><path d=\"M11 12h2\"></path>";
        };
        readonly watch: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M9 2h6l1 4H8l1-4z\"></path><path d=\"M8 18h8l-1 4H9l-1-4z\"></path><path d=\"M12 9v3l2 1\"></path>";
        };
        readonly wifi: {
            readonly body: "<path d=\"M5 13a10 10 0 0 1 14 0\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
        };
        readonly 'app-window': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h6\"></path>";
        };
        readonly 'mobile-camera': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><circle cx=\"12\" cy=\"11\" r=\"3\"></circle><path d=\"M10 7h4\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-check': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 2 2 4-4\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-home': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 12 3-3 3 3\"></path><path d=\"M10 12v3h4v-3\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-nav': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 16h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 8h6\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-rotate': {
            readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path>";
        };
        readonly 'mobile-scan': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 16h6\"></path><path d=\"M10 10v4\"></path><path d=\"M14 10v4\"></path>";
        };
        readonly 'mobile-tab': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 16h8\"></path><path d=\"M10 16v3\"></path><path d=\"M14 16v3\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-vibrate': {
            readonly body: "<path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly 'mobile-x': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'offline-sync': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M21 12a9 9 0 0 1-4.2 7.6\"></path><path d=\"M3 12a9 9 0 0 1 13.7-7.7\"></path><path d=\"M3 16v5h5\"></path><path d=\"M21 8V3h-5\"></path>";
        };
        readonly 'pwa-install': {
            readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v8\"></path><path d=\"m8 11 4 4 4-4\"></path><path d=\"M10 18h4\"></path>";
        };
        readonly browser: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 9h18\"></path><path d=\"M7 6.5h.01\"></path><path d=\"M11 6.5h.01\"></path><path d=\"M7 13h10\"></path>";
        };
        readonly cache: {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3\"></path><path d=\"M17 15a4 4 0 1 1-3 6.7\"></path><path d=\"M17 13v4h-4\"></path>";
        };
        readonly 'desktop-app': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h4\"></path><path d=\"M7 11h8\"></path>";
        };
        readonly 'edge-device': {
            readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 9h4\"></path><path d=\"M18 9h4\"></path><path d=\"M2 15h4\"></path><path d=\"M18 15h4\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly kiosk: {
            readonly body: "<rect x=\"6\" y=\"3\" width=\"12\" height=\"16\" rx=\"2\"></rect><path d=\"M9 22h6\"></path><path d=\"M12 19v3\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path>";
        };
        readonly 'local-storage': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M4 10h16\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h4\"></path>";
        };
        readonly 'platform-desktop': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 8h10\"></path>";
        };
        readonly 'platform-mobile': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M10 7h4\"></path><path d=\"M10 11h4\"></path><path d=\"M11 18h2\"></path>";
        };
        readonly 'platform-web': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"M8 8h8\"></path>";
        };
        readonly 'push-device': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M18 6a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S18 9 18 6\"></path>";
        };
        readonly 'push-subscription': {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h4\"></path><path d=\"M15 15a3 3 0 0 0-6 0c0 3-1.5 3-1.5 3h9S15 18 15 15\"></path>";
        };
        readonly 'service-worker': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 7v2\"></path><path d=\"M12 15v2\"></path><path d=\"M7 12h2\"></path><path d=\"M15 12h2\"></path><path d=\"m8.5 8.5 1.4 1.4\"></path><path d=\"m14.1 14.1 1.4 1.4\"></path>";
        };
        readonly storage: {
            readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path><path d=\"M8 17h.01\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly biometric: {
            readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path>";
        };
        readonly 'camera-capture': {
            readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
        };
        readonly geolocation: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path>";
        };
        readonly 'mobile-bottom-sheet': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M8 15h8\"></path><path d=\"M9 18h6\"></path><path d=\"M11 5h2\"></path>";
        };
        readonly 'mobile-drawer': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M7 8h7\"></path><path d=\"M7 12h7\"></path><path d=\"M7 16h7\"></path><path d=\"m15 10 2 2-2 2\"></path>";
        };
        readonly 'mobile-gesture': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 13c2-5 5-5 7 0\"></path><path d=\"M10 13l2 2\"></path>";
        };
        readonly 'mobile-offline': {
            readonly body: "<path d=\"M2 2l20 20\"></path><rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M9 8h6\"></path>";
        };
        readonly 'mobile-permission': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"M9 15h6\"></path>";
        };
        readonly 'mobile-sheet': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><rect x=\"8\" y=\"10\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M10 13h4\"></path><path d=\"M11 5h2\"></path>";
        };
        readonly 'orientation-lock': {
            readonly body: "<rect x=\"8\" y=\"3\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"M4 16a8 8 0 0 0 14 4\"></path><path d=\"m18 16 1 4h-4\"></path><rect x=\"9\" y=\"9\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M10.5 9V7.5a1.5 1.5 0 0 1 3 0V9\"></path>";
        };
        readonly passkey: {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M12 4a4 4 0 0 1 6 0\"></path>";
        };
        readonly 'sensor-alert': {
            readonly body: "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v4\"></path><path d=\"M12 18v4\"></path><path d=\"M2 12h4\"></path><path d=\"M18 12h4\"></path><path d=\"M19 3v4\"></path><path d=\"M19 10h.01\"></path>";
        };
        readonly 'vibration-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M4 8v8\"></path><path d=\"M20 8v8\"></path><rect x=\"8\" y=\"3\" width=\"8\" height=\"18\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
        };
        readonly wearable: {
            readonly body: "<rect x=\"7\" y=\"6\" width=\"10\" height=\"12\" rx=\"3\"></rect><path d=\"M9 6V3h6v3\"></path><path d=\"M9 18v3h6v-3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly airplay: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m12 15 5 6H7l5-6z\"></path>";
        };
        readonly beacon: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M8 8a6 6 0 0 0 0 8\"></path><path d=\"M16 8a6 6 0 0 1 0 8\"></path><path d=\"M5 5a10 10 0 0 0 0 14\"></path><path d=\"M19 5a10 10 0 0 1 0 14\"></path>";
        };
        readonly 'bluetooth-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"m7 7 10 10-5 4V3l5 4-5 5\"></path><path d=\"M7 17l4-4\"></path>";
        };
        readonly 'camera-switch': {
            readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle><path d=\"M7 13h3\"></path><path d=\"m8 11-2 2 2 2\"></path><path d=\"M17 13h-3\"></path><path d=\"m16 15 2-2-2-2\"></path>";
        };
        readonly 'device-hub': {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><rect x=\"15\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"></rect><path d=\"M12 9v3\"></path><path d=\"M6 15v-3h12v3\"></path>";
        };
        readonly 'display-check': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"m8 10 2 2 5-5\"></path>";
        };
        readonly firmware: {
            readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"16\" rx=\"2\"></rect><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"M16 14v6\"></path><path d=\"M13 17h6\"></path>";
        };
        readonly gpu: {
            readonly body: "<rect x=\"5\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"M9 2v4\"></path><path d=\"M15 2v4\"></path><path d=\"M9 18v4\"></path><path d=\"M15 18v4\"></path><path d=\"M2 10h3\"></path><path d=\"M19 10h3\"></path><path d=\"M9 10h6v4H9z\"></path>";
        };
        readonly 'iot-device': {
            readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M12 2v5\"></path><path d=\"M12 17v5\"></path><path d=\"M2 12h5\"></path><path d=\"M17 12h5\"></path>";
        };
        readonly 'mobile-hotspot': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M10 8a4 4 0 0 1 4 0\"></path><path d=\"M8 6a7 7 0 0 1 8 0\"></path><path d=\"M12 11h.01\"></path>";
        };
        readonly 'printer-error': {
            readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4\"></path><path d=\"M7 14h10v7H7z\"></path><path d=\"M18 17v3\"></path><path d=\"M18 23h.01\"></path>";
        };
        readonly 'qr-scanner': {
            readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><rect x=\"7\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"14\" y=\"7\" width=\"3\" height=\"3\"></rect><rect x=\"7\" y=\"14\" width=\"3\" height=\"3\"></rect><path d=\"M14 14h3v3\"></path>";
        };
    };
    readonly 'admin-security': {
        readonly alert: {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly approval: {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
        };
        readonly audit: {
            readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
        };
        readonly award: {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"m8.5 12.5-2 8 5.5-3 5.5 3-2-8\"></path>";
        };
        readonly brain: {
            readonly body: "<path d=\"M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2.2V4.8A3 3 0 0 0 9 4z\"></path><path d=\"M15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-5 2.2V4.8A3 3 0 0 1 15 4z\"></path><path d=\"M7 10h4\"></path><path d=\"M13 14h4\"></path>";
        };
        readonly briefcase: {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path><path d=\"M10 12v2h4v-2\"></path>";
        };
        readonly building: {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path>";
        };
        readonly calculator: {
            readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 15h.01\"></path><path d=\"M12 15h.01\"></path><path d=\"M16 15h.01\"></path>";
        };
        readonly error: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
        };
        readonly eye: {
            readonly body: "<path d=\"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly 'eye-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1\"></path><path d=\"M14.1 14.1A3 3 0 0 1 9.9 9.9\"></path><path d=\"M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1\"></path>";
        };
        readonly help: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
        };
        readonly info: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 10v6\"></path><path d=\"M12 7h.01\"></path>";
        };
        readonly key: {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v3\"></path>";
        };
        readonly lock: {
            readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path>";
        };
        readonly policy: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M14 3v5h5\"></path>";
        };
        readonly shield: {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path>";
        };
        readonly success: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly accessibility: {
            readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path>";
        };
        readonly badge: {
            readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
        };
        readonly 'check-square': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"m8 12 3 3 5-6\"></path>";
        };
        readonly fingerprint: {
            readonly body: "<path d=\"M3 11a9 9 0 0 1 18 0\"></path><path d=\"M6 19a12 12 0 0 0 2-7 4 4 0 0 1 8 0c0 2.8-.7 5.5-2 7.8\"></path><path d=\"M9 22a15 15 0 0 0 3-10\"></path><path d=\"M12 2a9 9 0 0 1 9 9c0 1.5-.2 3-.6 4.4\"></path><path d=\"M3.6 15A8 8 0 0 0 4 12\"></path>";
        };
        readonly id: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"9\" cy=\"10\" r=\"2\"></circle><path d=\"M6 16a3 3 0 0 1 6 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h3\"></path>";
        };
        readonly 'life-buoy': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"m4.9 4.9 4.3 4.3\"></path><path d=\"m14.8 14.8 4.3 4.3\"></path><path d=\"m19.1 4.9-4.3 4.3\"></path><path d=\"m9.2 14.8-4.3 4.3\"></path>";
        };
        readonly 'scale-balanced': {
            readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
        };
        readonly 'shield-check': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
        };
        readonly 'shield-lock': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><rect x=\"8.5\" y=\"11\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M10 11V9a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly 'shield-x': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
        };
        readonly 'user-check': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m16 11 2 2 4-4\"></path>";
        };
        readonly 'user-cog': {
            readonly body: "<path d=\"M14 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8\" cy=\"7\" r=\"4\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle><path d=\"M18 11v1\"></path><path d=\"M18 18v1\"></path><path d=\"m15.2 12.2.7.7\"></path><path d=\"m20.1 17.1.7.7\"></path>";
        };
        readonly 'user-minus': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M16 11h6\"></path>";
        };
        readonly 'user-plus': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
        };
        readonly 'user-x': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"m17 8 5 5\"></path><path d=\"m22 8-5 5\"></path>";
        };
        readonly 'users-round': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
        };
        readonly unlock: {
            readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path>";
        };
        readonly user: {
            readonly body: "<path d=\"M20 21a8 8 0 1 0-16 0\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>";
        };
        readonly users: {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
        };
        readonly warning: {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly 'badge-alert': {
            readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"M12 7v6\"></path><path d=\"M12 17h.01\"></path>";
        };
        readonly 'badge-check': {
            readonly body: "<path d=\"M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z\"></path><path d=\"m8.5 12 2.5 2.5L16 9\"></path>";
        };
        readonly certificate: {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M8 12.5V22l4-2 4 2v-9.5\"></path>";
        };
        readonly 'key-round': {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"4\"></circle><path d=\"M11.5 12.5H22\"></path><path d=\"M18 12.5v3\"></path><path d=\"M21 12.5v2\"></path>";
        };
        readonly keys: {
            readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><path d=\"M10 8h11\"></path><path d=\"M17 8v3\"></path><path d=\"M20 8v3\"></path><circle cx=\"7\" cy=\"17\" r=\"3\"></circle><path d=\"M10 17h8\"></path><path d=\"M15 17v3\"></path>";
        };
        readonly 'lock-keyhole': {
            readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
        };
        readonly 'lock-open': {
            readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path><circle cx=\"12\" cy=\"16\" r=\"1\"></circle><path d=\"M12 17v2\"></path>";
        };
        readonly permission: {
            readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"m15 16 2 2 4-4\"></path>";
        };
        readonly role: {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 10v10\"></path><path d=\"M15 17h6\"></path>";
        };
        readonly 'scan-face': {
            readonly body: "<path d=\"M7 3H5a2 2 0 0 0-2 2v2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M9 10h.01\"></path><path d=\"M15 10h.01\"></path><path d=\"M9 15a4 4 0 0 0 6 0\"></path>";
        };
        readonly 'shield-alert': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'shield-user': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M7.5 17a4.5 4.5 0 0 1 9 0\"></path>";
        };
        readonly 'user-round': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path>";
        };
        readonly 'user-round-check': {
            readonly body: "<circle cx=\"10\" cy=\"8\" r=\"5\"></circle><path d=\"M2 21a8 8 0 0 1 13-6.3\"></path><path d=\"m16 18 2 2 4-4\"></path>";
        };
        readonly 'users-plus': {
            readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M19 8v6\"></path><path d=\"M16 11h6\"></path>";
        };
        readonly agent: {
            readonly body: "<rect x=\"5\" y=\"7\" width=\"14\" height=\"12\" rx=\"4\"></rect><path d=\"M12 3v4\"></path><circle cx=\"9\" cy=\"13\" r=\"1\"></circle><circle cx=\"15\" cy=\"13\" r=\"1\"></circle><path d=\"M9 17h6\"></path>";
        };
        readonly 'agent-check': {
            readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m15 18 2 2 5-5\"></path>";
        };
        readonly 'agent-x': {
            readonly body: "<rect x=\"4\" y=\"7\" width=\"12\" height=\"12\" rx=\"4\"></rect><path d=\"M10 3v4\"></path><circle cx=\"8\" cy=\"13\" r=\"1\"></circle><circle cx=\"12\" cy=\"13\" r=\"1\"></circle><path d=\"m17 16 5 5\"></path><path d=\"m22 16-5 5\"></path>";
        };
        readonly 'ai-spark': {
            readonly body: "<path d=\"M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z\"></path>";
        };
        readonly 'audit-log': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M17 14.5V16l1 1\"></path>";
        };
        readonly consent: {
            readonly body: "<path d=\"M7 21V8a4 4 0 0 1 8 0v5\"></path><path d=\"M15 13V6a3 3 0 0 1 6 0v8a7 7 0 0 1-7 7H7\"></path><path d=\"m5 14 2 2 4-4\"></path>";
        };
        readonly model: {
            readonly body: "<path d=\"m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z\"></path><path d=\"M12 12 4 7.5\"></path><path d=\"m12 12 8-4.5\"></path><path d=\"M12 12v9\"></path>";
        };
        readonly prompt: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><path d=\"M12 15h5\"></path>";
        };
        readonly 'prompt-lock': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m7 9 3 3-3 3\"></path><rect x=\"13\" y=\"12\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 12v-1.5a1.5 1.5 0 0 1 3 0V12\"></path>";
        };
        readonly 'risk-score': {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M8 17h8\"></path><path d=\"m9 13 2 2 4-5\"></path>";
        };
        readonly 'tool-approval': {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m16 19 2 2 4-4\"></path>";
        };
        readonly 'tool-denied': {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L4 17v3h3l5.2-5.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"m17 17 4 4\"></path><path d=\"m21 17-4 4\"></path>";
        };
        readonly 'api-key': {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path>";
        };
        readonly credential: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"M5.5 16a3 3 0 0 1 5 0\"></path><path d=\"M14 9h4\"></path><path d=\"M14 13h4\"></path><path d=\"M14 17h2\"></path>";
        };
        readonly organization: {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M8 21v-5h8v5\"></path>";
        };
        readonly 'org-chart': {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
        };
        readonly secret: {
            readonly body: "<path d=\"M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
        };
        readonly 'service-account': {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 11v10\"></path><path d=\"M15 18h6\"></path>";
        };
        readonly session: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"17\" cy=\"15\" r=\"2\"></circle>";
        };
        readonly 'session-expired': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><circle cx=\"16\" cy=\"14\" r=\"3\"></circle><path d=\"M16 12.5V14l1 1\"></path><path d=\"m19 17 2 2\"></path>";
        };
        readonly tenant: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><rect x=\"13\" y=\"4\" width=\"8\" height=\"16\" rx=\"2\"></rect><path d=\"M7 8h.01\"></path><path d=\"M17 8h.01\"></path><path d=\"M7 12h.01\"></path><path d=\"M17 12h.01\"></path><path d=\"M7 20v-4\"></path><path d=\"M17 20v-4\"></path>";
        };
        readonly token: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><path d=\"m15.5 8.5 2 2\"></path><path d=\"m17.5 8.5-2 2\"></path>";
        };
        readonly workspace: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h4\"></path><path d=\"M13 17h3\"></path>";
        };
        readonly 'workspace-lock': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><rect x=\"13\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 14v-1.5a1.5 1.5 0 0 1 3 0V14\"></path>";
        };
        readonly 'access-request': {
            readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 16h6\"></path><path d=\"M19 13v6\"></path>";
        };
        readonly 'approval-policy': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 15 2 2 5-5\"></path><path d=\"M8 9h4\"></path>";
        };
        readonly 'audit-trail': {
            readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M19 6h2\"></path><path d=\"M19 12h2\"></path><path d=\"M19 18h2\"></path>";
        };
        readonly 'data-residency': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly governance: {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"m9 15 2 2 4-4\"></path>";
        };
        readonly 'policy-lock': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><rect x=\"8\" y=\"14\" width=\"8\" height=\"5\" rx=\"1\"></rect><path d=\"M10 14v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly 'data-retention': {
            readonly body: "<path d=\"M5 4h14v16H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
        };
        readonly scim: {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 8h1\"></path><path d=\"M8 11v3\"></path><path d=\"M16 11v3\"></path>";
        };
        readonly sso: {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><path d=\"M4 5h16\"></path><path d=\"M4 19h16\"></path>";
        };
        readonly 'trust-center': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path><circle cx=\"18\" cy=\"6\" r=\"2\"></circle>";
        };
        readonly 'user-invite': {
            readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 8v6\"></path><path d=\"M15 11h6\"></path><path d=\"m17 17 2 2 4-4\"></path>";
        };
        readonly 'user-provision': {
            readonly body: "<path d=\"M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"8.5\" cy=\"7\" r=\"4\"></circle><path d=\"M18 7v8\"></path><path d=\"m15 12 3 3 3-3\"></path><path d=\"M15 7h6\"></path>";
        };
        readonly aria: {
            readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><path d=\"M6 13h12\"></path>";
        };
        readonly 'assistive-mode': {
            readonly body: "<circle cx=\"12\" cy=\"4\" r=\"2\"></circle><path d=\"M4 8h16\"></path><path d=\"M12 6v7\"></path><path d=\"M8 22l4-9 4 9\"></path><circle cx=\"19\" cy=\"18\" r=\"3\"></circle><path d=\"m18 18 1 1 2-2\"></path>";
        };
        readonly 'compliance-evidence': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"m14 17 2 2 4-4\"></path>";
        };
        readonly 'consent-record': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m8 17 2 2 5-5\"></path><path d=\"M17 14h3\"></path>";
        };
        readonly 'incident-response': {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M18 15a4 4 0 0 1-6.8 2.8L10 16\"></path><path d=\"M10 19v-3h3\"></path>";
        };
        readonly 'keyboard-access': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M7 9h.01\"></path><path d=\"M11 9h.01\"></path><path d=\"M15 9h.01\"></path><path d=\"M19 9h.01\"></path><path d=\"M8 17h8\"></path><path d=\"m16 14 2 2 4-4\"></path>";
        };
        readonly 'permission-review': {
            readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
        };
        readonly privacy: {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M2 2l20 20\"></path><path d=\"M9.9 9.9A3 3 0 0 0 14.1 14.1\"></path>";
        };
        readonly 'screen-reader': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path><path d=\"M7 9h10\"></path><path d=\"M7 12h6\"></path><path d=\"M18 18c2-2 2-4 0-6\"></path>";
        };
        readonly 'voice-access': {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path><path d=\"m16 5 2-2\"></path><path d=\"m18 8 3-1\"></path>";
        };
        readonly 'access-expiry': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"m17 17 3 3\"></path>";
        };
        readonly 'audit-event': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"M16 14.5V16l1 1\"></path><path d=\"M20 5h2\"></path>";
        };
        readonly 'data-classification': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h6\"></path><path d=\"M8 16h4\"></path><path d=\"M16 14l3 3\"></path><path d=\"M19 14l-3 3\"></path>";
        };
        readonly 'device-policy': {
            readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path><path d=\"m9 15 2 2 4-4\"></path>";
        };
        readonly 'encryption-key': {
            readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v2\"></path><rect x=\"13\" y=\"4\" width=\"7\" height=\"5\" rx=\"1\"></rect><path d=\"M14.5 4V2.5a2 2 0 0 1 4 0V4\"></path>";
        };
        readonly 'identity-provider': {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><rect x=\"15\" y=\"6\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M18 12v7\"></path><path d=\"M15 16h6\"></path>";
        };
        readonly 'ip-allowlist': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path><path d=\"m8 12 2 2 5-5\"></path>";
        };
        readonly 'legal-hold': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h4\"></path><path d=\"M17 13v8\"></path><path d=\"M14 16h6\"></path>";
        };
        readonly 'tls-certificate': {
            readonly body: "<path d=\"M6 3h12v12H6z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h4\"></path><path d=\"M9 15v6l3-2 3 2v-6\"></path><path d=\"m15 5 2 2 4-4\"></path>";
        };
        readonly 'zero-trust': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 2l20 20\"></path>";
        };
        readonly 'x-circle': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
        };
    };
    readonly workflow: {
        readonly activity: {
            readonly body: "<path d=\"M22 12h-4l-3 8L9 4l-3 8H2\"></path>";
        };
        readonly calendar: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path>";
        };
        readonly clock: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path>";
        };
        readonly command: {
            readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
        };
        readonly download: {
            readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"M7 10l5 5 5-5\"></path><path d=\"M12 15V3\"></path>";
        };
        readonly filter: {
            readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path>";
        };
        readonly flag: {
            readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h12l-2 4 2 4H5\"></path>";
        };
        readonly inbox: {
            readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path>";
        };
        readonly layers: {
            readonly body: "<path d=\"m12 2 9 5-9 5-9-5 9-5z\"></path><path d=\"m3 12 9 5 9-5\"></path><path d=\"m3 17 9 5 9-5\"></path>";
        };
        readonly link: {
            readonly body: "<path d=\"M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2\"></path><path d=\"M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2\"></path>";
        };
        readonly list: {
            readonly body: "<path d=\"M8 6h13\"></path><path d=\"M8 12h13\"></path><path d=\"M8 18h13\"></path><path d=\"M3 6h.01\"></path><path d=\"M3 12h.01\"></path><path d=\"M3 18h.01\"></path>";
        };
        readonly package: {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M7.5 5.5 16.5 10.5\"></path>";
        };
        readonly 'qr-code': {
            readonly body: "<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"15\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\"></rect><path d=\"M15 15h2v2h-2z\"></path><path d=\"M19 15h2v6h-6v-2\"></path><path d=\"M12 3v3\"></path><path d=\"M12 12h3\"></path>";
        };
        readonly refresh: {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
        };
        readonly rocket: {
            readonly body: "<path d=\"M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5\"></path><path d=\"M9 15 4 20\"></path><path d=\"M15 9l-6 6\"></path><path d=\"M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z\"></path>";
        };
        readonly sliders: {
            readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
        };
        readonly sync: {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
        };
        readonly table: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path>";
        };
        readonly tag: {
            readonly body: "<path d=\"M20 12 12 20 3 11V3h8l9 9z\"></path><path d=\"M7 7h.01\"></path>";
        };
        readonly target: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle>";
        };
        readonly tool: {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
        };
        readonly trash: {
            readonly body: "<path d=\"M3 6h18\"></path><path d=\"M8 6V4h8v2\"></path><path d=\"M19 6l-1 15H6L5 6\"></path><path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path>";
        };
        readonly branch: {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M8.5 8.5 12 15\"></path><path d=\"m15.5 8.5-3.5 6.5\"></path>";
        };
        readonly bug: {
            readonly body: "<rect x=\"7\" y=\"8\" width=\"10\" height=\"12\" rx=\"5\"></rect><path d=\"M9 8 7 5\"></path><path d=\"m15 8 2-3\"></path><path d=\"M3 13h4\"></path><path d=\"M17 13h4\"></path><path d=\"M4 19l3-2\"></path><path d=\"m17 17 3 2\"></path><path d=\"M12 8v12\"></path>";
        };
        readonly 'calendar-check': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m8 16 2 2 5-5\"></path>";
        };
        readonly 'calendar-clock': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"15\" cy=\"16\" r=\"3\"></circle><path d=\"M15 14.5V16l1 1\"></path>";
        };
        readonly 'calendar-days': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 14h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 18h.01\"></path><path d=\"M12 18h.01\"></path>";
        };
        readonly 'calendar-plus': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v6\"></path><path d=\"M9 17h6\"></path>";
        };
        readonly 'calendar-x': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"m9 14 6 6\"></path><path d=\"m15 14-6 6\"></path>";
        };
        readonly grab: {
            readonly body: "<path d=\"M8 5h.01\"></path><path d=\"M12 5h.01\"></path><path d=\"M16 5h.01\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M8 19h.01\"></path><path d=\"M12 19h.01\"></path><path d=\"M16 19h.01\"></path>";
        };
        readonly history: {
            readonly body: "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8\"></path><path d=\"M3 3v5h5\"></path><path d=\"M12 7v5l3 2\"></path>";
        };
        readonly kanban: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M6 8h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M18 9h.01\"></path>";
        };
        readonly 'list-check': {
            readonly body: "<path d=\"M10 6h11\"></path><path d=\"M10 12h11\"></path><path d=\"M10 18h11\"></path><path d=\"m3 6 1.5 1.5L8 4\"></path><path d=\"m3 12 1.5 1.5L8 10\"></path><path d=\"m3 18 1.5 1.5L8 16\"></path>";
        };
        readonly 'list-filter': {
            readonly body: "<path d=\"M4 6h16\"></path><path d=\"M7 12h10\"></path><path d=\"M10 18h4\"></path>";
        };
        readonly 'loader-circle': {
            readonly body: "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"></path>";
        };
        readonly 'log-in': {
            readonly body: "<path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"></path><path d=\"m10 17 5-5-5-5\"></path><path d=\"M15 12H3\"></path>";
        };
        readonly 'log-out': {
            readonly body: "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><path d=\"m16 17 5-5-5-5\"></path><path d=\"M21 12H9\"></path>";
        };
        readonly project: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"7\" height=\"7\" rx=\"2\"></rect><rect x=\"14\" y=\"13\" width=\"7\" height=\"7\" rx=\"2\"></rect><path d=\"M10 7h2a3 3 0 0 1 3 3v3\"></path><path d=\"M6.5 11v4A2.5 2.5 0 0 0 9 17.5h5\"></path>";
        };
        readonly puzzle: {
            readonly body: "<path d=\"M8 3h4a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2 2v4h-3a2 2 0 1 0 0 4h3v4a2 2 0 0 1-2 2h-4v-3a2 2 0 1 0-4 0v3H6a2 2 0 0 1-2-2v-4h3a2 2 0 1 0 0-4H4V7a4 4 0 0 1 4-4z\"></path>";
        };
        readonly repeat: {
            readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path>";
        };
        readonly 'reply-all': {
            readonly body: "<path d=\"m7 17-5-5 5-5\"></path><path d=\"m12 17-5-5 5-5\"></path><path d=\"M22 18v-2a4 4 0 0 0-4-4H7\"></path>";
        };
        readonly reply: {
            readonly body: "<path d=\"m9 17-5-5 5-5\"></path><path d=\"M20 18v-2a4 4 0 0 0-4-4H4\"></path>";
        };
        readonly 'sliders-horizontal': {
            readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
        };
        readonly 'sliders-vertical': {
            readonly body: "<path d=\"M6 4v8\"></path><path d=\"M6 16v4\"></path><path d=\"M4 14h4\"></path><path d=\"M12 4v4\"></path><path d=\"M12 12v8\"></path><path d=\"M10 10h4\"></path><path d=\"M18 4v10\"></path><path d=\"M18 18v2\"></path><path d=\"M16 16h4\"></path>";
        };
        readonly 'sort-asc': {
            readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 18 3-3 3 3\"></path><path d=\"M20 6v9\"></path>";
        };
        readonly 'sort-desc': {
            readonly body: "<path d=\"M11 7H4\"></path><path d=\"M11 12H4\"></path><path d=\"M11 17H4\"></path><path d=\"m17 12 3 3 3-3\"></path><path d=\"M20 6v9\"></path>";
        };
        readonly stamp: {
            readonly body: "<path d=\"M8 21h8\"></path><path d=\"M6 17h12\"></path><path d=\"M9 13h6l1-8a4 4 0 0 0-8 0l1 8z\"></path><path d=\"M5 17v4h14v-4\"></path>";
        };
        readonly step: {
            readonly body: "<path d=\"M6 4h4v16H6z\"></path><path d=\"M14 4h4v16h-4z\"></path><path d=\"M10 12h4\"></path>";
        };
        readonly timer: {
            readonly body: "<circle cx=\"12\" cy=\"13\" r=\"8\"></circle><path d=\"M12 13l3-3\"></path><path d=\"M9 2h6\"></path><path d=\"M12 2v3\"></path>";
        };
        readonly wrench: {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
        };
        readonly upload: {
            readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M12 3v12\"></path>";
        };
        readonly automation: {
            readonly body: "<path d=\"M4 7h5\"></path><path d=\"M15 7h5\"></path><circle cx=\"12\" cy=\"7\" r=\"3\"></circle><path d=\"M4 17h5\"></path><path d=\"M15 17h5\"></path><circle cx=\"12\" cy=\"17\" r=\"3\"></circle><path d=\"M12 10v4\"></path>";
        };
        readonly backlog: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"12\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"19\" width=\"12\" height=\"2\" rx=\"1\"></rect>";
        };
        readonly dependency: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 8h3a4 4 0 0 1 4 4v1\"></path><path d=\"m13 10 3 3 3-3\"></path>";
        };
        readonly 'git-branch': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6h3a6 6 0 0 1 6 6v3\"></path>";
        };
        readonly 'git-commit': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M2 12h6\"></path><path d=\"M16 12h6\"></path>";
        };
        readonly 'git-merge': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M9 6c6 0 9 3 9 9\"></path>";
        };
        readonly 'git-pull-request': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><circle cx=\"6\" cy=\"18\" r=\"3\"></circle><path d=\"M6 9v6\"></path><path d=\"M18 15V8a2 2 0 0 0-2-2h-3\"></path><path d=\"m14 3-3 3 3 3\"></path>";
        };
        readonly milestone: {
            readonly body: "<path d=\"M4 5h10l6 7-6 7H4z\"></path><path d=\"M9 9h5\"></path><path d=\"M9 13h7\"></path>";
        };
        readonly 'route-turn': {
            readonly body: "<path d=\"M4 6h8a4 4 0 0 1 4 4v11\"></path><path d=\"m12 17 4 4 4-4\"></path><circle cx=\"4\" cy=\"6\" r=\"2\"></circle>";
        };
        readonly 'status-dot': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
        };
        readonly 'task-check': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m8 12 2 2 5-5\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly 'task-clock': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path><path d=\"M8 18h8\"></path>";
        };
        readonly 'task-x': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"m9 10 6 6\"></path><path d=\"m15 10-6 6\"></path>";
        };
        readonly timeline: {
            readonly body: "<path d=\"M5 4v16\"></path><circle cx=\"5\" cy=\"7\" r=\"2\"></circle><circle cx=\"5\" cy=\"17\" r=\"2\"></circle><path d=\"M9 7h12\"></path><path d=\"M9 17h12\"></path>";
        };
        readonly webhook: {
            readonly body: "<path d=\"M18 16.5A4 4 0 1 1 14 12\"></path><path d=\"M6 16.5A4 4 0 1 0 10 12\"></path><path d=\"M12 5a4 4 0 0 1 2 7.5\"></path><path d=\"M12 5a4 4 0 0 0-2 7.5\"></path>";
        };
        readonly 'column-add': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M12 9v6\"></path><path d=\"M9 12h6\"></path>";
        };
        readonly 'column-delete': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"m10 10 4 4\"></path><path d=\"m14 10-4 4\"></path>";
        };
        readonly 'data-join': {
            readonly body: "<circle cx=\"7\" cy=\"8\" r=\"3\"></circle><circle cx=\"17\" cy=\"16\" r=\"3\"></circle><path d=\"M9.5 9.5 14.5 14.5\"></path><path d=\"M14 8h4\"></path><path d=\"M16 6v4\"></path>";
        };
        readonly 'data-split': {
            readonly body: "<circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 12h3a3 3 0 0 0 3-3\"></path><path d=\"M9 12h3a3 3 0 0 1 3 3\"></path>";
        };
        readonly 'data-transform': {
            readonly body: "<path d=\"M4 7h8\"></path><path d=\"m9 4 3 3-3 3\"></path><path d=\"M20 17h-8\"></path><path d=\"m15 14-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
        };
        readonly 'filter-check': {
            readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 2 2 5-5\"></path>";
        };
        readonly 'filter-x': {
            readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path><path d=\"m8 18 5 5\"></path><path d=\"m13 18-5 5\"></path>";
        };
        readonly 'row-add': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
        };
        readonly 'row-delete': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M3 16h18\"></path><path d=\"m10 8 4 4\"></path><path d=\"m14 8-4 4\"></path>";
        };
        readonly 'table-export': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 14v6\"></path><path d=\"m16 17 3 3 3-3\"></path>";
        };
        readonly 'table-import': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v16\"></path><path d=\"M19 20v-6\"></path><path d=\"m16 17 3-3 3 3\"></path>";
        };
        readonly 'table-search': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><path d=\"M15 4v7\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 18 3 3\"></path>";
        };
        readonly 'table-settings': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 4v16\"></path><circle cx=\"16\" cy=\"16\" r=\"2\"></circle><path d=\"M16 12v1\"></path><path d=\"M16 19v1\"></path><path d=\"M12 16h1\"></path><path d=\"M19 16h1\"></path>";
        };
        readonly 'workflow-branch': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"M12 10v6\"></path>";
        };
        readonly 'approval-pending': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 10v2l1.5 1\"></path>";
        };
        readonly 'approval-rejected': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9.5 9.5 5 5\"></path><path d=\"m14.5 9.5-5 5\"></path>";
        };
        readonly 'approval-request': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 12h6\"></path><path d=\"M12 9v6\"></path>";
        };
        readonly escalation: {
            readonly body: "<path d=\"M4 18h16\"></path><path d=\"M7 18v-5\"></path><path d=\"M12 18V9\"></path><path d=\"M17 18V5\"></path><path d=\"m14 8 3-3 3 3\"></path>";
        };
        readonly handoff: {
            readonly body: "<path d=\"M4 13h8\"></path><path d=\"m9 10 3 3-3 3\"></path><circle cx=\"6\" cy=\"7\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M14 17h-2a4 4 0 0 1-4-4\"></path>";
        };
        readonly queue: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect>";
        };
        readonly 'queue-next': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"12\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 8 4 4-4 4\"></path>";
        };
        readonly retry: {
            readonly body: "<path d=\"M21 12a9 9 0 1 1-3-6.7\"></path><path d=\"M21 3v6h-6\"></path><path d=\"M12 8v4l3 2\"></path>";
        };
        readonly rollback: {
            readonly body: "<path d=\"M3 7h11a6 6 0 1 1 0 12H8\"></path><path d=\"m7 3-4 4 4 4\"></path>";
        };
        readonly runbook: {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h3\"></path><path d=\"m14 16 2 2 4-4\"></path>";
        };
        readonly sla: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M7 19h10\"></path>";
        };
        readonly 'task-priority': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"M8 16h3\"></path><path d=\"M17 8v6\"></path><path d=\"M17 18h.01\"></path>";
        };
        readonly 'ai-run': {
            readonly body: "<path d=\"m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z\"></path><path d=\"M5 21h14\"></path><path d=\"m14 18 3 3 3-3\"></path>";
        };
        readonly 'event-stream': {
            readonly body: "<path d=\"M4 6h4\"></path><path d=\"M4 12h8\"></path><path d=\"M4 18h4\"></path><path d=\"M14 6h6\"></path><path d=\"M16 12h4\"></path><path d=\"M14 18h6\"></path><path d=\"m10 6 4 6-4 6\"></path>";
        };
        readonly 'html-partial': {
            readonly body: "<path d=\"m8 6-5 6 5 6\"></path><path d=\"m16 6 5 6-5 6\"></path><path d=\"M10 4h4\"></path><path d=\"M10 20h4\"></path><path d=\"M12 4v16\"></path>";
        };
        readonly hydrate: {
            readonly body: "<path d=\"M4 8h8\"></path><path d=\"m9 5 3 3-3 3\"></path><path d=\"M20 16h-8\"></path><path d=\"m15 13-3 3 3 3\"></path><rect x=\"4\" y=\"13\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"14\" y=\"5\" width=\"6\" height=\"6\" rx=\"2\"></rect>";
        };
        readonly job: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M8 17h3\"></path><circle cx=\"17\" cy=\"16\" r=\"2\"></circle>";
        };
        readonly 'job-failed': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"m14 14 5 5\"></path><path d=\"m19 14-5 5\"></path>";
        };
        readonly 'job-running': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><path d=\"M16 14a3 3 0 1 1-2.1 5.1\"></path><path d=\"M16 12v3h-3\"></path>";
        };
        readonly 'mcp-call': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 9 2 4 4-2\"></path>";
        };
        readonly 'mcp-result': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"8\" rx=\"2\"></rect><rect x=\"13\" y=\"11\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M11 9h2a4 4 0 0 1 4 4\"></path><path d=\"m15 17 2 2 5-5\"></path>";
        };
        readonly orchestration: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"9\" y=\"16\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h6\"></path><path d=\"m8 10 3 6\"></path><path d=\"m16 10-3 6\"></path>";
        };
        readonly 'partial-swap': {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><rect x=\"13\" y=\"5\" width=\"8\" height=\"14\" rx=\"2\"></rect><path d=\"m8 9 3 3-3 3\"></path><path d=\"m16 15-3-3 3-3\"></path>";
        };
        readonly polling: {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly rehydrate: {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"2\"></rect><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly revalidate: {
            readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"m8 12 2 2 5-5\"></path>";
        };
        readonly sse: {
            readonly body: "<path d=\"M4 12h4\"></path><path d=\"M12 6v12\"></path><path d=\"M16 8c2 1 3 2.3 3 4s-1 3-3 4\"></path><path d=\"M19 5c3 2 4 4.3 4 7s-1 5-4 7\"></path>";
        };
        readonly websocket: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"m7 10 3 2-3 2\"></path><path d=\"m17 10-3 2 3 2\"></path><path d=\"M3 12h4\"></path><path d=\"M17 12h4\"></path>";
        };
        readonly appointment: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"m14 16 2 2 4-4\"></path>";
        };
        readonly booking: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
        };
        readonly 'checklist-clock': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"m8 10 1 1 2-2\"></path><path d=\"M13 10h3\"></path><circle cx=\"14\" cy=\"16\" r=\"3\"></circle><path d=\"M14 14.5V16l1 1\"></path>";
        };
        readonly 'dispatch-board': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M9 10v10\"></path><path d=\"M13 14h5\"></path><path d=\"M13 17h3\"></path><path d=\"M6 14h.01\"></path>";
        };
        readonly 'incident-alert': {
            readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path><path d=\"M4 21h16\"></path>";
        };
        readonly maintenance: {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><circle cx=\"18\" cy=\"18\" r=\"3\"></circle>";
        };
        readonly 'process-loop': {
            readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><circle cx=\"12\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly recurrence: {
            readonly body: "<path d=\"M17 2l4 4-4 4\"></path><path d=\"M3 11V9a3 3 0 0 1 3-3h15\"></path><path d=\"M7 22l-4-4 4-4\"></path><path d=\"M21 13v2a3 3 0 0 1-3 3H3\"></path><path d=\"M12 8v8\"></path><path d=\"M9 12h6\"></path>";
        };
        readonly repair: {
            readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path><path d=\"M18 15v6\"></path><path d=\"M15 18h6\"></path>";
        };
        readonly rota: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path><path d=\"M13 15h4\"></path><path d=\"M7 18h3\"></path><path d=\"M13 18h5\"></path>";
        };
        readonly 'service-window': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><circle cx=\"12\" cy=\"16\" r=\"3\"></circle><path d=\"M12 14.5V16l1 1\"></path>";
        };
        readonly shift: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path><path d=\"M5 19h14\"></path><path d=\"M7 5l10 14\"></path>";
        };
        readonly 'triage-queue': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"M17 18v4\"></path><path d=\"M15 20h4\"></path>";
        };
        readonly 'work-order': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"m15 15 2 2 4-4\"></path>";
        };
        readonly workflow: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"14\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h3a3 3 0 0 1 3 3v4\"></path><path d=\"M12 17H9a3 3 0 0 1-3-3v-4\"></path>";
        };
        readonly 'batch-job': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"12\" height=\"4\" rx=\"1\"></rect><path d=\"m17 17 3 2-3 2\"></path>";
        };
        readonly 'blocked-task': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M8.5 8.5 15.5 15.5\"></path>";
        };
        readonly 'calendar-sync': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path><path d=\"M16 15a4 4 0 1 1-3-3.9\"></path><path d=\"M16 12v3h-3\"></path>";
        };
        readonly 'change-request': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h4\"></path><path d=\"M16 15h5\"></path><path d=\"m18 12 3 3-3 3\"></path>";
        };
        readonly 'decision-node': {
            readonly body: "<path d=\"m12 3 8 9-8 9-8-9 8-9z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'event-trigger': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l4 2\"></path><path d=\"M19 5l3-3\"></path><path d=\"M22 2v6h-6\"></path>";
        };
        readonly 'form-approval': {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M8 8h8\"></path><path d=\"M8 12h5\"></path><path d=\"m9 17 2 2 5-5\"></path>";
        };
        readonly 'job-queue': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"11\" width=\"16\" height=\"4\" rx=\"1\"></rect><rect x=\"4\" y=\"17\" width=\"16\" height=\"4\" rx=\"1\"></rect><circle cx=\"19\" cy=\"7\" r=\"2\"></circle>";
        };
        readonly 'manual-step': {
            readonly body: "<path d=\"M7 11V5a2 2 0 0 1 4 0v6\"></path><path d=\"M11 11V4a2 2 0 0 1 4 0v7\"></path><path d=\"M15 12V7a2 2 0 0 1 4 0v8a7 7 0 0 1-14 0v-2\"></path>";
        };
        readonly 'process-map': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"4\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"9\" y=\"15\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M9 6.5h6\"></path><path d=\"M12 9v6\"></path>";
        };
        readonly release: {
            readonly body: "<path d=\"M12 3l3 6 6 1-4.5 4.4 1 6.6L12 18l-5.5 3 1-6.6L3 10l6-1 3-6z\"></path><path d=\"M12 8v5\"></path><path d=\"M12 16h.01\"></path>";
        };
        readonly 'rule-engine': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M8 9h8\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"15\" r=\"2\"></circle><path d=\"M16 11v2\"></path><path d=\"M16 17v2\"></path><path d=\"M12 15h2\"></path><path d=\"M18 15h2\"></path>";
        };
        readonly 'task-delegated': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M8 9h6\"></path><path d=\"M8 13h4\"></path><circle cx=\"16\" cy=\"16\" r=\"3\"></circle><path d=\"m18 14 3-3\"></path><path d=\"M21 11v4h-4\"></path>";
        };
        readonly 'workflow-template': {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><rect x=\"6\" y=\"7\" width=\"5\" height=\"4\" rx=\"1\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"4\" rx=\"1\"></rect><path d=\"M11 9h3a3 3 0 0 1 3 3v1\"></path>";
        };
    };
    readonly domain: {
        readonly box: {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path>";
        };
        readonly compass: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path>";
        };
        readonly globe: {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path>";
        };
        readonly heart: {
            readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path>";
        };
        readonly location: {
            readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>";
        };
        readonly map: {
            readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path>";
        };
        readonly anchor: {
            readonly body: "<circle cx=\"12\" cy=\"5\" r=\"3\"></circle><path d=\"M12 8v13\"></path><path d=\"M5 12H2a10 10 0 0 0 20 0h-3\"></path>";
        };
        readonly flask: {
            readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M7 16h10\"></path>";
        };
        readonly 'heart-pulse': {
            readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path><path d=\"M3 13h4l2-4 3 8 2-4h7\"></path>";
        };
        readonly magnet: {
            readonly body: "<path d=\"M6 3v8a6 6 0 0 0 12 0V3\"></path><path d=\"M6 8h4\"></path><path d=\"M14 8h4\"></path><path d=\"M6 3h4\"></path><path d=\"M14 3h4\"></path>";
        };
        readonly presentation: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M12 16v5\"></path><path d=\"m8 21 4-5 4 5\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
        };
        readonly school: {
            readonly body: "<path d=\"m3 10 9-6 9 6-9 6-9-6z\"></path><path d=\"M7 12v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 10v6\"></path>";
        };
        readonly sitemap: {
            readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"3\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><rect x=\"15\" y=\"16\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M12 8v4\"></path><path d=\"M6 16v-4h12v4\"></path>";
        };
        readonly suitcase: {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M3 12h18\"></path>";
        };
        readonly train: {
            readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M9 19 7 22\"></path><path d=\"m15 19 2 3\"></path><path d=\"M8 8h8\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path>";
        };
        readonly wand: {
            readonly body: "<path d=\"M15 4 20 9\"></path><path d=\"M14.5 9.5 4 20\"></path><path d=\"M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z\"></path><path d=\"m5 3 .7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7L5 3z\"></path>";
        };
        readonly ambulance: {
            readonly body: "<path d=\"M3 17h2\"></path><path d=\"M19 17h2\"></path><path d=\"M5 17V7h9l4 4h3v6\"></path><path d=\"M8 11h4\"></path><path d=\"M10 9v4\"></path><circle cx=\"7\" cy=\"17\" r=\"2\"></circle><circle cx=\"17\" cy=\"17\" r=\"2\"></circle>";
        };
        readonly bed: {
            readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M12 12h6a3 3 0 0 1 3 3v-1\"></path>";
        };
        readonly bus: {
            readonly body: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"16\" rx=\"3\"></rect><path d=\"M7 8h10\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M8 19 6 22\"></path><path d=\"m16 19 2 3\"></path>";
        };
        readonly car: {
            readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><path d=\"M7 17v2\"></path><path d=\"M17 17v2\"></path><path d=\"M7 12h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
        };
        readonly clinic: {
            readonly body: "<path d=\"M4 21V8l8-5 8 5v13\"></path><path d=\"M9 21v-6h6v6\"></path><path d=\"M12 7v5\"></path><path d=\"M9.5 9.5h5\"></path>";
        };
        readonly dna: {
            readonly body: "<path d=\"M7 3c7 4 7 14 0 18\"></path><path d=\"M17 3c-7 4-7 14 0 18\"></path><path d=\"M8 7h8\"></path><path d=\"M8 12h8\"></path><path d=\"M8 17h8\"></path>";
        };
        readonly factory: {
            readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path>";
        };
        readonly 'flag-triangle': {
            readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h14l-4 5 4 5H5\"></path>";
        };
        readonly 'globe-lock': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><rect x=\"14\" y=\"14\" width=\"6\" height=\"5\" rx=\"1\"></rect><path d=\"M15.5 14v-2a2 2 0 0 1 4 0v2\"></path>";
        };
        readonly 'graduation-cap': {
            readonly body: "<path d=\"m3 9 9-5 9 5-9 5-9-5z\"></path><path d=\"M7 11v5c3 2 7 2 10 0v-5\"></path><path d=\"M21 9v6\"></path>";
        };
        readonly leaf: {
            readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path>";
        };
        readonly library: {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path>";
        };
        readonly 'map-pin-check': {
            readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 10 2 2 4-4\"></path>";
        };
        readonly 'map-pin-plus': {
            readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path>";
        };
        readonly 'map-pin-x': {
            readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><path d=\"m9 7 6 6\"></path><path d=\"m15 7-6 6\"></path>";
        };
        readonly microscope: {
            readonly body: "<path d=\"M6 18h12\"></path><path d=\"M8 22h8\"></path><path d=\"M12 18v4\"></path><path d=\"M9 3h6v5H9z\"></path><path d=\"M12 8v4a4 4 0 0 1-4 4\"></path><path d=\"M15 8l3 3\"></path>";
        };
        readonly plane: {
            readonly body: "<path d=\"M22 2 11 13\"></path><path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path>";
        };
        readonly pill: {
            readonly body: "<path d=\"M10 21 3 14a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z\"></path><path d=\"m8.5 8.5 7 7\"></path>";
        };
        readonly recycle: {
            readonly body: "<path d=\"m7 19-3-5 3-5\"></path><path d=\"M4 14h7\"></path><path d=\"m17 5 3 5-3 5\"></path><path d=\"M20 10h-7\"></path><path d=\"m9 5 3-3 3 3\"></path><path d=\"M12 2v7\"></path>";
        };
        readonly route: {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path>";
        };
        readonly stethoscope: {
            readonly body: "<path d=\"M6 4v5a4 4 0 0 0 8 0V4\"></path><path d=\"M4 4h4\"></path><path d=\"M12 4h4\"></path><path d=\"M10 13v2a5 5 0 0 0 10 0v-1\"></path><circle cx=\"20\" cy=\"12\" r=\"2\"></circle>";
        };
        readonly syringe: {
            readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M3 21l6-6\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"m12 12 4 4\"></path>";
        };
        readonly 'traffic-light': {
            readonly body: "<rect x=\"8\" y=\"2\" width=\"8\" height=\"20\" rx=\"4\"></rect><circle cx=\"12\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"12\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"17\" r=\"1.5\"></circle>";
        };
        readonly wheelchair: {
            readonly body: "<circle cx=\"10\" cy=\"5\" r=\"2\"></circle><path d=\"M10 7v6h5l3 6\"></path><path d=\"M8 11a6 6 0 1 0 5.6 8\"></path><path d=\"M10 13h4\"></path>";
        };
        readonly 'wind-turbine': {
            readonly body: "<circle cx=\"12\" cy=\"8\" r=\"2\"></circle><path d=\"M12 10v11\"></path><path d=\"M12 8 5 5\"></path><path d=\"M12 8l7-3\"></path><path d=\"M12 8l2 8\"></path>";
        };
        readonly 'blood-drop': {
            readonly body: "<path d=\"M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z\"></path>";
        };
        readonly campus: {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
        };
        readonly 'cargo-ship': {
            readonly body: "<path d=\"M4 17h16l-3 4H7l-3-4z\"></path><path d=\"M7 17V9h9l3 8\"></path><path d=\"M9 9V5h5v4\"></path><path d=\"M3 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0\"></path>";
        };
        readonly classroom: {
            readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"11\" rx=\"2\"></rect><path d=\"M8 21l4-6 4 6\"></path><path d=\"M8 9h8\"></path><path d=\"M8 12h5\"></path>";
        };
        readonly container: {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"2\"></rect><path d=\"M7 7v10\"></path><path d=\"M11 7v10\"></path><path d=\"M15 7v10\"></path><path d=\"M19 7v10\"></path>";
        };
        readonly 'currency-dollar': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 6v12\"></path><path d=\"M16 8.5c-1-.8-2.3-1.2-4-1.2-2 0-3 .8-3 2s1 1.8 3 2.2 4 1 4 3-1.4 3.2-4 3.2c-1.8 0-3.2-.5-4.2-1.4\"></path>";
        };
        readonly 'currency-rupee': {
            readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9 7h7\"></path><path d=\"M9 10h7\"></path><path d=\"M14 7a3 3 0 0 1-3 5H9l6 5\"></path>";
        };
        readonly exam: {
            readonly body: "<path d=\"M6 3h12v18H6z\"></path><path d=\"M9 8h6\"></path><path d=\"M9 12h6\"></path><path d=\"M9 16h3\"></path><path d=\"m14 17 1.5 1.5L19 15\"></path>";
        };
        readonly 'first-aid': {
            readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path>";
        };
        readonly forklift: {
            readonly body: "<path d=\"M5 16V7h7l3 5v4\"></path><circle cx=\"7\" cy=\"18\" r=\"2\"></circle><circle cx=\"15\" cy=\"18\" r=\"2\"></circle><path d=\"M15 12h5v8\"></path><path d=\"M20 16h2\"></path><path d=\"M8 10h4\"></path>";
        };
        readonly insurance: {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 12h8\"></path><path d=\"M12 8v8\"></path>";
        };
        readonly investment: {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 17v-5\"></path><path d=\"M12 17V7\"></path><path d=\"M18 17v-8\"></path><path d=\"m6 10 6-5 6 4\"></path><path d=\"M16 5h4v4\"></path>";
        };
        readonly 'lab-report': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 17h8\"></path><path d=\"M10 9h4\"></path><path d=\"M11 9v5l-2 3\"></path><path d=\"M13 9v5l2 3\"></path>";
        };
        readonly ledger: {
            readonly body: "<path d=\"M5 3h14v18H5z\"></path><path d=\"M9 3v18\"></path><path d=\"M12 8h4\"></path><path d=\"M12 12h4\"></path><path d=\"M12 16h3\"></path>";
        };
        readonly loan: {
            readonly body: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M8 15h4\"></path><path d=\"M15 14l2 2 4-4\"></path>";
        };
        readonly 'medical-chart': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 15h3l2-5 2 7 2-4h3\"></path>";
        };
        readonly 'parcel-location': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 4-2.2\"></path><path d=\"M12 13v8\"></path><path d=\"M20 16c0 3-4 6-4 6s-4-3-4-6a4 4 0 1 1 8 0z\"></path><circle cx=\"16\" cy=\"16\" r=\"1\"></circle>";
        };
        readonly patient: {
            readonly body: "<circle cx=\"12\" cy=\"7\" r=\"4\"></circle><path d=\"M4 21a8 8 0 0 1 16 0\"></path><path d=\"M12 14v5\"></path><path d=\"M9.5 16.5h5\"></path>";
        };
        readonly tax: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"m8 17 8-8\"></path><circle cx=\"9\" cy=\"10\" r=\"1\"></circle><circle cx=\"15\" cy=\"16\" r=\"1\"></circle>";
        };
        readonly vaccine: {
            readonly body: "<path d=\"m18 2 4 4\"></path><path d=\"m17 7 2-2\"></path><path d=\"M4 20l5-5\"></path><path d=\"m9 15 6-6 4 4-6 6H9v-4z\"></path><path d=\"M7 18 4 21\"></path><path d=\"M12 12h4\"></path>";
        };
        readonly 'building-hospital': {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path>";
        };
        readonly 'delivery-bike': {
            readonly body: "<circle cx=\"6\" cy=\"17\" r=\"3\"></circle><circle cx=\"18\" cy=\"17\" r=\"3\"></circle><path d=\"M9 17h4l2-6h-4\"></path><path d=\"M13 11l3 6\"></path><path d=\"M8 11h3\"></path><path d=\"M5 8h4\"></path>";
        };
        readonly drone: {
            readonly body: "<rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" rx=\"2\"></rect><circle cx=\"4\" cy=\"4\" r=\"2\"></circle><circle cx=\"20\" cy=\"4\" r=\"2\"></circle><circle cx=\"4\" cy=\"20\" r=\"2\"></circle><circle cx=\"20\" cy=\"20\" r=\"2\"></circle><path d=\"M9 9 5.5 5.5\"></path><path d=\"m15 9 3.5-3.5\"></path><path d=\"M9 15 5.5 18.5\"></path><path d=\"m15 15 3.5 3.5\"></path>";
        };
        readonly 'fleet-vehicle': {
            readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M7 12h10\"></path><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path>";
        };
        readonly 'geo-fence': {
            readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"M12 8v8\"></path><path d=\"M8 12h8\"></path>";
        };
        readonly 'map-route': {
            readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path><path d=\"M6 9c3 4 9 1 12 5\"></path>";
        };
        readonly 'route-off': {
            readonly body: "<path d=\"M2 2l20 20\"></path><circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 4 4\"></path><path d=\"M12 20h3\"></path>";
        };
        readonly 'route-plus': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M18 4v6\"></path><path d=\"M15 7h6\"></path>";
        };
        readonly satellite: {
            readonly body: "<path d=\"M5 12 2 9l7-7 3 3-7 7z\"></path><path d=\"m12 5 7 7\"></path><path d=\"M14 14a4 4 0 0 1-4-4\"></path><path d=\"M18 18a8 8 0 0 1-8-8\"></path><path d=\"M21 21a11 11 0 0 1-11-11\"></path>";
        };
        readonly 'traffic-cone': {
            readonly body: "<path d=\"m12 3 7 18H5l7-18z\"></path><path d=\"M9 11h6\"></path><path d=\"M7 17h10\"></path>";
        };
        readonly agriculture: {
            readonly body: "<path d=\"M5 21c0-8 6-16 16-18 0 10-8 16-16 18z\"></path><path d=\"M5 21c3-6 7-9 12-12\"></path><path d=\"M4 13c4 0 7 3 8 7\"></path>";
        };
        readonly 'case-management': {
            readonly body: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h5\"></path>";
        };
        readonly crm: {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M14 7h7\"></path><path d=\"M14 11h5\"></path><path d=\"M14 15h7\"></path><path d=\"M14 19h4\"></path>";
        };
        readonly energy: {
            readonly body: "<path d=\"M13 2 6 13h5l-2 9 8-12h-5l1-8z\"></path><path d=\"M4 21h16\"></path>";
        };
        readonly hospitality: {
            readonly body: "<path d=\"M4 21V8a4 4 0 0 1 8 0v13\"></path><path d=\"M12 11h8v10\"></path><path d=\"M16 15h.01\"></path><path d=\"M16 18h.01\"></path><path d=\"M8 15h.01\"></path>";
        };
        readonly hr: {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><path d=\"M17 7h4\"></path><path d=\"M19 5v4\"></path><path d=\"M16 14h6\"></path><path d=\"M16 18h4\"></path>";
        };
        readonly legal: {
            readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 21h14\"></path><path d=\"M6 7h12\"></path><path d=\"m6 7-3 6h6L6 7z\"></path><path d=\"m18 7-3 6h6l-3-6z\"></path>";
        };
        readonly manufacturing: {
            readonly body: "<path d=\"M3 21V9l6 4V9l6 4V5h6v16H3z\"></path><path d=\"M7 17h.01\"></path><path d=\"M11 17h.01\"></path><path d=\"M15 17h.01\"></path><path d=\"M18 9h3\"></path>";
        };
        readonly 'public-sector': {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path>";
        };
        readonly 'quality-control': {
            readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"m8 14 2 2 5-5\"></path><circle cx=\"18\" cy=\"16\" r=\"2\"></circle>";
        };
        readonly 'real-estate': {
            readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path><path d=\"M16 5h3v4\"></path>";
        };
        readonly recruiting: {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"4\"></circle><path d=\"M2 21a6 6 0 0 1 12 0\"></path><circle cx=\"18\" cy=\"10\" r=\"3\"></circle><path d=\"M18 13v6\"></path><path d=\"M15 16h6\"></path>";
        };
        readonly 'service-desk': {
            readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path>";
        };
        readonly 'support-case': {
            readonly body: "<path d=\"M4 5h16v12H7l-4 4V5z\"></path><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
        };
        readonly 'ticket-queue': {
            readonly body: "<path d=\"M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z\"></path><path d=\"M13 6v12\"></path><path d=\"M6 21h12\"></path>";
        };
        readonly tourism: {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 9 8h6l3 13\"></path><path d=\"M12 8V3\"></path><path d=\"M9 3h6\"></path><path d=\"M8 14h8\"></path>";
        };
        readonly 'asset-maintenance': {
            readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M16 15a3 3 0 1 1-4.5 2.6\"></path><path d=\"M16 12v3h-3\"></path>";
        };
        readonly 'care-team': {
            readonly body: "<circle cx=\"8\" cy=\"8\" r=\"3\"></circle><circle cx=\"16\" cy=\"8\" r=\"3\"></circle><path d=\"M3 21a5 5 0 0 1 10 0\"></path><path d=\"M11 21a5 5 0 0 1 10 0\"></path><path d=\"M12 13v5\"></path><path d=\"M9.5 15.5h5\"></path>";
        };
        readonly dispatch: {
            readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M3 7h2\"></path><path d=\"M19 7h2\"></path><path d=\"m12 3 3 3-3 3\"></path>";
        };
        readonly facilities: {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M6 3V1\"></path>";
        };
        readonly 'field-service': {
            readonly body: "<path d=\"M5 17h14v-5l-2-5H7l-2 5v5z\"></path><circle cx=\"8\" cy=\"17\" r=\"2\"></circle><circle cx=\"16\" cy=\"17\" r=\"2\"></circle><path d=\"M12 4v5\"></path><path d=\"M9.5 6.5h5\"></path>";
        };
        readonly 'fleet-route': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6\"></path><path d=\"M5 14h4l1 2\"></path><path d=\"M3 16h8\"></path>";
        };
        readonly 'patient-portal': {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"10\" cy=\"11\" r=\"2\"></circle><path d=\"M7 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
        };
        readonly 'repair-order': {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M17 14v6\"></path><path d=\"M14 17h6\"></path>";
        };
        readonly 'site-visit': {
            readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle><path d=\"M8 21h8\"></path><path d=\"M12 18v3\"></path>";
        };
        readonly triage: {
            readonly body: "<path d=\"M4 5h16v14H4z\"></path><path d=\"M8 9h8\"></path><path d=\"M8 13h5\"></path><path d=\"M16 13v6\"></path><path d=\"M13 16h6\"></path>";
        };
        readonly claims: {
            readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M14 3v5h5\"></path><path d=\"M8 12h8\"></path><path d=\"M8 16h4\"></path><path d=\"m15 17 2 2 4-4\"></path>";
        };
        readonly construction: {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21V9l6-5 6 5v12\"></path><path d=\"M9 21v-7h6v7\"></path><path d=\"M4 9h16\"></path>";
        };
        readonly 'hotel-room': {
            readonly body: "<path d=\"M3 7v13\"></path><path d=\"M21 12v8\"></path><path d=\"M3 14h18\"></path><path d=\"M6 10h4a2 2 0 0 1 2 2v2H3v-4a3 3 0 0 1 3-3z\"></path><path d=\"M15 8h4v4\"></path>";
        };
        readonly 'insurance-policy': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M9 9h6\"></path><path d=\"M9 13h6\"></path><path d=\"M9 17h3\"></path>";
        };
        readonly lab: {
            readonly body: "<path d=\"M9 2h6\"></path><path d=\"M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2\"></path><path d=\"M8 16h8\"></path><circle cx=\"11\" cy=\"13\" r=\"1\"></circle>";
        };
        readonly 'meter-reading': {
            readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l4-5\"></path><path d=\"M7 19h10\"></path><path d=\"M8 15h.01\"></path><path d=\"M16 15h.01\"></path>";
        };
        readonly mining: {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M6 21 12 4l6 17\"></path><path d=\"M8 15h8\"></path><path d=\"M10 10h4\"></path><path d=\"M5 6h14\"></path>";
        };
        readonly pharmacy: {
            readonly body: "<rect x=\"4\" y=\"6\" width=\"16\" height=\"14\" rx=\"2\"></rect><path d=\"M9 6V4h6v2\"></path><path d=\"M12 10v6\"></path><path d=\"M9 13h6\"></path><path d=\"M7 20h10\"></path>";
        };
        readonly radiology: {
            readonly body: "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><path d=\"M12 7v10\"></path><path d=\"M7 12h10\"></path><path d=\"m9 9 6 6\"></path><path d=\"m15 9-6 6\"></path>";
        };
        readonly restaurant: {
            readonly body: "<path d=\"M7 3v8\"></path><path d=\"M5 3v4a2 2 0 0 0 4 0V3\"></path><path d=\"M7 11v10\"></path><path d=\"M16 3v18\"></path><path d=\"M13 3h3a4 4 0 0 1 0 8h-3\"></path>";
        };
        readonly telemedicine: {
            readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><path d=\"M6 17a3 3 0 0 1 6 0\"></path><path d=\"M16 10v5\"></path><path d=\"M13.5 12.5h5\"></path>";
        };
        readonly 'utility-pole': {
            readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M5 11h14\"></path>";
        };
        readonly airport: {
            readonly body: "<path d=\"M3 21h18\"></path><path d=\"M12 3v12\"></path><path d=\"m4 10 8 3 8-3\"></path><path d=\"m8 18 4-3 4 3\"></path>";
        };
        readonly 'branch-office': {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M12 11h.01\"></path><path d=\"M16 11h.01\"></path><path d=\"M9 21v-5h6v5\"></path><path d=\"M4 14h16\"></path>";
        };
        readonly 'call-center': {
            readonly body: "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"></path><rect x=\"3\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><rect x=\"17\" y=\"14\" width=\"4\" height=\"7\" rx=\"2\"></rect><path d=\"M12 19h5\"></path><circle cx=\"12\" cy=\"8\" r=\"2\"></circle>";
        };
        readonly 'data-center': {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M8 7h8\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h8\"></path><path d=\"M8 19h8\"></path><path d=\"M6 7h.01\"></path><path d=\"M6 11h.01\"></path><path d=\"M6 15h.01\"></path>";
        };
        readonly 'emergency-room': {
            readonly body: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"></rect><path d=\"M12 7v6\"></path><path d=\"M9 10h6\"></path><path d=\"M8 21v-5h8v5\"></path><path d=\"M18 5l3-3\"></path>";
        };
        readonly 'government-office': {
            readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M5 10v9\"></path><path d=\"M9 10v9\"></path><path d=\"M15 10v9\"></path><path d=\"M19 10v9\"></path><path d=\"M3 21h18\"></path><path d=\"M12 4v3\"></path><path d=\"M10 14h4\"></path>";
        };
        readonly 'insurance-claim': {
            readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"M8 11h8\"></path><path d=\"M8 15h5\"></path><path d=\"m14 17 2 2 4-4\"></path>";
        };
        readonly 'inventory-site': {
            readonly body: "<path d=\"M3 21V8l9-5 9 5v13\"></path><path d=\"M7 21v-8h10v8\"></path><path d=\"M7 13h10\"></path><path d=\"M7 17h10\"></path><path d=\"M4 8h16\"></path><path d=\"M12 3v5\"></path>";
        };
        readonly 'logistics-hub': {
            readonly body: "<circle cx=\"6\" cy=\"6\" r=\"3\"></circle><circle cx=\"18\" cy=\"6\" r=\"3\"></circle><circle cx=\"12\" cy=\"18\" r=\"3\"></circle><path d=\"M9 6h6\"></path><path d=\"m8 8 3 7\"></path><path d=\"m16 8-3 7\"></path><path d=\"M12 3v3\"></path>";
        };
        readonly 'power-grid': {
            readonly body: "<path d=\"M12 3v18\"></path><path d=\"M5 7h14\"></path><path d=\"M7 21l5-14 5 14\"></path><path d=\"M4 15h16\"></path><circle cx=\"12\" cy=\"7\" r=\"2\"></circle><circle cx=\"6\" cy=\"15\" r=\"2\"></circle><circle cx=\"18\" cy=\"15\" r=\"2\"></circle>";
        };
    };
};
type IconCategory = keyof typeof iconSets;

interface IconDefinition {
    body: string | string[];
    viewBox?: string;
}
interface IconOptions {
    className?: string;
    hidden?: boolean;
    size?: number | string;
    title?: string;
}
type IconRegistry = Record<string, IconDefinition>;
type IconStatus = 'stable' | 'draft' | 'deprecated';
interface IconMetadata {
    aliases: string[];
    category: string;
    name: string;
    since?: string;
    status: IconStatus;
    tags: string[];
}
interface IconSearchOptions {
    category?: string;
    includeDeprecated?: boolean;
}

declare const iconMetadata: Record<"code" | "hr" | "input" | "link" | "map" | "menu" | "meter" | "search" | "select" | "table" | "textarea" | "video" | "circle" | "filter" | "image" | "stop" | "annotation" | "loading" | "close" | "copy" | "drag" | "error" | "pause" | "play" | "uif" | "chart" | "dashboard" | "tool-approval" | "warning" | "target" | "success" | "offline" | "billing" | "organization" | "home" | "prompt" | "role" | "grid" | "palette" | "id" | "regression" | "shift" | "keys" | "sparkline" | "timeline" | "heatmap" | "histogram" | "box-plot" | "control-chart" | "treemap" | "area-chart" | "bar-chart" | "donut-chart" | "gauge-chart" | "funnel-chart" | "line-chart" | "pie-chart" | "radar-chart" | "scatter-chart" | "bubble-chart" | "waterfall-chart" | "route" | "alert" | "list" | "info" | "badge" | "breadcrumb" | "skeleton" | "sidebar" | "stepper" | "wizard" | "card" | "message" | "cache" | "queue" | "approval" | "browser" | "workspace" | "version" | "desktop-app" | "sync" | "storage" | "checkbox" | "repeat" | "markdown" | "quote" | "image-edit" | "undo" | "redo" | "indent" | "columns" | "command" | "file" | "key" | "anchor" | "draft" | "batoi" | "arrow-down" | "arrow-left" | "arrow-right" | "arrow-up" | "bot" | "check" | "check-circle" | "chevron-down" | "chevron-left" | "chevron-right" | "chevron-up" | "circle-dot" | "external-link" | "hash" | "maximize" | "minus" | "moon" | "more-horizontal" | "more-vertical" | "plus" | "settings" | "spark" | "star" | "sun" | "terminal" | "theme" | "arrow-down-left" | "arrow-down-right" | "arrow-up-left" | "arrow-up-right" | "chevrons-down" | "chevrons-left" | "chevrons-right" | "chevrons-up" | "corner-down-left" | "corner-down-right" | "corner-up-left" | "corner-up-right" | "layout-dashboard" | "layout-list" | "layout-panel-left" | "layout-panel-top" | "panel-bottom" | "panel-left" | "panel-right" | "panel-top" | "play-circle" | "plus-circle" | "plus-square" | "power" | "rotate-clockwise" | "search-check" | "search-x" | "square-dot" | "square-stack" | "stop-circle" | "arrow-left-right" | "arrow-up-down" | "ban" | "check-check" | "circle-alert" | "circle-help" | "ellipsis" | "ellipsis-vertical" | "maximize2" | "minimize" | "minimize2" | "move" | "move-horizontal" | "move-vertical" | "panel-close" | "panel-open" | "pin" | "pin-off" | "rotate-counter-clockwise" | "scan" | "scan-line" | "toggle-left" | "toggle-right" | "checkbox-checked" | "checkbox-minus" | "field-required" | "input-error" | "input-password" | "input-search" | "radio-checked" | "radio-unchecked" | "validation-error" | "command-palette" | "density-comfortable" | "density-compact" | "empty-box" | "empty-search" | "empty-state" | "focus-mode" | "nav-back" | "nav-forward" | "quick-action" | "sidebar-collapse" | "sidebar-expand" | "shortcut" | "split-view" | "spotlight" | "state-error" | "state-success" | "state-warning" | "tour" | "app-launcher" | "app-shell" | "bottom-sheet" | "command-key" | "dock" | "floating-action" | "gesture" | "inspector" | "launcher" | "navigator" | "onboarding" | "resizer" | "shell-command" | "status-bar" | "touch-target" | "workspace-switcher" | "action-bar" | "context-panel" | "filter-chip" | "keyboard-shortcut" | "side-panel" | "top-bar" | "x-square" | "zoom-in" | "zoom-out" | "chart-candlestick" | "chart-column" | "chart-no-axes" | "chart-stacked" | "axis-x" | "axis-y" | "chart-combo" | "chart-network" | "chart-spline" | "chart-step" | "conversion-funnel" | "dial" | "forecast" | "horizontal-bar-chart" | "kpi" | "progress-ring" | "scorecard" | "stacked-area-chart" | "table-chart" | "trend-down" | "trend-up" | "ab-test" | "cohort" | "experiment" | "goal-chart" | "growth-loop" | "retention" | "segment" | "target-metric" | "activation" | "benchmark" | "churn" | "expansion-revenue" | "forecast-band" | "ltv" | "mrr" | "nps" | "revenue-chart" | "roi" | "session-chart" | "win-rate" | "adoption-chart" | "capacity-chart" | "cohort-grid" | "contribution-chart" | "dependency-chart" | "error-rate" | "latency" | "percentile" | "saturation" | "throughput-chart" | "vertical-bar-chart" | "anomaly-chart" | "baseline-chart" | "burndown-chart" | "burnup-chart" | "distribution-chart" | "gantt-chart" | "health-score" | "leaderboard-chart" | "map-chart" | "matrix-chart" | "pareto-chart" | "sankey-chart" | "bullet-chart" | "funnel-stage" | "metric-card" | "pivot-chart" | "variance-chart" | "bank" | "cart" | "cash" | "credit-card" | "receipt" | "badge-dollar" | "badge-percent" | "barcode" | "gift" | "invoice" | "landmark" | "shopping-bag" | "store" | "ticket" | "truck" | "vault" | "wallet" | "coins" | "coupon" | "dollar-sign" | "hand-coins" | "package-check" | "package-open" | "package-plus" | "package-x" | "percent" | "refund" | "scale" | "ship" | "shopping-cart-check" | "shopping-cart-plus" | "warehouse" | "billable" | "checkout" | "dispute" | "dunning" | "estimate" | "payment-failed" | "payment-link" | "payment-method" | "payout" | "price-tag" | "subscription" | "tax-receipt" | "usage" | "cart-abandoned" | "discount-code" | "fulfillment" | "inventory" | "inventory-alert" | "order-cancelled" | "order-check" | "order-pending" | "pos-terminal" | "procurement" | "purchase-order" | "return" | "shipment-track" | "shipping-label" | "account-payable" | "account-receivable" | "bill-pay" | "card-terminal" | "cash-register" | "chargeback" | "credit-note" | "debit-note" | "delivery-note" | "payment-scheduled" | "pricing-table" | "revenue-recognition" | "sales-order" | "vendor" | "billing-cycle" | "collection-case" | "contract-value" | "payment-gateway" | "remittance" | "revenue-ledger" | "sku" | "supplier" | "tax-id" | "till" | "trial" | "wholesale" | "at-sign" | "bell" | "mail" | "mic" | "paperclip" | "send" | "share" | "bell-off" | "megaphone" | "phone-call" | "broadcast" | "chat-check" | "chat-plus" | "chat-x" | "inbox-mail" | "mail-check" | "mail-open" | "mail-plus" | "mail-x" | "message-circle" | "message-square" | "mic-off" | "notification-dot" | "phone-forwarded" | "phone-incoming" | "phone-missed" | "phone-off" | "phone-outgoing" | "rss-feed" | "share-2" | "announcement" | "comment-check" | "comment-x" | "feedback" | "inbox-alert" | "mention" | "message-lock" | "thread" | "channel" | "channel-lock" | "channel-plus" | "collaboration" | "conversation" | "meeting" | "moderation" | "notification-check" | "notification-snooze" | "presence-away" | "presence-busy" | "presence-online" | "reaction" | "thread-resolved" | "call-muted" | "call-transfer" | "comment-thread" | "conversation-star" | "escalation-message" | "meeting-cancelled" | "meeting-check" | "mention-alert" | "notification-priority" | "presence-offline" | "support-inbox" | "survey" | "targeted-broadcast" | "transcript" | "voicemail" | "call-incoming" | "call-recording" | "chat-bot" | "chat-error" | "chat-resolved" | "contact-card" | "email-bounce" | "email-template" | "notification-digest" | "webhook-event" | "auto-reply" | "call-queue" | "campaign" | "chat-typing" | "email-opened" | "email-sent" | "inbox-priority" | "live-chat" | "message-draft" | "notification-muted" | "sms" | "support-agent" | "archive" | "camera" | "document" | "edit" | "folder" | "printer" | "save" | "align-center" | "align-left" | "align-right" | "book-open" | "bookmark" | "camera-off" | "clipboard" | "clipboard-check" | "clipboard-list" | "copy-check" | "file-check" | "file-code" | "file-down" | "file-minus" | "file-plus" | "file-text" | "file-up" | "file-x" | "folder-open" | "folder-plus" | "folder-sync" | "image-plus" | "pencil" | "scissors" | "sticky" | "clipboard-copy" | "clipboard-x" | "crop" | "eraser" | "file-archive" | "file-audio" | "file-image" | "file-json" | "file-lock" | "file-spreadsheet" | "file-video" | "folder-check" | "folder-down" | "folder-lock" | "folder-up" | "folder-x" | "newspaper" | "paintbrush" | "document-import" | "document-export" | "document-search" | "document-signature" | "file-csv" | "file-pdf" | "file-template" | "image-check" | "scan-document" | "template-plus" | "asset" | "asset-library" | "collection" | "content-calendar" | "empty-file" | "empty-folder" | "file-diff" | "file-history" | "knowledge-base" | "media-library" | "citation" | "code-block" | "glossary" | "publish" | "redact" | "review-changes" | "rich-text" | "translation" | "web-page" | "video-off" | "approval-document" | "content-block" | "document-merge" | "document-split" | "file-xml" | "folder-shared" | "image-crop" | "media-playlist" | "page-break" | "seo" | "snippet" | "style-guide" | "alt-text" | "content-approval" | "form-template" | "media-caption" | "version-compare" | "battery" | "bluetooth" | "cloud" | "cpu" | "database" | "desktop" | "laptop" | "phone" | "server" | "chip" | "cloud-download" | "cloud-upload" | "database-backup" | "database-zap" | "device-tablet" | "hard-drive" | "headphones" | "keyboard" | "monitor" | "plug-zap" | "server-cog" | "wifi-off" | "bluetooth-connected" | "cloud-check" | "cloud-x" | "database-check" | "database-lock" | "mouse" | "network" | "monitor-smartphone" | "router" | "router-wifi" | "smartphone" | "tablet" | "usb" | "barcode-scanner" | "battery-charging" | "battery-full" | "battery-low" | "nfc" | "printer-check" | "server-check" | "server-lock" | "signal" | "signal-low" | "smartwatch" | "watch" | "wifi" | "app-window" | "mobile-camera" | "mobile-check" | "mobile-home" | "mobile-nav" | "mobile-rotate" | "mobile-scan" | "mobile-tab" | "mobile-vibrate" | "mobile-x" | "offline-sync" | "pwa-install" | "edge-device" | "kiosk" | "local-storage" | "platform-desktop" | "platform-mobile" | "platform-web" | "push-device" | "push-subscription" | "service-worker" | "biometric" | "camera-capture" | "geolocation" | "mobile-bottom-sheet" | "mobile-drawer" | "mobile-gesture" | "mobile-offline" | "mobile-permission" | "mobile-sheet" | "orientation-lock" | "passkey" | "sensor-alert" | "vibration-off" | "wearable" | "airplay" | "beacon" | "bluetooth-off" | "camera-switch" | "device-hub" | "display-check" | "firmware" | "gpu" | "iot-device" | "mobile-hotspot" | "printer-error" | "qr-scanner" | "audit" | "award" | "brain" | "briefcase" | "building" | "calculator" | "eye" | "eye-off" | "help" | "lock" | "policy" | "shield" | "accessibility" | "check-square" | "fingerprint" | "life-buoy" | "scale-balanced" | "shield-check" | "shield-lock" | "shield-x" | "user-check" | "user-cog" | "user-minus" | "user-plus" | "user-x" | "users-round" | "unlock" | "user" | "users" | "badge-alert" | "badge-check" | "certificate" | "key-round" | "lock-keyhole" | "lock-open" | "permission" | "scan-face" | "shield-alert" | "shield-user" | "user-round" | "user-round-check" | "users-plus" | "agent" | "agent-check" | "agent-x" | "ai-spark" | "audit-log" | "consent" | "model" | "prompt-lock" | "risk-score" | "tool-denied" | "api-key" | "credential" | "org-chart" | "secret" | "service-account" | "session" | "session-expired" | "tenant" | "token" | "workspace-lock" | "access-request" | "approval-policy" | "audit-trail" | "data-residency" | "governance" | "policy-lock" | "data-retention" | "scim" | "sso" | "trust-center" | "user-invite" | "user-provision" | "aria" | "assistive-mode" | "compliance-evidence" | "consent-record" | "incident-response" | "keyboard-access" | "permission-review" | "privacy" | "screen-reader" | "voice-access" | "access-expiry" | "audit-event" | "data-classification" | "device-policy" | "encryption-key" | "identity-provider" | "ip-allowlist" | "legal-hold" | "tls-certificate" | "zero-trust" | "x-circle" | "activity" | "calendar" | "clock" | "download" | "flag" | "inbox" | "layers" | "package" | "qr-code" | "refresh" | "rocket" | "sliders" | "tag" | "tool" | "trash" | "branch" | "bug" | "calendar-check" | "calendar-clock" | "calendar-days" | "calendar-plus" | "calendar-x" | "grab" | "history" | "kanban" | "list-check" | "list-filter" | "loader-circle" | "log-in" | "log-out" | "project" | "puzzle" | "reply-all" | "reply" | "sliders-horizontal" | "sliders-vertical" | "sort-asc" | "sort-desc" | "stamp" | "step" | "timer" | "wrench" | "upload" | "automation" | "backlog" | "dependency" | "git-branch" | "git-commit" | "git-merge" | "git-pull-request" | "milestone" | "route-turn" | "status-dot" | "task-check" | "task-clock" | "task-x" | "webhook" | "column-add" | "column-delete" | "data-join" | "data-split" | "data-transform" | "filter-check" | "filter-x" | "row-add" | "row-delete" | "table-export" | "table-import" | "table-search" | "table-settings" | "workflow-branch" | "approval-pending" | "approval-rejected" | "approval-request" | "escalation" | "handoff" | "queue-next" | "retry" | "rollback" | "runbook" | "sla" | "task-priority" | "ai-run" | "event-stream" | "html-partial" | "hydrate" | "job" | "job-failed" | "job-running" | "mcp-call" | "mcp-result" | "orchestration" | "partial-swap" | "polling" | "rehydrate" | "revalidate" | "sse" | "websocket" | "appointment" | "booking" | "checklist-clock" | "dispatch-board" | "incident-alert" | "maintenance" | "process-loop" | "recurrence" | "repair" | "rota" | "service-window" | "triage-queue" | "work-order" | "workflow" | "batch-job" | "blocked-task" | "calendar-sync" | "change-request" | "decision-node" | "event-trigger" | "form-approval" | "job-queue" | "manual-step" | "process-map" | "release" | "rule-engine" | "task-delegated" | "workflow-template" | "box" | "compass" | "globe" | "heart" | "location" | "flask" | "heart-pulse" | "magnet" | "presentation" | "school" | "sitemap" | "suitcase" | "train" | "wand" | "ambulance" | "bed" | "bus" | "car" | "clinic" | "dna" | "factory" | "flag-triangle" | "globe-lock" | "graduation-cap" | "leaf" | "library" | "map-pin-check" | "map-pin-plus" | "map-pin-x" | "microscope" | "plane" | "pill" | "recycle" | "stethoscope" | "syringe" | "traffic-light" | "wheelchair" | "wind-turbine" | "blood-drop" | "campus" | "cargo-ship" | "classroom" | "container" | "currency-dollar" | "currency-rupee" | "exam" | "first-aid" | "forklift" | "insurance" | "investment" | "lab-report" | "ledger" | "loan" | "medical-chart" | "parcel-location" | "patient" | "tax" | "vaccine" | "building-hospital" | "delivery-bike" | "drone" | "fleet-vehicle" | "geo-fence" | "map-route" | "route-off" | "route-plus" | "satellite" | "traffic-cone" | "agriculture" | "case-management" | "crm" | "energy" | "hospitality" | "legal" | "manufacturing" | "public-sector" | "quality-control" | "real-estate" | "recruiting" | "service-desk" | "support-case" | "ticket-queue" | "tourism" | "asset-maintenance" | "care-team" | "dispatch" | "facilities" | "field-service" | "fleet-route" | "patient-portal" | "repair-order" | "site-visit" | "triage" | "claims" | "construction" | "hotel-room" | "insurance-policy" | "lab" | "meter-reading" | "mining" | "pharmacy" | "radiology" | "restaurant" | "telemedicine" | "utility-pole" | "airport" | "branch-office" | "call-center" | "data-center" | "emergency-room" | "government-office" | "insurance-claim" | "inventory-site" | "logistics-hub" | "power-grid", IconMetadata>;
declare function getIconMetadata(name: IconName | string): IconMetadata | undefined;
declare function iconsByCategory(category: IconCategory | string): IconName[];
declare function searchIcons(query?: string, options?: IconSearchOptions): IconName[];

declare function hasIcon(name: string): boolean;
declare function registerIcon(name: string, body: string | string[], viewBox?: string): void;
declare function icon(name: IconName | string, options?: IconOptions): string;
declare function iconElement(name: IconName | string, options?: IconOptions): SVGSVGElement;

interface MountIconsOptions {
    selector?: string;
}
declare function mountIcons(root?: ParentNode, options?: MountIconsOptions): void;

interface ComponentInstance {
    destroy(): void;
    open?(): void;
    close?(): void;
    toggle?(): void;
    [action: string]: unknown;
}
interface ToastOptions {
    type?: string;
    duration?: number;
    placement?: string;
    dismissible?: boolean;
}
declare function initModal(el: HTMLElement): ComponentInstance;
declare function initDrawer(el: HTMLElement): ComponentInstance;
declare function initDropdown(el: HTMLElement): ComponentInstance;
declare function initTabs(el: HTMLElement): ComponentInstance;
declare function initToast(el: HTMLElement): ComponentInstance;
declare function initAccordion(el: HTMLElement): ComponentInstance;
declare function initButton(el: HTMLElement): ComponentInstance;
declare function initShell(el: HTMLElement): ComponentInstance;
declare function initPassive(el: HTMLElement): ComponentInstance;
declare function initDismissible(el: HTMLElement): ComponentInstance;
declare function initCollapse(el: HTMLElement): ComponentInstance;
declare function initTooltip(el: HTMLElement): ComponentInstance;
declare function initPopover(el: HTMLElement): ComponentInstance;
declare function initProgress(el: HTMLElement): ComponentInstance;
declare function initPagination(el: HTMLElement): ComponentInstance;
declare function initCommandMenu(el: HTMLElement): ComponentInstance;
declare function initFileUpload(el: HTMLElement): ComponentInstance;
declare function initCombobox(el: HTMLElement): ComponentInstance;
declare function initCarousel(el: HTMLElement): ComponentInstance;
declare function initLightbox(el: HTMLElement): ComponentInstance;
declare function initComponent(el: HTMLElement): void;
declare function destroyComponent(el: HTMLElement): void;
declare function initAll(root?: Document | HTMLElement): () => void;
declare function showToast(message: string, options?: ToastOptions): HTMLElement;
declare const button: {
    name: string;
    init: typeof initButton;
    destroy: typeof destroyComponent;
};
declare const modal: {
    name: string;
    init: typeof initModal;
    destroy: typeof destroyComponent;
};
declare const drawer: {
    name: string;
    init: typeof initDrawer;
    destroy: typeof destroyComponent;
};
declare const offcanvas: {
    name: string;
    init: typeof initDrawer;
    destroy: typeof destroyComponent;
};
declare const dropdown: {
    name: string;
    init: typeof initDropdown;
    destroy: typeof destroyComponent;
};
declare const tabs: {
    name: string;
    init: typeof initTabs;
    destroy: typeof destroyComponent;
};
declare const toast: {
    name: string;
    init: typeof initToast;
    destroy: typeof destroyComponent;
};
declare const accordion: {
    name: string;
    init: typeof initAccordion;
    destroy: typeof destroyComponent;
};
declare const alert: {
    name: string;
    init: typeof initDismissible;
    destroy: typeof destroyComponent;
};
declare const badge: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const breadcrumb: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const collapseComponent: {
    name: string;
    init: typeof initCollapse;
    destroy: typeof destroyComponent;
};
declare const tooltip: {
    name: string;
    init: typeof initTooltip;
    destroy: typeof destroyComponent;
};
declare const popover: {
    name: string;
    init: typeof initPopover;
    destroy: typeof destroyComponent;
};
declare const progress: {
    name: string;
    init: typeof initProgress;
    destroy: typeof destroyComponent;
};
declare const spinner: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const skeleton: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const pagination: {
    name: string;
    init: typeof initPagination;
    destroy: typeof destroyComponent;
};
declare const commandMenu: {
    name: string;
    init: typeof initCommandMenu;
    destroy: typeof destroyComponent;
};
declare const navbar: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const sidebar: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const shell: {
    name: string;
    init: typeof initShell;
    destroy: typeof destroyComponent;
};
declare const stepper: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const wizard: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const fileUpload: {
    name: string;
    init: typeof initFileUpload;
    destroy: typeof destroyComponent;
};
declare const combobox: {
    name: string;
    init: typeof initCombobox;
    destroy: typeof destroyComponent;
};
declare const carousel: {
    name: string;
    init: typeof initCarousel;
    destroy: typeof destroyComponent;
};
declare const lightbox: {
    name: string;
    init: typeof initLightbox;
    destroy: typeof destroyComponent;
};
declare const masonry: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const card: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const nav: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const table: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};

type DashboardWidgetType = 'metric' | 'chart' | 'table' | 'list' | 'custom';
type DashboardFilterOperator = 'equals' | 'contains' | 'between' | 'gte' | 'lte';
interface DashboardWidget {
    id: string;
    title: string;
    type: DashboardWidgetType;
    description?: string;
    value?: string | number;
    change?: string;
    data?: Array<Record<string, unknown>> | ChartDatum$1[];
    chart?: ChartOptions$1;
    columns?: string[];
    span?: 1 | 2 | 3 | 4 | 'full';
    html?: string;
}
interface DashboardFilter {
    field: string;
    operator?: DashboardFilterOperator;
    value: unknown;
}
interface DashboardConfig {
    id?: string;
    title: string;
    description?: string;
    density?: 'compact' | 'default' | 'roomy';
    columns?: 1 | 2 | 3 | 4;
    filters?: DashboardFilter[];
    widgets: DashboardWidget[];
}
interface DashboardRenderOptions {
    className?: string;
    emptyText?: string;
}
declare function createDashboardConfig(config: DashboardConfig): DashboardConfig;
declare function applyDashboardFilters<T extends Record<string, unknown>>(rows: T[], filters?: DashboardFilter[]): T[];
declare function summarizeDashboard(rows: Array<Record<string, unknown>>, field: string): {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
};
declare function renderDashboardWidget(widget: DashboardWidget, options?: DashboardRenderOptions): string;
declare function renderDashboard(input: DashboardConfig, options?: DashboardRenderOptions): string;
declare function initDashboard(el: HTMLElement): void;

type DesktopWorkspaceMode = 'none' | 'optional' | 'required';
type DesktopOfflineMode = 'none' | 'cache' | 'queue';
type DesktopAiMode = 'none' | 'assistant' | 'approval';
type DesktopPlatform = 'browser' | 'tauri' | 'electron' | 'unknown';
type DesktopSyncState = 'offline' | 'idle' | 'queued' | 'syncing' | 'synced' | 'failed';
type DesktopCapability = 'files' | 'notifications' | 'secure-store' | 'deep-link' | 'offline' | 'workspace' | 'ai' | 'mcp';
interface DesktopNavigationItem {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    permission?: string;
    active?: boolean;
    badge?: string | number;
}
interface DesktopAppManifest {
    id: string;
    name: string;
    version?: string;
    workspaceMode?: DesktopWorkspaceMode;
    offlineMode?: DesktopOfflineMode;
    aiMode?: DesktopAiMode;
    capabilities?: DesktopCapability[];
    navigation?: DesktopNavigationItem[];
}
interface DesktopValidationResult {
    valid: boolean;
    errors: string[];
}
interface DesktopShellStatus {
    online?: boolean;
    sync?: DesktopSyncState;
    message?: string;
    lastSyncedAt?: string;
    queued?: number;
}
interface DesktopShellOptions extends DesktopAppManifest {
    title?: string;
    subtitle?: string;
    status?: DesktopShellStatus;
    actions?: DesktopNavigationItem[];
    bodyHtml?: string;
}
interface DesktopSettingsStore {
    get<T = unknown>(key: string): T | null | Promise<T | null>;
    set<T = unknown>(key: string, value: T): void | Promise<void>;
    remove(key: string): void | Promise<void>;
    clear(): void | Promise<void>;
}
interface DesktopWorkspaceSession {
    workspaceId: string;
    workspaceName: string;
    userId: string;
    userName: string;
    roles?: string[];
    permissions?: string[];
}
interface DesktopSyncQueueItem {
    status?: DesktopSyncState;
    attempts?: number;
    lastError?: string;
}
interface DesktopSyncStatus {
    state: DesktopSyncState;
    queued: number;
    failed: number;
    syncing: number;
    message: string;
    lastSyncedAt?: string;
}
declare function validateDesktopManifest(manifest: Partial<DesktopAppManifest>): DesktopValidationResult;
declare function createDesktopManifest(input: DesktopAppManifest): DesktopAppManifest;
declare function parseDesktopManifestElement(element: HTMLElement): DesktopAppManifest;
declare function detectDesktopPlatform(): DesktopPlatform;
declare function hasDesktopCapability(capability: DesktopCapability, manifest?: Partial<DesktopAppManifest>): boolean;
declare function createDesktopShell(options: DesktopShellOptions): DesktopShellOptions;
declare function renderDesktopSyncStatus(status: DesktopSyncStatus | DesktopShellStatus): string;
declare function renderDesktopShell(options: DesktopShellOptions): string;
declare function setDesktopStatus(element: HTMLElement, status: DesktopShellStatus): void;
declare function initDesktopShell(element: HTMLElement): () => void;
declare function createMemorySettingsStore(namespace?: string): DesktopSettingsStore;
declare function createLocalSettingsStore(namespace: string): DesktopSettingsStore;
declare function bindDesktopSettings(element: HTMLElement, store: DesktopSettingsStore): void;
declare function createWorkspaceSession(input: DesktopWorkspaceSession): DesktopWorkspaceSession;
declare function canUseDesktopAction(session: DesktopWorkspaceSession | undefined, permission: string): boolean;
declare function applyPermissionNavigation(root: ParentNode, session?: DesktopWorkspaceSession): void;
declare function renderWorkspaceIdentity(session: DesktopWorkspaceSession): string;
declare function summarizeDesktopQueue(queueItems: DesktopSyncQueueItem[]): DesktopSyncStatus;
declare function createDesktopSyncStatus(input?: Partial<DesktopSyncStatus>): DesktopSyncStatus;
declare function bindDesktopOfflineIndicator(element: HTMLElement, options?: {
    offlineText?: string;
    onlineText?: string;
}): () => void;

interface TableOptions {
    filterInput?: HTMLInputElement | null;
    page?: number;
    pageSize?: number;
    src?: string;
    columns?: string[];
    sort?: string;
    direction?: SortDirection;
    exportData?: (rows: HTMLTableRowElement[]) => unknown;
    onPage?: (page: number, table: HTMLTableElement) => void | Promise<void>;
    onBulkAction?: (action: string, rows: HTMLTableRowElement[]) => void;
    onRowAction?: (action: string, row: HTMLTableRowElement) => void;
}
interface RemoteTableResponse {
    rows?: Array<Record<string, unknown>>;
    html?: string;
    columns?: Array<{
        key: string;
        label?: string;
        type?: TableColumnType;
        sortable?: boolean;
        filterable?: boolean;
        priority?: number;
    }>;
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    sort?: string;
    direction?: SortDirection;
    summary?: Record<string, unknown>;
    selectedIds?: string[];
    emptyText?: string;
}
type SortDirection = 'asc' | 'desc';
type TableColumnType = 'text' | 'number' | 'date' | 'currency' | 'status' | 'custom';
type FilterOperator = 'contains' | 'startsWith' | 'equals' | 'not' | 'min' | 'max' | 'between' | 'in' | 'token';
type TableState = 'idle' | 'loading' | 'loaded' | 'error' | 'empty';
declare function sortTable(table: HTMLTableElement, column: number | string, direction?: SortDirection): void;
declare function filterTable(table: HTMLTableElement, query: string, column?: number | string, op?: FilterOperator): void;
declare function selectedRows(table: HTMLTableElement): HTMLTableRowElement[];
declare function setTableState(table: HTMLTableElement, state: TableState): void;
declare function applyResponsiveColumns(table: HTMLTableElement): void;
declare function loadRemoteTable(table: HTMLTableElement, options?: TableOptions): Promise<RemoteTableResponse | null>;
declare function goToPage(table: HTMLTableElement, page: number, options?: TableOptions): Promise<RemoteTableResponse | null>;
declare function exportTable(table: HTMLTableElement, options?: TableOptions): unknown;
declare function filterElements(targetSelector: string, query: string, mode?: 'contains' | 'startsWith' | 'token'): void;
declare function initDeclarativeFilters(root?: Document | HTMLElement): void;
declare function initTable(table: HTMLTableElement, options?: TableOptions): void;
declare const dataTable: {
    name: string;
    init: (el: HTMLElement) => void;
};

type SwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';
interface RadResponse {
    ok?: boolean;
    html?: string;
    target?: string;
    swap?: SwapMode;
    message?: string;
    focus?: string;
    redirect?: string;
    errors?: Record<string, string[]>;
    events?: Array<{
        name: string;
        detail?: unknown;
        target?: string;
    }>;
    actions?: Array<{
        type: string;
        [key: string]: unknown;
    }>;
}
declare function swapContent(targetEl: HTMLElement, html: string, mode?: string): HTMLElement;
declare function rehydrate(targetEl: HTMLElement): void;
declare function loadPartial(sourceEl: HTMLElement): Promise<RadResponse | null>;
declare function bindRadActions(root?: Document | HTMLElement): () => void;

interface RouterOptions {
    target?: string;
    routes?: Record<string, string>;
    activeClass?: string;
    beforeNavigate?: (url: URL) => boolean | void | Promise<boolean | void>;
    afterNavigate?: (url: URL, target: HTMLElement | null) => void;
    restoreFocus?: boolean;
    restoreScroll?: boolean;
}
declare function initRouter(root?: Document | HTMLElement, options?: RouterOptions): void;

declare function registerServiceWorker(path?: string): Promise<ServiceWorkerRegistration | undefined>;
declare function unregisterServiceWorker(): Promise<void>;
declare function setupInstallPrompt(): () => Promise<void>;
declare function onOnline(handler: () => void): () => void;
declare function onOffline(handler: () => void): () => void;
declare function onNetworkChange(handler: (online: boolean) => void): () => void;
declare const cacheStrategies: {
    networkFirst: string;
    cacheFirst: string;
    staleWhileRevalidate: string;
};
declare function createCacheStrategy(name: keyof typeof cacheStrategies): string;
declare function queueOfflineTask(task: () => Promise<void>): void;
declare function flushOfflineQueue(): Promise<void>;
declare function initOfflineQueue(): () => void;
declare function onAppUpdate(handler: (registration: ServiceWorkerRegistration) => void): () => void;
declare function initInstallPrompt(el: HTMLElement): void;

type State = Record<string, unknown>;
type Subscriber = (value: unknown) => void;
type Computed = (state: State) => unknown;
type SyncStatus = 'queued' | 'syncing' | 'synced' | 'failed';
interface StoreOptions {
    immutable?: boolean;
    persist?: 'local' | 'session';
    key?: string;
    computed?: Record<string, Computed>;
}
interface MicroAppStoreOptions extends StoreOptions {
    historyLimit?: number;
}
type ArtifactStoreOptions = MicroAppStoreOptions;
interface LocalStoreOptions {
    namespace?: string;
    driver?: 'localstorage' | 'memory';
}
interface LocalStore {
    namespace: string;
    get<T = unknown>(key: string): Promise<T | undefined>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    list<T = unknown>(): Promise<Array<{
        key: string;
        value: T;
    }>>;
    clear(): Promise<void>;
    exportJSON(space?: number): Promise<string>;
    importJSON(json: string): Promise<void>;
}
interface SyncQueueItem<T = unknown> {
    id: string;
    action: string;
    payload: T;
    status: SyncStatus;
    attempts: number;
    createdAt: string;
    updatedAt: string;
    lastError?: string;
}
interface SyncQueue<T = unknown> {
    enqueue(action: string, payload: T, id?: string): Promise<SyncQueueItem<T>>;
    list(status?: SyncStatus): Promise<SyncQueueItem<T>[]>;
    update(id: string, patch: Partial<Omit<SyncQueueItem<T>, 'id' | 'createdAt'>>): Promise<SyncQueueItem<T>>;
    remove(id: string): Promise<void>;
    clear(status?: SyncStatus): Promise<void>;
    exportJSON(space?: number): Promise<string>;
    importJSON(json: string): Promise<void>;
}
declare function createStore<T extends State>(initialState: T): {
    get(path?: string): unknown;
    replace(next: State): void;
    set(path: string, value: unknown): void;
    update(path: string, updater: (value: unknown) => unknown): void;
    push(path: string, value: unknown): void;
    removeAt(path: string, index: number): void;
    subscribe(pathOrHandler: string | Subscriber, handler?: Subscriber): () => void;
    bind(root?: ParentNode): void;
    destroy(): void;
};
declare function createAdvancedStore<T extends State>(initialState: T, options?: StoreOptions): {
    get(path?: string): unknown;
    replace(next: State): void;
    set(path: string, value: unknown): void;
    update(path: string, updater: (value: unknown) => unknown): void;
    push(path: string, value: unknown): void;
    removeAt(path: string, index: number): void;
    subscribe(pathOrHandler: string | Subscriber, handler?: Subscriber): () => void;
    bind(root?: ParentNode): void;
    destroy(): void;
};
declare function createMicroAppStore<T extends State>(initialState: T, options?: MicroAppStoreOptions): {
    set(path: string, value: unknown): void;
    update(path: string, updater: (value: unknown) => unknown): void;
    push(path: string, value: unknown): void;
    removeAt(path: string, index: number): void;
    reset(): void;
    exportJSON(space?: number): string;
    importJSON(json: string): void;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): boolean;
    redo(): boolean;
    get(path?: string): unknown;
    replace(next: State): void;
    subscribe(pathOrHandler: string | Subscriber, handler?: Subscriber): () => void;
    bind(root?: ParentNode): void;
    destroy(): void;
};
declare function createArtifactStore<T extends State>(initialState: T, options?: ArtifactStoreOptions): {
    set(path: string, value: unknown): void;
    update(path: string, updater: (value: unknown) => unknown): void;
    push(path: string, value: unknown): void;
    removeAt(path: string, index: number): void;
    reset(): void;
    exportJSON(space?: number): string;
    importJSON(json: string): void;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): boolean;
    redo(): boolean;
    get(path?: string): unknown;
    replace(next: State): void;
    subscribe(pathOrHandler: string | Subscriber, handler?: Subscriber): () => void;
    bind(root?: ParentNode): void;
    destroy(): void;
};
declare function createLocalStore(options?: LocalStoreOptions): LocalStore;
declare function createSyncQueue<T = unknown>(store: LocalStore, key?: string): SyncQueue<T>;

interface FlintChartEncoding {
    field?: string;
    type?: string;
    aggregate?: string;
    title?: string;
    [key: string]: unknown;
}
interface FlintChartSpec {
    chartType?: string;
    encodings?: Record<string, FlintChartEncoding | string | undefined>;
    baseSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
    canvasSize?: Partial<Pick<ChartOptions, 'width' | 'height'>>;
    title?: string;
    description?: string;
    [key: string]: unknown;
}
interface FlintChartInput {
    data?: Array<Record<string, unknown>> | {
        values?: Array<Record<string, unknown>>;
        rows?: Array<Record<string, unknown>>;
    };
    semantic_types?: Record<string, string>;
    chart_spec?: FlintChartSpec;
    [key: string]: unknown;
}
interface FlintChartAdapterResult {
    data: ChartDatum[];
    options: ChartOptions;
    warnings: string[];
}
declare function adaptFlintChart(input: FlintChartInput, overrides?: ChartOptions): FlintChartAdapterResult;

type ChartType = 'line' | 'area' | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'grouped-bar' | 'pie' | 'donut' | 'doughnut' | 'radar' | 'sparkline' | 'metric' | 'progress' | 'ring' | 'gauge' | 'timeline' | 'heatmap' | 'status-heatmap' | 'bullet' | 'histogram' | 'box-plot' | 'scatter' | 'regression' | 'control-chart' | 'distribution' | 'pareto' | 'funnel' | 'waterfall' | 'bubble' | 'treemap' | 'calendar-heatmap' | 'candlestick' | 'ohlc' | 'rose' | 'polar-area';
interface ChartDatum {
    label?: string;
    value?: number;
    values?: Record<string, number>;
    target?: number;
    min?: number;
    max?: number;
    group?: string;
    color?: string;
    size?: number;
    [key: string]: unknown;
}
interface ChartMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
interface ChartOptions {
    type?: ChartType;
    width?: number;
    height?: number;
    margin?: Partial<ChartMargin>;
    x?: string;
    y?: string;
    series?: string[];
    label?: string;
    description?: string;
    legend?: boolean | 'top' | 'right' | 'bottom';
    labels?: boolean;
    axes?: boolean;
    grid?: boolean;
    tooltip?: boolean;
    table?: boolean | 'sr-only';
    focusable?: boolean;
    palette?: string[] | ChartPaletteName;
    formatValue?: (value: number) => string;
    invalidValue?: 'zero' | 'skip' | 'error';
    min?: number;
    max?: number;
    stacked?: boolean;
    responsive?: boolean;
    exportable?: boolean;
    drilldown?: boolean | DrilldownOptions;
    sparklineType?: 'line' | 'bar';
    id?: string;
    aspectRatio?: number;
    bins?: number;
    regression?: boolean;
    thresholds?: Array<{
        value: number;
        label?: string;
        color?: string;
    }>;
    ranges?: Array<{
        min?: number;
        max: number;
        label?: string;
        color?: string;
    }>;
    target?: number;
}
type ChartPaletteName = 'default' | 'professional' | 'categorical' | 'status' | 'sequential' | 'diverging';
interface DrilldownOptions {
    action?: 'event' | 'target' | 'url' | 'route';
    target?: string;
    url?: string;
    param?: string;
}
interface ChartController {
    refresh(): Promise<void>;
    destroy(): void;
}
interface ChartSelectionDetail {
    label: string;
    value?: number;
    index?: number;
    series?: string;
    type: ChartType;
    datum?: ChartDatum;
    params: Record<string, string>;
}
interface ChartExportOptions {
    filename?: string;
    background?: string;
    scale?: number;
    width?: number;
    height?: number;
}
interface TableAdapterOptions {
    labelColumn?: number | string;
    valueColumn?: number | string;
    seriesColumns?: Array<number | string>;
}
interface RecordAdapterOptions {
    label?: string;
    value?: string;
    x?: string;
    y?: string;
    series?: string[];
}
interface SummaryStats {
    count: number;
    min: number;
    max: number;
    sum: number;
    mean: number;
    median: number;
    variance: number;
    stddev: number;
    q1: number;
    q3: number;
    iqr: number;
}
interface HistogramOptions {
    bins?: number;
    min?: number;
    max?: number;
}
interface HistogramBin {
    x0: number;
    x1: number;
    count: number;
}
interface RegressionPoint {
    x: number;
    y: number;
}
interface RegressionResult {
    slope: number;
    intercept: number;
    r: number;
    r2: number;
    predict: (x: number) => number;
}
declare function quantile(values: number[], q: number): number;
declare function summaryStats(values: number[]): SummaryStats;
declare function movingAverage(values: number[], windowSize: number): number[];
declare function cumulativeSum(values: number[]): number[];
declare function percentChange(values: number[]): number[];
declare function zScores(values: number[]): number[];
declare function histogramBins(values: number[], options?: HistogramOptions): HistogramBin[];
declare function correlation(pointsOrX: RegressionPoint[] | number[], yValues?: number[]): number;
declare function linearRegression(points: RegressionPoint[]): RegressionResult;
declare function renderFlintChart(input: FlintChartInput, overrides?: ChartOptions): string;
declare function renderChart(data: Array<ChartDatum | number>, options?: ChartOptions): string;
declare function parseChartData(el: HTMLElement): ChartDatum[];
declare function adaptTable(table: HTMLTableElement, options?: TableAdapterOptions): ChartDatum[];
declare function adaptRecords(records: Array<Record<string, unknown>>, mapping?: RecordAdapterOptions): ChartDatum[];
declare function initChart(el: HTMLElement): ChartController;
declare function refreshChart(el: HTMLElement): Promise<void>;
declare function destroyChart(el: HTMLElement): void;
declare function exportChartSvg(target: SVGSVGElement | HTMLElement): string;
declare function downloadChartSvg(target: SVGSVGElement | HTMLElement, filename?: string): void;
declare function exportChartPng(target: SVGSVGElement | HTMLElement, options?: ChartExportOptions): Promise<Blob>;
declare function downloadChartPng(target: SVGSVGElement | HTMLElement, filename?: string, options?: ChartExportOptions): Promise<void>;
declare function bindChartExports(root?: Document | HTMLElement): () => void;
declare function exportChartData(data: ChartDatum[], format?: 'json' | 'csv' | 'tsv'): string;
declare const chart: {
    name: string;
    init: (el: HTMLElement) => void;
    destroy: typeof destroyChart;
};

type RealtimeMode = 'sse' | 'websocket' | 'poll';
type RealtimeState = 'idle' | 'connecting' | 'connected' | 'open' | 'reconnecting' | 'disconnected' | 'closed' | 'stale' | 'degraded' | 'error' | 'failed';
type RealtimeHandler = (payload: unknown) => void;
interface RealtimeOptions {
    channel: string;
    src?: string;
    mode?: RealtimeMode;
    interval?: number;
    reconnect?: boolean;
    backoff?: number;
    maxBackoff?: number;
    heartbeat?: number;
}
interface RealtimeBindingOptions extends Omit<RealtimeOptions, 'mode'> {
    transport?: RealtimeMode | 'polling';
    fallback?: 'polling' | 'none';
    onMessage?: RealtimeHandler;
    onState?: (state: RealtimeState) => void;
}
interface PresenceUser {
    id: string;
    name?: string;
    color?: string;
    cursor?: {
        x: number;
        y: number;
    };
    lastSeen: string;
    metadata?: Record<string, unknown>;
}
declare function getConnectionState(channel: string): RealtimeState;
declare function subscribe(channel: string, handler: RealtimeHandler): () => void;
declare function publishLocal(channel: string, payload: unknown): void;
declare function publishBatched(channel: string, payload: unknown): void;
declare function connect(options: RealtimeOptions): void;
declare function bindRealtime(options: RealtimeBindingOptions): () => void;
declare function updatePresence(channel: string, user: Omit<PresenceUser, 'lastSeen'> & {
    lastSeen?: string;
}): PresenceUser;
declare function removePresence(channel: string, userId: string): void;
declare function getPresence(channel: string): PresenceUser[];
declare function disconnect(channel: string): void;
declare function initRealtime(el: HTMLElement): void;
declare const realtime: {
    name: string;
    init: typeof initRealtime;
};

interface NotificationItem {
    id: string;
    message: string;
    read?: boolean;
    type?: string;
    data?: unknown;
}
declare function addNotification(item: Omit<NotificationItem, 'id'> & {
    id?: string;
}): NotificationItem;
declare function getNotifications(): NotificationItem[];
declare function unreadCount(): number;
declare function markNotificationsRead(): void;
declare function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'>;
declare function registerPushServiceWorker(path?: string): Promise<ServiceWorkerRegistration | undefined>;
declare function subscribeToPush(options: PushSubscriptionOptionsInit): Promise<PushSubscription | undefined>;
declare function getPushSubscription(): Promise<PushSubscription | null>;
declare function unsubscribeFromPush(): Promise<boolean>;
declare function showInAppNotification(message: string, options?: {
    type?: string;
}): HTMLElement;
declare function initPush(el: HTMLElement): void;
declare const push: {
    name: string;
    init: typeof initPush;
};

declare function initMobileShell(el: HTMLElement): void;
declare function showOfflineBanner(message?: string): HTMLElement;
declare function initSegmentedControl(el: HTMLElement): void;
declare function initSheetModal(el: HTMLElement): void;
declare function initSwipeAction(el: HTMLElement): void;
declare function initPullToRefresh(el: HTMLElement): void;
declare const mobileShell: {
    name: string;
    init: typeof initMobileShell;
};

declare function renderAIAction(el: HTMLElement): void;
declare function renderPromptPanel(el: HTMLElement, history?: string[]): void;
declare function renderAssistantResponse(el: HTMLElement, content: string): void;
declare function appendStreamingChunk(el: HTMLElement, chunk: string): void;
declare function createStreamSurface(el: HTMLElement): {
    append(chunk: string): void;
    cancel(): void;
};
declare function renderAIResultCard(el: HTMLElement, content: string): void;
declare const aiAction: {
    name: string;
    init: typeof renderAIAction;
};

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

interface BatoiUIFApp {
    root: Document | HTMLElement;
    destroyed: boolean;
    refresh(root?: Document | HTMLElement): void;
    destroy(): void;
    restart(): BatoiUIFApp;
}
declare function start(root?: Document | HTMLElement): BatoiUIFApp;
declare function autoStart(root?: Document | HTMLElement): void;

export { type ActionContext, type ActionDiagnostic, type ActionHandler, type AnimationPreset, type AnimationStep, type ArtifactStoreOptions, type BatoiUIFApp, type ChartController, type ChartDatum, type ChartExportOptions, type ChartMargin, type ChartOptions, type ChartPaletteName, type ChartSelectionDetail, type ChartType, type ComponentInstance, type ConnectorMode, type ConnectorType, type DashboardConfig, type DashboardFilter, type DashboardFilterOperator, type DashboardRenderOptions, type DashboardWidget, type DashboardWidgetType, type DataConnector, type DesktopAiMode, type DesktopAppManifest, type DesktopCapability, type DesktopNavigationItem, type DesktopOfflineMode, type DesktopPlatform, type DesktopSettingsStore, type DesktopShellOptions, type DesktopShellStatus, type DesktopSyncQueueItem, type DesktopSyncState, type DesktopSyncStatus, type DesktopValidationResult, type DesktopWorkspaceMode, type DesktopWorkspaceSession, type DrilldownOptions, type EditorCommand, type EditorCommandContext, type EditorCommandHandler, type EditorHookContext, type EditorHookHandler, type EditorHookName, type EditorImageValue, type EditorInstance, type EditorLayout, type EditorLinkValue, type EditorMode, type EditorOptions, type EditorPreviewMode, type EditorTableValue, type EffectOptions, type ExtensionManifestOptions, type ExtensionMessage, type ExtensionSurface, type FlintChartAdapterResult, type FlintChartEncoding, type FlintChartInput, type FlintChartSpec, type FormErrors, type HTMLSwapMode, type HistogramBin, type HistogramOptions, type IconCategory, type IconDefinition, type IconMetadata, type IconName, type IconOptions, type IconRegistry, type IconSearchOptions, type IconStatus, type LocalStore, type LocalStoreOptions, type MicroAppConnectorManifest, type MicroAppConnectorMode, type MicroAppConnectorType, type MicroAppConnectorWorkflow, type MicroAppLocalStore, type MicroAppManifest, type MicroAppManifestIssue, type MicroAppManifestResult, type MicroAppPermissionsManifest, type MicroAppRealtimeManifest, type MicroAppRealtimeTransport, type MicroAppStorageManifest, type MicroAppStorageMode, type MicroAppStoreOptions, type MountIconsOptions, type NotificationItem, type OverlayOptions, type ParsedAction, type PresenceUser, type QueryHandler, type QueryInput, type RadResponse, type RealtimeBindingOptions, type RealtimeHandler, type RealtimeMode, type RealtimeOptions, type RealtimeState, type RecordAdapterOptions, type RegressionPoint, type RegressionResult, type RemoteTableResponse, type RequestOptions, type RouterOptions, type SafeHTMLRenderOptions, type StoreOptions, type SummaryStats, type SwapMode, type SyncQueue, type SyncQueueItem, type TableAdapterOptions, type TableOptions, type ToolPolicyCheck, type ToolReviewRequest, type TrustedHTMLRenderOptions, type UIFAction, type UIFApp, type UIFAttribute, type UIFComponent, type UIFDomComponent, type UIFLifecycleEvent, type UIFOptions, type UIFPlugin, UIFQuery, type UIFRequestError, type UIFState, type UIFValue, accordion, adaptFlintChart, adaptRecords, adaptTable, addNotification, adminSecurityIcons, aiAction, alert, animate, animateGroup, animationPresets, appendStreamingChunk, appendTextElement, applyDashboardFilters, applyPermissionNavigation, applyResponsiveColumns, autoInit, autoStart, badge, bindActions, bindChartExports, bindConnector, bindDesktopOfflineIndicator, bindDesktopSettings, bindRadActions, bindRealtime, brandIcons, breadcrumb, button, cacheStrategies, canUseDesktopAction, cancelAnimation, cancelRequest, card, carousel, chart, chartIcons, cleanEditorHtml, clearActionDiagnostics, clearErrors, closeOverlay, closest, collapse, collapseComponent, combobox, commandMenu, commerceIcons, communicationIcons, connect, contentIcons, coreUiIcons, correlation, createAdvancedStore, createArtifactStore, createCacheStrategy, createDashboardConfig, createDesktopManifest, createDesktopShell, createDesktopSyncStatus, createEditor, createExtensionManifest, createExtensionMessage, createLocalSettingsStore, createLocalStore, createMemorySettingsStore, createMicroAppStore, createStore, createStreamSurface, createSyncQueue, createWorkspaceSession, csvToObjects, cumulativeSum, dataTable, delegate, destroyChart, destroyComponent, detectDesktopPlatform, deviceIcons, disconnect, dispatchAction, dispatchActions, domainIcons, downloadChartPng, downloadChartSvg, drawer, dropdown, emit, escapeHtml, expand, exportChartData, exportChartPng, exportChartSvg, exportTable, fileUpload, filterElements, filterTable, flushOfflineQueue, form, formatEditor, fragment, get, getActionDiagnostics, getConnectionState, getEditorValue, getIconMetadata, getNotifications, getOverlayStack, getPresence, getPushSubscription, goToPage, hasDesktopCapability, hasIcon, hide, histogramBins, htmlToMarkdown, icon, iconElement, iconMetadata, iconSets, icons, iconsByCategory, init, initAll, initAnimation, initAnimationTriggers, initChart, initComponent, initDashboard, initDeclarativeFilters, initDesktopShell, initEditor, initForm, initInstallPrompt, initMobileShell, initOfflineQueue, initPullToRefresh, initPush, initRealtime, initRepeatableGroup, initRouter, initSegmentedControl, initSheetModal, initSwipeAction, initTable, isExtensionRuntime, isInitialized, lightbox, linearRegression, listMicroAppConnectorWorkflows, loadConnector, loadPartial, loadRemoteTable, markNotificationsRead, markdownToHtml, masonry, mobileShell, modal, mount, mountIcons, movingAverage, nav, navbar, observe, observeMotion, offcanvas, on, onAppUpdate, onNetworkChange, onOffline, onOnline, openOverlay, pagination, parseActionSpec, parseCSV, parseChartData, parseDesktopManifestElement, parseMicroAppManifest, parseOptions, percentChange, popover, positionOverlay, post, progress, publishBatched, publishLocal, push, qs, qsa, quantile, queryEditorCommand, queueOfflineTask, ready, realtime, refreshChart, registerAction, registerAsyncRule, registerComponent, registerEditorCommand, registerEditorHook, registerFieldAdapter, registerIcon, registerPlugin, registerPushServiceWorker, registerServiceWorker, registerValidationMessage, rehydrate, removePresence, renderAIAction, renderAIResultCard, renderApprovalPolicy, renderAssistantResponse, renderChart, renderDashboard, renderDashboardWidget, renderDesktopShell, renderDesktopSyncStatus, renderDiff, renderFlintChart, renderPromptPanel, renderToolApproval, renderToolAuditTrail, renderToolProgress, renderToolResult, renderToolReviewFlow, renderToolTimeline, renderWorkspaceIdentity, request, requestNotificationPermission, resolveActionTarget, resolveTarget, runEditorCommand, sanitizeHTML, searchIcons, selectedRows, sequence, serialize, setAccent, setDensity, setDesktopStatus, setEditorPreviewLayout, setEditorValue, setSafeHTML, setTableState, setText, setTrustedHTML, setupInstallPrompt, shell, show, showErrorSummary, showErrors, showInAppNotification, showOfflineBanner, showToast, sidebar, skeleton, sortTable, spinner, stagger, start, stepper, submitForm, subscribe, subscribeToPush, summarizeDashboard, summarizeDesktopQueue, summaryStats, swapContent, swapTrustedHTML, table, tabs, timeline, toast, toggle, toggleOverlay, toolApproval, tooltip, transition, trigger, uif, uifActions, uifAttributes, uifStates, uifValues, unmount, unreadCount, unregisterAction, unregisterEditorCommand, unregisterServiceWorker, unsubscribeFromPush, updatePresence, upload, useRequestInterceptor, useResponseInterceptor, validateDesktopManifest, validateEditor, validateField, validateForm, validateFormAsync, validateMicroAppConnectorWorkflows, validateMicroAppManifest, wizard, workflowIcons, zScores };
