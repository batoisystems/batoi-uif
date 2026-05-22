import { request } from '@batoi/uif-net';

export type FormErrors = Record<string, string[]>;
type RuleHandler = (value: string, arg: string | undefined, form: HTMLFormElement) => boolean;

const ruleHandlers: Record<string, RuleHandler> = {
  required: (value) => value.trim().length > 0,
  email: (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  number: (value) => value === '' || !Number.isNaN(Number(value)),
  integer: (value) => value === '' || /^-?\d+$/.test(value),
  min: (value, arg) => value === '' || Number(value) >= Number(arg),
  max: (value, arg) => value === '' || Number(value) <= Number(arg),
  minLength: (value, arg) => value.length >= Number(arg),
  maxLength: (value, arg) => value.length <= Number(arg),
  pattern: (value, arg) => new RegExp(arg ?? '').test(value),
  sameAs: (value, arg, form) => {
    const other = arg ? form.elements.namedItem(arg) : null;
    return other instanceof HTMLInputElement || other instanceof HTMLTextAreaElement ? value === other.value : false;
  },
};

function fieldName(fieldEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  return fieldEl.name || fieldEl.id || 'field';
}

function resolveFormTarget(formEl: HTMLFormElement): HTMLElement | null {
  const expr = formEl.dataset.uifTarget;
  if (!expr) return null;
  if (expr === 'self') return formEl;
  if (expr === 'parent') return formEl.parentElement;
  if (expr.startsWith('closest:')) return formEl.closest<HTMLElement>(expr.slice(8));
  return document.querySelector<HTMLElement>(expr);
}

function swap(target: HTMLElement | null, html: string, mode = 'inner'): void {
  if (!target) return;
  if (mode === 'outer') target.outerHTML = html;
  else if (mode === 'append') target.insertAdjacentHTML('beforeend', html);
  else if (mode === 'prepend') target.insertAdjacentHTML('afterbegin', html);
  else target.innerHTML = html;
}

export function validateField(fieldEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string[] {
  const form = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!form || !spec) return [];
  const errors = spec.split('|').flatMap((ruleSpec) => {
    const [name, ...rest] = ruleSpec.split(':');
    const arg = rest.join(':') || undefined;
    const passed = ruleHandlers[name]?.(fieldEl.value, arg, form) ?? true;
    return passed ? [] : [`${fieldName(fieldEl)} failed ${name}`];
  });
  fieldEl.setAttribute('aria-invalid', String(errors.length > 0));
  return errors;
}

export function validateForm(formEl: HTMLFormElement): FormErrors {
  const errors: FormErrors = {};
  formEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-uif-rule]').forEach((field) => {
    const fieldErrors = validateField(field);
    if (fieldErrors.length) errors[fieldName(field)] = fieldErrors;
  });
  return errors;
}

export function clearErrors(formEl: HTMLFormElement): void {
  formEl.querySelectorAll('.uif-error').forEach((el) => el.remove());
  formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
}

export function showErrors(formEl: HTMLFormElement, errors: FormErrors): void {
  Object.entries(errors).forEach(([name, messages]) => {
    const field = formEl.elements.namedItem(name);
    const fieldEl = field instanceof HTMLElement ? field : formEl.querySelector<HTMLElement>(`#${CSS.escape(name)}`);
    if (!fieldEl) return;
    const msg = document.createElement('div');
    msg.className = 'uif-error';
    msg.id = `${name}-error`;
    msg.textContent = messages[0] ?? 'Invalid value';
    msg.setAttribute('role', 'alert');
    fieldEl.setAttribute('aria-invalid', 'true');
    fieldEl.setAttribute('aria-describedby', msg.id);
    fieldEl.insertAdjacentElement('afterend', msg);
  });
}

export function initForm(formEl: HTMLFormElement): void {
  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(formEl);
    if (formEl.dataset.uifValidate !== 'false') {
      const errors = validateForm(formEl);
      if (Object.keys(errors).length) {
        showErrors(formEl, errors);
        return;
      }
    }

    const url = formEl.dataset.uifSrc || formEl.getAttribute('action') || window.location.href;
    const method = (formEl.dataset.uifMethod || formEl.getAttribute('method') || 'POST').toUpperCase();
    const result = await request<string | { html?: string; target?: string; swap?: string }>(url, {
      method,
      body: new FormData(formEl),
    });
    const target = resolveFormTarget(formEl);
    const mode = formEl.dataset.uifSwap || 'inner';
    if (typeof result === 'string') {
      swap(target, result, mode);
    } else if (result?.html) {
      swap(result.target ? document.querySelector<HTMLElement>(result.target) : target, result.html, result.swap || mode);
    }
  });
}

export const form = {
  name: 'form',
  init: initForm,
};
