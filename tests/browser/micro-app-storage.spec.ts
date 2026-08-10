import { expect, test } from '@playwright/test';

test('persists and transactionally upgrades bounded Micro App IndexedDB data', async ({ page }) => {
  await page.goto('/tests/browser/editor.html');
  const result = await page.evaluate(async () => {
    const { createLocalStore } = await import('/packages/state/src/index.ts');
    const namespace = `browser-storage-${Date.now()}`;
    const first = createLocalStore({ namespace, driver: 'indexeddb', version: 1, maxEntries: 3 });
    await first.set('draft', { title: 'Plan' });
    const before = await first.get('draft');
    const upgraded = createLocalStore({
      namespace,
      driver: 'indexeddb',
      version: 2,
      maxEntries: 3,
      migrate({ store, oldVersion, newVersion }) {
        store.put(JSON.stringify({ oldVersion, newVersion }), 'migration');
      },
    });
    const migration = await upgraded.get('migration');
    await upgraded.importJSON('{"layout":{"columns":2}}');
    return { before, migration, entries: await upgraded.list() };
  });
  expect(result.before).toEqual({ title: 'Plan' });
  expect(result.migration).toEqual({ oldVersion: 1, newVersion: 2 });
  expect(result.entries).toEqual([{ key: 'layout', value: { columns: 2 } }]);
});
