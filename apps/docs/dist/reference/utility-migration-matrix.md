# UIF Utility and Migration Matrix

Batoi UIF utilities are curated for server-rendered app screens. They are not a Tailwind-style arbitrary utility engine. Prefer components for repeated UI, tokens for theme values, and utilities for layout, spacing, alignment, visibility, and small composition adjustments.

## Utility Matrix

| Area | UIF classes | Notes |
| --- | --- | --- |
| Layout containers | `.uif-container`, `.uif-app-shell`, `.uif-app-shell-fixed`, `.uif-responsive-shell`, `.uif-shell-content`, `.uif-main`, `.uif-scroll-region` | Use shell classes for app frames and `.uif-container` for bounded content. |
| Display | `.uif-block`, `.uif-inline`, `.uif-inline-block`, `.uif-contents`, `.uif-hidden` | `.uif-hidden` is a hard display override. Prefer native `hidden` for state when JavaScript toggles visibility. |
| Flex | `.uif-flex`, `.uif-flex-col`, `.uif-flex-wrap`, `.uif-cluster`, `.uif-items-start`, `.uif-items-center`, `.uif-items-end`, `.uif-justify-between`, `.uif-justify-center` | `.uif-cluster` is the default action-row pattern. |
| Grid | `.uif-grid`, `.uif-grid-2`, `.uif-grid-3`, `.uif-grid-4`, `.uif-form-grid`, `.uif-form-grid-12`, `.uif-picker-grid` | Grid utilities collapse through container/media rules where defined. |
| Gap | `.uif-gap-1` through `.uif-gap-6` | Maps to `--uif-space-*` tokens. |
| Spacing | `.uif-m-0` through `.uif-m-4`, `.uif-mx-auto`, `.uif-mt-*`, `.uif-mb-*`, `.uif-p-0` through `.uif-p-6`, `.uif-px-*`, `.uif-py-*` | Keep spacing token-based; avoid arbitrary spacing classes. |
| Sizing | `.uif-w-full`, `.uif-h-full`, `.uif-min-h-screen`, `.uif-col-3`, `.uif-col-4`, `.uif-col-6`, `.uif-col-8`, `.uif-col-12` | Column classes are intended for `.uif-form-grid-12`. |
| Text | `.uif-text-sm`, `.uif-text-md`, `.uif-text-lg`, `.uif-text-xl`, `.uif-font-normal`, `.uif-font-medium`, `.uif-font-bold`, `.uif-text-left`, `.uif-text-center`, `.uif-text-right`, `.uif-text-muted`, `.uif-text-primary` | Use component headings for larger display patterns. |
| Color and surface | `.uif-bg-surface`, `.uif-bg-elevated`, `.uif-text-success`, `.uif-text-warning`, `.uif-text-danger`, `.uif-text-info`, `.uif-text-white` | Prefer semantic component variants for alerts, badges, buttons, and toasts. |
| Borders and radius | `.uif-border`, `.uif-rounded-sm`, `.uif-rounded`, `.uif-rounded-lg` | Radius classes map to UIF radius tokens. |
| Shadow | `.uif-shadow-sm`, `.uif-shadow-md` | Use sparingly on elevated panels and cards. |
| Overflow | `.uif-overflow-auto`, `.uif-overflow-hidden` | Use drawer/offcanvas body classes for scroll-safe fixed panels. |
| Position | `.uif-relative`, `.uif-absolute`, `.uif-sticky`, `.uif-top-0`, `.uif-bottom-0` | Overlay placement should use UIF overlay APIs, not manual positioning. |
| Z-index | `.uif-z-dropdown`, `.uif-z-modal` | Toast, modal, dropdown, popover, and drawer components include z-index defaults. |
| Visibility and accessibility | `.uif-hidden`, `.uif-sr-only`, `.uif-skip-link` | Keep accessible names and labels in markup. |
| Interaction | `.uif-cursor-pointer`, `.uif-select-none`, `.uif-pointer-events-none`, `.uif-focus-ring`, `.uif-touch-target` | `.uif-touch-target` helps mobile controls meet minimum target size. |
| Safe area | `.uif-safe-top`, `.uif-safe-bottom` | Use in mobile/PWA shells. |
| Responsive/container behavior | `@container (max-width: 40rem)` support for `.uif-grid*`, `.uif-sm-stack`; `@media (max-width:48rem)` app shell/form helpers | UIF keeps responsive variants bounded instead of generating all breakpoint/class combinations. |

## Migration Snippets

### Bootstrap Tooltip To UIF Tooltip

```html
<!-- Bootstrap -->
<button type="button" data-bs-toggle="tooltip" data-bs-title="Export report">Export</button>

<!-- UIF -->
<button type="button" data-uif="tooltip" data-uif-message="Export report">Export</button>
```

UIF tooltip content is text-safe by default. Use `data-uif-placement` where placement matters, and keep icon-only tooltip triggers labeled with `aria-label`.

### Bootstrap Offcanvas To UIF Drawer/Offcanvas

```html
<!-- Bootstrap -->
<button data-bs-toggle="offcanvas" data-bs-target="#navPanel">Menu</button>
<div id="navPanel" class="offcanvas offcanvas-start">
  <div class="offcanvas-header">Navigation</div>
  <div class="offcanvas-body">Links</div>
</div>

<!-- UIF -->
<button data-uif-action="open" data-uif-target="#navPanel">Menu</button>
<aside id="navPanel" class="uif-offcanvas uif-offcanvas-left" data-uif="offcanvas" hidden>
  <div data-uif-role="header">Navigation</div>
  <nav data-uif-role="body">Links</nav>
</aside>
```

`drawer` is the UIF app/RAD term; `offcanvas` is the Bootstrap migration alias. Put fixed controls in `[data-uif-role="header"]` and scrollable content in `[data-uif-role="body"]`.

### Tailwind Utility-Heavy Layout To UIF

```html
<!-- Tailwind-style -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-lg border shadow-sm">
  <article class="flex items-center justify-between gap-3">...</article>
  <article class="flex items-center justify-between gap-3">...</article>
  <article class="flex items-center justify-between gap-3">...</article>
</section>

<!-- UIF utility composition -->
<section class="uif-grid-3 uif-gap-4 uif-p-6 uif-rounded-lg uif-border uif-shadow-sm">
  <article class="uif-cluster uif-justify-between">...</article>
  <article class="uif-cluster uif-justify-between">...</article>
  <article class="uif-cluster uif-justify-between">...</article>
</section>

<!-- UIF component composition -->
<section class="uif-dashboard-grid">
  <article class="uif-dashboard-widget">...</article>
  <article class="uif-dashboard-widget">...</article>
  <article class="uif-dashboard-widget">...</article>
</section>
```

## Feature Matrix

| Capability | Bootstrap | Tailwind | Batoi UIF |
| --- | --- | --- | --- |
| Buttons, badges, alerts, cards | Strong component defaults | Requires composition or plugins | Component classes plus app-focused variants |
| Modals and overlays | Strong JS components, Popper where needed | Not built in | Dependency-free modal, drawer/offcanvas, dropdown, tooltip, popover, overlay stack |
| Offcanvas navigation | Built in | Composed manually | `drawer`/`offcanvas` with scroll-safe layout and shell examples |
| Utilities | Moderate | Extensive generated utility system | Curated bounded utilities for app screens |
| Forms | Styling and basic states | Styling through utilities | Validation, async submit, server errors, native control conventions |
| Tables | Basic styling | Manual composition | Sort/filter/select, remote rows, pagination metadata, actions, states |
| Charts | Not first-class | Not first-class | Dependency-free SVG charts |
| Server-rendered partials | Not first-class | Not first-class | RAD adapter, declarative swaps, rehydration |
| Realtime/PWA/push | Not first-class | Not first-class | Dedicated packages for polling/SSE/WebSocket, install, push, mobile shell |
| AI/MCP UI | Not first-class | Not first-class | Browser-side governed approval/progress/result UI |
| Runtime dependencies | Bootstrap JS and optional Popper model | CSS build-time framework | Zero external runtime dependencies in framework packages |

## Guidance

- Use utilities for one-off layout and spacing.
- Use components for repeated controls, stateful behavior, accessibility expectations, and RAD workflows.
- Do not introduce arbitrary-value utility generation unless there is a clear product need and a CSS budget review.
- Keep app examples dense, operational, and server-rendered friendly.
