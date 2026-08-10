export type UIFDiagnosticDurationBucket = '<1ms' | '1-15ms' | '16-50ms' | '51-250ms' | '251-1000ms' | '>1000ms';

export interface UIFDiagnostic {
  version: 3;
  package: string;
  component?: string;
  code: string;
  phase?: string;
  recoverable: boolean;
  durationBucket?: UIFDiagnosticDurationBucket;
  correlationRef?: string;
  timestamp: string;
}

export interface UIFDiagnosticInput extends Omit<UIFDiagnostic, 'version' | 'timestamp'> {
  durationMilliseconds?: number;
}

export interface UIFDiagnosticsOptions {
  enabled?: boolean;
  target?: EventTarget;
  handle?: (diagnostic: Readonly<UIFDiagnostic>) => void;
  redact?: (diagnostic: Readonly<UIFDiagnostic>) => Partial<UIFDiagnostic> | void;
}

let diagnosticsOptions: UIFDiagnosticsOptions = Object.freeze({ enabled: false });
const safeCode = /^[A-Z][A-Z0-9_-]{1,99}$/;
const safeName = /^[a-z][a-z0-9-]{0,99}$/;
const safeCorrelation = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,199}$/;

export function diagnosticDurationBucket(milliseconds: number): UIFDiagnosticDurationBucket {
  if (milliseconds < 1) return '<1ms';
  if (milliseconds < 16) return '1-15ms';
  if (milliseconds < 51) return '16-50ms';
  if (milliseconds < 251) return '51-250ms';
  if (milliseconds < 1001) return '251-1000ms';
  return '>1000ms';
}

export function configureDiagnostics(options: UIFDiagnosticsOptions | null): void {
  diagnosticsOptions = Object.freeze(options ? { ...options } : { enabled: false });
}

function normalizeDiagnostic(input: UIFDiagnosticInput | Partial<UIFDiagnostic>): UIFDiagnostic {
  if (!safeName.test(input.package ?? '')) throw new Error('Invalid diagnostic package');
  if (input.component && !safeName.test(input.component)) throw new Error('Invalid diagnostic component');
  if (!safeCode.test(input.code ?? '')) throw new Error('Invalid diagnostic code');
  if (input.correlationRef && !safeCorrelation.test(input.correlationRef)) throw new Error('Invalid diagnostic correlation reference');
  const duration = 'durationMilliseconds' in input ? input.durationMilliseconds : undefined;
  return Object.freeze({
    version: 3,
    package: input.package as string,
    component: input.component,
    code: input.code as string,
    phase: typeof input.phase === 'string' ? input.phase.slice(0, 100) : undefined,
    recoverable: input.recoverable === true,
    durationBucket: input.durationBucket ?? (typeof duration === 'number' && Number.isFinite(duration) ? diagnosticDurationBucket(Math.max(0, duration)) : undefined),
    correlationRef: input.correlationRef,
    timestamp: new Date().toISOString(),
  });
}

export function reportDiagnostic(input: UIFDiagnosticInput): Readonly<UIFDiagnostic> | null {
  if (!diagnosticsOptions.enabled) return null;
  let diagnostic = normalizeDiagnostic(input);
  const redacted = diagnosticsOptions.redact?.(diagnostic);
  if (redacted) diagnostic = normalizeDiagnostic({ ...diagnostic, ...redacted });
  diagnosticsOptions.handle?.(diagnostic);
  const target = diagnosticsOptions.target ?? (typeof document === 'undefined' ? undefined : document);
  target?.dispatchEvent(new CustomEvent('uif:diagnostic', { detail: diagnostic }));
  return diagnostic;
}
