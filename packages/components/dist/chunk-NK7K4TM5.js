import {
  eventElement,
  focusableSelector
} from "./chunk-TH7UJRFA.js";

// src/controls/lightbox.ts
import { emit } from "@batoi/uif-core/runtime";
import { closeOverlay, openOverlay } from "@batoi/uif-overlays";
function initLightbox(el) {
  const items = Array.from(el.querySelectorAll('[data-uif-role="item"]'));
  const dialog = el.querySelector('[data-uif-role="dialog"]');
  const image = el.querySelector('[data-uif-role="image"]');
  const caption = el.querySelector('[data-uif-role="caption"]');
  let index = 0;
  const render = () => {
    const item = items[index];
    const src = item?.dataset.uifSrc || item?.getAttribute("href") || item?.querySelector("img")?.src || "";
    if (image) {
      image.src = src;
      image.alt = item?.dataset.uifAlt || item?.querySelector("img")?.alt || "";
    }
    if (caption)
      caption.textContent = item?.dataset.uifCaption || item?.getAttribute("aria-label") || "";
  };
  const open = (nextIndex = index) => {
    if (!dialog || !items.length) return;
    index = Math.max(0, Math.min(items.length - 1, nextIndex));
    render();
    void openOverlay(dialog, { modal: true, restoreFocus: true, closeOnEscape: true });
    dialog.dataset.uifState = "open";
    dialog.querySelector(focusableSelector)?.focus();
    emit("uif:lightbox-open", { index, el }, el);
  };
  const close = () => {
    if (!dialog) return;
    void closeOverlay(dialog);
    dialog.dataset.uifState = "closed";
  };
  const next = () => {
    index = (index + 1) % items.length;
    render();
  };
  const previous = () => {
    index = (index - 1 + items.length) % items.length;
    render();
  };
  const onClick = (event) => {
    const target = eventElement(event);
    const item = target?.closest('[data-uif-role="item"]');
    if (item && el.contains(item)) {
      event.preventDefault();
      open(items.indexOf(item));
    }
    const action = target?.closest("[data-uif-action]");
    if (action) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (action?.dataset.uifAction === "close") close();
    if (action?.dataset.uifAction === "next") next();
    if (action?.dataset.uifAction === "previous") previous();
  };
  const onKey = (event) => {
    if (dialog?.dataset.uifState !== "open") return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") previous();
  };
  dialog?.setAttribute("role", dialog.getAttribute("role") || "dialog");
  dialog?.setAttribute("aria-modal", "true");
  dialog?.setAttribute("hidden", "");
  if (dialog && !dialog.dataset.uifState) dialog.dataset.uifState = "closed";
  el.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  return {
    destroy: () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    },
    open: () => open(),
    close,
    next,
    previous
  };
}

export {
  initLightbox
};
