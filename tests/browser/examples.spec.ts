import { expect, test } from '@playwright/test';

test('Markdown builder exposes working preview layouts', async ({ page }) => {
  await page.goto('/examples/markdown-editor/');
  const editor = page.locator('#markdown-host .uif-editor');
  await expect(editor).toHaveCount(1);

  await page.getByRole('button', { name: 'Source', exact: true }).first().click();
  await expect(editor).toHaveAttribute('data-uif-editor-layout', 'source');
  await expect(editor.locator('.uif-editor-source')).toBeVisible();
  await expect(editor.locator('.uif-editor-preview')).toBeHidden();

  await page.getByRole('button', { name: 'Side by side' }).click();
  await expect(editor.locator('.uif-editor-source')).toBeVisible();
  await expect(editor.locator('.uif-editor-preview')).toBeVisible();

  await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
  await expect(editor.locator('.uif-editor-source')).toBeHidden();
  await expect(editor.locator('.uif-editor-preview')).toBeVisible();

  await page.getByRole('button', { name: 'Modal' }).click();
  await expect(page.locator('.uif-editor-preview-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Drawer' }).click();
  await expect(page.locator('.uif-editor-preview-drawer')).toBeVisible();
});

test('Markdown quote toolbar toggles selected lines', async ({ page }) => {
  await page.goto('/examples/markdown-editor/');
  await page.getByRole('button', { name: 'Source', exact: true }).first().click();
  const source = page.locator('#markdown-host textarea.uif-editor-source');
  await source.fill('Alpha\nBeta');
  await source.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(0, element.value.length));
  await page.locator('#markdown-host [data-uif-editor-command="quote"]').click();
  await expect(source).toHaveValue('> Alpha\n> Beta');
  await source.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(0, element.value.length));
  await page.locator('#markdown-host [data-uif-editor-command="quote"]').click();
  await expect(source).toHaveValue('Alpha\nBeta');
});

test('example pages use the UIF logo and shared navigation', async ({ page }) => {
  await page.goto('/examples/admin-workspace/');
  await expect(page.locator('.app-brand .example-uif-logo')).toHaveAttribute('alt', 'Batoi UIF');
  await expect(page.locator('.app-topbar nav a')).toHaveText(['All examples', 'Showcase', 'Components', 'Rich editor', 'Markdown']);
  await page.getByRole('link', { name: 'Markdown' }).click();
  await expect(page).toHaveURL(/\/examples\/markdown-editor\/$/);
  await expect(page.locator('.example-brand .example-uif-logo')).toBeVisible();
  await expect(page.locator('.example-topbar nav a[aria-current="page"]')).toHaveText('Markdown');
});

test('component gallery exposes complete interactive media and typed-text examples', async ({ page }) => {
  await page.goto('/examples/component-gallery/');

  const cards = page.locator('.component-card');
  await expect(page.locator('#component-count')).toHaveText(String(await cards.count()));
  await expect(page.locator('#multi-image-slider img')).toHaveCount(3);
  await expect(page.locator('#multi-image-slider [data-uif-role="status"]')).toHaveText('Slide 1 of 3');
  await page.locator('#multi-image-slider [data-uif-action="next"]').click();
  await expect(page.locator('#multi-image-slider [data-uif-role="status"]')).toHaveText('Slide 2 of 3');

  const responsiveCode = page.locator('.component-card').filter({ hasText: 'Responsive Shell' }).locator('pre code');
  await expect(responsiveCode).toContainText('Responsive content region.');
  await expect(responsiveCode).not.toContainText('...');
  await expect(page.locator('#typed-text [data-uif="typed-text"]')).toHaveClass(/uif-typed-text/);
  await expect(page.locator('#testimonial-slider [data-uif-role="slide"]')).toHaveCount(2);
});

test('icon gallery provides CSS usage and first-party brand icons', async ({ page }) => {
  await page.goto('/examples/icon-gallery/');
  await page.locator('#icon-category').selectOption('brand');

  await expect(page.locator('[data-icon-name="facebook"]')).toBeVisible();
  await expect(page.locator('[data-icon-name="x-twitter"]')).toBeVisible();
  const facebook = page.locator('[data-icon-name="facebook"]');
  await expect(facebook.locator('pre code').nth(1)).toContainText('[data-uif-icon="facebook"] .uif-icon');
  await expect(facebook.getByRole('button', { name: 'CSS' })).toBeVisible();
});
