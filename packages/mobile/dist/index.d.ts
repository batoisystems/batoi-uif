declare function initMobileShell(el: HTMLElement): void;
declare function showOfflineBanner(message?: string): HTMLElement;
declare function initSegmentedControl(el: HTMLElement): void;
declare function initSheetModal(el: HTMLElement): void;
declare function initSwipeAction(el: HTMLElement): void;
declare function initPullToRefresh(el: HTMLElement): void;
declare const mobileShell: {
    name: string;
    init: typeof initMobileShell;
};

export { initMobileShell, initPullToRefresh, initSegmentedControl, initSheetModal, initSwipeAction, mobileShell, showOfflineBanner };
