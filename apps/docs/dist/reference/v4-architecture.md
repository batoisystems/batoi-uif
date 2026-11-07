# UIF 4 architecture and migration contract

Status: implementation in progress; the stable compatibility surface remains 3.1.

The v4 runtime mounts explicitly selected component definitions. Importing it does
not register the complete component catalog or start an application. The existing
root distribution and package facades remain available for compatibility.

The [capability/acceptance matrix](generated/v4-capabilities.md) separates the six
initial canonical controls from presentational adapters and compatibility features
whose v4 acceptance is still pending. It does not turn registered names or native
wrappers into unimplemented advanced engines.

## Entry points

- `@batoi/uif-core/runtime`: lifecycle, events and bounded configuration primitives.
- `@batoi/uif-core/registry`: explicit per-application component registration.
- `@batoi/uif-core/ownership`: application-root lifecycle leases (not authorization).
- `@batoi/uif-components/<component>`: an independently importable controller.
- `@batoi/uif-icons/runtime`: icon rendering with an explicitly supplied subset.
- CSS foundation and family exports: selected by a generated style manifest.
- `@batoi/uif-profiles/essential`: the common interactive web controls.

Optional agent, Micro App, migration, editor, chart and authoring metadata must
not enter the essential production graph. No framework package gains an external
runtime dependency. Build/authoring tools run separately from browser code.

## Compatibility

Keep the 3.1 root exports, selectors and event vocabulary during adoption. New
strict runtime configuration is application-owned; importing an entry must not
silently change another application's compatibility mode. Do not mount old and
new runtimes on the same subtree. Components retain a semantic HTML fallback.

The minimal `runtime` parser accepts bounded JSON objects only. The core facade
retains its explicitly configured legacy semicolon parser; importing the strict
entry does not change that setting. Invalid strict component options prevent a
mount rather than falling back to permissive parsing.

Use one UIF bundle/module graph per document. Strict application roots must be
nonoverlapping. A document-wide ownership marker rejects a second independently
bundled runtime while an application is active, even on a sibling root: otherwise
the two overlay stacks would disagree about focus and background ownership. For
staged adoption, the full compatibility bundle exports `startEssential` and
`createUIF` as well as `start`, sharing their internal graph. Mount old and selected
applications on separate sibling roots. Do not include `essential.js` alongside
the full bundle. This cooperative marker is a lifecycle guard, not a security
boundary against arbitrary scripts.

`app.refresh(target)` mounts new descendants, updates existing controllers and
retires detached/type-changed components. Use `app.rehydrate(target)` after
replacing the inner markup or configuration of an existing selected component:
it destroys controllers within the target before remounting them. `suspend` and
`resume` forward optional controller hooks. Targets must belong to the app root;
destroy before moving a root into another app or document. Destroy is idempotent
and releases the root for remounting. Tenant changes must also explicitly clear
application-owned state; a DOM refresh is not a tenant switch or a storage reset.

Visibility operations on the same element supersede one another. Cancellation
settles pending effects and clears their timers/frames; destroying an overlay is
synchronous and does not restore focus to a removed subtree. Only the top modal
owns Tab trapping, and an Escape already consumed by a child control does not
dismiss its parent. Hidden, inert and disabled controls are excluded from focus
selection; an empty dialog receives a programmatic focus target.

Token schema, theme-pack schema, runtime version and agent-envelope version are
independently versioned. Changes require explicit migration diagnostics and a
reviewed baseline; regenerating a baseline alone does not approve a break.

## Release evidence

Consumer fixtures count all transitive JavaScript, CSS and initial chunks. Report
raw, gzip and Brotli sizes with pinned settings. Browser benchmarks record the
machine/fixture and median/p95, not the minimum of a trivial smoke test.

The existing 3.1 release remains the immutable rollback reference. Alpha/beta/RC
and stable 4.0 publication require the release gates in the local implementation
plan; manual accessibility and host integration results cannot be inferred from
unit tests or mocked gateways.

## Conservative migration tooling

Run `npm run migrate -- page.html` for a read-only diagnostic and proposed edits.
Review the original/replacement strings, then optionally use
`npm run migrate -- page.html --apply <sourceHash>`. A changed source, unsafe or
duplicate key, ambiguous number, entity or template context prevents rewriting.
Application creates an exclusive `.uif-v3-backup-*` copy; never delete that backup
without the owner's approval. Restore the reviewed backup to roll back the edit.

Only static HTML legacy-option attributes are rewritten. JS/TS/PHP/template
sources can be inspected but require manual migration. Startup ownership, token
semantics, asset trust and tenant/storage identity cannot be inferred by a text
scanner and are never silently rewritten. Keep the 3.1 release artifacts available
for deployment rollback; adopt selected roots incrementally and run actual RADX
routes before replacing production assets. A JSON rewrite alone does not make
unknown option keys valid for the strict v4 canonical controls.
