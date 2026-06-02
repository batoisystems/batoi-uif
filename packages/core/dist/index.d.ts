declare const uifAttributes: readonly ["data-uif", "data-uif-id", "data-uif-role", "data-uif-action", "data-uif-target", "data-uif-src", "data-uif-method", "data-uif-trigger", "data-uif-state", "data-uif-bind", "data-uif-model", "data-uif-value", "data-uif-route", "data-uif-mode", "data-uif-options", "data-uif-confirm", "data-uif-disabled", "data-uif-loading", "data-uif-success", "data-uif-error", "data-uif-swap", "data-uif-cache", "data-uif-validate", "data-uif-rule", "data-uif-event", "data-uif-on", "data-uif-refresh", "data-uif-persist", "data-uif-toolbar", "data-uif-preview", "data-uif-animation", "data-uif-duration", "data-uif-delay", "data-uif-placement", "data-uif-container", "data-uif-html", "data-uif-backdrop", "data-uif-scroll", "data-uif-breakpoint", "data-uif-class", "data-uif-attribute", "data-uif-key"];
declare const uifValues: readonly ["button", "modal", "drawer", "offcanvas", "dropdown", "tabs", "toast", "accordion", "tooltip", "popover", "table", "form", "editor", "ajax", "route", "shell", "nav", "chart", "animate", "realtime", "push", "mobile-shell", "ai-action", "tool-approval"];
declare const uifActions: readonly ["open", "close", "toggle", "submit", "load", "reload", "delete", "save", "reset", "clear", "select", "activate", "deactivate", "navigate", "swap", "append", "prepend", "remove", "toast", "animate", "add-class", "remove-class", "toggle-class", "set-attribute", "remove-attribute", "set-value", "copy", "scroll-to", "focus", "emit", "subscribe", "connect", "disconnect", "approve", "reject"];
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

export { type MicroAppConnectorManifest, type MicroAppConnectorMode, type MicroAppConnectorType, type MicroAppLocalStore, type MicroAppManifest, type MicroAppManifestIssue, type MicroAppManifestResult, type MicroAppPermissionsManifest, type MicroAppRealtimeManifest, type MicroAppRealtimeTransport, type MicroAppStorageManifest, type MicroAppStorageMode, type UIFAction, type UIFApp, type UIFAttribute, type UIFComponent, type UIFLifecycleEvent, type UIFOptions, type UIFPlugin, type UIFState, type UIFValue, emit, init, on, parseMicroAppManifest, parseOptions, registerPlugin, setAccent, setDensity, uifActions, uifAttributes, uifStates, uifValues, validateMicroAppManifest };
