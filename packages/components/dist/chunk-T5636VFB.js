import {
  eventElement
} from "./chunk-D73MWFXY.js";

// src/controls/dismissible.ts
import { hide } from "@batoi/uif-effects";
function initDismissible(el) {
  const close = () => {
    void hide(el);
    el.dataset.uifState = "closed";
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
  };
  el.addEventListener("click", onClick);
  return { destroy: () => el.removeEventListener("click", onClick), close };
}

export {
  initDismissible
};
