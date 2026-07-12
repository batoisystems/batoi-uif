import { describe, expect, it, vi } from 'vitest';
import { clearErrors, initForm, registerAsyncRule, registerFieldAdapter, registerValidationMessage, showErrorSummary, showErrors, validateField, validateForm, validateFormAsync } from './index.js';

describe('forms', () => {
  it('validates required and email rules', () => {
    document.body.innerHTML = '<form><input name="email" data-uif-rule="required|email" value="bad"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    expect(validateForm(form)).toEqual({ email: ['email failed email'] });
  });

  it('renders accessible errors', () => {
    document.body.innerHTML = '<form><input name="email" aria-describedby="email-help"><span id="email-help">Help</span></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    showErrors(form, { email: ['Email is required'] });
    expect(document.querySelector('.uif-error')?.textContent).toBe('Email is required');
    expect(document.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector('input')?.getAttribute('aria-describedby')).toMatch(/email-help .*error/);
    clearErrors(form);
    expect(document.querySelector('input')?.getAttribute('aria-describedby')).toBe('email-help');
  });

  it('renders error summaries without trusting message markup', () => {
    document.body.innerHTML = '<form><input id="email" name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const summary = showErrorSummary(form, { email: ['<img src=x onerror=alert(1)>'] });
    expect(summary?.querySelector('a')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(summary?.querySelector('img')).toBeNull();
  });

  it('assigns stable summary targets to fields without ids and bounds server errors', () => {
    document.body.innerHTML = '<form><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const errors = Object.fromEntries(Array.from({ length: 105 }, (_, index) => [index === 0 ? 'email' : `missing-${index}`, ['x'.repeat(2_100)]]));
    showErrors(form, errors);
    const summary = showErrorSummary(form, errors);
    const input = form.querySelector('input')!;
    expect(input.id).toMatch(/^uif-field-email-/);
    expect(summary?.querySelector('a')?.getAttribute('href')).toBe(`#${input.id}`);
    expect(summary?.querySelectorAll('li')).toHaveLength(100);
    expect(summary?.querySelector('a')?.textContent).toHaveLength(2_000);
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
    const first = initForm(form);
    const second = initForm(form);
    expect(first).toBe(second);
    form.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.dataset.uifDirty).toBe('true');
  });

  it('refreshes repeatable groups and removes form listeners on destroy', () => {
    document.body.innerHTML = '<form data-uif="form"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const controller = initForm(form);
    form.insertAdjacentHTML('beforeend', '<section data-uif="repeatable"><div data-uif-role="items"></div><template data-uif-role="template"><p data-uif-role="item">Item</p></template><button type="button" data-uif-repeat-action="add">Add</button></section>');
    controller.refresh();
    form.querySelector<HTMLButtonElement>('[data-uif-repeat-action="add"]')?.click();
    expect(form.querySelectorAll('[data-uif-role="item"]')).toHaveLength(1);

    controller.destroy();
    delete form.dataset.uifDirty;
    form.querySelector('input')?.dispatchEvent(new Event('input', { bubbles: true }));
    form.querySelector<HTMLButtonElement>('[data-uif-repeat-action="add"]')?.click();
    expect(form.dataset.uifDirty).toBeUndefined();
    expect(form.querySelectorAll('[data-uif-role="item"]')).toHaveLength(1);

    expect(initForm(form)).not.toBe(controller);
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

  it('encodes enhanced GET forms in the URL without a request body', async () => {
    const fetch = vi.fn(async () => new Response('{}', { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    document.body.innerHTML = '<form data-uif="form" action="/search?scope=all" method="get" data-uif-validate="false"><input name="q" value="RAD forms"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    initForm(form);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    const [url, options] = fetch.mock.calls[0]!;
    expect(String(url)).toContain('scope=all&q=RAD+forms');
    expect(options?.method).toBe('GET');
    expect(options?.body).toBeUndefined();
  });

  it('blocks cross-origin form actions by default', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    document.body.innerHTML = '<form data-uif="form" data-uif-src="https://evil.example/save" data-uif-validate="false"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    const failed = new Promise<CustomEvent>((resolve) => form.addEventListener('uif:form-error', (event) => resolve(event as CustomEvent), { once: true }));
    initForm(form);

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect((await failed).detail.error.message).toContain('unsafe form action URL');
    expect(fetch).not.toHaveBeenCalled();
    expect(form.dataset.uifState).toBe('error');
  });

  it('reports request failures and ignores malformed response selectors', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ html: '<p>Saved</p>', target: '[', focus: '[' }), { headers: { 'content-type': 'application/json' } }))
      .mockRejectedValueOnce(new Error('network down'));
    vi.stubGlobal('fetch', fetch);
    document.body.innerHTML = '<form data-uif="form" data-uif-src="/save" data-uif-validate="false"><input name="email"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    initForm(form);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(form.dataset.uifState).toBe('success');

    const failed = new Promise<CustomEvent>((resolve) => form.addEventListener('uif:form-error', (event) => resolve(event as CustomEvent), { once: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect((await failed).detail.error.message).toBe('network down');
    expect(form.dataset.uifState).toBe('error');
  });
});
