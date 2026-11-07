import * as _batoi_uif_components_application from '@batoi/uif-components/application';
export { createUIF } from '@batoi/uif-components/application';

declare function startEssential(root?: Document | HTMLElement): {
    register: (component: _batoi_uif_components_application.SelectedComponent) => () => void;
    refresh(target?: Document | HTMLElement): void;
    rehydrate(target?: Document | HTMLElement): void;
    suspend(target?: Document | HTMLElement): void;
    resume(target?: Document | HTMLElement): void;
    destroy(): void;
};

export { startEssential };
