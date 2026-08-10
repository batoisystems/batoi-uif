import { emit } from './index.js';
import { parseUIFConfiguration, UIFError, type UIFErrorDetail, type UIFResourceLimits } from './contracts.js';
import { createResourceScope, type UIFResourceScope } from './resource-scope.js';

export interface UIFController {
  update?(reason: UIFUpdateReason): void | Promise<void>;
  suspend?(): void;
  resume?(): void;
  destroy(): void;
}

export type UIFUpdateReason = 'refresh' | 'attribute' | 'content' | 'rehydrate';

export interface UIFMountContext<Options extends Record<string, unknown>> {
  element: HTMLElement;
  root: Document | HTMLElement;
  options: Readonly<Options>;
  signal: AbortSignal;
  resources: UIFResourceScope;
  emit<T = unknown>(name: string, detail?: T): void;
  error(message: string, detail: Omit<UIFErrorDetail, 'package' | 'component'>): UIFError;
}

export interface UIFComponentDefinition<
  Options extends Record<string, unknown> = Record<string, unknown>,
  Controller extends UIFController = UIFController,
> {
  name: string;
  version?: number;
  package?: string;
  defaults?: Readonly<Partial<Options>>;
  optionKeys?: readonly (keyof Options & string)[];
  attributes?: readonly string[];
  roles?: readonly string[];
  actions?: readonly string[];
  events?: readonly string[];
  states?: readonly string[];
  errors?: readonly string[];
  semanticFallback?: string;
  accessibility?: readonly string[];
  security?: readonly string[];
  limits?: UIFResourceLimits;
  mount(context: UIFMountContext<Options>): Controller | (() => void) | void;
}

export interface UIFComponentRegistry {
  register(definition: UIFComponentDefinition): () => void;
  get(name: string): UIFComponentDefinition | undefined;
  definitions(): UIFComponentDefinition[];
  refresh(root?: Document | HTMLElement, reason?: UIFUpdateReason): void;
  suspend(root?: Document | HTMLElement): void;
  resume(root?: Document | HTMLElement): void;
  destroy(root?: Document | HTMLElement): void;
}

interface MountedComponent {
  controller: UIFController;
  resources: UIFResourceScope;
}

const componentNamePattern = /^[a-z][a-z0-9-]*$/;

function elementsFor(root: Document | HTMLElement): HTMLElement[] {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-uif]'));
  if (root instanceof HTMLElement && root.hasAttribute('data-uif')) elements.unshift(root);
  return elements;
}

function normalizeController(value: UIFController | (() => void) | void): UIFController {
  if (typeof value === 'function') return { destroy: value };
  return value ?? { destroy: () => undefined };
}

export function createComponentRegistry(): UIFComponentRegistry {
  const definitions = new Map<string, UIFComponentDefinition>();
  const mounted = new WeakMap<HTMLElement, Map<string, MountedComponent>>();
  const ownedElements = new Set<HTMLElement>();

  const destroyMounted = (element: HTMLElement, name?: string): void => {
    const entries = mounted.get(element);
    if (!entries) return;
    const targets = name ? [[name, entries.get(name)] as const] : Array.from(entries.entries());
    targets.forEach(([componentName, entry]) => {
      if (!entry) return;
      entry.resources.destroy();
      try {
        entry.controller.destroy();
      } catch (cause) {
        emit('uif:runtime:error', {
          code: 'UIF_COMPONENT_DESTROY',
          category: 'internal',
          package: 'core',
          component: componentName,
          phase: 'destroy',
          recoverable: true,
          cause,
        }, element);
      }
      entries.delete(componentName);
    });
    if (!entries.size) {
      mounted.delete(element);
      ownedElements.delete(element);
    }
  };

  const api: UIFComponentRegistry = {
    register(definition) {
      if (!componentNamePattern.test(definition.name)) {
        throw new UIFError(`Invalid UIF component name: ${definition.name}`, {
          code: 'UIF_COMPONENT_NAME',
          category: 'config',
          package: 'core',
          component: definition.name,
          phase: 'registration',
          recoverable: false,
        });
      }
      if (definitions.has(definition.name)) {
        throw new UIFError(`UIF component is already registered: ${definition.name}`, {
          code: 'UIF_COMPONENT_DUPLICATE',
          category: 'config',
          package: 'core',
          component: definition.name,
          phase: 'registration',
          recoverable: false,
        });
      }
      definitions.set(definition.name, Object.freeze({ ...definition }));
      return () => {
        definitions.delete(definition.name);
        Array.from(ownedElements).forEach((element) => destroyMounted(element, definition.name));
      };
    },
    get(name) {
      return definitions.get(name);
    },
    definitions() {
      return Array.from(definitions.values()).sort((a, b) => a.name.localeCompare(b.name));
    },
    refresh(root = document, reason = 'refresh') {
      elementsFor(root).forEach((element) => {
        const name = element.dataset.uif;
        const definition = name ? definitions.get(name) : undefined;
        if (!name || !definition) return;
        const entries = mounted.get(element) ?? new Map<string, MountedComponent>();
        const existing = entries.get(name);
        if (existing) {
          void existing.controller.update?.(reason);
          return;
        }

        const parsed = parseUIFConfiguration(element.dataset.uifOptions ?? '{}', {
          allowedKeys: definition.optionKeys,
          allowUnknown: definition.optionKeys === undefined,
          limits: definition.limits,
        });
        if (!parsed.valid) {
          emit('uif:runtime:diagnostic', { component: name, issues: parsed.issues }, element);
        }
        const options = Object.freeze({ ...(definition.defaults ?? {}), ...parsed.value });
        const resources = createResourceScope();
        try {
          const controller = normalizeController(definition.mount({
            element,
            root,
            options,
            signal: resources.signal,
            resources,
            emit: (eventName, detail) => emit(eventName, detail, element),
            error: (message, detail) => new UIFError(message, { ...detail, package: 'core', component: name }),
          }));
          entries.set(name, { controller, resources });
          mounted.set(element, entries);
          ownedElements.add(element);
          emit('uif:runtime:mounted', { component: name, version: definition.version ?? 3 }, element);
        } catch (cause) {
          resources.destroy();
          emit('uif:runtime:error', {
            code: 'UIF_COMPONENT_MOUNT',
            category: 'internal',
            package: 'core',
            component: name,
            phase: 'mount',
            recoverable: true,
            cause,
          }, element);
        }
      });
    },
    suspend(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root !== document && root !== element && !root.contains(element)) return;
        mounted.get(element)?.forEach((entry) => entry.controller.suspend?.());
      });
    },
    resume(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root !== document && root !== element && !root.contains(element)) return;
        mounted.get(element)?.forEach((entry) => entry.controller.resume?.());
      });
    },
    destroy(root = document) {
      Array.from(ownedElements).forEach((element) => {
        if (root === document || root === element || root.contains(element)) destroyMounted(element);
      });
    },
  };

  return api;
}
