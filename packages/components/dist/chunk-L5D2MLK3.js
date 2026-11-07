// src/controls/collapse.ts
import { collapse, expand } from "@batoi/uif-effects";
function initCollapse(el) {
  if (!el.dataset.uifState) el.dataset.uifState = el.hidden ? "collapsed" : "expanded";
  const toggle = () => {
    const expanded = el.dataset.uifState !== "expanded";
    el.dataset.uifState = expanded ? "expanded" : "collapsed";
    void (expanded ? expand(el) : collapse(el));
  };
  return { destroy: () => void 0, toggle };
}

export {
  initCollapse
};
