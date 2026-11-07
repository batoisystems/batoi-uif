import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { arch, cpus, platform } from 'node:os';

test('built runtimes reject independent bundle copies but support staged sibling roots', async ({ page }) => {
  await page.goto('/tests/browser/v4-lifecycle.html');
  const result = await page.evaluate(async () => {
    const full = await import('/dist/index.js');
    const essential = await import('/dist/v4/essential.js');
    const first = document.createElement('section');
    const second = document.createElement('section');
    document.querySelector('main')!.append(first, second);
    const legacy = full.start(first);
    const selected = full.startEssential(second);
    let overlap = '';
    let independent = '';
    try { full.startEssential(first); } catch (error) { overlap = String(error); }
    const third = document.createElement('section');
    document.querySelector('main')!.append(third);
    try { essential.startEssential(third); } catch (error) { independent = String(error); }
    selected.destroy(); legacy.destroy();
    const remounted = essential.startEssential(third);
    remounted.destroy();
    return { overlap, independent, released: !Reflect.has(document, Symbol.for('batoi.uif.root-ownership.v4')) };
  });
  expect(result.overlap).toContain('overlap');
  expect(result.independent).toContain('runtime instance');
  expect(result.released).toBe(true);
});

test('rapid modal transitions preserve focus and child Escape does not dismiss the parent', async ({ page }) => {
  await page.goto('/tests/browser/v4-lifecycle.html');
  await page.evaluate(async () => {
    const { startEssential } = await import('/dist/v4/essential.js');
    const root = document.querySelector<HTMLElement>('main')!;
    root.insertAdjacentHTML('beforeend', '<button id="open" data-uif-action="open" data-uif-target="#dialog">Open</button><div id="dialog" data-uif="modal" hidden aria-label="Review"><div hidden><button>Hidden</button></div><div data-uif="dropdown"><button data-uif-role="trigger">Actions</button><div data-uif-role="panel" hidden><button role="menuitem">Edit</button></div></div><button data-uif-action="close" data-uif-target="#dialog">Close</button></div>');
    startEssential(root);
  });
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Actions', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Actions', exact: true })).toBeFocused();
  await page.evaluate(() => {
    document.querySelector<HTMLButtonElement>('#dialog > button')!.click();
    document.querySelector<HTMLButtonElement>('#open')!.click();
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  // A later task observes the old 180ms close deadline without suppressing motion.
  await expect.poll(() => page.evaluate(() => new Promise((resolve) => setTimeout(() => resolve(document.querySelector<HTMLElement>('#dialog')!.hidden), 250)))).toBe(false);
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeFocused();
});

test('built docs search, generated example and references work below a deployment prefix', async ({ page, request }) => {
  await page.goto('/apps/docs/dist/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Search documentation').fill('tenant/storage');
  await expect(page.locator('#installation')).toBeHidden();
  await page.getByLabel('Search documentation').fill('');
  await expect(page.locator('#installation')).toBeVisible();
  for (const path of ['reference/theme-authoring.md', 'reference/generated/theme.schema.json', 'dist/v4/theme/mobile.html']) expect((await request.get(`/apps/docs/dist/${path}`)).ok()).toBe(true);
  await page.getByRole('link', { name: 'Open the generated canonical example' }).click();
  await page.getByRole('button', { name: 'Open dialog' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('canonical essential controls support keyboard and dialog focus return', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/v4-essential/');
  await page.getByRole('button', { name: 'Open dialog' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open dialog' })).toBeFocused();
  await page.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Actions', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Edit record' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Actions', exact: true })).toBeFocused();
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('essential content reflows at 320px in RTL, reduced motion and forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/examples/v4-essential/');
  await page.locator('html').evaluate((node) => node.setAttribute('dir', 'rtl'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'History' })).toBeFocused();
});

for (const profile of ['web', 'mobile', 'desktop']) {
  test(`${profile} theme recipes support light/dark, RTL and 320px reflow`, async ({ page }) => {
    for (const mode of ['light', 'dark']) {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/dist/v4/theme/${profile}.html`);
        await page.locator('html').evaluate((node, themeMode) => { node.setAttribute('dir', 'rtl'); node.setAttribute('data-theme', themeMode); }, mode);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByRole('main')).toBeVisible();
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(result.violations, `${profile}/${mode}/${width}`).toEqual([]);
      }
    }
  });
}

test('reports median/p95 startup and subtree refresh, with 100 teardown cycles', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/v4-essential/');
  const report = await page.evaluate(async () => {
    const { startEssential } = await import('/dist/v4/essential.js');
    const host = document.createElement('div');
    document.body.append(host);
    const fixture = '<div data-uif="tabs"><div data-uif-role="tablist"><button data-uif-role="tab">One</button><button data-uif-role="tab">Two</button></div><div data-uif-role="tabpanel">One</div><div data-uif-role="tabpanel">Two</div></div>';
    const startup: number[] = [];
    const refresh: number[] = [];
    let mounted = 0;
    let destroyed = 0;
    host.addEventListener('uif:runtime:mounted', (event) => {
      mounted++;
      // Destroy events on removed nodes cannot bubble to the original host.
      (event.target as HTMLElement).addEventListener('uif:destroy', () => destroyed++, { once: true });
    });
    for (let cycle = 0; cycle < 100; cycle++) {
      host.innerHTML = fixture.repeat(100);
      const begin = performance.now();
      const app = startEssential(host);
      const initialized = performance.now();
      const subtree = document.createElement('div');
      subtree.innerHTML = fixture.repeat(20);
      host.replaceChildren(subtree);
      const swap = performance.now();
      app.refresh(subtree);
      const updated = performance.now();
      if (cycle >= 5) { startup.push(initialized - begin); refresh.push(updated - swap); }
      app.destroy();
    }
    host.remove();
    const summary = (values: number[]) => {
      values.sort((a, b) => a - b);
      return { samples: values.length, median: values[Math.floor(values.length / 2)], p95: values[Math.ceil(values.length * .95) - 1] };
    };
    return { startup: summary(startup), refresh: summary(refresh), mounted, destroyed, userAgent: navigator.userAgent, cpuThrottle: 'none', policy: '5 warmups; 95 measured samples; 100 tab groups then replacement with 20; lifecycle counts, not a heap-leak certificate' };
  });
  const evidence = { ...report, host: { platform: platform(), arch: arch(), cpu: cpus()[0]?.model, workers: testInfo.config.workers, project: testInfo.project.name }, caveat: 'Device/user-agent emulation is not a real mobile device or CPU throttle. Parallel-run figures are not controlled-lab certification.' };
  await testInfo.attach('v4-benchmark.json', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
  console.info('UIF4_BENCHMARK', JSON.stringify(evidence));
  expect(report.mounted).toBe(12000);
  expect(report.destroyed).toBe(report.mounted);
  // Coarse runaway guard; calibrated lab targets are reported, not fabricated.
  expect(report.startup.p95).toBeLessThan(1000);
  expect(report.refresh.p95).toBeLessThan(1000);
});
