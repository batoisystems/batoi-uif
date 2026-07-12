type DesktopWorkspaceMode = 'none' | 'optional' | 'required';
type DesktopOfflineMode = 'none' | 'cache' | 'queue';
type DesktopAiMode = 'none' | 'assistant' | 'approval';
type DesktopPlatform = 'browser' | 'tauri' | 'electron' | 'unknown';
type DesktopSyncState = 'offline' | 'idle' | 'queued' | 'syncing' | 'synced' | 'failed';
type DesktopCapability = 'files' | 'notifications' | 'secure-store' | 'deep-link' | 'offline' | 'workspace' | 'ai' | 'mcp';
interface DesktopNavigationItem {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    permission?: string;
    active?: boolean;
    badge?: string | number;
}
interface DesktopAppManifest {
    id: string;
    name: string;
    version?: string;
    workspaceMode?: DesktopWorkspaceMode;
    offlineMode?: DesktopOfflineMode;
    aiMode?: DesktopAiMode;
    capabilities?: DesktopCapability[];
    navigation?: DesktopNavigationItem[];
}
interface DesktopValidationResult {
    valid: boolean;
    errors: string[];
}
interface DesktopShellStatus {
    online?: boolean;
    sync?: DesktopSyncState;
    message?: string;
    lastSyncedAt?: string;
    queued?: number;
}
interface DesktopShellOptions extends DesktopAppManifest {
    title?: string;
    subtitle?: string;
    status?: DesktopShellStatus;
    actions?: DesktopNavigationItem[];
    bodyHtml?: string;
}
interface DesktopSettingsStore {
    get<T = unknown>(key: string): T | null | Promise<T | null>;
    set<T = unknown>(key: string, value: T): void | Promise<void>;
    remove(key: string): void | Promise<void>;
    clear(): void | Promise<void>;
}
interface SynchronousDesktopSettingsStore extends DesktopSettingsStore {
    get<T = unknown>(key: string): T | null;
    set<T = unknown>(key: string, value: T): void;
    remove(key: string): void;
    clear(): void;
}
interface DesktopWorkspaceSession {
    workspaceId: string;
    workspaceName: string;
    userId: string;
    userName: string;
    roles?: string[];
    permissions?: string[];
}
interface DesktopSyncQueueItem {
    status?: DesktopSyncState;
    attempts?: number;
    lastError?: string;
}
interface DesktopSyncStatus {
    state: DesktopSyncState;
    queued: number;
    failed: number;
    syncing: number;
    message: string;
    lastSyncedAt?: string;
}
declare function validateDesktopManifest(manifest: Partial<DesktopAppManifest>): DesktopValidationResult;
declare function createDesktopManifest(input: DesktopAppManifest): DesktopAppManifest;
declare function parseDesktopManifestElement(element: HTMLElement): DesktopAppManifest;
declare function detectDesktopPlatform(): DesktopPlatform;
declare function hasDesktopCapability(capability: DesktopCapability, manifest?: Partial<DesktopAppManifest>): boolean;
declare function createDesktopShell(options: DesktopShellOptions): DesktopShellOptions;
declare function renderDesktopSyncStatus(status: DesktopSyncStatus | DesktopShellStatus): string;
declare function renderDesktopShell(options: DesktopShellOptions): string;
declare function setDesktopStatus(element: HTMLElement, status: DesktopShellStatus): void;
declare function initDesktopShell(element: HTMLElement): () => void;
declare function createMemorySettingsStore(namespace?: string): SynchronousDesktopSettingsStore;
declare function createLocalSettingsStore(namespace: string): DesktopSettingsStore;
declare function bindDesktopSettings(element: HTMLElement, store: DesktopSettingsStore): void;
declare function createWorkspaceSession(input: DesktopWorkspaceSession): DesktopWorkspaceSession;
declare function canUseDesktopAction(session: DesktopWorkspaceSession | undefined, permission: string): boolean;
declare function applyPermissionNavigation(root: ParentNode, session?: DesktopWorkspaceSession): void;
declare function renderWorkspaceIdentity(session: DesktopWorkspaceSession): string;
declare function summarizeDesktopQueue(queueItems: DesktopSyncQueueItem[]): DesktopSyncStatus;
declare function createDesktopSyncStatus(input?: Partial<DesktopSyncStatus>): DesktopSyncStatus;
declare function bindDesktopOfflineIndicator(element: HTMLElement, options?: {
    offlineText?: string;
    onlineText?: string;
}): () => void;

export { type DesktopAiMode, type DesktopAppManifest, type DesktopCapability, type DesktopNavigationItem, type DesktopOfflineMode, type DesktopPlatform, type DesktopSettingsStore, type DesktopShellOptions, type DesktopShellStatus, type DesktopSyncQueueItem, type DesktopSyncState, type DesktopSyncStatus, type DesktopValidationResult, type DesktopWorkspaceMode, type DesktopWorkspaceSession, applyPermissionNavigation, bindDesktopOfflineIndicator, bindDesktopSettings, canUseDesktopAction, createDesktopManifest, createDesktopShell, createDesktopSyncStatus, createLocalSettingsStore, createMemorySettingsStore, createWorkspaceSession, detectDesktopPlatform, hasDesktopCapability, initDesktopShell, parseDesktopManifestElement, renderDesktopShell, renderDesktopSyncStatus, renderWorkspaceIdentity, setDesktopStatus, summarizeDesktopQueue, validateDesktopManifest };
