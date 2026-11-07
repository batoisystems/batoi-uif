import { initShell } from '@batoi/uif-components/shell';
import { bindDesktopOfflineIndicator } from '@batoi/uif-desktop';
import { startSelected } from '../selected.js';
import { webComponents } from '../web-components.js';

/** Server-rendered browser workspace, not native desktop packaging. */
export function startDesktop(root: Document | HTMLElement = document) {
  return startSelected(root, [
    ...webComponents,
    {
      name: 'desktop-shell',
      init(el) {
        const shell = initShell(el);
        const dispose = bindDesktopOfflineIndicator(el);
        return {
          ...shell,
          destroy() {
            try {
              dispose();
            } finally {
              shell.destroy();
            }
          },
        };
      },
    },
  ]);
}
