// ../core/dist/index.js
function emit(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

// src/index.ts
import { swapTrustedHTML } from "@batoi/uif-dom";
import { request } from "@batoi/uif-net";
var ruleHandlers = {
  required: (value) => value.trim().length > 0,
  email: (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  number: (value) => value === "" || !Number.isNaN(Number(value)),
  integer: (value) => value === "" || /^-?\d+$/.test(value),
  min: (value, arg) => value === "" || Number(value) >= Number(arg),
  max: (value, arg) => value === "" || Number(value) <= Number(arg),
  minLength: (value, arg) => value.length >= Number(arg),
  maxLength: (value, arg) => value.length <= Number(arg),
  pattern: (value, arg) => {
    try {
      return new RegExp(arg ?? "").test(value);
    } catch {
      return false;
    }
  },
  sameAs: (value, arg, form2) => {
    const other = arg ? form2.elements.namedItem(arg) : null;
    return other instanceof HTMLInputElement || other instanceof HTMLTextAreaElement ? value === other.value : false;
  }
};
var asyncRuleHandlers = /* @__PURE__ */ new Map();
var initializedForms = /* @__PURE__ */ new WeakSet();
var initializedRepeatables = /* @__PURE__ */ new WeakSet();
function registerAsyncRule(name, handler) {
  asyncRuleHandlers.set(name, handler);
}
function fieldName(fieldEl) {
  return fieldEl.name || fieldEl.id || "field";
}
function cssEscape(value) {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(value) : value.replace(/["\\#.;,[\]=:]/g, "\\$&");
}
function resolveFormTarget(formEl) {
  const expr = formEl.dataset.uifTarget;
  if (!expr) return null;
  if (expr === "self") return formEl;
  if (expr === "parent") return formEl.parentElement;
  if (expr.startsWith("closest:")) return formEl.closest(expr.slice(8));
  return document.querySelector(expr);
}
function swap(target, html, mode = "inner") {
  if (!target) return;
  const safeMode = ["inner", "outer", "append", "prepend", "before", "after"].includes(mode) ? mode : "inner";
  swapTrustedHTML(target, html, safeMode);
}
function validateField(fieldEl) {
  const form2 = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!form2 || !spec) return [];
  const errors = spec.split("|").flatMap((ruleSpec) => {
    const [name, ...rest] = ruleSpec.split(":");
    const arg = rest.join(":") || void 0;
    const passed = ruleHandlers[name]?.(fieldEl.value, arg, form2) ?? true;
    return passed ? [] : [`${fieldName(fieldEl)} failed ${name}`];
  });
  fieldEl.setAttribute("aria-invalid", String(errors.length > 0));
  return errors;
}
function validateForm(formEl) {
  const errors = {};
  formEl.querySelectorAll("[data-uif-rule]").forEach((field) => {
    const fieldErrors = validateField(field);
    if (fieldErrors.length) errors[fieldName(field)] = fieldErrors;
  });
  return errors;
}
function clearErrors(formEl) {
  formEl.querySelectorAll(".uif-error").forEach((el) => el.remove());
  formEl.querySelectorAll(".uif-error-summary").forEach((el) => el.remove());
  formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute("aria-invalid", "false"));
}
function showErrors(formEl, errors) {
  Object.entries(errors).forEach(([name, messages]) => {
    const field = formEl.elements.namedItem(name);
    const fieldEl = field instanceof HTMLElement ? field : formEl.querySelector(`#${cssEscape(name)}`);
    if (!fieldEl) return;
    const msg = document.createElement("div");
    msg.className = "uif-error";
    msg.id = `${fieldEl.id || name}-error`;
    msg.textContent = messages[0] ?? "Invalid value";
    msg.setAttribute("role", "alert");
    fieldEl.setAttribute("aria-invalid", "true");
    fieldEl.setAttribute("aria-describedby", msg.id);
    fieldEl.insertAdjacentElement("afterend", msg);
  });
}
function showErrorSummary(formEl, errors) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  const summary = document.createElement("div");
  summary.className = "uif-error-summary";
  summary.setAttribute("role", "alert");
  const heading = document.createElement("strong");
  heading.textContent = `Please correct ${entries.length} field${entries.length === 1 ? "" : "s"}.`;
  const list = document.createElement("ul");
  entries.forEach(([name, messages]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${cssEscape(name)}`;
    link.textContent = messages[0] ?? "Invalid value";
    item.append(link);
    list.append(item);
  });
  summary.append(heading, list);
  formEl.prepend(summary);
  return summary;
}
async function validateFormAsync(formEl) {
  const errors = validateForm(formEl);
  const asyncFields = Array.from(
    formEl.querySelectorAll("[data-uif-validate-async]")
  );
  await Promise.all(
    asyncFields.map(async (field) => {
      const name = fieldName(field);
      const handler = asyncRuleHandlers.get(field.dataset.uifValidateAsync || "");
      const fieldErrors = handler ? await handler(field, formEl) : [];
      if (fieldErrors.length) errors[name] = [...errors[name] ?? [], ...fieldErrors];
    })
  );
  return errors;
}
function setFormState(formEl, state) {
  formEl.dataset.uifState = state;
  formEl.toggleAttribute("aria-busy", state === "submitting");
  emit(`uif:form-${state}`, { form: formEl }, formEl);
}
function initRepeatableGroup(root) {
  if (initializedRepeatables.has(root)) return;
  initializedRepeatables.add(root);
  root.addEventListener("click", (event) => {
    const action = event.target instanceof HTMLElement ? event.target.closest("[data-uif-repeat-action]") : null;
    if (!action) return;
    const template = root.querySelector('template[data-uif-role="template"]');
    const list = root.querySelector('[data-uif-role="items"]') || root;
    if (action.dataset.uifRepeatAction === "add" && template) list.append(template.content.cloneNode(true));
    if (action.dataset.uifRepeatAction === "remove") action.closest('[data-uif-role="item"]')?.remove();
  });
}
function initForm(formEl) {
  if (initializedForms.has(formEl)) return;
  initializedForms.add(formEl);
  formEl.dataset.uifState ||= "idle";
  formEl.querySelectorAll('[data-uif="repeatable"]').forEach(initRepeatableGroup);
  formEl.addEventListener("input", (event) => {
    const field = event.target instanceof HTMLElement ? event.target.closest("input,select,textarea") : null;
    field?.setAttribute("data-uif-touched", "true");
    formEl.dataset.uifDirty = "true";
  });
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(formEl);
    if (formEl.dataset.uifValidate !== "false") {
      const errors = await validateFormAsync(formEl);
      if (Object.keys(errors).length) {
        showErrors(formEl, errors);
        showErrorSummary(formEl, errors);
        setFormState(formEl, "error");
        return;
      }
    }
    setFormState(formEl, "submitting");
    const url = formEl.dataset.uifSrc || formEl.getAttribute("action") || window.location.href;
    const method = (formEl.dataset.uifMethod || formEl.getAttribute("method") || "POST").toUpperCase();
    try {
      const result = await request(url, {
        method,
        body: new FormData(formEl)
      });
      const target = resolveFormTarget(formEl);
      const mode = formEl.dataset.uifSwap || "inner";
      if (typeof result === "string") {
        swap(target, result, mode);
      } else if (result?.errors) {
        showErrors(formEl, result.errors);
        showErrorSummary(formEl, result.errors);
        setFormState(formEl, "error");
        return;
      } else if (result?.html) {
        swap(result.target ? document.querySelector(result.target) : target, result.html, result.swap || mode);
      }
      if (typeof result !== "string" && result?.focus) document.querySelector(result.focus)?.focus();
      setFormState(formEl, "success");
    } catch (error) {
      setFormState(formEl, "error");
      throw error;
    }
  });
}
var form = {
  name: "form",
  init: initForm
};
export {
  clearErrors,
  form,
  initForm,
  initRepeatableGroup,
  registerAsyncRule,
  showErrorSummary,
  showErrors,
  validateField,
  validateForm,
  validateFormAsync
};
