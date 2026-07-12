// src/index.ts
import { isSafeURL, setTrustedHTML } from "@batoi/uif-dom";
function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function parseJSON(value) {
  if (!value) return void 0;
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
}
function safeStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : void 0;
  } catch {
    return void 0;
  }
}
function platformFromRuntime() {
  const globalValue = globalThis;
  if (globalValue.__TAURI_INTERNALS__) return "tauri";
  if (globalValue.process?.versions?.electron) return "electron";
  if (typeof window !== "undefined") return "browser";
  return "unknown";
}
function normalizeManifest(input) {
  return {
    ...input,
    workspaceMode: input.workspaceMode ?? "none",
    offlineMode: input.offlineMode ?? "none",
    aiMode: input.aiMode ?? "none",
    capabilities: input.capabilities ?? [],
    navigation: input.navigation ?? []
  };
}
function validateDesktopManifest(manifest) {
  const errors = [];
  if (!manifest.id || typeof manifest.id !== "string") errors.push("Desktop manifest requires a string id.");
  if (!manifest.name || typeof manifest.name !== "string") errors.push("Desktop manifest requires a string name.");
  if (manifest.navigation?.some((item) => !item.id || !item.label)) errors.push("Every desktop navigation item requires id and label.");
  return { valid: errors.length === 0, errors };
}
function createDesktopManifest(input) {
  const result = validateDesktopManifest(input);
  if (!result.valid) throw new Error(result.errors.join(" "));
  return normalizeManifest(input);
}
function parseDesktopManifestElement(element) {
  const options = parseJSON(element.dataset.uifOptions || element.dataset.uifDesktop);
  return createDesktopManifest({
    id: element.dataset.uifDesktopApp || options?.id || "desktop-app",
    name: options?.name || element.dataset.uifDesktopName || element.getAttribute("aria-label") || "Desktop App",
    version: options?.version || element.dataset.uifDesktopVersion,
    workspaceMode: options?.workspaceMode,
    offlineMode: options?.offlineMode,
    aiMode: options?.aiMode,
    capabilities: options?.capabilities,
    navigation: options?.navigation
  });
}
function detectDesktopPlatform() {
  return platformFromRuntime();
}
function hasDesktopCapability(capability, manifest) {
  if (manifest?.capabilities?.includes(capability)) return true;
  if (capability === "offline") return typeof navigator !== "undefined" && "onLine" in navigator;
  if (capability === "notifications") return typeof Notification !== "undefined";
  return false;
}
function createDesktopShell(options) {
  return {
    ...createDesktopManifest(options),
    title: options.title || options.name,
    subtitle: options.subtitle,
    status: {
      online: options.status?.online ?? (typeof navigator === "undefined" ? true : navigator.onLine),
      sync: options.status?.sync ?? "idle",
      queued: options.status?.queued ?? 0,
      message: options.status?.message,
      lastSyncedAt: options.status?.lastSyncedAt
    },
    actions: options.actions ?? [],
    bodyHtml: options.bodyHtml ?? ""
  };
}
function renderNav(items = []) {
  return items.map(
    (item) => `<a class="uif-desktop-nav-item" href="${esc(item.href && isSafeURL(item.href, { context: "link" }) ? item.href : "#")}"${item.active ? ' aria-current="page"' : ""}${item.permission ? ` data-uif-permission="${esc(item.permission)}"` : ""}>${item.icon ? `<span data-uif-icon="${esc(item.icon)}"></span>` : ""}<span>${esc(item.label)}</span>${item.badge !== void 0 ? `<em>${esc(item.badge)}</em>` : ""}</a>`
  ).join("");
}
function renderDesktopSyncStatus(status) {
  const state = status.sync ?? status.state ?? "idle";
  const queued = status.queued ?? 0;
  const label = status.message || (state === "offline" ? "Offline" : state === "failed" ? "Sync failed" : queued ? `${queued} queued` : "Synced");
  return `<span class="uif-desktop-status-pill" data-uif-sync-status="${esc(state)}"><span aria-hidden="true"></span>${esc(label)}</span>`;
}
function renderDesktopShell(options) {
  const shell = createDesktopShell(options);
  return `<section class="uif-desktop-shell" data-uif-desktop-app="${esc(shell.id)}" data-uif-desktop-platform="${esc(detectDesktopPlatform())}">
    <aside class="uif-desktop-sidebar">
      <div class="uif-desktop-brand"><strong>${esc(shell.name)}</strong>${shell.version ? `<span>${esc(shell.version)}</span>` : ""}</div>
      <nav class="uif-desktop-nav" data-uif="desktop-nav">${renderNav(shell.navigation)}</nav>
    </aside>
    <main class="uif-desktop-main">
      <header class="uif-desktop-topbar">
        <div><h1>${esc(shell.title)}</h1>${shell.subtitle ? `<p>${esc(shell.subtitle)}</p>` : ""}</div>
        <div class="uif-desktop-actions">${renderNav(shell.actions)}${renderDesktopSyncStatus(shell.status ?? {})}</div>
      </header>
      <div class="uif-desktop-content">${shell.bodyHtml}</div>
      <footer class="uif-desktop-statusbar" data-uif="desktop-status">${renderDesktopSyncStatus(shell.status ?? {})}</footer>
    </main>
  </section>`;
}
function setDesktopStatus(element, status) {
  element.querySelectorAll('[data-uif="desktop-status"], .uif-desktop-actions').forEach((target) => {
    const current = target.matches('[data-uif="desktop-status"]') ? target : target.querySelector("[data-uif-sync-status]");
    if (!current) return;
    const template = document.createElement("template");
    setTrustedHTML(template, renderDesktopSyncStatus(status), { trusted: true, context: "desktop status" });
    current.replaceWith(template.content);
  });
}
function initDesktopShell(element) {
  const raw = element.dataset.uifOptions || element.dataset.uifDesktop;
  if (raw) {
    const options = parseJSON(raw);
    if (options) setTrustedHTML(element, renderDesktopShell(options), { trusted: true, context: "desktop shell" });
    else element.dispatchEvent(new CustomEvent("uif:desktop-error", { bubbles: true, detail: { code: "desktop-invalid-options", element } }));
  }
  const dispose = bindDesktopOfflineIndicator(element);
  return dispose;
}
function createMemorySettingsStore(namespace = "uif-desktop") {
  const values = /* @__PURE__ */ new Map();
  const keyFor = (key) => `${namespace}:${key}`;
  return {
    get(key) {
      return values.get(keyFor(key)) ?? null;
    },
    set(key, value) {
      values.set(keyFor(key), value);
    },
    remove(key) {
      values.delete(keyFor(key));
    },
    clear() {
      [...values.keys()].filter((key) => key.startsWith(`${namespace}:`)).forEach((key) => values.delete(key));
    }
  };
}
function createLocalSettingsStore(namespace) {
  const storage = safeStorage();
  const fallback = createMemorySettingsStore(namespace);
  const keyFor = (key) => `${namespace}:${key}`;
  if (!storage) return fallback;
  return {
    get(key) {
      try {
        const value = storage.getItem(keyFor(key));
        return value === null ? fallback.get(key) : JSON.parse(value);
      } catch {
        return fallback.get(key);
      }
    },
    set(key, value) {
      fallback.set(key, value);
      try {
        storage.setItem(keyFor(key), JSON.stringify(value));
      } catch {
      }
    },
    remove(key) {
      fallback.remove(key);
      try {
        storage.removeItem(keyFor(key));
      } catch {
      }
    },
    clear() {
      fallback.clear();
      try {
        Object.keys(storage).filter((key) => key.startsWith(`${namespace}:`)).forEach((key) => storage.removeItem(key));
      } catch {
      }
    }
  };
}
function bindDesktopSettings(element, store) {
  element.querySelectorAll("[data-uif-setting]").forEach(async (field) => {
    const key = field.dataset.uifSetting;
    if (!key) return;
    const value = await store.get(key);
    if (field instanceof HTMLInputElement && field.type === "checkbox") field.checked = Boolean(value);
    else if (value !== null) field.value = String(value);
    field.addEventListener("change", () => {
      const next = field instanceof HTMLInputElement && field.type === "checkbox" ? field.checked : field.value;
      void store.set(key, next);
    });
  });
}
function createWorkspaceSession(input) {
  return {
    ...input,
    roles: input.roles ?? [],
    permissions: input.permissions ?? []
  };
}
function canUseDesktopAction(session, permission) {
  if (!permission) return true;
  if (!session) return false;
  return Boolean(session.permissions?.includes(permission) || session.permissions?.includes("*"));
}
function applyPermissionNavigation(root, session) {
  root.querySelectorAll("[data-uif-permission]").forEach((element) => {
    const allowed = canUseDesktopAction(session, element.dataset.uifPermission || "");
    element.hidden = !allowed;
    element.setAttribute("aria-hidden", String(!allowed));
  });
}
function renderWorkspaceIdentity(session) {
  const normalized = createWorkspaceSession(session);
  return `<div class="uif-desktop-identity"><strong>${esc(normalized.workspaceName)}</strong><span>${esc(normalized.userName)}${normalized.roles?.length ? ` \xB7 ${esc(normalized.roles.join(", "))}` : ""}</span></div>`;
}
function summarizeDesktopQueue(queueItems) {
  const queued = queueItems.filter((item) => item.status === "queued" || !item.status).length;
  const failed = queueItems.filter((item) => item.status === "failed").length;
  const syncing = queueItems.filter((item) => item.status === "syncing").length;
  const state = failed ? "failed" : syncing ? "syncing" : queued ? "queued" : "synced";
  return {
    state,
    queued,
    failed,
    syncing,
    message: failed ? `${failed} failed` : queued ? `${queued} queued` : syncing ? `${syncing} syncing` : "All changes synced"
  };
}
function createDesktopSyncStatus(input = {}) {
  return {
    state: input.state ?? "idle",
    queued: input.queued ?? 0,
    failed: input.failed ?? 0,
    syncing: input.syncing ?? 0,
    message: input.message ?? "Ready",
    lastSyncedAt: input.lastSyncedAt
  };
}
function bindDesktopOfflineIndicator(element, options = {}) {
  const update = () => {
    const online = typeof navigator === "undefined" ? true : navigator.onLine;
    element.toggleAttribute("data-uif-offline", !online);
    element.querySelectorAll("[data-uif-offline-label]").forEach((label) => {
      label.textContent = online ? options.onlineText ?? "Online" : options.offlineText ?? "Offline";
    });
  };
  update();
  if (typeof window === "undefined") return () => void 0;
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  return () => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  };
}
export {
  applyPermissionNavigation,
  bindDesktopOfflineIndicator,
  bindDesktopSettings,
  canUseDesktopAction,
  createDesktopManifest,
  createDesktopShell,
  createDesktopSyncStatus,
  createLocalSettingsStore,
  createMemorySettingsStore,
  createWorkspaceSession,
  detectDesktopPlatform,
  hasDesktopCapability,
  initDesktopShell,
  parseDesktopManifestElement,
  renderDesktopShell,
  renderDesktopSyncStatus,
  renderWorkspaceIdentity,
  setDesktopStatus,
  summarizeDesktopQueue,
  validateDesktopManifest
};
