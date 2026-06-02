"use strict";
var BatoiUIF = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    emit: () => emit,
    init: () => init,
    on: () => on,
    parseMicroAppManifest: () => parseMicroAppManifest,
    parseOptions: () => parseOptions,
    registerPlugin: () => registerPlugin,
    setAccent: () => setAccent,
    setDensity: () => setDensity,
    uifActions: () => uifActions,
    uifAttributes: () => uifAttributes,
    uifStates: () => uifStates,
    uifValues: () => uifValues,
    validateMicroAppManifest: () => validateMicroAppManifest
  });

  // src/attributes.ts
  var uifAttributes = [
    "data-uif",
    "data-uif-id",
    "data-uif-role",
    "data-uif-action",
    "data-uif-target",
    "data-uif-src",
    "data-uif-method",
    "data-uif-trigger",
    "data-uif-state",
    "data-uif-bind",
    "data-uif-model",
    "data-uif-value",
    "data-uif-route",
    "data-uif-mode",
    "data-uif-options",
    "data-uif-confirm",
    "data-uif-disabled",
    "data-uif-loading",
    "data-uif-success",
    "data-uif-error",
    "data-uif-swap",
    "data-uif-cache",
    "data-uif-validate",
    "data-uif-rule",
    "data-uif-event",
    "data-uif-on",
    "data-uif-refresh",
    "data-uif-persist",
    "data-uif-density",
    "data-uif-sidebar-key",
    "data-uif-density-key",
    "data-uif-toolbar",
    "data-uif-preview",
    "data-uif-animation",
    "data-uif-duration",
    "data-uif-delay",
    "data-uif-placement",
    "data-uif-container",
    "data-uif-html",
    "data-uif-backdrop",
    "data-uif-scroll",
    "data-uif-breakpoint",
    "data-uif-class",
    "data-uif-attribute",
    "data-uif-key"
  ];
  var uifValues = [
    "button",
    "modal",
    "drawer",
    "offcanvas",
    "dropdown",
    "tabs",
    "toast",
    "accordion",
    "tooltip",
    "popover",
    "table",
    "form",
    "editor",
    "ajax",
    "route",
    "shell",
    "nav",
    "chart",
    "animate",
    "realtime",
    "push",
    "mobile-shell",
    "ai-action",
    "tool-approval"
  ];
  var uifActions = [
    "open",
    "close",
    "toggle",
    "toggle-sidebar",
    "toggle-section",
    "submit",
    "load",
    "reload",
    "delete",
    "save",
    "reset",
    "clear",
    "select",
    "activate",
    "deactivate",
    "navigate",
    "swap",
    "append",
    "prepend",
    "remove",
    "toast",
    "set-density",
    "animate",
    "add-class",
    "remove-class",
    "toggle-class",
    "set-attribute",
    "remove-attribute",
    "set-value",
    "copy",
    "scroll-to",
    "focus",
    "emit",
    "subscribe",
    "connect",
    "disconnect",
    "approve",
    "reject"
  ];
  var uifStates = [
    "idle",
    "loading",
    "loaded",
    "error",
    "success",
    "active",
    "inactive",
    "open",
    "closed",
    "disabled",
    "selected",
    "expanded",
    "collapsed",
    "connected",
    "disconnected",
    "pending",
    "approved",
    "rejected"
  ];

  // src/micro-app.ts
  var storageModes = /* @__PURE__ */ new Set(["local-only", "local-first", "sync-optional", "connected", "shared"]);
  var localStores = /* @__PURE__ */ new Set(["indexeddb", "localstorage", "memory", "none"]);
  var transports = /* @__PURE__ */ new Set(["websocket", "sse", "polling"]);
  var connectorTypes = /* @__PURE__ */ new Set(["api", "csv", "json", "spreadsheet", "google-sheet", "static"]);
  var connectorModes = /* @__PURE__ */ new Set(["readonly", "readwrite"]);
  function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }
  function stringValue(value) {
    return typeof value === "string" && value.trim() ? value.trim() : void 0;
  }
  function booleanValue(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }
  function normalizeStorage(raw, issues) {
    const source = isRecord(raw) ? raw : {};
    const mode = stringValue(source.mode);
    const localStore = stringValue(source.localStore);
    if (mode && !storageModes.has(mode)) issues.push({ path: "storage.mode", message: `Unsupported storage mode: ${mode}` });
    if (localStore && !localStores.has(localStore)) issues.push({ path: "storage.localStore", message: `Unsupported local store: ${localStore}` });
    return {
      mode: storageModes.has(mode) ? mode : "local-first",
      localStore: localStores.has(localStore) ? localStore : "indexeddb",
      sharedStore: booleanValue(source.sharedStore, false),
      namespace: stringValue(source.namespace),
      encrypted: booleanValue(source.encrypted, false)
    };
  }
  function normalizeRealtime(raw, issues) {
    const source = isRecord(raw) ? raw : {};
    const transport = stringValue(source.transport);
    if (transport && !transports.has(transport)) issues.push({ path: "realtime.transport", message: `Unsupported transport: ${transport}` });
    return {
      enabled: booleanValue(source.enabled, false),
      channel: stringValue(source.channel),
      transport: transports.has(transport) ? transport : "polling",
      fallback: source.fallback === "none" ? "none" : "polling"
    };
  }
  function normalizeConnector(raw, index, issues) {
    if (!isRecord(raw)) {
      issues.push({ path: `connectors.${index}`, message: "Connector must be an object" });
      return void 0;
    }
    const type = stringValue(raw.type);
    const mode = stringValue(raw.mode);
    if (!type || !connectorTypes.has(type)) {
      issues.push({ path: `connectors.${index}.type`, message: type ? `Unsupported connector type: ${type}` : "Connector type is required" });
      return void 0;
    }
    if (mode && !connectorModes.has(mode)) issues.push({ path: `connectors.${index}.mode`, message: `Unsupported connector mode: ${mode}` });
    return {
      type,
      name: stringValue(raw.name),
      mode: connectorModes.has(mode) ? mode : "readonly",
      src: stringValue(raw.src),
      refreshInterval: typeof raw.refreshInterval === "number" ? raw.refreshInterval : void 0,
      schema: isRecord(raw.schema) ? raw.schema : void 0
    };
  }
  function normalizePermissions(raw) {
    const source = isRecord(raw) ? raw : {};
    return {
      network: Array.isArray(source.network) ? source.network.filter((item) => typeof item === "string") : [],
      storage: booleanValue(source.storage, true),
      realtime: booleanValue(source.realtime, false),
      ai: booleanValue(source.ai, false),
      mcp: booleanValue(source.mcp, false)
    };
  }
  function validateMicroAppManifest(input) {
    const issues = [];
    const source = isRecord(input) ? input : {};
    if (!isRecord(input)) issues.push({ path: "$", message: "Manifest must be an object" });
    const name = stringValue(source.name);
    if (!name) issues.push({ path: "name", message: "Micro App name is required" });
    if (source.type !== "micro-app") issues.push({ path: "type", message: 'Manifest type must be "micro-app"' });
    const connectors = Array.isArray(source.connectors) ? source.connectors.map((item, index) => normalizeConnector(item, index, issues)).filter((item) => Boolean(item)) : [];
    const manifest = {
      ...source,
      name: name ?? "Untitled Micro App",
      type: "micro-app",
      version: stringValue(source.version),
      description: stringValue(source.description),
      entry: stringValue(source.entry),
      storage: normalizeStorage(source.storage, issues),
      realtime: normalizeRealtime(source.realtime, issues),
      connectors,
      permissions: normalizePermissions(source.permissions),
      build: isRecord(source.build) ? { upgradeable: booleanValue(source.build.upgradeable, false), appType: stringValue(source.build.appType) } : void 0,
      ui: isRecord(source.ui) ? { mount: stringValue(source.ui.mount), title: stringValue(source.ui.title), icon: stringValue(source.ui.icon) } : void 0
    };
    return { manifest, issues, valid: issues.length === 0 };
  }
  function parseMicroAppManifest(input) {
    const result = validateMicroAppManifest(input);
    if (!result.valid) {
      const message = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
      throw new Error(`Invalid Micro App manifest: ${message}`);
    }
    return result.manifest;
  }

  // src/index.ts
  var plugins = /* @__PURE__ */ new Map();
  function coerceValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
    return value;
  }
  function parseOptions(el) {
    const raw = el.getAttribute("data-uif-options");
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return raw.split(";").reduce((acc, pair) => {
        const [key, ...rest] = pair.split(":");
        const name = key?.trim();
        if (!name) return acc;
        const value = rest.join(":").trim();
        acc[name] = value === "" ? true : coerceValue(value);
        return acc;
      }, {});
    }
  }
  function emit(name, detail, target = document) {
    target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }
  function on(name, handler, target = document) {
    target.addEventListener(name, handler);
    return () => target.removeEventListener(name, handler);
  }
  function registerPlugin(plugin) {
    plugins.set(plugin.name, plugin);
  }
  function setDensity(density, target = document.documentElement) {
    target.dataset.uifDensity = density;
  }
  function setAccent(color, target = document.documentElement) {
    target.style.setProperty("--uif-accent", color);
    target.style.setProperty("--uif-color-primary", color);
  }
  function init(root = document, options = {}) {
    emit("uif:before-init", { root, options }, root);
    const app = {
      root,
      options,
      destroy() {
        emit("uif:before-destroy", { root }, root);
        emit("uif:destroy", { root }, root);
      }
    };
    for (const plugin of plugins.values()) {
      try {
        plugin.setup(app);
      } catch (error) {
        emit("uif:error", { error, plugin: plugin.name }, root);
      }
    }
    emit("uif:init", { root, options }, root);
    return app;
  }
  return __toCommonJS(index_exports);
})();
