import { bindActions } from './packages/actions/src/index.js';
import { renderAIAction } from './packages/ai/src/index.js';
import { bindChartExports, initChart } from './packages/charts/src/index.js';
import { initAll as initComponents } from './packages/components/src/index.js';
import { initDashboard } from './packages/dashboard/src/index.js';
import { initDesktopShell } from './packages/desktop/src/index.js';
import { initAnimation } from './packages/effects/src/index.js';
import { initEditor } from './packages/editor/src/index.js';
import { initForm } from './packages/forms/src/index.js';
import { mountIcons } from './packages/icons/src/index.js';
import { renderToolApproval } from './packages/mcp/src/index.js';
import { initMobileShell } from './packages/mobile/src/index.js';
import { initInstallPrompt } from './packages/pwa/src/index.js';
import { initPush } from './packages/push/src/index.js';
import { bindRadActions } from './packages/rad-adapter/src/index.js';
import { initRealtime } from './packages/realtime/src/index.js';
import { initDeclarativeFilters, initTable } from './packages/table/src/index.js';

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
  destroy(): void;
  restart(): BatoiUIFApp;
}

const apps = new WeakMap<Document | HTMLElement, BatoiUIFApp>();

function hydrate(root: Document | HTMLElement, disposers: Set<() => void>): void {
  mountIcons(root);
  disposers.add(bindActions(root));
  disposers.add(initComponents(root));
  disposers.add(bindRadActions(root));
  initDeclarativeFilters(root);
  disposers.add(bindChartExports(root));
  root.querySelectorAll<HTMLElement>('[data-uif]').forEach((el) => {
    const type = el.dataset.uif;
    if (type === 'table' && el.tagName === 'TABLE') initTable(el as HTMLTableElement);
    if (type === 'form' && el.tagName === 'FORM') initForm(el as HTMLFormElement);
    if (type === 'editor') initEditor(el);
    if (type === 'animate') initAnimation(el);
    if (type === 'chart') initChart(el);
    if (type === 'dashboard') initDashboard(el);
    if (type === 'desktop-shell') disposers.add(initDesktopShell(el));
    if (type === 'realtime') initRealtime(el);
    if (type === 'push') initPush(el);
    if (type === 'mobile-shell') initMobileShell(el);
    if (type === 'ai-action') renderAIAction(el);
    if (type === 'tool-approval') renderToolApproval(el);
    if (type === 'install-prompt') initInstallPrompt(el);
  });
}

export function start(root: Document | HTMLElement = document): BatoiUIFApp {
  const existing = apps.get(root);
  if (existing) {
    existing.refresh(root);
    return existing;
  }

  const disposers = new Set<() => void>();
  const app: BatoiUIFApp = {
    root,
    destroyed: false,
    refresh(target: Document | HTMLElement = root) {
      if (app.destroyed) return;
      hydrate(target, disposers);
    },
    destroy() {
      if (app.destroyed) return;
      disposers.forEach((dispose) => dispose());
      disposers.clear();
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
