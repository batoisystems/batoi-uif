// src/controls/command-menu.ts
function initCommandMenu(el) {
  const input = el.querySelector('[data-uif-role="search"]');
  const items = Array.from(el.querySelectorAll('[data-uif-role="item"]'));
  let active = 0;
  const activate = (idx) => {
    active = (idx + items.length) % Math.max(1, items.length);
    items.forEach((item, i) => {
      item.tabIndex = i === active ? 0 : -1;
      item.dataset.uifState = i === active ? "active" : "inactive";
    });
    items[active]?.focus();
  };
  const filter = () => {
    const query = input?.value.trim().toLowerCase() || "";
    items.forEach((item) => {
      item.hidden = query !== "" && !item.textContent?.toLowerCase().includes(query);
    });
  };
  const onKey = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activate(active + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activate(active - 1);
    }
    if (event.key === "Home") activate(0);
    if (event.key === "End") activate(items.length - 1);
  };
  el.setAttribute("role", "menu");
  input?.addEventListener("input", filter);
  el.addEventListener("keydown", onKey);
  if (items.length) activate(0);
  return {
    destroy: () => {
      input?.removeEventListener("input", filter);
      el.removeEventListener("keydown", onKey);
    }
  };
}

export {
  initCommandMenu
};
