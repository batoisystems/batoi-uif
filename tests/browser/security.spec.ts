import { expect, test } from '@playwright/test';

test('renders safe HTML under strict CSP and Trusted Types enforcement', async ({ page }) => {
  await page.goto('/tests/browser/security.html');
  const output = page.locator('#safe-output');
  await expect(output).toHaveAttribute('data-ready', 'true');
  await expect(output).toHaveText('Safe');
  await expect(output.locator('script')).toHaveCount(0);
  await expect(output.locator('[onclick]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __unsafe?: boolean }).__unsafe)).toBeUndefined();
  expect(await page.evaluate(() => (window as Window & { __uifSecurityViolations?: string[] }).__uifSecurityViolations ?? [])).toEqual([]);
});

test('enforces URL policy for browser-normalized destinations and document base URLs', async ({ page }) => {
  await page.goto('/tests/browser/security.html');
  await expect(page.locator('#safe-output')).toHaveAttribute('data-url-policy', JSON.stringify([false, false, false, false, false, false]));
  expect(await page.evaluate(() => (window as Window & { __uifSecurityViolations?: string[] }).__uifSecurityViolations ?? [])).toEqual([]);
});
