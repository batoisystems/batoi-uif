// src/index.ts
import { emit } from "@batoi/uif-core";
import { collapse, expand, hide, show } from "@batoi/uif-effects";
import { closeOverlay, openOverlay, positionOverlay, toggleOverlay } from "@batoi/uif-overlays";
var instances = /* @__PURE__ */ new WeakMap();
var actionBindings = /* @__PURE__ */ new WeakMap();
var focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function setState(el, open) {
  el.dataset.uifState = open ? "open" : "closed";
  el.toggleAttribute("hidden", !open);
  emit(open ? "uif:open" : "uif:close", { component: el.dataset.uif, el }, el);
}
function resolveComponentTarget(source) {
  const expr = source.dataset.uifTarget;
  if (!expr) return source.closest("[data-uif]");
  if (expr === "self") return source;
  if (expr === "parent") return source.parentElement;
  if (expr.startsWith("closest:")) return source.closest(expr.slice(8));
  return document.querySelector(expr);
}
function eventElement(event) {
  return event.target instanceof HTMLElement ? event.target : null;
}
function storageGet(key) {
  if (!key) return null;
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function storageSet(key, value) {
  if (!key) return;
  try {
    window.localStorage?.setItem(key, value);
  } catch {
  }
}
function initModal(el) {
  const mode = el.dataset.uifMode ?? "dismissible";
  const backdrop = el.dataset.uifBackdrop ?? "true";
  const closeOnEscape = mode !== "locked" && backdrop !== "static" && el.dataset.uifKeyboard !== "false";
  const dialog = el.dataset.uifRole === "dialog" ? el : el.querySelector('[data-uif-role="dialog"]') || el;
  const open = () => {
    void openOverlay(el, { modal: true, restoreFocus: true, closeOnEscape });
    setState(el, true);
    document.body.classList.add("uif-modal-open");
    dialog.querySelector(focusableSelector)?.focus();
  };
  const close = () => {
    if (mode === "locked") return;
    void closeOverlay(el);
    setState(el, false);
    document.body.classList.remove("uif-modal-open");
  };
  const toggle = () => el.dataset.uifState === "open" ? close() : open();
  const onKey = (event) => {
    if (event.key === "Escape" && closeOnEscape) close();
    if (event.key !== "Tab" || el.dataset.uifState !== "open") return;
    const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const onClick = (event) => {
    const target = eventElement(event);
    const action = target?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
    if (target?.dataset.uifRole === "backdrop" && backdrop !== "static") close();
  };
  dialog.setAttribute("role", dialog.getAttribute("role") || "dialog");
  dialog.setAttribute("aria-modal", "true");
  if (!el.dataset.uifState) setState(el, false);
  document.addEventListener("keydown", onKey);
  el.addEventListener("click", onClick);
  return {
    destroy: () => {
      document.removeEventListener("keydown", onKey);
      el.removeEventListener("click", onClick);
    },
    open,
    close,
    toggle
  };
}
function initDrawer(el) {
  el.setAttribute("role", el.getAttribute("role") || "dialog");
  el.dataset.uifMode = el.dataset.uifMode ?? "left";
  if (!el.dataset.uifState) setState(el, false);
  return {
    destroy: () => void 0,
    open: () => {
      void openOverlay(el, { modal: true, restoreFocus: true });
      setState(el, true);
    },
    close: () => {
      void closeOverlay(el);
      setState(el, false);
    },
    toggle: () => {
      void toggleOverlay(el, { modal: true, restoreFocus: true });
      setState(el, el.dataset.uifState !== "open");
    }
  };
}
function initDropdown(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  let search = "";
  let searchTimer;
  const menuItems = () => Array.from(panel?.querySelectorAll('[data-uif-role="item"], [role="menuitem"], button, a[href]') ?? []).filter(
    (item) => item.dataset.uifRole !== "separator" && item.getAttribute("role") !== "separator"
  );
  const enabledItems = () => menuItems().filter((item) => !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true");
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
    const items = enabledItems();
    const current = items.indexOf(document.activeElement);
    if (event.key === "Escape") {
      close();
      trigger?.focus();
    }
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
    const action = eventElement(event)?.closest('[data-uif-role], [role="menuitem"], button, a[href]');
    const role = action?.dataset.uifRole || action?.getAttribute("role");
    if (role === "trigger") toggle();
    if ((role === "item" || role === "menuitem") && !action?.hasAttribute("disabled") && action?.getAttribute("aria-disabled") !== "true") close();
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
function initTabs(el) {
  const tabs2 = Array.from(el.querySelectorAll('[data-uif-role="tab"]'));
  const panels = Array.from(el.querySelectorAll('[data-uif-role="tabpanel"]'));
  const manual = el.dataset.uifActivation === "manual";
  const vertical = el.dataset.uifOrientation === "vertical";
  let selectedIndex = 0;
  let focusedIndex = 0;
  const sync = () => {
    tabs2.forEach((tab, i) => {
      const panel = panels[i];
      if (panel && !panel.id) panel.id = `${el.id || "uif-tabs"}-panel-${i}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(i === selectedIndex));
      tab.setAttribute("tabindex", i === focusedIndex ? "0" : "-1");
      if (panel) tab.setAttribute("aria-controls", panel.id);
    });
    panels.forEach((panel, i) => {
      panel.setAttribute("role", "tabpanel");
      panel.hidden = i !== selectedIndex;
    });
  };
  const activate = (idx) => {
    selectedIndex = (idx + tabs2.length) % tabs2.length;
    focusedIndex = selectedIndex;
    sync();
    tabs2[focusedIndex]?.focus();
  };
  const focusTab = (idx) => {
    focusedIndex = (idx + tabs2.length) % tabs2.length;
    if (!manual) selectedIndex = focusedIndex;
    sync();
    tabs2[focusedIndex]?.focus();
  };
  const onClick = (event) => {
    const tab = eventElement(event)?.closest('[data-uif-role="tab"]');
    if (tab) activate(tabs2.indexOf(tab));
  };
  const onKey = (event) => {
    const idx = tabs2.indexOf(event.target);
    if (idx < 0 || tabs2.length === 0) return;
    if (event.key === "ArrowRight" || vertical && event.key === "ArrowDown") {
      event.preventDefault();
      focusTab(idx + 1);
    }
    if (event.key === "ArrowLeft" || vertical && event.key === "ArrowUp") {
      event.preventDefault();
      focusTab(idx - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs2.length - 1);
    }
    if (manual && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      activate(idx);
    }
  };
  el.setAttribute("role", "tablist");
  if (vertical) el.setAttribute("aria-orientation", "vertical");
  if (!tabs2.length) {
    return {
      destroy: () => void 0
    };
  }
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", onKey);
  activate(0);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
    }
  };
}
function initToast(el) {
  el.setAttribute("role", el.dataset.uifType === "danger" ? "alert" : "status");
  if (!el.dataset.uifState) setState(el, true);
  const dispose = setupToast(el, {
    duration: Number(el.dataset.uifDuration) || void 0,
    dismissible: el.dataset.uifDismissible !== "false"
  });
  return {
    destroy: dispose,
    close: () => {
      dispose();
      el.remove();
    }
  };
}
function initAccordion(el) {
  const trigger = el.querySelector('[data-uif-role="trigger"]');
  const panel = el.querySelector('[data-uif-role="panel"]');
  if (panel && !panel.id) panel.id = `${el.id || "uif-accordion"}-panel`;
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
function initButton(el) {
  el.addEventListener("click", handleAction);
  return { destroy: () => el.removeEventListener("click", handleAction) };
}
function initShell(el) {
  const sidebar2 = el.querySelector('[data-uif-role="sidebar"]');
  const main = el.querySelector('[data-uif-role="main"],main');
  const nav2 = el.querySelector('[data-uif-role="nav"],nav');
  const sidebarKey = el.dataset.uifSidebarKey;
  const densityKey = el.dataset.uifDensityKey;
  const currentRoute = el.dataset.uifRoute;
  const setSidebar = (collapsed2) => {
    el.dataset.uifSidebar = collapsed2 ? "collapsed" : "expanded";
    el.classList.toggle("uif-shell-sidebar-collapsed", collapsed2);
    sidebar2?.setAttribute("aria-hidden", String(collapsed2));
    el.querySelectorAll('[data-uif-action="toggle"][data-uif-target], [data-uif-action="toggle-sidebar"]').forEach((trigger) => {
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
    nav2?.querySelectorAll("a[href]").forEach((link) => {
      const routeMatch = currentRoute && link.dataset.uifRoute === currentRoute;
      const urlMatch = !currentRoute && link.pathname === path;
      const active = Boolean(routeMatch || urlMatch || link.getAttribute("aria-current") === "page");
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
    if (action.dataset.uifDensity) {
      event.preventDefault();
      setDensity(action.dataset.uifDensity);
    }
  };
  const onKey = (event) => {
    if (!nav2?.contains(event.target)) return;
    const items = Array.from(nav2.querySelectorAll("a[href],button:not([disabled])")).filter((item) => !item.hidden && !item.closest("[hidden]"));
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
  setDensity(storageGet(densityKey) || el.dataset.uifDensity || el.getAttribute("data-density") || "comfortable");
  el.querySelectorAll('[data-uif-action="toggle-section"]').forEach((trigger) => {
    setSection(trigger, trigger.dataset.uifState === "expanded" || trigger.getAttribute("aria-expanded") === "true");
  });
  applyActiveRoute();
  setupSkipTarget();
  nav2?.setAttribute("role", nav2.getAttribute("role") || "navigation");
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
function initPassive(el) {
  if (el.dataset.uif === "table") el.setAttribute("role", el.getAttribute("role") || "table");
  if (el.dataset.uif === "nav") el.setAttribute("role", el.getAttribute("role") || "navigation");
  return { destroy: () => void 0 };
}
function initDismissible(el) {
  const close = () => {
    void hide(el);
    el.dataset.uifState = "closed";
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
  };
  el.addEventListener("click", onClick);
  return { destroy: () => el.removeEventListener("click", onClick), close };
}
function initCollapse(el) {
  if (!el.dataset.uifState) el.dataset.uifState = el.hidden ? "collapsed" : "expanded";
  const toggle = () => {
    const expanded = el.dataset.uifState !== "expanded";
    el.dataset.uifState = expanded ? "expanded" : "collapsed";
    void (expanded ? expand(el) : collapse(el));
  };
  return { destroy: () => void 0, toggle };
}
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
function initProgress(el) {
  const value = Number(el.dataset.uifValue || el.getAttribute("aria-valuenow") || 0);
  const max = Number(el.dataset.uifMax || el.getAttribute("aria-valuemax") || 100);
  el.setAttribute("role", "progressbar");
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", String(max));
  el.setAttribute("aria-valuenow", String(value));
  el.style.setProperty("--uif-progress", `${Math.max(0, Math.min(100, value / max * 100))}%`);
  return { destroy: () => void 0 };
}
function initPagination(el) {
  el.setAttribute("role", "navigation");
  el.querySelectorAll("[data-uif-page]").forEach((item) => {
    const active = item.dataset.uifState === "active" || item.getAttribute("aria-current") === "page";
    item.setAttribute("aria-current", active ? "page" : "false");
  });
  return { destroy: () => void 0 };
}
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
function initFileUpload(el) {
  const input = el.querySelector('input[type="file"]');
  const label = el.querySelector('[data-uif-role="file-list"]');
  const update = () => {
    if (!label || !input) return;
    label.textContent = Array.from(input.files || []).map((file) => file.name).join(", ");
  };
  input?.addEventListener("change", update);
  return { destroy: () => input?.removeEventListener("change", update) };
}
function initCombobox(el) {
  const input = el.querySelector('input,[data-uif-role="input"]');
  const options = Array.from(el.querySelectorAll('[data-uif-role="option"]'));
  const filter = () => {
    const query = input?.value.toLowerCase() || "";
    options.forEach((option) => {
      option.hidden = query !== "" && !option.textContent?.toLowerCase().includes(query);
    });
  };
  const select = (option) => {
    if (input) input.value = option.dataset.uifValue || option.textContent?.trim() || "";
    emit("uif:select", { value: input?.value, option }, el);
  };
  const onClick = (event) => {
    const option = eventElement(event)?.closest('[data-uif-role="option"]');
    if (option) select(option);
  };
  el.setAttribute("role", "combobox");
  input?.setAttribute("aria-autocomplete", "list");
  input?.addEventListener("input", filter);
  el.addEventListener("click", onClick);
  return {
    destroy: () => {
      input?.removeEventListener("input", filter);
      el.removeEventListener("click", onClick);
    }
  };
}
function handleAction(event) {
  const actionEl = eventElement(event)?.closest("[data-uif-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.uifAction;
  if (action === "toast") {
    showToast(actionEl.dataset.uifMessage || actionEl.textContent?.trim() || "Notification", {
      type: actionEl.dataset.uifType || "info",
      duration: Number(actionEl.dataset.uifDuration) || void 0,
      placement: actionEl.dataset.uifPlacement,
      dismissible: actionEl.dataset.uifDismissible !== "false"
    });
    return;
  }
  const target = resolveComponentTarget(actionEl);
  const instance = target ? instances.get(target) : null;
  const command = action && instance ? instance[action] : void 0;
  if (typeof command === "function") {
    event.preventDefault();
    command.call(instance);
  }
}
var inits = {
  modal: initModal,
  drawer: initDrawer,
  offcanvas: initDrawer,
  dropdown: initDropdown,
  tabs: initTabs,
  toast: initToast,
  accordion: initAccordion,
  alert: initDismissible,
  badge: initPassive,
  breadcrumb: initPassive,
  collapse: initCollapse,
  tooltip: initTooltip,
  popover: initPopover,
  progress: initProgress,
  spinner: initPassive,
  skeleton: initPassive,
  pagination: initPagination,
  "command-menu": initCommandMenu,
  navbar: initPassive,
  sidebar: initPassive,
  shell: initShell,
  stepper: initPassive,
  wizard: initPassive,
  "file-upload": initFileUpload,
  combobox: initCombobox,
  button: initButton,
  card: initPassive,
  nav: initPassive,
  table: initPassive
};
function initComponent(el) {
  if (instances.has(el)) return;
  const name = el.dataset.uif;
  if (!name || !inits[name]) return;
  instances.set(el, inits[name](el));
  emit("uif:init", { component: name, el }, el);
}
function destroyComponent(el) {
  instances.get(el)?.destroy();
  instances.delete(el);
  emit("uif:destroy", { el }, el);
}
function initAll(root = document) {
  root.querySelectorAll("[data-uif]").forEach(initComponent);
  const existing = actionBindings.get(root);
  if (existing) return existing;
  root.addEventListener("click", handleAction);
  const dispose = () => {
    root.removeEventListener("click", handleAction);
    actionBindings.delete(root);
  };
  actionBindings.set(root, dispose);
  return dispose;
}
function getToastContainer(placement = "bottom-end") {
  const normalized = placement || "bottom-end";
  const existing = document.querySelector(`.uif-toast-stack[data-uif-placement="${normalized}"]`);
  if (existing) return existing;
  const container = document.createElement("div");
  container.className = `uif-toast-stack uif-toast-stack-${normalized}`;
  container.dataset.uifPlacement = normalized;
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "false");
  document.body.appendChild(container);
  return container;
}
function setupToast(toastEl, options = {}) {
  let timer;
  let startedAt = 0;
  let remaining = options.duration ?? 3e3;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const clear = () => {
    window.clearTimeout(timer);
    timer = void 0;
  };
  const close = () => {
    clear();
    toastEl.dataset.uifState = "closed";
    toastEl.remove();
  };
  const schedule = (delay = remaining) => {
    clear();
    if (delay <= 0) return;
    startedAt = Date.now();
    timer = window.setTimeout(close, reduce ? 0 : delay);
  };
  const pause = () => {
    if (!timer) return;
    remaining = Math.max(0, remaining - (Date.now() - startedAt));
    clear();
  };
  const resume = () => {
    if (toastEl.isConnected) schedule();
  };
  const onClick = (event) => {
    const action = eventElement(event)?.closest("[data-uif-action]");
    if (action?.dataset.uifAction === "close") close();
  };
  toastEl.addEventListener("mouseenter", pause);
  toastEl.addEventListener("mouseleave", resume);
  toastEl.addEventListener("focusin", pause);
  toastEl.addEventListener("focusout", resume);
  toastEl.addEventListener("click", onClick);
  schedule();
  return () => {
    clear();
    toastEl.removeEventListener("mouseenter", pause);
    toastEl.removeEventListener("mouseleave", resume);
    toastEl.removeEventListener("focusin", pause);
    toastEl.removeEventListener("focusout", resume);
    toastEl.removeEventListener("click", onClick);
  };
}
function showToast(message, options = {}) {
  const toastEl = document.createElement("div");
  toastEl.dataset.uif = "toast";
  toastEl.dataset.uifState = "open";
  toastEl.dataset.uifType = options.type ?? "info";
  const messageEl = document.createElement("span");
  messageEl.className = "uif-toast-message";
  messageEl.textContent = message;
  toastEl.append(messageEl);
  if (options.dismissible !== false) {
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "uif-toast-close";
    closeButton.dataset.uifAction = "close";
    closeButton.setAttribute("aria-label", "Close notification");
    closeButton.textContent = "x";
    toastEl.append(closeButton);
  }
  toastEl.setAttribute("role", options.type === "danger" ? "alert" : "status");
  toastEl.className = `uif-toast uif-toast-${options.type ?? "info"}`;
  getToastContainer(options.placement).appendChild(toastEl);
  emit("uif:toast", { message, options, el: toastEl }, toastEl);
  setupToast(toastEl, options);
  return toastEl;
}
var button = { name: "button", init: initButton, destroy: destroyComponent };
var modal = { name: "modal", init: initModal, destroy: destroyComponent };
var drawer = { name: "drawer", init: initDrawer, destroy: destroyComponent };
var offcanvas = { name: "offcanvas", init: initDrawer, destroy: destroyComponent };
var dropdown = { name: "dropdown", init: initDropdown, destroy: destroyComponent };
var tabs = { name: "tabs", init: initTabs, destroy: destroyComponent };
var toast = { name: "toast", init: initToast, destroy: destroyComponent };
var accordion = { name: "accordion", init: initAccordion, destroy: destroyComponent };
var alert = { name: "alert", init: initDismissible, destroy: destroyComponent };
var badge = { name: "badge", init: initPassive, destroy: destroyComponent };
var breadcrumb = { name: "breadcrumb", init: initPassive, destroy: destroyComponent };
var collapseComponent = { name: "collapse", init: initCollapse, destroy: destroyComponent };
var tooltip = { name: "tooltip", init: initTooltip, destroy: destroyComponent };
var popover = { name: "popover", init: initPopover, destroy: destroyComponent };
var progress = { name: "progress", init: initProgress, destroy: destroyComponent };
var spinner = { name: "spinner", init: initPassive, destroy: destroyComponent };
var skeleton = { name: "skeleton", init: initPassive, destroy: destroyComponent };
var pagination = { name: "pagination", init: initPagination, destroy: destroyComponent };
var commandMenu = { name: "command-menu", init: initCommandMenu, destroy: destroyComponent };
var navbar = { name: "navbar", init: initPassive, destroy: destroyComponent };
var sidebar = { name: "sidebar", init: initPassive, destroy: destroyComponent };
var shell = { name: "shell", init: initShell, destroy: destroyComponent };
var stepper = { name: "stepper", init: initPassive, destroy: destroyComponent };
var wizard = { name: "wizard", init: initPassive, destroy: destroyComponent };
var fileUpload = { name: "file-upload", init: initFileUpload, destroy: destroyComponent };
var combobox = { name: "combobox", init: initCombobox, destroy: destroyComponent };
var card = { name: "card", init: initPassive, destroy: destroyComponent };
var nav = { name: "nav", init: initPassive, destroy: destroyComponent };
var table = { name: "table", init: initPassive, destroy: destroyComponent };
export {
  accordion,
  alert,
  badge,
  breadcrumb,
  button,
  card,
  collapseComponent,
  combobox,
  commandMenu,
  destroyComponent,
  drawer,
  dropdown,
  fileUpload,
  initAll,
  initComponent,
  modal,
  nav,
  navbar,
  offcanvas,
  pagination,
  popover,
  progress,
  shell,
  showToast,
  sidebar,
  skeleton,
  spinner,
  stepper,
  table,
  tabs,
  toast,
  tooltip,
  wizard
};
