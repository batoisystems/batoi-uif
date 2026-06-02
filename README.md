# Batoi UIF — Unified Interface Framework

Batoi UIF is a dependency-free frontend application interface framework for server-rendered, progressive, mobile-ready, real-time, AI-enabled web applications.

It is designed as the frontend foundation for Batoi RAD and as a future open-source framework for HTML-first applications that need app-like behavior without shipping a large runtime stack.

> Status: **v0 experimental**

## Browser Distribution

Batoi UIF is available as plain JavaScript and CSS files for direct use in server-rendered apps, Batoi RAD apps, PHP apps, and static HTML pages. No TypeScript, bundler, jQuery, Bootstrap, Tailwind, React, Vue, or other runtime library is required in the consuming application.

Build output:

```text
dist/uif.esm.js
dist/uif.iife.js
dist/uif.css
```

ES module usage:

```html
<link rel="stylesheet" href="/assets/uif/uif.css">
<script type="module" src="/assets/uif/uif.esm.js"></script>
```

Classic script usage:

```html
<link rel="stylesheet" href="/assets/uif/uif.css">
<script src="/assets/uif/uif.iife.js"></script>
<script>BatoiUIF.autoStart();</script>
```

For PHP, RAD, and other server-rendered pages, `BatoiUIF.autoStart()` initializes common `data-uif` components, forms, editors, tables, charts, icons, animations, event actions, RAD AJAX actions, realtime regions, push controls, mobile shells, AI actions, and MCP approval widgets without a bundler.

The same distribution files can also power **Micro Apps**: self-contained, client-only applications built with static HTML, Batoi UIF CSS/JS, browser APIs, and optional local persistence. Import the ES module from `dist/uif.esm.js`, use `createMicroAppStore()` for local persistence, undo/redo, reset, and JSON import/export, and render charts/icons/components directly in static HTML.

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

## Source Model

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
- `@batoi/uif-icons` for first-party dependency-free SVG icons and declarative icon mounting.
- `@batoi/uif-state` for small state stores and declarative bindings.
- `@batoi/uif-forms` for validation, async submission, and accessible error rendering.
- `@batoi/uif-router` for lightweight route behavior.
- `@batoi/uif-pwa` for service worker, install prompt, online/offline, and cache helpers.
- `@batoi/uif-components` for dependency-free components such as buttons, modals, drawers/off-canvas panels, dropdowns, tooltips, popovers, tabs, toasts, accordions, cards, command menus, nav, and tables.
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

Supported core chart types include `line`, `area`, `bar`, `horizontal-bar`, `grouped-bar`, `stacked-bar`, `pie`, `donut`, `doughnut`, `radar`, and `sparkline`. Compact app charts include `metric`, `progress`, `ring`, `gauge`, `timeline`, `heatmap`, and `bullet`. Statistical visualizations include `histogram`, `box-plot`, `scatter`, `regression`, `control-chart`, `distribution`, and `pareto`, backed by dependency-free helpers such as `summaryStats()`, `histogramBins()`, `movingAverage()`, `linearRegression()`, and `correlation()`.

Open `examples/index.html` for a landing page that links to every bundled example. See `examples/component-gallery/` for live component examples with copy-ready markup, including professional app patterns such as button matrices, toolbars, form sections, skeletons, metric rows, hero banners, summaries, inspectors, stat cards, empty states, filter builders, command palettes, notification panels, and native picker wrappers. See `examples/chart-gallery/` for one declarative example of every supported chart type. See `examples/rich-editor/`, `examples/markdown-editor/`, `examples/animation-gallery/`, and `examples/event-actions/` for builder-style examples where users can tune options, preview behavior, and copy generated code. See `examples/professional-showcase/` for a richer product-grade app surface with a fixed shell, KPI dashboard, CRM pipeline, governed AI approval desk, mobile field console, RAD admin table, and statistical analytics using the same lean JS/CSS library.

Reference docs:

- `docs/data-uif-registry.md` lists the canonical declarative `data-uif-*` surface.
- `docs/security.md` explains the trusted HTML boundary, safe text rendering, and AI/MCP server-side governance model.

### Micro App

```html
<link rel="stylesheet" href="./dist/uif.css">
<script type="module">
  import { createMicroAppStore, initChart, mountIcons } from './dist/uif.esm.js';

  const store = createMicroAppStore(
    { tasks: [{ label: 'Ship demo', done: false }] },
    { persist: 'local', key: 'demo-micro-app' }
  );

  store.push('tasks', { label: 'Export JSON', done: false });
  console.log(store.exportJSON());
</script>
```

See `examples/micro-app-dashboard/` for a copy-ready static Micro App with local persistence, undo/redo, reset, JSON import/export, icons, and charts.

### Rich HTML and Markdown editor

```html
<textarea
  name="body"
  data-uif="editor"
  data-uif-mode="html"
  data-uif-toolbar="undo redo bold italic strike heading quote code ul ol task link image table preview source"
  data-uif-editor-status="true"
  data-uif-required="true"
  data-uif-autosave="true"
  data-uif-autosave-delay="1200">
  <h2>Draft</h2><p>Edit rich text.</p>
</textarea>
```

```html
<textarea name="notes" data-uif="editor" data-uif-mode="markdown" data-uif-preview="live" data-uif-editor-layout="split">
# Markdown draft

**Batoi UIF** renders a safe preview.
</textarea>
```

The editor package is dependency-free and keeps the original form field synchronized. Rich HTML mode includes WYSIWYG dialogs for links, images, and tables, table row/column tools, task-list keyboard behavior, source view, and editor-managed undo/redo. Markdown preview escapes raw HTML by default and supports layouts such as `source`, `preview`, `split`, `tabs`, `modal`, and `drawer`, plus a practical subset including tables, task lists, images, links, strikethrough, code blocks, and blockquotes. Editor hooks such as `registerEditorHook("autosave", handler)`, `registerEditorHook("validate", handler)`, and `registerEditorHook("uploadImage", handler)` provide integration points without shipping upload or storage authority to the browser. Treat browser-side cleanup as convenience only; sanitize and authorize HTML on the server before trusted rendering or storage.

### Declarative animation and event actions

```html
<button
  data-uif-event="click"
  data-uif-action="animate"
  data-uif-target="#panel"
  data-uif-animation="pop">
  Animate
</button>

<section id="panel" class="uif-card">Panel</section>
```

```html
<button
  data-uif-event="click"
  data-uif-action="toggle-class"
  data-uif-target="#panel"
  data-uif-class="is-expanded">
  Toggle
</button>
```

Event actions use registered action names only. Batoi UIF does not evaluate inline JavaScript from attributes.

Action chains can express multi-step interactions without inline scripts:

```html
<button
  data-uif-event="click.prevent"
  data-uif-confirm="Toggle this panel?"
  data-uif-if="#panel"
  data-uif-actions='[
    {"action":"toggle-class","target":"#panel","class":"is-expanded"},
    {"action":"animate","target":"#panel","value":"highlight"}
  ]'>
  Toggle and highlight
</button>
```

### Dependency-free SVG icon

```html
<button class="uif-btn">
  <span data-uif-icon="plus" aria-hidden="true"></span>
  New record
</button>
```

`BatoiUIF.autoStart()` hydrates `[data-uif-icon]` placeholders into inline SVG. Icons use `currentColor`, the `.uif-icon` CSS primitive, and no icon font or third-party runtime package. Use `data-uif-icon-title` when an icon itself needs an accessible name.

Multi-series charts use a compact `values` contract:

```html
<div
  data-uif="chart"
  data-uif-chart="grouped-bar"
  data-uif-options='{"legend":true}'
  data-uif-data='[
    {"label":"Jan","values":{"New":120,"Renewal":80}},
    {"label":"Feb","values":{"New":140,"Renewal":90}}
  ]'>
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
- `data-uif-icon`
- `data-uif-icon-title`
- `data-uif-icon-size`
- `data-uif-icon-class`
- `data-uif-icon-hidden`

Expected v1 `data-uif` values include `button`, `modal`, `drawer`, `offcanvas`, `dropdown`, `tooltip`, `popover`, `tabs`, `toast`, `accordion`, `table`, `form`, `ajax`, `route`, `shell`, `nav`, `chart`, `realtime`, `push`, `mobile-shell`, `ai-action`, and `tool-approval`.

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
- v0.3 components: modal, drawer/off-canvas, dropdown, tooltip, popover, tabs, toast, accordion, card, nav, table.
- v0.4 charts/dashboard: SVG-first chart package and dashboard example.
- v0.5 realtime/push/mobile: SSE, WebSocket, polling fallback, notifications, mobile shell.
- v0.6 AI/MCP UI: action cards, approval cards, progress/result UI, audit trail, server-mediated flows.
- v1.0 stable public release: hardened APIs, complete docs, browser QA, accessibility pass, and open-source release readiness.

## License

Apache-2.0.
