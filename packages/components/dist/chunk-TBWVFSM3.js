// src/controls/passive.ts
function initPassive(el) {
  if (el.dataset.uif === "table") el.setAttribute("role", el.getAttribute("role") || "table");
  if (el.dataset.uif === "nav") el.setAttribute("role", el.getAttribute("role") || "navigation");
  return { destroy: () => void 0 };
}

export {
  initPassive
};
