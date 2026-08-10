export type UIFCompatibilityMode = 'v2' | 'diagnostic' | 'v3';

export interface UIFCompatibilityOptions {
  mode?: UIFCompatibilityMode;
}

let compatibilityMode: UIFCompatibilityMode = 'v2';

export function configureCompatibility(options: UIFCompatibilityOptions | null): void {
  compatibilityMode = options?.mode ?? 'v2';
}

export function getCompatibilityMode(): UIFCompatibilityMode {
  return compatibilityMode;
}
