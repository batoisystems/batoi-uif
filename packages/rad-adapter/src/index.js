import { emit } from '@batoi/uif-core';
import { autoInit, resolveTarget } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

const swapModes = new Set(['inner', 'outer', 'append', 'prepend', 'before', 'after']);
const bodylessMethods = new Set(['GET', 'HEAD']);

function normalizeSwapMode(mode) {
  return swapModes.has(mode) ? mode : 'inner';
}

function setLoading(sourceEl, loading) {
  sourceEl.toggleAttribute('aria-busy', loading);
  const loadingTarget = sourceEl.dataset.uifLoading ? document.querySelector(sourceEl.dataset.uifLoading) : null;
  loadingTarget?.toggleAttribute('hidden', !loading);
}

function successMessage(sourceEl, payload) {
  return payload?.message || sourceEl.dataset.uifSuccess || '';
}

function notify(message, type = 'status') {
  if (!message) return;
  emit(type === 'error' ? 'uif:error' : 'uif:success', { message });
}

function requestUrl(src, sourceEl, method) {
  if (!(sourceEl instanceof HTMLFormElement) || !bodylessMethods.has(method)) return src;
  const url = new URL(src, window.location.href);
  new FormData(sourceEl).forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

function requestPayload(sourceEl, method) {
  if (bodylessMethods.has(method)) return undefined;
  if (sourceEl instanceof HTMLFormElement) return new FormData(sourceEl);
  if (method === 'POST') return new FormData();
  return undefined;
}

export function swapContent(targetEl, html, mode = 'inner') {
  const safeMode = normalizeSwapMode(mode);
  if (safeMode === 'inner') targetEl.innerHTML = html;
  if (safeMode === 'append') targetEl.insertAdjacentHTML('beforeend', html);
  if (safeMode === 'prepend') targetEl.insertAdjacentHTML('afterbegin', html);
  if (safeMode === 'before') targetEl.insertAdjacentHTML('beforebegin', html);
  if (safeMode === 'after') targetEl.insertAdjacentHTML('afterend', html);
  if (safeMode === 'outer') {
    targetEl.insertAdjacentHTML('afterend', html);
    const updated = targetEl.nextElementSibling;
    targetEl.remove();
    return updated || document.body;
  }
  return targetEl;
}

export function rehydrate(targetEl) {
  autoInit(targetEl);
  emit('uif:rehydrate', { target: targetEl }, targetEl);
}

export async function loadPartial(sourceEl) {
  const src = sourceEl.dataset.uifSrc || sourceEl.getAttribute('href') || sourceEl.getAttribute('action');
  if (!src) return null;
  if (sourceEl.dataset.uifConfirm && !confirm(sourceEl.dataset.uifConfirm)) return null;

  const method = (sourceEl.dataset.uifMethod || sourceEl.getAttribute('method') || 'GET').toUpperCase();
  const url = requestUrl(src, sourceEl, method);
  setLoading(sourceEl, true);
  emit('uif:before-load', { source: sourceEl, src: url, method }, sourceEl);
  try {
    const result = await request(url, { method, body: requestPayload(sourceEl, method) });
    const fallbackTarget = resolveTarget(sourceEl, sourceEl.dataset.uifTarget ?? 'self');
    const payload = typeof result === 'string' ? { ok: true, html: result } : result;
    if (payload?.ok === false) throw new Error(payload.message || 'Request failed');
    const target = payload?.target ? document.querySelector(payload.target) : fallbackTarget;
    if (target && payload?.html) {
      const updated = swapContent(target, payload.html, payload.swap || sourceEl.dataset.uifSwap || 'inner');
      rehydrate(updated);
    }
    notify(successMessage(sourceEl, payload));
    emit('uif:load', { source: sourceEl, payload }, sourceEl);
    return payload;
  } catch (error) {
    const message = sourceEl.dataset.uifError || error.message || 'Unable to load content';
    notify(message, 'error');
    throw error;
  } finally {
    setLoading(sourceEl, false);
  }
}

export function bindRadActions(root = document) {
  root.addEventListener('click', async (event) => {
    const el = event.target.closest('[data-uif="ajax"],[data-uif-action="load"],[data-uif-action="reload"],[data-uif-action="delete"],[data-uif-action="save"],[data-uif-action="swap"]');
    if (!el) return;
    event.preventDefault();
    await loadPartial(el).catch(() => undefined);
  });
  root.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-uif="ajax"],form[data-uif-action="submit"],form[data-uif-action="save"]');
    if (!form) return;
    event.preventDefault();
    await loadPartial(form).catch(() => undefined);
  });
}
