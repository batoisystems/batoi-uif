import { renderAIAction } from './packages/ai/src/index.js';
import { initChart } from './packages/charts/src/index.js';
import { initAll as initComponents } from './packages/components/src/index.js';
import { initForm } from './packages/forms/src/index.js';
import { renderToolApproval } from './packages/mcp/src/index.js';
import { initMobileShell } from './packages/mobile/src/index.js';
import { initInstallPrompt } from './packages/pwa/src/index.js';
import { initPush } from './packages/push/src/index.js';
import { bindRadActions } from './packages/rad-adapter/src/index.js';
import { initRealtime } from './packages/realtime/src/index.js';
import { initDeclarativeFilters, initTable } from './packages/table/src/index.js';

export * from './packages/core/src/index.js';
export * from './packages/dom/src/index.js';
export * from './packages/query/src/index.js';
export * from './packages/effects/src/index.js';
export * from './packages/overlays/src/index.js';
export * from './packages/net/src/index.js';
export * from './packages/forms/src/index.js';
export * from './packages/components/src/index.js';
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

export function start(root: Document | HTMLElement = document): void {
  initComponents(root);
  bindRadActions(root);
  initDeclarativeFilters(root);
  root.querySelectorAll<HTMLTableElement>('table[data-uif="table"]').forEach((el) => initTable(el));
  root.querySelectorAll<HTMLFormElement>('form[data-uif="form"]').forEach((el) => initForm(el));
  root.querySelectorAll<HTMLElement>('[data-uif="chart"]').forEach((el) => initChart(el));
  root.querySelectorAll<HTMLElement>('[data-uif="realtime"]').forEach((el) => initRealtime(el));
  root.querySelectorAll<HTMLElement>('[data-uif="push"]').forEach((el) => initPush(el));
  root.querySelectorAll<HTMLElement>('[data-uif="mobile-shell"]').forEach((el) => initMobileShell(el));
  root.querySelectorAll<HTMLElement>('[data-uif="ai-action"]').forEach((el) => renderAIAction(el));
  root.querySelectorAll<HTMLElement>('[data-uif="tool-approval"]').forEach((el) => renderToolApproval(el));
  root.querySelectorAll<HTMLElement>('[data-uif="install-prompt"]').forEach((el) => initInstallPrompt(el));
}

export function autoStart(root: Document | HTMLElement = document): void {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start(root), { once: true });
  else start(root);
}
