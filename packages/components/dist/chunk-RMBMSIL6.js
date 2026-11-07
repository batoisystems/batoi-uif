// src/controls/accordion.ts
import { collapse, expand } from "@batoi/uif-effects";
var sequence = 0;
function initAccordion(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  if (panel && !panel.id) panel.id = `${el.id || `uif-accordion-${++sequence}`}-panel`;
  const setExpanded = (expanded) => {
    el.dataset.uifState = expanded ? "expanded" : "collapsed";
    trigger?.setAttribute("aria-expanded", String(expanded));
    if (panel) void (expanded ? expand(panel) : collapse(panel));
  };
  const toggle = () => setExpanded(trigger?.getAttribute("aria-expanded") !== "true");
  const onKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };
  trigger?.setAttribute("aria-controls", panel?.id || "");
  trigger?.addEventListener("keydown", onKey);
  trigger?.addEventListener("click", toggle);
  setExpanded(el.dataset.uifState === "expanded");
  return {
    destroy: () => {
      trigger?.removeEventListener("keydown", onKey);
      trigger?.removeEventListener("click", toggle);
    },
    toggle
  };
}

export {
  initAccordion
};
