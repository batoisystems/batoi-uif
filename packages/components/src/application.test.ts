import { describe, expect, it, vi } from 'vitest';
import { createUIF } from './application.js';
import { initTabs } from './controls/tabs.js';
import { initCombobox } from './controls/combobox.js';

describe('selective application ownership', () => {
  it('owns only registered components and cleans detached elements', () => {
    const root = document.createElement('main');
    root.innerHTML = '<div data-uif="tabs"><button data-uif-role="tab">One</button><div data-uif-role="tabpanel">One</div></div><div data-uif="modal"></div>';
    const app = createUIF(root, [{ name: 'tabs', init: initTabs }]);
    app.refresh();
    expect(root.querySelector('[role="tab"]')).not.toBeNull();
    expect(root.querySelector('[data-uif="modal"]')?.hasAttribute('role')).toBe(false);
    expect(() => createUIF(root)).toThrow(/overlap/);
    root.firstElementChild!.remove();
    app.refresh();
    app.destroy();
    expect(() => app.register({ name: 'tabs', init: initTabs })).toThrow(/destroyed/);
    createUIF(root).destroy();
  });

  it('does not mount a v4 component with malformed configuration', () => {
    const root = document.createElement('main');
    root.innerHTML = '<div data-uif="tabs" data-uif-options="legacy:true"><button data-uif-role="tab">One</button></div>';
    const app = createUIF(root, [{ name: 'tabs', init: initTabs }]);
    app.refresh();
    expect(root.querySelector('[role="tab"]')).toBeNull();
    app.destroy();
  });

  it('retires a changed component type and rejects cross-application actions', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    first.innerHTML = '<button data-uif-action="open" data-uif-target="#owned-second">Foreign</button><div data-uif="one"></div>';
    second.innerHTML = '<div id="owned-second" data-uif="one"></div>';
    document.body.append(first, second);
    const open = vi.fn();
    const destroy = vi.fn();
    const one = { name: 'one', init: () => ({ open, destroy }) };
    const changed = vi.fn(() => ({ destroy: vi.fn() }));
    const a = createUIF(first, [one, { name: 'two', init: changed }]);
    const b = createUIF(second, [one]);
    a.refresh(); b.refresh();
    first.querySelector('button')!.click();
    expect(open).not.toHaveBeenCalled();
    first.querySelector<HTMLElement>('[data-uif]')!.dataset.uif = 'two';
    a.refresh();
    expect(destroy).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenCalledOnce();
    a.destroy(); b.destroy(); first.remove(); second.remove();
  });

  it('supports keyboard combobox selection without moving input focus', () => {
    const root = document.createElement('div');
    root.innerHTML = '<input aria-label="Owner"><div data-uif-role="listbox"><button data-uif-role="option">Ada</button><button data-uif-role="option" disabled>Unavailable</button><button data-uif-role="option">Grace</button></div>';
    const controller = initCombobox(root);
    const input = root.querySelector('input')!;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(input.getAttribute('aria-activedescendant')).toBe(root.querySelector('[data-uif-role="option"]')?.id);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(input.value).toBe('Grace');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    controller.destroy();
  });
});
