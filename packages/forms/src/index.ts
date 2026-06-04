import { emit } from '@batoi/uif-core';
import { swapTrustedHTML } from '@batoi/uif-dom';
import { request } from '@batoi/uif-net';

export type FormErrors = Record<string, string[]>;
type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type RuleHandler = (value: string, arg: string | undefined, form: HTMLFormElement, field: FormField) => boolean;
type AsyncRuleHandler = (
  field: FormField,
  form: HTMLFormElement,
  signal: AbortSignal,
) => Promise<string[]>;
type FieldAdapter = (field: FormField) => string;
type ValidationMessageHandler = (field: FormField, rule: string, arg: string | undefined) => string;

const ruleHandlers: Record<string, RuleHandler> = {
  required: (value) => value.trim().length > 0,
  email: (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  number: (value) => value === '' || !Number.isNaN(Number(value)),
  integer: (value) => value === '' || /^-?\d+$/.test(value),
  min: (value, arg) => value === '' || Number(value) >= Number(arg),
  max: (value, arg) => value === '' || Number(value) <= Number(arg),
  minLength: (value, arg) => value.length >= Number(arg),
  maxLength: (value, arg) => value.length <= Number(arg),
  pattern: (value, arg) => {
    try {
      return new RegExp(arg ?? '').test(value);
    } catch {
      return false;
    }
  },
  sameAs: (value, arg, form) => {
    const other = arg ? form.elements.namedItem(arg) : null;
    return other instanceof HTMLInputElement || other instanceof HTMLTextAreaElement ? value === other.value : false;
  },
};

const asyncRuleHandlers = new Map<string, AsyncRuleHandler>();
const fieldAdapters = new Map<string, FieldAdapter>();
const validationMessages = new Map<string, ValidationMessageHandler>();
const initializedForms = new WeakSet<HTMLFormElement>();
const initializedRepeatables = new WeakSet<HTMLElement>();
const validationControllers = new WeakMap<HTMLFormElement, AbortController>();
const submitKeys = new WeakMap<HTMLFormElement, string>();

export function registerAsyncRule(name: string, handler: AsyncRuleHandler): void {
  asyncRuleHandlers.set(name, handler);
}

export function registerFieldAdapter(name: string, adapter: FieldAdapter): void {
  fieldAdapters.set(name, adapter);
}

export function registerValidationMessage(name: string, handler: ValidationMessageHandler): void {
  validationMessages.set(name, handler);
}

function abortError(): DOMException {
  return new DOMException('Form validation aborted', 'AbortError');
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function fieldName(fieldEl: FormField): string {
  return fieldEl.name || fieldEl.id || 'field';
}

function fieldAdapterName(fieldEl: FormField): string {
  return fieldEl.dataset.uifFieldAdapter || (fieldEl instanceof HTMLInputElement ? fieldEl.type : fieldEl.tagName.toLowerCase());
}

function fieldValue(fieldEl: FormField): string {
  const adapter = fieldAdapters.get(fieldAdapterName(fieldEl));
  if (adapter) return adapter(fieldEl);
  if (fieldEl instanceof HTMLInputElement) {
    if (fieldEl.type === 'checkbox') return fieldEl.checked ? fieldEl.value || 'on' : '';
    if (fieldEl.type === 'radio') {
      const checked = fieldEl.form?.querySelector<HTMLInputElement>(`input[type="radio"][name="${cssEscape(fieldEl.name)}"]:checked`);
      return checked?.value ?? '';
    }
    if (fieldEl.type === 'file') return Array.from(fieldEl.files ?? []).map((file) => file.name).join(',');
  }
  if (fieldEl instanceof HTMLSelectElement && fieldEl.multiple) {
    return Array.from(fieldEl.selectedOptions).map((option) => option.value).join(',');
  }
  return fieldEl.value;
}

function validationMessage(fieldEl: FormField, rule: string, arg: string | undefined): string {
  return validationMessages.get(rule)?.(fieldEl, rule, arg) ?? `${fieldName(fieldEl)} failed ${rule}`;
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/["\\#.;,[\]=:]/g, '\\$&');
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
  const safeMode = ['inner', 'outer', 'append', 'prepend', 'before', 'after'].includes(mode) ? mode : 'inner';
  swapTrustedHTML(target, html, safeMode as 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after');
}

export function validateField(fieldEl: FormField): string[] {
  const form = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!form || !spec) return [];
  const value = fieldValue(fieldEl);
  const errors = spec.split('|').flatMap((ruleSpec) => {
    const [name, ...rest] = ruleSpec.split(':');
    const arg = rest.join(':') || undefined;
    const passed = ruleHandlers[name]?.(value, arg, form, fieldEl) ?? true;
    return passed ? [] : [validationMessage(fieldEl, name, arg)];
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
  formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
    el.setAttribute('aria-invalid', 'false');
    const describedBy = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && !id.endsWith('-error'))
      .join(' ');
    if (describedBy) el.setAttribute('aria-describedby', describedBy);
    else el.removeAttribute('aria-describedby');
  });
}

export function showErrors(formEl: HTMLFormElement, errors: FormErrors): void {
  Object.entries(errors).forEach(([name, messages]) => {
    const field = formEl.elements.namedItem(name);
    const fieldEl = field instanceof HTMLElement ? field : formEl.querySelector<HTMLElement>(`#${cssEscape(name)}`);
    if (!fieldEl) return;
    const msg = document.createElement('div');
    msg.className = 'uif-error';
    msg.id = `${fieldEl.id || name}-error`;
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
  const heading = document.createElement('strong');
  heading.textContent = `Please correct ${entries.length} field${entries.length === 1 ? '' : 's'}.`;
  const list = document.createElement('ul');
  entries.forEach(([name, messages]) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${cssEscape(name)}`;
    link.textContent = messages[0] ?? 'Invalid value';
    item.append(link);
    list.append(item);
  });
  summary.append(heading, list);
  formEl.prepend(summary);
  return summary;
}

export async function validateFormAsync(formEl: HTMLFormElement): Promise<FormErrors> {
  validationControllers.get(formEl)?.abort();
  const controller = new AbortController();
  validationControllers.set(formEl, controller);
  const errors = validateForm(formEl);
  const asyncFields = Array.from(formEl.querySelectorAll<FormField>('[data-uif-validate-async]'));
  await Promise.all(
    asyncFields.map(async (field) => {
      if (controller.signal.aborted) throw abortError();
      const name = fieldName(field);
      const handler = asyncRuleHandlers.get(field.dataset.uifValidateAsync || '');
      const fieldErrors = handler ? await handler(field, formEl, controller.signal) : [];
      if (controller.signal.aborted) throw abortError();
      if (fieldErrors.length) errors[name] = [...(errors[name] ?? []), ...fieldErrors];
    }),
  );
  if (controller.signal.aborted) throw abortError();
  validationControllers.delete(formEl);
  return errors;
}

function setFormState(formEl: HTMLFormElement, state: 'idle' | 'submitting' | 'success' | 'error'): void {
  formEl.dataset.uifState = state;
  formEl.toggleAttribute('aria-busy', state === 'submitting');
  emit(`uif:form-${state}`, { form: formEl }, formEl);
}

export function initRepeatableGroup(root: HTMLElement): void {
  if (initializedRepeatables.has(root)) return;
  initializedRepeatables.add(root);
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
  if (initializedForms.has(formEl)) return;
  initializedForms.add(formEl);
  formEl.dataset.uifState ||= 'idle';
  formEl.querySelectorAll<HTMLElement>('[data-uif="repeatable"]').forEach(initRepeatableGroup);
  const markDirty = (event: Event) => {
    const field = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('input,select,textarea') : null;
    field?.setAttribute('data-uif-dirty', 'true');
    formEl.dataset.uifDirty = 'true';
    emit('uif:form-dirty', { form: formEl, field }, formEl);
  };
  formEl.addEventListener('input', markDirty);
  formEl.addEventListener('change', markDirty);
  formEl.addEventListener(
    'blur',
    (event) => {
      const field = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('input,select,textarea') : null;
      field?.setAttribute('data-uif-touched', 'true');
      emit('uif:form-touched', { form: formEl, field }, formEl);
    },
    true,
  );
  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(formEl);
    if (formEl.dataset.uifValidate !== 'false') {
      let errors: FormErrors;
      try {
        errors = await validateFormAsync(formEl);
      } catch (error) {
        if (isAbortError(error)) return;
        throw error;
      }
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
    const key = submitKeys.get(formEl) || `form:${formEl.id || formEl.name || Math.random().toString(36).slice(2)}`;
    submitKeys.set(formEl, key);
    try {
      const result = await request<string | { html?: string; target?: string; swap?: string; errors?: FormErrors; focus?: string }>(url, {
        method,
        body: new FormData(formEl),
        key,
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
      if (isAbortError(error)) return;
      setFormState(formEl, 'error');
      throw error;
    }
  });
}

export const form = {
  name: 'form',
  init: initForm,
};
