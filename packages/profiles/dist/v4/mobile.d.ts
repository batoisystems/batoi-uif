import * as _batoi_uif_components_application from '@batoi/uif-components/application';

/** Browser/mobile-web shell. No service worker, push, queue or native OS code. */
declare function startMobile(root?: Document | HTMLElement): {
    register: (component: _batoi_uif_components_application.SelectedComponent) => () => void;
    refresh(target?: Document | HTMLElement): void;
    rehydrate(target?: Document | HTMLElement): void;
    suspend(target?: Document | HTMLElement): void;
    resume(target?: Document | HTMLElement): void;
    destroy(): void;
};

export { startMobile };
