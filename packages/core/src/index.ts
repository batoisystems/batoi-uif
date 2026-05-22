export type UIFOptions = Record<string, unknown>;

export interface UIFApp {
  root: Document | HTMLElement;
  options: UIFOptions;
  destroy(): void;
}

export interface UIFPlugin {
  name: string;
  setup(app: UIFApp): void;
}

export interface UIFComponent {
  name: string;
  init(el: HTMLElement): void;
  destroy?(el: HTMLElement): void;
}

export interface UIFLifecycleEvent<T = unknown> extends CustomEvent<T> {
  type: 'uif:before-init' | 'uif:init' | 'uif:before-destroy' | 'uif:destroy' | 'uif:error';
}

const plugins = new Map<string, UIFPlugin>();

function coerceValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

export function parseOptions(el: HTMLElement): UIFOptions {
  const raw = el.getAttribute('data-uif-options');
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as UIFOptions) : {};
  } catch {
    return raw.split(';').reduce<UIFOptions>((acc, pair) => {
      const [key, ...rest] = pair.split(':');
      const name = key?.trim();
      if (!name) return acc;
      const value = rest.join(':').trim();
      acc[name] = value === '' ? true : coerceValue(value);
      return acc;
    }, {});
  }
}

export function emit<T = unknown>(name: string, detail?: T, target: EventTarget = document): void {
  target.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true }));
}

export function on(name: string, handler: EventListener, target: EventTarget = document): () => void {
  target.addEventListener(name, handler);
  return () => target.removeEventListener(name, handler);
}

export function registerPlugin(plugin: UIFPlugin): void {
  plugins.set(plugin.name, plugin);
}

export function init(root: Document | HTMLElement = document, options: UIFOptions = {}): UIFApp {
  emit('uif:before-init', { root, options }, root);
  const app: UIFApp = {
    root,
    options,
    destroy() {
      emit('uif:before-destroy', { root }, root);
      emit('uif:destroy', { root }, root);
    },
  };

  for (const plugin of plugins.values()) {
    try {
      plugin.setup(app);
    } catch (error) {
      emit('uif:error', { error, plugin: plugin.name }, root);
    }
  }

  emit('uif:init', { root, options }, root);
  return app;
}
