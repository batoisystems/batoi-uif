type UIFErrorCategory = 'config' | 'security' | 'network' | 'limit' | 'state' | 'compatibility' | 'internal';
interface UIFErrorDetail {
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
declare class UIFError extends Error implements UIFErrorDetail {
    readonly code: string;
    readonly category: UIFErrorCategory;
    readonly package: string;
    readonly component?: string;
    readonly phase?: string;
    readonly recoverable: boolean;
    readonly retryable?: boolean;
    readonly correlationId?: string;
    constructor(message: string, detail: UIFErrorDetail);
}
interface UIFResourceLimits {
    maxBytes?: number;
    maxCharacters?: number;
    maxItems?: number;
    maxKeys?: number;
    maxDepth?: number;
}
declare const defaultUIFResourceLimits: Readonly<Required<UIFResourceLimits>>;
declare function isSafeObjectKey(key: string): boolean;
declare function isSafePropertyPath(path: string): boolean;
declare function assertSafePropertyPath(path: string): void;
interface UIFObjectInspectionOptions {
    maxDepth?: number;
    maxKeys?: number;
    maxIssues?: number;
}
declare function findUnsafeObjectPaths(value: unknown, options?: UIFObjectInspectionOptions): string[];
declare function assertSafeObject(value: unknown, options?: UIFObjectInspectionOptions): void;
interface UIFConfigurationIssue {
    path: string;
    code: 'invalid-json' | 'not-object' | 'unknown-key' | 'unsafe-key' | 'limit';
    message: string;
}
interface UIFConfigurationResult<T extends Record<string, unknown>> {
    value: T;
    issues: UIFConfigurationIssue[];
    valid: boolean;
}
interface UIFConfigurationOptions {
    allowedKeys?: readonly string[];
    allowUnknown?: boolean;
    limits?: UIFResourceLimits;
}
type UIFJSONShape = 'any' | 'array' | 'object';
interface UIFJSONParseOptions {
    shape?: UIFJSONShape;
    limits?: UIFResourceLimits;
}
interface UIFJSONIssue {
    path: string;
    code: 'invalid-json' | 'invalid-shape' | 'unsafe-key' | 'limit';
    message: string;
}
interface UIFJSONResult<T = unknown> {
    value: T | undefined;
    issues: UIFJSONIssue[];
    valid: boolean;
}
declare function parseUIFJSON<T = unknown>(input: string, options?: UIFJSONParseOptions): UIFJSONResult<T>;
declare function parseUIFConfiguration<T extends Record<string, unknown> = Record<string, unknown>>(input: string | unknown, options?: UIFConfigurationOptions): UIFConfigurationResult<T>;

export { type UIFConfigurationIssue, type UIFConfigurationOptions, type UIFConfigurationResult, UIFError, type UIFErrorCategory, type UIFErrorDetail, type UIFJSONIssue, type UIFJSONParseOptions, type UIFJSONResult, type UIFJSONShape, type UIFObjectInspectionOptions, type UIFResourceLimits, assertSafeObject, assertSafePropertyPath, defaultUIFResourceLimits, findUnsafeObjectPaths, isSafeObjectKey, isSafePropertyPath, parseUIFConfiguration, parseUIFJSON };
