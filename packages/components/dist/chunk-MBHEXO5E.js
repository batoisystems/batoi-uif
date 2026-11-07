import {
  setupToast
} from "./chunk-KT6YEKUB.js";
import {
  setComponentState
} from "./chunk-D73MWFXY.js";

// src/controls/toast.ts
function initToast(el) {
  el.setAttribute("role", el.dataset.uifType === "danger" ? "alert" : "status");
  if (!el.dataset.uifState) setComponentState(el, true);
  const dispose = setupToast(el, {
    duration: Number(el.dataset.uifDuration) || void 0,
    dismissible: el.dataset.uifDismissible !== "false"
  });
  return {
    destroy: dispose,
    close: () => {
      dispose();
      el.remove();
    }
  };
}

export {
  initToast
};
