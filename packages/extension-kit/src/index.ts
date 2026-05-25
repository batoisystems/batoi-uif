export interface ExtensionSurface {
  popup?: string;
  options?: string;
  sidePanel?: string;
  contentScript?: string;
  serviceWorker?: string;
}

export interface ExtensionManifestOptions {
  name: string;
  version?: string;
  description?: string;
  permissions?: string[];
  hostPermissions?: string[];
  icons?: Record<string, string>;
  surfaces?: ExtensionSurface;
}

export interface ExtensionMessage<T = unknown> {
  type: string;
  payload?: T;
  requestId?: string;
}

export function createExtensionManifest(options: ExtensionManifestOptions): Record<string, unknown> {
  const surfaces = options.surfaces ?? {};
  const manifest: Record<string, unknown> = {
    manifest_version: 3,
    name: options.name,
    version: options.version ?? '0.1.0',
    description: options.description,
    permissions: options.permissions ?? ['storage'],
    host_permissions: options.hostPermissions ?? [],
    icons: options.icons,
  };
  if (surfaces.popup) manifest.action = { default_popup: surfaces.popup };
  if (surfaces.options) manifest.options_page = surfaces.options;
  if (surfaces.sidePanel) manifest.side_panel = { default_path: surfaces.sidePanel };
  if (surfaces.serviceWorker) manifest.background = { service_worker: surfaces.serviceWorker, type: 'module' };
  if (surfaces.contentScript) {
    manifest.content_scripts = [
      {
        matches: options.hostPermissions?.length ? options.hostPermissions : ['<all_urls>'],
        js: [surfaces.contentScript],
      },
    ];
  }
  return manifest;
}

export function isExtensionRuntime(runtime: unknown = globalThis.chrome?.runtime): boolean {
  return Boolean(runtime && typeof runtime === 'object');
}

export function createExtensionMessage<T = unknown>(type: string, payload?: T, requestId = crypto.randomUUID()): ExtensionMessage<T> {
  return { type, payload, requestId };
}

declare global {
  interface Window {
    chrome?: {
      runtime?: unknown;
    };
  }

  var chrome: { runtime?: unknown } | undefined;
}
