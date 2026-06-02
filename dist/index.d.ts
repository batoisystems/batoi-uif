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
declare function validateMicroAppManifest(input: unknown): MicroAppManifestResult;
declare function parseMicroAppManifest(input: unknown): MicroAppManifest;

type UIFOptions = Record<string, unknown>;

interface UIFApp {
    root: Document | HTMLElement;
    options: UIFOptions;
    destroy(): void;
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
declare function registerComponent(name: string, component: Omit<UIFDomComponent, 'name'>): void;
declare function registerComponent(component: UIFDomComponent): void;
declare function qs<T extends Element = Element>(selector: string, root?: ParentNode): T | null;
declare function qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[];
declare function closest<T extends Element = Element>(el: Element, selector: string): T | null;
declare function resolveTarget(sourceEl: HTMLElement, targetExpression?: string): HTMLElement | null;
declare function setText(target: Element | null, value: unknown): void;
declare function appendTextElement<K extends keyof HTMLElementTagNameMap>(parent: Element, tagName: K, text: unknown, className?: string): HTMLElementTagNameMap[K];
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
    restoreFocus?: boolean;
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
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
type AsyncRuleHandler = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, form: HTMLFormElement) => Promise<string[]>;
declare function registerAsyncRule(name: string, handler: AsyncRuleHandler): void;
declare function validateField(fieldEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string[];
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
    readonly activity: {
        readonly body: "<path d=\"M22 12h-4l-3 8L9 4l-3 8H2\"></path>";
    };
    readonly alert: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly approval: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path><path d=\"m9 12 2 2 4-4\"></path>";
    };
    readonly archive: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"4\" rx=\"1\"></rect><path d=\"M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8\"></path><path d=\"M10 12h4\"></path>";
    };
    readonly 'area-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-5 3 3 5-7v12H7z\"></path>";
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
    readonly 'at-sign': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 1 0 3-3\"></path><path d=\"M19.1 17A9 9 0 1 1 21 12\"></path>";
    };
    readonly audit: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
    };
    readonly award: {
        readonly body: "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"m8.5 12.5-2 8 5.5-3 5.5 3-2-8\"></path>";
    };
    readonly bank: {
        readonly body: "<path d=\"m3 10 9-6 9 6\"></path><path d=\"M4 10h16\"></path><path d=\"M6 10v8\"></path><path d=\"M10 10v8\"></path><path d=\"M14 10v8\"></path><path d=\"M18 10v8\"></path><path d=\"M4 18h16\"></path>";
    };
    readonly 'bar-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 16V9\"></path><path d=\"M12 16V5\"></path><path d=\"M17 16v-4\"></path>";
    };
    readonly batoi: {
        readonly body: "<path fill=\"currentColor\" stroke=\"none\" d=\"M10.1 12.2c-.1-2.1.5-4.8 1.7-8C6 4 1.5 8.2 1.5 14.1 1.5 19.6 6 24 11.5 24s10-4.4 10-9.9c0-2.5-.9-4.8-2.5-6.6-3.2.6-6.2 2.2-8.9 4.7z\"></path><path fill=\"currentColor\" stroke=\"none\" d=\"M11.4 9.2C12.2 5.6 14.1 2.7 17.4 0l5.3 4.4c-4.7.5-8.3 2.2-11.3 4.8z\"></path>";
    };
    readonly battery: {
        readonly body: "<rect x=\"3\" y=\"7\" width=\"16\" height=\"10\" rx=\"2\"></rect><path d=\"M21 11v2\"></path><path d=\"M7 11v2\"></path><path d=\"M10 11v2\"></path><path d=\"M13 11v2\"></path>";
    };
    readonly bell: {
        readonly body: "<path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7\"></path><path d=\"M13.7 21a2 2 0 0 1-3.4 0\"></path>";
    };
    readonly bluetooth: {
        readonly body: "<path d=\"m7 7 10 10-5 4V3l5 4L7 17\"></path>";
    };
    readonly bot: {
        readonly body: "<rect x=\"5\" y=\"8\" width=\"14\" height=\"10\" rx=\"3\"></rect><path d=\"M12 8V4\"></path><path d=\"M8 13h.01\"></path><path d=\"M16 13h.01\"></path><path d=\"M9 18v2\"></path><path d=\"M15 18v2\"></path>";
    };
    readonly box: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M12 13v8\"></path>";
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
    readonly calendar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M16 2v4\"></path><path d=\"M8 2v4\"></path><path d=\"M3 10h18\"></path>";
    };
    readonly camera: {
        readonly body: "<path d=\"M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle>";
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
    readonly chart: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 14 3-3 3 2 5-6\"></path>";
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
    readonly clock: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path>";
    };
    readonly close: {
        readonly body: "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>";
    };
    readonly cloud: {
        readonly body: "<path d=\"M17.5 19H8a5 5 0 1 1 1.3-9.8A6 6 0 0 1 21 11.5 3.8 3.8 0 0 1 17.5 19z\"></path>";
    };
    readonly code: {
        readonly body: "<path d=\"m16 18 6-6-6-6\"></path><path d=\"m8 6-6 6 6 6\"></path>";
    };
    readonly command: {
        readonly body: "<path d=\"M9 9H5.5a2.5 2.5 0 1 1 2.5-2.5V18a2.5 2.5 0 1 1-2.5-2.5H18a2.5 2.5 0 1 1-2.5 2.5V6.5A2.5 2.5 0 1 1 18 9H9z\"></path>";
    };
    readonly compass: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m15.5 8.5-2 5-5 2 2-5 5-2z\"></path>";
    };
    readonly copy: {
        readonly body: "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\"></rect><rect x=\"2\" y=\"2\" width=\"13\" height=\"13\" rx=\"2\"></rect>";
    };
    readonly cpu: {
        readonly body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"></rect><path d=\"M9 1v3\"></path><path d=\"M15 1v3\"></path><path d=\"M9 20v3\"></path><path d=\"M15 20v3\"></path><path d=\"M1 9h3\"></path><path d=\"M1 15h3\"></path><path d=\"M20 9h3\"></path><path d=\"M20 15h3\"></path>";
    };
    readonly 'credit-card': {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"M3 10h18\"></path><path d=\"M7 15h4\"></path>";
    };
    readonly dashboard: {
        readonly body: "<path d=\"M4 13a8 8 0 1 1 16 0\"></path><path d=\"M12 13l4-4\"></path><path d=\"M5 19h14\"></path>";
    };
    readonly database: {
        readonly body: "<ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"></ellipse><path d=\"M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5\"></path><path d=\"M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6\"></path>";
    };
    readonly desktop: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"12\" rx=\"2\"></rect><path d=\"M8 20h8\"></path><path d=\"M12 16v4\"></path>";
    };
    readonly document: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h6\"></path>";
    };
    readonly 'donut-chart': {
        readonly body: "<path d=\"M12 3a9 9 0 1 1-8.5 6\"></path><path d=\"M12 3v6\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly drag: {
        readonly body: "<path d=\"M9 5h.01\"></path><path d=\"M15 5h.01\"></path><path d=\"M9 12h.01\"></path><path d=\"M15 12h.01\"></path><path d=\"M9 19h.01\"></path><path d=\"M15 19h.01\"></path>";
    };
    readonly download: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"M7 10l5 5 5-5\"></path><path d=\"M12 15V3\"></path>";
    };
    readonly edit: {
        readonly body: "<path d=\"M12 20h9\"></path><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z\"></path>";
    };
    readonly error: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly 'external-link': {
        readonly body: "<path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path>";
    };
    readonly eye: {
        readonly body: "<path d=\"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>";
    };
    readonly 'eye-off': {
        readonly body: "<path d=\"M2 2l20 20\"></path><path d=\"M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16.7 16.7 0 0 1-3.1 4.1\"></path><path d=\"M14.1 14.1A3 3 0 0 1 9.9 9.9\"></path><path d=\"M6.6 6.6A16.2 16.2 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1\"></path>";
    };
    readonly file: {
        readonly body: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><path d=\"M14 2v6h6\"></path>";
    };
    readonly filter: {
        readonly body: "<path d=\"M22 3H2l8 9v7l4 2v-9l8-9z\"></path>";
    };
    readonly flag: {
        readonly body: "<path d=\"M5 22V4\"></path><path d=\"M5 4h12l-2 4 2 4H5\"></path>";
    };
    readonly folder: {
        readonly body: "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"></path>";
    };
    readonly 'gauge-chart': {
        readonly body: "<path d=\"M4 15a8 8 0 1 1 16 0\"></path><path d=\"M12 15l5-5\"></path><path d=\"M7 19h10\"></path>";
    };
    readonly globe: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M3 12h18\"></path><path d=\"M12 3a14 14 0 0 1 0 18\"></path><path d=\"M12 3a14 14 0 0 0 0 18\"></path>";
    };
    readonly grid: {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect>";
    };
    readonly hash: {
        readonly body: "<path d=\"M5 9h14\"></path><path d=\"M4 15h14\"></path><path d=\"M10 3 8 21\"></path><path d=\"M16 3l-2 18\"></path>";
    };
    readonly heart: {
        readonly body: "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z\"></path>";
    };
    readonly help: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2.2-2.5 2.4-2.5 4.2\"></path><path d=\"M12 18h.01\"></path>";
    };
    readonly histogram: {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"M7 17v-5\"></path><path d=\"M11 17V7\"></path><path d=\"M15 17v-8\"></path><path d=\"M19 17v-3\"></path>";
    };
    readonly home: {
        readonly body: "<path d=\"m3 11 9-8 9 8\"></path><path d=\"M5 10v10h14V10\"></path><path d=\"M9 20v-6h6v6\"></path>";
    };
    readonly image: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><circle cx=\"8\" cy=\"10\" r=\"2\"></circle><path d=\"m21 15-4-4-5 5-2-2-4 5\"></path>";
    };
    readonly inbox: {
        readonly body: "<path d=\"M4 4h16l-2 10h-4a2 2 0 0 1-4 0H6L4 4z\"></path><path d=\"M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5\"></path>";
    };
    readonly info: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 10v6\"></path><path d=\"M12 7h.01\"></path>";
    };
    readonly key: {
        readonly body: "<circle cx=\"7.5\" cy=\"12.5\" r=\"3.5\"></circle><path d=\"M11 12.5h10\"></path><path d=\"M17 12.5v3\"></path><path d=\"M20 12.5v3\"></path>";
    };
    readonly laptop: {
        readonly body: "<rect x=\"5\" y=\"4\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M3 20h18l-2-4H5l-2 4z\"></path>";
    };
    readonly layers: {
        readonly body: "<path d=\"m12 2 9 5-9 5-9-5 9-5z\"></path><path d=\"m3 12 9 5 9-5\"></path><path d=\"m3 17 9 5 9-5\"></path>";
    };
    readonly link: {
        readonly body: "<path d=\"M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2\"></path><path d=\"M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2\"></path>";
    };
    readonly 'line-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><path d=\"m7 15 4-4 3 3 5-7\"></path>";
    };
    readonly list: {
        readonly body: "<path d=\"M8 6h13\"></path><path d=\"M8 12h13\"></path><path d=\"M8 18h13\"></path><path d=\"M3 6h.01\"></path><path d=\"M3 12h.01\"></path><path d=\"M3 18h.01\"></path>";
    };
    readonly location: {
        readonly body: "<path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle>";
    };
    readonly lock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"></path>";
    };
    readonly mail: {
        readonly body: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"></rect><path d=\"m3 7 9 6 9-6\"></path>";
    };
    readonly map: {
        readonly body: "<path d=\"M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z\"></path><path d=\"M9 3v15\"></path><path d=\"M15 6v15\"></path>";
    };
    readonly maximize: {
        readonly body: "<path d=\"M8 3H3v5\"></path><path d=\"M16 3h5v5\"></path><path d=\"M21 16v5h-5\"></path><path d=\"M8 21H3v-5\"></path>";
    };
    readonly message: {
        readonly body: "<path d=\"M21 12a8 8 0 0 1-8 8H6l-4 2 2-5a8 8 0 1 1 17-5z\"></path>";
    };
    readonly mic: {
        readonly body: "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"></rect><path d=\"M5 11a7 7 0 0 0 14 0\"></path><path d=\"M12 18v4\"></path><path d=\"M8 22h8\"></path>";
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
    readonly offline: {
        readonly body: "<path d=\"M2 2 22 22\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M5 13a10 10 0 0 1 4-2.4\"></path><path d=\"M19 13a10 10 0 0 0-9.5-3\"></path>";
    };
    readonly package: {
        readonly body: "<path d=\"m21 8-9-5-9 5 9 5 9-5z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path><path d=\"M7.5 5.5 16.5 10.5\"></path>";
    };
    readonly paperclip: {
        readonly body: "<path d=\"m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 1 1 5.7 5.7l-8.5 8.5a2 2 0 1 1-2.8-2.8l8-8\"></path>";
    };
    readonly pause: {
        readonly body: "<path d=\"M8 5v14\"></path><path d=\"M16 5v14\"></path>";
    };
    readonly phone: {
        readonly body: "<rect x=\"7\" y=\"2\" width=\"10\" height=\"20\" rx=\"2\"></rect><path d=\"M11 18h2\"></path>";
    };
    readonly 'pie-chart': {
        readonly body: "<path d=\"M21 12A9 9 0 1 1 12 3v9h9z\"></path><path d=\"M12 3a9 9 0 0 1 9 9h-9V3z\"></path>";
    };
    readonly play: {
        readonly body: "<path d=\"m8 5 11 7-11 7V5z\"></path>";
    };
    readonly plus: {
        readonly body: "<path d=\"M12 5v14\"></path><path d=\"M5 12h14\"></path>";
    };
    readonly policy: {
        readonly body: "<path d=\"M7 3h10l3 4v14H4V3h3z\"></path><path d=\"M8 13h8\"></path><path d=\"M8 17h5\"></path><path d=\"M14 3v5h5\"></path>";
    };
    readonly printer: {
        readonly body: "<path d=\"M7 9V3h10v6\"></path><path d=\"M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 14h10v7H7z\"></path>";
    };
    readonly 'qr-code': {
        readonly body: "<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"15\" y=\"3\" width=\"6\" height=\"6\"></rect><rect x=\"3\" y=\"15\" width=\"6\" height=\"6\"></rect><path d=\"M15 15h2v2h-2z\"></path><path d=\"M19 15h2v6h-6v-2\"></path><path d=\"M12 3v3\"></path><path d=\"M12 12h3\"></path>";
    };
    readonly 'radar-chart': {
        readonly body: "<path d=\"m12 3 8 5v8l-8 5-8-5V8l8-5z\"></path><path d=\"m12 7 4 3v4l-4 3-4-3v-4l4-3z\"></path><path d=\"M12 3v18\"></path><path d=\"M4 8l16 8\"></path><path d=\"M20 8 4 16\"></path>";
    };
    readonly receipt: {
        readonly body: "<path d=\"M6 2h12v20l-3-2-3 2-3-2-3 2V2z\"></path><path d=\"M9 7h6\"></path><path d=\"M9 11h6\"></path><path d=\"M9 15h4\"></path>";
    };
    readonly redo: {
        readonly body: "<path d=\"M21 7v6h-6\"></path><path d=\"M21 13a8 8 0 1 0-2.3 5.7\"></path>";
    };
    readonly refresh: {
        readonly body: "<path d=\"M21 12a9 9 0 0 1-15.4 6.4L3 16\"></path><path d=\"M3 21v-5h5\"></path><path d=\"M3 12A9 9 0 0 1 18.4 5.6L21 8\"></path><path d=\"M21 3v5h-5\"></path>";
    };
    readonly rocket: {
        readonly body: "<path d=\"M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5\"></path><path d=\"M9 15 4 20\"></path><path d=\"M15 9l-6 6\"></path><path d=\"M14 4h6v6c0 5-4 10-11 10H4v-5C4 8 9 4 14 4z\"></path>";
    };
    readonly save: {
        readonly body: "<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><path d=\"M17 21v-8H7v8\"></path><path d=\"M7 3v5h8\"></path>";
    };
    readonly 'scatter-chart': {
        readonly body: "<path d=\"M3 3v18h18\"></path><circle cx=\"8\" cy=\"15\" r=\"1.5\"></circle><circle cx=\"12\" cy=\"10\" r=\"1.5\"></circle><circle cx=\"17\" cy=\"7\" r=\"1.5\"></circle><circle cx=\"16\" cy=\"16\" r=\"1.5\"></circle>";
    };
    readonly search: {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path>";
    };
    readonly send: {
        readonly body: "<path d=\"m22 2-7 20-4-9-9-4 20-7z\"></path><path d=\"M22 2 11 13\"></path>";
    };
    readonly server: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"6\" rx=\"2\"></rect><rect x=\"3\" y=\"14\" width=\"18\" height=\"6\" rx=\"2\"></rect><path d=\"M7 7h.01\"></path><path d=\"M7 17h.01\"></path>";
    };
    readonly settings: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z\"></path>";
    };
    readonly share: {
        readonly body: "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle><circle cx=\"6\" cy=\"12\" r=\"3\"></circle><circle cx=\"18\" cy=\"19\" r=\"3\"></circle><path d=\"m8.6 10.6 6.8-4.2\"></path><path d=\"m8.6 13.4 6.8 4.2\"></path>";
    };
    readonly shield: {
        readonly body: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10\"></path>";
    };
    readonly sidebar: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"></rect><path d=\"M9 4v16\"></path>";
    };
    readonly sliders: {
        readonly body: "<path d=\"M4 6h8\"></path><path d=\"M16 6h4\"></path><path d=\"M14 4v4\"></path><path d=\"M4 12h4\"></path><path d=\"M12 12h8\"></path><path d=\"M10 10v4\"></path><path d=\"M4 18h10\"></path><path d=\"M18 18h2\"></path><path d=\"M16 16v4\"></path>";
    };
    readonly spark: {
        readonly body: "<path d=\"m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z\"></path><path d=\"m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17z\"></path>";
    };
    readonly sparkline: {
        readonly body: "<path d=\"m3 16 4-4 3 2 4-6 3 4 4-5\"></path>";
    };
    readonly star: {
        readonly body: "<path d=\"m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z\"></path>";
    };
    readonly success: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"m8 12 3 3 5-6\"></path>";
    };
    readonly sun: {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"M4.9 4.9l1.4 1.4\"></path><path d=\"M17.7 17.7l1.4 1.4\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"M4.9 19.1l1.4-1.4\"></path><path d=\"M17.7 6.3l1.4-1.4\"></path>";
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
    readonly terminal: {
        readonly body: "<path d=\"m4 17 6-5-6-5\"></path><path d=\"M12 19h8\"></path>";
    };
    readonly theme: {
        readonly body: "<path d=\"M4 21v-7\"></path><path d=\"M4 10V3\"></path><path d=\"M12 21v-9\"></path><path d=\"M12 8V3\"></path><path d=\"M20 21v-5\"></path><path d=\"M20 12V3\"></path><path d=\"M2 14h4\"></path><path d=\"M10 8h4\"></path><path d=\"M18 16h4\"></path>";
    };
    readonly tool: {
        readonly body: "<path d=\"M14.7 6.3a4 4 0 0 0-5.5 5.5L3 18v3h3l6.2-6.2a4 4 0 0 0 5.5-5.5l-2.5 2.5-3-3 2.5-2.5z\"></path>";
    };
    readonly trash: {
        readonly body: "<path d=\"M3 6h18\"></path><path d=\"M8 6V4h8v2\"></path><path d=\"M19 6l-1 15H6L5 6\"></path><path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path>";
    };
    readonly undo: {
        readonly body: "<path d=\"M3 7v6h6\"></path><path d=\"M3 13a8 8 0 1 1 2.3 5.7\"></path>";
    };
    readonly unlock: {
        readonly body: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"></rect><path d=\"M8 11V7a4 4 0 0 1 7.5-2\"></path>";
    };
    readonly upload: {
        readonly body: "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M12 3v12\"></path>";
    };
    readonly user: {
        readonly body: "<path d=\"M20 21a8 8 0 1 0-16 0\"></path><circle cx=\"12\" cy=\"7\" r=\"4\"></circle>";
    };
    readonly users: {
        readonly body: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>";
    };
    readonly video: {
        readonly body: "<rect x=\"3\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect><path d=\"m17 10 4-3v10l-4-3\"></path>";
    };
    readonly wallet: {
        readonly body: "<path d=\"M4 7h14a3 3 0 0 1 3 3v8H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12\"></path><path d=\"M16 13h5\"></path><path d=\"M17 13h.01\"></path>";
    };
    readonly warning: {
        readonly body: "<path d=\"m12 3 10 18H2L12 3z\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>";
    };
    readonly wifi: {
        readonly body: "<path d=\"M5 13a10 10 0 0 1 14 0\"></path><path d=\"M8.5 16.5a5 5 0 0 1 7 0\"></path><path d=\"M12 20h.01\"></path>";
    };
    readonly workflow: {
        readonly body: "<rect x=\"3\" y=\"4\" width=\"6\" height=\"6\" rx=\"2\"></rect><rect x=\"15\" y=\"14\" width=\"6\" height=\"6\" rx=\"2\"></rect><path d=\"M9 7h3a3 3 0 0 1 3 3v4\"></path><path d=\"M12 17H9a3 3 0 0 1-3-3v-4\"></path>";
    };
    readonly 'x-circle': {
        readonly body: "<circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M15 9 9 15\"></path><path d=\"m9 9 6 6\"></path>";
    };
    readonly 'zoom-in': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M11 8v6\"></path><path d=\"M8 11h6\"></path>";
    };
    readonly 'zoom-out': {
        readonly body: "<circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-4-4\"></path><path d=\"M8 11h6\"></path>";
    };
};
type IconName = keyof typeof icons;

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
declare function initComponent(el: HTMLElement): void;
declare function destroyComponent(el: HTMLElement): void;
declare function initAll(root?: Document | HTMLElement): () => void;
declare function showToast(message: string, options?: {
    type?: string;
    duration?: number;
}): HTMLElement;
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
    exportData?: (rows: HTMLTableRowElement[]) => unknown;
    onPage?: (page: number, table: HTMLTableElement) => void | Promise<void>;
    onBulkAction?: (action: string, rows: HTMLTableRowElement[]) => void;
    onRowAction?: (action: string, row: HTMLTableRowElement) => void;
}
interface RemoteTableResponse {
    rows?: Array<Record<string, unknown>>;
    html?: string;
    total?: number;
    page?: number;
}
declare function sortTable(table: HTMLTableElement, column: number, direction?: 'asc' | 'desc'): void;
declare function filterTable(table: HTMLTableElement, query: string): void;
declare function selectedRows(table: HTMLTableElement): HTMLTableRowElement[];
declare function setTableState(table: HTMLTableElement, state: 'idle' | 'loading' | 'loaded' | 'error' | 'empty'): void;
declare function applyResponsiveColumns(table: HTMLTableElement): void;
declare function loadRemoteTable(table: HTMLTableElement, options?: TableOptions): Promise<RemoteTableResponse | null>;
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

type ChartType = 'line' | 'area' | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'grouped-bar' | 'pie' | 'donut' | 'doughnut' | 'radar' | 'sparkline' | 'metric' | 'progress' | 'ring' | 'gauge' | 'timeline' | 'heatmap' | 'status-heatmap' | 'bullet' | 'histogram' | 'box-plot' | 'scatter' | 'regression' | 'control-chart' | 'distribution' | 'pareto';
interface ChartDatum {
    label?: string;
    value?: number;
    values?: Record<string, number>;
    target?: number;
    min?: number;
    max?: number;
    group?: string;
    color?: string;
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

interface BatoiUIFApp {
    root: Document | HTMLElement;
    refresh(root?: Document | HTMLElement): void;
    destroy(): void;
}
declare function start(root?: Document | HTMLElement): BatoiUIFApp;
declare function autoStart(root?: Document | HTMLElement): void;

export { type ActionContext, type ActionDiagnostic, type ActionHandler, type AnimationPreset, type AnimationStep, type ArtifactStoreOptions, type BatoiUIFApp, type ChartController, type ChartDatum, type ChartExportOptions, type ChartMargin, type ChartOptions, type ChartPaletteName, type ChartSelectionDetail, type ChartType, type ComponentInstance, type ConnectorMode, type ConnectorType, type DashboardConfig, type DashboardFilter, type DashboardFilterOperator, type DashboardRenderOptions, type DashboardWidget, type DashboardWidgetType, type DataConnector, type DesktopAiMode, type DesktopAppManifest, type DesktopCapability, type DesktopNavigationItem, type DesktopOfflineMode, type DesktopPlatform, type DesktopSettingsStore, type DesktopShellOptions, type DesktopShellStatus, type DesktopSyncQueueItem, type DesktopSyncState, type DesktopSyncStatus, type DesktopValidationResult, type DesktopWorkspaceMode, type DesktopWorkspaceSession, type DrilldownOptions, type EditorCommand, type EditorCommandContext, type EditorCommandHandler, type EditorHookContext, type EditorHookHandler, type EditorHookName, type EditorImageValue, type EditorInstance, type EditorLayout, type EditorLinkValue, type EditorMode, type EditorOptions, type EditorPreviewMode, type EditorTableValue, type EffectOptions, type ExtensionManifestOptions, type ExtensionMessage, type ExtensionSurface, type FormErrors, type HTMLSwapMode, type HistogramBin, type HistogramOptions, type IconDefinition, type IconName, type IconOptions, type IconRegistry, type LocalStore, type LocalStoreOptions, type MicroAppConnectorManifest, type MicroAppConnectorMode, type MicroAppConnectorType, type MicroAppLocalStore, type MicroAppManifest, type MicroAppManifestIssue, type MicroAppManifestResult, type MicroAppPermissionsManifest, type MicroAppRealtimeManifest, type MicroAppRealtimeTransport, type MicroAppStorageManifest, type MicroAppStorageMode, type MicroAppStoreOptions, type MountIconsOptions, type NotificationItem, type OverlayOptions, type ParsedAction, type PresenceUser, type QueryHandler, type QueryInput, type RadResponse, type RealtimeBindingOptions, type RealtimeHandler, type RealtimeMode, type RealtimeOptions, type RealtimeState, type RecordAdapterOptions, type RegressionPoint, type RegressionResult, type RemoteTableResponse, type RequestOptions, type RouterOptions, type StoreOptions, type SummaryStats, type SwapMode, type SyncQueue, type SyncQueueItem, type TableAdapterOptions, type TableOptions, type TrustedHTMLRenderOptions, type UIFAction, type UIFApp, type UIFAttribute, type UIFComponent, type UIFDomComponent, type UIFLifecycleEvent, type UIFOptions, type UIFPlugin, UIFQuery, type UIFRequestError, type UIFState, type UIFValue, accordion, adaptRecords, adaptTable, addNotification, aiAction, alert, animate, animateGroup, animationPresets, appendStreamingChunk, appendTextElement, applyDashboardFilters, applyPermissionNavigation, applyResponsiveColumns, autoInit, autoStart, badge, bindActions, bindChartExports, bindConnector, bindDesktopOfflineIndicator, bindDesktopSettings, bindRadActions, bindRealtime, breadcrumb, button, cacheStrategies, canUseDesktopAction, cancelAnimation, cancelRequest, card, chart, cleanEditorHtml, clearActionDiagnostics, clearErrors, closeOverlay, closest, collapse, collapseComponent, combobox, commandMenu, connect, correlation, createAdvancedStore, createArtifactStore, createCacheStrategy, createDashboardConfig, createDesktopManifest, createDesktopShell, createDesktopSyncStatus, createEditor, createExtensionManifest, createExtensionMessage, createLocalSettingsStore, createLocalStore, createMemorySettingsStore, createMicroAppStore, createStore, createStreamSurface, createSyncQueue, createWorkspaceSession, csvToObjects, cumulativeSum, dataTable, delegate, destroyChart, destroyComponent, detectDesktopPlatform, disconnect, dispatchAction, dispatchActions, downloadChartPng, downloadChartSvg, drawer, dropdown, emit, escapeHtml, expand, exportChartData, exportChartPng, exportChartSvg, exportTable, fileUpload, filterElements, filterTable, flushOfflineQueue, form, formatEditor, fragment, get, getActionDiagnostics, getConnectionState, getEditorValue, getNotifications, getOverlayStack, getPresence, getPushSubscription, hasDesktopCapability, hasIcon, hide, histogramBins, htmlToMarkdown, icon, iconElement, icons, init, initAll, initAnimation, initAnimationTriggers, initChart, initComponent, initDashboard, initDeclarativeFilters, initDesktopShell, initEditor, initForm, initInstallPrompt, initMobileShell, initOfflineQueue, initPullToRefresh, initPush, initRealtime, initRepeatableGroup, initRouter, initSegmentedControl, initSheetModal, initSwipeAction, initTable, isExtensionRuntime, isInitialized, linearRegression, loadConnector, loadPartial, loadRemoteTable, markNotificationsRead, markdownToHtml, mobileShell, modal, mount, mountIcons, movingAverage, nav, navbar, observe, observeMotion, offcanvas, on, onAppUpdate, onNetworkChange, onOffline, onOnline, openOverlay, pagination, parseActionSpec, parseCSV, parseChartData, parseDesktopManifestElement, parseMicroAppManifest, parseOptions, percentChange, popover, positionOverlay, post, progress, publishBatched, publishLocal, push, qs, qsa, quantile, queryEditorCommand, queueOfflineTask, ready, realtime, refreshChart, registerAction, registerAsyncRule, registerComponent, registerEditorCommand, registerEditorHook, registerIcon, registerPlugin, registerPushServiceWorker, registerServiceWorker, rehydrate, removePresence, renderAIAction, renderAIResultCard, renderAssistantResponse, renderChart, renderDashboard, renderDashboardWidget, renderDesktopShell, renderDesktopSyncStatus, renderDiff, renderPromptPanel, renderToolApproval, renderToolAuditTrail, renderToolProgress, renderToolResult, renderToolTimeline, renderWorkspaceIdentity, request, requestNotificationPermission, resolveActionTarget, resolveTarget, runEditorCommand, selectedRows, sequence, serialize, setAccent, setDensity, setDesktopStatus, setEditorPreviewLayout, setEditorValue, setTableState, setText, setTrustedHTML, setupInstallPrompt, shell, show, showErrorSummary, showErrors, showInAppNotification, showOfflineBanner, showToast, sidebar, skeleton, sortTable, spinner, stagger, start, stepper, submitForm, subscribe, subscribeToPush, summarizeDashboard, summarizeDesktopQueue, summaryStats, swapContent, swapTrustedHTML, table, tabs, timeline, toast, toggle, toggleOverlay, toolApproval, tooltip, transition, trigger, uif, uifActions, uifAttributes, uifStates, uifValues, unmount, unreadCount, unregisterAction, unregisterEditorCommand, unregisterServiceWorker, unsubscribeFromPush, updatePresence, upload, useRequestInterceptor, useResponseInterceptor, validateDesktopManifest, validateEditor, validateField, validateForm, validateFormAsync, validateMicroAppManifest, wizard, zScores };
