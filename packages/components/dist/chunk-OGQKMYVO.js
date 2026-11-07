import {
  eventElement,
  setComponentState
} from "./chunk-TH7UJRFA.js";

// src/controls/modal.ts
import { closeOverlay, destroyOverlay, openOverlay } from "@batoi/uif-overlays";
function initModal(el) {
  const mode = el.dataset.uifMode ?? "dismissible";
  const backdrop = el.dataset.uifBackdrop ?? "true";
  const closeOnEscape = mode !== "locked" && backdrop !== "static" && el.dataset.uifKeyboard !== "false";
  const dialog = el.dataset.uifRole === "dialog" ? el : el.querySelector('[data-uif-role="dialog"]') || el;
  const open = (opener) => {
    void openOverlay(el, { modal: true, restoreFocus: true, closeOnEscape, opener });
    setComponentState(el, true);
  };
  const close = () => {
    if (mode === "locked") return;
    void closeOverlay(el);
    setComponentState(el, false);
  };
  const toggle = (opener) => el.dataset.uifState === "open" ? close() : open(opener);
  const onClick = (event) => {
    const target = eventElement(event);
    if (target?.closest('[data-uif="modal"],[data-uif="drawer"]') !== el) return;
    const action = target?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
    if (target?.dataset.uifRole === "backdrop" && backdrop !== "static") close();
  };
  const onClose = (event) => {
    if (event.target === el) setComponentState(el, false);
  };
  dialog.setAttribute("role", dialog.getAttribute("role") || "dialog");
  dialog.setAttribute("aria-modal", "true");
  if (!el.dataset.uifState) setComponentState(el, false);
  el.addEventListener("uif:overlay-close", onClose);
  el.addEventListener("click", onClick);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      destroyOverlay(el);
      el.removeEventListener("uif:overlay-close", onClose);
    },
    open,
    close,
    toggle
  };
}

export {
  initModal
};
