import { mountComponent, destroyComponent, bindComponentActions, type ComponentInit } from './controller.js';
import { initModal } from './controls/modal.js';
import { initDrawer } from './controls/drawer.js';
import { initDropdown } from './controls/dropdown.js';
import { initTabs } from './controls/tabs.js';
import { initToast } from './controls/toast.js';
import { initAccordion } from './controls/accordion.js';
import { initButton } from './controls/button.js';
import { initShell } from './controls/shell.js';
import { initPassive } from './controls/passive.js';
import { initDismissible } from './controls/dismissible.js';
import { initCollapse } from './controls/collapse.js';
import { initTooltip } from './controls/tooltip.js';
import { initPopover } from './controls/popover.js';
import { initProgress } from './controls/progress.js';
import { initPagination } from './controls/pagination.js';
import { initCommandMenu } from './controls/command-menu.js';
import { initFileUpload } from './controls/file-upload.js';
import { initCombobox } from './controls/combobox.js';
import { initCarousel } from './controls/carousel.js';
import { initLightbox } from './controls/lightbox.js';
export type { ComponentInstance } from './controller.js';
export { destroyComponent, bindComponentActions } from './controller.js';
export { showToast } from './controls/notification.js';
const inits: Record<string, ComponentInit> = {
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
  'command-menu': initCommandMenu,
  navbar: initPassive,
  sidebar: initPassive,
  shell: initShell,
  stepper: initPassive,
  wizard: initPassive,
  'file-upload': initFileUpload,
  combobox: initCombobox,
  carousel: initCarousel,
  lightbox: initLightbox,
  masonry: initPassive,
  button: initButton,
  card: initPassive,
  nav: initPassive,
  table: initPassive,
};
export function initComponent(el: HTMLElement): void {
 const init = inits[el.dataset.uif || ''];
 if (init) mountComponent(el, init);
}
export function initAll(root: Document | HTMLElement = document): () => void {
  root.querySelectorAll<HTMLElement>('[data-uif]').forEach(initComponent);
  return bindComponentActions(root);
}
export const button = { name: 'button', init: initButton, destroy: destroyComponent };
export const modal = { name: 'modal', init: initModal, destroy: destroyComponent };
export const drawer = { name: 'drawer', init: initDrawer, destroy: destroyComponent };
export const offcanvas = { name: 'offcanvas', init: initDrawer, destroy: destroyComponent };
export const dropdown = { name: 'dropdown', init: initDropdown, destroy: destroyComponent };
export const tabs = { name: 'tabs', init: initTabs, destroy: destroyComponent };
export const toast = { name: 'toast', init: initToast, destroy: destroyComponent };
export const accordion = { name: 'accordion', init: initAccordion, destroy: destroyComponent };
export const alert = { name: 'alert', init: initDismissible, destroy: destroyComponent };
export const badge = { name: 'badge', init: initPassive, destroy: destroyComponent };
export const breadcrumb = { name: 'breadcrumb', init: initPassive, destroy: destroyComponent };
export const collapseComponent = {
  name: 'collapse',
  init: initCollapse,
  destroy: destroyComponent,
};
export const tooltip = { name: 'tooltip', init: initTooltip, destroy: destroyComponent };
export const popover = { name: 'popover', init: initPopover, destroy: destroyComponent };
export const progress = { name: 'progress', init: initProgress, destroy: destroyComponent };
export const spinner = { name: 'spinner', init: initPassive, destroy: destroyComponent };
export const skeleton = { name: 'skeleton', init: initPassive, destroy: destroyComponent };
export const pagination = { name: 'pagination', init: initPagination, destroy: destroyComponent };
export const commandMenu = {
  name: 'command-menu',
  init: initCommandMenu,
  destroy: destroyComponent,
};
export const navbar = { name: 'navbar', init: initPassive, destroy: destroyComponent };
export const sidebar = { name: 'sidebar', init: initPassive, destroy: destroyComponent };
export const shell = { name: 'shell', init: initShell, destroy: destroyComponent };
export const stepper = { name: 'stepper', init: initPassive, destroy: destroyComponent };
export const wizard = { name: 'wizard', init: initPassive, destroy: destroyComponent };
export const fileUpload = { name: 'file-upload', init: initFileUpload, destroy: destroyComponent };
export const combobox = { name: 'combobox', init: initCombobox, destroy: destroyComponent };
export const carousel = { name: 'carousel', init: initCarousel, destroy: destroyComponent };
export const lightbox = { name: 'lightbox', init: initLightbox, destroy: destroyComponent };
export const masonry = { name: 'masonry', init: initPassive, destroy: destroyComponent };
export const card = { name: 'card', init: initPassive, destroy: destroyComponent };
export const nav = { name: 'nav', init: initPassive, destroy: destroyComponent };
export const table = { name: 'table', init: initPassive, destroy: destroyComponent };
