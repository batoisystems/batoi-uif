# Micro App Connector Workflows

Batoi UIF Micro Apps can declare local and remote connectors in their manifest, then load them with the dependency-free connector helpers from `@batoi/uif-net`.

## Manifest Pattern

```js
import { listMicroAppConnectorWorkflows, parseMicroAppManifest } from './dist/uif.esm.js';

const manifest = parseMicroAppManifest({
  name: 'Operations Board',
  type: 'micro-app',
  storage: { mode: 'local-first', localStore: 'indexeddb', namespace: 'operations-board' },
  realtime: { enabled: false },
  connectors: [
    { type: 'static', name: 'Seed data', mode: 'readonly' },
    { type: 'json', name: 'Task feed', mode: 'readonly', src: './tasks.json' },
  ],
  permissions: { storage: true, network: ['self'] },
});

const workflows = listMicroAppConnectorWorkflows(manifest);
```

The matching storage driver is versioned and transactional:

```js
import { createLocalStore } from './dist/uif.esm.js';

const store = createLocalStore({
  namespace: manifest.storage.namespace,
  driver: manifest.storage.localStore,
  version: 2,
  maxEntries: 1000,
  maxBytes: 1_000_000,
  migrate({ store, oldVersion }) {
    if (oldVersion < 2) store.put(JSON.stringify({ migrated: true }), 'migration-status');
  },
});
```

IndexedDB upgrades run in the browser's upgrade transaction. Imports validate all keys and values before atomically replacing an object store. Use these stores only for bounded, non-sensitive convenience data; they are not credential or authorization stores.

Local-first mutation queues can be governed by principal, expiry, capacity, and retry limits:

```js
const queue = createSyncQueue(store, 'sync-queue', {
  owner: session.principalRef,
  ttlMilliseconds: 24 * 60 * 60 * 1000,
  maxItems: 500,
  maxAttempts: 5,
});

await queue.enqueue('save-record', safePayload);
await queue.clearOwner(); // call during sign-out or principal rotation
```

Queue items support explicit `conflict` and `expired` states. `resolveConflict()` returns a conflicted item to `queued` only after the application supplies its chosen replacement payload. Ownership is a client-side partitioning safeguard, not authorization; the server must still authenticate and authorize every synchronization request.

## Runtime Loading

```js
import { loadConnector } from './dist/uif.esm.js';

const taskFeed = manifest.connectors.find((connector) => connector.name === 'Task feed');
const rows = taskFeed ? await loadConnector(taskFeed) : [];
```

## Rules

- `static` connectors are local and do not need network permission.
- Remote connectors are marked `allowed` only when their source matches `permissions.network`.
- Use `self` for same-origin connector URLs.
- Use explicit origins such as `https://data.example.com` for remote APIs.
- Wildcard network permissions are rejected. Applications may additionally enforce centrally registered origin, path-prefix, and context capabilities with `configureURLCapabilities()`.
- Treat connector data as untrusted input until the app validates it.
- Partition queued changes by principal, bound their lifetime and retries, and clear the principal's items during sign-out.
