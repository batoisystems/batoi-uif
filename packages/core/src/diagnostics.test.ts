import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureDiagnostics, diagnosticDurationBucket, reportDiagnostic } from './diagnostics.js';

afterEach(() => configureDiagnostics(null));

describe('privacy-safe diagnostics', () => {
  it('is opt-in and emits only normalized metadata', () => {
    expect(reportDiagnostic({ package: 'core', code: 'UIF_TEST', recoverable: true })).toBeNull();
    const target = new EventTarget();
    const event = vi.fn();
    const handle = vi.fn();
    target.addEventListener('uif:diagnostic', event);
    configureDiagnostics({ enabled: true, target, handle });
    const diagnostic = reportDiagnostic({
      package: 'core',
      component: 'agent-thread',
      code: 'UIF_TEST',
      phase: 'render',
      recoverable: true,
      durationMilliseconds: 17,
      correlationRef: 'request-1',
    });
    expect(diagnostic).toMatchObject({ version: 3, durationBucket: '16-50ms', correlationRef: 'request-1' });
    expect(Object.keys(diagnostic ?? {})).toEqual([
      'version', 'package', 'component', 'code', 'phase', 'recoverable', 'durationBucket', 'correlationRef', 'timestamp',
    ]);
    expect(handle).toHaveBeenCalledOnce();
    expect(event).toHaveBeenCalledOnce();
  });

  it('uses bounded buckets and rejects identifying free-form metadata', () => {
    expect(diagnosticDurationBucket(1001)).toBe('>1000ms');
    configureDiagnostics({ enabled: true });
    expect(() => reportDiagnostic({ package: 'Core User 7', code: 'UIF_TEST', recoverable: false })).toThrow('package');
    expect(() => reportDiagnostic({ package: 'core', code: 'bad message', recoverable: false })).toThrow('code');
  });
});
