export type MicroAppStorageMode = 'local-only' | 'local-first' | 'sync-optional' | 'connected' | 'shared';
export type MicroAppLocalStore = 'indexeddb' | 'localstorage' | 'memory' | 'none';
export type MicroAppRealtimeTransport = 'websocket' | 'sse' | 'polling';
export type MicroAppConnectorType = 'api' | 'csv' | 'json' | 'spreadsheet' | 'google-sheet' | 'static';
export type MicroAppConnectorMode = 'readonly' | 'readwrite';

export interface MicroAppStorageManifest {
  mode?: MicroAppStorageMode;
  localStore?: MicroAppLocalStore;
  sharedStore?: boolean;
  namespace?: string;
  encrypted?: boolean;
}

export interface MicroAppRealtimeManifest {
  enabled?: boolean;
  channel?: string;
  transport?: MicroAppRealtimeTransport;
  fallback?: 'polling' | 'none';
}

export interface MicroAppConnectorManifest {
  type: MicroAppConnectorType;
  name?: string;
  mode?: MicroAppConnectorMode;
  src?: string;
  refreshInterval?: number;
  schema?: Record<string, unknown>;
}

export interface MicroAppPermissionsManifest {
  network?: string[];
  storage?: boolean;
  realtime?: boolean;
  ai?: boolean;
  mcp?: boolean;
}

export interface MicroAppManifest {
  name: string;
  type: 'micro-app';
  version?: string;
  description?: string;
  entry?: string;
  storage: Required<Pick<MicroAppStorageManifest, 'mode' | 'localStore' | 'sharedStore'>> & MicroAppStorageManifest;
  realtime: Required<Pick<MicroAppRealtimeManifest, 'enabled'>> & MicroAppRealtimeManifest;
  connectors: MicroAppConnectorManifest[];
  permissions: MicroAppPermissionsManifest;
  build?: {
    upgradeable?: boolean;
    appType?: string;
  };
  ui?: {
    mount?: string;
    title?: string;
    icon?: string;
  };
  [key: string]: unknown;
}

export interface MicroAppManifestIssue {
  path: string;
  message: string;
}

export interface MicroAppManifestResult {
  manifest: MicroAppManifest;
  issues: MicroAppManifestIssue[];
  valid: boolean;
}

export interface MicroAppConnectorWorkflow {
  name: string;
  type: MicroAppConnectorType;
  mode: MicroAppConnectorMode;
  src?: string;
  refreshInterval?: number;
  permission: 'local' | 'allowed' | 'blocked';
  reason?: string;
}

const storageModes = new Set<MicroAppStorageMode>(['local-only', 'local-first', 'sync-optional', 'connected', 'shared']);
const localStores = new Set<MicroAppLocalStore>(['indexeddb', 'localstorage', 'memory', 'none']);
const transports = new Set<MicroAppRealtimeTransport>(['websocket', 'sse', 'polling']);
const connectorTypes = new Set<MicroAppConnectorType>(['api', 'csv', 'json', 'spreadsheet', 'google-sheet', 'static']);
const connectorModes = new Set<MicroAppConnectorMode>(['readonly', 'readwrite']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeStorage(raw: unknown, issues: MicroAppManifestIssue[]): MicroAppManifest['storage'] {
  const source = isRecord(raw) ? raw : {};
  const mode = stringValue(source.mode);
  const localStore = stringValue(source.localStore);
  if (mode && !storageModes.has(mode as MicroAppStorageMode)) issues.push({ path: 'storage.mode', message: `Unsupported storage mode: ${mode}` });
  if (localStore && !localStores.has(localStore as MicroAppLocalStore)) issues.push({ path: 'storage.localStore', message: `Unsupported local store: ${localStore}` });
  return {
    mode: storageModes.has(mode as MicroAppStorageMode) ? (mode as MicroAppStorageMode) : 'local-first',
    localStore: localStores.has(localStore as MicroAppLocalStore) ? (localStore as MicroAppLocalStore) : 'indexeddb',
    sharedStore: booleanValue(source.sharedStore, false),
    namespace: stringValue(source.namespace),
    encrypted: booleanValue(source.encrypted, false),
  };
}

function normalizeRealtime(raw: unknown, issues: MicroAppManifestIssue[]): MicroAppManifest['realtime'] {
  const source = isRecord(raw) ? raw : {};
  const transport = stringValue(source.transport);
  if (transport && !transports.has(transport as MicroAppRealtimeTransport)) issues.push({ path: 'realtime.transport', message: `Unsupported transport: ${transport}` });
  return {
    enabled: booleanValue(source.enabled, false),
    channel: stringValue(source.channel),
    transport: transports.has(transport as MicroAppRealtimeTransport) ? (transport as MicroAppRealtimeTransport) : 'polling',
    fallback: source.fallback === 'none' ? 'none' : 'polling',
  };
}

function normalizeConnector(raw: unknown, index: number, issues: MicroAppManifestIssue[]): MicroAppConnectorManifest | undefined {
  if (!isRecord(raw)) {
    issues.push({ path: `connectors.${index}`, message: 'Connector must be an object' });
    return undefined;
  }
  const type = stringValue(raw.type);
  const mode = stringValue(raw.mode);
  if (!type || !connectorTypes.has(type as MicroAppConnectorType)) {
    issues.push({ path: `connectors.${index}.type`, message: type ? `Unsupported connector type: ${type}` : 'Connector type is required' });
    return undefined;
  }
  if (mode && !connectorModes.has(mode as MicroAppConnectorMode)) issues.push({ path: `connectors.${index}.mode`, message: `Unsupported connector mode: ${mode}` });
  return {
    type: type as MicroAppConnectorType,
    name: stringValue(raw.name),
    mode: connectorModes.has(mode as MicroAppConnectorMode) ? (mode as MicroAppConnectorMode) : 'readonly',
    src: stringValue(raw.src),
    refreshInterval: typeof raw.refreshInterval === 'number' ? raw.refreshInterval : undefined,
    schema: isRecord(raw.schema) ? raw.schema : undefined,
  };
}

function normalizePermissions(raw: unknown): MicroAppPermissionsManifest {
  const source = isRecord(raw) ? raw : {};
  return {
    network: Array.isArray(source.network) ? source.network.filter((item): item is string => typeof item === 'string') : [],
    storage: booleanValue(source.storage, true),
    realtime: booleanValue(source.realtime, false),
    ai: booleanValue(source.ai, false),
    mcp: booleanValue(source.mcp, false),
  };
}

export function validateMicroAppManifest(input: unknown): MicroAppManifestResult {
  const issues: MicroAppManifestIssue[] = [];
  const source = isRecord(input) ? input : {};
  if (!isRecord(input)) issues.push({ path: '$', message: 'Manifest must be an object' });
  const name = stringValue(source.name);
  if (!name) issues.push({ path: 'name', message: 'Micro App name is required' });
  if (source.type !== 'micro-app') issues.push({ path: 'type', message: 'Manifest type must be "micro-app"' });
  const connectors = Array.isArray(source.connectors) ? source.connectors.map((item, index) => normalizeConnector(item, index, issues)).filter((item): item is MicroAppConnectorManifest => Boolean(item)) : [];

  const manifest: MicroAppManifest = {
    ...source,
    name: name ?? 'Untitled Micro App',
    type: 'micro-app',
    version: stringValue(source.version),
    description: stringValue(source.description),
    entry: stringValue(source.entry),
    storage: normalizeStorage(source.storage, issues),
    realtime: normalizeRealtime(source.realtime, issues),
    connectors,
    permissions: normalizePermissions(source.permissions),
    build: isRecord(source.build) ? { upgradeable: booleanValue(source.build.upgradeable, false), appType: stringValue(source.build.appType) } : undefined,
    ui: isRecord(source.ui) ? { mount: stringValue(source.ui.mount), title: stringValue(source.ui.title), icon: stringValue(source.ui.icon) } : undefined,
  };

  return { manifest, issues, valid: issues.length === 0 };
}

export function parseMicroAppManifest(input: unknown): MicroAppManifest {
  const result = validateMicroAppManifest(input);
  if (!result.valid) {
    const message = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid Micro App manifest: ${message}`);
  }
  return result.manifest;
}

function sameOrigin(src: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function sourceAllowed(src: string | undefined, permissions: MicroAppPermissionsManifest): boolean {
  if (!src) return false;
  const network = permissions.network ?? [];
  if (network.includes('*')) return true;
  if (network.includes('self') && sameOrigin(src)) return true;
  try {
    const url = new URL(src, typeof window === 'undefined' ? 'http://localhost/' : window.location.href);
    return network.some((entry) => entry === src || entry === url.origin || (entry.endsWith('*') && src.startsWith(entry.slice(0, -1))));
  } catch {
    return network.includes(src);
  }
}

export function listMicroAppConnectorWorkflows(manifest: MicroAppManifest): MicroAppConnectorWorkflow[] {
  return manifest.connectors.map((connector, index) => {
    const name = connector.name || `Connector ${index + 1}`;
    if (connector.type === 'static') {
      return {
        name,
        type: connector.type,
        mode: connector.mode ?? 'readonly',
        src: connector.src,
        refreshInterval: connector.refreshInterval,
        permission: 'local',
      };
    }
    if (!connector.src) {
      return {
        name,
        type: connector.type,
        mode: connector.mode ?? 'readonly',
        refreshInterval: connector.refreshInterval,
        permission: 'blocked',
        reason: 'Connector source is required.',
      };
    }
    const allowed = sourceAllowed(connector.src, manifest.permissions);
    return {
      name,
      type: connector.type,
      mode: connector.mode ?? 'readonly',
      src: connector.src,
      refreshInterval: connector.refreshInterval,
      permission: allowed ? 'allowed' : 'blocked',
      reason: allowed ? undefined : 'Connector source is not listed in permissions.network.',
    };
  });
}

export function validateMicroAppConnectorWorkflows(manifest: MicroAppManifest): MicroAppManifestIssue[] {
  return listMicroAppConnectorWorkflows(manifest)
    .map((workflow, index): MicroAppManifestIssue | undefined =>
      workflow.permission === 'blocked' ? { path: `connectors.${index}.src`, message: workflow.reason ?? 'Connector is blocked' } : undefined,
    )
    .filter((issue): issue is MicroAppManifestIssue => Boolean(issue));
}
