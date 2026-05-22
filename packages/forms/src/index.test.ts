import { describe, expect, it } from 'vitest';
import { showErrors, validateForm } from './index.js';

describe('forms', () => {
  it('validates required and email rules', () => {
    document.body.innerHTML = '<form><input name="email" data-uif-rule="required|email" value="bad"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    expect(validateForm(form)).toEqual({ email: ['email failed email'] });
  });

  it('renders accessible errors', () => {
    document.body.innerHTML = '<form><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    showErrors(form, { email: ['Email is required'] });
    expect(document.querySelector('.uif-error')?.textContent).toBe('Email is required');
    expect(document.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });
});
