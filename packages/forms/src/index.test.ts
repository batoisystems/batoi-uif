import { describe, expect, it } from 'vitest';
import { initForm, showErrorSummary, showErrors, validateForm } from './index.js';

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

  it('renders error summaries without trusting message markup', () => {
    document.body.innerHTML = '<form><input id="email" name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const summary = showErrorSummary(form, { email: ['<img src=x onerror=alert(1)>'] });
    expect(summary?.querySelector('a')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(summary?.querySelector('img')).toBeNull();
  });

  it('treats malformed pattern rules as validation failures', () => {
    document.body.innerHTML = '<form><input name="code" data-uif-rule="pattern:[" value="abc"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    expect(validateForm(form)).toEqual({ code: ['code failed pattern'] });
  });

  it('initializes a form only once', () => {
    document.body.innerHTML = '<form data-uif="form"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    initForm(form);
    initForm(form);
    form.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.dataset.uifDirty).toBe('true');
  });
});
