// src/index.ts
import { appendTextElement, isSafeURL, safeQuerySelector } from "@batoi/uif-dom";
import { cancelRequest, request } from "@batoi/uif-net";
var handlers = /* @__PURE__ */ new Map();
var connections = /* @__PURE__ */ new Map();
var states = /* @__PURE__ */ new Map();
var presence = /* @__PURE__ */ new Map();
var elementControllers = /* @__PURE__ */ new WeakMap();
var channelElements = /* @__PURE__ */ new Map();
var reconnectAttempts = /* @__PURE__ */ new Map();
var reconnectTimers = /* @__PURE__ */ new Map();
var visibilityListeners = /* @__PURE__ */ new Map();
function requestKey(channel) {
  return `realtime:${channel}`;
}
function dispatchRealtimeEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
function setState(channel, state) {
  states.set(channel, state);
  dispatchRealtimeEvent("uif:realtime-state", { channel, state });
}
function getConnectionState(channel) {
  return states.get(channel) ?? "idle";
}
function parsePayload(data) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
function payloadBytes(payload) {
  if (typeof payload === "string") return new TextEncoder().encode(payload).length;
  try {
    return new TextEncoder().encode(JSON.stringify(payload)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
function publishRemote(options, payload) {
  const maxPayloadBytes = Math.max(1, Math.floor(options.maxPayloadBytes ?? 1e6));
  const bytes = payloadBytes(payload);
  if (bytes > maxPayloadBytes) {
    const error = new Error(`Realtime payload exceeds the ${maxPayloadBytes} byte limit`);
    setState(options.channel, "degraded");
    dispatchRealtimeEvent("uif:realtime-error", { channel: options.channel, error, bytes, maxPayloadBytes });
    return;
  }
  publishLocal(options.channel, typeof payload === "string" ? parsePayload(payload) : payload);
}
function subscribe(channel, handler) {
  if (!handlers.has(channel)) handlers.set(channel, /* @__PURE__ */ new Set());
  handlers.get(channel)?.add(handler);
  return () => handlers.get(channel)?.delete(handler);
}
function publishLocal(channel, payload) {
  dispatchRealtimeEvent("uif:realtime-message", { channel, payload });
  handlers.get(channel)?.forEach((handler) => handler(payload));
}
function publishBatched(channel, payload) {
  window.requestAnimationFrame(() => publishLocal(channel, payload));
}
function closeConnection(channel, emitState = true) {
  const timer = reconnectTimers.get(channel);
  if (timer) window.clearTimeout(timer);
  reconnectTimers.delete(channel);
  const visibilityListener = visibilityListeners.get(channel);
  if (visibilityListener) document.removeEventListener("visibilitychange", visibilityListener);
  visibilityListeners.delete(channel);
  connections.get(channel)?.close();
  connections.delete(channel);
  cancelRequest(requestKey(channel));
  if (emitState) setState(channel, "disconnected");
}
function resetReconnect(channel) {
  reconnectAttempts.delete(channel);
}
function scheduleReconnect(options, error) {
  dispatchRealtimeEvent("uif:realtime-error", { channel: options.channel, error });
  if (options.reconnect === false) {
    setState(options.channel, "disconnected");
    return;
  }
  closeConnection(options.channel, false);
  const attempts = (reconnectAttempts.get(options.channel) ?? 0) + 1;
  reconnectAttempts.set(options.channel, attempts);
  const maxAttempts = Math.max(0, Math.floor(options.maxReconnectAttempts ?? 8));
  if (attempts > maxAttempts) {
    setState(options.channel, "failed");
    dispatchRealtimeEvent("uif:realtime-error", { channel: options.channel, error: new Error(`Realtime reconnect limit of ${maxAttempts} reached`), attempts });
    return;
  }
  if (document.hidden) {
    setState(options.channel, "stale");
    const resume = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", resume);
      visibilityListeners.delete(options.channel);
      connect(options);
    };
    visibilityListeners.set(options.channel, resume);
    document.addEventListener("visibilitychange", resume);
    return;
  }
  const base = options.backoff ?? 500;
  const bounded = Math.min(base * 2 ** (attempts - 1), options.maxBackoff ?? base * 8);
  const jitter = Math.min(1, Math.max(0, options.jitter ?? 0.2));
  const delay = Math.max(0, Math.round(bounded * (1 + (Math.random() * 2 - 1) * jitter)));
  setState(options.channel, "reconnecting");
  reconnectTimers.set(
    options.channel,
    window.setTimeout(() => connect(options), delay)
  );
}
function connect(options) {
  const mode = options.mode ?? "poll";
  closeConnection(options.channel, false);
  const protocols = mode === "websocket" ? ["ws:", "wss:"] : ["http:", "https:"];
  if (options.src && !isSafeURL(options.src, { context: "network", allowHash: false, sameOrigin: !options.allowCrossOrigin, protocols })) {
    const error = new Error("Batoi UIF blocked an unsafe realtime URL");
    setState(options.channel, "failed");
    dispatchRealtimeEvent("uif:realtime-error", { channel: options.channel, error });
    return;
  }
  setState(options.channel, "connecting");
  const markConnected = () => {
    resetReconnect(options.channel);
    setState(options.channel, "connected");
    dispatchRealtimeEvent("uif:realtime-open", { channel: options.channel, mode });
  };
  if (mode === "sse" && options.src && "EventSource" in window) {
    const source = new EventSource(options.src);
    let closed2 = false;
    source.onopen = markConnected;
    source.onmessage = (event) => publishRemote(options, event.data);
    source.onerror = (event) => {
      if (!closed2) scheduleReconnect(options, event);
    };
    connections.set(options.channel, {
      close: () => {
        closed2 = true;
        source.close();
      }
    });
    return;
  }
  if (mode === "websocket" && options.src && "WebSocket" in window) {
    const socket = new WebSocket(options.src);
    let closed2 = false;
    socket.onopen = markConnected;
    socket.onmessage = (event) => publishRemote(options, event.data);
    socket.onerror = (event) => {
      if (!closed2) scheduleReconnect(options, event);
    };
    socket.onclose = (event) => {
      if (!closed2) scheduleReconnect(options, event);
    };
    connections.set(options.channel, {
      close: () => {
        closed2 = true;
        socket.close();
      }
    });
    return;
  }
  let inFlight = false;
  let closed = false;
  let timer;
  let heartbeatTimer;
  const poll = async () => {
    if (closed || !options.src) return;
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await request(options.src, { method: "GET", parseAs: "json", key: requestKey(options.channel), timeout: options.interval ?? 5e3 });
      if (closed) return;
      markConnected();
      publishRemote(options, response);
      timer = window.setTimeout(poll, options.interval ?? 5e3);
    } catch (error) {
      if (closed) return;
      setState(options.channel, "error");
      scheduleReconnect(options, error);
    } finally {
      inFlight = false;
    }
  };
  if (options.heartbeat) {
    heartbeatTimer = window.setTimeout(() => {
      if (getConnectionState(options.channel) === "connecting") setState(options.channel, "stale");
    }, options.heartbeat);
  }
  poll();
  connections.set(options.channel, {
    close: () => {
      closed = true;
      if (timer) window.clearTimeout(timer);
      if (heartbeatTimer) window.clearTimeout(heartbeatTimer);
      cancelRequest(requestKey(options.channel));
    }
  });
}
function bindRealtime(options) {
  const mode = options.transport === "polling" ? "poll" : options.transport;
  const disposers = [];
  if (options.onMessage) disposers.push(subscribe(options.channel, options.onMessage));
  if (options.onState) {
    const listener = (event) => {
      const detail = event.detail;
      if (detail?.channel === options.channel) options.onState?.(detail.state);
    };
    window.addEventListener("uif:realtime-state", listener);
    disposers.push(() => window.removeEventListener("uif:realtime-state", listener));
  }
  connect({ ...options, mode: mode ?? (options.fallback === "polling" ? "poll" : void 0) });
  disposers.push(() => disconnect(options.channel));
  return () => disposers.splice(0).forEach((dispose) => dispose());
}
function updatePresence(channel, user) {
  if (!presence.has(channel)) presence.set(channel, /* @__PURE__ */ new Map());
  const next = { ...user, lastSeen: user.lastSeen ?? (/* @__PURE__ */ new Date()).toISOString() };
  presence.get(channel)?.set(next.id, next);
  window.dispatchEvent(new CustomEvent("uif:presence", { detail: { channel, users: getPresence(channel) } }));
  return next;
}
function removePresence(channel, userId) {
  presence.get(channel)?.delete(userId);
  window.dispatchEvent(new CustomEvent("uif:presence", { detail: { channel, users: getPresence(channel) } }));
}
function getPresence(channel) {
  return Array.from(presence.get(channel)?.values() ?? []);
}
function disconnect(channel) {
  resetReconnect(channel);
  closeConnection(channel);
  dispatchRealtimeEvent("uif:realtime-close", { channel });
}
function initRealtime(el) {
  const channel = el.dataset.uifChannel;
  if (!channel) return null;
  elementControllers.get(el)?.destroy();
  let unsubscribe = null;
  let destroyed = false;
  const refresh = () => {
    if (destroyed) return;
    unsubscribe?.();
    const target = el.dataset.uifTarget ? safeQuerySelector(el.dataset.uifTarget) : el;
    unsubscribe = subscribe(channel, (payload) => {
      const items = Array.isArray(payload) ? payload : [payload];
      if (!target) return;
      target.replaceChildren();
      items.forEach((item) => appendTextElement(target, "div", typeof item === "string" ? item : JSON.stringify(item), "uif-feed-item"));
    });
    connect({
      channel,
      src: el.dataset.uifSrc,
      mode: el.dataset.uifMode || "poll",
      interval: Number(el.dataset.uifInterval || 5e3),
      reconnect: el.dataset.uifReconnect !== "false",
      maxPayloadBytes: Number(el.dataset.uifMaxPayloadBytes || 1e6),
      maxReconnectAttempts: Number(el.dataset.uifMaxReconnectAttempts || 8),
      allowCrossOrigin: el.dataset.uifAllowCrossOrigin === "true"
    });
  };
  channelElements.set(channel, channelElements.get(channel) ?? /* @__PURE__ */ new Set());
  channelElements.get(channel)?.add(el);
  const controller = {
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
    }
  };
  elementControllers.set(el, controller);
  refresh();
  return controller;
}
var realtime = { name: "realtime", init: initRealtime };
export {
  bindRealtime,
  connect,
  disconnect,
  getConnectionState,
  getPresence,
  initRealtime,
  publishBatched,
  publishLocal,
  realtime,
  removePresence,
  subscribe,
  updatePresence
};
