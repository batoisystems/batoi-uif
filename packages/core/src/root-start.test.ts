import { describe, expect, it, vi } from 'vitest';
import {
  registerAction,
  registerRuntimeComponent,
  runtimeRegistry,
  start,
  unregisterAction,
} from '../../../index.js';

describe('root start lifecycle', () => {
  it('returns the active app for repeated starts without duplicating action handlers', () => {
    document.body.innerHTML = '<button data-uif-event="click" data-uif-action="count-once">Run</button>';
    const handler = vi.fn();
    registerAction('count-once', handler);
    const root = document.body;
    const first = start(root);
    const second = start(root);
    const button = document.querySelector('button') as HTMLButtonElement;

    expect(second).toBe(first);
    button.click();
    expect(handler).toHaveBeenCalledTimes(1);
    first.destroy();
    unregisterAction('count-once');
  });

  it('destroys once and can restart the same root', () => {
    document.body.innerHTML = '<button data-uif-event="click" data-uif-action="set-text" data-uif-target="#out" data-uif-value="Updated">Run</button><output id="out"></output>';
    const root = document.body;
    const first = start(root);
    first.destroy();
    first.destroy();
    expect(first.destroyed).toBe(true);

    const second = first.restart();
    expect(second).not.toBe(first);
    expect(second.destroyed).toBe(false);
    (document.querySelector('button') as HTMLButtonElement).click();
    expect(document.querySelector('#out')?.textContent).toBe('Updated');
    second.destroy();
  });

  it('hydrates and destroys typed-text effects with the root lifecycle', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = '<span data-uif="typed-text" data-uif-strings=\'["Alpha","Beta"]\'>Fallback</span>';
    const root = document.body;
    const app = start(root);
    const typed = root.querySelector<HTMLElement>('[data-uif="typed-text"]')!;

    expect(typed.textContent).toBe('Alpha');
    expect(typed.classList.contains('uif-typed-text')).toBe(true);
    app.destroy();
    expect(typed.classList.contains('uif-typed-text')).toBe(false);
  });

  it('mounts newly added registered components during a partial refresh', () => {
    document.body.innerHTML = '<main id="target"></main>';
    const mount = vi.fn();
    const destroy = vi.fn();
    const unregister = registerRuntimeComponent({
      name: 'runtime-test',
      mount({ element }) {
        mount(element);
        return { destroy };
      },
    });
    const app = start(document.body);
    const target = document.querySelector<HTMLElement>('#target')!;
    target.innerHTML = '<section data-uif="runtime-test"></section>';
    app.refresh(target);
    app.refresh(target);
    expect(mount).toHaveBeenCalledTimes(1);
    expect(runtimeRegistry.get('runtime-test')).toBeDefined();
    app.destroy();
    expect(destroy).toHaveBeenCalledTimes(1);
    unregister();
  });
});
