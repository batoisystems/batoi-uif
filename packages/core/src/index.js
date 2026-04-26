const plugins = new Map();

export function parseOptions(el) {
  const raw = el.getAttribute('data-uif-options');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return raw.split(';').reduce((acc, pair) => {
      const [k, v] = pair.split(':').map((s) => s.trim());
      if (k) acc[k] = v ?? true;
      return acc;
    }, {});
  }
}

export function emit(name, detail, target) {
  (target ?? document).dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

export function on(name, handler) {
  document.addEventListener(name, handler);
  return () => document.removeEventListener(name, handler);
}

export function registerPlugin(plugin) {
  plugins.set(plugin.name, plugin);
}

export function init(root = document, options = {}) {
  emit('uif:before-init', { root, options }, root);
  const app = {
    root,
    options,
    destroy() {
      emit('uif:before-destroy', { root }, root);
      emit('uif:destroy', { root }, root);
    },
  };
  for (const plugin of plugins.values()) plugin.setup(app);
  emit('uif:init', { root, options }, root);
  return app;
}
