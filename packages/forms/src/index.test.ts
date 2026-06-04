import { describe, expect, it, vi } from 'vitest';
import { initForm, registerAsyncRule, registerFieldAdapter, registerValidationMessage, showErrorSummary, showErrors, validateField, validateForm, validateFormAsync } from './index.js';

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

  it('validates checkbox, radio, file, and custom field adapter values', () => {
    const file = new File(['hello'], 'proof.txt', { type: 'text/plain' });
    document.body.innerHTML = `
      <form>
        <input type="checkbox" name="agree" data-uif-rule="required">
        <input type="radio" name="tier" value="basic" data-uif-rule="required">
        <input type="radio" name="tier" value="pro" checked>
        <input type="file" name="proof" data-uif-rule="required">
        <input id="combo" name="combo" data-uif-field-adapter="combobox" data-value="selected" data-uif-rule="required">
      </form>
    `;
    const form = document.querySelector('form') as HTMLFormElement;
    const checkbox = form.elements.namedItem('agree') as HTMLInputElement;
    const fileInput = form.elements.namedItem('proof') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', { value: [file] });
    registerFieldAdapter('combobox', (field) => field.dataset.value ?? '');
    expect(validateField(checkbox)).toEqual(['agree failed required']);
    checkbox.checked = true;
    expect(validateField(checkbox)).toEqual([]);
    expect(validateField(form.querySelector('input[name="tier"]') as HTMLInputElement)).toEqual([]);
    expect(validateField(fileInput)).toEqual([]);
    expect(validateField(document.querySelector('#combo') as HTMLInputElement)).toEqual([]);
  });

  it('uses registered validation messages', () => {
    document.body.innerHTML = '<form><input name="email" data-uif-rule="required"></form>';
    registerValidationMessage('required', (field) => `${field.name} is required`);
    const form = document.querySelector('form') as HTMLFormElement;
    expect(validateForm(form)).toEqual({ email: ['email is required'] });
  });

  it('cancels stale async validation runs', async () => {
    document.body.innerHTML = '<form><input name="email" data-uif-validate-async="unique"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const signals: AbortSignal[] = [];
    registerAsyncRule('unique', async (_field, _form, signal) => {
      signals.push(signal);
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      return signal.aborted ? [] : ['Email already exists'];
    });
    const first = validateFormAsync(form);
    const second = validateFormAsync(form);
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toEqual({ email: ['Email already exists'] });
    expect(signals[0].aborted).toBe(true);
  });

  it('initializes a form only once', () => {
    document.body.innerHTML = '<form data-uif="form"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    initForm(form);
    initForm(form);
    form.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.dataset.uifDirty).toBe('true');
  });

  it('marks dirty and touched field states', () => {
    document.body.innerHTML = '<form data-uif="form"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    initForm(form);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(form.dataset.uifDirty).toBe('true');
    expect(input.dataset.uifDirty).toBe('true');
    expect(input.dataset.uifTouched).toBe('true');
  });

  it('uses a stable cancellation key for repeated submits', async () => {
    const fetch = vi.fn(
      async (_url: string, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          window.setTimeout(() => resolve(new Response('{}', { headers: { 'content-type': 'application/json' } })), 0);
        }),
    );
    vi.stubGlobal('fetch', fetch);
    document.body.innerHTML = '<form data-uif="form" data-uif-src="/save" data-uif-validate="false"><input name="email" value="a@example.com"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    initForm(form);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 5));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(form.dataset.uifState).toBe('success');
  });
});
