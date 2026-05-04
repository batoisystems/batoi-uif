import { autoInit, resolveTarget } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export function swapContent(targetEl, html, mode = 'inner') {
  if (mode === 'inner') targetEl.innerHTML = html;
  if (mode === 'outer') targetEl.outerHTML = html;
  if (mode === 'append') targetEl.insertAdjacentHTML('beforeend', html);
  if (mode === 'prepend') targetEl.insertAdjacentHTML('afterbegin', html);
  if (mode === 'before') targetEl.insertAdjacentHTML('beforebegin', html);
  if (mode === 'after') targetEl.insertAdjacentHTML('afterend', html);
  return mode === 'outer' ? document.body : targetEl;
}

export function rehydrate(targetEl) { autoInit(targetEl); }

export async function loadPartial(sourceEl) {
  const src = sourceEl.dataset.uifSrc;
  if (!src) return;
  const method = sourceEl.dataset.uifMethod ?? 'GET';
  const res = await request(src, { method });
  const target = resolveTarget(sourceEl, sourceEl.dataset.uifTarget ?? 'self');
  if (!target) return;
  if (typeof res === 'string') {
    const updated = swapContent(target, res, sourceEl.dataset.uifSwap ?? 'inner');
    rehydrate(updated);
    return;
  }
  const payload = res;
  const payloadTarget = payload.target ? document.querySelector(payload.target) : target;
  if (payloadTarget && payload.html) {
    const updated = swapContent(payloadTarget, payload.html, payload.swap ?? 'inner');
    rehydrate(updated);
  }
}

export function bindRadActions(root = document) {
  root.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-uif="ajax"],[data-uif-action]');
    if (!el) return;
    if (el.dataset.uifConfirm && !confirm(el.dataset.uifConfirm)) return;
    e.preventDefault();
    try { await loadPartial(el); } catch { if (el.dataset.uifError) alert(el.dataset.uifError); }
  });
}
