import {
  isSafeObjectKey,
  parseUIFConfiguration,
  UIFError,
} from './contracts.js';
import { getCompatibilityMode } from './compatibility.js';

export type UIFOptions = Record<string, unknown>;
export * from './agent.js';
export * from './attributes.js';
export * from './component-registry.js';
export * from './hydration-lifecycle.js';
export * from './component-contracts.js';
export * from './compatibility.js';
export * from './contracts.js';
export * from './diagnostics.js';
export * from './micro-app.js';

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
    JSON.parse(raw);
    const result = parseUIFConfiguration(raw);
    if (!result.valid) emit('uif:runtime:diagnostic', { component: el.dataset.uif, issues: result.issues }, el);
    return result.value;
  } catch {
    const compatibilityMode = getCompatibilityMode();
    emit('uif:runtime:diagnostic', {
      component: el.dataset.uif,
      issues: [{
        path: 'data-uif-options',
        code: compatibilityMode === 'v3' ? 'legacy-options-rejected' : 'legacy-options',
        message: compatibilityMode === 'v3'
          ? 'Legacy semicolon options are rejected in v3 mode; use a JSON object.'
          : 'Legacy semicolon options are deprecated; migrate to a JSON object before v3.',
      }],
    }, el);
    if (compatibilityMode === 'v3') return {};
    return raw.split(';').reduce<UIFOptions>((acc, pair) => {
      const [key, ...rest] = pair.split(':');
      const name = key?.trim();
      if (!name || !isSafeObjectKey(name)) {
        if (name) emit('uif:runtime:diagnostic', { component: el.dataset.uif, issues: [{ path: name, code: 'unsafe-key', message: `Unsafe option key: ${name}` }] }, el);
        return acc;
      }
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
