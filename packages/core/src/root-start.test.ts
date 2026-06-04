import { describe, expect, it, vi } from 'vitest';
import { registerAction, start, unregisterAction } from '../../../index.js';

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
});
