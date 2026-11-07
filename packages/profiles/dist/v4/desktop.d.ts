import * as _batoi_uif_components_application from '@batoi/uif-components/application';

/** Server-rendered browser workspace, not native desktop packaging. */
declare function startDesktop(root?: Document | HTMLElement): {
    register: (component: _batoi_uif_components_application.SelectedComponent) => () => void;
    refresh(target?: Document | HTMLElement): void;
    rehydrate(target?: Document | HTMLElement): void;
    suspend(target?: Document | HTMLElement): void;
    resume(target?: Document | HTMLElement): void;
    destroy(): void;
};

export { startDesktop };
