import { bindActions } from './packages/actions/src/index.js';
import {
  initAssistantThread,
  renderAIAction,
  renderAgentComposer,
} from './packages/ai/src/index.js';
import { bindChartExports, initChart } from './packages/charts/src/index.js';
import {
  bindComponentActions,
  destroyComponent,
  initComponent,
} from './packages/components/src/index.js';
import {
  createComponentRegistry,
  createHydrationLifecycle,
  getUIFComponentContract,
  type UIFComponentDefinition,
  type UIFController,
} from './packages/core/src/index.js';
import { initDashboard } from './packages/dashboard/src/index.js';
import { initDesktopShell } from './packages/desktop/src/index.js';
import { initAnimation, initTypedText } from './packages/effects/src/index.js';
import { initEditor } from './packages/editor/src/index.js';
import { initForm } from './packages/forms/src/index.js';
import { mountIcons } from './packages/icons/src/index.js';
import {
  initAgentToolEnvelope,
  renderToolApproval,
} from './packages/mcp/src/index.js';
import { initMobileShell } from './packages/mobile/src/index.js';
import { initInstallPrompt } from './packages/pwa/src/index.js';
import { initPush } from './packages/push/src/index.js';
import { bindRadActions } from './packages/rad-adapter/src/index.js';
import { initRealtime } from './packages/realtime/src/index.js';
import { initRouter } from './packages/router/src/index.js';
import { bindDeclarativeFilters, initTable } from './packages/table/src/index.js';

export * from './packages/core/src/index.js';
export * from './packages/actions/src/index.js';
export * from './packages/dom/src/index.js';
export * from './packages/query/src/index.js';
export * from './packages/effects/src/index.js';
export * from './packages/editor/src/index.js';
export * from './packages/extension-kit/src/index.js';
export * from './packages/overlays/src/index.js';
export * from './packages/net/src/index.js';
export * from './packages/forms/src/index.js';
export * from './packages/icons/src/index.js';
export * from './packages/components/src/index.js';
export * from './packages/dashboard/src/index.js';
export * from './packages/desktop/src/index.js';
export * from './packages/table/src/index.js';
export * from './packages/rad-adapter/src/index.js';
export * from './packages/router/src/index.js';
export * from './packages/pwa/src/index.js';
export * from './packages/state/src/index.js';
export * from './packages/charts/src/index.js';
export * from './packages/realtime/src/index.js';
export * from './packages/push/src/index.js';
export * from './packages/mobile/src/index.js';
export * from './packages/ai/src/index.js';
export * from './packages/mcp/src/index.js';

export interface BatoiUIFApp {
  root: Document | HTMLElement;
  destroyed: boolean;
  refresh(root?: Document | HTMLElement): void;
  suspend(root?: Document | HTMLElement): void;
  resume(root?: Document | HTMLElement): void;
  destroy(): void;
  restart(): BatoiUIFApp;
}

const apps = new WeakMap<Document | HTMLElement, BatoiUIFApp>();

export const runtimeRegistry = createComponentRegistry();

export function registerRuntimeComponent(definition: UIFComponentDefinition): () => void {
  const contract = getUIFComponentContract(definition.name);
  return runtimeRegistry.register(contract ? { ...contract, ...definition, version: 3 } : definition);
}

function controllerOrEmpty(controller: UIFController | null): UIFController {
  return controller ?? { destroy: () => undefined };
}

const componentValues = [
  'modal',
  'drawer',
  'offcanvas',
  'dropdown',
  'tabs',
  'toast',
  'accordion',
  'alert',
  'badge',
  'breadcrumb',
  'collapse',
  'tooltip',
  'popover',
  'progress',
  'spinner',
  'skeleton',
  'pagination',
  'command-menu',
  'navbar',
  'sidebar',
  'shell',
  'stepper',
  'wizard',
  'file-upload',
  'combobox',
  'carousel',
  'lightbox',
  'masonry',
  'button',
  'card',
  'nav',
] as const;

componentValues.forEach((name) => {
  registerRuntimeComponent({
    name,
    mount({ element }) {
      initComponent(element);
      return () => destroyComponent(element);
    },
  });
});

registerRuntimeComponent({
  name: 'table',
  mount({ element }) {
    initComponent(element);
    const controller = element instanceof HTMLTableElement ? initTable(element) : null;
    return {
      update: () => controller?.refresh(),
      destroy() {
        controller?.destroy();
        destroyComponent(element);
      },
    };
  },
});
registerRuntimeComponent({ name: 'form', mount: ({ element }) => initForm(element as HTMLFormElement) });
registerRuntimeComponent({ name: 'editor', mount: ({ element }) => initEditor(element) });
registerRuntimeComponent({ name: 'animate', mount: ({ element }) => initAnimation(element) });
registerRuntimeComponent({ name: 'typed-text', mount: ({ element }) => initTypedText(element) });
registerRuntimeComponent({ name: 'chart', mount: ({ element }) => initChart(element) });
registerRuntimeComponent({ name: 'dashboard', mount: ({ element }) => controllerOrEmpty(initDashboard(element)) });
registerRuntimeComponent({ name: 'desktop-shell', mount: ({ element }) => initDesktopShell(element) });
registerRuntimeComponent({ name: 'realtime', mount: ({ element }) => controllerOrEmpty(initRealtime(element)) });
registerRuntimeComponent({ name: 'push', mount: ({ element }) => initPush(element) });
registerRuntimeComponent({ name: 'mobile-shell', mount: ({ element }) => initMobileShell(element) });
registerRuntimeComponent({ name: 'ai-action', mount: ({ element }) => renderAIAction(element) });
registerRuntimeComponent({ name: 'ai-thread', mount: ({ element }) => initAssistantThread(element) });
registerRuntimeComponent({ name: 'ai-composer', mount: ({ element }) => renderAgentComposer(element) });
registerRuntimeComponent({ name: 'tool-approval', mount: ({ element }) => renderToolApproval(element) });
registerRuntimeComponent({ name: 'agent-tool', mount: ({ element }) => initAgentToolEnvelope(element) });
registerRuntimeComponent({ name: 'install-prompt', mount: ({ element }) => initInstallPrompt(element) });
registerRuntimeComponent({ name: 'ajax', mount: () => undefined });
registerRuntimeComponent({
  name: 'route',
  mount: ({ element }) => {
    if (element instanceof HTMLAnchorElement && element.href === window.location.href) element.setAttribute('aria-current', 'page');
    return () => element.removeAttribute('aria-current');
  },
});

export function start(root: Document | HTMLElement = document): BatoiUIFApp {
  const existing = apps.get(root);
  if (existing) {
    existing.refresh(root);
    return existing;
  }

  const hydration = createHydrationLifecycle(root, [
    { name: 'component-actions', scope: 'root', hydrate: bindComponentActions },
    { name: 'rad-actions', scope: 'root', hydrate: bindRadActions },
    { name: 'chart-exports', scope: 'root', hydrate: bindChartExports },
    { name: 'router', scope: 'root', hydrate: initRouter },
    { name: 'actions', scope: 'target', hydrate: bindActions },
    { name: 'filters', scope: 'target', hydrate: bindDeclarativeFilters },
    { name: 'icons', scope: 'refresh', hydrate: (target) => { mountIcons(target); } },
    { name: 'components', scope: 'refresh', hydrate: (target) => runtimeRegistry.refresh(target, 'rehydrate') },
  ]);
  const app: BatoiUIFApp = {
    root,
    destroyed: false,
    refresh(target: Document | HTMLElement = root) {
      if (app.destroyed) return;
      hydration.refresh(target);
    },
    suspend(target: Document | HTMLElement = root) {
      if (!app.destroyed) runtimeRegistry.suspend(target);
    },
    resume(target: Document | HTMLElement = root) {
      if (!app.destroyed) runtimeRegistry.resume(target);
    },
    destroy() {
      if (app.destroyed) return;
      runtimeRegistry.destroy(root);
      hydration.destroy();
      app.destroyed = true;
      apps.delete(root);
    },
    restart() {
      app.destroy();
      return start(root);
    },
  };
  apps.set(root, app);
  app.refresh(root);
  return app;
}

export function autoStart(root: Document | HTMLElement = document): void {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start(root), { once: true });
  else start(root);
}
