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

export { type ArtifactStoreOptions, type LocalStore, type LocalStoreOptions, type MicroAppStoreOptions, type StoreOptions, type SyncQueue, type SyncQueueItem, createAdvancedStore, createArtifactStore, createLocalStore, createMicroAppStore, createStore, createSyncQueue };
