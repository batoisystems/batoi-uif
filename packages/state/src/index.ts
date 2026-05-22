type State = Record<string, unknown>;
type Subscriber = (value: unknown) => void;

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
  const state = structuredClone(initialState) as State;
  const subscribers = new Map<string, Set<Subscriber>>();
  const notify = (path: string) => {
    subscribers.get(path)?.forEach((fn) => fn(getByPath(state, path)));
    subscribers.get('*')?.forEach((fn) => fn(state));
  };

  return {
    get(path?: string): unknown {
      return path ? getByPath(state, path) : state;
    },
    set(path: string, value: unknown): void {
      setByPath(state, path, value);
      notify(path);
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
  };
}
