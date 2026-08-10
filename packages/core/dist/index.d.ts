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
    limits?: UIFResourceLimits;
}
type UIFJSONShape = 'any' | 'array' | 'object';
interface UIFJSONParseOptions {
    shape?: UIFJSONShape;
    limits?: UIFResourceLimits;
}
interface UIFJSONIssue {
    path: string;
    code: 'invalid-json' | 'invalid-shape' | 'unsafe-key' | 'limit';
    message: string;
}
interface UIFJSONResult<T = unknown> {
    value: T | undefined;
    issues: UIFJSONIssue[];
    valid: boolean;
}
declare function parseUIFJSON<T = unknown>(input: string, options?: UIFJSONParseOptions): UIFJSONResult<T>;
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
declare const agentEnvelopeKinds: readonly ("error" | "message" | "notice" | "stream-delta" | "stream-complete" | "tool-plan" | "tool-review" | "tool-progress" | "tool-result" | "receipt")[];
declare const agentEnvelopeStatuses: readonly ("draft" | "pending" | "streaming" | "waiting-approval" | "approved" | "rejected" | "executing" | "completed" | "partial" | "failed" | "cancelled" | "expired" | "superseded")[];
declare const agentContentPartTypes: readonly ["text", "source", "artifact", "data"];
declare const agentEnvelopeContract: Readonly<{
    name: "agent-interaction";
    version: 3;
    authority: "presentation-only";
    kinds: readonly ("error" | "message" | "notice" | "stream-delta" | "stream-complete" | "tool-plan" | "tool-review" | "tool-progress" | "tool-result" | "receipt")[];
    statuses: readonly ("draft" | "pending" | "streaming" | "waiting-approval" | "approved" | "rejected" | "executing" | "completed" | "partial" | "failed" | "cancelled" | "expired" | "superseded")[];
    contentPartTypes: readonly ["text", "source", "artifact", "data"];
    requiredFields: readonly string[];
    privilegedExecution: false;
}>;
declare function validateAgentEnvelope(input: unknown, limits?: UIFResourceLimits): AgentEnvelopeResult;
declare function parseAgentEnvelope(input: unknown, limits?: UIFResourceLimits): AgentInteractionEnvelope;

declare const uifAttributes: readonly ["data-uif", "data-uif-id", "data-uif-role", "data-uif-action", "data-uif-target", "data-uif-src", "data-uif-method", "data-uif-trigger", "data-uif-state", "data-uif-bind", "data-uif-model", "data-uif-value", "data-uif-route", "data-uif-mode", "data-uif-options", "data-uif-confirm", "data-uif-disabled", "data-uif-loading", "data-uif-success", "data-uif-error", "data-uif-swap", "data-uif-cache", "data-uif-validate", "data-uif-rule", "data-uif-event", "data-uif-on", "data-uif-refresh", "data-uif-persist", "data-uif-density", "data-uif-sidebar-key", "data-uif-density-key", "data-uif-toolbar", "data-uif-preview", "data-uif-animation", "data-uif-duration", "data-uif-delay", "data-uif-placement", "data-uif-container", "data-uif-html", "data-uif-backdrop", "data-uif-scroll", "data-uif-breakpoint", "data-uif-class", "data-uif-attribute", "data-uif-key", "data-uif-envelope", "data-uif-interval", "data-uif-message", "data-uif-messages"];
declare const uifValues: readonly ["button", "modal", "drawer", "offcanvas", "dropdown", "tabs", "toast", "accordion", "alert", "badge", "breadcrumb", "collapse", "tooltip", "popover", "progress", "spinner", "skeleton", "pagination", "command-menu", "navbar", "sidebar", "stepper", "wizard", "file-upload", "combobox", "carousel", "lightbox", "masonry", "card", "table", "form", "editor", "ajax", "route", "shell", "nav", "chart", "animate", "realtime", "push", "mobile-shell", "desktop-shell", "ai-action", "ai-thread", "ai-composer", "agent-tool", "tool-approval", "typed-text", "dashboard", "install-prompt"];
declare const uifActions: readonly ["open", "close", "toggle", "toggle-sidebar", "toggle-section", "submit", "load", "reload", "delete", "save", "reset", "clear", "select", "activate", "deactivate", "navigate", "swap", "append", "prepend", "remove", "toast", "set-density", "animate", "add-class", "remove-class", "toggle-class", "set-attribute", "remove-attribute", "set-value", "copy", "scroll-to", "focus", "emit", "subscribe", "connect", "disconnect", "approve", "reject", "edit", "install", "next", "preview", "previous", "unsubscribe"];
declare const uifStates: readonly ["idle", "loading", "loaded", "error", "success", "active", "inactive", "open", "closed", "disabled", "selected", "expanded", "collapsed", "connected", "disconnected", "pending", "approved", "rejected", "available", "busy", "completed", "connecting", "decision-pending", "dirty", "empty", "expired", "failed", "installed", "offline", "online", "saved", "saving", "submitting", "unavailable", "waiting-approval"];
declare const uifEvents: readonly ["uif:before-init", "uif:init", "uif:before-destroy", "uif:destroy", "uif:error", "uif:runtime:mounted", "uif:runtime:error", "uif:runtime:diagnostic", "uif:diagnostic", "uif:agent:submit", "uif:agent:cancel", "uif:agent:error", "uif:agent:feedback", "uif:agent:retry", "uif:agent:copy", "uif:tool-approve", "uif:tool-reject", "uif:tool-expired", "uif:tool-invalid-review", "uif:tool-replay-blocked", "uif:accordion-toggle", "uif:action-diagnostic", "uif:ai-action", "uif:ai-error", "uif:ai-history-select", "uif:ai-stream-cancel", "uif:animation-end", "uif:animation-start", "uif:before-load", "uif:carousel-change", "uif:chart-drilldown", "uif:chart-drilldown-error", "uif:chart-error", "uif:chart-export", "uif:chart-refresh", "uif:chart-select", "uif:collapse-close", "uif:collapse-open", "uif:combobox-change", "uif:command-menu-close", "uif:command-menu-open", "uif:complete", "uif:connector-error", "uif:dashboard-error", "uif:desktop-change", "uif:desktop-error", "uif:drawer-close", "uif:drawer-open", "uif:dropdown-close", "uif:dropdown-open", "uif:editor-autosave", "uif:editor-autosave-error", "uif:editor-blur", "uif:editor-change", "uif:editor-command", "uif:editor-destroy", "uif:editor-diagnostics", "uif:editor-error", "uif:editor-focus", "uif:editor-init", "uif:editor-layout-change", "uif:editor-mode-change", "uif:editor-normalize", "uif:editor-preview", "uif:editor-reset", "uif:editor-upload-error", "uif:editor-validate", "uif:field-errors", "uif:file-select", "uif:form-dirty", "uif:form-error", "uif:form-submit", "uif:form-success", "uif:form-touched", "uif:lightbox-close", "uif:lightbox-open", "uif:load", "uif:modal-close", "uif:modal-open", "uif:notification", "uif:offcanvas-close", "uif:offcanvas-open", "uif:offline-error", "uif:offline-queued", "uif:offline-synced", "uif:pagination-change", "uif:popover-close", "uif:popover-open", "uif:presence", "uif:push-change", "uif:push-error", "uif:pwa-install", "uif:rad-before", "uif:rad-error", "uif:rad-success", "uif:realtime-error", "uif:realtime-message", "uif:realtime-state", "uif:rehydrate", "uif:request", "uif:response", "uif:route-before", "uif:route-error", "uif:route-success", "uif:router-error", "uif:segment-change", "uif:select", "uif:shell-density", "uif:table-before-load", "uif:table-bulk-action", "uif:table-error", "uif:table-filter", "uif:table-load", "uif:table-loaded", "uif:table-page", "uif:table-page-size", "uif:table-reset", "uif:table-row-action", "uif:table-select", "uif:table-selection", "uif:table-sort", "uif:table-state", "uif:tabs-change", "uif:toast", "uif:tool-confirmation-required", "uif:typed-text-complete", "uif:wizard-change"];
declare const uifErrors: readonly ["UIF_COMPONENT_DESTROY", "UIF_COMPONENT_DUPLICATE", "UIF_COMPONENT_MOUNT", "UIF_COMPONENT_NAME", "UIF_INVALID_ACCENT", "UIF_LOCALE_CONFIG", "UIF_STORAGE_KEY", "UIF_STORAGE_PARTITION", "UIF_UNSAFE_OBJECT", "UIF_UNSAFE_PROPERTY_PATH"];
interface UIFContractEntry<Name extends string = string> {
    name: Name;
    version: 3;
    status: 'stable' | 'compatibility';
}
declare const uifContractRegistry: Readonly<{
    attributes: readonly UIFContractEntry<"data-uif-options" | "data-uif" | "data-uif-id" | "data-uif-role" | "data-uif-action" | "data-uif-target" | "data-uif-src" | "data-uif-method" | "data-uif-trigger" | "data-uif-state" | "data-uif-bind" | "data-uif-model" | "data-uif-value" | "data-uif-route" | "data-uif-mode" | "data-uif-confirm" | "data-uif-disabled" | "data-uif-loading" | "data-uif-success" | "data-uif-error" | "data-uif-swap" | "data-uif-cache" | "data-uif-validate" | "data-uif-rule" | "data-uif-event" | "data-uif-on" | "data-uif-refresh" | "data-uif-persist" | "data-uif-density" | "data-uif-sidebar-key" | "data-uif-density-key" | "data-uif-toolbar" | "data-uif-preview" | "data-uif-animation" | "data-uif-duration" | "data-uif-delay" | "data-uif-placement" | "data-uif-container" | "data-uif-html" | "data-uif-backdrop" | "data-uif-scroll" | "data-uif-breakpoint" | "data-uif-class" | "data-uif-attribute" | "data-uif-key" | "data-uif-envelope" | "data-uif-interval" | "data-uif-message" | "data-uif-messages">[];
    components: readonly UIFContractEntry<"button" | "form" | "nav" | "progress" | "table" | "route" | "push" | "modal" | "drawer" | "offcanvas" | "dropdown" | "tabs" | "toast" | "accordion" | "alert" | "badge" | "breadcrumb" | "collapse" | "tooltip" | "popover" | "spinner" | "skeleton" | "pagination" | "command-menu" | "navbar" | "sidebar" | "stepper" | "wizard" | "file-upload" | "combobox" | "carousel" | "lightbox" | "masonry" | "card" | "editor" | "ajax" | "shell" | "chart" | "animate" | "realtime" | "mobile-shell" | "desktop-shell" | "ai-action" | "ai-thread" | "ai-composer" | "agent-tool" | "tool-approval" | "typed-text" | "dashboard" | "install-prompt">[];
    actions: readonly UIFContractEntry<"select" | "toast" | "animate" | "open" | "close" | "toggle" | "toggle-sidebar" | "toggle-section" | "submit" | "load" | "reload" | "delete" | "save" | "reset" | "clear" | "activate" | "deactivate" | "navigate" | "swap" | "append" | "prepend" | "remove" | "set-density" | "add-class" | "remove-class" | "toggle-class" | "set-attribute" | "remove-attribute" | "set-value" | "copy" | "scroll-to" | "focus" | "emit" | "subscribe" | "connect" | "disconnect" | "approve" | "reject" | "edit" | "install" | "next" | "preview" | "previous" | "unsubscribe">[];
    states: readonly UIFContractEntry<"error" | "pending" | "waiting-approval" | "approved" | "rejected" | "completed" | "failed" | "expired" | "unavailable" | "open" | "idle" | "loading" | "loaded" | "success" | "active" | "inactive" | "closed" | "disabled" | "selected" | "expanded" | "collapsed" | "connected" | "disconnected" | "available" | "busy" | "connecting" | "decision-pending" | "dirty" | "empty" | "installed" | "offline" | "online" | "saved" | "saving" | "submitting">[];
    events: readonly UIFContractEntry<"uif:before-init" | "uif:init" | "uif:before-destroy" | "uif:destroy" | "uif:error" | "uif:runtime:diagnostic" | "uif:runtime:mounted" | "uif:runtime:error" | "uif:diagnostic" | "uif:agent:submit" | "uif:agent:cancel" | "uif:agent:error" | "uif:agent:feedback" | "uif:agent:retry" | "uif:agent:copy" | "uif:tool-approve" | "uif:tool-reject" | "uif:tool-expired" | "uif:tool-invalid-review" | "uif:tool-replay-blocked" | "uif:accordion-toggle" | "uif:action-diagnostic" | "uif:ai-action" | "uif:ai-error" | "uif:ai-history-select" | "uif:ai-stream-cancel" | "uif:animation-end" | "uif:animation-start" | "uif:before-load" | "uif:carousel-change" | "uif:chart-drilldown" | "uif:chart-drilldown-error" | "uif:chart-error" | "uif:chart-export" | "uif:chart-refresh" | "uif:chart-select" | "uif:collapse-close" | "uif:collapse-open" | "uif:combobox-change" | "uif:command-menu-close" | "uif:command-menu-open" | "uif:complete" | "uif:connector-error" | "uif:dashboard-error" | "uif:desktop-change" | "uif:desktop-error" | "uif:drawer-close" | "uif:drawer-open" | "uif:dropdown-close" | "uif:dropdown-open" | "uif:editor-autosave" | "uif:editor-autosave-error" | "uif:editor-blur" | "uif:editor-change" | "uif:editor-command" | "uif:editor-destroy" | "uif:editor-diagnostics" | "uif:editor-error" | "uif:editor-focus" | "uif:editor-init" | "uif:editor-layout-change" | "uif:editor-mode-change" | "uif:editor-normalize" | "uif:editor-preview" | "uif:editor-reset" | "uif:editor-upload-error" | "uif:editor-validate" | "uif:field-errors" | "uif:file-select" | "uif:form-dirty" | "uif:form-error" | "uif:form-submit" | "uif:form-success" | "uif:form-touched" | "uif:lightbox-close" | "uif:lightbox-open" | "uif:load" | "uif:modal-close" | "uif:modal-open" | "uif:notification" | "uif:offcanvas-close" | "uif:offcanvas-open" | "uif:offline-error" | "uif:offline-queued" | "uif:offline-synced" | "uif:pagination-change" | "uif:popover-close" | "uif:popover-open" | "uif:presence" | "uif:push-change" | "uif:push-error" | "uif:pwa-install" | "uif:rad-before" | "uif:rad-error" | "uif:rad-success" | "uif:realtime-error" | "uif:realtime-message" | "uif:realtime-state" | "uif:rehydrate" | "uif:request" | "uif:response" | "uif:route-before" | "uif:route-error" | "uif:route-success" | "uif:router-error" | "uif:segment-change" | "uif:select" | "uif:shell-density" | "uif:table-before-load" | "uif:table-bulk-action" | "uif:table-error" | "uif:table-filter" | "uif:table-load" | "uif:table-loaded" | "uif:table-page" | "uif:table-page-size" | "uif:table-reset" | "uif:table-row-action" | "uif:table-select" | "uif:table-selection" | "uif:table-sort" | "uif:table-state" | "uif:tabs-change" | "uif:toast" | "uif:tool-confirmation-required" | "uif:typed-text-complete" | "uif:wizard-change">[];
    errors: readonly UIFContractEntry<"UIF_INVALID_ACCENT" | "UIF_UNSAFE_PROPERTY_PATH" | "UIF_UNSAFE_OBJECT" | "UIF_COMPONENT_DESTROY" | "UIF_COMPONENT_DUPLICATE" | "UIF_COMPONENT_MOUNT" | "UIF_COMPONENT_NAME" | "UIF_LOCALE_CONFIG" | "UIF_STORAGE_KEY" | "UIF_STORAGE_PARTITION">[];
}>;
type UIFAttribute = (typeof uifAttributes)[number];
type UIFValue = (typeof uifValues)[number];
type UIFAction = (typeof uifActions)[number];
type UIFState = (typeof uifStates)[number];
type UIFEvent = (typeof uifEvents)[number];
type UIFErrorCode = (typeof uifErrors)[number];

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

type UIFHydrationScope = 'root' | 'target' | 'refresh';
interface UIFHydrationAdapter {
    name: string;
    scope: UIFHydrationScope;
    hydrate(root: Document | HTMLElement): void | (() => void);
}
interface UIFHydrationLifecycle {
    refresh(target?: Document | HTMLElement): void;
    destroy(): void;
}
declare function createHydrationLifecycle(root: Document | HTMLElement, adapters: readonly UIFHydrationAdapter[]): UIFHydrationLifecycle;

interface UIFStoragePartition {
    applicationId: string;
    principalId: string;
    tenantId?: string;
}
declare function configureStoragePartition(partition: UIFStoragePartition | null): void;
declare function getStoragePartition(): Readonly<UIFStoragePartition> | null;
declare function getStoragePartitionPrefix(partition?: Readonly<UIFStoragePartition> | null): string | null;
declare function partitionStorageKey(key: string, partition?: Readonly<UIFStoragePartition> | null): string;
declare function clearStoragePartition(storage?: Storage, partition?: Readonly<UIFStoragePartition> | null): number;

interface UIFLocaleOptions {
    locales?: string | readonly string[];
    timeZone?: string;
    currency?: string;
    messages?: Readonly<Record<string, string>>;
}
type UIFTextDirection = 'ltr' | 'rtl';
interface UIFLocaleConfiguration {
    locales: readonly string[];
    timeZone?: string;
    currency?: string;
    messages: Readonly<Record<string, string>>;
}
declare function configureLocale(options: UIFLocaleOptions | null): void;
declare function getLocaleConfiguration(): Readonly<UIFLocaleConfiguration>;
declare function getLocaleDirection(locale?: string): UIFTextDirection;
declare function applyLocale(target?: HTMLElement): void;
declare function formatUIFNumber(value: number, options?: Intl.NumberFormatOptions): string;
declare function formatUIFCurrency(value: number, currency?: string | undefined): string;
declare function formatUIFDate(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
declare function translateUIFMessage(key: string, fallback?: string, values?: Readonly<Record<string, string | number>>): string;

type UIFComponentContract = Omit<UIFComponentDefinition, 'mount' | 'defaults' | 'optionKeys' | 'limits'> & {
    name: UIFValue;
    version: 3;
    package: string;
    semanticFallback: string;
};
declare const uifComponentContracts: Readonly<{
    button: Readonly<UIFComponentContract>;
    modal: Readonly<UIFComponentContract>;
    drawer: Readonly<UIFComponentContract>;
    offcanvas: Readonly<UIFComponentContract>;
    dropdown: Readonly<UIFComponentContract>;
    tabs: Readonly<UIFComponentContract>;
    toast: Readonly<UIFComponentContract>;
    accordion: Readonly<UIFComponentContract>;
    alert: Readonly<UIFComponentContract>;
    badge: Readonly<UIFComponentContract>;
    breadcrumb: Readonly<UIFComponentContract>;
    collapse: Readonly<UIFComponentContract>;
    tooltip: Readonly<UIFComponentContract>;
    popover: Readonly<UIFComponentContract>;
    progress: Readonly<UIFComponentContract>;
    spinner: Readonly<UIFComponentContract>;
    skeleton: Readonly<UIFComponentContract>;
    pagination: Readonly<UIFComponentContract>;
    'command-menu': Readonly<UIFComponentContract>;
    navbar: Readonly<UIFComponentContract>;
    sidebar: Readonly<UIFComponentContract>;
    shell: Readonly<UIFComponentContract>;
    stepper: Readonly<UIFComponentContract>;
    wizard: Readonly<UIFComponentContract>;
    'file-upload': Readonly<UIFComponentContract>;
    combobox: Readonly<UIFComponentContract>;
    carousel: Readonly<UIFComponentContract>;
    lightbox: Readonly<UIFComponentContract>;
    masonry: Readonly<UIFComponentContract>;
    card: Readonly<UIFComponentContract>;
    nav: Readonly<UIFComponentContract>;
    table: Readonly<UIFComponentContract>;
    form: Readonly<UIFComponentContract>;
    editor: Readonly<UIFComponentContract>;
    ajax: Readonly<UIFComponentContract>;
    route: Readonly<UIFComponentContract>;
    animate: Readonly<UIFComponentContract>;
    'typed-text': Readonly<UIFComponentContract>;
    chart: Readonly<UIFComponentContract>;
    dashboard: Readonly<UIFComponentContract>;
    'desktop-shell': Readonly<UIFComponentContract>;
    realtime: Readonly<UIFComponentContract>;
    push: Readonly<UIFComponentContract>;
    'mobile-shell': Readonly<UIFComponentContract>;
    'ai-action': Readonly<UIFComponentContract>;
    'ai-thread': Readonly<UIFComponentContract>;
    'ai-composer': Readonly<UIFComponentContract>;
    'tool-approval': Readonly<UIFComponentContract>;
    'agent-tool': Readonly<UIFComponentContract>;
    'install-prompt': Readonly<UIFComponentContract>;
}>;
declare function getUIFComponentContract(name: string): Readonly<UIFComponentContract> | undefined;

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

export { type AgentActor, type AgentActorRole, type AgentArtifactPart, type AgentContentPart, type AgentDataPart, type AgentEnvelopeIssue, type AgentEnvelopeKind, type AgentEnvelopeResult, type AgentEnvelopeStatus, type AgentInteractionEnvelope, type AgentRiskDisclosure, type AgentRiskLevel, type AgentSourcePart, type AgentTextPart, type AgentUsageDisclosure, type MicroAppConnectorManifest, type MicroAppConnectorMode, type MicroAppConnectorType, type MicroAppConnectorWorkflow, type MicroAppLocalStore, type MicroAppManifest, type MicroAppManifestIssue, type MicroAppManifestResult, type MicroAppPermissionsManifest, type MicroAppRealtimeManifest, type MicroAppRealtimeTransport, type MicroAppStorageManifest, type MicroAppStorageMode, type UIFAction, type UIFApp, type UIFAttribute, type UIFCompatibilityMode, type UIFCompatibilityOptions, type UIFComponent, type UIFComponentContract, type UIFComponentDefinition, type UIFComponentRegistry, type UIFConfigurationIssue, type UIFConfigurationOptions, type UIFConfigurationResult, type UIFContractEntry, type UIFController, type UIFDiagnostic, type UIFDiagnosticDurationBucket, type UIFDiagnosticInput, type UIFDiagnosticsOptions, UIFError, type UIFErrorCategory, type UIFErrorCode, type UIFErrorDetail, type UIFEvent, type UIFHydrationAdapter, type UIFHydrationLifecycle, type UIFHydrationScope, type UIFJSONIssue, type UIFJSONParseOptions, type UIFJSONResult, type UIFJSONShape, type UIFLifecycleEvent, type UIFLocaleOptions, type UIFMountContext, type UIFObjectInspectionOptions, type UIFOptions, type UIFPlugin, type UIFResourceLimits, type UIFResourceScope, type UIFState, type UIFStoragePartition, type UIFTextDirection, type UIFUpdateReason, type UIFValue, agentContentPartTypes, agentEnvelopeContract, agentEnvelopeKinds, agentEnvelopeStatuses, applyLocale, assertSafeObject, assertSafePropertyPath, clearStoragePartition, configureCompatibility, configureDiagnostics, configureLocale, configureStoragePartition, createComponentRegistry, createHydrationLifecycle, createResourceScope, defaultUIFResourceLimits, diagnosticDurationBucket, emit, findUnsafeObjectPaths, formatUIFCurrency, formatUIFDate, formatUIFNumber, getCompatibilityMode, getLocaleConfiguration, getLocaleDirection, getStoragePartition, getStoragePartitionPrefix, getUIFComponentContract, init, isSafeObjectKey, isSafePropertyPath, listMicroAppConnectorWorkflows, on, parseAgentEnvelope, parseMicroAppManifest, parseOptions, parseUIFConfiguration, parseUIFJSON, partitionStorageKey, registerPlugin, reportDiagnostic, setAccent, setDensity, translateUIFMessage, uifActions, uifAttributes, uifComponentContracts, uifContractRegistry, uifErrors, uifEvents, uifStates, uifValues, validateAgentEnvelope, validateMicroAppConnectorWorkflows, validateMicroAppManifest };
