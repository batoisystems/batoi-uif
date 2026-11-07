import { createUIF, type SelectedComponent } from '@batoi/uif-components/application';
import { initModal } from '@batoi/uif-components/modal';
import { initDropdown } from '@batoi/uif-components/dropdown';
import { initTabs } from '@batoi/uif-components/tabs';
import { initAccordion } from '@batoi/uif-components/accordion';
import { initCollapse } from '@batoi/uif-components/collapse';
import { initToast } from '@batoi/uif-components/toast';

export const essentialComponents: readonly SelectedComponent[] = [
  { name: 'modal', init: initModal },
  { name: 'dropdown', init: initDropdown },
  { name: 'tabs', init: initTabs },
  { name: 'accordion', init: initAccordion },
  { name: 'collapse', init: initCollapse },
  { name: 'toast', init: initToast },
];

type Application = ReturnType<typeof createUIF>;

export function startSelected(
  root: Document | HTMLElement,
  components: readonly SelectedComponent[] = [],
  bind?: (app: Application) => () => void,
): Application {
  const app = createUIF(root, [...essentialComponents, ...components]);
  const destroy = app.destroy;
  let dispose = () => {};
  let destroyed = false;
  app.destroy = () => {
    if (destroyed) return;
    destroyed = true;
    try {
      dispose();
    } finally {
      destroy();
    }
  };
  try {
    dispose = bind?.(app) ?? dispose;
    app.refresh();
    return app;
  } catch (error) {
    app.destroy();
    throw error;
  }
}
