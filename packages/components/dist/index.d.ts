interface ComponentInstance {
    destroy(): void;
    open?(): void;
    close?(): void;
    toggle?(): void;
}
declare function initModal(el: HTMLElement): ComponentInstance;
declare function initDrawer(el: HTMLElement): ComponentInstance;
declare function initDropdown(el: HTMLElement): ComponentInstance;
declare function initTabs(el: HTMLElement): ComponentInstance;
declare function initToast(el: HTMLElement): ComponentInstance;
declare function initAccordion(el: HTMLElement): ComponentInstance;
declare function initButton(el: HTMLElement): ComponentInstance;
declare function initPassive(el: HTMLElement): ComponentInstance;
declare function initDismissible(el: HTMLElement): ComponentInstance;
declare function initCollapse(el: HTMLElement): ComponentInstance;
declare function initTooltip(el: HTMLElement): ComponentInstance;
declare function initPopover(el: HTMLElement): ComponentInstance;
declare function initProgress(el: HTMLElement): ComponentInstance;
declare function initPagination(el: HTMLElement): ComponentInstance;
declare function initCommandMenu(el: HTMLElement): ComponentInstance;
declare function initFileUpload(el: HTMLElement): ComponentInstance;
declare function initCombobox(el: HTMLElement): ComponentInstance;
declare function initComponent(el: HTMLElement): void;
declare function destroyComponent(el: HTMLElement): void;
declare function initAll(root?: Document | HTMLElement): () => void;
declare function showToast(message: string, options?: {
    type?: string;
    duration?: number;
}): HTMLElement;
declare const button: {
    name: string;
    init: typeof initButton;
    destroy: typeof destroyComponent;
};
declare const modal: {
    name: string;
    init: typeof initModal;
    destroy: typeof destroyComponent;
};
declare const drawer: {
    name: string;
    init: typeof initDrawer;
    destroy: typeof destroyComponent;
};
declare const offcanvas: {
    name: string;
    init: typeof initDrawer;
    destroy: typeof destroyComponent;
};
declare const dropdown: {
    name: string;
    init: typeof initDropdown;
    destroy: typeof destroyComponent;
};
declare const tabs: {
    name: string;
    init: typeof initTabs;
    destroy: typeof destroyComponent;
};
declare const toast: {
    name: string;
    init: typeof initToast;
    destroy: typeof destroyComponent;
};
declare const accordion: {
    name: string;
    init: typeof initAccordion;
    destroy: typeof destroyComponent;
};
declare const alert: {
    name: string;
    init: typeof initDismissible;
    destroy: typeof destroyComponent;
};
declare const badge: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const breadcrumb: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const collapseComponent: {
    name: string;
    init: typeof initCollapse;
    destroy: typeof destroyComponent;
};
declare const tooltip: {
    name: string;
    init: typeof initTooltip;
    destroy: typeof destroyComponent;
};
declare const popover: {
    name: string;
    init: typeof initPopover;
    destroy: typeof destroyComponent;
};
declare const progress: {
    name: string;
    init: typeof initProgress;
    destroy: typeof destroyComponent;
};
declare const spinner: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const skeleton: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const pagination: {
    name: string;
    init: typeof initPagination;
    destroy: typeof destroyComponent;
};
declare const commandMenu: {
    name: string;
    init: typeof initCommandMenu;
    destroy: typeof destroyComponent;
};
declare const navbar: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const sidebar: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const stepper: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const wizard: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const fileUpload: {
    name: string;
    init: typeof initFileUpload;
    destroy: typeof destroyComponent;
};
declare const combobox: {
    name: string;
    init: typeof initCombobox;
    destroy: typeof destroyComponent;
};
declare const card: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const nav: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};
declare const table: {
    name: string;
    init: typeof initPassive;
    destroy: typeof destroyComponent;
};

export { type ComponentInstance, accordion, alert, badge, breadcrumb, button, card, collapseComponent, combobox, commandMenu, destroyComponent, drawer, dropdown, fileUpload, initAll, initComponent, modal, nav, navbar, offcanvas, pagination, popover, progress, showToast, sidebar, skeleton, spinner, stepper, table, tabs, toast, tooltip, wizard };
