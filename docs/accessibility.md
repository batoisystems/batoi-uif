# Accessibility Expectations

Batoi UIF components are progressive enhancements over meaningful HTML. Server-rendered markup should remain usable without JavaScript where practical, and JavaScript should add predictable ARIA state, keyboard behavior, focus handling, and reduced-motion support.

## General Rules

- Prefer native elements before custom roles.
- Keep visible labels or `aria-label` on icon-only controls.
- Use `aria-current="page"` for active navigation links.
- Use `aria-expanded` and `aria-controls` for disclosure controls.
- Return focus to the opener after modal, drawer, off-canvas, popover, or editor overlay close.
- Do not rely on client-side confirmation or disabled states for authorization.
- Respect `prefers-reduced-motion` for animations and transitions.

## Component Matrix

| Component | Roles and state | Keyboard expectation | Focus expectation |
| --- | --- | --- | --- |
| `modal` | `role="dialog"`, `aria-modal="true"`, `aria-hidden` state | Escape closes dismissible dialogs; static-backdrop modals stay open; Tab stays inside the dialog | Focus moves into the dialog and returns to opener |
| `drawer` / `offcanvas` | `role="dialog"`, `aria-hidden` state | Escape closes the top overlay | Focus moves into the panel and returns to opener |
| `dropdown` | Trigger has `aria-haspopup="menu"` and `aria-expanded`; panel has `role="menu"`, items use `role="menuitem"`, and separators use `role="separator"` | Enter/Space toggles from the trigger; ArrowUp/ArrowDown and Home/End move across enabled items; typeahead focuses the next matching item; Escape closes | Trigger remains the anchor for open/close state and receives focus after Escape |
| `popover` | Panel defaults to `role="dialog"` | Trigger toggles; Escape closes through the overlay stack | Focus returns to opener when closed through overlay APIs |
| `tooltip` | Generated panel has `role="tooltip"` and trigger receives `aria-describedby` | Opens on focus and hover; closes on blur and mouseleave | Tooltip is non-interactive and must not trap focus |
| `tabs` | Container has `role="tablist"`; tabs use `role="tab"` and `aria-selected`; panels use `role="tabpanel"` | Left/Right and Home/End move across tabs; vertical tablists also support Up/Down; manual activation uses Enter/Space to show the focused tab | Active or focused tab is focusable; inactive tabs use `tabindex="-1"` |
| `accordion` | Trigger has `aria-expanded` and `aria-controls` | Enter and Space toggle the panel | Focus stays on the trigger |
| `toast` | `role="status"` or `role="alert"` | Close action is keyboard reachable; auto-dismiss pauses on hover and focus | Toasts should not steal focus for routine status updates |
| `table` | Native table semantics or `role="table"` for enhanced containers | Sort/filter/select controls stay keyboard reachable | Loading and empty states should be announced through surrounding context |
| `form` | Field errors should use `aria-describedby`; invalid fields use `aria-invalid` | Submit works with Enter; validation errors should be reachable | Error summary should identify invalid fields and keep server errors text-safe |
| `shell` | Nav uses `role="navigation"`; active links use `aria-current="page"` | Shell nav supports arrow movement; nested sections use disclosure controls | Skip link moves focus to the main content region |
| `mobile-shell` | Native landmarks where possible; sheet dialogs; polite offline status | Segmented controls use roving focus with arrow, Home, and End keys; touch gestures must retain button/keyboard alternatives | Safe-area and sheet behaviors should keep controls reachable |

## Overlay Stack

Overlay consumers should use `@batoi/uif-overlays` for shared stack behavior. The overlay stack emits:

- `uif:overlay-open`
- `uif:overlay-opened`
- `uif:overlay-close`
- `uif:overlay-closed`

Modal overlays add `uif-overlay-open` to `document.body` while at least one modal overlay remains open. This prevents nested overlays from unlocking page scroll too early. Modal overlays also inert and `aria-hidden` background body children by default; pass `inert: false` to the overlay engine only when the consuming component provides an equivalent background interaction policy.

Use `data-uif-backdrop="static"` when a modal must not close on backdrop click or Escape. Use `data-uif-mode="locked"` for flows where the close action itself should also be disabled until the app changes state.

Scrollable modals should put long content inside `.uif-modal-body` or `[data-uif-role="modal-body"]` so the dialog header and footer remain reachable.

## Drawer And Off-Canvas Structure

Use a fixed header row and a scrollable body row:

```html
<aside data-uif="offcanvas" class="uif-offcanvas uif-offcanvas-right" hidden>
  <div data-uif-role="header">
    <h2>Panel title</h2>
    <button type="button" data-uif-action="close">Close</button>
  </div>
  <div data-uif-role="body">
    Long scrollable content.
  </div>
</aside>
```

The body region uses contained overscroll and touch scrolling so fixed panels do not force page-level scrolling.

## Responsive Navigation

Use persistent sidebars for desktop navigation and an off-canvas copy for mobile navigation. The mobile trigger should be a real button with `data-uif-action="open"` and `data-uif-target` pointing to the off-canvas panel. Sidebar collapse triggers nested inside navbars should include `data-uif-target` pointing back to the shell so the shell, not the navbar, receives the action.

## Form Controls

Use native controls for dates, times, ranges, switches, segmented choices, and input groups. Keep visible labels attached to the native input, use `role="radiogroup"` for radio-based segmented controls, and avoid replacing native inputs with non-semantic div-only controls.

## Manual QA Checklist

- Open and close modal, drawer, off-canvas, dropdown, popover, and tooltip with keyboard only.
- Confirm focus return after closing overlays.
- Confirm Escape closes only the top overlay.
- Confirm active navigation receives `aria-current="page"`.
- Confirm reduced-motion mode does not rely on animation timing.
- Confirm long drawer/off-canvas content scrolls inside the panel, not the page.
