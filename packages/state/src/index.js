function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  const leaf = parts.pop();
  let ref = obj;
  for (const p of parts) {
    if (typeof ref[p] !== 'object' || !ref[p]) ref[p] = {};
    ref = ref[p];
  }
  ref[leaf] = value;
}

export function createStore(initialState) {
  const state = structuredClone(initialState);
  const subscribers = new Map();
  const notify = (path) => {
    subscribers.get(path)?.forEach((fn) => fn(getByPath(state, path)));
    subscribers.get('*')?.forEach((fn) => fn(state));
  };

  return {
    get(path) { return path ? getByPath(state, path) : state; },
    set(path, value) { setByPath(state, path, value); notify(path); },
    subscribe(pathOrHandler, handler) {
      const path = typeof pathOrHandler === 'string' ? pathOrHandler : '*';
      const cb = typeof pathOrHandler === 'string' ? handler : pathOrHandler;
      if (!cb) return () => {};
      if (!subscribers.has(path)) subscribers.set(path, new Set());
      subscribers.get(path).add(cb);
      return () => subscribers.get(path)?.delete(cb);
    },
    bind(root = document) {
      root.querySelectorAll('[data-uif-model]').forEach((el) => {
        const path = el.dataset.uifModel;
        el.addEventListener('input', () => this.set(path, el.value));
      });
      root.querySelectorAll('[data-uif-bind]').forEach((el) => {
        const path = el.dataset.uifBind;
        this.subscribe(path, (v) => { el.textContent = String(v ?? ''); });
        el.textContent = String(this.get(path) ?? '');
      });
    },
  };
}
