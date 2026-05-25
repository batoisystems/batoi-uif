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

export { type ExtensionManifestOptions, type ExtensionMessage, type ExtensionSurface, createExtensionManifest, createExtensionMessage, isExtensionRuntime };
