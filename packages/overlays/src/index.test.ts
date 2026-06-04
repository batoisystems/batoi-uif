import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeOverlay, getOverlayStack, openOverlay, positionOverlay } from './index.js';

afterEach(async () => {
  while (getOverlayStack().length) {
    await closeOverlay(getOverlayStack().at(-1));
  }
  document.body.innerHTML = '';
  document.body.className = '';
  vi.unstubAllGlobals();
});

describe('overlays', () => {
  it('opens and closes overlays with stack tracking', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const el = document.createElement('div');
    el.hidden = true;
    document.body.append(el);
    await openOverlay(el, { modal: true });
    expect(getOverlayStack()).toEqual([el]);
    expect(el.hidden).toBe(false);
    await closeOverlay(el);
    expect(getOverlayStack()).toEqual([]);
    expect(el.hidden).toBe(true);
  });

  it('emits lifecycle events and keeps modal scroll lock until modal overlays close', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const events: string[] = [];
    const first = document.createElement('div');
    const second = document.createElement('div');
    first.hidden = true;
    second.hidden = true;
    document.body.append(first, second);
    first.addEventListener('uif:overlay-open', () => events.push('open'));
    first.addEventListener('uif:overlay-opened', () => events.push('opened'));
    first.addEventListener('uif:overlay-close', () => events.push('close'));
    first.addEventListener('uif:overlay-closed', () => events.push('closed'));

    await openOverlay(first, { modal: true });
    await openOverlay(second);
    expect(events).toEqual(['open', 'opened']);
    expect(document.body.classList.contains('uif-overlay-open')).toBe(true);

    await closeOverlay(second);
    expect(document.body.classList.contains('uif-overlay-open')).toBe(true);
    await closeOverlay(first);
    expect(events).toEqual(['open', 'opened', 'close', 'closed']);
    expect(document.body.classList.contains('uif-overlay-open')).toBe(false);
  });

  it('inerts background body children while modal overlays are active', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const main = document.createElement('main');
    const footer = document.createElement('footer');
    const modal = document.createElement('div');
    const nested = document.createElement('div');
    modal.hidden = true;
    nested.hidden = true;
    footer.setAttribute('aria-hidden', 'false');
    document.body.append(main, modal, footer, nested);

    await openOverlay(modal, { modal: true });
    expect(main.inert).toBe(true);
    expect(main.hasAttribute('inert')).toBe(true);
    expect(main.getAttribute('aria-hidden')).toBe('true');
    expect(footer.inert).toBe(true);
    expect(footer.getAttribute('aria-hidden')).toBe('true');
    expect(modal.inert).not.toBe(true);

    await openOverlay(nested);
    expect(nested.inert).not.toBe(true);

    await closeOverlay(nested);
    expect(main.inert).toBe(true);
    await closeOverlay(modal);
    expect(main.inert).not.toBe(true);
    expect(main.hasAttribute('inert')).toBe(false);
    expect(main.hasAttribute('aria-hidden')).toBe(false);
    expect(footer.inert).not.toBe(true);
    expect(footer.getAttribute('aria-hidden')).toBe('false');
  });

  it('allows modal overlays to opt out of inert background handling', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const main = document.createElement('main');
    const modal = document.createElement('div');
    modal.hidden = true;
    document.body.append(main, modal);

    await openOverlay(modal, { modal: true, inert: false });
    expect(document.body.classList.contains('uif-overlay-open')).toBe(true);
    expect(main.inert).not.toBe(true);
    expect(main.hasAttribute('aria-hidden')).toBe(false);

    await closeOverlay(modal);
    expect(document.body.classList.contains('uif-overlay-open')).toBe(false);
  });

  it('allows overlays to opt out of Escape dismissal', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const modal = document.createElement('div');
    modal.hidden = true;
    document.body.append(modal);

    await openOverlay(modal, { modal: true, closeOnEscape: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(getOverlayStack()).toContain(modal);
    expect(modal.hidden).toBe(false);

    await closeOverlay(modal);
    expect(modal.hidden).toBe(true);
  });

  it('inerts sibling branches when modal overlays are nested inside an app shell', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    document.body.innerHTML = `
      <main id="shell">
        <header id="topbar">Top</header>
        <section id="content">
          <button id="open">Open</button>
          <div id="modal" hidden><button>Close</button></div>
          <aside id="related">Related</aside>
        </section>
        <footer id="footer">Footer</footer>
      </main>`;
    const modal = document.querySelector<HTMLElement>('#modal') as HTMLElement;

    await openOverlay(modal, { modal: true });
    expect(document.querySelector<HTMLElement>('#shell')?.inert).not.toBe(true);
    expect(document.querySelector<HTMLElement>('#content')?.inert).not.toBe(true);
    expect(modal.inert).not.toBe(true);
    expect(document.querySelector<HTMLElement>('#topbar')?.inert).toBe(true);
    expect(document.querySelector<HTMLElement>('#topbar')?.hasAttribute('inert')).toBe(true);
    expect(document.querySelector<HTMLElement>('#footer')?.inert).toBe(true);
    expect(document.querySelector<HTMLElement>('#open')?.inert).toBe(true);
    expect(document.querySelector<HTMLElement>('#related')?.getAttribute('aria-hidden')).toBe('true');

    await closeOverlay(modal);
    expect(document.querySelector<HTMLElement>('#topbar')?.inert).not.toBe(true);
    expect(document.querySelector<HTMLElement>('#topbar')?.hasAttribute('inert')).toBe(false);
    expect(document.querySelector<HTMLElement>('#open')?.inert).not.toBe(true);
    expect(document.querySelector<HTMLElement>('#related')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('positions overlays with offsets and viewport fallback', () => {
    const anchor = document.createElement('button');
    const panel = document.createElement('div');
    document.body.append(anchor, panel);
    vi.stubGlobal('innerWidth', 320);
    vi.stubGlobal('innerHeight', 220);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      x: 260,
      y: 180,
      top: 180,
      right: 310,
      bottom: 210,
      left: 260,
      width: 50,
      height: 30,
      toJSON: () => ({}),
    });
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 100,
      height: 80,
      toJSON: () => ({}),
    });
    Object.defineProperties(panel, {
      offsetWidth: { configurable: true, value: 100 },
      offsetHeight: { configurable: true, value: 80 },
    });

    positionOverlay(anchor, panel, { placement: 'bottom-end', offset: 6 });
    expect(panel.dataset.uifPlacement).toBe('top-end');
    expect(Number.parseFloat(panel.style.top)).toBeLessThan(180);
    expect(Number.parseFloat(panel.style.left)).toBeLessThanOrEqual(212);
  });
});
