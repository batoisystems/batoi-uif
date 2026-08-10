type UIFErrorCategory = 'config' | 'security' | 'network' | 'limit' | 'state' | 'compatibility' | 'internal';
interface UIFErrorDetail {
    code: string;
    category: UIFErrorCategory;
    package: string;
    component?: string;
    phase?: string;
    recoverable: boolean;
    retryable?: boolean;
    correlationId?: string;
    cause?: unknown;
}
declare class UIFError extends Error implements UIFErrorDetail {
    readonly code: string;
    readonly category: UIFErrorCategory;
    readonly package: string;
    readonly component?: string;
    readonly phase?: string;
    readonly recoverable: boolean;
    readonly retryable?: boolean;
    readonly correlationId?: string;
    constructor(message: string, detail: UIFErrorDetail);
}
interface UIFResourceLimits {
    maxBytes?: number;
    maxCharacters?: number;
    maxItems?: number;
    maxKeys?: number;
    maxDepth?: number;
}
declare const defaultUIFResourceLimits: Readonly<Required<UIFResourceLimits>>;
declare function isSafeObjectKey(key: string): boolean;
declare function isSafePropertyPath(path: string): boolean;
declare function assertSafePropertyPath(path: string): void;
interface UIFObjectInspectionOptions {
    maxDepth?: number;
    maxKeys?: number;
    maxIssues?: number;
}
declare function findUnsafeObjectPaths(value: unknown, options?: UIFObjectInspectionOptions): string[];
declare function assertSafeObject(value: unknown, options?: UIFObjectInspectionOptions): void;
interface UIFConfigurationIssue {
    path: string;
    code: 'invalid-json' | 'not-object' | 'unknown-key' | 'unsafe-key' | 'limit';
    message: string;
}
interface UIFConfigurationResult<T extends Record<string, unknown>> {
    value: T;
    issues: UIFConfigurationIssue[];
    valid: boolean;
}
interface UIFConfigurationOptions {
    allowedKeys?: readonly string[];
    allowUnknown?: boolean;
    limits?: UIFObjectInspectionOptions;
}
declare function parseUIFConfiguration<T extends Record<string, unknown> = Record<string, unknown>>(input: string | unknown, options?: UIFConfigurationOptions): UIFConfigurationResult<T>;

type AgentEnvelopeKind = 'message' | 'notice' | 'stream-delta' | 'stream-complete' | 'tool-plan' | 'tool-review' | 'tool-progress' | 'tool-result' | 'receipt' | 'error';
type AgentEnvelopeStatus = 'draft' | 'pending' | 'streaming' | 'waiting-approval' | 'approved' | 'rejected' | 'executing' | 'completed' | 'partial' | 'failed' | 'cancelled' | 'expired' | 'superseded';
type AgentActorRole = 'user' | 'assistant' | 'system' | 'tool' | 'reviewer';
type AgentRiskLevel = 'low' | 'medium' | 'high' | 'critical';
interface AgentActor {
    role: AgentActorRole;
    label?: string;
}
interface AgentTextPart {
    type: 'text';
    text: string;
}
interface AgentSourcePart {
    type: 'source';
    id: string;
    label: string;
    url?: string;
    retrievedAt?: string;
    unavailable?: boolean;
}
interface AgentArtifactPart {
    type: 'artifact';
    id: string;
    label: string;
    mediaType?: string;
    url?: string;
    checksum?: string;
}
interface AgentDataPart {
    type: 'data';
    label?: string;
    value: unknown;
}
type AgentContentPart = AgentTextPart | AgentSourcePart | AgentArtifactPart | AgentDataPart;
interface AgentUsageDisclosure {
    model?: string;
    route?: string;
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
    currency?: string;
    latencyMilliseconds?: number;
    retention?: string;
}
interface AgentRiskDisclosure {
    level: AgentRiskLevel;
    reversible?: boolean;
    summary?: string;
    affectedResources?: string[];
    externalRecipients?: string[];
    dataClassification?: string;
}
interface AgentInteractionEnvelope {
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
interface AgentEnvelopeIssue {
    path: string;
    code: 'invalid' | 'unsupported' | 'unsafe' | 'limit' | 'truncated';
    message: string;
}
interface AgentEnvelopeResult {
    envelope: AgentInteractionEnvelope;
    issues: AgentEnvelopeIssue[];
    valid: boolean;
}
declare function validateAgentEnvelope(input: unknown, limits?: UIFResourceLimits): AgentEnvelopeResult;
declare function parseAgentEnvelope(input: unknown, limits?: UIFResourceLimits): AgentInteractionEnvelope;

declare const uifAttributes: readonly ["data-uif", "data-uif-id", "data-uif-role", "data-uif-action", "data-uif-target", "data-uif-src", "data-uif-method", "data-uif-trigger", "data-uif-state", "data-uif-bind", "data-uif-model", "data-uif-value", "data-uif-route", "data-uif-mode", "data-uif-options", "data-uif-confirm", "data-uif-disabled", "data-uif-loading", "data-uif-success", "data-uif-error", "data-uif-swap", "data-uif-cache", "data-uif-validate", "data-uif-rule", "data-uif-event", "data-uif-on", "data-uif-refresh", "data-uif-persist", "data-uif-density", "data-uif-sidebar-key", "data-uif-density-key", "data-uif-toolbar", "data-uif-preview", "data-uif-animation", "data-uif-duration", "data-uif-delay", "data-uif-placement", "data-uif-container", "data-uif-html", "data-uif-backdrop", "data-uif-scroll", "data-uif-breakpoint", "data-uif-class", "data-uif-attribute", "data-uif-key"];
declare const uifValues: readonly ["button", "modal", "drawer", "offcanvas", "dropdown", "tabs", "toast", "accordion", "tooltip", "popover", "table", "form", "editor", "ajax", "route", "shell", "nav", "chart", "animate", "realtime", "push", "mobile-shell", "ai-action", "ai-thread", "ai-composer", "agent-tool", "tool-approval"];
declare const uifActions: readonly ["open", "close", "toggle", "toggle-sidebar", "toggle-section", "submit", "load", "reload", "delete", "save", "reset", "clear", "select", "activate", "deactivate", "navigate", "swap", "append", "prepend", "remove", "toast", "set-density", "animate", "add-class", "remove-class", "toggle-class", "set-attribute", "remove-attribute", "set-value", "copy", "scroll-to", "focus", "emit", "subscribe", "connect", "disconnect", "approve", "reject"];
declare const uifStates: readonly ["idle", "loading", "loaded", "error", "success", "active", "inactive", "open", "closed", "disabled", "selected", "expanded", "collapsed", "connected", "disconnected", "pending", "approved", "rejected"];
declare const uifEvents: readonly ["uif:before-init", "uif:init", "uif:before-destroy", "uif:destroy", "uif:error", "uif:runtime:mounted", "uif:runtime:error", "uif:runtime:diagnostic", "uif:diagnostic", "uif:agent:submit", "uif:agent:cancel", "uif:agent:error", "uif:agent:feedback", "uif:agent:retry", "uif:agent:copy", "uif:tool-approve", "uif:tool-reject", "uif:tool-expired", "uif:tool-replay-blocked"];
interface UIFContractEntry<Name extends string = string> {
    name: Name;
    version: 3;
    status: 'stable' | 'compatibility';
}
declare const uifContractRegistry: Readonly<{
    attributes: readonly UIFContractEntry<"data-uif-options" | "data-uif" | "data-uif-id" | "data-uif-role" | "data-uif-action" | "data-uif-target" | "data-uif-src" | "data-uif-method" | "data-uif-trigger" | "data-uif-state" | "data-uif-bind" | "data-uif-model" | "data-uif-value" | "data-uif-route" | "data-uif-mode" | "data-uif-confirm" | "data-uif-disabled" | "data-uif-loading" | "data-uif-success" | "data-uif-error" | "data-uif-swap" | "data-uif-cache" | "data-uif-validate" | "data-uif-rule" | "data-uif-event" | "data-uif-on" | "data-uif-refresh" | "data-uif-persist" | "data-uif-density" | "data-uif-sidebar-key" | "data-uif-density-key" | "data-uif-toolbar" | "data-uif-preview" | "data-uif-animation" | "data-uif-duration" | "data-uif-delay" | "data-uif-placement" | "data-uif-container" | "data-uif-html" | "data-uif-backdrop" | "data-uif-scroll" | "data-uif-breakpoint" | "data-uif-class" | "data-uif-attribute" | "data-uif-key">[];
    components: readonly UIFContractEntry<"button" | "form" | "nav" | "table" | "route" | "push" | "modal" | "drawer" | "offcanvas" | "dropdown" | "tabs" | "toast" | "accordion" | "tooltip" | "popover" | "editor" | "ajax" | "shell" | "chart" | "animate" | "realtime" | "mobile-shell" | "ai-action" | "ai-thread" | "ai-composer" | "agent-tool" | "tool-approval">[];
    actions: readonly UIFContractEntry<"select" | "toast" | "animate" | "open" | "close" | "toggle" | "toggle-sidebar" | "toggle-section" | "submit" | "load" | "reload" | "delete" | "save" | "reset" | "clear" | "activate" | "deactivate" | "navigate" | "swap" | "append" | "prepend" | "remove" | "set-density" | "add-class" | "remove-class" | "toggle-class" | "set-attribute" | "remove-attribute" | "set-value" | "copy" | "scroll-to" | "focus" | "emit" | "subscribe" | "connect" | "disconnect" | "approve" | "reject">[];
    states: readonly UIFContractEntry<"error" | "pending" | "approved" | "rejected" | "open" | "idle" | "loading" | "loaded" | "success" | "active" | "inactive" | "closed" | "disabled" | "selected" | "expanded" | "collapsed" | "connected" | "disconnected">[];
    events: readonly UIFContractEntry<"uif:before-init" | "uif:init" | "uif:before-destroy" | "uif:destroy" | "uif:error" | "uif:runtime:diagnostic" | "uif:runtime:mounted" | "uif:runtime:error" | "uif:diagnostic" | "uif:agent:submit" | "uif:agent:cancel" | "uif:agent:error" | "uif:agent:feedback" | "uif:agent:retry" | "uif:agent:copy" | "uif:tool-approve" | "uif:tool-reject" | "uif:tool-expired" | "uif:tool-replay-blocked">[];
}>;
type UIFAttribute = (typeof uifAttributes)[number];
type UIFValue = (typeof uifValues)[number];
type UIFAction = (typeof uifActions)[number];
type UIFState = (typeof uifStates)[number];
type UIFEvent = (typeof uifEvents)[number];

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
    emit<T = unknown>(name: string, detail?: T): void;
    error(message: string, detail: Omit<UIFErrorDetail, 'package' | 'component'>): UIFError;
}
interface UIFComponentDefinition<Options extends Record<string, unknown> = Record<string, unknown>, Controller extends UIFController = UIFController> {
    name: string;
    version?: number;
    defaults?: Readonly<Partial<Options>>;
    optionKeys?: readonly (keyof Options & string)[];
    roles?: readonly string[];
    actions?: readonly string[];
    events?: readonly string[];
    states?: readonly string[];
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

type UIFCompatibilityMode = 'v2' | 'diagnostic' | 'v3';
interface UIFCompatibilityOptions {
    mode?: UIFCompatibilityMode;
}
declare function configureCompatibility(options: UIFCompatibilityOptions | null): void;
declare function getCompatibilityMode(): UIFCompatibilityMode;

type UIFDiagnosticDurationBucket = '<1ms' | '1-15ms' | '16-50ms' | '51-250ms' | '251-1000ms' | '>1000ms';
interface UIFDiagnostic {
    version: 3;
    package: string;
    component?: string;
    code: string;
    phase?: string;
    recoverable: boolean;
    durationBucket?: UIFDiagnosticDurationBucket;
    correlationRef?: string;
    timestamp: string;
}
interface UIFDiagnosticInput extends Omit<UIFDiagnostic, 'version' | 'timestamp'> {
    durationMilliseconds?: number;
}
interface UIFDiagnosticsOptions {
    enabled?: boolean;
    target?: EventTarget;
    handle?: (diagnostic: Readonly<UIFDiagnostic>) => void;
    redact?: (diagnostic: Readonly<UIFDiagnostic>) => Partial<UIFDiagnostic> | void;
}
declare function diagnosticDurationBucket(milliseconds: number): UIFDiagnosticDurationBucket;
declare function configureDiagnostics(options: UIFDiagnosticsOptions | null): void;
declare function reportDiagnostic(input: UIFDiagnosticInput): Readonly<UIFDiagnostic> | null;

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

export { type AgentActor, type AgentActorRole, type AgentArtifactPart, type AgentContentPart, type AgentDataPart, type AgentEnvelopeIssue, type AgentEnvelopeKind, type AgentEnvelopeResult, type AgentEnvelopeStatus, type AgentInteractionEnvelope, type AgentRiskDisclosure, type AgentRiskLevel, type AgentSourcePart, type AgentTextPart, type AgentUsageDisclosure, type MicroAppConnectorManifest, type MicroAppConnectorMode, type MicroAppConnectorType, type MicroAppConnectorWorkflow, type MicroAppLocalStore, type MicroAppManifest, type MicroAppManifestIssue, type MicroAppManifestResult, type MicroAppPermissionsManifest, type MicroAppRealtimeManifest, type MicroAppRealtimeTransport, type MicroAppStorageManifest, type MicroAppStorageMode, type UIFAction, type UIFApp, type UIFAttribute, type UIFCompatibilityMode, type UIFCompatibilityOptions, type UIFComponent, type UIFComponentDefinition, type UIFComponentRegistry, type UIFConfigurationIssue, type UIFConfigurationOptions, type UIFConfigurationResult, type UIFContractEntry, type UIFController, type UIFDiagnostic, type UIFDiagnosticDurationBucket, type UIFDiagnosticInput, type UIFDiagnosticsOptions, UIFError, type UIFErrorCategory, type UIFErrorDetail, type UIFEvent, type UIFLifecycleEvent, type UIFMountContext, type UIFObjectInspectionOptions, type UIFOptions, type UIFPlugin, type UIFResourceLimits, type UIFState, type UIFUpdateReason, type UIFValue, assertSafeObject, assertSafePropertyPath, configureCompatibility, configureDiagnostics, createComponentRegistry, defaultUIFResourceLimits, diagnosticDurationBucket, emit, findUnsafeObjectPaths, getCompatibilityMode, init, isSafeObjectKey, isSafePropertyPath, listMicroAppConnectorWorkflows, on, parseAgentEnvelope, parseMicroAppManifest, parseOptions, parseUIFConfiguration, registerPlugin, reportDiagnostic, setAccent, setDensity, uifActions, uifAttributes, uifContractRegistry, uifEvents, uifStates, uifValues, validateAgentEnvelope, validateMicroAppConnectorWorkflows, validateMicroAppManifest };
