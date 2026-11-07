type UIFCompatibilityMode = 'v2' | 'diagnostic' | 'v3';
interface UIFCompatibilityOptions {
    mode?: UIFCompatibilityMode;
}
declare function configureCompatibility(options: UIFCompatibilityOptions | null): void;
declare function getCompatibilityMode(): UIFCompatibilityMode;

export { type UIFCompatibilityMode, type UIFCompatibilityOptions, configureCompatibility, getCompatibilityMode };
