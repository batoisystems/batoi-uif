import {
  eventElement
} from "./chunk-TH7UJRFA.js";

// src/controls/combobox.ts
import { emit } from "@batoi/uif-core/runtime";
var sequence = 0;
function initCombobox(el) {
  const input = el.querySelector('input,[data-uif-role="input"]');
  const options = Array.from(el.querySelectorAll('[data-uif-role="option"]'));
  const list = el.querySelector(
    '[data-uif-role="listbox"],[role="listbox"],.component-option-list'
  ) ?? options[0]?.parentElement;
  if (!input || !list || list === el) return { destroy() {
  } };
  const id = `uif-combobox-${++sequence}`;
  let active = -1;
  const available = () => options.filter(
    (option) => !option.hidden && !option.hasAttribute("disabled") && option.getAttribute("aria-disabled") !== "true"
  );
  const highlight = (index) => {
    const visible = available();
    active = visible.length ? (index % visible.length + visible.length) % visible.length : -1;
    options.forEach(
      (option) => option.setAttribute("aria-selected", String(option === visible[active]))
    );
    if (active < 0) input.removeAttribute("aria-activedescendant");
    else input.setAttribute("aria-activedescendant", visible[active].id);
  };
  const expand = () => {
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  };
  const filter = () => {
    const query = input?.value.toLowerCase() || "";
    options.forEach((option) => {
      option.hidden = query !== "" && !option.textContent?.toLowerCase().includes(query);
    });
    expand();
    active = -1;
    input.removeAttribute("aria-activedescendant");
  };
  const select = (option) => {
    if (option.hidden || option.hasAttribute("disabled") || option.getAttribute("aria-disabled") === "true")
      return;
    if (input) input.value = option.dataset.uifValue || option.textContent?.trim() || "";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    emit("uif:select", { value: input?.value, option }, el);
    emit("uif:combobox-change", { value: input.value, option }, el);
    close();
    input.focus();
  };
  const onClick = (event) => {
    const option = eventElement(event)?.closest('[data-uif-role="option"]');
    if (option && options.includes(option)) {
      event.preventDefault();
      select(option);
    }
  };
  const onPointer = (event) => {
    const option = eventElement(event)?.closest('[data-uif-role="option"]');
    if (option && options.includes(option)) event.preventDefault();
  };
  const onKey = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      expand();
      highlight(
        active < 0 ? event.key === "ArrowDown" ? 0 : available().length - 1 : active + (event.key === "ArrowDown" ? 1 : -1)
      );
    } else if (!list.hidden && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      highlight(event.key === "Home" ? 0 : available().length - 1);
    } else if (event.key === "Enter" && !list.hidden && available()[active]) {
      event.preventDefault();
      select(available()[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") close();
  };
  const onBlur = (event) => {
    if (!(event.relatedTarget instanceof Node) || !el.contains(event.relatedTarget)) close();
  };
  if (!list.id) list.id = `${id}-list`;
  list.setAttribute("role", "listbox");
  options.forEach((option, index) => {
    if (!option.id) option.id = `${id}-option-${index}`;
    option.setAttribute("role", "option");
    option.setAttribute("tabindex", "-1");
  });
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-controls", list.id);
  input.setAttribute("aria-expanded", String(!list.hidden));
  input?.setAttribute("aria-autocomplete", "list");
  input?.addEventListener("input", filter);
  input.addEventListener("keydown", onKey);
  el.addEventListener("focusout", onBlur);
  el.addEventListener("click", onClick);
  el.addEventListener("pointerdown", onPointer);
  return {
    destroy: () => {
      input?.removeEventListener("input", filter);
      input.removeEventListener("keydown", onKey);
      el.removeEventListener("focusout", onBlur);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerdown", onPointer);
    }
  };
}

export {
  initCombobox
};
