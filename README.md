# Batoi UIF — Unified Interface Framework

Batoi UIF is a dependency-free frontend application interface framework for server-rendered, progressive, mobile-ready, real-time, AI-enabled web applications.

It is designed as the frontend foundation for Batoi RAD and as a future open-source framework for HTML-first applications that need app-like behavior without shipping a large runtime stack.

> Status: **v0 experimental**

## Positioning

Batoi UIF is not a Bootstrap clone, a jQuery replacement, a React/Vue/Angular competitor, a Chart.js replacement, or a native mobile framework.

It is a modular, browser-native interface foundation for RAD-built applications:

- HTML-first, JavaScript-enhanced
- Zero runtime dependencies
- Server-rendering friendly
- Progressive and mobile-first
- Token-driven and themeable
- Accessible by default
- Real-time and push-ready
- AI/MCP interface-ready
- RAD-native

## Dependency Policy

Framework packages under `packages/*` must not depend on external runtime libraries. Browser-facing output should use only HTML, CSS, JavaScript, SVG, and standard browser APIs.

Do not add runtime dependencies such as Bootstrap, jQuery, Chart.js, D3, ECharts, ApexCharts, Highcharts, Animate.css, Tailwind, React, Vue, Angular, Axios, Lodash, Moment, or third-party runtime UI, charting, animation, AJAX, or state packages.

Development tools are allowed for building, testing, linting, formatting, documentation, and packaging. The target toolchain is npm workspaces, TypeScript, tsup or equivalent small bundler, Vite for docs/playground, Vitest, ESLint, and Prettier.

## Source and Distribution

The target implementation uses TypeScript as framework source and distributes plain JavaScript and CSS:

```text
dist/
  uif.esm.js
  uif.iife.js
  uif.css
```

Batoi RAD applications should not need TypeScript. They should consume the built browser assets:

```html
<link rel="stylesheet" href="/assets/uif/uif.css">
<script type="module" src="/assets/uif/uif.esm.js"></script>
```

or:

```html
<link rel="stylesheet" href="/assets/uif/uif.css">
<script src="/assets/uif/uif.iife.js"></script>
```

## Current Repository Note

This repository contains the experimental v0 scaffold implemented as npm workspaces with TypeScript package source and plain JavaScript/CSS distribution targets. The implementation is intentionally compact while the APIs, examples, and package boundaries stabilize.

## Target Packages

Core framework packages:

- `@batoi/uif-core` for initialization, lifecycle events, plugin registry, and option parsing.
- `@batoi/uif-css` for reset, tokens, utilities, themes, and component CSS.
- `@batoi/uif-dom` for DOM helpers, target resolution, mounting, auto-init, observers, and component registry.
- `@batoi/uif-net` for native `fetch` helpers, form submission, upload, timeout, interceptors, and normalized errors.
- `@batoi/uif-state` for small state stores and declarative bindings.
- `@batoi/uif-forms` for validation, async submission, and accessible error rendering.
- `@batoi/uif-router` for lightweight route behavior.
- `@batoi/uif-pwa` for service worker, install prompt, online/offline, and cache helpers.
- `@batoi/uif-components` for dependency-free components such as buttons, modals, drawers, dropdowns, tabs, toasts, accordions, cards, nav, and tables.
- `@batoi/uif-rad-adapter` for Batoi RAD partial updates, content swaps, action binding, and rehydration.

Planned application capability packages:

- `@batoi/uif-charts` for SVG-first charts and dashboard visuals.
- `@batoi/uif-realtime` for SSE, WebSocket, and polling modes.
- `@batoi/uif-push` for push subscription helpers and in-app notifications.
- `@batoi/uif-mobile` for mobile shell, bottom navigation, sheet modal, offline banner, and safe-area utilities.
- `@batoi/uif-ai` for browser-side AI interaction UI.
- `@batoi/uif-mcp` for browser-side MCP approval, progress, result, and audit UI.

## Quick Examples

### RAD list reload

```html
<button data-uif="ajax" data-uif-action="reload" data-uif-src="/customers/list" data-uif-target="#list">
  Reload
</button>
<div id="list"></div>
```

### RAD modal form

```html
<form data-uif="form" data-uif-src="/customer/save" data-uif-method="POST" data-uif-target="#modal-body">
  <input name="email" data-uif-rule="required|email">
  <button type="submit">Save</button>
</form>
```

### RAD delete confirm

```html
<button
  data-uif="ajax"
  data-uif-action="delete"
  data-uif-confirm="Delete record?"
  data-uif-src="/customer/delete/12">
  Delete
</button>
```

### Dependency-free chart

```html
<div
  data-uif="chart"
  data-uif-chart="bar"
  data-uif-data='[{"label":"Jan","value":120},{"label":"Feb","value":180}]'>
</div>
```

### Realtime feed with polling fallback

```html
<div
  data-uif="realtime"
  data-uif-channel="workspace:123"
  data-uif-src="/events/workspace/123"
  data-uif-mode="poll"
  data-uif-target="#activity-feed">
</div>
```

### Server-mediated AI tool approval

```html
<div
  data-uif="tool-approval"
  data-uif-tool="create_database"
  data-uif-risk="high"
  data-uif-src="/api/ai/tools/approval">
</div>
```

AI and MCP UI packages must not execute privileged tools directly in the browser. They render UI and send approval or action requests to governed server APIs.

## `data-uif-*` Attributes

Important attributes include:

- `data-uif`
- `data-uif-id`
- `data-uif-role`
- `data-uif-action`
- `data-uif-target`
- `data-uif-src`
- `data-uif-method`
- `data-uif-trigger`
- `data-uif-state`
- `data-uif-bind`
- `data-uif-model`
- `data-uif-options`
- `data-uif-confirm`
- `data-uif-loading`
- `data-uif-success`
- `data-uif-error`
- `data-uif-swap`
- `data-uif-validate`
- `data-uif-rule`
- `data-uif-refresh`

Expected v1 `data-uif` values include `button`, `modal`, `drawer`, `dropdown`, `tabs`, `toast`, `accordion`, `table`, `form`, `ajax`, `route`, `shell`, `nav`, `chart`, `realtime`, `push`, `mobile-shell`, `ai-action`, and `tool-approval`.

## Development

Target setup after the npm workspace migration:

```bash
npm install
npm run lint
npm test
npm run build
npm run dev:docs
npm run dev:playground
```

If working before that migration is complete, use the currently available workspace scripts in the repository and avoid mixing package-manager lockfiles.

## Implementation Milestones

- v0.1 foundation: npm workspaces, TypeScript source, core, CSS, DOM, net, forms, baseline tests.
- v0.2 RAD adapter: partial updates, content swap, confirmation, loading states, JSON response handling, rehydration.
- v0.3 components: modal, drawer, dropdown, tabs, toast, accordion, card, nav, table.
- v0.4 charts/dashboard: SVG-first chart package and dashboard example.
- v0.5 realtime/push/mobile: SSE, WebSocket, polling fallback, notifications, mobile shell.
- v0.6 AI/MCP UI: action cards, approval cards, progress/result UI, audit trail, server-mediated flows.
- v1.0 stable public release: hardened APIs, complete docs, browser QA, accessibility pass, and open-source release readiness.

## License

Apache-2.0.
