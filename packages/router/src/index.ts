import { autoInit, resolveTarget, swapTrustedHTML } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export interface RouterOptions {
  target?: string;
  routes?: Record<string, string>;
  activeClass?: string;
  beforeNavigate?: (url: URL) => boolean | void | Promise<boolean | void>;
  afterNavigate?: (url: URL, target: HTMLElement | null) => void;
  restoreFocus?: boolean;
  restoreScroll?: boolean;
}

async function loadRoute(url: string, target: HTMLElement | null, options: RouterOptions = {}): Promise<void> {
  const source = options.routes?.[new URL(url, window.location.href).pathname] || url;
  const html = await request<string>(source, { method: 'GET', parseAs: 'text' });
  if (target && typeof html === 'string') {
    swapTrustedHTML(target, html, 'inner');
    autoInit(target);
    if (options.restoreFocus !== false) target.querySelector<HTMLElement>('[tabindex],a,button,input,select,textarea')?.focus();
  }
  if (options.restoreScroll !== false && !navigator.userAgent.includes('jsdom')) {
    try {
      window.scrollTo({ top: 0 });
    } catch {
      // Some DOM test environments expose scrollTo without implementing it.
    }
  }
  options.afterNavigate?.(new URL(source, window.location.href), target);
}

function updateActiveLinks(root: Document | HTMLElement, activeClass: string): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-uif="route"]').forEach((link) => {
    const active = link.href === window.location.href;
    link.classList.toggle(activeClass, active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

export function initRouter(root: Document | HTMLElement = document, options: RouterOptions = {}): void {
  const defaultTarget = options.target ? document.querySelector<HTMLElement>(options.target) : null;
  const activeClass = options.activeClass || 'is-active';
  updateActiveLinks(root, activeClass);
  root.addEventListener('click', async (event) => {
    const mouseEvent = event as MouseEvent;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.metaKey || mouseEvent.ctrlKey) return;
    const url = new URL(link.href);
    const allowed = await options.beforeNavigate?.(url);
    if (allowed === false) return;
    event.preventDefault();
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
    history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, '', link.href);
  });
  window.addEventListener('popstate', (event: PopStateEvent) => {
    const targetExpr = (event.state as { uifTarget?: string } | null)?.uifTarget || options.target;
    const routeTarget = targetExpr ? document.querySelector<HTMLElement>(targetExpr) : defaultTarget;
    void loadRoute(window.location.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
  });
}
