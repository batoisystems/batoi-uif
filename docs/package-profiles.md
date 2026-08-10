# Batoi UIF Package Profiles

Version 3 keeps small dependency-free framework packages while presenting six curated import profiles. Profiles are namespace re-exports: they do not initialize a second runtime, duplicate component registration, or change package security boundaries.

| Profile | Entry point | Intended use |
| --- | --- | --- |
| All | `@batoi/uif-profiles/all` | Tooling and applications that intentionally need the complete namespace surface |
| RAD | `@batoi/uif-profiles/rad` | Server-rendered RAD forms, tables, editors, routing, actions, and partial updates |
| Dashboard | `@batoi/uif-profiles/dashboard` | Charts, tables, state, widgets, and realtime operational views |
| Mobile | `@batoi/uif-profiles/mobile` | Mobile shells, PWA lifecycle, push, offline status, and realtime |
| Desktop | `@batoi/uif-profiles/desktop` | Desktop-style workspaces, resilient shell preferences, PWA, and realtime |
| Agent | `@batoi/uif-profiles/agent` | Provider-neutral assistant UI and governed tool review |

Use a profile when it clarifies application intent. Continue importing individual packages for the smallest production graph.

```ts
import { core, forms, radAdapter, table } from '@batoi/uif-profiles/rad';

core.configureCompatibility({ mode: 'v3' });
radAdapter.bindRadActions(document);
table.initDeclarativeFilters(document);
forms.initForm(document.querySelector('form[data-uif="form"]'));
```

Namespace exports prevent collisions between packages that intentionally expose similarly named helpers. The profile package contains no provider credentials, privileged execution, automatic global startup, or third-party runtime dependencies.

## Compatibility Packages

- `@batoi/uif-query` remains available as a v2 compatibility package. New DOM safety and target behavior belongs in `@batoi/uif-dom`; query does not grow a separate security model.
- Actions, effects, overlays, and components retain internal package boundaries. Application code may consume them together through the All profile while their direct imports remain supported.
- Dashboard, mobile, and desktop remain composition packages, not replacement runtimes.
- PWA and push retain separate implementation packages because installation/cache lifecycle and notification delivery have different browser permissions.
- AI and MCP remain separate packages because conversation presentation and privileged-tool review have distinct authority meanings. The Agent profile composes them over the shared envelope.

No v2 package is removed by introducing profiles. Any future removal requires compatibility diagnostics, a documented replacement, and a major-version migration entry.
