# Roadmap

Batoi UIF is currently versioned `2.1.1`. The pre-2.0 milestones below are retained as implementation history, not current release targets.

## v2.1 release hardening

- Dependency-free npm workspace and TypeScript package architecture.
- Strong HTML and Markdown editors with deterministic commands and cross-browser tests.
- Governed RAD, network, realtime, PWA, push, persistence, AI, and MCP browser boundaries.
- Public API signatures, package tarballs, offline clean installation, artifact integrity, and bundle budgets enforced by the release gate.
- Status: implementation complete; release publication and deployed website synchronization remain operational release steps.

## Historical milestones

## v0.1 core foundation

- Monorepo scaffold, package boundaries, core lifecycle, DOM utilities, CSS tokens, and baseline tests.
- Status: implemented as the initial working scaffold.

## v0.2 RAD adapter stabilization

- Harden `loadPartial`, JSON/HTML response handling, loading indicators, confirm flows, and post-swap rehydration.
- Add browser QA against real Batoi RAD endpoints.
- Status: incorporated into v2.

## v0.3 component expansion

- Expand accessibility test coverage for modal focus trapping, dropdown dismissal, tabs keyboard navigation, drawers, toast timing, and accordions.
- Add additional server-rendered component patterns as needed.
- Status: incorporated into v2; accessibility coverage remains an ongoing release discipline.

## v0.4 docs/playground

- Convert the current static docs into a richer Vite documentation experience.
- Add runnable examples for each package and data-attribute contract.
- Status: incorporated into v2 docs, playground, and examples.

## v0.5 internal Batoi RAD pilot

- Validate UIF in real RAD CRUD, dashboard, mobile-shell, and partial-swap flows.
- Collect payload-size, accessibility, and browser-compatibility feedback.
- Status: superseded by the v2 release gate and deployment validation process.

## v1.0 stable public release

- Freeze public APIs, publish packages, add changelog/release automation, and document support policy.
- Status: superseded by the v2 package/API/integrity release process.
