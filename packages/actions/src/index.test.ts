import { describe, expect, it, vi } from 'vitest';
import { bindActions, dispatchAction, dispatchActions, getActionDiagnostics, parseActionSpec, registerAction, resolveActionTarget, unregisterAction } from './index.js';

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

  it('uses the central safe HTML renderer for set-html-safe', async () => {
    document.body.innerHTML = '<section id="target"></section><button></button>';
    await dispatchAction('set-html-safe', {
      source: document.querySelector('button') as HTMLElement,
      target: document.querySelector('#target') as HTMLElement,
      value: '<strong onclick="alert(1)">Safe</strong><a href="javascript:alert(1)">Link</a><script>alert(1)</script>',
    });
    const target = document.querySelector('#target') as HTMLElement;
    expect(target.querySelector('script')).toBeNull();
    expect(target.querySelector('strong')?.hasAttribute('onclick')).toBe(false);
    expect(target.querySelector('a')?.hasAttribute('href')).toBe(false);
    expect(target.textContent).toContain('SafeLink');
  });

  it('parses and dispatches action chains', async () => {
    document.body.innerHTML = '<button data-uif-event="click.prevent" data-uif-actions=\'[{"action":"chain-a"},{"action":"chain-b","value":"done"}]\'></button>';
    const calls: string[] = [];
    registerAction('chain-a', () => calls.push('a'));
    registerAction('chain-b', ({ value }) => calls.push(value ?? ''));
    const spec = parseActionSpec(document.querySelector('button') as HTMLElement)[0];
    expect(spec.chain).toHaveLength(2);
    await dispatchActions(spec.chain ?? [], { source: document.querySelector('button') as HTMLElement, target: null });
    expect(calls).toEqual(['a', 'done']);
    unregisterAction('chain-a');
    unregisterAction('chain-b');
  });

  it('binds action chains, confirmation, conditions, params, and aria sync', () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    document.body.innerHTML = '<input id="gate" checked type="checkbox"><section id="panel"></section><button data-uif-event="click.prevent" data-uif-confirm="Proceed?" data-uif-if="#gate:checked" data-uif-actions=\'[{"action":"toggle-class","target":"#panel","class":"is-open"}]\'>Run</button>';
    const dispose = bindActions(document);
    const button = document.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(document.querySelector('#panel')?.classList.contains('is-open')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    dispose();
  });

  it('reports diagnostics for missing targets and unknown actions', async () => {
    const button = document.createElement('button');
    document.body.append(button);
    await dispatchActions([{ event: 'click', action: 'missing-action', target: '#missing' }], { source: button, target: null });
    expect(getActionDiagnostics().some((item) => item.message.includes('Unknown action'))).toBe(true);
    expect(getActionDiagnostics().some((item) => item.message.includes('Missing target'))).toBe(true);
  });
});
