import { submitForm } from '@batoi/uif-net';

const rules = {
  required: (v) => v.trim().length > 0,
  email: (v) => /.+@.+\..+/.test(v),
  number: (v) => !Number.isNaN(Number(v)),
  integer: (v) => /^-?\d+$/.test(v),
  min: (v, a) => Number(v) >= Number(a),
  max: (v, a) => Number(v) <= Number(a),
  minLength: (v, a) => v.length >= Number(a),
  maxLength: (v, a) => v.length <= Number(a),
  pattern: (v, a) => new RegExp(a ?? '').test(v),
  sameAs: (v, a, form) => v === form.elements.namedItem(a ?? '')?.value,
};

export function validateField(fieldEl) {
  const form = fieldEl.form;
  const spec = fieldEl.dataset.uifRule;
  if (!spec) return [];
  return spec.split('|').flatMap((r) => {
    const [name, arg] = r.split(':');
    const pass = rules[name]?.(fieldEl.value, arg, form) ?? true;
    return pass ? [] : [`${fieldEl.name || 'field'} failed ${name}`];
  });
}

export function validateForm(formEl) {
  const errors = {};
  formEl.querySelectorAll('[data-uif-rule]').forEach((field) => {
    const errs = validateField(field);
    if (errs.length) errors[field.name || field.id] = errs;
  });
  return errors;
}

export function clearErrors(formEl) { formEl.querySelectorAll('.uif-error').forEach((el) => el.remove()); }

export function showErrors(formEl, errors) {
  Object.entries(errors).forEach(([name, errs]) => {
    const field = formEl.elements.namedItem(name);
    if (!field) return;
    const msg = document.createElement('div');
    msg.className = 'uif-error';
    msg.textContent = errs[0];
    field.insertAdjacentElement('afterend', msg);
  });
}

export function initForm(formEl) {
  formEl.addEventListener('submit', async (e) => {
    if (formEl.dataset.uifValidate !== 'false') {
      const errors = validateForm(formEl);
      clearErrors(formEl);
      if (Object.keys(errors).length) {
        e.preventDefault();
        showErrors(formEl, errors);
        return;
      }
    }
    e.preventDefault();
    await submitForm(formEl);
  });
}
