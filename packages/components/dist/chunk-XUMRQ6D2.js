// src/controls/popover.ts
import { closeOverlay, openOverlay, positionOverlay } from "@batoi/uif-overlays";
function initPopover(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]') || el;
  const panel = el.querySelector('[data-uif-role="panel"]');
  const open = () => {
    if (!panel) return;
    positionOverlay(trigger, panel);
    void openOverlay(panel, { restoreFocus: true });
    panel.dataset.uifState = "open";
    trigger.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    if (!panel) return;
    void closeOverlay(panel);
    panel.dataset.uifState = "closed";
    trigger.setAttribute("aria-expanded", "false");
  };
  const toggle = () => panel?.dataset.uifState === "open" ? close() : open();
  trigger.addEventListener("click", toggle);
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  panel?.setAttribute("role", panel.getAttribute("role") || "dialog");
  panel?.setAttribute("hidden", "");
  if (panel && !panel.dataset.uifState) panel.dataset.uifState = "closed";
  return { destroy: () => trigger.removeEventListener("click", toggle), open, close, toggle };
}

export {
  initPopover
};
