interface ComponentInstance {
    destroy(): void;
    open?(): void;
    close?(): void;
    toggle?(): void;
    [action: string]: unknown;
}
type ComponentInit = (el: HTMLElement) => ComponentInstance;
declare function handleAction(event: Event): void;
declare function mountComponent(el: HTMLElement, init: ComponentInit, owner?: Document | HTMLElement): ComponentInstance;
declare function destroyComponent(el: HTMLElement): void;
declare function bindComponentActions(root?: Document | HTMLElement): () => void;

export { type ComponentInit, type ComponentInstance, bindComponentActions, destroyComponent, handleAction, mountComponent };
