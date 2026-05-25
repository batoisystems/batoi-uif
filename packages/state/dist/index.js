// src/index.ts
function getByPath(obj, path) {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") return acc[part];
    return void 0;
  }, obj);
}
function setByPath(obj, path, value) {
  const parts = path.split(".");
  const leaf = parts.pop();
  if (!leaf) return;
  let ref = obj;
  for (const part of parts) {
    if (typeof ref[part] !== "object" || ref[part] === null) ref[part] = {};
    ref = ref[part];
  }
  ref[leaf] = value;
}
function createStore(initialState) {
  return createAdvancedStore(initialState);
}
function createAdvancedStore(initialState, options = {}) {
  const storage = options.persist === "local" ? window.localStorage : options.persist === "session" ? window.sessionStorage : void 0;
  const persisted = storage && options.key ? storage.getItem(options.key) : null;
  let state = persisted ? JSON.parse(persisted) : structuredClone(initialState);
  const subscribers = /* @__PURE__ */ new Map();
  const notify = (path) => {
    if (storage && options.key) storage.setItem(options.key, JSON.stringify(state));
    subscribers.get(path)?.forEach((fn) => fn(getByPath(state, path)));
    if (path !== "*") subscribers.get("*")?.forEach((fn) => fn(state));
  };
  const nextState = () => options.immutable ? structuredClone(state) : state;
  const api = {
    get(path) {
      if (path && options.computed?.[path]) return options.computed[path](state);
      return path ? getByPath(state, path) : state;
    },
    replace(next) {
      state = structuredClone(next);
      notify("*");
    },
    set(path, value) {
      state = nextState();
      setByPath(state, path, value);
      notify(path);
    },
    update(path, updater) {
      this.set(path, updater(getByPath(state, path)));
    },
    push(path, value) {
      const list = getByPath(state, path);
      this.set(path, [...Array.isArray(list) ? list : [], value]);
    },
    removeAt(path, index) {
      const list = getByPath(state, path);
      if (!Array.isArray(list)) return;
      this.set(
        path,
        list.filter((_, i) => i !== index)
      );
    },
    subscribe(pathOrHandler, handler) {
      const path = typeof pathOrHandler === "string" ? pathOrHandler : "*";
      const cb = typeof pathOrHandler === "string" ? handler : pathOrHandler;
      if (!cb) return () => void 0;
      if (!subscribers.has(path)) subscribers.set(path, /* @__PURE__ */ new Set());
      subscribers.get(path)?.add(cb);
      return () => subscribers.get(path)?.delete(cb);
    },
    bind(root = document) {
      root.querySelectorAll("[data-uif-model]").forEach((el) => {
        const path = el.dataset.uifModel;
        if (!path) return;
        el.addEventListener("input", () => this.set(path, el.value));
      });
      root.querySelectorAll("[data-uif-bind]").forEach((el) => {
        const path = el.dataset.uifBind;
        if (!path) return;
        this.subscribe(path, (value) => {
          el.textContent = String(value ?? "");
        });
        el.textContent = String(this.get(path) ?? "");
      });
    },
    destroy() {
      subscribers.clear();
    }
  };
  return api;
}
function createMicroAppStore(initialState, options = {}) {
  const base = createAdvancedStore(initialState, { ...options, immutable: true });
  const historyLimit = Math.max(1, options.historyLimit ?? 50);
  const past = [];
  const future = [];
  const snapshot = () => structuredClone(base.get());
  const remember = () => {
    past.push(snapshot());
    if (past.length > historyLimit) past.shift();
    future.length = 0;
  };
  return {
    ...base,
    set(path, value) {
      remember();
      base.set(path, value);
    },
    update(path, updater) {
      remember();
      base.set(path, updater(base.get(path)));
    },
    push(path, value) {
      remember();
      base.push(path, value);
    },
    removeAt(path, index) {
      remember();
      base.removeAt(path, index);
    },
    reset() {
      remember();
      base.replace(structuredClone(initialState));
    },
    exportJSON(space = 2) {
      return JSON.stringify(base.get(), null, space);
    },
    importJSON(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Micro App state must be a JSON object");
      remember();
      base.replace(parsed);
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    undo() {
      const previous = past.pop();
      if (!previous) return false;
      future.push(snapshot());
      base.replace(previous);
      return true;
    },
    redo() {
      const next = future.pop();
      if (!next) return false;
      past.push(snapshot());
      base.replace(next);
      return true;
    }
  };
}
function createArtifactStore(initialState, options = {}) {
  return createMicroAppStore(initialState, options);
}
function makeScopedKey(namespace, key) {
  return `${namespace}:${key}`;
}
function stripScope(namespace, key) {
  return key.startsWith(`${namespace}:`) ? key.slice(namespace.length + 1) : key;
}
function makeMemoryStorage() {
  const map = /* @__PURE__ */ new Map();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    }
  };
}
function createLocalStore(options = {}) {
  const namespace = options.namespace || "uif";
  const storage = options.driver === "memory" ? makeMemoryStorage() : window.localStorage;
  const api = {
    namespace,
    async get(key) {
      const raw = storage.getItem(makeScopedKey(namespace, key));
      return raw === null ? void 0 : JSON.parse(raw);
    },
    async set(key, value) {
      storage.setItem(makeScopedKey(namespace, key), JSON.stringify(value));
    },
    async delete(key) {
      storage.removeItem(makeScopedKey(namespace, key));
    },
    async list() {
      const items = [];
      for (let index = 0; index < storage.length; index += 1) {
        const scopedKey = storage.key(index);
        if (!scopedKey?.startsWith(`${namespace}:`)) continue;
        const raw = storage.getItem(scopedKey);
        if (raw === null) continue;
        items.push({ key: stripScope(namespace, scopedKey), value: JSON.parse(raw) });
      }
      return items;
    },
    async clear() {
      const keys = await api.list();
      keys.forEach((item) => storage.removeItem(makeScopedKey(namespace, item.key)));
    },
    async exportJSON(space = 2) {
      const entries = await api.list();
      return JSON.stringify(
        entries.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {}),
        null,
        space
      );
    },
    async importJSON(json) {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Local store import must be a JSON object");
      await api.clear();
      await Promise.all(Object.entries(parsed).map(([key, value]) => api.set(key, value)));
    }
  };
  return api;
}
function id(prefix = "sync") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function createSyncQueue(store, key = "sync-queue") {
  const read = async () => await store.get(key) ?? [];
  const write = (items) => store.set(key, items);
  return {
    async enqueue(action, payload, itemId = id()) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const item = { id: itemId, action, payload, status: "queued", attempts: 0, createdAt: now, updatedAt: now };
      await write([...await read(), item]);
      return item;
    },
    async list(status) {
      const items = await read();
      return status ? items.filter((item) => item.status === status) : items;
    },
    async update(itemId, patch) {
      const items = await read();
      const index = items.findIndex((item) => item.id === itemId);
      if (index < 0) throw new Error(`Sync queue item not found: ${itemId}`);
      const next = { ...items[index], ...patch, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      items[index] = next;
      await write(items);
      return next;
    },
    async remove(itemId) {
      await write((await read()).filter((item) => item.id !== itemId));
    },
    async clear(status) {
      await write(status ? (await read()).filter((item) => item.status !== status) : []);
    },
    async exportJSON(space = 2) {
      return JSON.stringify(await read(), null, space);
    },
    async importJSON(json) {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Sync queue import must be a JSON array");
      await write(parsed);
    }
  };
}
export {
  createAdvancedStore,
  createArtifactStore,
  createLocalStore,
  createMicroAppStore,
  createStore,
  createSyncQueue
};
