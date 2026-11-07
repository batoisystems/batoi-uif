import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const profile of ['web', 'rad', 'mobile', 'desktop']) {
  test(`selected ${profile} no-build fixture works under a docs prefix and reflows in RTL`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/apps/docs/dist/examples/v4-${profile}/`);
    await expect(page.getByRole('main')).toBeVisible();
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('html').evaluate((el) => { el.dir = 'rtl'; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations).toEqual([]);
    }
  });
}

test('web combobox and drawer use the selected runtime without importing data engines', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/v4-web/');
  const owner = page.getByRole('combobox', { name: 'Owner', exact: true });
  await owner.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(owner).toHaveValue('Grace');
  await page.getByRole('button', { name: 'Open details' }).click();
  await expect(page.getByRole('dialog', { name: 'Details', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open details' })).toBeFocused();
});

test('RAD forms, remote rows and inner-swap rehydration use real same-origin fixture responses', async ({ page }) => {
  await page.goto('/apps/docs/dist/examples/v4-rad/');
  await expect(page.getByRole('cell', { name: 'Example record', exact: true })).toBeVisible();
  await page.getByLabel('Record name').fill('Demo record');
  await page.getByRole('button', { name: 'Save demo', exact: true }).click();
  await expect(page.locator('#save-result')).toContainText('No record was persisted');
  await page.getByRole('button', { name: 'Load partial', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Summary', exact: true })).toHaveText('Refreshed summary');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'History', exact: true })).toHaveText('Refreshed history');
});

test('mobile sheet owns focus and connection hint follows browser offline events', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/examples/v4-mobile/');
  await page.getByRole('button', { name: 'Open sheet', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Mobile details', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close sheet' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open sheet', exact: true })).toBeFocused();
  await context.setOffline(true);
  await expect(page.getByRole('status')).toHaveText('Offline');
  await context.setOffline(false);
  await expect(page.getByRole('status')).toHaveText('Online');
});

test('desktop density stays local to its selected application', async ({ page }) => {
  await page.goto('/examples/v4-desktop/');
  const shell = page.locator('[data-uif="desktop-shell"]');
  await page.getByRole('button', { name: 'Set compact density', exact: true }).click();
  await expect(shell).toHaveAttribute('data-uif-density', 'compact');
  expect(await page.locator('html').getAttribute('data-uif-density')).toBeNull();
  await page.getByRole('button', { name: 'Set default density', exact: true }).click();
  await expect(shell).toHaveAttribute('data-uif-density', 'default');
});
