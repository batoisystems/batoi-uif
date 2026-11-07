import {
  handleAction
} from "./chunk-KE65AGYK.js";

// src/controls/button.ts
function initButton(el) {
  el.addEventListener("click", handleAction);
  return { destroy: () => el.removeEventListener("click", handleAction) };
}

export {
  initButton
};
