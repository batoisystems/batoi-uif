interface OverlayOptions {
    opener?: HTMLElement | null;
    modal?: boolean;
    inert?: boolean;
    restoreFocus?: boolean;
    closeOnEscape?: boolean;
    placement?: 'auto' | 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    offset?: number;
}
declare function getOverlayStack(): HTMLElement[];
declare function openOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function closeOverlay(el?: HTMLElement | undefined): Promise<void>;
declare function toggleOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function positionOverlay(anchor: HTMLElement, panel: HTMLElement, options?: OverlayOptions): void;

export { type OverlayOptions, closeOverlay, getOverlayStack, openOverlay, positionOverlay, toggleOverlay };
