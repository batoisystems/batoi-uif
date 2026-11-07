import {
  eventElement
} from "./chunk-TH7UJRFA.js";

// src/controls/dropdown.ts
import { hide, show } from "@batoi/uif-effects";
import { positionOverlay } from "@batoi/uif-overlays";
function initDropdown(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  let search = "";
  let searchTimer;
  const menuItems = () => Array.from(
    panel?.querySelectorAll(
      '[data-uif-role="item"], [role="menuitem"], button, a[href]'
    ) ?? []
  ).filter(
    (item) => item.dataset.uifRole !== "separator" && item.getAttribute("role") !== "separator"
  );
  const enabledItems = () => menuItems().filter(
    (item) => !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true"
  );
  const focusItem = (index) => {
    const items = enabledItems();
    if (!items.length) return;
    items[(index + items.length) % items.length]?.focus();
  };
  const typeahead = (key) => {
    const items = enabledItems();
    if (!items.length) return;
    window.clearTimeout(searchTimer);
    search += key.toLowerCase();
    searchTimer = window.setTimeout(() => {
      search = "";
    }, 700);
    const current = items.indexOf(document.activeElement);
    const ordered = items.slice(Math.max(0, current + 1)).concat(items.slice(0, Math.max(0, current + 1)));
    const match = ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(search));
    match?.focus();
  };
  const open = () => {
    if (trigger && panel) positionOverlay(trigger, panel);
    if (panel) void show(panel);
    trigger?.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    if (panel) void hide(panel);
    trigger?.setAttribute("aria-expanded", "false");
  };
  const toggle = () => panel?.hasAttribute("hidden") ? open() : close();
  const onDoc = (event) => {
    const target = eventElement(event);
    if (target && !el.contains(target)) close();
  };
  const onKey = (event) => {
    if (!el.contains(event.target)) return;
    const items = enabledItems();
    const current = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      if (trigger?.getAttribute("aria-expanded") !== "true") return;
      event.preventDefault();
      close();
      trigger?.focus();
    }
    if (event.key === "Tab") close();
    if (event.target === trigger && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggle();
    }
    if (event.target === trigger && event.key === "ArrowDown") {
      event.preventDefault();
      open();
      focusItem(0);
    }
    if (event.target === trigger && event.key === "ArrowUp") {
      event.preventDefault();
      open();
      focusItem(items.length - 1);
    }
    if (!panel?.contains(event.target)) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    }
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      typeahead(event.key);
    }
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest(
      '[data-uif-role], [role="menuitem"], button, a[href]'
    );
    const role = action?.dataset.uifRole || action?.getAttribute("role");
    if (role === "trigger") toggle();
    if ((role === "item" || role === "menuitem") && !action?.hasAttribute("disabled") && action?.getAttribute("aria-disabled") !== "true")
      close();
  };
  trigger?.setAttribute("aria-haspopup", "menu");
  trigger?.setAttribute("aria-expanded", "false");
  panel?.setAttribute("role", "menu");
  panel?.setAttribute("hidden", "");
  panel?.querySelectorAll('[data-uif-role="separator"]').forEach((separator) => {
    separator.setAttribute("role", "separator");
  });
  menuItems().forEach((item) => {
    item.setAttribute("role", item.getAttribute("role") || "menuitem");
    if (!item.hasAttribute("tabindex")) item.tabIndex = -1;
    if (item.hasAttribute("disabled")) item.setAttribute("aria-disabled", "true");
  });
  el.addEventListener("click", onClick);
  document.addEventListener("click", onDoc);
  document.addEventListener("keydown", onKey);
  return {
    destroy: () => {
      window.clearTimeout(searchTimer);
      el.removeEventListener("click", onClick);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    },
    open,
    close,
    toggle
  };
}

export {
  initDropdown
};
