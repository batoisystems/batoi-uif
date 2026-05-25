import { describe, expect, it } from 'vitest';
import { createExtensionManifest, createExtensionMessage } from './index.js';

describe('extension kit', () => {
  it('creates a Manifest V3 shape', () => {
    expect(
      createExtensionManifest({
        name: 'Batoi Helper',
        surfaces: { popup: 'popup.html', sidePanel: 'side-panel.html', serviceWorker: 'worker.js' },
      }),
    ).toMatchObject({
      manifest_version: 3,
      action: { default_popup: 'popup.html' },
      side_panel: { default_path: 'side-panel.html' },
      background: { service_worker: 'worker.js', type: 'module' },
    });
  });

  it('creates typed messages', () => {
    expect(createExtensionMessage('sync', { force: true }, 'req-1')).toEqual({ type: 'sync', payload: { force: true }, requestId: 'req-1' });
  });
});
