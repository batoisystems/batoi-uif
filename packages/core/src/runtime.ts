import {
  parseUIFConfiguration,
  UIFError,
} from './contracts.js';

export type UIFOptions = Record<string, unknown>;

export interface UIFApp {
  root: Document | HTMLElement;
  options: UIFOptions;
  destroyed: boolean;
  destroy(): void;
  restart(options?: UIFOptions): UIFApp;
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
const apps = new WeakMap<Document | HTMLElement, UIFApp>();

/** Strict, bounded configuration without changing another app's legacy mode. */
export function parseOptions(el: HTMLElement): UIFOptions {
  const raw = el.getAttribute('data-uif-options');
  if (!raw) return {};
  const result = parseUIFConfiguration(raw);
  if (!result.valid) emit('uif:runtime:diagnostic', { component: el.dataset.uif, issues: result.issues }, el);
  return result.valid ? result.value : {};
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

export function setDensity(density: 'compact' | 'default' | 'roomy', target: HTMLElement = document.documentElement): void {
  target.dataset.uifDensity = density;
}

export function setAccent(color: string, target: HTMLElement = document.documentElement): void {
  const value = color.trim();
  const supported = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    ? CSS.supports('color', value)
    : (() => {
        const probe = document.createElement('span');
        probe.style.color = value;
        return Boolean(probe.style.color);
      })();
  if (!supported) {
    throw new UIFError('Batoi UIF refused an invalid accent color', {
      code: 'UIF_INVALID_ACCENT',
      category: 'security',
      package: 'core',
      phase: 'theme',
      recoverable: true,
    });
  }
  target.style.setProperty('--uif-accent', value);
  target.style.setProperty('--uif-color-primary', value);
}

export function init(root: Document | HTMLElement = document, options: UIFOptions = {}): UIFApp {
  const existing = apps.get(root);
  if (existing && !existing.destroyed) return existing;

  emit('uif:before-init', { root, options }, root);
  const app: UIFApp = {
    root,
    options,
    destroyed: false,
    destroy() {
      if (app.destroyed) return;
      emit('uif:before-destroy', { root }, root);
      app.destroyed = true;
      apps.delete(root);
      emit('uif:destroy', { root }, root);
    },
    restart(nextOptions: UIFOptions = options) {
      app.destroy();
      return init(root, nextOptions);
    },
  };
  apps.set(root, app);

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
