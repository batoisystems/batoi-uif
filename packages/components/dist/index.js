import {
  initPagination
} from "./chunk-LXF454GS.js";
import {
  initPassive
} from "./chunk-TBWVFSM3.js";
import {
  initPopover
} from "./chunk-XUMRQ6D2.js";
import {
  initProgress
} from "./chunk-KBK7OTXB.js";
import {
  initShell
} from "./chunk-ZYDTOA63.js";
import {
  initTabs
} from "./chunk-FR5ALJFM.js";
import {
  initToast
} from "./chunk-MBHEXO5E.js";
import {
  initTooltip
} from "./chunk-NG2ZQ6DO.js";
import {
  initCommandMenu
} from "./chunk-WONA23WR.js";
import {
  initDismissible
} from "./chunk-T5636VFB.js";
import {
  initDrawer
} from "./chunk-5QJ7RRAM.js";
import {
  initDropdown
} from "./chunk-E76FIXYV.js";
import {
  initFileUpload
} from "./chunk-E4ANJ4HQ.js";
import {
  initLightbox
} from "./chunk-MCXUZISL.js";
import {
  initModal
} from "./chunk-YSTHHXJI.js";
import {
  initAccordion
} from "./chunk-RMBMSIL6.js";
import {
  initButton
} from "./chunk-5DX5SUYI.js";
import {
  bindComponentActions,
  destroyComponent,
  mountComponent
} from "./chunk-KE65AGYK.js";
import {
  showToast
} from "./chunk-KT6YEKUB.js";
import {
  initCarousel
} from "./chunk-JMU36AO7.js";
import {
  initCollapse
} from "./chunk-L5D2MLK3.js";
import {
  initCombobox
} from "./chunk-JNKLW4EC.js";
import "./chunk-D73MWFXY.js";

// src/index.ts
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
  carousel: initCarousel,
  lightbox: initLightbox,
  masonry: initPassive,
  button: initButton,
  card: initPassive,
  nav: initPassive,
  table: initPassive
};
function initComponent(el) {
  const init = inits[el.dataset.uif || ""];
  if (init) mountComponent(el, init);
}
function initAll(root = document) {
  root.querySelectorAll("[data-uif]").forEach(initComponent);
  return bindComponentActions(root);
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
var collapseComponent = {
  name: "collapse",
  init: initCollapse,
  destroy: destroyComponent
};
var tooltip = { name: "tooltip", init: initTooltip, destroy: destroyComponent };
var popover = { name: "popover", init: initPopover, destroy: destroyComponent };
var progress = { name: "progress", init: initProgress, destroy: destroyComponent };
var spinner = { name: "spinner", init: initPassive, destroy: destroyComponent };
var skeleton = { name: "skeleton", init: initPassive, destroy: destroyComponent };
var pagination = { name: "pagination", init: initPagination, destroy: destroyComponent };
var commandMenu = {
  name: "command-menu",
  init: initCommandMenu,
  destroy: destroyComponent
};
var navbar = { name: "navbar", init: initPassive, destroy: destroyComponent };
var sidebar = { name: "sidebar", init: initPassive, destroy: destroyComponent };
var shell = { name: "shell", init: initShell, destroy: destroyComponent };
var stepper = { name: "stepper", init: initPassive, destroy: destroyComponent };
var wizard = { name: "wizard", init: initPassive, destroy: destroyComponent };
var fileUpload = { name: "file-upload", init: initFileUpload, destroy: destroyComponent };
var combobox = { name: "combobox", init: initCombobox, destroy: destroyComponent };
var carousel = { name: "carousel", init: initCarousel, destroy: destroyComponent };
var lightbox = { name: "lightbox", init: initLightbox, destroy: destroyComponent };
var masonry = { name: "masonry", init: initPassive, destroy: destroyComponent };
var card = { name: "card", init: initPassive, destroy: destroyComponent };
var nav = { name: "nav", init: initPassive, destroy: destroyComponent };
var table = { name: "table", init: initPassive, destroy: destroyComponent };
export {
  accordion,
  alert,
  badge,
  bindComponentActions,
  breadcrumb,
  button,
  card,
  carousel,
  collapseComponent,
  combobox,
  commandMenu,
  destroyComponent,
  drawer,
  dropdown,
  fileUpload,
  initAll,
  initComponent,
  lightbox,
  masonry,
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
