import { ComponentInit } from './controller.js';

interface SelectedComponent {
    name: string;
    init: ComponentInit;
    optionKeys?: readonly string[];
}
/** Explicit, per-application registration. Importing this module mounts nothing. */
declare function createUIF(root: Document | HTMLElement, components?: readonly SelectedComponent[]): {
    register: (component: SelectedComponent) => () => void;
    refresh(target?: Document | HTMLElement): void;
    destroy(): void;
};

export { type SelectedComponent, createUIF };
