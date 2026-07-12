import { appendTextElement, isSafeURL, safeQuerySelector } from '@batoi/uif-dom';
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
  maxPayloadBytes?: number;
  maxReconnectAttempts?: number;
  jitter?: number;
  heartbeat?: number;
  allowCrossOrigin?: boolean;
}

export interface RealtimeBindingOptions extends Omit<RealtimeOptions, 'mode'> {
  transport?: RealtimeMode | 'polling';
  fallback?: 'polling' | 'none';
  onMessage?: RealtimeHandler;
  onState?: (state: RealtimeState) => void;
}

export interface RealtimeController {
  refresh(): void;
  destroy(): void;
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
const elementControllers = new WeakMap<HTMLElement, RealtimeController>();
const channelElements = new Map<string, Set<HTMLElement>>();
const reconnectAttempts = new Map<string, number>();
const reconnectTimers = new Map<string, number>();
const visibilityListeners = new Map<string, () => void>();

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

function payloadBytes(payload: unknown): number {
  if (typeof payload === 'string') return new TextEncoder().encode(payload).length;
  try {
    return new TextEncoder().encode(JSON.stringify(payload)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function publishRemote(options: RealtimeOptions, payload: unknown): void {
  const maxPayloadBytes = Math.max(1, Math.floor(options.maxPayloadBytes ?? 1_000_000));
  const bytes = payloadBytes(payload);
  if (bytes > maxPayloadBytes) {
    const error = new Error(`Realtime payload exceeds the ${maxPayloadBytes} byte limit`);
    setState(options.channel, 'degraded');
    dispatchRealtimeEvent('uif:realtime-error', { channel: options.channel, error, bytes, maxPayloadBytes });
    return;
  }
  publishLocal(options.channel, typeof payload === 'string' ? parsePayload(payload) : payload);
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
  const visibilityListener = visibilityListeners.get(channel);
  if (visibilityListener) document.removeEventListener('visibilitychange', visibilityListener);
  visibilityListeners.delete(channel);
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
  const maxAttempts = Math.max(0, Math.floor(options.maxReconnectAttempts ?? 8));
  if (attempts > maxAttempts) {
    setState(options.channel, 'failed');
    dispatchRealtimeEvent('uif:realtime-error', { channel: options.channel, error: new Error(`Realtime reconnect limit of ${maxAttempts} reached`), attempts });
    return;
  }
  if (document.hidden) {
    setState(options.channel, 'stale');
    const resume = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', resume);
      visibilityListeners.delete(options.channel);
      connect(options);
    };
    visibilityListeners.set(options.channel, resume);
    document.addEventListener('visibilitychange', resume);
    return;
  }
  const base = options.backoff ?? 500;
  const bounded = Math.min(base * 2 ** (attempts - 1), options.maxBackoff ?? base * 8);
  const jitter = Math.min(1, Math.max(0, options.jitter ?? 0.2));
  const delay = Math.max(0, Math.round(bounded * (1 + (Math.random() * 2 - 1) * jitter)));
  setState(options.channel, 'reconnecting');
  reconnectTimers.set(
    options.channel,
    window.setTimeout(() => connect(options), delay),
  );
}

export function connect(options: RealtimeOptions): void {
  const mode = options.mode ?? 'poll';
  closeConnection(options.channel, false);
  const protocols = mode === 'websocket' ? ['ws:', 'wss:'] : ['http:', 'https:'];
  if (options.src && !isSafeURL(options.src, { context: 'network', allowHash: false, sameOrigin: !options.allowCrossOrigin, protocols })) {
    const error = new Error('Batoi UIF blocked an unsafe realtime URL');
    setState(options.channel, 'failed');
    dispatchRealtimeEvent('uif:realtime-error', { channel: options.channel, error });
    return;
  }
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
    source.onmessage = (event) => publishRemote(options, event.data);
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
    socket.onmessage = (event) => publishRemote(options, event.data);
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
      publishRemote(options, response);
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

export function initRealtime(el: HTMLElement): RealtimeController | null {
  const channel = el.dataset.uifChannel;
  if (!channel) return null;
  elementControllers.get(el)?.destroy();
  let unsubscribe: (() => void) | null = null;
  let destroyed = false;
  const refresh = () => {
    if (destroyed) return;
    unsubscribe?.();
    const target = el.dataset.uifTarget ? safeQuerySelector<HTMLElement>(el.dataset.uifTarget) : el;
    unsubscribe = subscribe(channel, (payload) => {
      const items = Array.isArray(payload) ? payload : [payload];
      if (!target) return;
      target.replaceChildren();
      items.forEach((item) => appendTextElement(target, 'div', typeof item === 'string' ? item : JSON.stringify(item), 'uif-feed-item'));
    });
    connect({
      channel,
      src: el.dataset.uifSrc,
      mode: (el.dataset.uifMode as RealtimeMode) || 'poll',
      interval: Number(el.dataset.uifInterval || 5000),
      reconnect: el.dataset.uifReconnect !== 'false',
      maxPayloadBytes: Number(el.dataset.uifMaxPayloadBytes || 1_000_000),
      maxReconnectAttempts: Number(el.dataset.uifMaxReconnectAttempts || 8),
      allowCrossOrigin: el.dataset.uifAllowCrossOrigin === 'true',
    });
  };
  channelElements.set(channel, channelElements.get(channel) ?? new Set());
  channelElements.get(channel)?.add(el);
  const controller: RealtimeController = {
    refresh,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      unsubscribe?.();
      unsubscribe = null;
      const elements = channelElements.get(channel);
      elements?.delete(el);
      if (!elements?.size) {
        channelElements.delete(channel);
        disconnect(channel);
      }
      if (elementControllers.get(el) === controller) elementControllers.delete(el);
    },
  };
  elementControllers.set(el, controller);
  refresh();
  return controller;
}

export const realtime = { name: 'realtime', init: initRealtime };
