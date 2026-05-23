import { emit } from '@batoi/uif-core';
import { autoInit, resolveTarget } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export type SwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';

export interface RadResponse {
  ok?: boolean;
  html?: string;
  target?: string;
  swap?: SwapMode;
  message?: string;
  focus?: string;
  redirect?: string;
  errors?: Record<string, string[]>;
  events?: Array<{ name: string; detail?: unknown; target?: string }>;
  actions?: Array<{ type: string; [key: string]: unknown }>;
}

const swapModes = new Set<string>(['inner', 'outer', 'append', 'prepend', 'before', 'after']);
const bodylessMethods = new Set(['GET', 'HEAD']);

function normalizeSwapMode(mode?: string): SwapMode {
  return swapModes.has(mode ?? '') ? (mode as SwapMode) : 'inner';
}

function setLoading(sourceEl: HTMLElement, loading: boolean): void {
  sourceEl.toggleAttribute('aria-busy', loading);
  const loadingTarget = sourceEl.dataset.uifLoading ? document.querySelector<HTMLElement>(sourceEl.dataset.uifLoading) : null;
  loadingTarget?.toggleAttribute('hidden', !loading);
}

function notify(message: string | undefined, type: 'success' | 'error' = 'success'): void {
  if (!message) return;
  emit(type === 'error' ? 'uif:error' : 'uif:success', { message });
}

function applyEvents(events: RadResponse['events']): void {
  events?.forEach((event) => {
    const target = event.target ? document.querySelector(event.target) : document;
    emit(event.name, event.detail, target ?? document);
  });
}

function applyActions(actions: RadResponse['actions']): void {
  actions?.forEach((action) => {
    if (action.type === 'toast') notify(String(action.message ?? ''), (action.level as 'success' | 'error') || 'success');
    if (action.type === 'focus' && typeof action.target === 'string') document.querySelector<HTMLElement>(action.target)?.focus();
    if (action.type === 'redirect' && typeof action.url === 'string') window.location.assign(action.url);
  });
}

function getAttr(sourceEl: HTMLElement, name: string): string | null {
  return sourceEl.getAttribute(name);
}

function requestUrl(src: string, sourceEl: HTMLElement, method: string): string {
  if (!(sourceEl instanceof HTMLFormElement) || !bodylessMethods.has(method)) return src;
  const url = new URL(src, window.location.href);
  new FormData(sourceEl).forEach((value, key) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}

function requestPayload(sourceEl: HTMLElement, method: string): BodyInit | undefined {
  if (bodylessMethods.has(method)) return undefined;
  if (sourceEl instanceof HTMLFormElement) return new FormData(sourceEl);
  if (method === 'POST') return new FormData();
  return undefined;
}

export function swapContent(targetEl: HTMLElement, html: string, mode: string = 'inner'): HTMLElement {
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
    return updated instanceof HTMLElement ? updated : document.body;
  }
  return targetEl;
}

export function rehydrate(targetEl: HTMLElement): void {
  autoInit(targetEl);
  emit('uif:rehydrate', { target: targetEl }, targetEl);
}

export async function loadPartial(sourceEl: HTMLElement): Promise<RadResponse | null> {
  const src = sourceEl.dataset.uifSrc || getAttr(sourceEl, 'href') || getAttr(sourceEl, 'action');
  if (!src) return null;
  if (sourceEl.dataset.uifConfirm && !window.confirm(sourceEl.dataset.uifConfirm)) return null;

  const method = (sourceEl.dataset.uifMethod || getAttr(sourceEl, 'method') || 'GET').toUpperCase();
  const url = requestUrl(src, sourceEl, method);
  setLoading(sourceEl, true);
  emit('uif:before-load', { source: sourceEl, src: url, method }, sourceEl);

  try {
    const result = await request<string | RadResponse>(url, { method, body: requestPayload(sourceEl, method) });
    const fallbackTarget = resolveTarget(sourceEl, sourceEl.dataset.uifTarget ?? 'self');
    const payload: RadResponse = typeof result === 'string' ? { ok: true, html: result } : result;
    if (payload?.ok === false) throw new Error(payload.message || 'Request failed');
    if (payload.redirect) {
      window.location.assign(payload.redirect);
      return payload;
    }

    const target = payload?.target ? document.querySelector<HTMLElement>(payload.target) : fallbackTarget;
    if (target && payload?.html) {
      const updated = swapContent(target, payload.html, payload.swap || sourceEl.dataset.uifSwap || 'inner');
      rehydrate(updated);
    }
    if (payload.errors) emit('uif:field-errors', { source: sourceEl, errors: payload.errors }, sourceEl);
    applyEvents(payload.events);
    applyActions(payload.actions);
    if (payload.focus) document.querySelector<HTMLElement>(payload.focus)?.focus();
    notify(payload?.message || sourceEl.dataset.uifSuccess);
    emit('uif:load', { source: sourceEl, payload }, sourceEl);
    return payload;
  } catch (error) {
    notify(sourceEl.dataset.uifError || (error instanceof Error ? error.message : 'Unable to load content'), 'error');
    throw error;
  } finally {
    setLoading(sourceEl, false);
  }
}

export function bindRadActions(root: Document | HTMLElement = document): void {
  root.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const el = target?.closest<HTMLElement>(
      '[data-uif="ajax"],[data-uif-action="load"],[data-uif-action="reload"],[data-uif-action="delete"],[data-uif-action="save"],[data-uif-action="swap"]',
    );
    if (!el) return;
    event.preventDefault();
    void loadPartial(el).catch(() => undefined);
  });
  root.addEventListener('submit', (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const form = target?.closest<HTMLFormElement>('form[data-uif="ajax"],form[data-uif-action="submit"],form[data-uif-action="save"]');
    if (!form) return;
    event.preventDefault();
    void loadPartial(form).catch(() => undefined);
  });
}
