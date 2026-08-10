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
    assertSafeObject: () => assertSafeObject,
    assertSafePropertyPath: () => assertSafePropertyPath,
    configureCompatibility: () => configureCompatibility,
    configureDiagnostics: () => configureDiagnostics,
    createComponentRegistry: () => createComponentRegistry,
    defaultUIFResourceLimits: () => defaultUIFResourceLimits,
    diagnosticDurationBucket: () => diagnosticDurationBucket,
    emit: () => emit,
    findUnsafeObjectPaths: () => findUnsafeObjectPaths,
    getCompatibilityMode: () => getCompatibilityMode,
    init: () => init,
    isSafeObjectKey: () => isSafeObjectKey,
    isSafePropertyPath: () => isSafePropertyPath,
    listMicroAppConnectorWorkflows: () => listMicroAppConnectorWorkflows,
    on: () => on,
    parseAgentEnvelope: () => parseAgentEnvelope,
    parseMicroAppManifest: () => parseMicroAppManifest,
    parseOptions: () => parseOptions,
    parseUIFConfiguration: () => parseUIFConfiguration,
    registerPlugin: () => registerPlugin,
    reportDiagnostic: () => reportDiagnostic,
    setAccent: () => setAccent,
    setDensity: () => setDensity,
    uifActions: () => uifActions,
    uifAttributes: () => uifAttributes,
    uifContractRegistry: () => uifContractRegistry,
    uifEvents: () => uifEvents,
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
  function parseUIFConfiguration(input, options = {}) {
    const issues = [];
    let parsed = input;
    if (typeof input === "string") {
      try {
        parsed = JSON.parse(input);
      } catch {
        issues.push({ path: "$", code: "invalid-json", message: "Configuration must be valid JSON." });
        parsed = {};
      }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      issues.push({ path: "$", code: "not-object", message: "Configuration must be a JSON object." });
      parsed = {};
    }
    const unsafe = findUnsafeObjectPaths(parsed, options.limits);
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
  var kinds = /* @__PURE__ */ new Set([
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
  var statuses = /* @__PURE__ */ new Set([
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
    "ai-thread",
    "ai-composer",
    "agent-tool",
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
    "uif:tool-replay-blocked"
  ];
  function contractEntries(values) {
    return Object.freeze(values.map((name) => Object.freeze({ name, version: 3, status: "stable" })));
  }
  var uifContractRegistry = Object.freeze({
    attributes: contractEntries(uifAttributes),
    components: contractEntries(uifValues),
    actions: contractEntries(uifActions),
    states: contractEntries(uifStates),
    events: contractEntries(uifEvents)
  });

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
        entry.abortController.abort();
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
          const abortController = new AbortController();
          try {
            const controller = normalizeController(definition.mount({
              element,
              root,
              options,
              signal: abortController.signal,
              emit: (eventName, detail) => emit(eventName, detail, element),
              error: (message, detail) => new UIFError(message, { ...detail, package: "core", component: name })
            }));
            entries.set(name, { controller, abortController });
            mounted.set(element, entries);
            ownedElements.add(element);
            emit("uif:runtime:mounted", { component: name, version: definition.version ?? 3 }, element);
          } catch (cause) {
            abortController.abort();
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
