interface ToastOptions {
    type?: string;
    duration?: number;
    placement?: string;
    dismissible?: boolean;
}
declare function setupToast(toastEl: HTMLElement, options?: ToastOptions): () => void;
declare function showToast(message: string, options?: ToastOptions): HTMLElement;

export { setupToast, showToast };
