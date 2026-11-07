import {
  eventElement,
  resolveComponentTarget,
  storageGet,
  storageSet
} from "./chunk-D73MWFXY.js";

// src/controls/shell.ts
import { emit } from "@batoi/uif-core/runtime";
function initShell(el) {
  const sidebar = el.querySelector('[data-uif-role="sidebar"]');
  const main = el.querySelector('[data-uif-role="main"],main');
  const nav = el.querySelector('[data-uif-role="nav"],nav');
  const sidebarKey = el.dataset.uifSidebarKey;
  const densityKey = el.dataset.uifDensityKey;
  const currentRoute = el.dataset.uifRoute;
  const setSidebar = (collapsed2) => {
    el.dataset.uifSidebar = collapsed2 ? "collapsed" : "expanded";
    el.classList.toggle("uif-shell-sidebar-collapsed", collapsed2);
    sidebar?.setAttribute("aria-hidden", String(collapsed2));
    el.querySelectorAll(
      '[data-uif-action="toggle"][data-uif-target], [data-uif-action="toggle-sidebar"]'
    ).forEach((trigger) => {
      if (trigger.dataset.uifTarget && resolveComponentTarget(trigger) !== el) return;
      trigger.setAttribute("aria-expanded", String(!collapsed2));
    });
    storageSet(sidebarKey, collapsed2 ? "collapsed" : "expanded");
  };
  const setDensity = (density) => {
    if (!density) return;
    el.dataset.uifDensity = density;
    el.setAttribute("data-density", density);
    storageSet(densityKey, density);
    emit("uif:shell-density", { density, el }, el);
  };
  const resolveSectionPanel = (trigger) => {
    const target = trigger.dataset.uifTarget;
    if (target) return resolveComponentTarget(trigger);
    const next = trigger.nextElementSibling;
    return next instanceof HTMLElement ? next : null;
  };
  const setSection = (trigger, expanded) => {
    const panel = resolveSectionPanel(trigger);
    trigger.setAttribute("aria-expanded", String(expanded));
    trigger.dataset.uifState = expanded ? "expanded" : "collapsed";
    if (panel) {
      panel.hidden = !expanded;
      panel.dataset.uifState = expanded ? "expanded" : "collapsed";
    }
  };
  const applyActiveRoute = () => {
    const path = window.location?.pathname || "";
    nav?.querySelectorAll("a[href]").forEach((link) => {
      const routeMatch = currentRoute && link.dataset.uifRoute === currentRoute;
      const urlMatch = !currentRoute && link.pathname === path;
      const active = Boolean(
        routeMatch || urlMatch || link.getAttribute("aria-current") === "page"
      );
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else if (link.getAttribute("aria-current") === "page") link.removeAttribute("aria-current");
    });
  };
  const setupSkipTarget = () => {
    if (!main) return;
    if (!main.id) main.id = `${el.id || "uif-shell"}-main`;
    if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
    el.querySelectorAll('[data-uif-role="skip-link"]').forEach((link) => {
      link.href = `#${main.id}`;
    });
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest("[data-uif-action]");
    if (!action || !el.contains(action)) return;
    if (action.dataset.uifAction === "toggle-section") {
      event.preventDefault();
      setSection(action, action.getAttribute("aria-expanded") !== "true");
    }
    if (action.dataset.uifAction === "toggle-sidebar" || action.dataset.uifAction === "toggle" && resolveComponentTarget(action) === el) {
      event.preventDefault();
      event.stopPropagation();
      setSidebar(el.dataset.uifSidebar !== "collapsed");
    }
    if (action.dataset.uifDensity) {
      event.preventDefault();
      setDensity(action.dataset.uifDensity);
    }
  };
  const onKey = (event) => {
    if (!nav?.contains(event.target)) return;
    const items = Array.from(
      nav.querySelectorAll("a[href],button:not([disabled])")
    ).filter((item) => !item.hidden && !item.closest("[hidden]"));
    const index = items.indexOf(event.target);
    if (index < 0 || items.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };
  const storedSidebar = storageGet(sidebarKey);
  const collapsed = storedSidebar ? storedSidebar === "collapsed" : el.dataset.uifSidebar === "collapsed";
  setSidebar(collapsed);
  setDensity(
    storageGet(densityKey) || el.dataset.uifDensity || el.getAttribute("data-density") || "comfortable"
  );
  el.querySelectorAll('[data-uif-action="toggle-section"]').forEach((trigger) => {
    setSection(
      trigger,
      trigger.dataset.uifState === "expanded" || trigger.getAttribute("aria-expanded") === "true"
    );
  });
  applyActiveRoute();
  setupSkipTarget();
  nav?.setAttribute("role", nav.getAttribute("role") || "navigation");
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", onKey);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
    },
    open: () => setSidebar(false),
    close: () => setSidebar(true),
    toggle: () => setSidebar(el.dataset.uifSidebar !== "collapsed"),
    "toggle-sidebar": () => setSidebar(el.dataset.uifSidebar !== "collapsed")
  };
}

export {
  initShell
};
