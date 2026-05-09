import { request } from '@batoi/uif-net';
import { autoInit, resolveTarget } from '@batoi/uif-dom';

async function loadRoute(url, target) {
  const html = await request(url, { method: 'GET' });
  if (target && typeof html === 'string') {
    target.innerHTML = html;
    autoInit(target);
  }
}

export function initRouter(root = document, options = {}) {
  const defaultTarget = options.target ? document.querySelector(options.target) : null;
  root.addEventListener('click', async (event) => {
    const link = event.target.closest('a[data-uif="route"]');
    if (!link || link.origin !== window.location.origin || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    const target = resolveTarget(link, link.dataset.uifTarget ?? 'self') || defaultTarget;
    await loadRoute(link.href, target);
    history.pushState({ uifTarget: link.dataset.uifTarget || options.target || null }, '', link.href);
  });
  window.addEventListener('popstate', async (event) => {
    const targetExpr = event.state?.uifTarget || options.target;
    const target = targetExpr ? document.querySelector(targetExpr) : defaultTarget;
    await loadRoute(window.location.href, target);
  });
}
