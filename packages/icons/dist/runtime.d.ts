import { d as IconRegistry, c as IconOptions, I as IconDefinition } from './types-Cudl5MAr.js';

/** Definitions are reviewed application assets, never model/user-provided SVG. */
declare function createIconRenderer(definitions: Readonly<IconRegistry>): {
    icon: (name: string, options?: IconOptions) => string;
    has: (name: string) => boolean;
    register(name: string, definition: IconDefinition): void;
    mount(root?: ParentNode): void;
};

export { createIconRenderer };
