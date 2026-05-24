// src/index.ts
var handlers = /* @__PURE__ */ new Map();
var connections = /* @__PURE__ */ new Map();
var states = /* @__PURE__ */ new Map();
function setState(channel, state) {
  states.set(channel, state);
  window.dispatchEvent(new CustomEvent("uif:realtime-state", { detail: { channel, state } }));
}
function getConnectionState(channel) {
  return states.get(channel) ?? "disconnected";
}
function parsePayload(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
function subscribe(channel, handler) {
  if (!handlers.has(channel)) handlers.set(channel, /* @__PURE__ */ new Set());
  handlers.get(channel)?.add(handler);
  return () => handlers.get(channel)?.delete(handler);
}
function publishLocal(channel, payload) {
  handlers.get(channel)?.forEach((handler) => handler(payload));
}
function publishBatched(channel, payload) {
  window.requestAnimationFrame(() => publishLocal(channel, payload));
}
function connect(options) {
  const mode = options.mode ?? "poll";
  disconnect(options.channel);
  setState(options.channel, "connecting");
  let attempts = 0;
  const reconnect = () => {
    if (options.reconnect === false) {
      setState(options.channel, "disconnected");
      return;
    }
    attempts += 1;
    setState(options.channel, "reconnecting");
    window.setTimeout(() => connect(options), (options.backoff ?? 500) * attempts);
  };
  if (mode === "sse" && options.src && "EventSource" in window) {
    const source = new EventSource(options.src);
    source.onopen = () => setState(options.channel, "connected");
    source.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    source.onerror = reconnect;
    connections.set(options.channel, { close: () => source.close() });
    return;
  }
  if (mode === "websocket" && options.src && "WebSocket" in window) {
    const socket = new WebSocket(options.src);
    socket.onopen = () => setState(options.channel, "connected");
    socket.onmessage = (event) => publishLocal(options.channel, parsePayload(event.data));
    socket.onerror = reconnect;
    socket.onclose = reconnect;
    connections.set(options.channel, { close: () => socket.close() });
    return;
  }
  const timer = window.setInterval(async () => {
    if (!options.src) return;
    try {
      const response = await fetch(options.src);
      setState(options.channel, "connected");
      publishLocal(options.channel, await response.json());
    } catch {
      setState(options.channel, "error");
      reconnect();
    }
  }, options.interval ?? 5e3);
  if (options.heartbeat) {
    window.setTimeout(() => {
      if (getConnectionState(options.channel) === "connecting") setState(options.channel, "stale");
    }, options.heartbeat);
  }
  connections.set(options.channel, { close: () => window.clearInterval(timer) });
}
function disconnect(channel) {
  connections.get(channel)?.close();
  connections.delete(channel);
  setState(channel, "disconnected");
}
function initRealtime(el) {
  const channel = el.dataset.uifChannel;
  if (!channel) return;
  const target = el.dataset.uifTarget ? document.querySelector(el.dataset.uifTarget) : el;
  subscribe(channel, (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    if (target) target.innerHTML = items.map((item) => `<div class="uif-feed-item">${JSON.stringify(item)}</div>`).join("");
  });
  connect({
    channel,
    src: el.dataset.uifSrc,
    mode: el.dataset.uifMode || "poll",
    interval: Number(el.dataset.uifInterval || 5e3),
    reconnect: el.dataset.uifReconnect !== "false"
  });
}
var realtime = { name: "realtime", init: initRealtime };
export {
  connect,
  disconnect,
  getConnectionState,
  initRealtime,
  publishBatched,
  publishLocal,
  realtime,
  subscribe
};
