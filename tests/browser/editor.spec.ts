import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/editor.html');
  await expect(page.locator('.uif-editor')).toHaveCount(2);
});

test('toggles selected rich formatting and preserves semantic blocks', async ({ page }) => {
  await page.evaluate(() => {
    const surface = document.querySelector<HTMLElement>('.uif-editor-surface')!;
    surface.focus();
    const text = surface.querySelector('strong')!.firstChild!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    surface.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
  const bold = page.locator('[data-uif-editor-command="bold"]').first();
  await bold.click();
  await expect(page.locator('.uif-editor-surface strong')).toHaveCount(0);
  await bold.click();
  await expect(page.locator('.uif-editor-surface strong')).toHaveText('Beta');

  await page.evaluate(() => {
    const item = document.querySelector<HTMLLIElement>('.uif-editor-surface li')!;
    item.closest<HTMLElement>('.uif-editor-surface')!.focus();
    const range = document.createRange();
    range.setStart(item.firstChild!, 5);
    range.collapse(true);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.locator('.uif-editor-surface').press('Enter');
  await expect(page.locator('.uif-editor-surface li')).toHaveCount(2);
});

test('reports and normalizes unsafe HTML source edits', async ({ page }) => {
  const rich = page.locator('.uif-editor').first();
  await rich.locator('[data-uif-editor-command="source"]').click();
  const source = rich.locator('textarea.uif-editor-source');
  await source.fill('<p onclick="bad()">Draft</p><script>alert(1)</script>');
  await expect(rich.locator('.uif-editor-status')).toContainText('1 issue');
  await rich.locator('[data-uif-editor-command="source"]').click();
  await expect(rich.locator('.uif-editor-surface')).toHaveJSProperty('innerHTML', '<p>Draft</p>');
});

test('navigates and pastes a safe rectangular grid in rich tables', async ({ page }) => {
  const surface = page.locator('.uif-editor-surface');
  await page.evaluate(() => {
    const cell = document.querySelector<HTMLTableCellElement>('.uif-editor-surface td')!;
    cell.closest<HTMLElement>('.uif-editor-surface')!.focus();
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(true);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => {
    const node = document.getSelection()?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    return element?.closest('td')?.textContent;
  })).toBe('B');
  await page.evaluate(() => {
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: new DataTransfer() });
    event.clipboardData?.setData('text/plain', 'X\t<script>bad()</script>\nY\tZ');
    document.querySelector('.uif-editor-surface')?.dispatchEvent(event);
  });
  await expect(surface.locator('tr')).toHaveCount(2);
  await expect(surface.locator('script')).toHaveCount(0);
  await expect(surface.locator('td').last()).toHaveText('Z');
});

test('keeps command dialogs keyboard-contained on narrow and desktop viewports', async ({ page }) => {
  const rich = page.locator('.uif-editor').first();
  await rich.locator('[data-uif-editor-command="link"]').click();
  const dialog = page.locator('.uif-editor-dialog');
  await expect(dialog.locator('input').first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator('button[type="submit"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(rich.locator('[data-uif-editor-command="link"]')).toBeFocused();
});

test('synchronizes native form reset after rich edits', async ({ page }) => {
  const rich = page.locator('.uif-editor').first();
  await rich.locator('[data-uif-editor-command="source"]').click();
  await rich.locator('textarea.uif-editor-source').fill('<p>Changed</p>');
  await rich.locator('[data-uif-editor-command="source"]').click();
  await expect(rich.locator('.uif-editor-surface')).toHaveText('Changed');

  await page.evaluate(() => document.querySelector<HTMLFormElement>('#rich-form')?.reset());

  await expect(rich.locator('.uif-editor-surface p').first()).toContainText('Alpha Beta');
  await expect(rich.locator('.uif-editor-status')).toContainText('Clean');
});
