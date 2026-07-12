# Batoi UIF Data Attribute Registry

This registry documents the stable declarative surface for Batoi UIF. Attributes are progressive-enhancement hooks: the underlying HTML should remain meaningful without JavaScript where practical.

## Common Attributes

| Attribute          | Purpose                                                          | Notes                                                                                                                      |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `data-uif`         | Declares the component or behavior.                              | Examples: `modal`, `form`, `editor`, `ajax`, `chart`, `animate`, `realtime`, `mobile-shell`, `ai-action`, `tool-approval`. |
| `data-uif-action`  | Declares an action on a button, link, form, or row control.      | Examples: `open`, `close`, `toggle`, `reload`, `delete`, `save`, `approve`, `reject`.                                      |
| `data-uif-target`  | Points to the affected element.                                  | Supports CSS selectors plus framework helpers such as `self`, `parent`, and `closest:.selector` where supported.           |
| `data-uif-src`     | URL for AJAX, form, realtime, push, chart, or remote table data. | Server responses must be governed by the consuming app.                                                                    |
| `data-uif-allow-cross-origin` | Explicitly permits a reviewed cross-origin source where supported. | Defaults to same-origin; CORS and server authorization still apply.                                                        |
| `data-uif-method`  | HTTP method.                                                     | Defaults depend on package behavior; forms default to `POST`, RAD actions default to `GET`.                                |
| `data-uif-options` | JSON or compact option string.                                   | Prefer JSON for public examples.                                                                                           |
| `data-uif-confirm` | Confirmation prompt before a guarded action.                     | Confirmation is client-side UX, not authorization.                                                                         |
| `data-uif-state`   | Runtime state marker.                                            | Common values include `idle`, `loading`, `loaded`, `error`, `empty`, `submitting`, `success`.                              |
| `data-uif-swap`    | HTML swap mode for server-rendered partials.                     | Supported modes: `inner`, `outer`, `append`, `prepend`, `before`, `after`.                                                 |

## Component Values

| `data-uif` value | Package                                 | Expected element                 | Primary behavior                                                                                                              |
| ---------------- | --------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `button`         | `@batoi/uif-components`                 | `button`, `a`                    | Button state and declarative action hooks.                                                                                    |
| `modal`          | `@batoi/uif-components`                 | Dialog container                 | ARIA dialog role, open/close, Escape close, static backdrop, focus behavior.                                                  |
| `drawer`         | `@batoi/uif-components`                 | Drawer container                 | Side-panel open/close behavior.                                                                                               |
| `offcanvas`      | `@batoi/uif-components`                 | Off-canvas container             | Alias/equivalent for drawer-style viewport-edge panels.                                                                       |
| `dropdown`       | `@batoi/uif-components`                 | Menu container                   | Toggle, outside click close, Escape close, ArrowUp/ArrowDown, Home/End, typeahead, separator roles, disabled item skipping.   |
| `carousel`       | `@batoi/uif-components`                 | Carousel region                  | Previous/next controls, direct slide indicators, ArrowLeft/ArrowRight keyboard navigation, slide state, and live status text. |
| `lightbox`       | `@batoi/uif-components`                 | Gallery region                   | Opens thumbnail items in a modal dialog, updates large image and caption, supports close plus previous/next navigation.       |
| `masonry`        | CSS utilities / `@batoi/uif-components` | Masonry container                | CSS-only responsive masonry layout for cards, figures, and images.                                                            |
| `tooltip`        | `@batoi/uif-components`                 | Trigger element                  | Text-safe hover/focus help surface with `role="tooltip"` and `aria-describedby`.                                              |
| `popover`        | `@batoi/uif-components`                 | Trigger/panel container          | Click-triggered floating panel for richer contextual content.                                                                 |
| `tabs`           | `@batoi/uif-components`                 | Tab group container              | ARIA tabs, panel state, Home/End navigation, vertical orientation, and optional manual activation.                            |
| `toast`          | `@batoi/uif-components`                 | Toast region/item                | Stacked status/alert notifications with placement, close control, and hover/focus pause.                                      |
| `accordion`      | `@batoi/uif-components`                 | Accordion container              | Disclosure state management.                                                                                                  |
| `table`          | `@batoi/uif-table`                      | `table`                          | Sorting, filtering, remote rows, selection, row actions.                                                                      |
| `form`           | `@batoi/uif-forms`                      | `form`                           | Validation, async submission, error summary, accessible field errors.                                                         |
| `editor`         | `@batoi/uif-editor`                     | `textarea`, `input`, editor host | Dependency-free HTML and Markdown editing with synchronized form field and preview.                                           |
| `ajax`           | `@batoi/uif-rad-adapter`                | `button`, `a`, `form`            | Server-rendered partial load and swap.                                                                                        |
| `route`          | `@batoi/uif-router`                     | `a`, route container             | Same-origin partial routing.                                                                                                  |
| `shell`          | `@batoi/uif-components`                 | Application shell container      | Workspace shell state, sidebar collapse, density preference, active nav, skip target, and nested section disclosure.          |
| `chart`          | `@batoi/uif-charts`                     | `div`, chart host                | Dependency-free SVG chart rendering.                                                                                          |
| `animate`        | `@batoi/uif-effects`                    | Any element                      | Declarative animation presets with reduced-motion support.                                                                    |
| `realtime`       | `@batoi/uif-realtime`                   | Region/controller                | SSE, WebSocket, or polling feed updates.                                                                                      |
| `push`           | `@batoi/uif-push`                       | Button/control                   | Push subscription helpers.                                                                                                    |
| `install-prompt` | `@batoi/uif-pwa`                        | Button/control                   | PWA install prompt.                                                                                                           |
| `mobile-shell`   | `@batoi/uif-mobile`                     | App shell container              | Owned mobile shell, sheet semantics, swipe/pull hooks, bottom navigation, and keyboard-accessible segmented controls.         |
| `ai-action`      | `@batoi/uif-ai`                         | Region                           | Browser-side AI interaction UI only.                                                                                          |
| `tool-approval`  | `@batoi/uif-mcp`                        | Region                           | Browser-side tool approval UI only.                                                                                           |

## Tables

| Attribute                                                             | Purpose                                                                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `data-uif="table"`                                                    | Enhances a native table with sorting, filtering, remote rows, selection, pagination, and actions.                            |
| `data-uif-mode`                                                       | Table behavior mode: `local`, `remote`, or `hybrid`. Defaults to `remote` when `data-uif-src` is present, otherwise `local`. |
| `data-uif-src`                                                        | Remote JSON or trusted HTML row endpoint.                                                                                    |
| `data-uif-allow-cross-origin`                                         | Explicitly permits an approved cross-origin remote table endpoint; same-origin is the default.                              |
| `data-uif-columns`                                                    | Comma-separated column keys used when remote JSON returns `rows`.                                                            |
| `data-uif-key`                                                        | Row identity field used to map remote row data to `data-uif-row-id`.                                                         |
| `data-uif-page`                                                       | Current page for remote requests.                                                                                            |
| `data-uif-page-size`                                                  | Page size for remote requests. Defaults to `25`.                                                                             |
| `data-uif-total`, `data-uif-total-pages`                              | Remote result metadata used by pagination controls.                                                                          |
| `data-uif-sort`, `data-uif-direction`                                 | Active sort key and direction. Direction is `asc` or `desc`.                                                                 |
| `data-uif-responsive`                                                 | Responsive mode: `scroll`, `priority`, `stack`, or planned `cards`.                                                          |
| `data-uif-selection-target`                                           | Selector receiving the selected row count.                                                                                   |
| `data-uif-empty-text`, `data-uif-loading-text`, `data-uif-error-text` | Visible state labels for empty/loading/error rows.                                                                           |
| `data-uif-sort` on `th`                                               | Sort key for a sortable column. Boolean/index behavior remains supported for simple tables.                                  |
| `data-uif-type` on `th`                                               | Sort value type: `text`, `number`, `date`, `currency`, `status`, or `custom`.                                                |
| `data-uif-label` on `th`                                              | Responsive label copied to cells as `data-uif-label`.                                                                        |
| `data-uif-priority` on `th`                                           | Responsive priority class used for column hiding.                                                                            |
| `data-uif-hide` on `th` or cells                                      | Breakpoint column hiding such as `sm` or `md`.                                                                               |
| `data-uif-role="row-select"`                                          | Row checkbox used by `selectedRows()`, bulk actions, and selection counts.                                                   |
| `data-uif-role="select-all"`                                          | Header checkbox that toggles all row selectors.                                                                              |
| `data-uif-row-id`                                                     | Stable row identity used in selection and row action event payloads.                                                         |
| `data-uif-table-action`                                               | Bulk action trigger. Pair with `data-uif-target="#table-id"`.                                                                |
| `data-uif-row-action`                                                 | Row action trigger inside a table row.                                                                                       |
| `data-uif-table-page`                                                 | Pagination trigger value: page number, `first`, `prev`, `next`, or `last`. Pair with `data-uif-target="#table-id"`.          |
| `data-uif-table-page-size`                                            | Page-size control selector target such as `#table-id`.                                                                       |
| `data-uif-table-page-label`                                           | Selector target for visible pagination text such as "Page 2 of 8".                                                           |
| `data-uif-table-filter`                                               | Filter control selector target such as `#table-id`.                                                                          |
| `data-uif-filter-column`                                              | Optional column key or index for column-scoped filtering.                                                                    |
| `data-uif-filter-op`                                                  | Filter operator: `contains`, `startsWith`, `equals`, `not`, `min`, `max`, `between`, `in`, or `token`.                       |
| `data-uif-table-controls`                                             | Groups named filter controls that contribute to remote query state.                                                          |
| `data-uif-table-reset`                                                | Reset trigger target such as `#table-id`. Resets filters, sort, page, and selection.                                         |

Table lifecycle events include `uif:table-before-load`, `uif:table-loaded`, `uif:table-error`, `uif:table-state`, `uif:table-sort`, `uif:table-filter`, `uif:table-reset`, `uif:table-page`, `uif:table-page-size`, `uif:table-selection`, `uif:table-bulk-action`, and `uif:table-row-action`.

Remote table requests include `page`, `pageSize`, and, when active, `sort`, `direction`, `q`, and `filters[field]` / `filters[field][op]` query parameters. JSON row values render as text by default. Responses default to at most 1,000 rows, 100 columns, 10,000 characters per cell, and 1,000,000 characters of trusted row HTML; programmatic `TableOptions` may adjust row, cell, and HTML limits. Trusted HTML row responses remain behind the framework trusted HTML boundary and must come from governed server code.

## Realtime

| Attribute                         | Purpose                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `data-uif-channel`                | Required channel name for subscriptions and connection state.                               |
| `data-uif-src`                    | Polling, SSE, or WebSocket endpoint.                                                        |
| `data-uif-mode`                   | Transport mode: `poll`, `sse`, or `websocket`. Defaults to `poll`.                          |
| `data-uif-interval`               | Polling interval and request timeout in milliseconds. Defaults to `5000`.                   |
| `data-uif-reconnect`              | Set to `false` to disable reconnect attempts.                                               |
| `data-uif-max-payload-bytes`      | Maximum accepted remote message size. Defaults to `1000000`.                                |
| `data-uif-max-reconnect-attempts` | Maximum reconnect attempts before entering `failed`. Defaults to `8`.                       |
| `data-uif-target`                 | Optional selector for the feed render target. Defaults to the realtime element.             |

Realtime feeds render payloads as text by default. Reconnect uses capped exponential backoff with jitter, pauses while the document is hidden, and resumes when visible. Oversized or unserializable payloads are rejected before subscriber delivery. State, message, error, open, and close lifecycle events are emitted as `uif:realtime-state`, `uif:realtime-message`, `uif:realtime-error`, `uif:realtime-open`, and `uif:realtime-close`.

## AI and MCP UI

| API or attribute           | Purpose                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `data-uif="ai-action"`     | Renders a browser-side AI action card.                                                                  |
| `data-uif-agent`           | Agent label shown in the AI card.                                                                       |
| `data-uif-tool`            | Tool/action label shown in AI and MCP cards.                                                            |
| `renderPromptPanel()`      | Renders prompt input and selectable prompt history.                                                     |
| `createStreamSurface()`    | Creates a text-safe streaming surface with cancellation state.                                          |
| `renderAIResultCard()`     | Renders accept/reject/copy/insert result actions.                                                       |
| `data-uif="tool-approval"` | Renders a server-mediated MCP-style approval card.                                                      |
| `data-uif-risk`            | Risk label, commonly `low`, `medium`, or `high`.                                                        |
| `data-uif-irreversible`    | Requires explicit `APPROVE` confirmation when set to `true`.                                            |
| `renderApprovalPolicy()`   | Renders policy checks with pass/warn/fail/pending state markers.                                        |
| `renderToolReviewFlow()`   | Renders payload preview, policy checks, timeline, diff, result, audit trail, and approve/reject events. |

AI/MCP APIs are UI-only. Approval events are emitted for a governed backend to handle; browser code must not execute privileged tools directly.

## Forms

| Attribute                 | Purpose                                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif-rule`           | Pipe-separated validation rules such as `required`, `email`, `number`, `integer`, `min:1`, `max:10`, `minLength:3`, `maxLength:50`, `pattern:...`, `sameAs:fieldName`. |
| `data-uif-validate`       | Set to `false` to skip client validation.                                                                                                                              |
| `data-uif-validate-async` | Names a registered async validation rule.                                                                                                                              |
| `data-uif-field-adapter`  | Names a registered field adapter for custom controls such as combobox-like inputs.                                                                                     |

Form state markers:

- Forms use `data-uif-state="idle|submitting|success|error"`.
- Changed fields receive `data-uif-dirty="true"` and the form receives `data-uif-dirty="true"`.
- Blurred fields receive `data-uif-touched="true"`.

Malformed `pattern` expressions are handled as validation failures rather than runtime crashes.

Enhanced `GET` and `HEAD` forms encode fields in the query string and do not send a request body. Declarative methods are limited to `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, and `DELETE`. Async validation and submissions use latest-run cancellation. Server error maps are rendered as text and bounded to 100 fields, 10 messages per field, and 2,000 characters per message.

Form control CSS conventions:

| Class               | Purpose                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `.uif-input-shell`  | Icon or add-on wrapper for native `input` and `select` controls, including date and time inputs.          |
| `.uif-input-group`  | Joined input group for prefixes, suffixes, and unit labels. Use `.uif-input-group-addon` for static text. |
| `.uif-range`        | Styled native range input using the current accent color.                                                 |
| `.uif-switch`       | Accessible native checkbox switch pattern with `.uif-switch-track` and optional `.uif-switch-label`.      |
| `.uif-segmented`    | Button or radio-based segmented control for compact mode selection.                                       |
| `.uif-color-picker` | Native color input with value and hint text.                                                              |

These controls keep native browser input semantics. Use regular labels, names, validation rules, and server-side validation as usual.

## Editors

| Attribute                 | Purpose                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif="editor"`       | Enhances a textarea/input into a rich HTML or Markdown editor.                                                                                                                                    |
| `data-uif-mode`           | Editor mode: `html`, `markdown`, or `plain`.                                                                                                                                                      |
| `data-uif-toolbar`        | Space-separated toolbar commands such as `bold italic h1 h2 h3 quote code-inline code-block ul ol task outdent indent link image table preview source`. Link, image, code-block, and table open editor dialogs when triggered from the toolbar. |
| `data-uif-preview`        | Preview mode: `none`, `manual`, or `live`.                                                                                                                                                        |
| `data-uif-editor-height`  | Minimum editor surface height.                                                                                                                                                                    |
| `data-uif-editor-layout`  | Editor layout: `source`, `preview`, `split`, `tabs`, `modal`, or `drawer` where supported.                                                                                                        |
| `data-uif-editor-status`  | Shows or hides editor status text for words, characters, and dirty state.                                                                                                                         |
| `data-uif-placeholder`    | Placeholder text for the enhanced editor surface.                                                                                                                                                 |
| `data-uif-required`       | Marks an editor as required for browser-side validation feedback.                                                                                                                                 |
| `data-uif-maxlength`      | Maximum character count used by `validateEditor()`.                                                                                                                                               |
| `data-uif-autosave`       | When `true`, schedules autosave after editor changes.                                                                                                                                             |
| `data-uif-autosave-delay` | Autosave debounce delay in milliseconds.                                                                                                                                                          |
| `data-uif-autosave-url`   | Optional JSON POST endpoint for autosave; omit to use registered autosave hooks/events only.                                                                                                      |

Markdown preview escapes raw HTML by default and supports a practical subset including headings, lists, task lists, tables, links, images, code blocks, blockquotes, strikethrough, and horizontal rules. Browser-side cleanup is not a substitute for server-side sanitization before trusted render or storage.

Editor command values can also be passed programmatically through `runEditorCommand(editor, command, value)`. Structured values are supported for links, images, language-aware code blocks, and tables. Current command coverage includes `link-edit`, `link-remove`, `image-edit`, `image-remove`, `indent`, `outdent`, `table-row-before`, `table-row-after`, `table-row-delete`, `table-col-before`, `table-col-after`, `table-col-delete`, `table-header-toggle`, and `table-delete`. Task lists support checkbox state synchronization plus Enter/Backspace continuation behavior in HTML and Markdown modes. Markdown diagnostics are exposed through the editor instance, `data-uif-editor-diagnostics`, and `uif:editor-diagnostics`.

## Overlays

| Attribute              | Purpose                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif="modal"`     | Enhances a dialog container.                                                                                                     |
| `data-uif="drawer"`    | Enhances a side-panel container.                                                                                                 |
| `data-uif="offcanvas"` | Enhances a drawer-equivalent off-canvas container.                                                                               |
| `data-uif="tooltip"`   | Enhances a trigger element with text-safe hover/focus help.                                                                      |
| `data-uif="popover"`   | Enhances a trigger/panel container for contextual content.                                                                       |
| `data-uif-placement`   | Planned placement hint for floating overlays, such as `top`, `right`, `bottom`, `left`, or `auto`.                               |
| `data-uif-delay`       | Planned tooltip/popover delay in milliseconds.                                                                                   |
| `data-uif-container`   | Planned render container hint, such as `body`, `self`, or a selector.                                                            |
| `data-uif-html`        | Defaults to `false`; tooltip content is text-safe by default.                                                                    |
| `data-uif-backdrop`    | Backdrop mode for modal/drawer/off-canvas: `true`, `false`, or `static`. Static modals do not close on backdrop click or Escape. |
| `data-uif-keyboard`    | Set to `false` on modal overlays to disable Escape dismissal.                                                                    |
| `data-uif-scroll`      | Planned drawer/off-canvas body scroll policy.                                                                                    |
| `data-uif-breakpoint`  | Planned responsive drawer/off-canvas breakpoint hint.                                                                            |

Current tooltip content comes from `data-uif-message` or the trigger's `title` attribute. The title is removed after initialization and the generated tooltip panel is associated through `aria-describedby`.

Modal size and scroll classes:

```html
<div data-uif="modal" class="uif-modal uif-modal-scrollable" data-uif-backdrop="static" hidden>
  <div data-uif-role="dialog" class="uif-modal-dialog uif-modal-lg">
    <header>Modal title</header>
    <div class="uif-modal-body" data-uif-role="modal-body">Long scrollable content</div>
    <footer><button data-uif-action="close">Close</button></footer>
  </div>
</div>
```

Use `.uif-modal-sm`, `.uif-modal-lg`, `.uif-modal-xl`, or `.uif-modal-fullscreen` on the dialog element for size variants.

`drawer` is the preferred UIF term for app and RAD side panels. `offcanvas` is supported as a Bootstrap migration alias for the same behavior.

Drawers and off-canvas panels use a scroll-safe two-row layout by default. Put fixed controls in a header row and long content in a body row:

```html
<div data-uif="offcanvas" class="uif-offcanvas uif-offcanvas-right">
  <div data-uif-role="header">Panel title and actions</div>
  <div data-uif-role="body">Scrollable panel content</div>
</div>
```

The `.uif-drawer-body`, `.uif-offcanvas-body`, and `[data-uif-role="body"]` body regions set `min-height: 0`, vertical scrolling, contained overscroll, and touch scrolling so fixed drawers do not force page-level scrolling.

## Tabs

| Attribute              | Purpose                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif="tabs"`      | Enhances a tab group.                                                                                                           |
| `data-uif-orientation` | Set to `vertical` for vertical tablists. Vertical tablists receive `aria-orientation="vertical"` and support ArrowUp/ArrowDown. |
| `data-uif-activation`  | Defaults to automatic activation. Set to `manual` so arrow keys move focus and Enter/Space activates the focused tab.           |

Tabs always support ArrowLeft/ArrowRight, Home, and End. Use `.uif-tabs` for default tab styling and `.uif-tabs-vertical` for a two-column vertical layout.

## Toasts

| Attribute                 | Purpose                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif-action="toast"` | Shows a toast from a button or link.                                                                                                |
| `data-uif-message`        | Toast message text.                                                                                                                 |
| `data-uif-type`           | Toast type, commonly `info`, `success`, `warning`, or `danger`. Danger toasts use `role="alert"`; other toasts use `role="status"`. |
| `data-uif-placement`      | Stack placement: `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, or `bottom-end`. Defaults to `bottom-end`.  |
| `data-uif-duration`       | Auto-dismiss duration in milliseconds. Defaults to `3000`.                                                                          |
| `data-uif-dismissible`    | Set to `false` to omit the generated close button.                                                                                  |

Generated toasts use `.uif-toast-stack` containers keyed by placement and pause auto-dismiss while the toast is hovered or focused.

## Workspace Shells

| Attribute                          | Purpose                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `data-uif="shell"`                 | Enhances a server-rendered workspace shell.                                                      |
| `data-uif-route`                   | Names the current route so matching nav links can receive `aria-current="page"` and `is-active`. |
| `data-uif-sidebar-key`             | Optional `localStorage` key for persisted sidebar collapsed/expanded state.                      |
| `data-uif-density-key`             | Optional `localStorage` key for persisted density state.                                         |
| `data-uif-density`                 | Initial density value, commonly `compact` or `comfortable`.                                      |
| `data-uif-role="skip-link"`        | Link that is pointed to the shell's main content region.                                         |
| `data-uif-role="sidebar"`          | Sidebar or product navigation region.                                                            |
| `data-uif-role="nav"`              | Keyboard-enabled shell navigation region.                                                        |
| `data-uif-role="main"`             | Main content region; receives an id and `tabindex="-1"` when needed.                             |
| `data-uif-action="toggle"`         | Toggles the shell sidebar when targeted at the shell.                                            |
| `data-uif-action="toggle-sidebar"` | Explicit sidebar toggle action.                                                                  |
| `data-uif-action="toggle-section"` | Toggles the next section panel or the configured `data-uif-target`.                              |

Shell behavior is intentionally server-rendered friendly. The HTML remains meaningful without JavaScript, while UIF adds preference persistence, active navigation state, section disclosure, and safe rehydration after partial swaps.

Responsive shell convention:

```html
<div id="shell" class="uif-responsive-shell" data-uif="shell">
  <aside class="uif-sidebar uif-sidebar-desktop" data-uif-role="sidebar">Desktop nav</aside>
  <section class="uif-shell-content">
    <header class="uif-navbar" data-uif="navbar">
      <a class="uif-navbar-brand" href="/">Workspace</a>
      <button class="uif-navbar-toggle" data-uif-action="open" data-uif-target="#mobile-nav">
        Menu
      </button>
      <button data-uif-action="toggle-sidebar" data-uif-target="#shell">Collapse</button>
    </header>
    <main data-uif-role="main">Content</main>
  </section>
</div>
<aside id="mobile-nav" class="uif-offcanvas uif-offcanvas-left" data-uif="offcanvas" hidden>
  <div data-uif-role="header">Workspace <button data-uif-action="close">Close</button></div>
  <nav data-uif-role="body">Mobile nav</nav>
</aside>
```

Use `.uif-navbar-toggle` and `.uif-sidebar-mobile-toggle` for controls that appear at the mobile breakpoint, `.uif-sidebar-desktop` for persistent desktop sidebars, and `data-uif-target` on sidebar toggle buttons when the trigger is nested inside another component such as `navbar`.

## Animation and Event Actions

| Attribute            | Purpose                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `data-uif="animate"` | Runs an animation preset on load or configured trigger.                                                                     |
| `data-uif-animation` | Animation name such as `fade-in`, `slide-up`, `scale-in`, `pop`, `pulse`, `shake`, or `highlight`.                          |
| `data-uif-duration`  | Animation duration in milliseconds.                                                                                         |
| `data-uif-delay`     | Animation delay in milliseconds.                                                                                            |
| `data-uif-repeat`    | Optional animation repeat count.                                                                                            |
| `data-uif-easing`    | Optional CSS timing function override.                                                                                      |
| `data-uif-once`      | Runs an animation trigger once unless set to `false`.                                                                       |
| `data-uif-event`     | Event name for safe declarative action binding, optionally with modifiers such as `click.prevent`.                          |
| `data-uif-on`        | JSON event/action map for multiple declarative bindings.                                                                    |
| `data-uif-actions`   | JSON action chain for ordered multi-step interactions.                                                                      |
| `data-uif-confirm`   | Confirmation prompt shown before an action or chain runs.                                                                   |
| `data-uif-if`        | Simple condition selector; action runs only when the selector matches. Use `!selector` for inverse, `online`, or `offline`. |
| `data-uif-class`     | Class name used by class actions.                                                                                           |
| `data-uif-attribute` | Attribute name used by attribute actions.                                                                                   |
| `data-uif-key`       | Keyboard filter for declarative keyboard actions.                                                                           |

Supported event modifiers include `prevent`, `stop`, `once`, `self`, `outside`, `debounce:ms`, `throttle:ms`, and common keyboard filters such as `enter`, `escape`, and `space`.

Built-in safe actions include `show`, `hide`, `toggle`, `animate`, `add-class`, `remove-class`, `toggle-class`, `set-attribute`, `remove-attribute`, `toggle-attribute`, `set-value`, `set-text`, `set-html-safe`, `toggle-state`, `copy`, `scroll-to`, `focus`, `submit`, `reset`, and `emit`.

Event actions never evaluate inline JavaScript. Only registered action names can run.

Developer diagnostics are available through `getActionDiagnostics()` and `uif:action-diagnostic` events. Missing targets, unknown action names, and invalid JSON action specs are reported without throwing runtime crashes.

## Charts

| Attribute               | Purpose                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-uif-chart`        | Chart type such as `line`, `bar`, `donut`, `pie`, `radar`, `sparkline`, `histogram`, `box-plot`, `scatter`, `regression`, `control-chart`, or `pareto`. |
| `data-uif-data`         | Inline JSON chart data.                                                                                                                                 |
| `data-uif-src`          | Remote chart data URL.                                                                                                                                  |
| `data-uif-chart-export` | Export button format: `svg`, `png`, or `csv`.                                                                                                           |
| `data-uif-chart-target` | Export/drilldown target selector.                                                                                                                       |
| `data-uif-drilldown`    | Enables chart drilldown behavior.                                                                                                                       |

## Security Boundary

Most UIF renderers now render dynamic text through text nodes. Server-rendered HTML swaps are intentionally supported for RAD and route-like scenarios, but those responses are a trusted server boundary.

Use server-side authorization, escaping, content security policy, and audit logging for privileged workflows. Browser-side AI/MCP packages render approval and status UI only; they must not execute privileged tools directly.

## Media and layout additions

Carousel uses `data-uif="carousel"`, child slides with `data-uif-role="slide"`, controls with `data-uif-action="previous"` / `data-uif-action="next"`, and optional indicators with `data-uif-slide-to="0"`. Lightbox uses `data-uif="lightbox"`, thumbnail triggers with `data-uif-role="item"`, and a dialog with `data-uif-role="dialog"`, `image`, and `caption` regions. Masonry uses `.uif-masonry` and `.uif-masonry-item` with `data-uif="masonry"` for registry consistency.
