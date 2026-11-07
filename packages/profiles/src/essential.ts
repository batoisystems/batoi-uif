import { createUIF } from '@batoi/uif-components/application';
import { initModal } from '@batoi/uif-components/modal';
import { initDropdown } from '@batoi/uif-components/dropdown';
import { initTabs } from '@batoi/uif-components/tabs';
import { initAccordion } from '@batoi/uif-components/accordion';
import { initCollapse } from '@batoi/uif-components/collapse';
import { initToast } from '@batoi/uif-components/toast';

export { createUIF } from '@batoi/uif-components/application';

export function startEssential(root: Document | HTMLElement = document) {
  const app = createUIF(root, [
    { name: 'modal', init: initModal },
    { name: 'dropdown', init: initDropdown },
    { name: 'tabs', init: initTabs },
    { name: 'accordion', init: initAccordion },
    { name: 'collapse', init: initCollapse },
    { name: 'toast', init: initToast },
  ]);
  try { app.refresh(); return app; }
  catch (error) { app.destroy(); throw error; }
}
