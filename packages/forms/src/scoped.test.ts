import { afterEach, describe, expect, it, vi } from 'vitest';
import { initScopedForm, registerAsyncRule } from './index.js';

const controllers: Array<{ destroy(): void }> = [];
afterEach(() => { controllers.splice(0).forEach((controller) => controller.destroy()); vi.unstubAllGlobals(); document.body.replaceChildren(); });

function fixture() {
  document.body.innerHTML = '<main><form action="/save" data-uif-validate="false" data-uif-target="#output"><label>Name<input name="name"></label><button>Save</button></form><div id="output">Original</div></main><aside id="foreign">Foreign</aside>';
  const root = document.querySelector('main')!;
  const form = root.querySelector('form')!;
  const afterSwap = vi.fn();
  const error = vi.fn();
  form.addEventListener('uif:form-error', error);
  const controller = initScopedForm(form, { root, afterSwap });
  controllers.push(controller);
  const submit = () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  return { root, form, controller, afterSwap, error, submit };
}

describe('scoped forms and cancellation', () => {
  it('allows an empty governed HTML swap and reports its affected subtree', async () => {
    const { form, root, submit, afterSwap } = fixture();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ html: '' })));
    submit();
    await vi.waitFor(() => expect(form.dataset.uifState).toBe('success'));
    expect(root.querySelector('#output')!.textContent).toBe('');
    expect(afterSwap).toHaveBeenCalledWith(root.querySelector('#output'));
  });

  it('validates all response targets before writing HTML or moving foreign focus', async () => {
    const { form, root, submit, error, afterSwap } = fixture();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ html: 'Changed', focus: '#foreign' })));
    submit();
    await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
    expect(form.dataset.uifState).toBe('error');
    expect(root.querySelector('#output')!.textContent).toBe('Original');
    expect(afterSwap).not.toHaveBeenCalled();
  });

  it('ignores a late response after reset and clears dirty/touched/pending state', async () => {
    const { form, root, submit } = fixture();
    let resolve: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((done) => { resolve = done; })));
    const success = vi.fn(); form.addEventListener('uif:form-success', success);
    const complete = new Promise((done) => document.addEventListener('uif:complete', done, { once: true }));
    const input = form.querySelector('input')!;
    input.dispatchEvent(new Event('input', { bubbles: true })); input.dataset.uifTouched = 'true';
    submit();
    expect(form.getAttribute('aria-busy')).toBe('');
    form.reset();
    expect(form.dataset.uifState).toBe('idle');
    expect(form.hasAttribute('aria-busy')).toBe(false);
    expect(input.hasAttribute('data-uif-dirty')).toBe(false);
    expect(input.hasAttribute('data-uif-touched')).toBe(false);
    resolve!(Response.json({ html: 'Obsolete' }));
    await complete;
    await Promise.resolve();
    expect(root.querySelector('#output')!.textContent).toBe('Original');
    expect(success).not.toHaveBeenCalled();
  });

  it('renders validation-provider failure as an owned error instead of an unhandled rejection', async () => {
    const { form, submit, error } = fixture();
    form.dataset.uifValidate = 'true';
    form.querySelector('input')!.dataset.uifValidateAsync = 'v4-rejected-validation';
    registerAsyncRule('v4-rejected-validation', async () => { throw new Error('Validation unavailable'); });
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    submit();
    await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
    expect(form.dataset.uifState).toBe('error');
    expect(fetch).not.toHaveBeenCalled();
  });
});
