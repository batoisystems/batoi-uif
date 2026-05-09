import { describe, expect, it } from 'vitest';
import { showErrors, validateForm } from './index.js';

describe('form validation', () => {
  it('validates required/email', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'email';
    input.value = 'bad';
    input.dataset.uifRule = 'required|email';
    form.appendChild(input);
    const errors = validateForm(form);
    expect(errors.email.length).toBeGreaterThan(0);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders accessible errors', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'name';
    form.appendChild(input);
    showErrors(form, { name: ['Name is required'] });
    expect(form.querySelector('.uif-error')?.getAttribute('role')).toBe('alert');
    expect(input.getAttribute('aria-describedby')).toBe('name-error');
  });
});
