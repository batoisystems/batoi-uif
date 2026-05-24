type State = Record<string, unknown>;
type Subscriber = (value: unknown) => void;
type Computed = (state: State) => unknown;
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

export { type ArtifactStoreOptions, type MicroAppStoreOptions, type StoreOptions, createAdvancedStore, createArtifactStore, createMicroAppStore, createStore };
