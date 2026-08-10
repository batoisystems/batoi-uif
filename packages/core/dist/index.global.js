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
    UIFError: () => UIFError,
    agentContentPartTypes: () => agentContentPartTypes,
    agentEnvelopeContract: () => agentEnvelopeContract,
    agentEnvelopeKinds: () => agentEnvelopeKinds,
    agentEnvelopeStatuses: () => agentEnvelopeStatuses,
    applyLocale: () => applyLocale,
    assertSafeObject: () => assertSafeObject,
    assertSafePropertyPath: () => assertSafePropertyPath,
    clearStoragePartition: () => clearStoragePartition,
    configureCompatibility: () => configureCompatibility,
    configureDiagnostics: () => configureDiagnostics,
    configureLocale: () => configureLocale,
    configureStoragePartition: () => configureStoragePartition,
    createComponentRegistry: () => createComponentRegistry,
    createHydrationLifecycle: () => createHydrationLifecycle,
    createResourceScope: () => createResourceScope,
    defaultUIFResourceLimits: () => defaultUIFResourceLimits,
    diagnosticDurationBucket: () => diagnosticDurationBucket,
    emit: () => emit,
    findUnsafeObjectPaths: () => findUnsafeObjectPaths,
    formatUIFCurrency: () => formatUIFCurrency,
    formatUIFDate: () => formatUIFDate,
    formatUIFNumber: () => formatUIFNumber,
    getCompatibilityMode: () => getCompatibilityMode,
    getLocaleConfiguration: () => getLocaleConfiguration,
    getLocaleDirection: () => getLocaleDirection,
    getStoragePartition: () => getStoragePartition,
    getStoragePartitionPrefix: () => getStoragePartitionPrefix,
    getUIFComponentContract: () => getUIFComponentContract,
    init: () => init,
    isSafeObjectKey: () => isSafeObjectKey,
    isSafePropertyPath: () => isSafePropertyPath,
    listMicroAppConnectorWorkflows: () => listMicroAppConnectorWorkflows,
    on: () => on,
    parseAgentEnvelope: () => parseAgentEnvelope,
    parseMicroAppManifest: () => parseMicroAppManifest,
    parseOptions: () => parseOptions,
    parseUIFConfiguration: () => parseUIFConfiguration,
    parseUIFJSON: () => parseUIFJSON,
    partitionStorageKey: () => partitionStorageKey,
    registerPlugin: () => registerPlugin,
    reportDiagnostic: () => reportDiagnostic,
    setAccent: () => setAccent,
    setDensity: () => setDensity,
    translateUIFMessage: () => translateUIFMessage,
    uifActions: () => uifActions,
    uifAttributes: () => uifAttributes,
    uifComponentContracts: () => uifComponentContracts,
    uifContractRegistry: () => uifContractRegistry,
    uifErrors: () => uifErrors,
    uifEvents: () => uifEvents,
    uifMigrationRules: () => uifMigrationRules,
    uifStates: () => uifStates,
    uifValues: () => uifValues,
    validateAgentEnvelope: () => validateAgentEnvelope,
    validateMicroAppConnectorWorkflows: () => validateMicroAppConnectorWorkflows,
    validateMicroAppManifest: () => validateMicroAppManifest
  });

  // src/contracts.ts
  var UIFError = class extends Error {
    code;
    category;
    package;
    component;
    phase;
    recoverable;
    retryable;
    correlationId;
    constructor(message, detail) {
      super(message, detail.cause === void 0 ? void 0 : { cause: detail.cause });
      this.name = "UIFError";
      this.code = detail.code;
      this.category = detail.category;
      this.package = detail.package;
      this.component = detail.component;
      this.phase = detail.phase;
      this.recoverable = detail.recoverable;
      this.retryable = detail.retryable;
      this.correlationId = detail.correlationId;
    }
  };
  var defaultUIFResourceLimits = Object.freeze({
    maxBytes: 1e6,
    maxCharacters: 1e5,
    maxItems: 1e3,
    maxKeys: 1e3,
    maxDepth: 32
  });
  var unsafeObjectKeys = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
  function isSafeObjectKey(key) {
    return Boolean(key) && !unsafeObjectKeys.has(key);
  }
  function isSafePropertyPath(path) {
    if (!path || path.length > 1e3) return false;
    return path.split(".").every((part) => isSafeObjectKey(part));
  }
  function assertSafePropertyPath(path) {
    if (!isSafePropertyPath(path)) {
      throw new UIFError("UIF refused an unsafe property path", {
        code: "UIF_UNSAFE_PROPERTY_PATH",
        category: "security",
        package: "core",
        phase: "configuration",
        recoverable: false
      });
    }
  }
  function findUnsafeObjectPaths(value, options = {}) {
    const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? defaultUIFResourceLimits.maxDepth));
    const maxKeys = Math.max(1, Math.floor(options.maxKeys ?? defaultUIFResourceLimits.maxKeys));
    const maxIssues = Math.max(1, Math.floor(options.maxIssues ?? 25));
    const issues = [];
    const seen = /* @__PURE__ */ new WeakSet();
    let inspectedKeys = 0;
    const inspect = (input, path, depth) => {
      if (!input || typeof input !== "object" || issues.length >= maxIssues) return;
      if (seen.has(input)) return;
      seen.add(input);
      if (depth > maxDepth) {
        issues.push(path || "$");
        return;
      }
      for (const key of Object.keys(input)) {
        inspectedKeys += 1;
        const nextPath = path ? `${path}.${key}` : key;
        if (inspectedKeys > maxKeys) {
          issues.push(nextPath);
          return;
        }
        if (!isSafeObjectKey(key)) issues.push(nextPath);
        inspect(input[key], nextPath, depth + 1);
        if (issues.length >= maxIssues) return;
      }
    };
    inspect(value, "", 0);
    return issues;
  }
  function assertSafeObject(value, options = {}) {
    const issues = findUnsafeObjectPaths(value, options);
    if (issues.length) {
      throw new UIFError(`UIF refused unsafe or excessively complex object paths: ${issues.join(", ")}`, {
        code: "UIF_UNSAFE_OBJECT",
        category: "security",
        package: "core",
        phase: "configuration",
        recoverable: false
      });
    }
  }
  function parseUIFJSON(input, options = {}) {
    const limits = { ...defaultUIFResourceLimits, ...options.limits };
    const bytes = typeof TextEncoder === "undefined" ? input.length : new TextEncoder().encode(input).byteLength;
    if (input.length > limits.maxCharacters || bytes > limits.maxBytes) {
      return { value: void 0, issues: [{ path: "$", code: "limit", message: "JSON exceeds the allowed size." }], valid: false };
    }
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch {
      return { value: void 0, issues: [{ path: "$", code: "invalid-json", message: "Value must be valid JSON." }], valid: false };
    }
    if (options.shape === "array" && !Array.isArray(parsed) || options.shape === "object" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) {
      return { value: void 0, issues: [{ path: "$", code: "invalid-shape", message: `JSON must be a ${options.shape}.` }], valid: false };
    }
    const issues = [];
    const seen = /* @__PURE__ */ new WeakMap();
    let itemCount = 0;
    let keyCount = 0;
    const normalize = (value2, path, depth) => {
      if (typeof value2 === "string") {
        if (value2.length > limits.maxCharacters) {
          issues.push({ path, code: "limit", message: "String exceeds the allowed length." });
          return value2.slice(0, limits.maxCharacters);
        }
        return value2;
      }
      if (!value2 || typeof value2 !== "object") return value2;
      if (depth > limits.maxDepth) {
        issues.push({ path, code: "limit", message: "JSON exceeds the allowed nesting depth." });
        return void 0;
      }
      const existing = seen.get(value2);
      if (existing !== void 0) return existing;
      if (Array.isArray(value2)) {
        const output2 = [];
        seen.set(value2, output2);
        value2.forEach((item, index) => {
          itemCount += 1;
          if (itemCount > limits.maxItems) {
            if (itemCount === limits.maxItems + 1) issues.push({ path, code: "limit", message: "JSON exceeds the allowed item count." });
            return;
          }
          output2.push(normalize(item, `${path}[${index}]`, depth + 1));
        });
        return output2;
      }
      const output = /* @__PURE__ */ Object.create(null);
      seen.set(value2, output);
      Object.entries(value2).forEach(([key, item]) => {
        keyCount += 1;
        const itemPath = path === "$" ? `$.${key}` : `${path}.${key}`;
        if (keyCount > limits.maxKeys) {
          if (keyCount === limits.maxKeys + 1) issues.push({ path: itemPath, code: "limit", message: "JSON exceeds the allowed key count." });
          return;
        }
        if (!isSafeObjectKey(key)) {
          issues.push({ path: itemPath, code: "unsafe-key", message: `Unsafe JSON key: ${key}` });
          return;
        }
        output[key] = normalize(item, itemPath, depth + 1);
      });
      return output;
    };
    const value = normalize(parsed, "$", 0);
    return { value, issues, valid: issues.length === 0 };
  }
  function parseUIFConfiguration(input, options = {}) {
    const issues = [];
    let parsed = input;
    if (typeof input === "string") {
      const maxCharacters = Math.max(1, Math.floor(options.limits?.maxCharacters ?? defaultUIFResourceLimits.maxCharacters));
      const maxBytes = Math.max(1, Math.floor(options.limits?.maxBytes ?? defaultUIFResourceLimits.maxBytes));
      const bytes = typeof TextEncoder === "undefined" ? input.length : new TextEncoder().encode(input).byteLength;
      if (input.length > maxCharacters || bytes > maxBytes) {
        issues.push({ path: "$", code: "limit", message: "Configuration exceeds the allowed size." });
        parsed = {};
      } else {
        try {
          parsed = JSON.parse(input);
        } catch {
          issues.push({ path: "$", code: "invalid-json", message: "Configuration must be valid JSON." });
          parsed = {};
        }
      }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      issues.push({ path: "$", code: "not-object", message: "Configuration must be a JSON object." });
      parsed = {};
    }
    const unsafe = findUnsafeObjectPaths(parsed, { maxDepth: options.limits?.maxDepth, maxKeys: options.limits?.maxKeys });
    unsafe.forEach((path) => {
      issues.push({ path, code: "unsafe-key", message: `Unsafe or excessively complex configuration path: ${path}` });
    });
    const allowed = options.allowedKeys ? new Set(options.allowedKeys) : void 0;
    const output = /* @__PURE__ */ Object.create(null);
    const cloned = /* @__PURE__ */ new WeakMap();
    const cloneSafeValue = (value) => {
      if (!value || typeof value !== "object") return value;
      const existing = cloned.get(value);
      if (existing !== void 0) return existing;
      if (Array.isArray(value)) {
        const array = [];
        cloned.set(value, array);
        value.forEach((item) => array.push(cloneSafeValue(item)));
        return array;
      }
      const record2 = /* @__PURE__ */ Object.create(null);
      cloned.set(value, record2);
      Object.entries(value).forEach(([key, item]) => {
        if (isSafeObjectKey(key)) record2[key] = cloneSafeValue(item);
      });
      return record2;
    };
    for (const [key, value] of Object.entries(parsed)) {
      if (!isSafeObjectKey(key)) continue;
      if (allowed && !allowed.has(key)) {
        issues.push({ path: key, code: "unknown-key", message: `Unknown configuration key: ${key}` });
        if (options.allowUnknown !== true) continue;
      }
      output[key] = cloneSafeValue(value);
    }
    return { value: output, issues, valid: issues.length === 0 };
  }

  // src/compatibility.ts
  var compatibilityMode = "v2";
  function configureCompatibility(options) {
    compatibilityMode = options?.mode ?? "v2";
  }
  function getCompatibilityMode() {
    return compatibilityMode;
  }

  // src/agent.ts
  var agentEnvelopeKinds = Object.freeze([
    "message",
    "notice",
    "stream-delta",
    "stream-complete",
    "tool-plan",
    "tool-review",
    "tool-progress",
    "tool-result",
    "receipt",
    "error"
  ]);
  var agentEnvelopeStatuses = Object.freeze([
    "draft",
    "pending",
    "streaming",
    "waiting-approval",
    "approved",
    "rejected",
    "executing",
    "completed",
    "partial",
    "failed",
    "cancelled",
    "expired",
    "superseded"
  ]);
  var agentContentPartTypes = Object.freeze(["text", "source", "artifact", "data"]);
  var agentEnvelopeContract = Object.freeze({
    name: "agent-interaction",
    version: 3,
    authority: "presentation-only",
    kinds: agentEnvelopeKinds,
    statuses: agentEnvelopeStatuses,
    contentPartTypes: agentContentPartTypes,
    requiredFields: Object.freeze(["version", "kind", "id", "status", "content"]),
    privilegedExecution: false
  });
  var kinds = new Set(agentEnvelopeKinds);
  var statuses = new Set(agentEnvelopeStatuses);
  var actorRoles = /* @__PURE__ */ new Set(["user", "assistant", "system", "tool", "reviewer"]);
  var risks = /* @__PURE__ */ new Set(["low", "medium", "high", "critical"]);
  var identifierPattern = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;
  function record(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function text(value, max, path, issues) {
    if (value === void 0 || value === null) return void 0;
    if (typeof value !== "string") {
      issues.push({ path, code: "invalid", message: `${path} must be a string.` });
      return void 0;
    }
    if (value.length <= max) return value;
    issues.push({ path, code: "truncated", message: `${path} exceeded ${max} characters and was truncated.` });
    return value.slice(0, max);
  }
  function identifier(value, path, issues, fallback) {
    const normalized = text(value, 200, path, issues);
    if (normalized && identifierPattern.test(normalized)) return normalized;
    if (normalized) issues.push({ path, code: "invalid", message: `${path} is not a valid identifier.` });
    return fallback;
  }
  function finiteNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
  }
  function date(value, path, issues) {
    const normalized = text(value, 100, path, issues);
    if (!normalized) return void 0;
    if (Number.isNaN(Date.parse(normalized))) {
      issues.push({ path, code: "invalid", message: `${path} must be an ISO-compatible date.` });
      return void 0;
    }
    return normalized;
  }
  function contentParts(value, limits, issues) {
    if (!Array.isArray(value)) {
      if (value !== void 0) issues.push({ path: "content", code: "invalid", message: "content must be an array." });
      return [];
    }
    if (value.length > limits.maxItems) {
      issues.push({ path: "content", code: "limit", message: `content exceeds ${limits.maxItems} items.` });
    }
    return value.slice(0, limits.maxItems).flatMap((raw, index) => {
      const source = record(raw);
      const path = `content.${index}`;
      if (source.type === "text") {
        return [{ type: "text", text: text(source.text, limits.maxCharacters, `${path}.text`, issues) ?? "" }];
      }
      if (source.type === "source") {
        const id = identifier(source.id, `${path}.id`, issues);
        const label = text(source.label, 1e3, `${path}.label`, issues);
        if (!id || !label) return [];
        return [{
          type: "source",
          id,
          label,
          url: text(source.url, 4e3, `${path}.url`, issues),
          retrievedAt: date(source.retrievedAt, `${path}.retrievedAt`, issues),
          unavailable: source.unavailable === true
        }];
      }
      if (source.type === "artifact") {
        const id = identifier(source.id, `${path}.id`, issues);
        const label = text(source.label, 1e3, `${path}.label`, issues);
        if (!id || !label) return [];
        return [{
          type: "artifact",
          id,
          label,
          mediaType: text(source.mediaType, 200, `${path}.mediaType`, issues),
          url: text(source.url, 4e3, `${path}.url`, issues),
          checksum: text(source.checksum, 500, `${path}.checksum`, issues)
        }];
      }
      if (source.type === "data") {
        if (findUnsafeObjectPaths(source.value, { maxDepth: limits.maxDepth, maxKeys: limits.maxKeys }).length) {
          issues.push({ path: `${path}.value`, code: "unsafe", message: "Data part contains unsafe or excessively complex object paths." });
          return [];
        }
        return [{ type: "data", label: text(source.label, 1e3, `${path}.label`, issues), value: source.value }];
      }
      issues.push({ path: `${path}.type`, code: "unsupported", message: `Unsupported content part: ${String(source.type)}` });
      return [];
    });
  }
  function validateAgentEnvelope(input, limits = {}) {
    const resolvedLimits = {
      ...defaultUIFResourceLimits,
      ...Object.fromEntries(Object.entries(limits).map(([key, value]) => [key, Math.max(1, Math.floor(value ?? 1))]))
    };
    const issues = [];
    const source = record(input);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      issues.push({ path: "$", code: "invalid", message: "Agent envelope must be an object." });
    }
    findUnsafeObjectPaths(source, resolvedLimits).forEach((path) => {
      issues.push({ path, code: "unsafe", message: `Unsafe or excessively complex envelope path: ${path}` });
    });
    if (source.version !== 3) {
      issues.push({ path: "version", code: "unsupported", message: `Unsupported agent envelope version: ${String(source.version)}` });
    }
    const kind = kinds.has(source.kind) ? source.kind : "error";
    if (!kinds.has(source.kind)) issues.push({ path: "kind", code: "unsupported", message: `Unsupported agent envelope kind: ${String(source.kind)}` });
    const status = statuses.has(source.status) ? source.status : "failed";
    if (!statuses.has(source.status)) issues.push({ path: "status", code: "unsupported", message: `Unsupported agent status: ${String(source.status)}` });
    const id = identifier(source.id, "id", issues, "invalid-envelope");
    const actorSource = record(source.actor);
    const actor = source.actor === void 0 ? void 0 : {
      role: actorRoles.has(actorSource.role) ? actorSource.role : "system",
      label: text(actorSource.label, 500, "actor.label", issues)
    };
    if (source.actor !== void 0 && !actorRoles.has(actorSource.role)) {
      issues.push({ path: "actor.role", code: "unsupported", message: `Unsupported actor role: ${String(actorSource.role)}` });
    }
    const usageSource = record(source.usage);
    const riskSource = record(source.risk);
    const errorSource = record(source.error);
    const envelope = {
      version: 3,
      kind,
      id,
      threadId: identifier(source.threadId, "threadId", issues),
      turnId: identifier(source.turnId, "turnId", issues),
      parentId: identifier(source.parentId, "parentId", issues),
      requestId: identifier(source.requestId, "requestId", issues),
      correlationId: identifier(source.correlationId, "correlationId", issues),
      auditRef: identifier(source.auditRef, "auditRef", issues),
      sequence: finiteNumber(source.sequence),
      createdAt: date(source.createdAt, "createdAt", issues),
      expiresAt: date(source.expiresAt, "expiresAt", issues),
      status,
      actor,
      content: contentParts(source.content, resolvedLimits, issues),
      usage: source.usage === void 0 ? void 0 : {
        model: text(usageSource.model, 500, "usage.model", issues),
        route: text(usageSource.route, 500, "usage.route", issues),
        inputTokens: finiteNumber(usageSource.inputTokens),
        outputTokens: finiteNumber(usageSource.outputTokens),
        cost: finiteNumber(usageSource.cost),
        currency: text(usageSource.currency, 20, "usage.currency", issues),
        latencyMilliseconds: finiteNumber(usageSource.latencyMilliseconds),
        retention: text(usageSource.retention, 1e3, "usage.retention", issues)
      },
      risk: source.risk === void 0 ? void 0 : {
        level: risks.has(riskSource.level) ? riskSource.level : "critical",
        reversible: typeof riskSource.reversible === "boolean" ? riskSource.reversible : void 0,
        summary: text(riskSource.summary, 5e3, "risk.summary", issues),
        affectedResources: Array.isArray(riskSource.affectedResources) ? riskSource.affectedResources.slice(0, resolvedLimits.maxItems).map((item) => String(item).slice(0, 1e3)) : void 0,
        externalRecipients: Array.isArray(riskSource.externalRecipients) ? riskSource.externalRecipients.slice(0, resolvedLimits.maxItems).map((item) => String(item).slice(0, 1e3)) : void 0,
        dataClassification: text(riskSource.dataClassification, 500, "risk.dataClassification", issues)
      },
      error: source.error === void 0 ? void 0 : {
        code: identifier(errorSource.code, "error.code", issues, "AGENT_ERROR"),
        message: text(errorSource.message, 1e4, "error.message", issues) ?? "Agent interaction failed.",
        retryable: errorSource.retryable === true
      }
    };
    if (source.risk !== void 0 && !risks.has(riskSource.level)) {
      issues.push({ path: "risk.level", code: "unsupported", message: `Unsupported risk level: ${String(riskSource.level)}` });
    }
    return { envelope, issues, valid: issues.length === 0 };
  }
  function parseAgentEnvelope(input, limits = {}) {
    const result = validateAgentEnvelope(input, limits);
    if (!result.valid) throw new Error(`Invalid agent envelope: ${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
    return result.envelope;
  }

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
    "data-uif-key",
    "data-uif-envelope",
    "data-uif-interval",
    "data-uif-message",
    "data-uif-messages"
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
    "alert",
    "badge",
    "breadcrumb",
    "collapse",
    "tooltip",
    "popover",
    "progress",
    "spinner",
    "skeleton",
    "pagination",
    "command-menu",
    "navbar",
    "sidebar",
    "stepper",
    "wizard",
    "file-upload",
    "combobox",
    "carousel",
    "lightbox",
    "masonry",
    "card",
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
    "desktop-shell",
    "ai-action",
    "ai-thread",
    "ai-composer",
    "agent-tool",
    "tool-approval",
    "typed-text",
    "dashboard",
    "install-prompt"
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
    "reject",
    "edit",
    "install",
    "next",
    "preview",
    "previous",
    "unsubscribe"
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
    "rejected",
    "available",
    "busy",
    "completed",
    "connecting",
    "decision-pending",
    "dirty",
    "empty",
    "expired",
    "failed",
    "installed",
    "offline",
    "online",
    "saved",
    "saving",
    "submitting",
    "unavailable",
    "waiting-approval"
  ];
  var uifEvents = [
    "uif:before-init",
    "uif:init",
    "uif:before-destroy",
    "uif:destroy",
    "uif:error",
    "uif:runtime:mounted",
    "uif:runtime:error",
    "uif:runtime:diagnostic",
    "uif:diagnostic",
    "uif:agent:submit",
    "uif:agent:cancel",
    "uif:agent:error",
    "uif:agent:feedback",
    "uif:agent:retry",
    "uif:agent:copy",
    "uif:tool-approve",
    "uif:tool-reject",
    "uif:tool-expired",
    "uif:tool-invalid-review",
    "uif:tool-replay-blocked",
    "uif:accordion-toggle",
    "uif:action-diagnostic",
    "uif:ai-action",
    "uif:ai-error",
    "uif:ai-history-select",
    "uif:ai-stream-cancel",
    "uif:animation-end",
    "uif:animation-start",
    "uif:before-load",
    "uif:carousel-change",
    "uif:chart-drilldown",
    "uif:chart-drilldown-error",
    "uif:chart-error",
    "uif:chart-export",
    "uif:chart-refresh",
    "uif:chart-select",
    "uif:collapse-close",
    "uif:collapse-open",
    "uif:combobox-change",
    "uif:command-menu-close",
    "uif:command-menu-open",
    "uif:complete",
    "uif:connector-error",
    "uif:dashboard-error",
    "uif:desktop-change",
    "uif:desktop-error",
    "uif:drawer-close",
    "uif:drawer-open",
    "uif:dropdown-close",
    "uif:dropdown-open",
    "uif:editor-autosave",
    "uif:editor-autosave-error",
    "uif:editor-blur",
    "uif:editor-change",
    "uif:editor-command",
    "uif:editor-destroy",
    "uif:editor-diagnostics",
    "uif:editor-error",
    "uif:editor-focus",
    "uif:editor-init",
    "uif:editor-layout-change",
    "uif:editor-mode-change",
    "uif:editor-normalize",
    "uif:editor-preview",
    "uif:editor-reset",
    "uif:editor-upload-error",
    "uif:editor-validate",
    "uif:field-errors",
    "uif:file-select",
    "uif:form-dirty",
    "uif:form-error",
    "uif:form-submit",
    "uif:form-success",
    "uif:form-touched",
    "uif:lightbox-close",
    "uif:lightbox-open",
    "uif:load",
    "uif:modal-close",
    "uif:modal-open",
    "uif:notification",
    "uif:offcanvas-close",
    "uif:offcanvas-open",
    "uif:offline-error",
    "uif:offline-expired",
    "uif:offline-queued",
    "uif:offline-synced",
    "uif:pagination-change",
    "uif:popover-close",
    "uif:popover-open",
    "uif:presence",
    "uif:push-change",
    "uif:push-error",
    "uif:pwa-install",
    "uif:rad-before",
    "uif:rad-error",
    "uif:rad-success",
    "uif:realtime-error",
    "uif:realtime-message",
    "uif:realtime-state",
    "uif:rehydrate",
    "uif:request",
    "uif:response",
    "uif:route-before",
    "uif:route-error",
    "uif:route-success",
    "uif:router-error",
    "uif:segment-change",
    "uif:select",
    "uif:shell-density",
    "uif:table-before-load",
    "uif:table-bulk-action",
    "uif:table-error",
    "uif:table-filter",
    "uif:table-load",
    "uif:table-loaded",
    "uif:table-page",
    "uif:table-page-size",
    "uif:table-reset",
    "uif:table-row-action",
    "uif:table-select",
    "uif:table-selection",
    "uif:table-sort",
    "uif:table-state",
    "uif:tabs-change",
    "uif:toast",
    "uif:tool-confirmation-required",
    "uif:typed-text-complete",
    "uif:wizard-change"
  ];
  var uifErrors = [
    "UIF_COMPONENT_DESTROY",
    "UIF_COMPONENT_DUPLICATE",
    "UIF_COMPONENT_MOUNT",
    "UIF_COMPONENT_NAME",
    "UIF_INVALID_ACCENT",
    "UIF_LOCALE_CONFIG",
    "UIF_STORAGE_KEY",
    "UIF_STORAGE_PARTITION",
    "UIF_UNSAFE_OBJECT",
    "UIF_UNSAFE_PROPERTY_PATH"
  ];
  function contractEntries(values) {
    return Object.freeze(values.map((name) => Object.freeze({ name, version: 3, status: "stable" })));
  }
  var uifContractRegistry = Object.freeze({
    attributes: contractEntries(uifAttributes),
    components: contractEntries(uifValues),
    actions: contractEntries(uifActions),
    states: contractEntries(uifStates),
    events: contractEntries(uifEvents),
    errors: contractEntries(uifErrors)
  });

  // src/resource-scope.ts
  function createResourceScope() {
    const controller = new AbortController();
    const disposers = /* @__PURE__ */ new Set();
    let destroyed = false;
    const add = (dispose) => {
      if (destroyed) {
        dispose();
        return () => void 0;
      }
      let active = true;
      const ownedDispose = () => {
        if (!active) return;
        active = false;
        disposers.delete(ownedDispose);
        dispose();
      };
      disposers.add(ownedDispose);
      return ownedDispose;
    };
    return {
      signal: controller.signal,
      get destroyed() {
        return destroyed;
      },
      add,
      listen(target, type, listener, options) {
        target.addEventListener(type, listener, options);
        return add(() => target.removeEventListener(type, listener, options));
      },
      timeout(callback, delay) {
        const id = globalThis.setTimeout(callback, Math.max(0, delay));
        add(() => globalThis.clearTimeout(id));
        return Number(id);
      },
      interval(callback, delay) {
        const id = globalThis.setInterval(callback, Math.max(1, delay));
        add(() => globalThis.clearInterval(id));
        return Number(id);
      },
      observe(observer) {
        add(() => observer.disconnect());
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        controller.abort();
        Array.from(disposers).reverse().forEach((dispose) => dispose());
        disposers.clear();
      }
    };
  }

  // src/component-registry.ts
  var componentNamePattern = /^[a-z][a-z0-9-]*$/;
  function elementsFor(root) {
    const elements = Array.from(root.querySelectorAll("[data-uif]"));
    if (root instanceof HTMLElement && root.hasAttribute("data-uif")) elements.unshift(root);
    return elements;
  }
  function normalizeController(value) {
    if (typeof value === "function") return { destroy: value };
    return value ?? { destroy: () => void 0 };
  }
  function createComponentRegistry() {
    const definitions = /* @__PURE__ */ new Map();
    const mounted = /* @__PURE__ */ new WeakMap();
    const ownedElements = /* @__PURE__ */ new Set();
    const destroyMounted = (element, name) => {
      const entries = mounted.get(element);
      if (!entries) return;
      const targets = name ? [[name, entries.get(name)]] : Array.from(entries.entries());
      targets.forEach(([componentName, entry]) => {
        if (!entry) return;
        entry.resources.destroy();
        try {
          entry.controller.destroy();
        } catch (cause) {
          emit("uif:runtime:error", {
            code: "UIF_COMPONENT_DESTROY",
            category: "internal",
            package: "core",
            component: componentName,
            phase: "destroy",
            recoverable: true,
            cause
          }, element);
        }
        entries.delete(componentName);
      });
      if (!entries.size) {
        mounted.delete(element);
        ownedElements.delete(element);
      }
    };
    const api = {
      register(definition) {
        if (!componentNamePattern.test(definition.name)) {
          throw new UIFError(`Invalid UIF component name: ${definition.name}`, {
            code: "UIF_COMPONENT_NAME",
            category: "config",
            package: "core",
            component: definition.name,
            phase: "registration",
            recoverable: false
          });
        }
        if (definitions.has(definition.name)) {
          throw new UIFError(`UIF component is already registered: ${definition.name}`, {
            code: "UIF_COMPONENT_DUPLICATE",
            category: "config",
            package: "core",
            component: definition.name,
            phase: "registration",
            recoverable: false
          });
        }
        definitions.set(definition.name, Object.freeze({ ...definition }));
        return () => {
          definitions.delete(definition.name);
          Array.from(ownedElements).forEach((element) => destroyMounted(element, definition.name));
        };
      },
      get(name) {
        return definitions.get(name);
      },
      definitions() {
        return Array.from(definitions.values()).sort((a, b) => a.name.localeCompare(b.name));
      },
      refresh(root = document, reason = "refresh") {
        elementsFor(root).forEach((element) => {
          const name = element.dataset.uif;
          const definition = name ? definitions.get(name) : void 0;
          if (!name || !definition) return;
          const entries = mounted.get(element) ?? /* @__PURE__ */ new Map();
          const existing = entries.get(name);
          if (existing) {
            void existing.controller.update?.(reason);
            return;
          }
          const parsed = parseUIFConfiguration(element.dataset.uifOptions ?? "{}", {
            allowedKeys: definition.optionKeys,
            allowUnknown: definition.optionKeys === void 0,
            limits: definition.limits
          });
          if (!parsed.valid) {
            emit("uif:runtime:diagnostic", { component: name, issues: parsed.issues }, element);
          }
          const options = Object.freeze({ ...definition.defaults ?? {}, ...parsed.value });
          const resources = createResourceScope();
          try {
            const controller = normalizeController(definition.mount({
              element,
              root,
              options,
              signal: resources.signal,
              resources,
              emit: (eventName, detail) => emit(eventName, detail, element),
              error: (message, detail) => new UIFError(message, { ...detail, package: "core", component: name })
            }));
            entries.set(name, { controller, resources });
            mounted.set(element, entries);
            ownedElements.add(element);
            emit("uif:runtime:mounted", { component: name, version: definition.version ?? 3 }, element);
          } catch (cause) {
            resources.destroy();
            emit("uif:runtime:error", {
              code: "UIF_COMPONENT_MOUNT",
              category: "internal",
              package: "core",
              component: name,
              phase: "mount",
              recoverable: true,
              cause
            }, element);
          }
        });
      },
      suspend(root = document) {
        Array.from(ownedElements).forEach((element) => {
          if (root !== document && root !== element && !root.contains(element)) return;
          mounted.get(element)?.forEach((entry) => entry.controller.suspend?.());
        });
      },
      resume(root = document) {
        Array.from(ownedElements).forEach((element) => {
          if (root !== document && root !== element && !root.contains(element)) return;
          mounted.get(element)?.forEach((entry) => entry.controller.resume?.());
        });
      },
      destroy(root = document) {
        Array.from(ownedElements).forEach((element) => {
          if (root === document || root === element || root.contains(element)) destroyMounted(element);
        });
      }
    };
    return api;
  }

  // src/hydration-lifecycle.ts
  function createHydrationLifecycle(root, adapters) {
    const rootDisposers = /* @__PURE__ */ new Map();
    const targetDisposers = /* @__PURE__ */ new Map();
    let destroyed = false;
    const run = (adapter, target) => {
      if (adapter.scope === "root") {
        if (rootDisposers.has(adapter.name)) return;
        const dispose2 = adapter.hydrate(root);
        rootDisposers.set(adapter.name, typeof dispose2 === "function" ? dispose2 : () => void 0);
        return;
      }
      if (adapter.scope === "refresh") {
        adapter.hydrate(target);
        return;
      }
      const entries = targetDisposers.get(target) ?? /* @__PURE__ */ new Map();
      entries.get(adapter.name)?.();
      const dispose = adapter.hydrate(target);
      entries.set(adapter.name, typeof dispose === "function" ? dispose : () => void 0);
      targetDisposers.set(target, entries);
    };
    return {
      refresh(target = root) {
        if (destroyed) return;
        adapters.forEach((adapter) => run(adapter, target));
      },
      destroy() {
        if (destroyed) return;
        targetDisposers.forEach((entries) => entries.forEach((dispose) => dispose()));
        rootDisposers.forEach((dispose) => dispose());
        targetDisposers.clear();
        rootDisposers.clear();
        destroyed = true;
      }
    };
  }

  // src/storage-partition.ts
  var activeStoragePartition = null;
  var identifierPattern2 = /^[a-zA-Z0-9._-]{1,128}$/;
  function validateIdentifier(value, field) {
    const normalized = value.trim();
    if (!identifierPattern2.test(normalized)) {
      throw new UIFError(`Invalid UIF storage partition ${field}`, {
        code: "UIF_STORAGE_PARTITION",
        category: "security",
        package: "core",
        phase: "storage",
        recoverable: false
      });
    }
    return normalized;
  }
  function configureStoragePartition(partition) {
    if (!partition) {
      activeStoragePartition = null;
      return;
    }
    activeStoragePartition = Object.freeze({
      applicationId: validateIdentifier(partition.applicationId, "applicationId"),
      tenantId: validateIdentifier(partition.tenantId ?? "default", "tenantId"),
      principalId: validateIdentifier(partition.principalId, "principalId")
    });
  }
  function getStoragePartition() {
    return activeStoragePartition;
  }
  function getStoragePartitionPrefix(partition = activeStoragePartition) {
    if (!partition) return null;
    return `uif:${partition.applicationId}:${partition.tenantId ?? "default"}:${partition.principalId}:`;
  }
  function partitionStorageKey(key, partition = activeStoragePartition) {
    const normalized = key.trim();
    if (!normalized || normalized.length > 256 || /[\u0000-\u001f\u007f]/.test(normalized)) {
      throw new UIFError("Invalid UIF storage key", {
        code: "UIF_STORAGE_KEY",
        category: "security",
        package: "core",
        phase: "storage",
        recoverable: false
      });
    }
    const prefix = getStoragePartitionPrefix(partition);
    return prefix ? `${prefix}${encodeURIComponent(normalized)}` : normalized;
  }
  function clearStoragePartition(storage, partition = activeStoragePartition) {
    try {
      const target = storage ?? (typeof window === "undefined" ? void 0 : window.localStorage);
      const prefix = getStoragePartitionPrefix(partition);
      if (!target || !prefix) return 0;
      const keys = [];
      for (let index = 0; index < target.length; index += 1) {
        const key = target.key(index);
        if (key?.startsWith(prefix)) keys.push(key);
      }
      keys.forEach((key) => target.removeItem(key));
      return keys.length;
    } catch {
      return 0;
    }
  }

  // src/localization.ts
  var defaultLocales = Object.freeze(["en"]);
  var localeConfiguration = Object.freeze({
    locales: defaultLocales,
    messages: Object.freeze({})
  });
  function localeError(message, cause) {
    return new UIFError(message, {
      code: "UIF_LOCALE_CONFIG",
      category: "config",
      package: "core",
      phase: "localization",
      recoverable: true,
      cause
    });
  }
  function configureLocale(options) {
    if (!options) {
      localeConfiguration = Object.freeze({ locales: defaultLocales, messages: Object.freeze({}) });
      return;
    }
    try {
      const requested = typeof options.locales === "string" ? [options.locales] : [...options.locales ?? defaultLocales];
      const locales = Object.freeze(Intl.getCanonicalLocales(requested));
      if (!locales.length) throw new Error("At least one locale is required.");
      if (options.currency && !/^[A-Z]{3}$/.test(options.currency)) throw new Error("Currency must be an uppercase ISO 4217 code.");
      if (options.timeZone) new Intl.DateTimeFormat(locales, { timeZone: options.timeZone }).format(0);
      const messages = /* @__PURE__ */ Object.create(null);
      Object.entries(options.messages ?? {}).forEach(([key, value]) => {
        if (!isSafeObjectKey(key) || key.length > 200 || value.length > 1e4) throw new Error(`Invalid locale message: ${key}`);
        messages[key] = value;
      });
      localeConfiguration = Object.freeze({
        locales,
        timeZone: options.timeZone,
        currency: options.currency,
        messages: Object.freeze(messages)
      });
    } catch (cause) {
      throw localeError("Invalid UIF locale configuration", cause);
    }
  }
  function getLocaleConfiguration() {
    return localeConfiguration;
  }
  function getLocaleDirection(locale = localeConfiguration.locales[0]) {
    try {
      const localeInfo = new Intl.Locale(locale);
      const direction = localeInfo.textInfo?.direction;
      return direction === "rtl" ? "rtl" : "ltr";
    } catch {
      return "ltr";
    }
  }
  function applyLocale(target = document.documentElement) {
    target.lang = localeConfiguration.locales[0];
    target.dir = getLocaleDirection();
  }
  function formatUIFNumber(value, options = {}) {
    return new Intl.NumberFormat(localeConfiguration.locales, options).format(value);
  }
  function formatUIFCurrency(value, currency = localeConfiguration.currency) {
    if (!currency) throw localeError("A currency is required for currency formatting");
    return formatUIFNumber(value, { style: "currency", currency });
  }
  function formatUIFDate(value, options = {}) {
    const date2 = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date2.getTime())) return "";
    return new Intl.DateTimeFormat(localeConfiguration.locales, {
      ...localeConfiguration.timeZone ? { timeZone: localeConfiguration.timeZone } : {},
      ...options
    }).format(date2);
  }
  function translateUIFMessage(key, fallback = key, values = {}) {
    const template = localeConfiguration.messages[key] ?? fallback;
    return template.replace(
      /\{([a-zA-Z0-9._-]+)\}/g,
      (match, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
    );
  }

  // src/component-contracts.ts
  var commonAttributes = Object.freeze(["data-uif", "data-uif-options", "data-uif-state"]);
  var commonStates = Object.freeze(["idle", "loading", "success", "error", "disabled"]);
  function contract(name, packageName, semanticFallback, details = {}) {
    return Object.freeze({
      name,
      version: 3,
      package: packageName,
      semanticFallback,
      attributes: Object.freeze([...details.attributes ?? commonAttributes]),
      roles: Object.freeze([...details.roles ?? []]),
      actions: Object.freeze([...details.actions ?? []]),
      events: Object.freeze([...details.events ?? []]),
      states: Object.freeze([...details.states ?? commonStates]),
      errors: Object.freeze([...details.errors ?? ["UIF_COMPONENT_MOUNT"]]),
      accessibility: Object.freeze([...details.accessibility ?? ["Preserve useful semantic HTML before enhancement."]]),
      security: Object.freeze([...details.security ?? ["Render untrusted values as text."]])
    });
  }
  var disclosure = (name, fallback) => contract(name, "components", fallback, {
    attributes: [...commonAttributes, "data-uif-action", "data-uif-target"],
    actions: ["open", "close", "toggle"],
    events: [`uif:${name}-open`, `uif:${name}-close`],
    states: ["open", "closed", "disabled"],
    accessibility: ["Own keyboard dismissal, focus movement, and focus return."]
  });
  var uifComponentContracts = Object.freeze({
    button: contract("button", "components", "Native button or link", { actions: ["activate"], roles: ["button"] }),
    modal: disclosure("modal", "Visible dialog content"),
    drawer: disclosure("drawer", "Visible complementary region"),
    offcanvas: disclosure("offcanvas", "Visible complementary region"),
    dropdown: disclosure("dropdown", "Native button followed by a menu or link list"),
    tabs: contract("tabs", "components", "Headings and sequential content sections", { actions: ["activate"], roles: ["tablist", "tab", "tabpanel"], events: ["uif:tabs-change"], states: ["active", "inactive", "disabled"], accessibility: ["Support arrow, Home, End, and focusable tab semantics."] }),
    toast: contract("toast", "components", "Inline status message", { actions: ["close"], roles: ["status", "alert"], events: ["uif:toast"], states: ["open", "closed"] }),
    accordion: contract("accordion", "components", "Headings with visible section content", { actions: ["toggle"], roles: ["button", "region"], events: ["uif:accordion-toggle"], states: ["expanded", "collapsed", "disabled"] }),
    alert: contract("alert", "components", "Inline alert content", { actions: ["close"], roles: ["alert"], states: ["open", "closed"] }),
    badge: contract("badge", "components", "Inline status text"),
    breadcrumb: contract("breadcrumb", "components", "Navigation list", { roles: ["navigation"] }),
    collapse: disclosure("collapse", "Visible collapsible content"),
    tooltip: contract("tooltip", "components", "Adjacent help text", { attributes: [...commonAttributes, "data-uif-message"], roles: ["tooltip"], states: ["open", "closed"], security: ["Tooltip content is text-only by default."] }),
    popover: disclosure("popover", "Inline contextual content"),
    progress: contract("progress", "components", "Native progress element or textual status", { attributes: [...commonAttributes, "data-uif-value"], roles: ["progressbar"] }),
    spinner: contract("spinner", "components", "Textual loading status", { roles: ["status"], states: ["loading"] }),
    skeleton: contract("skeleton", "components", "Existing content or loading status", { roles: ["status"], states: ["loading"] }),
    pagination: contract("pagination", "components", "Navigation list", { actions: ["navigate"], roles: ["navigation"], events: ["uif:pagination-change"] }),
    "command-menu": disclosure("command-menu", "Search input and command list"),
    navbar: contract("navbar", "components", "Navigation region", { roles: ["navigation"] }),
    sidebar: contract("sidebar", "components", "Complementary navigation region", { roles: ["complementary", "navigation"] }),
    shell: contract("shell", "components", "Header, navigation, main, and complementary landmarks", { actions: ["toggle-sidebar", "set-density"], roles: ["banner", "navigation", "main", "complementary"] }),
    stepper: contract("stepper", "components", "Ordered list of steps", { states: ["active", "completed", "error", "disabled"] }),
    wizard: contract("wizard", "components", "Sequential fieldsets", { actions: ["next", "previous", "submit"], events: ["uif:wizard-change"], states: ["active", "completed", "error"] }),
    "file-upload": contract("file-upload", "components", "Native file input", { events: ["uif:file-select"], security: ["Client file metadata is advisory; server validation remains authoritative."] }),
    combobox: contract("combobox", "components", "Labelled native input and option list", { roles: ["combobox", "listbox", "option"], events: ["uif:combobox-change"], accessibility: ["Support keyboard option navigation and active-descendant state."] }),
    carousel: contract("carousel", "components", "Sequential figures or articles", { actions: ["previous", "next", "select"], roles: ["region"], events: ["uif:carousel-change"], states: ["active", "inactive"] }),
    lightbox: disclosure("lightbox", "Linked image gallery"),
    masonry: contract("masonry", "components", "Sequential card or figure list"),
    card: contract("card", "components", "Article or section"),
    nav: contract("nav", "components", "Navigation region", { roles: ["navigation"] }),
    table: contract("table", "table", "Semantic table", { attributes: [...commonAttributes, "data-uif-src", "data-uif-method", "data-uif-refresh"], actions: ["load", "reload", "select"], events: ["uif:table-load", "uif:table-error", "uif:table-select"], states: ["idle", "loading", "loaded", "empty", "error"], security: ["Remote data is bounded; HTML rows require governed server trust."] }),
    form: contract("form", "forms", "Native form and controls", { attributes: [...commonAttributes, "data-uif-src", "data-uif-method", "data-uif-validate", "data-uif-rule"], actions: ["submit", "reset"], events: ["uif:form-submit", "uif:form-success", "uif:form-error"], states: ["idle", "submitting", "success", "error"], security: ["Browser validation is advisory; server validation and authorization are authoritative."] }),
    editor: contract("editor", "editor", "Textarea", { attributes: [...commonAttributes, "data-uif-mode", "data-uif-toolbar", "data-uif-preview"], actions: ["edit", "preview", "save"], events: ["uif:editor-change", "uif:editor-diagnostics"], states: ["idle", "dirty", "saving", "saved", "error"], security: ["Sanitize editing boundaries and validate submitted content on the server."] }),
    ajax: contract("ajax", "rad-adapter", "Link, button, or form with a normal server destination", { attributes: [...commonAttributes, "data-uif-src", "data-uif-method", "data-uif-target", "data-uif-swap"], actions: ["load"], events: ["uif:rad-before", "uif:rad-success", "uif:rad-error"], security: ["Partial HTML is explicit governed server output."] }),
    route: contract("route", "router", "Native link navigation", { attributes: [...commonAttributes, "data-uif-route", "data-uif-target"], actions: ["navigate"], events: ["uif:route-before", "uif:route-success", "uif:route-error"], security: ["Navigation and partial URLs follow application URL policy."] }),
    animate: contract("animate", "effects", "Static final visual state", { attributes: [...commonAttributes, "data-uif-animation", "data-uif-duration", "data-uif-delay"], events: ["uif:animation-start", "uif:animation-end"], accessibility: ["Respect reduced-motion preferences."] }),
    "typed-text": contract("typed-text", "effects", "Complete static text", { events: ["uif:typed-text-complete"], accessibility: ["Expose stable text and respect reduced motion."] }),
    chart: contract("chart", "charts", "Accessible data table or textual summary", { attributes: [...commonAttributes, "data-uif-src"], roles: ["img"], events: ["uif:chart-select", "uif:chart-error"], security: ["Remote data and drilldown URLs are bounded and policy checked."] }),
    dashboard: contract("dashboard", "dashboard", "Sections containing metrics, tables, and lists", { events: ["uif:dashboard-error"], security: ["Custom HTML widgets are explicitly caller-trusted."] }),
    "desktop-shell": contract("desktop-shell", "desktop", "Application landmarks and navigation", { actions: ["toggle-sidebar", "set-density"], events: ["uif:desktop-change"], security: ["Persist preferences only; never store credentials."] }),
    realtime: contract("realtime", "realtime", "Existing feed content", { attributes: [...commonAttributes, "data-uif-src", "data-uif-mode", "data-uif-interval"], events: ["uif:realtime-state", "uif:realtime-message", "uif:realtime-error"], states: ["connecting", "connected", "disconnected", "failed"], security: ["Messages are bounded and rendered as text by default."] }),
    push: contract("push", "push", "Notification preference control", { actions: ["subscribe", "unsubscribe"], events: ["uif:push-change", "uif:push-error"], security: ["Subscription authorization and delivery remain server-side."] }),
    "mobile-shell": contract("mobile-shell", "mobile", "Mobile application landmarks and navigation", { roles: ["navigation", "main"], states: ["online", "offline"] }),
    "ai-action": contract("ai-action", "ai", "Button or form describing an assistant action", { events: ["uif:ai-action"], security: ["Browser UI never holds provider credentials."] }),
    "ai-thread": contract("ai-thread", "ai", "Ordered message transcript", { attributes: [...commonAttributes, "data-uif-messages"], roles: ["log"], events: ["uif:agent:feedback", "uif:agent:retry", "uif:agent:copy", "uif:agent:error"], security: ["Agent content uses validated versioned envelopes and text-safe rendering."] }),
    "ai-composer": contract("ai-composer", "ai", "Labelled textarea and submit button", { events: ["uif:agent:submit", "uif:agent:cancel"], states: ["idle", "busy", "disabled"], security: ["Composer emits events and does not invoke a model provider directly."] }),
    "tool-approval": contract("tool-approval", "mcp", "Review summary with explicit decision controls", { actions: ["approve", "reject"], events: ["uif:tool-approve", "uif:tool-reject", "uif:tool-expired", "uif:tool-invalid-review"], states: ["waiting-approval", "decision-pending", "approved", "rejected", "expired"], security: ["Browser confirmation is not authorization or execution."] }),
    "agent-tool": contract("agent-tool", "mcp", "Tool plan, review, progress, result, or receipt summary", { attributes: [...commonAttributes, "data-uif-envelope"], events: ["uif:agent:error", "uif:tool-approve", "uif:tool-reject"], security: ["MCP invocation, permissions, and authoritative audit remain server-side."] }),
    "install-prompt": contract("install-prompt", "pwa", "Normal installation guidance", { actions: ["install"], events: ["uif:pwa-install"], states: ["available", "unavailable", "installed"] })
  });
  function getUIFComponentContract(name) {
    return uifComponentContracts[name];
  }

  // src/diagnostics.ts
  var diagnosticsOptions = Object.freeze({ enabled: false });
  var safeCode = /^[A-Z][A-Z0-9_-]{1,99}$/;
  var safeName = /^[a-z][a-z0-9-]{0,99}$/;
  var safeCorrelation = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;
  function diagnosticDurationBucket(milliseconds) {
    if (milliseconds < 1) return "<1ms";
    if (milliseconds < 16) return "1-15ms";
    if (milliseconds < 51) return "16-50ms";
    if (milliseconds < 251) return "51-250ms";
    if (milliseconds < 1001) return "251-1000ms";
    return ">1000ms";
  }
  function configureDiagnostics(options) {
    diagnosticsOptions = Object.freeze(options ? { ...options } : { enabled: false });
  }
  function normalizeDiagnostic(input) {
    if (!safeName.test(input.package ?? "")) throw new Error("Invalid diagnostic package");
    if (input.component && !safeName.test(input.component)) throw new Error("Invalid diagnostic component");
    if (!safeCode.test(input.code ?? "")) throw new Error("Invalid diagnostic code");
    if (input.correlationRef && !safeCorrelation.test(input.correlationRef)) throw new Error("Invalid diagnostic correlation reference");
    const duration = "durationMilliseconds" in input ? input.durationMilliseconds : void 0;
    return Object.freeze({
      version: 3,
      package: input.package,
      component: input.component,
      code: input.code,
      phase: typeof input.phase === "string" ? input.phase.slice(0, 100) : void 0,
      recoverable: input.recoverable === true,
      durationBucket: input.durationBucket ?? (typeof duration === "number" && Number.isFinite(duration) ? diagnosticDurationBucket(Math.max(0, duration)) : void 0),
      correlationRef: input.correlationRef,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  function reportDiagnostic(input) {
    if (!diagnosticsOptions.enabled) return null;
    let diagnostic = normalizeDiagnostic(input);
    const redacted = diagnosticsOptions.redact?.(diagnostic);
    if (redacted) diagnostic = normalizeDiagnostic({ ...diagnostic, ...redacted });
    diagnosticsOptions.handle?.(diagnostic);
    const target = diagnosticsOptions.target ?? (typeof document === "undefined" ? void 0 : document);
    target?.dispatchEvent(new CustomEvent("uif:diagnostic", { detail: diagnostic }));
    return diagnostic;
  }

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
  function normalizePermissions(raw, issues) {
    const source = isRecord(raw) ? raw : {};
    const network = Array.isArray(source.network) ? source.network.filter((item) => typeof item === "string") : [];
    network.forEach((entry, index) => {
      if (entry === "*" || entry.includes("*")) {
        issues.push({
          path: `permissions.network.${index}`,
          message: "Wildcard network permissions are not supported; register an exact origin or path prefix."
        });
      }
    });
    return {
      network: network.filter((entry) => !entry.includes("*")),
      storage: booleanValue(source.storage, true),
      realtime: booleanValue(source.realtime, false),
      ai: booleanValue(source.ai, false),
      mcp: booleanValue(source.mcp, false)
    };
  }
  function validateMicroAppManifest(input) {
    const issues = [];
    const rawSource = isRecord(input) ? input : {};
    findUnsafeObjectPaths(rawSource).forEach((path) => {
      issues.push({ path, message: `Unsafe or excessively complex manifest path: ${path}` });
    });
    const source = Object.entries(rawSource).reduce((safe, [key, value]) => {
      if (isSafeObjectKey(key) && findUnsafeObjectPaths(value).length === 0) safe[key] = value;
      return safe;
    }, /* @__PURE__ */ Object.create(null));
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
      permissions: normalizePermissions(source.permissions, issues),
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
  function sameOrigin(src) {
    if (typeof window === "undefined") return false;
    try {
      return new URL(src, window.location.href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  function sourceAllowed(src, permissions) {
    if (!src) return false;
    const network = permissions.network ?? [];
    if (network.includes("self") && sameOrigin(src)) return true;
    try {
      const url = new URL(src, typeof window === "undefined" ? "http://localhost/" : window.location.href);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
      return network.some((entry) => {
        if (entry === src || entry === url.origin) return true;
        try {
          const capability = new URL(entry, typeof window === "undefined" ? "http://localhost/" : window.location.href);
          return capability.protocol === url.protocol && capability.origin === url.origin && entry.endsWith("/") && url.href.startsWith(capability.href);
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }
  function listMicroAppConnectorWorkflows(manifest) {
    return manifest.connectors.map((connector, index) => {
      const name = connector.name || `Connector ${index + 1}`;
      if (connector.type === "static") {
        return {
          name,
          type: connector.type,
          mode: connector.mode ?? "readonly",
          src: connector.src,
          refreshInterval: connector.refreshInterval,
          permission: "local"
        };
      }
      if (!connector.src) {
        return {
          name,
          type: connector.type,
          mode: connector.mode ?? "readonly",
          refreshInterval: connector.refreshInterval,
          permission: "blocked",
          reason: "Connector source is required."
        };
      }
      const allowed = sourceAllowed(connector.src, manifest.permissions);
      return {
        name,
        type: connector.type,
        mode: connector.mode ?? "readonly",
        src: connector.src,
        refreshInterval: connector.refreshInterval,
        permission: allowed ? "allowed" : "blocked",
        reason: allowed ? void 0 : "Connector source is not listed in permissions.network."
      };
    });
  }
  function validateMicroAppConnectorWorkflows(manifest) {
    return listMicroAppConnectorWorkflows(manifest).map(
      (workflow, index) => workflow.permission === "blocked" ? { path: `connectors.${index}.src`, message: workflow.reason ?? "Connector is blocked" } : void 0
    ).filter((issue) => Boolean(issue));
  }

  // src/migration.ts
  var uifMigrationRules = Object.freeze([
    {
      id: "options-json",
      introduced: "2.4.0",
      strictIn: 3,
      surface: "data-uif-options",
      legacy: "Semicolon-delimited key:value options",
      replacement: "A bounded JSON object using the component option schema",
      diagnostic: "legacy-options"
    },
    {
      id: "typed-text-json",
      introduced: "2.6.0",
      strictIn: 3,
      surface: "data-uif-strings",
      legacy: "Pipe-delimited phrase lists",
      replacement: "A bounded JSON string array",
      diagnostic: "legacy-typed-text-strings"
    },
    {
      id: "cross-origin-capability",
      introduced: "2.6.0",
      strictIn: 3,
      surface: "Remote URL options",
      legacy: "Markup-only cross-origin allow flags",
      replacement: "An application-registered exact origin/path capability plus explicit element intent",
      diagnostic: "cross-origin-capability-required"
    },
    {
      id: "partitioned-storage",
      introduced: "2.6.0",
      strictIn: 3,
      surface: "Persisted browser convenience data",
      legacy: "Unpartitioned global keys",
      replacement: "configureStoragePartition() before persistence and owner-scoped cleanup at sign-out",
      diagnostic: "storage-partition-recommended"
    },
    {
      id: "agent-envelope-version",
      introduced: "2.4.0",
      strictIn: 3,
      surface: "AI and MCP decisions",
      legacy: "Unknown, incomplete, or unversioned decision envelopes",
      replacement: "A governed Agent Interaction Envelope with supported version, request ID, expiry, and audit reference",
      diagnostic: "agent-envelope-unavailable"
    }
  ]);

  // src/index.ts
  var plugins = /* @__PURE__ */ new Map();
  var apps = /* @__PURE__ */ new WeakMap();
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
      JSON.parse(raw);
      const result = parseUIFConfiguration(raw);
      if (!result.valid) emit("uif:runtime:diagnostic", { component: el.dataset.uif, issues: result.issues }, el);
      return result.value;
    } catch {
      const compatibilityMode2 = getCompatibilityMode();
      emit("uif:runtime:diagnostic", {
        component: el.dataset.uif,
        issues: [{
          path: "data-uif-options",
          code: compatibilityMode2 === "v3" ? "legacy-options-rejected" : "legacy-options",
          message: compatibilityMode2 === "v3" ? "Legacy semicolon options are rejected in v3 mode; use a JSON object." : "Legacy semicolon options are deprecated; migrate to a JSON object before v3."
        }]
      }, el);
      if (compatibilityMode2 === "v3") return {};
      return raw.split(";").reduce((acc, pair) => {
        const [key, ...rest] = pair.split(":");
        const name = key?.trim();
        if (!name || !isSafeObjectKey(name)) {
          if (name) emit("uif:runtime:diagnostic", { component: el.dataset.uif, issues: [{ path: name, code: "unsafe-key", message: `Unsafe option key: ${name}` }] }, el);
          return acc;
        }
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
    const value = color.trim();
    const supported = typeof CSS !== "undefined" && typeof CSS.supports === "function" ? CSS.supports("color", value) : (() => {
      const probe = document.createElement("span");
      probe.style.color = value;
      return Boolean(probe.style.color);
    })();
    if (!supported) {
      throw new UIFError("Batoi UIF refused an invalid accent color", {
        code: "UIF_INVALID_ACCENT",
        category: "security",
        package: "core",
        phase: "theme",
        recoverable: true
      });
    }
    target.style.setProperty("--uif-accent", value);
    target.style.setProperty("--uif-color-primary", value);
  }
  function init(root = document, options = {}) {
    const existing = apps.get(root);
    if (existing && !existing.destroyed) return existing;
    emit("uif:before-init", { root, options }, root);
    const app = {
      root,
      options,
      destroyed: false,
      destroy() {
        if (app.destroyed) return;
        emit("uif:before-destroy", { root }, root);
        app.destroyed = true;
        apps.delete(root);
        emit("uif:destroy", { root }, root);
      },
      restart(nextOptions = options) {
        app.destroy();
        return init(root, nextOptions);
      }
    };
    apps.set(root, app);
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
