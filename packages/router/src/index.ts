import { autoInit, resolveTarget } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export interface RouterOptions {
  target?: string;
}

async function loadRoute(url: string, target: HTMLElement | null): Promise<void> {
  const html = await request<string>(url, { method: 'GET', parseAs: 'text' });
  if (target && typeof html === 'string') {
    target.innerHTML = html;
    autoInit(target);
  }
}

export function initRouter(root: Document | HTMLElement = document, options: RouterOptions = {}): void {
  const defaultTarget = options.target ? document.querySelector<HTMLElement>(options.target) : null;
  root.addEventListener('click', (event) => {
    const mouseEvent = event as MouseEvent;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.metaKey || mouseEvent.ctrlKey) return;
    event.preventDefault();
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget);
    history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, '', link.href);
  });
  window.addEventListener('popstate', (event: PopStateEvent) => {
    const targetExpr = (event.state as { uifTarget?: string } | null)?.uifTarget || options.target;
    const routeTarget = targetExpr ? document.querySelector<HTMLElement>(targetExpr) : defaultTarget;
    void loadRoute(window.location.href, routeTarget);
  });
}
