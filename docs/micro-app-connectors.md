# Micro App Connector Workflows

Batoi UIF Micro Apps can declare local and remote connectors in their manifest, then load them with the dependency-free connector helpers from `@batoi/uif-net`.

## Manifest Pattern

```js
import { listMicroAppConnectorWorkflows, parseMicroAppManifest } from './dist/uif.esm.js';

const manifest = parseMicroAppManifest({
  name: 'Operations Board',
  type: 'micro-app',
  storage: { mode: 'local-first', localStore: 'localstorage' },
  realtime: { enabled: false },
  connectors: [
    { type: 'static', name: 'Seed data', mode: 'readonly' },
    { type: 'json', name: 'Task feed', mode: 'readonly', src: './tasks.json' },
  ],
  permissions: { storage: true, network: ['self'] },
});

const workflows = listMicroAppConnectorWorkflows(manifest);
```

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
- Treat connector data as untrusted input until the app validates it.
