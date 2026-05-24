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

export { cacheStrategies, createCacheStrategy, flushOfflineQueue, initInstallPrompt, initOfflineQueue, onAppUpdate, onNetworkChange, onOffline, onOnline, queueOfflineTask, registerServiceWorker, setupInstallPrompt, unregisterServiceWorker };
