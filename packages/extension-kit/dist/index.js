// src/index.ts
function createExtensionManifest(options) {
  const surfaces = options.surfaces ?? {};
  const manifest = {
    manifest_version: 3,
    name: options.name,
    version: options.version ?? "0.1.0",
    description: options.description,
    permissions: options.permissions ?? ["storage"],
    host_permissions: options.hostPermissions ?? [],
    icons: options.icons
  };
  if (surfaces.popup) manifest.action = { default_popup: surfaces.popup };
  if (surfaces.options) manifest.options_page = surfaces.options;
  if (surfaces.sidePanel) manifest.side_panel = { default_path: surfaces.sidePanel };
  if (surfaces.serviceWorker) manifest.background = { service_worker: surfaces.serviceWorker, type: "module" };
  if (surfaces.contentScript) {
    manifest.content_scripts = [
      {
        matches: options.hostPermissions?.length ? options.hostPermissions : ["<all_urls>"],
        js: [surfaces.contentScript]
      }
    ];
  }
  return manifest;
}
function isExtensionRuntime(runtime = globalThis.chrome?.runtime) {
  return Boolean(runtime && typeof runtime === "object");
}
function createExtensionMessage(type, payload, requestId = crypto.randomUUID()) {
  return { type, payload, requestId };
}
export {
  createExtensionManifest,
  createExtensionMessage,
  isExtensionRuntime
};
