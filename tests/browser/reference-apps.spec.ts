import { expect, test } from '@playwright/test';

const referenceApps = [
  'rad-crud',
  'micro-app-dashboard',
  'rad-dashboard',
  'mobile-shell',
  'desktop-shell',
  'mobile-pwa',
  'ai-assisted-rad',
  'ai-tool-approval',
];

test('loads every canonical v3 reference application from server-rendered HTML', async ({ page }) => {
  test.setTimeout(90_000);
  for (const app of referenceApps) {
    const response = await page.goto(`/examples/${app}/`);
    expect(response?.ok(), app).toBe(true);
    await expect(page.locator('h1').first(), app).toBeVisible();
    await expect(page.locator('main').first(), app).toBeVisible();
  }
});
