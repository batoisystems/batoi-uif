import { autoInit, isSafeURL, resolveTarget, safeQuerySelector, swapTrustedHTML } from '@batoi/uif-dom';
import { cancelRequest, request } from '@batoi/uif-net';

export interface RouterOptions {
  target?: string;
  routes?: Record<string, string>;
  activeClass?: string;
  beforeNavigate?: (url: URL) => boolean | void | Promise<boolean | void>;
  afterNavigate?: (url: URL, target: HTMLElement | null) => void;
  restoreFocus?: boolean;
  restoreScroll?: boolean;
  allowCrossOrigin?: boolean;
  maxHTMLLength?: number;
}

let routerSequence = 0;

async function loadRoute(url: string, target: HTMLElement | null, options: RouterOptions, key: string, isActive: () => boolean): Promise<void> {
  const source = options.routes?.[new URL(url, window.location.href).pathname] || url;
  if (!isSafeURL(source, { context: 'network', allowHash: false, sameOrigin: !options.allowCrossOrigin })) throw new Error('Batoi UIF blocked an unsafe route URL');
  const html = await request<string>(source, { key, method: 'GET', parseAs: 'text', credentials: 'same-origin', timeout: 15_000 });
  if (!isActive()) return;
  const maxHTMLLength = Math.max(1, Math.floor(options.maxHTMLLength ?? 1_000_000));
  if (typeof html !== 'string' || html.length > maxHTMLLength) throw new Error('UIF_ROUTE_LIMIT');
  if (target && typeof html === 'string') {
    swapTrustedHTML(target, html, 'inner');
    autoInit(target);
    if (options.restoreFocus !== false) target.querySelector<HTMLElement>('[tabindex],a,button,input,select,textarea')?.focus();
  }
  if (options.restoreScroll !== false && window.scrollY) window.scrollTo(0, 0);
  options.afterNavigate?.(new URL(source, window.location.href), target);
}

function updateActiveLinks(root: Document | HTMLElement, activeClass: string): void {
  root.querySelectorAll<HTMLAnchorElement>('a[data-uif="route"]').forEach((link) => {
    const active = link.href === window.location.href;
    link.classList.toggle(activeClass, active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function handleRouteError(error: unknown, url: string): void {
  if (error instanceof DOMException && error.name === 'AbortError') return;
  window.dispatchEvent(new CustomEvent('uif:router-error', { detail: { error, url } }));
}

export function initRouter(root: Document | HTMLElement = document, options: RouterOptions = {}): () => void {
  const defaultTarget = options.target ? safeQuerySelector<HTMLElement>(options.target) : null;
  const activeClass = options.activeClass || 'is-active';
  const key = `router:${++routerSequence}`;
  let disposed = false;
  let navigation = 0;
  updateActiveLinks(root, activeClass);
  const onClick = async (event: Event) => {
    const mouseEvent = event as MouseEvent;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.button !== 0 || mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    event.preventDefault();
    const url = new URL(link.href);
    const allowed = await options.beforeNavigate?.(url);
    if (allowed === false || disposed) return;
    const currentNavigation = ++navigation;
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget, options, key, () => !disposed && navigation === currentNavigation).then(() => {
      if (disposed || navigation !== currentNavigation) return;
      history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, '', link.href);
      updateActiveLinks(root, activeClass);
    }).catch((error) => handleRouteError(error, link.href));
  };
  const onPopState = (event: PopStateEvent) => {
    const targetExpr = (event.state as { uifTarget?: string } | null)?.uifTarget || options.target;
    const routeTarget = targetExpr ? safeQuerySelector<HTMLElement>(targetExpr) : defaultTarget;
    const currentNavigation = ++navigation;
    void loadRoute(window.location.href, routeTarget, options, key, () => !disposed && navigation === currentNavigation).then(() => {
      if (!disposed && navigation === currentNavigation) updateActiveLinks(root, activeClass);
    }).catch((error) => handleRouteError(error, window.location.href));
  };
  root.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);
  return () => {
    disposed = true;
    cancelRequest(key);
    root.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
  };
}
