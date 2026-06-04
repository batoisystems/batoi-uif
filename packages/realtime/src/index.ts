import { appendTextElement } from '@batoi/uif-dom';
import { cancelRequest, request } from '@batoi/uif-net';

export type RealtimeMode = 'sse' | 'websocket' | 'poll';
export type RealtimeState = 'idle' | 'connecting' | 'connected' | 'open' | 'reconnecting' | 'disconnected' | 'closed' | 'stale' | 'degraded' | 'error' | 'failed';
export type RealtimeHandler = (payload: unknown) => void;

export interface RealtimeOptions {
  channel: string;
  src?: string;
  mode?: RealtimeMode;
  interval?: number;
  reconnect?: boolean;
  backoff?: number;
  maxBackoff?: number;
  heartbeat?: number;
}

export interface RealtimeBindingOptions extends Omit<RealtimeOptions, 'mode'> {
  transport?: RealtimeMode | 'polling';
  fallback?: 'polling' | 'none';
  onMessage?: RealtimeHandler;
  onState?: (state: RealtimeState) => void;
}

export interface PresenceUser {
  id: string;
  name?: string;
  color?: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
  metadata?: Record<string, unknown>;
}

const handlers = new Map<string, Set<RealtimeHandler>>();
const connections = new Map<string, { close(): void }>();
const states = new Map<string, RealtimeState>();
const presence = new Map<string, Map<string, PresenceUser>>();
const elementSubscriptions = new WeakMap<HTMLElement, () => void>();
const reconnectAttempts = new Map<string, number>();
const reconnectTimers = new Map<string, number>();

function requestKey(channel: string): string {
  return `realtime:${channel}`;
}

function dispatchRealtimeEvent(name: string, detail: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function setState(channel: string, state: RealtimeState): void {
  states.set(channel, state);
  dispatchRealtimeEvent('uif:realtime-state', { channel, state });
}

export function getConnectionState(channel: string): RealtimeState {
  return states.get(channel) ?? 'idle';
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
  dispatchRealtimeEvent('uif:realtime-message', { channel, payload });
  handlers.get(channel)?.forEach((handler) => handler(payload));
}

export function publishBatched(channel: string, payload: unknown): void {
  window.requestAnimationFrame(() => publishLocal(channel, payload));
}

function closeConnection(channel: string, emitState = true): void {
  const timer = reconnectTimers.get(channel);
  if (timer) window.clearTimeout(timer);
  reconnectTimers.delete(channel);
  connections.get(channel)?.close();
  connections.delete(channel);
  cancelRequest(requestKey(channel));
  if (emitState) setState(channel, 'disconnected');
}

function resetReconnect(channel: string): void {
  reconnectAttempts.delete(channel);
}

function scheduleReconnect(options: RealtimeOptions, error?: unknown): void {
  dispatchRealtimeEvent('uif:realtime-error', { channel: options.channel, error });
  if (options.reconnect === false) {
    setState(options.channel, 'disconnected');
    return;
  }
  closeConnection(options.channel, false);
  const attempts = (reconnectAttempts.get(options.channel) ?? 0) + 1;
  reconnectAttempts.set(options.channel, attempts);
  const base = options.backoff ?? 500;
  const delay = Math.min(base * 2 ** (attempts - 1), options.maxBackoff ?? base * 8);
  setState(options.channel, 'reconnecting');
  reconnectTimers.set(
    options.channel,
    window.setTimeout(() => connect(options), delay),
  );
}

export function connect(options: RealtimeOptions): void {
  const mode = options.mode ?? 'poll';
  closeConnection(options.channel, false);
  setState(options.channel, 'connecting');
  const markConnected = () => {
    resetReconnect(options.channel);
    setState(options.channel, 'connected');
    dispatchRealtimeEvent('uif:realtime-open', { channel: options.channel, mode });
  };
  if (mode === 'sse' && options.src && 'EventSource' in window) {
    const source = new EventSource(options.src);
    let closed = false;
    source.onopen = markConnected;
    source.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    source.onerror = (event) => {
      if (!closed) scheduleReconnect(options, event);
    };
    connections.set(options.channel, {
      close: () => {
        closed = true;
        source.close();
      },
    });
    return;
  }
  if (mode === 'websocket' && options.src && 'WebSocket' in window) {
    const socket = new WebSocket(options.src);
    let closed = false;
    socket.onopen = markConnected;
    socket.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    socket.onerror = (event) => {
      if (!closed) scheduleReconnect(options, event);
    };
    socket.onclose = (event) => {
      if (!closed) scheduleReconnect(options, event);
    };
    connections.set(options.channel, {
      close: () => {
        closed = true;
        socket.close();
      },
    });
    return;
  }
  let inFlight = false;
  let closed = false;
  let timer: number | undefined;
  let heartbeatTimer: number | undefined;
  const poll = async () => {
    if (closed || !options.src) return;
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await request<unknown>(options.src, { method: 'GET', parseAs: 'json', key: requestKey(options.channel), timeout: options.interval ?? 5000 });
      if (closed) return;
      markConnected();
      publishLocal(options.channel, response);
      timer = window.setTimeout(poll, options.interval ?? 5000);
    } catch (error) {
      if (closed) return;
      setState(options.channel, 'error');
      scheduleReconnect(options, error);
    } finally {
      inFlight = false;
    }
  };
  if (options.heartbeat) {
    heartbeatTimer = window.setTimeout(() => {
      if (getConnectionState(options.channel) === 'connecting') setState(options.channel, 'stale');
    }, options.heartbeat);
  }
  poll();
  connections.set(options.channel, {
    close: () => {
      closed = true;
      if (timer) window.clearTimeout(timer);
      if (heartbeatTimer) window.clearTimeout(heartbeatTimer);
      cancelRequest(requestKey(options.channel));
    },
  });
}

export function bindRealtime(options: RealtimeBindingOptions): () => void {
  const mode = options.transport === 'polling' ? 'poll' : options.transport;
  const disposers: Array<() => void> = [];
  if (options.onMessage) disposers.push(subscribe(options.channel, options.onMessage));
  if (options.onState) {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ channel: string; state: RealtimeState }>).detail;
      if (detail?.channel === options.channel) options.onState?.(detail.state);
    };
    window.addEventListener('uif:realtime-state', listener);
    disposers.push(() => window.removeEventListener('uif:realtime-state', listener));
  }
  connect({ ...options, mode: mode ?? (options.fallback === 'polling' ? 'poll' : undefined) });
  disposers.push(() => disconnect(options.channel));
  return () => disposers.splice(0).forEach((dispose) => dispose());
}

export function updatePresence(channel: string, user: Omit<PresenceUser, 'lastSeen'> & { lastSeen?: string }): PresenceUser {
  if (!presence.has(channel)) presence.set(channel, new Map());
  const next: PresenceUser = { ...user, lastSeen: user.lastSeen ?? new Date().toISOString() };
  presence.get(channel)?.set(next.id, next);
  window.dispatchEvent(new CustomEvent('uif:presence', { detail: { channel, users: getPresence(channel) } }));
  return next;
}

export function removePresence(channel: string, userId: string): void {
  presence.get(channel)?.delete(userId);
  window.dispatchEvent(new CustomEvent('uif:presence', { detail: { channel, users: getPresence(channel) } }));
}

export function getPresence(channel: string): PresenceUser[] {
  return Array.from(presence.get(channel)?.values() ?? []);
}

export function disconnect(channel: string): void {
  resetReconnect(channel);
  closeConnection(channel);
  dispatchRealtimeEvent('uif:realtime-close', { channel });
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
