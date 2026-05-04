import { request } from '@batoi/uif-net';
import { resolveTarget } from '@batoi/uif-dom';

export function initRouter(root = document) {
  root.addEventListener('click', async (e) => {
    const link = e.target.closest('a[data-uif="route"]');
    if (!link) return;
    e.preventDefault();
    const html = await request(link.href, { method: 'GET' });
    const target = resolveTarget(link, link.dataset.uifTarget ?? 'self');
    if (target && typeof html === 'string') target.innerHTML = html;
    history.pushState({}, '', link.href);
  });
}
