import {
  setComponentState
} from "./chunk-TH7UJRFA.js";

// src/controls/drawer.ts
import { closeOverlay, destroyOverlay, openOverlay } from "@batoi/uif-overlays";
function initDrawer(el) {
  const open = (opener) => {
    void openOverlay(el, { modal: true, restoreFocus: true, opener });
    setComponentState(el, true);
  };
  const close = () => {
    void closeOverlay(el);
    setComponentState(el, false);
  };
  const onClose = (event) => {
    if (event.target === el) setComponentState(el, false);
  };
  el.addEventListener("uif:overlay-close", onClose);
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.setAttribute("aria-modal", "true");
  el.dataset.uifMode = el.dataset.uifMode ?? "left";
  if (!el.dataset.uifState) setComponentState(el, false);
  return {
    destroy: () => {
      destroyOverlay(el);
      el.removeEventListener("uif:overlay-close", onClose);
    },
    open,
    close,
    toggle: (opener) => el.dataset.uifState === "open" ? close() : open(opener)
  };
}

export {
  initDrawer
};
