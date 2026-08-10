// src/index.ts
function profile(name, packages, purpose) {
  return Object.freeze({ name, version: 3, entryPoint: `@batoi/uif-profiles/${name}`, packages: Object.freeze([...packages]), purpose });
}
var uifProfiles = Object.freeze({
  all: profile("all", ["core", "dom", "query", "net", "state", "actions", "effects", "overlays", "components", "forms", "editor", "table", "router", "rad-adapter", "charts", "dashboard", "desktop", "realtime", "pwa", "push", "mobile", "ai", "mcp", "icons", "extension-kit"], "Complete namespace-based framework surface for tooling and broad applications."),
  rad: profile("rad", ["core", "dom", "net", "state", "actions", "components", "forms", "editor", "table", "router", "rad-adapter", "icons"], "Server-rendered Batoi RAD applications and partial updates."),
  dashboard: profile("dashboard", ["core", "dom", "net", "state", "components", "table", "charts", "dashboard", "realtime", "icons"], "Data-rich dashboards and realtime operational views."),
  mobile: profile("mobile", ["core", "dom", "net", "state", "components", "mobile", "pwa", "push", "realtime", "icons"], "Mobile shells, progressive web apps, offline status, and notifications."),
  desktop: profile("desktop", ["core", "dom", "net", "state", "components", "desktop", "pwa", "realtime", "icons"], "Desktop-style workspaces and resilient application shells."),
  agent: profile("agent", ["core", "dom", "net", "components", "ai", "mcp", "icons"], "Provider-neutral assistant and governed tool-review interfaces.")
});
function getUIFProfile(name) {
  return uifProfiles[name];
}

export {
  uifProfiles,
  getUIFProfile
};
