import {
  webComponents
} from "../chunk-KPB2OILD.js";
import {
  startSelected
} from "../chunk-BWRGULYP.js";

// src/v4/desktop.ts
import { initShell } from "@batoi/uif-components/shell";
import { bindDesktopOfflineIndicator } from "@batoi/uif-desktop";
function startDesktop(root = document) {
  return startSelected(root, [
    ...webComponents,
    {
      name: "desktop-shell",
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
          }
        };
      }
    }
  ]);
}
export {
  startDesktop
};
