export type UIFErrorCategory =
  | 'config'
  | 'security'
  | 'network'
  | 'limit'
  | 'state'
  | 'compatibility'
  | 'internal';

export interface UIFErrorDetail {
  code: string;
  category: UIFErrorCategory;
  package: string;
  component?: string;
  phase?: string;
  recoverable: boolean;
  retryable?: boolean;
  correlationId?: string;
  cause?: unknown;
}

export class UIFError extends Error implements UIFErrorDetail {
  readonly code: string;
  readonly category: UIFErrorCategory;
  readonly package: string;
  readonly component?: string;
  readonly phase?: string;
  readonly recoverable: boolean;
  readonly retryable?: boolean;
  readonly correlationId?: string;

  constructor(message: string, detail: UIFErrorDetail) {
    super(message, detail.cause === undefined ? undefined : { cause: detail.cause });
    this.name = 'UIFError';
    this.code = detail.code;
    this.category = detail.category;
    this.package = detail.package;
    this.component = detail.component;
    this.phase = detail.phase;
    this.recoverable = detail.recoverable;
    this.retryable = detail.retryable;
    this.correlationId = detail.correlationId;
  }
}

export interface UIFResourceLimits {
  maxBytes?: number;
  maxCharacters?: number;
  maxItems?: number;
  maxKeys?: number;
  maxDepth?: number;
}

export const defaultUIFResourceLimits = Object.freeze<Required<UIFResourceLimits>>({
  maxBytes: 1_000_000,
  maxCharacters: 100_000,
  maxItems: 1_000,
  maxKeys: 1_000,
  maxDepth: 32,
});

const unsafeObjectKeys = new Set(['__proto__', 'prototype', 'constructor']);

export function isSafeObjectKey(key: string): boolean {
  return Boolean(key) && !unsafeObjectKeys.has(key);
}

export function isSafePropertyPath(path: string): boolean {
  if (!path || path.length > 1_000) return false;
  return path.split('.').every((part) => isSafeObjectKey(part));
}

export function assertSafePropertyPath(path: string): void {
  if (!isSafePropertyPath(path)) {
    throw new UIFError('UIF refused an unsafe property path', {
      code: 'UIF_UNSAFE_PROPERTY_PATH',
      category: 'security',
      package: 'core',
      phase: 'configuration',
      recoverable: false,
    });
  }
}

export interface UIFObjectInspectionOptions {
  maxDepth?: number;
  maxKeys?: number;
  maxIssues?: number;
}

export function findUnsafeObjectPaths(
  value: unknown,
  options: UIFObjectInspectionOptions = {},
): string[] {
  const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? defaultUIFResourceLimits.maxDepth));
  const maxKeys = Math.max(1, Math.floor(options.maxKeys ?? defaultUIFResourceLimits.maxKeys));
  const maxIssues = Math.max(1, Math.floor(options.maxIssues ?? 25));
  const issues: string[] = [];
  const seen = new WeakSet<object>();
  let inspectedKeys = 0;

  const inspect = (input: unknown, path: string, depth: number): void => {
    if (!input || typeof input !== 'object' || issues.length >= maxIssues) return;
    if (seen.has(input)) return;
    seen.add(input);
    if (depth > maxDepth) {
      issues.push(path || '$');
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
      inspect((input as Record<string, unknown>)[key], nextPath, depth + 1);
      if (issues.length >= maxIssues) return;
    }
  };

  inspect(value, '', 0);
  return issues;
}

export function assertSafeObject(value: unknown, options: UIFObjectInspectionOptions = {}): void {
  const issues = findUnsafeObjectPaths(value, options);
  if (issues.length) {
    throw new UIFError(`UIF refused unsafe or excessively complex object paths: ${issues.join(', ')}`, {
      code: 'UIF_UNSAFE_OBJECT',
      category: 'security',
      package: 'core',
      phase: 'configuration',
      recoverable: false,
    });
  }
}

export interface UIFConfigurationIssue {
  path: string;
  code: 'invalid-json' | 'not-object' | 'unknown-key' | 'unsafe-key' | 'limit';
  message: string;
}

export interface UIFConfigurationResult<T extends Record<string, unknown>> {
  value: T;
  issues: UIFConfigurationIssue[];
  valid: boolean;
}

export interface UIFConfigurationOptions {
  allowedKeys?: readonly string[];
  allowUnknown?: boolean;
  limits?: UIFObjectInspectionOptions;
}

export function parseUIFConfiguration<T extends Record<string, unknown> = Record<string, unknown>>(
  input: string | unknown,
  options: UIFConfigurationOptions = {},
): UIFConfigurationResult<T> {
  const issues: UIFConfigurationIssue[] = [];
  let parsed: unknown = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input) as unknown;
    } catch {
      issues.push({ path: '$', code: 'invalid-json', message: 'Configuration must be valid JSON.' });
      parsed = {};
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    issues.push({ path: '$', code: 'not-object', message: 'Configuration must be a JSON object.' });
    parsed = {};
  }

  const unsafe = findUnsafeObjectPaths(parsed, options.limits);
  unsafe.forEach((path) => {
    issues.push({ path, code: 'unsafe-key', message: `Unsafe or excessively complex configuration path: ${path}` });
  });

  const allowed = options.allowedKeys ? new Set(options.allowedKeys) : undefined;
  const output = Object.create(null) as Record<string, unknown>;
  const cloned = new WeakMap<object, unknown>();
  const cloneSafeValue = (value: unknown): unknown => {
    if (!value || typeof value !== 'object') return value;
    const existing = cloned.get(value);
    if (existing !== undefined) return existing;
    if (Array.isArray(value)) {
      const array: unknown[] = [];
      cloned.set(value, array);
      value.forEach((item) => array.push(cloneSafeValue(item)));
      return array;
    }
    const record = Object.create(null) as Record<string, unknown>;
    cloned.set(value, record);
    Object.entries(value).forEach(([key, item]) => {
      if (isSafeObjectKey(key)) record[key] = cloneSafeValue(item);
    });
    return record;
  };
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!isSafeObjectKey(key)) continue;
    if (allowed && !allowed.has(key)) {
      issues.push({ path: key, code: 'unknown-key', message: `Unknown configuration key: ${key}` });
      if (options.allowUnknown !== true) continue;
    }
    output[key] = cloneSafeValue(value);
  }

  return { value: output as T, issues, valid: issues.length === 0 };
}
