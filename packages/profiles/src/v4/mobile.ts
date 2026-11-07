import { initDrawer } from '@batoi/uif-components/drawer';
import { initModal } from '@batoi/uif-components/modal';
import { initMobileShell, initNetworkStatus, initSheetModal } from '@batoi/uif-mobile';
import { startSelected } from '../selected.js';

/** Browser/mobile-web shell. No service worker, push, queue or native OS code. */
export function startMobile(root: Document | HTMLElement = document) {
  return startSelected(root, [
    { name: 'drawer', init: initDrawer },
    { name: 'mobile-shell', init: (el) => ({ ...initMobileShell(el) }) },
    { name: 'network-status', init: (el) => ({ ...initNetworkStatus(el) }) },
    {
      name: 'sheet',
      init(el) {
        initSheetModal(el);
        return initModal(el);
      },
    },
  ]);
}
