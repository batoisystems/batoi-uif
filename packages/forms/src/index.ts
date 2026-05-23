import { emit } from '@batoi/uif-core';
import { request } from '@batoi/uif-net';

export type FormErrors = Record<string, string[]>;
type RuleHandler = (value: string, arg: string | undefined, form: HTMLFormElement) => boolean;
type AsyncRuleHandler = (
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  form: HTMLFormElement,
) => Promise<string[]>;

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

const asyncRuleHandlers = new Map<string, AsyncRuleHandler>();

export function registerAsyncRule(name: string, handler: AsyncRuleHandler): void {
  asyncRuleHandlers.set(name, handler);
}

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
  formEl.querySelectorAll('.uif-error-summary').forEach((el) => el.remove());
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

export function showErrorSummary(formEl: HTMLFormElement, errors: FormErrors): HTMLElement | null {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  const summary = document.createElement('div');
  summary.className = 'uif-error-summary';
  summary.setAttribute('role', 'alert');
  summary.innerHTML = `<strong>Please correct ${entries.length} field${entries.length === 1 ? '' : 's'}.</strong><ul>${entries
    .map(([name, messages]) => `<li><a href="#${CSS.escape(name)}">${messages[0] ?? 'Invalid value'}</a></li>`)
    .join('')}</ul>`;
  formEl.prepend(summary);
  return summary;
}

export async function validateFormAsync(formEl: HTMLFormElement): Promise<FormErrors> {
  const errors = validateForm(formEl);
  const asyncFields = Array.from(
    formEl.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-uif-validate-async]'),
  );
  await Promise.all(
    asyncFields.map(async (field) => {
      const name = fieldName(field);
      const handler = asyncRuleHandlers.get(field.dataset.uifValidateAsync || '');
      const fieldErrors = handler ? await handler(field, formEl) : [];
      if (fieldErrors.length) errors[name] = [...(errors[name] ?? []), ...fieldErrors];
    }),
  );
  return errors;
}

function setFormState(formEl: HTMLFormElement, state: 'idle' | 'submitting' | 'success' | 'error'): void {
  formEl.dataset.uifState = state;
  formEl.toggleAttribute('aria-busy', state === 'submitting');
  emit(`uif:form-${state}`, { form: formEl }, formEl);
}

export function initRepeatableGroup(root: HTMLElement): void {
  root.addEventListener('click', (event) => {
    const action = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-repeat-action]') : null;
    if (!action) return;
    const template = root.querySelector<HTMLTemplateElement>('template[data-uif-role="template"]');
    const list = root.querySelector<HTMLElement>('[data-uif-role="items"]') || root;
    if (action.dataset.uifRepeatAction === 'add' && template) list.append(template.content.cloneNode(true));
    if (action.dataset.uifRepeatAction === 'remove') action.closest<HTMLElement>('[data-uif-role="item"]')?.remove();
  });
}

export function initForm(formEl: HTMLFormElement): void {
  formEl.dataset.uifState ||= 'idle';
  formEl.querySelectorAll<HTMLElement>('[data-uif="repeatable"]').forEach(initRepeatableGroup);
  formEl.addEventListener('input', (event) => {
    const field = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('input,select,textarea') : null;
    field?.setAttribute('data-uif-touched', 'true');
    formEl.dataset.uifDirty = 'true';
  });
  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(formEl);
    if (formEl.dataset.uifValidate !== 'false') {
      const errors = await validateFormAsync(formEl);
      if (Object.keys(errors).length) {
        showErrors(formEl, errors);
        showErrorSummary(formEl, errors);
        setFormState(formEl, 'error');
        return;
      }
    }

    setFormState(formEl, 'submitting');
    const url = formEl.dataset.uifSrc || formEl.getAttribute('action') || window.location.href;
    const method = (formEl.dataset.uifMethod || formEl.getAttribute('method') || 'POST').toUpperCase();
    try {
      const result = await request<string | { html?: string; target?: string; swap?: string; errors?: FormErrors; focus?: string }>(url, {
        method,
        body: new FormData(formEl),
      });
      const target = resolveFormTarget(formEl);
      const mode = formEl.dataset.uifSwap || 'inner';
      if (typeof result === 'string') {
        swap(target, result, mode);
      } else if (result?.errors) {
        showErrors(formEl, result.errors);
        showErrorSummary(formEl, result.errors);
        setFormState(formEl, 'error');
        return;
      } else if (result?.html) {
        swap(result.target ? document.querySelector<HTMLElement>(result.target) : target, result.html, result.swap || mode);
      }
      if (typeof result !== 'string' && result?.focus) document.querySelector<HTMLElement>(result.focus)?.focus();
      setFormState(formEl, 'success');
    } catch (error) {
      setFormState(formEl, 'error');
      throw error;
    }
  });
}

export const form = {
  name: 'form',
  init: initForm,
};
