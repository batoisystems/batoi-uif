# Batoi UIF Data Attribute Registry

This registry documents the stable declarative surface for Batoi UIF. Attributes are progressive-enhancement hooks: the underlying HTML should remain meaningful without JavaScript where practical.

## Common Attributes

| Attribute | Purpose | Notes |
| --- | --- | --- |
| `data-uif` | Declares the component or behavior. | Examples: `modal`, `form`, `ajax`, `chart`, `realtime`, `mobile-shell`, `ai-action`, `tool-approval`. |
| `data-uif-action` | Declares an action on a button, link, form, or row control. | Examples: `open`, `close`, `toggle`, `reload`, `delete`, `save`, `approve`, `reject`. |
| `data-uif-target` | Points to the affected element. | Supports CSS selectors plus framework helpers such as `self`, `parent`, and `closest:.selector` where supported. |
| `data-uif-src` | URL for AJAX, form, realtime, push, chart, or remote table data. | Server responses must be governed by the consuming app. |
| `data-uif-method` | HTTP method. | Defaults depend on package behavior; forms default to `POST`, RAD actions default to `GET`. |
| `data-uif-options` | JSON or compact option string. | Prefer JSON for public examples. |
| `data-uif-confirm` | Confirmation prompt before a guarded action. | Confirmation is client-side UX, not authorization. |
| `data-uif-state` | Runtime state marker. | Common values include `idle`, `loading`, `loaded`, `error`, `empty`, `submitting`, `success`. |
| `data-uif-swap` | HTML swap mode for server-rendered partials. | Supported modes: `inner`, `outer`, `append`, `prepend`, `before`, `after`. |

## Component Values

| `data-uif` value | Package | Expected element | Primary behavior |
| --- | --- | --- | --- |
| `button` | `@batoi/uif-components` | `button`, `a` | Button state and declarative action hooks. |
| `modal` | `@batoi/uif-components` | Dialog container | ARIA dialog role, open/close, Escape close, focus behavior. |
| `drawer` | `@batoi/uif-components` | Drawer container | Side-panel open/close behavior. |
| `dropdown` | `@batoi/uif-components` | Menu container | Toggle, outside click close, Escape close. |
| `tabs` | `@batoi/uif-components` | Tab group container | ARIA tabs and panel state. |
| `toast` | `@batoi/uif-components` | Toast region/item | Dismiss and status behavior. |
| `accordion` | `@batoi/uif-components` | Accordion container | Disclosure state management. |
| `table` | `@batoi/uif-table` | `table` | Sorting, filtering, remote rows, selection, row actions. |
| `form` | `@batoi/uif-forms` | `form` | Validation, async submission, error summary, accessible field errors. |
| `ajax` | `@batoi/uif-rad-adapter` | `button`, `a`, `form` | Server-rendered partial load and swap. |
| `route` | `@batoi/uif-router` | `a`, route container | Same-origin partial routing. |
| `chart` | `@batoi/uif-charts` | `div`, chart host | Dependency-free SVG chart rendering. |
| `realtime` | `@batoi/uif-realtime` | Region/controller | SSE, WebSocket, or polling feed updates. |
| `push` | `@batoi/uif-push` | Button/control | Push subscription helpers. |
| `install-prompt` | `@batoi/uif-pwa` | Button/control | PWA install prompt. |
| `mobile-shell` | `@batoi/uif-mobile` | App shell container | Mobile shell, sheets, swipe actions, pull-to-refresh hooks. |
| `ai-action` | `@batoi/uif-ai` | Region | Browser-side AI interaction UI only. |
| `tool-approval` | `@batoi/uif-mcp` | Region | Browser-side tool approval UI only. |

## Forms

| Attribute | Purpose |
| --- | --- |
| `data-uif-rule` | Pipe-separated validation rules such as `required`, `email`, `number`, `integer`, `min:1`, `max:10`, `minLength:3`, `maxLength:50`, `pattern:...`, `sameAs:fieldName`. |
| `data-uif-validate` | Set to `false` to skip client validation. |
| `data-uif-validate-async` | Names a registered async validation rule. |

Malformed `pattern` expressions are handled as validation failures rather than runtime crashes.

## Charts

| Attribute | Purpose |
| --- | --- |
| `data-uif-chart` | Chart type such as `line`, `bar`, `donut`, `pie`, `radar`, `sparkline`, `histogram`, `box-plot`, `scatter`, `regression`, `control-chart`, or `pareto`. |
| `data-uif-data` | Inline JSON chart data. |
| `data-uif-src` | Remote chart data URL. |
| `data-uif-chart-export` | Export button format: `svg`, `png`, or `csv`. |
| `data-uif-chart-target` | Export/drilldown target selector. |
| `data-uif-drilldown` | Enables chart drilldown behavior. |

## Security Boundary

Most UIF renderers now render dynamic text through text nodes. Server-rendered HTML swaps are intentionally supported for RAD and route-like scenarios, but those responses are a trusted server boundary.

Use server-side authorization, escaping, content security policy, and audit logging for privileged workflows. Browser-side AI/MCP packages render approval and status UI only; they must not execute privileged tools directly.
