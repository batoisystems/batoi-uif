import { request } from '@batoi/uif-net';

const ruleHandlers = {
  required: (value) => value.trim().length > 0,
  email: (value) => value === '' || /.+@.+\..+/.test(value),
  number: (value) => value === '' || !Number.isNaN(Number(value)),
  integer: (value) => value === '' || /^-?\d+$/.test(value),
  min: (value, arg) => value === '' || Number(value) >= Number(arg),
  max: (value, arg) => value === '' || Number(value) <= Number(arg),
  minLength: (value, arg) => value.length >= Number(arg),
  maxLength: (value, arg) => value.length <= Number(arg),
  pattern: (value, arg) => new RegExp(arg ?? '').test(value),
  sameAs: (value, arg, form) => value === form.elements.namedItem(arg ?? '')?.value,
};

function fieldName(fieldEl) {
  return fieldEl.name || fieldEl.id || 'field';
}

function resolveFormTarget(formEl) {
  const expr = formEl.dataset.uifTarget;
  if (!expr) return null;
  if (expr === 'self') return formEl;
  if (expr === 'parent') return formEl.parentElement;
  if (expr.startsWith('closest:')) return formEl.closest(expr.slice(8));
  return document.querySelector(expr);
}

function swap(target, html, mode = 'inner') {
  if (!target) return;
  if (mode === 'outer') target.outerHTML = html;
  else if (mode === 'append') target.insertAdjacentHTML('beforeend', html);
  else if (mode === 'prepend') target.insertAdjacentHTML('afterbegin', html);
  else target.innerHTML = html;
}

export function validateField(fieldEl) {
  const form = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!spec) return [];
  const errors = spec.split('|').flatMap((ruleSpec) => {
    const [name, ...rest] = ruleSpec.split(':');
    const arg = rest.join(':');
    const passed = ruleHandlers[name]?.(fieldEl.value, arg, form) ?? true;
    return passed ? [] : [`${fieldName(fieldEl)} failed ${name}`];
  });
  fieldEl.setAttribute('aria-invalid', String(errors.length > 0));
  return errors;
}

export function validateForm(formEl) {
  const errors = {};
  formEl.querySelectorAll('[data-uif-rule]').forEach((field) => {
    const fieldErrors = validateField(field);
    if (fieldErrors.length) errors[fieldName(field)] = fieldErrors;
  });
  return errors;
}

export function clearErrors(formEl) {
  formEl.querySelectorAll('.uif-error').forEach((el) => el.remove());
  formEl.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
}

export function showErrors(formEl, errors) {
  Object.entries(errors).forEach(([name, messages]) => {
    const field = formEl.elements.namedItem(name) || formEl.querySelector(`#${name}`);
    if (!field) return;
    const msg = document.createElement('div');
    msg.className = 'uif-error';
    msg.id = `${name}-error`;
    msg.textContent = messages[0];
    msg.setAttribute('role', 'alert');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', msg.id);
    field.insertAdjacentElement('afterend', msg);
  });
}

export function initForm(formEl) {
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
    const result = await request(url, { method, body: new FormData(formEl) });
    const target = resolveFormTarget(formEl);
    const mode = formEl.dataset.uifSwap || 'inner';
    if (typeof result === 'string') {
      swap(target, result, mode);
    } else if (result?.html) {
      swap(result.target ? document.querySelector(result.target) : target, result.html, result.swap || mode);
    }
  });
}
