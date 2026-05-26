import { describe, expect, it, vi } from 'vitest';
import { bindActions, dispatchAction, parseActionSpec, registerAction, resolveActionTarget, unregisterAction } from './index.js';

describe('@batoi/uif-actions', () => {
  it('resolves common targets', () => {
    document.body.innerHTML = '<section id="x"><button></button></section>';
    const button = document.querySelector('button') as HTMLElement;
    expect(resolveActionTarget(button, '#x')?.id).toBe('x');
    expect(resolveActionTarget(button, 'parent')?.id).toBe('x');
    expect(resolveActionTarget(button, 'self')).toBe(button);
  });

  it('parses simple and structured action specs', () => {
    document.body.innerHTML = '<button data-uif-event="click.prevent" data-uif-action="toggle"></button><button id="b" data-uif-on=\'{"keydown.enter":{"action":"submit","target":"#f"}}\'></button>';
    expect(parseActionSpec(document.querySelector('button') as HTMLElement)[0]).toMatchObject({ event: 'click', action: 'toggle', prevent: true });
    expect(parseActionSpec(document.querySelector('#b') as HTMLElement)[0]).toMatchObject({ event: 'keydown', key: 'enter', action: 'submit' });
  });

  it('dispatches registered actions through event binding', () => {
    document.body.innerHTML = '<button data-uif-event="click" data-uif-action="test-action"></button>';
    const handler = vi.fn();
    registerAction('test-action', handler);
    const dispose = bindActions(document);
    (document.querySelector('button') as HTMLButtonElement).click();
    expect(handler).toHaveBeenCalledOnce();
    dispose();
    unregisterAction('test-action');
  });

  it('dispatches actions directly', async () => {
    const handler = vi.fn();
    registerAction('direct-test', handler);
    await dispatchAction('direct-test', { source: document.createElement('button'), target: null });
    expect(handler).toHaveBeenCalledOnce();
    unregisterAction('direct-test');
  });
});
