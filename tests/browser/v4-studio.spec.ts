import { expect, test } from '@playwright/test';
import { once } from 'node:events';
import { serveStudio } from '../../tools/theme/studio.mjs';
import { serveHTTP } from '../../tools/theme/server.mjs';
import type { Server } from 'node:http';
import AxeBuilder from '@axe-core/playwright';

let studio: Server;
let mcp: Server;
let url: string;
let mcpURL: string;
const token = 'development-test-token-not-a-production-credential';
test.beforeAll(async () => {
  studio = serveStudio({ port: 0 });
  mcp = serveHTTP({ port: 0, token });
  await Promise.all([once(studio, 'listening'), once(mcp, 'listening')]);
  url = `http://127.0.0.1:${(studio.address() as { port: number }).port}`;
  mcpURL = `http://127.0.0.1:${(mcp.address() as { port: number }).port}/mcp`;
});
test.afterAll(async () => {
  await Promise.all([new Promise<void>((resolve) => studio.close(() => resolve())), new Promise<void>((resolve) => mcp.close(() => resolve()))]);
});

test('private authoring transports reject foreign origins, missing authority and oversized input', async ({ request }) => {
  expect((await request.post(`${url}/build`, { data: {} })).status()).toBe(403);
  expect((await request.post(`${url}/build`, { headers: { Origin: 'https://untrusted.example' }, data: {} })).status()).toBe(403);
  expect((await request.get(`${url}/package.json`)).status()).toBe(404);
  expect((await request.post(`${url}/build`, { headers: { Origin: url, 'Content-Type': 'application/json' }, data: ' '.repeat(100001) })).status()).toBe(413);
  expect((await request.post(mcpURL, { data: {} })).status()).toBe(401);
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' };
  expect((await request.post(mcpURL, { headers: { ...headers, Origin: 'https://untrusted.example' }, data: {} })).status()).toBe(403);
  expect((await request.get(mcpURL, { headers })).status()).toBe(405);
  expect((await request.post(mcpURL, { headers, data: ' '.repeat(110001) })).status()).toBe(413);
  const initialized = await request.post(mcpURL, { headers, data: { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } } });
  expect((await initialized.json()).result.protocolVersion).toBe('2025-06-18');
  const discovered = await request.post(mcpURL, { headers, data: { jsonrpc: '2.0', id: 2, method: 'tools/list' } });
  expect((await discovered.json()).result.tools).toHaveLength(7);
  const notification = await request.post(mcpURL, { headers, data: { jsonrpc: '2.0', method: 'notifications/initialized' } });
  expect(notification.status()).toBe(202);
  expect(await notification.text()).toBe('');
});

test('studio uses the shared compiler, isolated responsive preview and validated export', async ({ page }) => {
  await page.goto(url);
  await expect(page.getByRole('status')).toContainText('Valid theme.');
  const frame = page.frameLocator('#preview');
  await expect(frame.getByRole('main')).toBeVisible();
  await page.getByLabel('Profile', { exact: true }).selectOption('mobile');
  await page.getByLabel('Mode', { exact: true }).selectOption('dark');
  await page.getByLabel('Direction', { exact: true }).selectOption('rtl');
  await expect(frame.locator('body')).toHaveAttribute('data-profile', 'mobile');
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(frame.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#preview')).toHaveAttribute('sandbox', 'allow-same-origin');
  // The preview intentionally prohibits scripts. Audit the studio chrome here;
  // standalone generated preview pages have their own light/dark/reflow scans.
  // Do not loosen sandbox/CSP just to permit axe's cross-frame messaging.
  const result = await new AxeBuilder({ page }).options({ iframes: false }).setLegacyMode(true).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
  const source = page.getByLabel('Theme JSON', { exact: true });
  const original = await source.inputValue();
  const previous = await page.locator('#preview').getAttribute('src');
  await source.fill('{"script":"not allowed"}');
  await page.getByRole('button', { name: 'Validate and preview' }).click();
  await expect(page.getByRole('status')).toContainText('Validation failed');
  await expect(page.locator('#preview')).toHaveAttribute('src', previous!);
  await source.fill(original);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export manifest' }).click();
  expect((await download).suggestedFilename()).toBe('uif.theme.json');
});
