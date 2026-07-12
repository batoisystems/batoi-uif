interface MobileController {
    refresh(): void;
    destroy(): void;
}
declare function initMobileShell(el: HTMLElement): MobileController;
declare function showOfflineBanner(message?: string): HTMLElement;
declare function hideOfflineBanner(): void;
declare function initSegmentedControl(el: HTMLElement): MobileController;
declare function initSheetModal(el: HTMLElement): void;
declare function initSwipeAction(el: HTMLElement): void;
declare function initPullToRefresh(el: HTMLElement): void;
declare const mobileShell: {
    name: string;
    init: typeof initMobileShell;
};

export { type MobileController, hideOfflineBanner, initMobileShell, initPullToRefresh, initSegmentedControl, initSheetModal, initSwipeAction, mobileShell, showOfflineBanner };
