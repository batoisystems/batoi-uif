import { describe, expect, it, vi } from 'vitest';
import { createComponentRegistry } from './component-registry.js';

describe('component registry', () => {
  it('mounts once, updates on refresh, and destroys owned controllers', () => {
    document.body.innerHTML = '<section data-uif="sample" data-uif-options="{&quot;label&quot;:&quot;Ready&quot;}"></section>';
    const mount = vi.fn();
    const update = vi.fn();
    const destroy = vi.fn();
    const registry = createComponentRegistry();
    registry.register({
      name: 'sample',
      optionKeys: ['label'],
      defaults: { label: 'Fallback' },
      mount(context) {
        mount(context.options);
        context.element.textContent = String(context.options.label);
        return { update, destroy };
      },
    });

    registry.refresh(document.body);
    registry.refresh(document.body, 'rehydrate');
    expect(mount).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('rehydrate');
    expect(document.querySelector('section')?.textContent).toBe('Ready');
    registry.destroy(document.body);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('emits diagnostics without blocking a progressive fallback', () => {
    document.body.innerHTML = '<section data-uif="sample" data-uif-options="{&quot;unexpected&quot;:true}">Fallback</section>';
    const diagnostic = vi.fn();
    document.body.addEventListener('uif:runtime:diagnostic', diagnostic);
    const registry = createComponentRegistry();
    registry.register({ name: 'sample', optionKeys: ['known'], mount: () => undefined });
    registry.refresh(document.body);
    expect(diagnostic).toHaveBeenCalledTimes(1);
    expect(document.querySelector('section')?.textContent).toBe('Fallback');
  });

  it('rejects invalid and duplicate component names', () => {
    const registry = createComponentRegistry();
    expect(() => registry.register({ name: 'Invalid Name', mount: () => undefined })).toThrow();
    registry.register({ name: 'valid-name', mount: () => undefined });
    expect(() => registry.register({ name: 'valid-name', mount: () => undefined })).toThrow();
  });

  it('suspends and resumes mounted controllers by root', () => {
    document.body.innerHTML = '<section><div data-uif="sample"></div></section>';
    const suspend = vi.fn();
    const resume = vi.fn();
    const registry = createComponentRegistry();
    registry.register({ name: 'sample', mount: () => ({ suspend, resume, destroy: vi.fn() }) });
    const root = document.querySelector('section') as HTMLElement;
    registry.refresh(root);
    registry.suspend(root);
    registry.resume(root);
    expect(suspend).toHaveBeenCalledOnce();
    expect(resume).toHaveBeenCalledOnce();
  });
});
