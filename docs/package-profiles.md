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

For migration testing, `@batoi/uif-profiles/compatibility` re-exports the All namespaces and enables diagnostic mode while retaining v2 behavior. It is a migration build, not a seventh application profile. See [v2 to v3 Migration](v2-to-v3-migration.md).

```ts
import { core, forms, radAdapter, table } from '@batoi/uif-profiles/rad';

core.configureCompatibility({ mode: 'v3' });
radAdapter.bindRadActions(document);
table.initDeclarativeFilters(document);
forms.initForm(document.querySelector('form[data-uif="form"]'));
```

Namespace exports prevent collisions between packages that intentionally expose similarly named helpers. The profile package contains no provider credentials, privileged execution, automatic global startup, or third-party runtime dependencies.

## Consolidated Capability Groups

`uifCapabilityGroups` is the machine-readable authority for overlapping public surfaces. It identifies the packages that retain internal responsibility and the preferred consumer entry points for DOM, interaction, shell, and offline capabilities. Tooling can read it through `@batoi/uif-profiles`; the same data is included in the generated contract reference.

- DOM safety and target behavior grow in `@batoi/uif-dom`; Query remains a compatibility facade.
- Actions, effects, overlays, and components compose as the Interaction group without merging their internal ownership.
- Dashboard, mobile, and desktop use shared component lifecycle and shell primitives through their profiles.
- PWA, push, realtime, and state compose as the Offline group while retaining distinct permission boundaries.

## Compatibility Packages

- `@batoi/uif-query` remains available as a v2 compatibility package. New DOM safety and target behavior belongs in `@batoi/uif-dom`; query does not grow a separate security model.
- Actions, effects, overlays, and components retain internal package boundaries. Application code may consume them together through the All profile while their direct imports remain supported.
- Dashboard, mobile, and desktop remain composition packages, not replacement runtimes.
- PWA and push retain separate implementation packages because installation/cache lifecycle and notification delivery have different browser permissions.
- AI and MCP remain separate packages because conversation presentation and privileged-tool review have distinct authority meanings. The Agent profile composes them over the shared envelope.

No v2 package is removed by introducing profiles. Any future removal requires compatibility diagnostics, a documented replacement, and a major-version migration entry.
