// src/index.ts
import { autoInit, isSafeURL, resolveTarget, safeQuerySelector, swapTrustedHTML } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
var routerSequence = 0;
async function loadRoute(url, target, options, key, isActive) {
  const source = options.routes?.[new URL(url, window.location.href).pathname] || url;
  if (!isSafeURL(source, { context: "network", allowHash: false, sameOrigin: !options.allowCrossOrigin })) throw new Error("Batoi UIF blocked an unsafe route URL");
  const html = await request(source, { key, method: "GET", parseAs: "text", credentials: "same-origin", timeout: 15e3 });
  if (!isActive()) return;
  const maxHTMLLength = Math.max(1, Math.floor(options.maxHTMLLength ?? 1e6));
  if (typeof html !== "string" || html.length > maxHTMLLength) throw new Error("UIF_ROUTE_LIMIT");
  if (target && typeof html === "string") {
    swapTrustedHTML(target, html, "inner");
    autoInit(target);
    if (options.restoreFocus !== false) target.querySelector("[tabindex],a,button,input,select,textarea")?.focus();
  }
  if (options.restoreScroll !== false && window.scrollY) window.scrollTo(0, 0);
  options.afterNavigate?.(new URL(source, window.location.href), target);
}
function updateActiveLinks(root, activeClass) {
  root.querySelectorAll('a[data-uif="route"]').forEach((link) => {
    const active = link.href === window.location.href;
    link.classList.toggle(activeClass, active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}
function handleRouteError(error, url) {
  if (error instanceof DOMException && error.name === "AbortError") return;
  window.dispatchEvent(new CustomEvent("uif:router-error", { detail: { error, url } }));
}
function initRouter(root = document, options = {}) {
  const defaultTarget = options.target ? safeQuerySelector(options.target) : null;
  const activeClass = options.activeClass || "is-active";
  const key = `router:${++routerSequence}`;
  let disposed = false;
  let navigation = 0;
  updateActiveLinks(root, activeClass);
  const onClick = async (event) => {
    const mouseEvent = event;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.button !== 0 || mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.altKey || link.hasAttribute("download") || link.target && link.target !== "_self") return;
    event.preventDefault();
    const url = new URL(link.href);
    const allowed = await options.beforeNavigate?.(url);
    if (allowed === false || disposed) return;
    const currentNavigation = ++navigation;
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget, options, key, () => !disposed && navigation === currentNavigation).then(() => {
      if (disposed || navigation !== currentNavigation) return;
      history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, "", link.href);
      updateActiveLinks(root, activeClass);
    }).catch((error) => handleRouteError(error, link.href));
  };
  const onPopState = (event) => {
    const targetExpr = event.state?.uifTarget || options.target;
    const routeTarget = targetExpr ? safeQuerySelector(targetExpr) : defaultTarget;
    const currentNavigation = ++navigation;
    void loadRoute(window.location.href, routeTarget, options, key, () => !disposed && navigation === currentNavigation).then(() => {
      if (!disposed && navigation === currentNavigation) updateActiveLinks(root, activeClass);
    }).catch((error) => handleRouteError(error, window.location.href));
  };
  root.addEventListener("click", onClick);
  window.addEventListener("popstate", onPopState);
  return () => {
    disposed = true;
    cancelRequest(key);
    root.removeEventListener("click", onClick);
    window.removeEventListener("popstate", onPopState);
  };
}
export {
  initRouter
};
