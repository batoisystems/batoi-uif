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
    /** Use after replacing inner HTML/attributes of an existing component root. */
    rehydrate(target?: Document | HTMLElement): void;
    suspend(target?: Document | HTMLElement): void;
    resume(target?: Document | HTMLElement): void;
    destroy(): void;
};

export { type SelectedComponent, createUIF };
