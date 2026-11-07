import { UIFOptions } from './runtime.js';

/** The facade alone preserves v2/diagnostic semicolon compatibility. */
declare function parseOptions(el: HTMLElement): UIFOptions;

export { parseOptions };
