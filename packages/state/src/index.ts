type State = Record<string, unknown>;
type Subscriber = (value: unknown) => void;
type Computed = (state: State) => unknown;

export interface StoreOptions {
  immutable?: boolean;
  persist?: 'local' | 'session';
  key?: string;
  computed?: Record<string, Computed>;
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
    subscribers.get('*')?.forEach((fn) => fn(state));
  };
  const nextState = (): State => (options.immutable ? structuredClone(state) : state);

  return {
    get(path?: string): unknown {
      if (path && options.computed?.[path]) return options.computed[path](state);
      return path ? getByPath(state, path) : state;
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
}
