export type DesktopWorkspaceMode = 'none' | 'optional' | 'required';
export type DesktopOfflineMode = 'none' | 'cache' | 'queue';
export type DesktopAiMode = 'none' | 'assistant' | 'approval';
export type DesktopPlatform = 'browser' | 'tauri' | 'electron' | 'unknown';
export type DesktopSyncState = 'offline' | 'idle' | 'queued' | 'syncing' | 'synced' | 'failed';
export type DesktopCapability = 'files' | 'notifications' | 'secure-store' | 'deep-link' | 'offline' | 'workspace' | 'ai' | 'mcp';

export interface DesktopNavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  permission?: string;
  active?: boolean;
  badge?: string | number;
}

export interface DesktopAppManifest {
  id: string;
  name: string;
  version?: string;
  workspaceMode?: DesktopWorkspaceMode;
  offlineMode?: DesktopOfflineMode;
  aiMode?: DesktopAiMode;
  capabilities?: DesktopCapability[];
  navigation?: DesktopNavigationItem[];
}

export interface DesktopValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DesktopShellStatus {
  online?: boolean;
  sync?: DesktopSyncState;
  message?: string;
  lastSyncedAt?: string;
  queued?: number;
}

export interface DesktopShellOptions extends DesktopAppManifest {
  title?: string;
  subtitle?: string;
  status?: DesktopShellStatus;
  actions?: DesktopNavigationItem[];
  bodyHtml?: string;
}

export interface DesktopSettingsStore {
  get<T = unknown>(key: string): T | null | Promise<T | null>;
  set<T = unknown>(key: string, value: T): void | Promise<void>;
  remove(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export interface DesktopWorkspaceSession {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userName: string;
  roles?: string[];
  permissions?: string[];
}

export interface DesktopSyncQueueItem {
  status?: DesktopSyncState;
  attempts?: number;
  lastError?: string;
}

export interface DesktopSyncStatus {
  state: DesktopSyncState;
  queued: number;
  failed: number;
  syncing: number;
  message: string;
  lastSyncedAt?: string;
}

function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function parseJSON<T>(value: string | undefined): T | undefined {
  if (!value) return undefined;
  return JSON.parse(value) as T;
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

function platformFromRuntime(): DesktopPlatform {
  const globalValue = globalThis as typeof globalThis & {
    __TAURI_INTERNALS__?: unknown;
    process?: { versions?: { electron?: string } };
  };
  if (globalValue.__TAURI_INTERNALS__) return 'tauri';
  if (globalValue.process?.versions?.electron) return 'electron';
  if (typeof window !== 'undefined') return 'browser';
  return 'unknown';
}

function normalizeManifest(input: DesktopAppManifest): DesktopAppManifest {
  return {
    ...input,
    workspaceMode: input.workspaceMode ?? 'none',
    offlineMode: input.offlineMode ?? 'none',
    aiMode: input.aiMode ?? 'none',
    capabilities: input.capabilities ?? [],
    navigation: input.navigation ?? [],
  };
}

export function validateDesktopManifest(manifest: Partial<DesktopAppManifest>): DesktopValidationResult {
  const errors: string[] = [];
  if (!manifest.id || typeof manifest.id !== 'string') errors.push('Desktop manifest requires a string id.');
  if (!manifest.name || typeof manifest.name !== 'string') errors.push('Desktop manifest requires a string name.');
  if (manifest.navigation?.some((item) => !item.id || !item.label)) errors.push('Every desktop navigation item requires id and label.');
  return { valid: errors.length === 0, errors };
}

export function createDesktopManifest(input: DesktopAppManifest): DesktopAppManifest {
  const result = validateDesktopManifest(input);
  if (!result.valid) throw new Error(result.errors.join(' '));
  return normalizeManifest(input);
}

export function parseDesktopManifestElement(element: HTMLElement): DesktopAppManifest {
  const options = parseJSON<Partial<DesktopAppManifest>>(element.dataset.uifOptions || element.dataset.uifDesktop);
  return createDesktopManifest({
    id: element.dataset.uifDesktopApp || options?.id || 'desktop-app',
    name: options?.name || element.dataset.uifDesktopName || element.getAttribute('aria-label') || 'Desktop App',
    version: options?.version || element.dataset.uifDesktopVersion,
    workspaceMode: options?.workspaceMode,
    offlineMode: options?.offlineMode,
    aiMode: options?.aiMode,
    capabilities: options?.capabilities,
    navigation: options?.navigation,
  });
}

export function detectDesktopPlatform(): DesktopPlatform {
  return platformFromRuntime();
}

export function hasDesktopCapability(capability: DesktopCapability, manifest?: Partial<DesktopAppManifest>): boolean {
  if (manifest?.capabilities?.includes(capability)) return true;
  if (capability === 'offline') return typeof navigator !== 'undefined' && 'onLine' in navigator;
  if (capability === 'notifications') return typeof Notification !== 'undefined';
  return false;
}

export function createDesktopShell(options: DesktopShellOptions): DesktopShellOptions {
  return {
    ...createDesktopManifest(options),
    title: options.title || options.name,
    subtitle: options.subtitle,
    status: {
      online: options.status?.online ?? (typeof navigator === 'undefined' ? true : navigator.onLine),
      sync: options.status?.sync ?? 'idle',
      queued: options.status?.queued ?? 0,
      message: options.status?.message,
      lastSyncedAt: options.status?.lastSyncedAt,
    },
    actions: options.actions ?? [],
    bodyHtml: options.bodyHtml ?? '',
  };
}

function renderNav(items: DesktopNavigationItem[] = []): string {
  return items
    .map(
      (item) =>
        `<a class="uif-desktop-nav-item" href="${esc(item.href || '#')}"${item.active ? ' aria-current="page"' : ''}${item.permission ? ` data-uif-permission="${esc(item.permission)}"` : ''}>${item.icon ? `<span data-uif-icon="${esc(item.icon)}"></span>` : ''}<span>${esc(item.label)}</span>${item.badge !== undefined ? `<em>${esc(item.badge)}</em>` : ''}</a>`,
    )
    .join('');
}

export function renderDesktopSyncStatus(status: DesktopSyncStatus | DesktopShellStatus): string {
  const state = (status as DesktopShellStatus).sync ?? (status as DesktopSyncStatus).state ?? 'idle';
  const queued = status.queued ?? 0;
  const label = status.message || (state === 'offline' ? 'Offline' : state === 'failed' ? 'Sync failed' : queued ? `${queued} queued` : 'Synced');
  return `<span class="uif-desktop-status-pill" data-uif-sync-status="${esc(state)}"><span aria-hidden="true"></span>${esc(label)}</span>`;
}

export function renderDesktopShell(options: DesktopShellOptions): string {
  const shell = createDesktopShell(options);
  return `<section class="uif-desktop-shell" data-uif-desktop-app="${esc(shell.id)}" data-uif-desktop-platform="${esc(detectDesktopPlatform())}">
    <aside class="uif-desktop-sidebar">
      <div class="uif-desktop-brand"><strong>${esc(shell.name)}</strong>${shell.version ? `<span>${esc(shell.version)}</span>` : ''}</div>
      <nav class="uif-desktop-nav" data-uif="desktop-nav">${renderNav(shell.navigation)}</nav>
    </aside>
    <main class="uif-desktop-main">
      <header class="uif-desktop-topbar">
        <div><h1>${esc(shell.title)}</h1>${shell.subtitle ? `<p>${esc(shell.subtitle)}</p>` : ''}</div>
        <div class="uif-desktop-actions">${renderNav(shell.actions)}${renderDesktopSyncStatus(shell.status ?? {})}</div>
      </header>
      <div class="uif-desktop-content">${shell.bodyHtml}</div>
      <footer class="uif-desktop-statusbar" data-uif="desktop-status">${renderDesktopSyncStatus(shell.status ?? {})}</footer>
    </main>
  </section>`;
}

export function setDesktopStatus(element: HTMLElement, status: DesktopShellStatus): void {
  element.querySelectorAll<HTMLElement>('[data-uif="desktop-status"], .uif-desktop-actions').forEach((target) => {
    const current = target.matches('[data-uif="desktop-status"]') ? target : target.querySelector<HTMLElement>('[data-uif-sync-status]');
    if (!current) return;
    current.outerHTML = renderDesktopSyncStatus(status);
  });
}

export function initDesktopShell(element: HTMLElement): () => void {
  const raw = element.dataset.uifOptions || element.dataset.uifDesktop;
  if (raw) element.innerHTML = renderDesktopShell(parseJSON<DesktopShellOptions>(raw) as DesktopShellOptions);
  const dispose = bindDesktopOfflineIndicator(element);
  return dispose;
}

export function createMemorySettingsStore(namespace = 'uif-desktop'): DesktopSettingsStore {
  const values = new Map<string, unknown>();
  const keyFor = (key: string) => `${namespace}:${key}`;
  return {
    get<T = unknown>(key: string): T | null {
      return (values.get(keyFor(key)) as T | undefined) ?? null;
    },
    set<T = unknown>(key: string, value: T): void {
      values.set(keyFor(key), value);
    },
    remove(key: string): void {
      values.delete(keyFor(key));
    },
    clear(): void {
      [...values.keys()].filter((key) => key.startsWith(`${namespace}:`)).forEach((key) => values.delete(key));
    },
  };
}

export function createLocalSettingsStore(namespace: string): DesktopSettingsStore {
  const storage = safeStorage();
  const fallback = createMemorySettingsStore(namespace);
  const keyFor = (key: string) => `${namespace}:${key}`;
  if (!storage) return fallback;
  return {
    get<T = unknown>(key: string): T | null {
      const value = storage.getItem(keyFor(key));
      return value === null ? null : (JSON.parse(value) as T);
    },
    set<T = unknown>(key: string, value: T): void {
      storage.setItem(keyFor(key), JSON.stringify(value));
    },
    remove(key: string): void {
      storage.removeItem(keyFor(key));
    },
    clear(): void {
      Object.keys(storage)
        .filter((key) => key.startsWith(`${namespace}:`))
        .forEach((key) => storage.removeItem(key));
    },
  };
}

export function bindDesktopSettings(element: HTMLElement, store: DesktopSettingsStore): void {
  element.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-uif-setting]').forEach(async (field) => {
    const key = field.dataset.uifSetting;
    if (!key) return;
    const value = await store.get<string | boolean>(key);
    if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = Boolean(value);
    else if (value !== null) field.value = String(value);
    field.addEventListener('change', () => {
      const next = field instanceof HTMLInputElement && field.type === 'checkbox' ? field.checked : field.value;
      void store.set(key, next);
    });
  });
}

export function createWorkspaceSession(input: DesktopWorkspaceSession): DesktopWorkspaceSession {
  return {
    ...input,
    roles: input.roles ?? [],
    permissions: input.permissions ?? [],
  };
}

export function canUseDesktopAction(session: DesktopWorkspaceSession | undefined, permission: string): boolean {
  if (!permission) return true;
  if (!session) return false;
  return Boolean(session.permissions?.includes(permission) || session.permissions?.includes('*'));
}

export function applyPermissionNavigation(root: ParentNode, session?: DesktopWorkspaceSession): void {
  root.querySelectorAll<HTMLElement>('[data-uif-permission]').forEach((element) => {
    const allowed = canUseDesktopAction(session, element.dataset.uifPermission || '');
    element.hidden = !allowed;
    element.setAttribute('aria-hidden', String(!allowed));
  });
}

export function renderWorkspaceIdentity(session: DesktopWorkspaceSession): string {
  const normalized = createWorkspaceSession(session);
  return `<div class="uif-desktop-identity"><strong>${esc(normalized.workspaceName)}</strong><span>${esc(normalized.userName)}${normalized.roles?.length ? ` · ${esc(normalized.roles.join(', '))}` : ''}</span></div>`;
}

export function summarizeDesktopQueue(queueItems: DesktopSyncQueueItem[]): DesktopSyncStatus {
  const queued = queueItems.filter((item) => item.status === 'queued' || !item.status).length;
  const failed = queueItems.filter((item) => item.status === 'failed').length;
  const syncing = queueItems.filter((item) => item.status === 'syncing').length;
  const state: DesktopSyncState = failed ? 'failed' : syncing ? 'syncing' : queued ? 'queued' : 'synced';
  return {
    state,
    queued,
    failed,
    syncing,
    message: failed ? `${failed} failed` : queued ? `${queued} queued` : syncing ? `${syncing} syncing` : 'All changes synced',
  };
}

export function createDesktopSyncStatus(input: Partial<DesktopSyncStatus> = {}): DesktopSyncStatus {
  return {
    state: input.state ?? 'idle',
    queued: input.queued ?? 0,
    failed: input.failed ?? 0,
    syncing: input.syncing ?? 0,
    message: input.message ?? 'Ready',
    lastSyncedAt: input.lastSyncedAt,
  };
}

export function bindDesktopOfflineIndicator(element: HTMLElement, options: { offlineText?: string; onlineText?: string } = {}): () => void {
  const update = () => {
    const online = typeof navigator === 'undefined' ? true : navigator.onLine;
    element.toggleAttribute('data-uif-offline', !online);
    element.querySelectorAll<HTMLElement>('[data-uif-offline-label]').forEach((label) => {
      label.textContent = online ? (options.onlineText ?? 'Online') : (options.offlineText ?? 'Offline');
    });
  };
  update();
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  return () => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  };
}
