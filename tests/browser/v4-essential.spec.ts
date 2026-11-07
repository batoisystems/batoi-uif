import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { arch, cpus, platform } from 'node:os';

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
