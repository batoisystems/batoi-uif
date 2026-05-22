export type RealtimeMode = 'sse' | 'websocket' | 'poll';
export type RealtimeHandler = (payload: unknown) => void;

export interface RealtimeOptions {
  channel: string;
  src?: string;
  mode?: RealtimeMode;
  interval?: number;
}

const handlers = new Map<string, Set<RealtimeHandler>>();
const connections = new Map<string, { close(): void }>();

export function subscribe(channel: string, handler: RealtimeHandler): () => void {
  if (!handlers.has(channel)) handlers.set(channel, new Set());
  handlers.get(channel)?.add(handler);
  return () => handlers.get(channel)?.delete(handler);
}

export function publishLocal(channel: string, payload: unknown): void {
  handlers.get(channel)?.forEach((handler) => handler(payload));
}

export function connect(options: RealtimeOptions): void {
  const mode = options.mode ?? 'poll';
  disconnect(options.channel);
  if (mode === 'sse' && options.src && 'EventSource' in window) {
    const source = new EventSource(options.src);
    source.onmessage = (event) => publishLocal(options.channel, JSON.parse(event.data));
    connections.set(options.channel, { close: () => source.close() });
    return;
  }
  if (mode === 'websocket' && options.src && 'WebSocket' in window) {
    const socket = new WebSocket(options.src);
    socket.onmessage = (event) => publishLocal(options.channel, JSON.parse(event.data));
    connections.set(options.channel, { close: () => socket.close() });
    return;
  }
  const timer = window.setInterval(async () => {
    if (!options.src) return;
    const response = await fetch(options.src);
    publishLocal(options.channel, await response.json());
  }, options.interval ?? 5000);
  connections.set(options.channel, { close: () => window.clearInterval(timer) });
}

export function disconnect(channel: string): void {
  connections.get(channel)?.close();
  connections.delete(channel);
}

export function initRealtime(el: HTMLElement): void {
  const channel = el.dataset.uifChannel;
  if (!channel) return;
  const target = el.dataset.uifTarget ? document.querySelector<HTMLElement>(el.dataset.uifTarget) : el;
  subscribe(channel, (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    if (target) target.innerHTML = items.map((item) => `<div class="uif-feed-item">${JSON.stringify(item)}</div>`).join('');
  });
  connect({
    channel,
    src: el.dataset.uifSrc,
    mode: (el.dataset.uifMode as RealtimeMode) || 'poll',
    interval: Number(el.dataset.uifInterval || 5000),
  });
}

export const realtime = { name: 'realtime', init: initRealtime };
