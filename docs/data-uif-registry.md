# Batoi UIF Data Attribute Registry

This registry documents the stable declarative surface for Batoi UIF. Attributes are progressive-enhancement hooks: the underlying HTML should remain meaningful without JavaScript where practical.

## Common Attributes

| Attribute | Purpose | Notes |
| --- | --- | --- |
| `data-uif` | Declares the component or behavior. | Examples: `modal`, `form`, `editor`, `ajax`, `chart`, `animate`, `realtime`, `mobile-shell`, `ai-action`, `tool-approval`. |
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
| `offcanvas` | `@batoi/uif-components` | Off-canvas container | Alias/equivalent for drawer-style viewport-edge panels. |
| `dropdown` | `@batoi/uif-components` | Menu container | Toggle, outside click close, Escape close. |
| `tooltip` | `@batoi/uif-components` | Trigger element | Text-safe hover/focus help surface with `role="tooltip"` and `aria-describedby`. |
| `popover` | `@batoi/uif-components` | Trigger/panel container | Click-triggered floating panel for richer contextual content. |
| `tabs` | `@batoi/uif-components` | Tab group container | ARIA tabs and panel state. |
| `toast` | `@batoi/uif-components` | Toast region/item | Dismiss and status behavior. |
| `accordion` | `@batoi/uif-components` | Accordion container | Disclosure state management. |
| `table` | `@batoi/uif-table` | `table` | Sorting, filtering, remote rows, selection, row actions. |
| `form` | `@batoi/uif-forms` | `form` | Validation, async submission, error summary, accessible field errors. |
| `editor` | `@batoi/uif-editor` | `textarea`, `input`, editor host | Dependency-free HTML and Markdown editing with synchronized form field and preview. |
| `ajax` | `@batoi/uif-rad-adapter` | `button`, `a`, `form` | Server-rendered partial load and swap. |
| `route` | `@batoi/uif-router` | `a`, route container | Same-origin partial routing. |
| `shell` | `@batoi/uif-components` | Application shell container | Workspace shell state, sidebar collapse, density preference, active nav, skip target, and nested section disclosure. |
| `chart` | `@batoi/uif-charts` | `div`, chart host | Dependency-free SVG chart rendering. |
| `animate` | `@batoi/uif-effects` | Any element | Declarative animation presets with reduced-motion support. |
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

## Editors

| Attribute | Purpose |
| --- | --- |
| `data-uif="editor"` | Enhances a textarea/input into a rich HTML or Markdown editor. |
| `data-uif-mode` | Editor mode: `html`, `markdown`, or `plain`. |
| `data-uif-toolbar` | Space-separated toolbar commands such as `bold italic heading quote code ul ol task link image table preview source`. Link, image, and table open editor dialogs when triggered from the toolbar. |
| `data-uif-preview` | Preview mode: `none`, `manual`, or `live`. |
| `data-uif-editor-height` | Minimum editor surface height. |
| `data-uif-editor-layout` | Editor layout: `source`, `preview`, `split`, `tabs`, `modal`, or `drawer` where supported. |
| `data-uif-editor-status` | Shows or hides editor status text for words, characters, and dirty state. |
| `data-uif-placeholder` | Placeholder text for the enhanced editor surface. |
| `data-uif-required` | Marks an editor as required for browser-side validation feedback. |
| `data-uif-maxlength` | Maximum character count used by `validateEditor()`. |
| `data-uif-autosave` | When `true`, schedules autosave after editor changes. |
| `data-uif-autosave-delay` | Autosave debounce delay in milliseconds. |
| `data-uif-autosave-url` | Optional JSON POST endpoint for autosave; omit to use registered autosave hooks/events only. |

Markdown preview escapes raw HTML by default and supports a practical subset including headings, lists, task lists, tables, links, images, code blocks, blockquotes, strikethrough, and horizontal rules. Browser-side cleanup is not a substitute for server-side sanitization before trusted render or storage.

Editor command values can also be passed programmatically through `runEditorCommand(editor, command, value)`. Structured values are supported for links, images, and tables. Current command coverage includes `link-edit`, `link-remove`, `image-edit`, `image-remove`, `table-row-before`, `table-row-after`, `table-row-delete`, `table-col-before`, `table-col-after`, `table-col-delete`, `table-header-toggle`, and `table-delete`. Task lists support checkbox state synchronization plus Enter/Backspace continuation behavior in HTML and Markdown modes.

## Overlays

| Attribute | Purpose |
| --- | --- |
| `data-uif="modal"` | Enhances a dialog container. |
| `data-uif="drawer"` | Enhances a side-panel container. |
| `data-uif="offcanvas"` | Enhances a drawer-equivalent off-canvas container. |
| `data-uif="tooltip"` | Enhances a trigger element with text-safe hover/focus help. |
| `data-uif="popover"` | Enhances a trigger/panel container for contextual content. |
| `data-uif-placement` | Planned placement hint for floating overlays, such as `top`, `right`, `bottom`, `left`, or `auto`. |
| `data-uif-delay` | Planned tooltip/popover delay in milliseconds. |
| `data-uif-container` | Planned render container hint, such as `body`, `self`, or a selector. |
| `data-uif-html` | Defaults to `false`; tooltip content is text-safe by default. |
| `data-uif-backdrop` | Planned drawer/off-canvas backdrop mode: `true`, `false`, or `static`. |
| `data-uif-scroll` | Planned drawer/off-canvas body scroll policy. |
| `data-uif-breakpoint` | Planned responsive drawer/off-canvas breakpoint hint. |

Current tooltip content comes from `data-uif-message` or the trigger's `title` attribute. The title is removed after initialization and the generated tooltip panel is associated through `aria-describedby`.

`drawer` is the preferred UIF term for app and RAD side panels. `offcanvas` is supported as a Bootstrap migration alias for the same behavior.

## Workspace Shells

| Attribute | Purpose |
| --- | --- |
| `data-uif="shell"` | Enhances a server-rendered workspace shell. |
| `data-uif-route` | Names the current route so matching nav links can receive `aria-current="page"` and `is-active`. |
| `data-uif-sidebar-key` | Optional `localStorage` key for persisted sidebar collapsed/expanded state. |
| `data-uif-density-key` | Optional `localStorage` key for persisted density state. |
| `data-uif-density` | Initial density value, commonly `compact` or `comfortable`. |
| `data-uif-role="skip-link"` | Link that is pointed to the shell's main content region. |
| `data-uif-role="sidebar"` | Sidebar or product navigation region. |
| `data-uif-role="nav"` | Keyboard-enabled shell navigation region. |
| `data-uif-role="main"` | Main content region; receives an id and `tabindex="-1"` when needed. |
| `data-uif-action="toggle"` | Toggles the shell sidebar when targeted at the shell. |
| `data-uif-action="toggle-sidebar"` | Explicit sidebar toggle action. |
| `data-uif-action="toggle-section"` | Toggles the next section panel or the configured `data-uif-target`. |

Shell behavior is intentionally server-rendered friendly. The HTML remains meaningful without JavaScript, while UIF adds preference persistence, active navigation state, section disclosure, and safe rehydration after partial swaps.

## Animation and Event Actions

| Attribute | Purpose |
| --- | --- |
| `data-uif="animate"` | Runs an animation preset on load or configured trigger. |
| `data-uif-animation` | Animation name such as `fade-in`, `slide-up`, `scale-in`, `pop`, `pulse`, `shake`, or `highlight`. |
| `data-uif-duration` | Animation duration in milliseconds. |
| `data-uif-delay` | Animation delay in milliseconds. |
| `data-uif-repeat` | Optional animation repeat count. |
| `data-uif-easing` | Optional CSS timing function override. |
| `data-uif-once` | Runs an animation trigger once unless set to `false`. |
| `data-uif-event` | Event name for safe declarative action binding, optionally with modifiers such as `click.prevent`. |
| `data-uif-on` | JSON event/action map for multiple declarative bindings. |
| `data-uif-actions` | JSON action chain for ordered multi-step interactions. |
| `data-uif-confirm` | Confirmation prompt shown before an action or chain runs. |
| `data-uif-if` | Simple condition selector; action runs only when the selector matches. Use `!selector` for inverse, `online`, or `offline`. |
| `data-uif-class` | Class name used by class actions. |
| `data-uif-attribute` | Attribute name used by attribute actions. |
| `data-uif-key` | Keyboard filter for declarative keyboard actions. |

Supported event modifiers include `prevent`, `stop`, `once`, `self`, `outside`, `debounce:ms`, `throttle:ms`, and common keyboard filters such as `enter`, `escape`, and `space`.

Built-in safe actions include `show`, `hide`, `toggle`, `animate`, `add-class`, `remove-class`, `toggle-class`, `set-attribute`, `remove-attribute`, `toggle-attribute`, `set-value`, `set-text`, `set-html-safe`, `toggle-state`, `copy`, `scroll-to`, `focus`, `submit`, `reset`, and `emit`.

Event actions never evaluate inline JavaScript. Only registered action names can run.

Developer diagnostics are available through `getActionDiagnostics()` and `uif:action-diagnostic` events. Missing targets, unknown action names, and invalid JSON action specs are reported without throwing runtime crashes.

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
