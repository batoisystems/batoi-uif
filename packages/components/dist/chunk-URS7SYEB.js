import {
  handleAction
} from "./chunk-XTKZWVVP.js";

// src/controls/button.ts
function initButton(el) {
  el.addEventListener("click", handleAction);
  return { destroy: () => el.removeEventListener("click", handleAction) };
}

export {
  initButton
};
