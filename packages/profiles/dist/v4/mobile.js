import {
  startSelected
} from "../chunk-BWRGULYP.js";

// src/v4/mobile.ts
import { initDrawer } from "@batoi/uif-components/drawer";
import { initModal } from "@batoi/uif-components/modal";
import { initMobileShell, initNetworkStatus, initSheetModal } from "@batoi/uif-mobile";
function startMobile(root = document) {
  return startSelected(root, [
    { name: "drawer", init: initDrawer },
    { name: "mobile-shell", init: (el) => ({ ...initMobileShell(el) }) },
    { name: "network-status", init: (el) => ({ ...initNetworkStatus(el) }) },
    {
      name: "sheet",
      init(el) {
        initSheetModal(el);
        return initModal(el);
      }
    }
  ]);
}
export {
  startMobile
};
