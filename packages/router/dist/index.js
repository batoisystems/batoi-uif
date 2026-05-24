// src/index.ts
import { autoInit, resolveTarget } from "@batoi/uif-dom";
import { request } from "@batoi/uif-net";
async function loadRoute(url, target, options = {}) {
  const source = options.routes?.[new URL(url, window.location.href).pathname] || url;
  const html = await request(source, { method: "GET", parseAs: "text" });
  if (target && typeof html === "string") {
    target.innerHTML = html;
    autoInit(target);
    if (options.restoreFocus !== false) target.querySelector("[tabindex],a,button,input,select,textarea")?.focus();
  }
  if (options.restoreScroll !== false && !navigator.userAgent.includes("jsdom")) {
    try {
      window.scrollTo({ top: 0 });
    } catch {
    }
  }
  options.afterNavigate?.(new URL(source, window.location.href), target);
}
function updateActiveLinks(root, activeClass) {
  root.querySelectorAll('a[data-uif="route"]').forEach((link) => {
    const active = link.href === window.location.href;
    link.classList.toggle(activeClass, active);
    link.setAttribute("aria-current", active ? "page" : "false");
  });
}
function initRouter(root = document, options = {}) {
  const defaultTarget = options.target ? document.querySelector(options.target) : null;
  const activeClass = options.activeClass || "is-active";
  updateActiveLinks(root, activeClass);
  root.addEventListener("click", async (event) => {
    const mouseEvent = event;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const link = target?.closest('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || mouseEvent.metaKey || mouseEvent.ctrlKey) return;
    const url = new URL(link.href);
    const allowed = await options.beforeNavigate?.(url);
    if (allowed === false) return;
    event.preventDefault();
    const routeTarget = link.dataset.uifTarget ? resolveTarget(link, link.dataset.uifTarget) : defaultTarget;
    void loadRoute(link.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
    history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, "", link.href);
  });
  window.addEventListener("popstate", (event) => {
    const targetExpr = event.state?.uifTarget || options.target;
    const routeTarget = targetExpr ? document.querySelector(targetExpr) : defaultTarget;
    void loadRoute(window.location.href, routeTarget, options).then(() => updateActiveLinks(root, activeClass));
  });
}
export {
  initRouter
};
