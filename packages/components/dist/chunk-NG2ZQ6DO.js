// src/controls/tooltip.ts
import { hide, show } from "@batoi/uif-effects";
import { positionOverlay } from "@batoi/uif-overlays";
function initTooltip(el) {
  const panel = document.createElement("div");
  panel.className = "uif-tooltip";
  panel.id = el.getAttribute("aria-describedby") || `${el.id || "uif-tooltip"}-panel`;
  panel.setAttribute("role", "tooltip");
  panel.textContent = el.dataset.uifMessage || el.getAttribute("title") || "";
  panel.hidden = true;
  el.removeAttribute("title");
  el.setAttribute("aria-describedby", panel.id);
  document.body.appendChild(panel);
  const open = () => {
    positionOverlay(el, panel);
    void show(panel);
  };
  const close = () => void hide(panel);
  el.addEventListener("mouseenter", open);
  el.addEventListener("focus", open);
  el.addEventListener("mouseleave", close);
  el.addEventListener("blur", close);
  return {
    destroy: () => {
      el.removeEventListener("mouseenter", open);
      el.removeEventListener("focus", open);
      el.removeEventListener("mouseleave", close);
      el.removeEventListener("blur", close);
      panel.remove();
    },
    open,
    close
  };
}

export {
  initTooltip
};
