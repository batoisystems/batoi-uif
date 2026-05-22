# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Direction

Batoi UIF, the Unified Interface Framework, is the frontend foundation for Batoi RAD and a future open-source framework for server-rendered, progressive, mobile-ready, real-time, AI-enabled web applications.

The target architecture is a modular, browser-native framework with:

- TypeScript source.
- Plain JavaScript and CSS distribution output.
- npm workspaces.
- Zero runtime dependencies in all framework packages.
- Declarative `data-uif-*` behavior.
- RAD-native partial updates, forms, component rehydration, and server-mediated AI/MCP tool approval flows.

The repository has been migrated from the earlier pnpm/JavaScript scaffold to npm workspaces and TypeScript package source. Keep future implementation aligned with that direction.

## Dependency Policy

Framework packages under `packages/*` must remain dependency-free at runtime.

Allowed runtime foundations:

- HTML
- CSS
- JavaScript
- SVG
- Standard browser APIs

Do not add runtime dependencies such as Bootstrap, jQuery, Chart.js, D3, ECharts, ApexCharts, Highcharts, Animate.css, Tailwind, React, Vue, Angular, Axios, Lodash, Moment, or any third-party UI, charting, animation, AJAX, or state library.

Allowed development tools include npm workspaces, TypeScript, tsup or an equivalent small bundler, Vite for docs/playground, Vitest, ESLint, and Prettier. These tools must not ship as browser runtime dependencies.

## Target Package Map

Core framework packages:

- `packages/core` for initialization, lifecycle events, plugin registry, and option parsing.
- `packages/css` for reset, tokens, utilities, themes, and component CSS.
- `packages/dom` for DOM helpers, mounting, auto-initialization, observers, target resolution, and component registry.
- `packages/net` for native `fetch` helpers, form submission, upload, timeouts, interceptors, and normalized errors.
- `packages/state` for a small store and declarative bindings.
- `packages/forms` for validation, async submission, and accessible error rendering.
- `packages/router` for lightweight route behavior.
- `packages/components` for dependency-free UI components.
- `packages/rad-adapter` for Batoi RAD partial HTML, content swaps, action binding, and rehydration.

Application capability packages:

- `packages/charts` for SVG-first charts and dashboard visuals.
- `packages/realtime` for SSE, WebSocket, and polling modes.
- `packages/push` for push subscription helpers and in-app notifications.
- `packages/mobile` for mobile shell, bottom navigation, sheet modal, offline banner, and safe-area utilities.
- `packages/pwa` for service worker, install prompt, online/offline, and cache strategy helpers.
- `packages/ai` for browser-side AI interaction UI.
- `packages/mcp` for browser-side MCP approval, progress, result, and audit UI.

Apps and examples:

- `apps/docs` for documentation.
- `apps/playground` for interactive examples.
- `examples/rad-crud`, `examples/rad-dashboard`, `examples/mobile-shell`, `examples/realtime-feed`, and `examples/ai-tool-approval` for static or mock integration demos.

## `data-uif-*` Contract

Favor declarative, progressive-enhancement behavior. Important attributes include:

- `data-uif`
- `data-uif-action`
- `data-uif-target`
- `data-uif-src`
- `data-uif-method`
- `data-uif-options`
- `data-uif-confirm`
- `data-uif-loading`
- `data-uif-success`
- `data-uif-error`
- `data-uif-swap`
- `data-uif-validate`
- `data-uif-rule`
- `data-uif-bind`
- `data-uif-model`
- `data-uif-refresh`

Expected v1 `data-uif` values include `button`, `modal`, `drawer`, `dropdown`, `tabs`, `toast`, `accordion`, `table`, `form`, `ajax`, `route`, `shell`, `nav`, `chart`, `realtime`, `push`, `mobile-shell`, `ai-action`, and `tool-approval`.

## AI and MCP Boundaries

Browser-side AI and MCP packages must be UI-only. They may render launchers, approval cards, progress states, results, streaming surfaces, and audit trails. They must not execute privileged tools directly.

Keep these operations server-side in Batoi RAD or another governed backend:

- database access
- file writes
- GitHub commits
- deployment
- email sending
- payment actions
- MCP server invocation
- credential handling
- tool permissions
- audit logging

## Commands

Target commands after the npm workspace migration:

```bash
npm install
npm run lint
npm test
npm run build
npm run dev:docs
npm run dev:playground
```

Use npm consistently. Do not reintroduce pnpm workspace metadata or a second package-manager lockfile.

Before handing off code changes, run the narrowest relevant checks first. For shared package changes, prefer lint and tests; run the full build when exports, package boundaries, docs, playground, examples, or bundling behavior changed.

## Coding Conventions

- Use TypeScript strict mode for new or migrated framework source.
- Emit plain JavaScript and CSS for browser distribution.
- Keep package APIs small, typed, and stable.
- Prefer browser APIs over helper libraries.
- Use CSS custom properties and plain CSS for theming.
- Use SVG for charts.
- Keep components accessible by default, including ARIA, focus management, keyboard behavior, and reduced-motion awareness.
- Make polling a first-class realtime fallback because some RAD deployments may run on shared hosting.
- Rehydrate components after RAD partial swaps.
- Add focused Vitest coverage for behavior changes.
- Avoid unrelated formatting churn.

## Local-Only Planning Notes

Use `specs/` for local implementation plans, investigation notes, QA notes, and temporary working documents. This directory is intentionally ignored by Git and must not be committed or synced to GitHub.

Keep `specs/` content factual and task-scoped. Do not store secrets, credentials, production data, or copied private customer data there.

## Git Hygiene

- Do not commit `specs/` content.
- Do not revert user changes unless explicitly asked.
- Keep changes scoped to the requested task.
- If generated files or build outputs appear, confirm they are expected before including them.
