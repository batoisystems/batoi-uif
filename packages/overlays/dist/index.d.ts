interface OverlayOptions {
    opener?: HTMLElement | null;
    modal?: boolean;
    restoreFocus?: boolean;
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}
declare function getOverlayStack(): HTMLElement[];
declare function openOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function closeOverlay(el?: HTMLElement | undefined): Promise<void>;
declare function toggleOverlay(el: HTMLElement, options?: OverlayOptions): Promise<void>;
declare function positionOverlay(anchor: HTMLElement, panel: HTMLElement, options?: OverlayOptions): void;

export { type OverlayOptions, closeOverlay, getOverlayStack, openOverlay, positionOverlay, toggleOverlay };
