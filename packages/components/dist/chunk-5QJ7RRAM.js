import {
  setComponentState
} from "./chunk-D73MWFXY.js";

// src/controls/drawer.ts
import { closeOverlay, destroyOverlay, openOverlay, toggleOverlay } from "@batoi/uif-overlays";
function initDrawer(el) {
  const onClose = (event) => {
    if (event.target === el) setComponentState(el, false);
  };
  el.addEventListener("uif:overlay-close", onClose);
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.dataset.uifMode = el.dataset.uifMode ?? "left";
  if (!el.dataset.uifState) setComponentState(el, false);
  return {
    destroy: () => {
      destroyOverlay(el);
      el.removeEventListener("uif:overlay-close", onClose);
    },
    open: (opener) => {
      void openOverlay(el, { modal: true, restoreFocus: true, opener });
      setComponentState(el, true);
    },
    close: () => {
      void closeOverlay(el);
      setComponentState(el, false);
    },
    toggle: (opener) => {
      void toggleOverlay(el, { modal: true, restoreFocus: true, opener });
      setComponentState(el, el.dataset.uifState !== "open");
    }
  };
}

export {
  initDrawer
};
