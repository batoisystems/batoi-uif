# Generated Batoi UIF Contract Reference

Framework 2.6.0; contract version 3. This file is generated from typed source definitions.

## Profiles

| Profile | Entry point | Packages | Purpose |
| --- | --- | --- | --- |
| all | `@batoi/uif-profiles/all` | core, dom, query, net, state, actions, effects, overlays, components, forms, editor, table, router, rad-adapter, charts, dashboard, desktop, realtime, pwa, push, mobile, ai, mcp, icons, extension-kit | Complete namespace-based framework surface for tooling and broad applications. |
| rad | `@batoi/uif-profiles/rad` | core, dom, net, state, actions, components, forms, editor, table, router, rad-adapter, icons | Server-rendered Batoi RAD applications and partial updates. |
| dashboard | `@batoi/uif-profiles/dashboard` | core, dom, net, state, components, table, charts, dashboard, realtime, icons | Data-rich dashboards and realtime operational views. |
| mobile | `@batoi/uif-profiles/mobile` | core, dom, net, state, components, mobile, pwa, push, realtime, icons | Mobile shells, progressive web apps, offline status, and notifications. |
| desktop | `@batoi/uif-profiles/desktop` | core, dom, net, state, components, desktop, pwa, realtime, icons | Desktop-style workspaces and resilient application shells. |
| agent | `@batoi/uif-profiles/agent` | core, dom, net, components, ai, mcp, icons | Provider-neutral assistant and governed tool-review interfaces. |

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

## Canonical Registries

- attributes: `data-uif`, `data-uif-id`, `data-uif-role`, `data-uif-action`, `data-uif-target`, `data-uif-src`, `data-uif-method`, `data-uif-trigger`, `data-uif-state`, `data-uif-bind`, `data-uif-model`, `data-uif-value`, `data-uif-route`, `data-uif-mode`, `data-uif-options`, `data-uif-confirm`, `data-uif-disabled`, `data-uif-loading`, `data-uif-success`, `data-uif-error`, `data-uif-swap`, `data-uif-cache`, `data-uif-validate`, `data-uif-rule`, `data-uif-event`, `data-uif-on`, `data-uif-refresh`, `data-uif-persist`, `data-uif-density`, `data-uif-sidebar-key`, `data-uif-density-key`, `data-uif-toolbar`, `data-uif-preview`, `data-uif-animation`, `data-uif-duration`, `data-uif-delay`, `data-uif-placement`, `data-uif-container`, `data-uif-html`, `data-uif-backdrop`, `data-uif-scroll`, `data-uif-breakpoint`, `data-uif-class`, `data-uif-attribute`, `data-uif-key`, `data-uif-envelope`, `data-uif-interval`, `data-uif-message`, `data-uif-messages`
- components: `button`, `modal`, `drawer`, `offcanvas`, `dropdown`, `tabs`, `toast`, `accordion`, `alert`, `badge`, `breadcrumb`, `collapse`, `tooltip`, `popover`, `progress`, `spinner`, `skeleton`, `pagination`, `command-menu`, `navbar`, `sidebar`, `stepper`, `wizard`, `file-upload`, `combobox`, `carousel`, `lightbox`, `masonry`, `card`, `table`, `form`, `editor`, `ajax`, `route`, `shell`, `nav`, `chart`, `animate`, `realtime`, `push`, `mobile-shell`, `desktop-shell`, `ai-action`, `ai-thread`, `ai-composer`, `agent-tool`, `tool-approval`, `typed-text`, `dashboard`, `install-prompt`
- actions: `open`, `close`, `toggle`, `toggle-sidebar`, `toggle-section`, `submit`, `load`, `reload`, `delete`, `save`, `reset`, `clear`, `select`, `activate`, `deactivate`, `navigate`, `swap`, `append`, `prepend`, `remove`, `toast`, `set-density`, `animate`, `add-class`, `remove-class`, `toggle-class`, `set-attribute`, `remove-attribute`, `set-value`, `copy`, `scroll-to`, `focus`, `emit`, `subscribe`, `connect`, `disconnect`, `approve`, `reject`, `edit`, `install`, `next`, `preview`, `previous`, `unsubscribe`
- states: `idle`, `loading`, `loaded`, `error`, `success`, `active`, `inactive`, `open`, `closed`, `disabled`, `selected`, `expanded`, `collapsed`, `connected`, `disconnected`, `pending`, `approved`, `rejected`, `available`, `busy`, `completed`, `connecting`, `decision-pending`, `dirty`, `empty`, `expired`, `failed`, `installed`, `offline`, `online`, `saved`, `saving`, `submitting`, `unavailable`, `waiting-approval`
- events: `uif:before-init`, `uif:init`, `uif:before-destroy`, `uif:destroy`, `uif:error`, `uif:runtime:mounted`, `uif:runtime:error`, `uif:runtime:diagnostic`, `uif:diagnostic`, `uif:agent:submit`, `uif:agent:cancel`, `uif:agent:error`, `uif:agent:feedback`, `uif:agent:retry`, `uif:agent:copy`, `uif:tool-approve`, `uif:tool-reject`, `uif:tool-expired`, `uif:tool-invalid-review`, `uif:tool-replay-blocked`, `uif:accordion-toggle`, `uif:action-diagnostic`, `uif:ai-action`, `uif:ai-error`, `uif:ai-history-select`, `uif:ai-stream-cancel`, `uif:animation-end`, `uif:animation-start`, `uif:before-load`, `uif:carousel-change`, `uif:chart-drilldown`, `uif:chart-drilldown-error`, `uif:chart-error`, `uif:chart-export`, `uif:chart-refresh`, `uif:chart-select`, `uif:collapse-close`, `uif:collapse-open`, `uif:combobox-change`, `uif:command-menu-close`, `uif:command-menu-open`, `uif:complete`, `uif:connector-error`, `uif:dashboard-error`, `uif:desktop-change`, `uif:desktop-error`, `uif:drawer-close`, `uif:drawer-open`, `uif:dropdown-close`, `uif:dropdown-open`, `uif:editor-autosave`, `uif:editor-autosave-error`, `uif:editor-blur`, `uif:editor-change`, `uif:editor-command`, `uif:editor-destroy`, `uif:editor-diagnostics`, `uif:editor-error`, `uif:editor-focus`, `uif:editor-init`, `uif:editor-layout-change`, `uif:editor-mode-change`, `uif:editor-normalize`, `uif:editor-preview`, `uif:editor-reset`, `uif:editor-upload-error`, `uif:editor-validate`, `uif:field-errors`, `uif:file-select`, `uif:form-dirty`, `uif:form-error`, `uif:form-submit`, `uif:form-success`, `uif:form-touched`, `uif:lightbox-close`, `uif:lightbox-open`, `uif:load`, `uif:modal-close`, `uif:modal-open`, `uif:notification`, `uif:offcanvas-close`, `uif:offcanvas-open`, `uif:offline-error`, `uif:offline-queued`, `uif:offline-synced`, `uif:pagination-change`, `uif:popover-close`, `uif:popover-open`, `uif:presence`, `uif:push-change`, `uif:push-error`, `uif:pwa-install`, `uif:rad-before`, `uif:rad-error`, `uif:rad-success`, `uif:realtime-error`, `uif:realtime-message`, `uif:realtime-state`, `uif:rehydrate`, `uif:request`, `uif:response`, `uif:route-before`, `uif:route-error`, `uif:route-success`, `uif:router-error`, `uif:segment-change`, `uif:select`, `uif:shell-density`, `uif:table-before-load`, `uif:table-bulk-action`, `uif:table-error`, `uif:table-filter`, `uif:table-load`, `uif:table-loaded`, `uif:table-page`, `uif:table-page-size`, `uif:table-reset`, `uif:table-row-action`, `uif:table-select`, `uif:table-selection`, `uif:table-sort`, `uif:table-state`, `uif:tabs-change`, `uif:toast`, `uif:tool-confirmation-required`, `uif:typed-text-complete`, `uif:wizard-change`
- errors: `UIF_COMPONENT_DESTROY`, `UIF_COMPONENT_DUPLICATE`, `UIF_COMPONENT_MOUNT`, `UIF_COMPONENT_NAME`, `UIF_INVALID_ACCENT`, `UIF_LOCALE_CONFIG`, `UIF_STORAGE_KEY`, `UIF_STORAGE_PARTITION`, `UIF_UNSAFE_OBJECT`, `UIF_UNSAFE_PROPERTY_PATH`

## Envelope Authority

| Envelope | Version | Authority |
| --- | --- | --- |
| Agent Interaction | 3 | presentation-only |
| RAD Partial | 1, 2 | governed-server-html |

