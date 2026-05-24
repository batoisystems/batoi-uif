import { appendTextElement } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export type RealtimeMode = 'sse' | 'websocket' | 'poll';
export type RealtimeState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'stale' | 'error';
export type RealtimeHandler = (payload: unknown) => void;

export interface RealtimeOptions {
  channel: string;
  src?: string;
  mode?: RealtimeMode;
  interval?: number;
  reconnect?: boolean;
  backoff?: number;
  heartbeat?: number;
}

const handlers = new Map<string, Set<RealtimeHandler>>();
const connections = new Map<string, { close(): void }>();
const states = new Map<string, RealtimeState>();
const elementSubscriptions = new WeakMap<HTMLElement, () => void>();

function setState(channel: string, state: RealtimeState): void {
  states.set(channel, state);
  window.dispatchEvent(new CustomEvent('uif:realtime-state', { detail: { channel, state } }));
}

export function getConnectionState(channel: string): RealtimeState {
  return states.get(channel) ?? 'disconnected';
}

function parsePayload(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

export function subscribe(channel: string, handler: RealtimeHandler): () => void {
  if (!handlers.has(channel)) handlers.set(channel, new Set());
  handlers.get(channel)?.add(handler);
  return () => handlers.get(channel)?.delete(handler);
}

export function publishLocal(channel: string, payload: unknown): void {
  handlers.get(channel)?.forEach((handler) => handler(payload));
}

export function publishBatched(channel: string, payload: unknown): void {
  window.requestAnimationFrame(() => publishLocal(channel, payload));
}

export function connect(options: RealtimeOptions): void {
  const mode = options.mode ?? 'poll';
  disconnect(options.channel);
  setState(options.channel, 'connecting');
  let attempts = 0;
  const reconnect = () => {
    if (options.reconnect === false) {
      setState(options.channel, 'disconnected');
      return;
    }
    attempts += 1;
    setState(options.channel, 'reconnecting');
    window.setTimeout(() => connect(options), (options.backoff ?? 500) * attempts);
  };
  if (mode === 'sse' && options.src && 'EventSource' in window) {
    const source = new EventSource(options.src);
    source.onopen = () => setState(options.channel, 'connected');
    source.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    source.onerror = reconnect;
    connections.set(options.channel, { close: () => source.close() });
    return;
  }
  if (mode === 'websocket' && options.src && 'WebSocket' in window) {
    const socket = new WebSocket(options.src);
    socket.onopen = () => setState(options.channel, 'connected');
    socket.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    socket.onerror = reconnect;
    socket.onclose = reconnect;
    connections.set(options.channel, { close: () => socket.close() });
    return;
  }
  let inFlight = false;
  const timer = window.setInterval(async () => {
    if (!options.src) return;
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await request<unknown>(options.src, { method: 'GET', parseAs: 'json', key: `realtime:${options.channel}`, timeout: options.interval ?? 5000 });
      setState(options.channel, 'connected');
      publishLocal(options.channel, response);
    } catch {
      setState(options.channel, 'error');
      reconnect();
    } finally {
      inFlight = false;
    }
  }, options.interval ?? 5000);
  if (options.heartbeat) {
    window.setTimeout(() => {
      if (getConnectionState(options.channel) === 'connecting') setState(options.channel, 'stale');
    }, options.heartbeat);
  }
  connections.set(options.channel, { close: () => window.clearInterval(timer) });
}

export function disconnect(channel: string): void {
  connections.get(channel)?.close();
  connections.delete(channel);
  setState(channel, 'disconnected');
}

export function initRealtime(el: HTMLElement): void {
  const channel = el.dataset.uifChannel;
  if (!channel) return;
  elementSubscriptions.get(el)?.();
  const target = el.dataset.uifTarget ? document.querySelector<HTMLElement>(el.dataset.uifTarget) : el;
  const unsubscribe = subscribe(channel, (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    if (!target) return;
    target.replaceChildren();
    items.forEach((item) => appendTextElement(target, 'div', typeof item === 'string' ? item : JSON.stringify(item), 'uif-feed-item'));
  });
  elementSubscriptions.set(el, unsubscribe);
  connect({
    channel,
    src: el.dataset.uifSrc,
    mode: (el.dataset.uifMode as RealtimeMode) || 'poll',
    interval: Number(el.dataset.uifInterval || 5000),
    reconnect: el.dataset.uifReconnect !== 'false',
  });
}

export const realtime = { name: 'realtime', init: initRealtime };
