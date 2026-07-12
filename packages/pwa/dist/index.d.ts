interface OfflineTaskOptions {
    idempotent: true;
    key?: string;
    maxAttempts?: number;
}
interface ServiceWorkerOptions {
    scope?: string;
    updateViaCache?: ServiceWorkerUpdateViaCache;
}
declare function registerServiceWorker(path?: string, options?: ServiceWorkerOptions): Promise<ServiceWorkerRegistration | undefined>;
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
declare function isCacheableRequest(request: Request): boolean;
declare function isCacheableResponse(response: Response): boolean;
declare function queueOfflineTask(task: () => Promise<void>, options: OfflineTaskOptions): void;
declare function flushOfflineQueue(): Promise<void>;
declare function initOfflineQueue(): () => void;
declare function onAppUpdate(handler: (registration: ServiceWorkerRegistration) => void): () => void;
declare function initInstallPrompt(el: HTMLElement): () => void;

export { type OfflineTaskOptions, type ServiceWorkerOptions, cacheStrategies, createCacheStrategy, flushOfflineQueue, initInstallPrompt, initOfflineQueue, isCacheableRequest, isCacheableResponse, onAppUpdate, onNetworkChange, onOffline, onOnline, queueOfflineTask, registerServiceWorker, setupInstallPrompt, unregisterServiceWorker };
