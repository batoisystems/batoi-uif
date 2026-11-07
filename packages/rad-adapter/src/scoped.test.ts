import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindScopedRadActions } from './index.js';

const disposers: Array<() => void> = [];
afterEach(() => { disposers.splice(0).forEach((dispose) => dispose()); vi.unstubAllGlobals(); document.body.replaceChildren(); });

function fixture(response: unknown) {
  document.body.innerHTML = '<main><button data-uif="ajax" data-uif-src="/partial" data-uif-target="#target"><svg><path></path></svg>Load</button><section id="target">Original</section></main><aside id="foreign">Foreign</aside>';
  const root = document.querySelector('main')!;
  const error = vi.fn();
  const afterSwap = vi.fn();
  root.addEventListener('uif:rad-error', error);
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(response)));
  const dispose = bindScopedRadActions(root, { afterSwap });
  disposers.push(dispose);
  return { root, error, afterSwap, dispose, button: root.querySelector('button')! };
}

describe('selected application RAD binding', () => {
  it('rehydrates an empty inner response and supports SVG action descendants', async () => {
    const { root, afterSwap } = fixture({ html: '' });
    root.querySelector('path')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(afterSwap).toHaveBeenCalledOnce());
    expect(afterSwap).toHaveBeenCalledWith(root.querySelector('#target'));
    expect(root.querySelector('#target')!.textContent).toBe('');
  });

  it('checks response event/focus targets before applying any HTML', async () => {
    const { root, error, afterSwap, button } = fixture({ html: '<p>New</p>', events: [{ name: 'foreign-event', target: '#foreign' }] });
    const foreignEvent = vi.fn();
    document.querySelector('#foreign')!.addEventListener('foreign-event', foreignEvent);
    button.click();
    await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
    expect(root.querySelector('#target')!.textContent).toBe('Original');
    expect(afterSwap).not.toHaveBeenCalled();
    expect(foreignEvent).not.toHaveBeenCalled();
  });

  it('rejects declarative targets outside the app and replacing its owned root', async () => {
    const { root, button, error } = fixture({ html: 'Changed' });
    button.dataset.uifTarget = '#foreign'; button.click();
    await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(1));
    expect(document.querySelector('#foreign')!.textContent).toBe('Foreign');
    root.id = 'owned';
    button.dataset.uifTarget = '#owned'; button.dataset.uifSwap = 'outer'; button.click();
    await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(2));
    expect(root.isConnected).toBe(true);
    expect(root.querySelector('#target')!.textContent).toBe('Original');
  });

  it('cancels a detached active source when its app binding is destroyed', async () => {
    const { button, dispose, afterSwap, error } = fixture({});
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_url, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      signal = options?.signal ?? undefined;
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    button.click(); button.remove(); dispose();
    expect(signal?.aborted).toBe(true);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    await Promise.resolve();
    expect(afterSwap).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
