import { configureCompatibility } from '@batoi/uif-core';

configureCompatibility({ mode: 'diagnostic' });

export * from './all.js';

export const compatibilityBuild = Object.freeze({
  version: 3,
  mode: 'diagnostic' as const,
  behavior: 'v2-compatible' as const,
  purpose: 'Run existing v2 behavior while emitting migration diagnostics before strict v3 adoption.',
});
