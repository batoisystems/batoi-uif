type State = Record<string, unknown>;
type Subscriber = (value: unknown) => void;
type Computed = (state: State) => unknown;
type SyncStatus = 'queued' | 'syncing' | 'synced' | 'failed';

export interface StoreOptions {
  immutable?: boolean;
  persist?: 'local' | 'session';
  key?: string;
  computed?: Record<string, Computed>;
}

export interface MicroAppStoreOptions extends StoreOptions {
  historyLimit?: number;
}

export type ArtifactStoreOptions = MicroAppStoreOptions;

export interface LocalStoreOptions {
  namespace?: string;
  driver?: 'localstorage' | 'memory';
}

export interface LocalStore {
  namespace: string;
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list<T = unknown>(): Promise<Array<{ key: string; value: T }>>;
  clear(): Promise<void>;
  exportJSON(space?: number): Promise<string>;
  importJSON(json: string): Promise<void>;
}

export interface SyncQueueItem<T = unknown> {
  id: string;
  action: string;
  payload: T;
  status: SyncStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

export interface SyncQueue<T = unknown> {
  enqueue(action: string, payload: T, id?: string): Promise<SyncQueueItem<T>>;
  list(status?: SyncStatus): Promise<SyncQueueItem<T>[]>;
  update(id: string, patch: Partial<Omit<SyncQueueItem<T>, 'id' | 'createdAt'>>): Promise<SyncQueueItem<T>>;
  remove(id: string): Promise<void>;
  clear(status?: SyncStatus): Promise<void>;
  exportJSON(space?: number): Promise<string>;
  importJSON(json: string): Promise<void>;
}

function getByPath(obj: State, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as State)[part];
    return undefined;
  }, obj);
}

function setByPath(obj: State, path: string, value: unknown): void {
  const parts = path.split('.');
  const leaf = parts.pop();
  if (!leaf) return;
  let ref: State = obj;
  for (const part of parts) {
    if (typeof ref[part] !== 'object' || ref[part] === null) ref[part] = {};
    ref = ref[part] as State;
  }
  ref[leaf] = value;
}

export function createStore<T extends State>(initialState: T) {
  return createAdvancedStore(initialState);
}

export function createAdvancedStore<T extends State>(initialState: T, options: StoreOptions = {}) {
  const storage =
    options.persist === 'local' ? window.localStorage : options.persist === 'session' ? window.sessionStorage : undefined;
  const persisted = storage && options.key ? storage.getItem(options.key) : null;
  let state = (persisted ? JSON.parse(persisted) : structuredClone(initialState)) as State;
  const subscribers = new Map<string, Set<Subscriber>>();
  const notify = (path: string) => {
    if (storage && options.key) storage.setItem(options.key, JSON.stringify(state));
    subscribers.get(path)?.forEach((fn) => fn(getByPath(state, path)));
    if (path !== '*') subscribers.get('*')?.forEach((fn) => fn(state));
  };
  const nextState = (): State => (options.immutable ? structuredClone(state) : state);

  const api = {
    get(path?: string): unknown {
      if (path && options.computed?.[path]) return options.computed[path](state);
      return path ? getByPath(state, path) : state;
    },
    replace(next: State): void {
      state = structuredClone(next);
      notify('*');
    },
    set(path: string, value: unknown): void {
      state = nextState();
      setByPath(state, path, value);
      notify(path);
    },
    update(path: string, updater: (value: unknown) => unknown): void {
      this.set(path, updater(getByPath(state, path)));
    },
    push(path: string, value: unknown): void {
      const list = getByPath(state, path);
      this.set(path, [...(Array.isArray(list) ? list : []), value]);
    },
    removeAt(path: string, index: number): void {
      const list = getByPath(state, path);
      if (!Array.isArray(list)) return;
      this.set(
        path,
        list.filter((_, i) => i !== index),
      );
    },
    subscribe(pathOrHandler: string | Subscriber, handler?: Subscriber): () => void {
      const path = typeof pathOrHandler === 'string' ? pathOrHandler : '*';
      const cb = typeof pathOrHandler === 'string' ? handler : pathOrHandler;
      if (!cb) return () => undefined;
      if (!subscribers.has(path)) subscribers.set(path, new Set());
      subscribers.get(path)?.add(cb);
      return () => subscribers.get(path)?.delete(cb);
    },
    bind(root: ParentNode = document): void {
      root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-uif-model]').forEach((el) => {
        const path = el.dataset.uifModel;
        if (!path) return;
        el.addEventListener('input', () => this.set(path, el.value));
      });
      root.querySelectorAll<HTMLElement>('[data-uif-bind]').forEach((el) => {
        const path = el.dataset.uifBind;
        if (!path) return;
        this.subscribe(path, (value) => {
          el.textContent = String(value ?? '');
        });
        el.textContent = String(this.get(path) ?? '');
      });
    },
    destroy(): void {
      subscribers.clear();
    },
  };
  return api;
}

export function createMicroAppStore<T extends State>(initialState: T, options: MicroAppStoreOptions = {}) {
  const base = createAdvancedStore(initialState, { ...options, immutable: true });
  const historyLimit = Math.max(1, options.historyLimit ?? 50);
  const past: State[] = [];
  const future: State[] = [];
  const snapshot = () => structuredClone(base.get() as State);
  const remember = () => {
    past.push(snapshot());
    if (past.length > historyLimit) past.shift();
    future.length = 0;
  };

  return {
    ...base,
    set(path: string, value: unknown): void {
      remember();
      base.set(path, value);
    },
    update(path: string, updater: (value: unknown) => unknown): void {
      remember();
      base.set(path, updater(base.get(path)));
    },
    push(path: string, value: unknown): void {
      remember();
      base.push(path, value);
    },
    removeAt(path: string, index: number): void {
      remember();
      base.removeAt(path, index);
    },
    reset(): void {
      remember();
      base.replace(structuredClone(initialState));
    },
    exportJSON(space = 2): string {
      return JSON.stringify(base.get(), null, space);
    },
    importJSON(json: string): void {
      const parsed = JSON.parse(json) as State;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Micro App state must be a JSON object');
      remember();
      base.replace(parsed);
    },
    canUndo(): boolean {
      return past.length > 0;
    },
    canRedo(): boolean {
      return future.length > 0;
    },
    undo(): boolean {
      const previous = past.pop();
      if (!previous) return false;
      future.push(snapshot());
      base.replace(previous);
      return true;
    },
    redo(): boolean {
      const next = future.pop();
      if (!next) return false;
      past.push(snapshot());
      base.replace(next);
      return true;
    },
  };
}

export function createArtifactStore<T extends State>(initialState: T, options: ArtifactStoreOptions = {}) {
  return createMicroAppStore(initialState, options);
}

function makeScopedKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

function stripScope(namespace: string, key: string): string {
  return key.startsWith(`${namespace}:`) ? key.slice(namespace.length + 1) : key;
}

function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

export function createLocalStore(options: LocalStoreOptions = {}): LocalStore {
  const namespace = options.namespace || 'uif';
  const storage = options.driver === 'memory' ? makeMemoryStorage() : window.localStorage;

  const api: LocalStore = {
    namespace,
    async get<T = unknown>(key: string): Promise<T | undefined> {
      const raw = storage.getItem(makeScopedKey(namespace, key));
      return raw === null ? undefined : (JSON.parse(raw) as T);
    },
    async set<T = unknown>(key: string, value: T): Promise<void> {
      storage.setItem(makeScopedKey(namespace, key), JSON.stringify(value));
    },
    async delete(key: string): Promise<void> {
      storage.removeItem(makeScopedKey(namespace, key));
    },
    async list<T = unknown>(): Promise<Array<{ key: string; value: T }>> {
      const items: Array<{ key: string; value: T }> = [];
      for (let index = 0; index < storage.length; index += 1) {
        const scopedKey = storage.key(index);
        if (!scopedKey?.startsWith(`${namespace}:`)) continue;
        const raw = storage.getItem(scopedKey);
        if (raw === null) continue;
        items.push({ key: stripScope(namespace, scopedKey), value: JSON.parse(raw) as T });
      }
      return items;
    },
    async clear(): Promise<void> {
      const keys = await api.list();
      keys.forEach((item) => storage.removeItem(makeScopedKey(namespace, item.key)));
    },
    async exportJSON(space = 2): Promise<string> {
      const entries = await api.list();
      return JSON.stringify(
        entries.reduce<Record<string, unknown>>((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {}),
        null,
        space,
      );
    },
    async importJSON(json: string): Promise<void> {
      const parsed = JSON.parse(json) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Local store import must be a JSON object');
      await api.clear();
      await Promise.all(Object.entries(parsed).map(([key, value]) => api.set(key, value)));
    },
  };

  return api;
}

function id(prefix = 'sync'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSyncQueue<T = unknown>(store: LocalStore, key = 'sync-queue'): SyncQueue<T> {
  const read = async (): Promise<SyncQueueItem<T>[]> => (await store.get<SyncQueueItem<T>[]>(key)) ?? [];
  const write = (items: SyncQueueItem<T>[]) => store.set(key, items);
  return {
    async enqueue(action: string, payload: T, itemId = id()): Promise<SyncQueueItem<T>> {
      const now = new Date().toISOString();
      const item: SyncQueueItem<T> = { id: itemId, action, payload, status: 'queued', attempts: 0, createdAt: now, updatedAt: now };
      await write([...(await read()), item]);
      return item;
    },
    async list(status?: SyncStatus): Promise<SyncQueueItem<T>[]> {
      const items = await read();
      return status ? items.filter((item) => item.status === status) : items;
    },
    async update(itemId: string, patch: Partial<Omit<SyncQueueItem<T>, 'id' | 'createdAt'>>): Promise<SyncQueueItem<T>> {
      const items = await read();
      const index = items.findIndex((item) => item.id === itemId);
      if (index < 0) throw new Error(`Sync queue item not found: ${itemId}`);
      const next = { ...items[index], ...patch, updatedAt: new Date().toISOString() };
      items[index] = next;
      await write(items);
      return next;
    },
    async remove(itemId: string): Promise<void> {
      await write((await read()).filter((item) => item.id !== itemId));
    },
    async clear(status?: SyncStatus): Promise<void> {
      await write(status ? (await read()).filter((item) => item.status !== status) : []);
    },
    async exportJSON(space = 2): Promise<string> {
      return JSON.stringify(await read(), null, space);
    },
    async importJSON(json: string): Promise<void> {
      const parsed = JSON.parse(json) as unknown;
      if (!Array.isArray(parsed)) throw new Error('Sync queue import must be a JSON array');
      await write(parsed as SyncQueueItem<T>[]);
    },
  };
}
