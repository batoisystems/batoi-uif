import { expect, test } from '@playwright/test';

test('persists, completes, and undoes a Micro App task journey', async ({ page }) => {
  await page.goto('/examples/micro-app-dashboard/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator('#save-state')).toContainText('Saved locally');
  await expect(page.locator('#open-count')).toHaveText('2');
  await page.getByLabel('Task label').fill('Acceptance task');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByText('Acceptance task')).toBeVisible();
  await expect(page.locator('#open-count')).toHaveText('3');
  await expect(page.locator('#high-count')).toHaveText('1');

  await page.reload();
  await expect(page.getByText('Acceptance task')).toBeVisible();
  await page.getByLabel('Toggle Acceptance task').check();
  await expect(page.locator('#done-count')).toHaveText('2');
  await expect(page.locator('#high-count')).toHaveText('0');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByLabel('Toggle Acceptance task')).not.toBeChecked();
  await expect(page.locator('#open-count')).toHaveText('3');
  await expect(page.locator('#json-state')).toHaveValue(/Acceptance task/);
});

test('retries and flushes principal-owned PWA work in a real browser', async ({ page }) => {
  await page.goto('/examples/mobile-pwa/');

  const result = await page.evaluate(async () => {
    const uif = await import('/dist/uif.esm.js');
    uif.clearOfflineQueue();
    const events: Array<{ type: string; detail: Record<string, unknown> }> = [];
    for (const type of ['uif:offline-queued', 'uif:offline-error', 'uif:offline-synced']) {
      window.addEventListener(type, (event) => events.push({
        type,
        detail: { ...(event as CustomEvent<Record<string, unknown>>).detail },
      }));
    }

    let fieldAttempts = 0;
    uif.queueOfflineTask(async () => {
      fieldAttempts += 1;
      if (fieldAttempts === 1) throw new Error('offline');
    }, { idempotent: true, key: 'job-a12', owner: 'field-user-1', maxAttempts: 2 });
    uif.queueOfflineTask(async () => undefined, {
      idempotent: true,
      key: 'job-other',
      owner: 'field-user-2',
    });

    uif.showOfflineBanner('Offline · 2 changes queued');
    const bannerRole = document.querySelector('.uif-offline-banner')?.getAttribute('role');
    await uif.flushOfflineQueue('field-user-1');
    await uif.flushOfflineQueue('field-user-1');
    await uif.flushOfflineQueue('field-user-2');
    uif.hideOfflineBanner();

    return {
      bannerRole,
      bannerRemoved: !document.querySelector('.uif-offline-banner'),
      events: events.map(({ type, detail }) => ({
        type,
        key: detail.key,
        owner: detail.owner,
        retrying: detail.retrying,
      })),
      fieldAttempts,
    };
  });

  expect(result).toEqual({
    bannerRole: 'status',
    bannerRemoved: true,
    fieldAttempts: 2,
    events: [
      { type: 'uif:offline-queued', key: 'job-a12', owner: 'field-user-1', retrying: undefined },
      { type: 'uif:offline-queued', key: 'job-other', owner: 'field-user-2', retrying: undefined },
      { type: 'uif:offline-error', key: 'job-a12', owner: undefined, retrying: true },
      { type: 'uif:offline-synced', key: 'job-a12', owner: undefined, retrying: undefined },
      { type: 'uif:offline-synced', key: 'job-other', owner: undefined, retrying: undefined },
    ],
  });
});

test('submits a one-shot governed tool decision through a same-origin gateway', async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  let csrfToken: string | undefined;
  await page.route('**/acceptance/agent/tools', async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    csrfToken = route.request().headers()['x-csrf-token'];
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        version: 3,
        kind: 'tool-progress',
        id: 'progress-acceptance-1',
        requestId: 'request-acceptance-1',
        status: 'executing',
        content: [{ type: 'text', text: 'Queued by governed server' }],
      }),
    });
  });
  await page.goto('/examples/ai-tool-approval/');

  const ui = await page.evaluate(async () => {
    const uif = await import('/dist/uif.esm.js');
    uif.configureCompatibility({ mode: 'v3' });
    const host = document.createElement('div');
    host.id = 'acceptance-review';
    document.body.append(host);
    const decisions: string[] = [];
    const replay: string[] = [];
    host.addEventListener('uif:tool-approve', () => decisions.push('approve'));
    host.addEventListener('uif:tool-replay-blocked', () => replay.push('blocked'));
    uif.renderToolReviewFlow(host, {
      tool: 'workspace.preview_change',
      requestId: 'request-acceptance-1',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      auditRef: 'audit-acceptance-1',
      risk: 'high',
      irreversible: false,
      payload: { workspace: 'acceptance', dryRun: true },
      policy: [{ label: 'Server authorization', state: 'pass' }],
    });
    const approve = host.querySelector<HTMLButtonElement>('[data-uif-action="approve"]')!;
    approve.click();
    approve.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const transport = uif.createGovernedToolTransport({
      src: '/acceptance/agent/tools',
      csrfToken: 'acceptance-csrf',
    });
    const envelope = await transport.submitDecision({
      requestId: 'request-acceptance-1',
      envelopeId: 'review-acceptance-1',
      decision: 'approve',
    });
    transport.cancel();
    return {
      decisions,
      replay,
      state: host.querySelector('.uif-tool-review')?.getAttribute('data-uif-state'),
      envelope: { id: envelope.id, kind: envelope.kind, status: envelope.status },
    };
  });

  expect(submitted).toEqual({
    requestId: 'request-acceptance-1',
    decision: 'approve',
    envelopeId: 'review-acceptance-1',
  });
  expect(csrfToken).toBe('acceptance-csrf');
  expect(ui).toEqual({
    decisions: ['approve'],
    replay: ['blocked'],
    state: 'decision-pending',
    envelope: { id: 'progress-acceptance-1', kind: 'tool-progress', status: 'executing' },
  });
});
