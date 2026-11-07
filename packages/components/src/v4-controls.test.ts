import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUIF } from './application.js';
import { initModal } from './controls/modal.js';
import { initTabs } from './controls/tabs.js';
import { closeOverlay, getOverlayStack } from '@batoi/uif-overlays';

afterEach(async () => {
  while (getOverlayStack().length) await closeOverlay();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('v4 canonical control boundaries', () => {
  it('dismisses only the top modal and cleans background ownership on destroy', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = '<main><p id="background">Page</p><div id="first" data-uif="modal"><button>Outer</button><div id="second" data-uif="modal"><button>Inner</button></div></div></main>';
    const root = document.querySelector('main')!;
    const app = createUIF(root, [{ name: 'modal', init: initModal }]);
    app.refresh();
    const first = root.querySelector<HTMLElement>('#first')!;
    const second = root.querySelector<HTMLElement>('#second')!;
    root.insertAdjacentHTML('afterbegin', '<button data-uif-action="open" data-uif-target="#first">Open first</button><button data-uif-action="open" data-uif-target="#second">Open second</button>');
    root.querySelectorAll('button')[0].click();
    root.querySelectorAll('button')[1].click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(first.dataset.uifState).toBe('open');
    expect(second.dataset.uifState).toBe('closed');
    expect(getOverlayStack()).toEqual([first]);
    expect(document.body.classList.contains('uif-modal-open')).toBe(true);
    app.destroy();
    expect(getOverlayStack()).toEqual([]);
    expect(root.querySelector('#background')!.hasAttribute('inert')).toBe(false);
    expect(document.body.classList.contains('uif-modal-open')).toBe(false);
  });

  it('uses unique panel IDs, skips disabled tabs and does not steal focus on mount', () => {
    const markup = '<div data-uif="tabs"><div data-uif-role="tablist"><button data-uif-role="tab">First</button><button data-uif-role="tab" disabled>Disabled</button><button data-uif-role="tab">Last</button></div><section data-uif-role="tabpanel">First</section><section data-uif-role="tabpanel">Disabled</section><section data-uif-role="tabpanel">Last</section></div>';
    document.body.innerHTML = `<button id="opener">Outside</button><main>${markup}${markup}</main>`;
    document.querySelector<HTMLButtonElement>('#opener')!.focus();
    const app = createUIF(document.querySelector('main')!, [{ name: 'tabs', init: initTabs }]);
    app.refresh();
    expect(document.activeElement?.id).toBe('opener');
    const panels = Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    expect(new Set(panels.map((p) => p.id)).size).toBe(6);
    const first = document.querySelector<HTMLElement>('[role="tab"]')!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement?.textContent).toBe('Last');
    app.destroy();
  });
});
