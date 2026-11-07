// src/controls/pagination.ts
function initPagination(el) {
  el.setAttribute("role", "navigation");
  el.querySelectorAll("[data-uif-page]").forEach((item) => {
    const active = item.dataset.uifState === "active" || item.getAttribute("aria-current") === "page";
    item.setAttribute("aria-current", active ? "page" : "false");
  });
  return { destroy: () => void 0 };
}

export {
  initPagination
};
