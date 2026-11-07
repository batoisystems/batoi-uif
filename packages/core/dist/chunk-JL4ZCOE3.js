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
    const record = /* @__PURE__ */ Object.create(null);
    cloned.set(value, record);
    Object.entries(value).forEach(([key, item]) => {
      if (isSafeObjectKey(key)) record[key] = cloneSafeValue(item);
    });
    return record;
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

export {
  UIFError,
  defaultUIFResourceLimits,
  isSafeObjectKey,
  isSafePropertyPath,
  assertSafePropertyPath,
  findUnsafeObjectPaths,
  assertSafeObject,
  parseUIFJSON,
  parseUIFConfiguration
};
