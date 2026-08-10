# Generated Batoi UIF Contract Reference

Framework 3.0.0-alpha.1; contract version 3. This file is generated from typed source definitions.

## Profiles

| Profile | Entry point | Packages | Purpose |
| --- | --- | --- | --- |
| all | `@batoi/uif-profiles/all` | core, dom, query, net, state, actions, effects, overlays, components, forms, editor, table, router, rad-adapter, charts, dashboard, desktop, realtime, pwa, push, mobile, ai, mcp, icons, extension-kit | Complete namespace-based framework surface for tooling and broad applications. |
| rad | `@batoi/uif-profiles/rad` | core, dom, net, state, actions, components, forms, editor, table, router, rad-adapter, icons | Server-rendered Batoi RAD applications and partial updates. |
| dashboard | `@batoi/uif-profiles/dashboard` | core, dom, net, state, components, table, charts, dashboard, realtime, icons | Data-rich dashboards and realtime operational views. |
| mobile | `@batoi/uif-profiles/mobile` | core, dom, net, state, components, mobile, pwa, push, realtime, icons | Mobile shells, progressive web apps, offline status, and notifications. |
| desktop | `@batoi/uif-profiles/desktop` | core, dom, net, state, components, desktop, pwa, realtime, icons | Desktop-style workspaces and resilient application shells. |
| agent | `@batoi/uif-profiles/agent` | core, dom, net, components, ai, mcp, icons | Provider-neutral assistant and governed tool-review interfaces. |

## Capability Groups

| Capability | Packages | Preferred entry points | Compatibility |
| --- | --- | --- | --- |
| dom | dom, query | @batoi/uif-dom | Query remains a compatibility facade and does not define a second safety model. |
| interaction | actions, effects, overlays, components | @batoi/uif-components, @batoi/uif-profiles/all | Direct package imports remain supported for small graphs. |
| shells | components, dashboard, mobile, desktop | @batoi/uif-profiles/dashboard, @batoi/uif-profiles/mobile, @batoi/uif-profiles/desktop | Composition packages share component lifecycle and shell primitives. |
| offline | pwa, push, realtime, state | @batoi/uif-profiles/mobile, @batoi/uif-profiles/desktop | PWA and push remain separate permission boundaries behind one application capability model. |

## Components

| Component | Package | Runtime | Fallback | Actions | Events | States | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `accordion` | `@batoi/uif-components` | registry | Headings with visible section content | toggle | uif:accordion-toggle | collapsed, disabled, expanded | UIF_COMPONENT_MOUNT |
| `agent-tool` | `@batoi/uif-mcp` | registry | Tool plan, review, progress, result, or receipt summary |  | uif:agent:error, uif:tool-approve, uif:tool-reject | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `ai-action` | `@batoi/uif-ai` | registry | Button or form describing an assistant action |  | uif:ai-action | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `ai-composer` | `@batoi/uif-ai` | registry | Labelled textarea and submit button |  | uif:agent:cancel, uif:agent:submit | busy, disabled, idle | UIF_COMPONENT_MOUNT |
| `ai-thread` | `@batoi/uif-ai` | registry | Ordered message transcript |  | uif:agent:copy, uif:agent:error, uif:agent:feedback, uif:agent:retry | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `ajax` | `@batoi/uif-rad-adapter` | registry | Link, button, or form with a normal server destination | load | uif:rad-before, uif:rad-error, uif:rad-success | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `alert` | `@batoi/uif-components` | registry | Inline alert content | close |  | closed, open | UIF_COMPONENT_MOUNT |
| `animate` | `@batoi/uif-effects` | registry | Static final visual state |  | uif:animation-end, uif:animation-start | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `badge` | `@batoi/uif-components` | registry | Inline status text |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `breadcrumb` | `@batoi/uif-components` | registry | Navigation list |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `button` | `@batoi/uif-components` | registry | Native button or link | activate |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `card` | `@batoi/uif-components` | registry | Article or section |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `carousel` | `@batoi/uif-components` | registry | Sequential figures or articles | next, previous, select | uif:carousel-change | active, inactive | UIF_COMPONENT_MOUNT |
| `chart` | `@batoi/uif-charts` | registry | Accessible data table or textual summary |  | uif:chart-error, uif:chart-select | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `collapse` | `@batoi/uif-components` | registry | Visible collapsible content | close, open, toggle | uif:collapse-close, uif:collapse-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `combobox` | `@batoi/uif-components` | registry | Labelled native input and option list |  | uif:combobox-change | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `command-menu` | `@batoi/uif-components` | registry | Search input and command list | close, open, toggle | uif:command-menu-close, uif:command-menu-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `dashboard` | `@batoi/uif-dashboard` | registry | Sections containing metrics, tables, and lists |  | uif:dashboard-error | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `desktop-shell` | `@batoi/uif-desktop` | registry | Application landmarks and navigation | set-density, toggle-sidebar | uif:desktop-change | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `drawer` | `@batoi/uif-components` | registry | Visible complementary region | close, open, toggle | uif:drawer-close, uif:drawer-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `dropdown` | `@batoi/uif-components` | registry | Native button followed by a menu or link list | close, open, toggle | uif:dropdown-close, uif:dropdown-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `editor` | `@batoi/uif-editor` | registry | Textarea | edit, preview, save | uif:editor-change, uif:editor-diagnostics | dirty, error, idle, saved, saving | UIF_COMPONENT_MOUNT |
| `file-upload` | `@batoi/uif-components` | registry | Native file input |  | uif:file-select | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `form` | `@batoi/uif-forms` | registry | Native form and controls | reset, submit | uif:form-error, uif:form-submit, uif:form-success | error, idle, submitting, success | UIF_COMPONENT_MOUNT |
| `install-prompt` | `@batoi/uif-pwa` | registry | Normal installation guidance | install | uif:pwa-install | available, installed, unavailable | UIF_COMPONENT_MOUNT |
| `lightbox` | `@batoi/uif-components` | registry | Linked image gallery | close, open, toggle | uif:lightbox-close, uif:lightbox-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `masonry` | `@batoi/uif-components` | registry | Sequential card or figure list |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `mobile-shell` | `@batoi/uif-mobile` | registry | Mobile application landmarks and navigation |  |  | offline, online | UIF_COMPONENT_MOUNT |
| `modal` | `@batoi/uif-components` | registry | Visible dialog content | close, open, toggle | uif:modal-close, uif:modal-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `nav` | `@batoi/uif-components` | registry | Navigation region |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `navbar` | `@batoi/uif-components` | registry | Navigation region |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `offcanvas` | `@batoi/uif-components` | registry | Visible complementary region | close, open, toggle | uif:offcanvas-close, uif:offcanvas-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `pagination` | `@batoi/uif-components` | registry | Navigation list | navigate | uif:pagination-change | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `popover` | `@batoi/uif-components` | registry | Inline contextual content | close, open, toggle | uif:popover-close, uif:popover-open | closed, disabled, open | UIF_COMPONENT_MOUNT |
| `progress` | `@batoi/uif-components` | registry | Native progress element or textual status |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `push` | `@batoi/uif-push` | registry | Notification preference control | subscribe, unsubscribe | uif:push-change, uif:push-error | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `realtime` | `@batoi/uif-realtime` | registry | Existing feed content |  | uif:realtime-error, uif:realtime-message, uif:realtime-state | connected, connecting, disconnected, failed | UIF_COMPONENT_MOUNT |
| `route` | `@batoi/uif-router` | registry | Native link navigation | navigate | uif:route-before, uif:route-error, uif:route-success | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `shell` | `@batoi/uif-components` | registry | Header, navigation, main, and complementary landmarks | set-density, toggle-sidebar |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `sidebar` | `@batoi/uif-components` | registry | Complementary navigation region |  |  | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `skeleton` | `@batoi/uif-components` | registry | Existing content or loading status |  |  | loading | UIF_COMPONENT_MOUNT |
| `spinner` | `@batoi/uif-components` | registry | Textual loading status |  |  | loading | UIF_COMPONENT_MOUNT |
| `stepper` | `@batoi/uif-components` | registry | Ordered list of steps |  |  | active, completed, disabled, error | UIF_COMPONENT_MOUNT |
| `table` | `@batoi/uif-table` | registry | Semantic table | load, reload, select | uif:table-error, uif:table-load, uif:table-select | empty, error, idle, loaded, loading | UIF_COMPONENT_MOUNT |
| `tabs` | `@batoi/uif-components` | registry | Headings and sequential content sections | activate | uif:tabs-change | active, disabled, inactive | UIF_COMPONENT_MOUNT |
| `toast` | `@batoi/uif-components` | registry | Inline status message | close | uif:toast | closed, open | UIF_COMPONENT_MOUNT |
| `tool-approval` | `@batoi/uif-mcp` | registry | Review summary with explicit decision controls | approve, reject | uif:tool-approve, uif:tool-expired, uif:tool-invalid-review, uif:tool-reject | approved, decision-pending, expired, rejected, waiting-approval | UIF_COMPONENT_MOUNT |
| `tooltip` | `@batoi/uif-components` | registry | Adjacent help text |  |  | closed, open | UIF_COMPONENT_MOUNT |
| `typed-text` | `@batoi/uif-effects` | registry | Complete static text |  | uif:typed-text-complete | disabled, error, idle, loading, success | UIF_COMPONENT_MOUNT |
| `wizard` | `@batoi/uif-components` | registry | Sequential fieldsets | next, previous, submit | uif:wizard-change | active, completed, error | UIF_COMPONENT_MOUNT |

## Accessibility and Security Contracts

| Component | Accessibility | Security |
| --- | --- | --- |
| `accordion` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `agent-tool` | Preserve useful semantic HTML before enhancement. | MCP invocation, permissions, and authoritative audit remain server-side. |
| `ai-action` | Preserve useful semantic HTML before enhancement. | Browser UI never holds provider credentials. |
| `ai-composer` | Preserve useful semantic HTML before enhancement. | Composer emits events and does not invoke a model provider directly. |
| `ai-thread` | Preserve useful semantic HTML before enhancement. | Agent content uses validated versioned envelopes and text-safe rendering. |
| `ajax` | Preserve useful semantic HTML before enhancement. | Partial HTML is explicit governed server output. |
| `alert` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `animate` | Respect reduced-motion preferences. | Render untrusted values as text. |
| `badge` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `breadcrumb` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `button` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `card` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `carousel` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `chart` | Preserve useful semantic HTML before enhancement. | Remote data and drilldown URLs are bounded and policy checked. |
| `collapse` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `combobox` | Support keyboard option navigation and active-descendant state. | Render untrusted values as text. |
| `command-menu` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `dashboard` | Preserve useful semantic HTML before enhancement. | Custom HTML widgets are explicitly caller-trusted. |
| `desktop-shell` | Preserve useful semantic HTML before enhancement. | Persist preferences only; never store credentials. |
| `drawer` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `dropdown` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `editor` | Preserve useful semantic HTML before enhancement. | Sanitize editing boundaries and validate submitted content on the server. |
| `file-upload` | Preserve useful semantic HTML before enhancement. | Client file metadata is advisory; server validation remains authoritative. |
| `form` | Preserve useful semantic HTML before enhancement. | Browser validation is advisory; server validation and authorization are authoritative. |
| `install-prompt` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `lightbox` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `masonry` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `mobile-shell` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `modal` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `nav` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `navbar` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `offcanvas` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `pagination` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `popover` | Own keyboard dismissal, focus movement, and focus return. | Render untrusted values as text. |
| `progress` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `push` | Preserve useful semantic HTML before enhancement. | Subscription authorization and delivery remain server-side. |
| `realtime` | Preserve useful semantic HTML before enhancement. | Messages are bounded and rendered as text by default. |
| `route` | Preserve useful semantic HTML before enhancement. | Navigation and partial URLs follow application URL policy. |
| `shell` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `sidebar` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `skeleton` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `spinner` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `stepper` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `table` | Preserve useful semantic HTML before enhancement. | Remote data is bounded; HTML rows require governed server trust. |
| `tabs` | Support arrow, Home, End, and focusable tab semantics. | Render untrusted values as text. |
| `toast` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |
| `tool-approval` | Preserve useful semantic HTML before enhancement. | Browser confirmation is not authorization or execution. |
| `tooltip` | Preserve useful semantic HTML before enhancement. | Tooltip content is text-only by default. |
| `typed-text` | Expose stable text and respect reduced motion. | Render untrusted values as text. |
| `wizard` | Preserve useful semantic HTML before enhancement. | Render untrusted values as text. |

## Canonical Registries

- attributes: `data-uif`, `data-uif-id`, `data-uif-role`, `data-uif-action`, `data-uif-target`, `data-uif-src`, `data-uif-method`, `data-uif-trigger`, `data-uif-state`, `data-uif-bind`, `data-uif-model`, `data-uif-value`, `data-uif-route`, `data-uif-mode`, `data-uif-options`, `data-uif-confirm`, `data-uif-disabled`, `data-uif-loading`, `data-uif-success`, `data-uif-error`, `data-uif-swap`, `data-uif-cache`, `data-uif-validate`, `data-uif-rule`, `data-uif-event`, `data-uif-on`, `data-uif-refresh`, `data-uif-persist`, `data-uif-density`, `data-uif-sidebar-key`, `data-uif-density-key`, `data-uif-toolbar`, `data-uif-preview`, `data-uif-animation`, `data-uif-duration`, `data-uif-delay`, `data-uif-placement`, `data-uif-container`, `data-uif-html`, `data-uif-backdrop`, `data-uif-scroll`, `data-uif-breakpoint`, `data-uif-class`, `data-uif-attribute`, `data-uif-key`, `data-uif-envelope`, `data-uif-interval`, `data-uif-message`, `data-uif-messages`
- components: `button`, `modal`, `drawer`, `offcanvas`, `dropdown`, `tabs`, `toast`, `accordion`, `alert`, `badge`, `breadcrumb`, `collapse`, `tooltip`, `popover`, `progress`, `spinner`, `skeleton`, `pagination`, `command-menu`, `navbar`, `sidebar`, `stepper`, `wizard`, `file-upload`, `combobox`, `carousel`, `lightbox`, `masonry`, `card`, `table`, `form`, `editor`, `ajax`, `route`, `shell`, `nav`, `chart`, `animate`, `realtime`, `push`, `mobile-shell`, `desktop-shell`, `ai-action`, `ai-thread`, `ai-composer`, `agent-tool`, `tool-approval`, `typed-text`, `dashboard`, `install-prompt`
- actions: `open`, `close`, `toggle`, `toggle-sidebar`, `toggle-section`, `submit`, `load`, `reload`, `delete`, `save`, `reset`, `clear`, `select`, `activate`, `deactivate`, `navigate`, `swap`, `append`, `prepend`, `remove`, `toast`, `set-density`, `animate`, `add-class`, `remove-class`, `toggle-class`, `set-attribute`, `remove-attribute`, `set-value`, `copy`, `scroll-to`, `focus`, `emit`, `subscribe`, `connect`, `disconnect`, `approve`, `reject`, `edit`, `install`, `next`, `preview`, `previous`, `unsubscribe`
- states: `idle`, `loading`, `loaded`, `error`, `success`, `active`, `inactive`, `open`, `closed`, `disabled`, `selected`, `expanded`, `collapsed`, `connected`, `disconnected`, `pending`, `approved`, `rejected`, `available`, `busy`, `completed`, `connecting`, `decision-pending`, `dirty`, `empty`, `expired`, `failed`, `installed`, `offline`, `online`, `saved`, `saving`, `submitting`, `unavailable`, `waiting-approval`
- events: `uif:before-init`, `uif:init`, `uif:before-destroy`, `uif:destroy`, `uif:error`, `uif:runtime:mounted`, `uif:runtime:error`, `uif:runtime:diagnostic`, `uif:diagnostic`, `uif:agent:submit`, `uif:agent:cancel`, `uif:agent:error`, `uif:agent:feedback`, `uif:agent:retry`, `uif:agent:copy`, `uif:tool-approve`, `uif:tool-reject`, `uif:tool-expired`, `uif:tool-invalid-review`, `uif:tool-replay-blocked`, `uif:accordion-toggle`, `uif:action-diagnostic`, `uif:ai-action`, `uif:ai-error`, `uif:ai-history-select`, `uif:ai-stream-cancel`, `uif:animation-end`, `uif:animation-start`, `uif:before-load`, `uif:carousel-change`, `uif:chart-drilldown`, `uif:chart-drilldown-error`, `uif:chart-error`, `uif:chart-export`, `uif:chart-refresh`, `uif:chart-select`, `uif:collapse-close`, `uif:collapse-open`, `uif:combobox-change`, `uif:command-menu-close`, `uif:command-menu-open`, `uif:complete`, `uif:connector-error`, `uif:dashboard-error`, `uif:desktop-change`, `uif:desktop-error`, `uif:drawer-close`, `uif:drawer-open`, `uif:dropdown-close`, `uif:dropdown-open`, `uif:editor-autosave`, `uif:editor-autosave-error`, `uif:editor-blur`, `uif:editor-change`, `uif:editor-command`, `uif:editor-destroy`, `uif:editor-diagnostics`, `uif:editor-error`, `uif:editor-focus`, `uif:editor-init`, `uif:editor-layout-change`, `uif:editor-mode-change`, `uif:editor-normalize`, `uif:editor-preview`, `uif:editor-reset`, `uif:editor-upload-error`, `uif:editor-validate`, `uif:field-errors`, `uif:file-select`, `uif:form-dirty`, `uif:form-error`, `uif:form-submit`, `uif:form-success`, `uif:form-touched`, `uif:lightbox-close`, `uif:lightbox-open`, `uif:load`, `uif:modal-close`, `uif:modal-open`, `uif:notification`, `uif:offcanvas-close`, `uif:offcanvas-open`, `uif:offline-error`, `uif:offline-expired`, `uif:offline-queued`, `uif:offline-synced`, `uif:pagination-change`, `uif:popover-close`, `uif:popover-open`, `uif:presence`, `uif:push-change`, `uif:push-error`, `uif:pwa-install`, `uif:rad-before`, `uif:rad-error`, `uif:rad-success`, `uif:realtime-error`, `uif:realtime-message`, `uif:realtime-state`, `uif:rehydrate`, `uif:request`, `uif:response`, `uif:route-before`, `uif:route-error`, `uif:route-success`, `uif:router-error`, `uif:segment-change`, `uif:select`, `uif:shell-density`, `uif:table-before-load`, `uif:table-bulk-action`, `uif:table-error`, `uif:table-filter`, `uif:table-load`, `uif:table-loaded`, `uif:table-page`, `uif:table-page-size`, `uif:table-reset`, `uif:table-row-action`, `uif:table-select`, `uif:table-selection`, `uif:table-sort`, `uif:table-state`, `uif:tabs-change`, `uif:toast`, `uif:tool-confirmation-required`, `uif:typed-text-complete`, `uif:wizard-change`
- errors: `UIF_COMPONENT_DESTROY`, `UIF_COMPONENT_DUPLICATE`, `UIF_COMPONENT_MOUNT`, `UIF_COMPONENT_NAME`, `UIF_INVALID_ACCENT`, `UIF_LOCALE_CONFIG`, `UIF_STORAGE_KEY`, `UIF_STORAGE_PARTITION`, `UIF_UNSAFE_OBJECT`, `UIF_UNSAFE_PROPERTY_PATH`

## Envelope Authority

| Envelope | Version | Authority |
| --- | --- | --- |
| Agent Interaction | 3 | presentation-only |
| RAD Partial | 1, 2 | governed-server-html |

## Migration Rules

| ID | Since | Surface | Legacy | Replacement | Diagnostic |
| --- | --- | --- | --- | --- | --- |
| `options-json` | 2.4.0 | data-uif-options | Semicolon-delimited key:value options | A bounded JSON object using the component option schema | `legacy-options` |
| `typed-text-json` | 2.6.0 | data-uif-strings | Pipe-delimited phrase lists | A bounded JSON string array | `legacy-typed-text-strings` |
| `cross-origin-capability` | 2.6.0 | Remote URL options | Markup-only cross-origin allow flags | An application-registered exact origin/path capability plus explicit element intent | `cross-origin-capability-required` |
| `partitioned-storage` | 2.6.0 | Persisted browser convenience data | Unpartitioned global keys | configureStoragePartition() before persistence and owner-scoped cleanup at sign-out | `storage-partition-recommended` |
| `agent-envelope-version` | 2.4.0 | AI and MCP decisions | Unknown, incomplete, or unversioned decision envelopes | A governed Agent Interaction Envelope with supported version, request ID, expiry, and audit reference | `agent-envelope-unavailable` |

