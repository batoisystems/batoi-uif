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
