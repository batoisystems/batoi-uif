import { afterEach, describe, expect, it, vi } from 'vitest';
import { startWeb } from './web.js';
import { startRAD } from './rad.js';
import { startMobile } from './mobile.js';
import { startDesktop } from './desktop.js';

const apps: Array<{ destroy(): void }> = [];
afterEach(() => { apps.splice(0).forEach((app) => app.destroy()); vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.replaceChildren(); });

describe('v4 selected production profiles', () => {
  it('mounts only the selected web controls', () => {
    document.body.innerHTML = '<main><div data-uif="drawer"><button>Action</button></div><form data-uif="form"></form></main>';
    const root = document.querySelector('main')!;
    const app = startWeb(root); apps.push(app);
    expect(root.querySelector('[data-uif="drawer"]')!.getAttribute('role')).toBe('dialog');
    expect(root.querySelector('form')!.dataset.uifState).toBeUndefined();
  });

  it('rehydrates existing component roots after governed RAD partial swaps', async () => {
    document.body.innerHTML = '<main><button data-uif="ajax" data-uif-src="/tabs" data-uif-target="#tabs">Load</button><div id="tabs" data-uif="tabs"><button data-uif-role="tab">Old</button><section data-uif-role="tabpanel">Old</section></div></main>';
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ html: '<button data-uif-role="tab">New</button><section data-uif-role="tabpanel">New</section>' })));
    const app = startRAD(document.querySelector('main')!); apps.push(app);
    document.querySelector('button')!.click();
    await vi.waitFor(() => expect(document.querySelector('[role="tab"]')!.textContent).toBe('New'));
    expect(document.querySelector('[role="tabpanel"]')!.getAttribute('aria-labelledby')).toBe(document.querySelector('[role="tab"]')!.id);
  });

  it('keeps mobile status root-scoped and removes connection listeners on teardown', () => {
    document.body.innerHTML = '<main data-uif="mobile-shell"><nav data-uif-role="bottom-nav"></nav><p data-uif="network-status"></p></main>';
    const online = vi.spyOn(navigator, 'onLine', 'get'); online.mockReturnValue(true);
    const app = startMobile(document.querySelector('main')!); apps.push(app);
    const status = document.querySelector('[role="status"]')!;
    expect(status.textContent).toBe('Online');
    online.mockReturnValue(false); window.dispatchEvent(new Event('offline'));
    expect(status.textContent).toBe('Offline');
    app.destroy(); online.mockReturnValue(true); window.dispatchEvent(new Event('online'));
    expect(status.textContent).toBe('Offline');
  });

  it('enhances server-rendered desktop navigation without replacing its markup', () => {
    document.body.innerHTML = '<div data-uif="desktop-shell"><nav><a href="/">Home</a></nav><main><p>Server content</p><span data-uif-offline-label></span></main></div>';
    const root = document.body.firstElementChild as HTMLElement;
    const content = root.querySelector('p');
    const app = startDesktop(root); apps.push(app);
    expect(root.querySelector('p')).toBe(content);
    expect(root.querySelector('[data-uif-offline-label]')!.textContent).toBe('Online');
    expect(root.querySelector('main')!.tabIndex).toBe(-1);
  });
});
