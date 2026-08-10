# Batoi UIF v2 to v3 Migration

Version 2.6 and later provide a diagnostic compatibility entry point that keeps v2 behavior active while reporting constructs that strict v3 mode will reject.

```ts
import { core, components } from '@batoi/uif-profiles/compatibility';

core.configureDiagnostics({
  enabled: true,
  handle(diagnostic) {
    console.warn(diagnostic.code, diagnostic.component, diagnostic.phase);
  },
});
```

The compatibility entry configures `diagnostic` mode as an import side effect. Existing direct package imports remain supported. After the application has removed reported legacy behavior, enable the strict boundary explicitly:

```ts
import { configureCompatibility } from '@batoi/uif-core';

configureCompatibility({ mode: 'v3' });
```

## Migration checklist

- Replace semicolon-delimited `data-uif-options` with JSON objects.
- Replace pipe-delimited typed-text strings with JSON arrays.
- Register exact origin and path capabilities for every intentional cross-origin request; markup cannot grant a capability.
- Configure application, tenant, and principal storage partitions before persisting preferences or Micro App state, and clear the active partition during sign-out.
- Configure locale hooks and verify logical-direction layouts in both LTR and RTL.
- Treat unknown Agent Interaction Envelope versions and incomplete tool reviews as unavailable; refresh them from the governed server.
- Move production imports from the all-in-one compatibility bundle to the smallest package or curated profile that expresses the application purpose.

No v2 API is removed by the diagnostic build. A removal remains blocked until its replacement, diagnostic, documentation, compatibility baseline, and tests are present.

The canonical migration-rule table is generated from `uifMigrationRules` in the [generated contract reference](generated/contracts.md#migration-rules). Component accessibility and security acceptance notes are generated there from the same typed definitions.
