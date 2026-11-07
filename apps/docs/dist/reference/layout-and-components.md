# Layout and Component Guide

Batoi UIF layout utilities are intentionally small. They provide the common grid, navbar, media, and gallery patterns needed by server-rendered RAD screens without shipping a layout framework or a runtime dependency.

## Containers and spacing

Use `.uif-container` for centered page content and `.uif-stack` for vertical rhythm. `.uif-container` sets a max inline size and enables container queries, so child grids collapse based on the content area instead of the full viewport.

```html
<main class="uif-container uif-stack">
  <section class="uif-card">
    <h1>Workspace overview</h1>
    <p>Primary page content stays aligned and readable.</p>
  </section>
</main>
```

Use `.uif-cluster` for rows of buttons, filters, chips, or small controls that should wrap.

```html
<div class="uif-cluster">
  <button class="uif-btn">Save</button>
  <button class="uif-btn uif-btn-secondary">Preview</button>
  <button class="uif-btn uif-btn-secondary">Export</button>
</div>
```

## Row-column grids

Use `.uif-grid-2`, `.uif-grid-3`, or `.uif-grid-4` when you want Bootstrap-like `row-cols-*` behavior: each direct child receives an equal column, the row has a consistent gap, and the grid collapses in narrow containers.

```html
<section class="uif-container uif-stack">
  <div class="uif-grid-3">
    <article class="uif-card">Column 1</article>
    <article class="uif-card">Column 2</article>
    <article class="uif-card">Column 3</article>
  </div>
</section>
```

Common mappings:

| Bootstrap-style intent | UIF utility   | Result                        |
| ---------------------- | ------------- | ----------------------------- |
| `row-cols-1`           | `.uif-grid`   | Single-column stacked grid    |
| `row-cols-2`           | `.uif-grid-2` | Two equal columns             |
| `row-cols-3`           | `.uif-grid-3` | Three equal columns           |
| `row-cols-4`           | `.uif-grid-4` | Four equal columns            |
| `g-*`                  | `.uif-gap-*`  | Optional gap override utility |

```html
<div class="uif-grid-4 uif-gap-3">
  <article class="uif-card">Metric</article>
  <article class="uif-card">Metric</article>
  <article class="uif-card">Metric</article>
  <article class="uif-card">Metric</article>
</div>
```

Use `.uif-grid` when you only need grid display and gap management, then add your own scoped CSS for a custom template.

```html
<section class="uif-grid dashboard-summary">
  <article class="uif-card">Main panel</article>
  <aside class="uif-card">Side panel</aside>
</section>
```

```css
.dashboard-summary {
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.35fr);
}
```

## 12-column form spans

For dense forms, use `.uif-form-grid-12` and span utilities. This is the closest UIF equivalent to Bootstrap column spans.

| Utility       | Span            |
| ------------- | --------------- |
| `.uif-col-3`  | 3 of 12 columns |
| `.uif-col-4`  | 4 of 12 columns |
| `.uif-col-6`  | 6 of 12 columns |
| `.uif-col-8`  | 8 of 12 columns |
| `.uif-col-12` | Full-width row  |

```html
<form class="uif-form-grid-12" data-uif="form">
  <label class="uif-field uif-col-6">
    <span>Name</span>
    <input class="uif-input" name="name" autocomplete="name" />
  </label>
  <label class="uif-field uif-col-6">
    <span>Email</span>
    <input class="uif-input" name="email" type="email" autocomplete="email" />
  </label>
  <label class="uif-field uif-col-4">
    <span>Role</span>
    <select class="uif-input" name="role">
      <option>Admin</option>
      <option>Editor</option>
    </select>
  </label>
  <label class="uif-field uif-col-8">
    <span>Team</span>
    <input class="uif-input" name="team" />
  </label>
  <label class="uif-field uif-col-12">
    <span>Notes</span>
    <textarea class="uif-input" name="notes"></textarea>
  </label>
</form>
```

Keep labels and inputs together inside the spanning element. That preserves accessibility and prevents responsive wrapping from separating a label from its control.

## Navbar

Navbar markup is plain HTML with light enhancement. Add `data-uif="navbar"` for registry consistency, then use `.uif-navbar`, `.uif-navbar-brand`, `.uif-navbar-nav`, `.uif-navbar-actions`, and `.uif-navbar-toggle`.

```html
<header class="uif-navbar" data-uif="navbar">
  <a class="uif-navbar-brand" href="/">
    <span data-uif-icon="grid"></span>
    Workspace
  </a>
  <nav class="uif-navbar-nav" aria-label="Primary">
    <a href="/dashboard" aria-current="page">Dashboard</a>
    <a href="/reports">Reports</a>
    <a href="/settings">Settings</a>
  </nav>
  <div class="uif-navbar-actions">
    <button class="uif-btn uif-btn-secondary" type="button">Invite</button>
    <button
      class="uif-btn uif-btn-secondary uif-navbar-toggle"
      type="button"
      data-uif-action="open"
      data-uif-target="#mobile-nav"
    >
      Menu
    </button>
  </div>
</header>
```

For mobile navigation, pair the navbar toggle with `data-uif="offcanvas"`.

```html
<aside id="mobile-nav" class="uif-offcanvas uif-offcanvas-left" data-uif="offcanvas" hidden>
  <div data-uif-role="header">
    <strong>Workspace</strong>
    <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="close">Close</button>
  </div>
  <nav class="uif-sidebar-nav" data-uif-role="body" aria-label="Mobile navigation">
    <a href="/dashboard" aria-current="page">Dashboard</a>
    <a href="/reports">Reports</a>
    <a href="/settings">Settings</a>
  </nav>
</aside>
```

For application shells, combine `.uif-navbar` with `data-uif="shell"` so the same page can support sidebar collapse, active route highlighting, skip target setup, and a mobile off-canvas menu.

```html
<div id="workspace-shell" class="uif-responsive-shell" data-uif="shell" data-uif-route="dashboard">
  <aside class="uif-sidebar uif-sidebar-desktop" data-uif-role="sidebar">
    <nav class="uif-sidebar-nav" data-uif-role="nav" aria-label="Desktop navigation">
      <a href="/dashboard" data-uif-route="dashboard">Dashboard</a>
      <a href="/reports" data-uif-route="reports">Reports</a>
    </nav>
  </aside>
  <section class="uif-shell-content">
    <header class="uif-navbar" data-uif="navbar">
      <a class="uif-navbar-brand" href="/dashboard">Workspace</a>
      <button type="button" data-uif-action="toggle-sidebar" data-uif-target="#workspace-shell">
        Collapse
      </button>
    </header>
    <main data-uif-role="main">...</main>
  </section>
</div>
```

## Carousel slider

Use `data-uif="carousel"` on the carousel region. Slides are direct or nested descendants with `data-uif-role="slide"`. Mark the initial slide with `data-uif-state="active"` when server rendering the page.

```html
<section class="uif-carousel" data-uif="carousel" aria-label="Product highlights" tabindex="0">
  <div class="uif-carousel-viewport">
    <article class="uif-carousel-slide" data-uif-role="slide" data-uif-state="active">
      <img src="/assets/highlight-1.jpg" alt="Dashboard summary screen" />
      <div class="uif-carousel-caption">
        <h2>Dashboard summary</h2>
        <p>Track operational health from a server-rendered screen.</p>
      </div>
    </article>
    <article class="uif-carousel-slide" data-uif-role="slide">
      <img src="/assets/highlight-2.jpg" alt="Mobile field console" />
      <div class="uif-carousel-caption">
        <h2>Mobile console</h2>
        <p>Use the same component contract on narrow screens.</p>
      </div>
    </article>
  </div>

  <div class="uif-carousel-controls">
    <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="previous">
      Previous
    </button>
    <span data-uif-role="status" aria-live="polite"></span>
    <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="next">Next</button>
  </div>

  <div class="uif-carousel-indicators" aria-label="Choose slide">
    <button type="button" data-uif-slide-to="0" aria-label="Show slide 1"></button>
    <button type="button" data-uif-slide-to="1" aria-label="Show slide 2"></button>
  </div>
</section>
```

Runtime behavior:

| Hook                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `data-uif-action="previous"` | Moves to the previous slide                      |
| `data-uif-action="next"`     | Moves to the next slide                          |
| `data-uif-slide-to="0"`      | Moves directly to the zero-based slide index     |
| `data-uif-role="status"`     | Receives live text such as `Slide 1 of 3`        |
| `ArrowLeft` / `ArrowRight`   | Keyboard navigation when the carousel is focused |

The carousel emits `uif:carousel-change` with the active `index`, active `slide`, and carousel `el`.

## Lightbox

Use `data-uif="lightbox"` on a gallery wrapper. Each thumbnail trigger uses `data-uif-role="item"`. The large image URL comes from `data-uif-src`, then `href`, then the nested thumbnail `img` source.

```html
<section class="uif-lightbox" data-uif="lightbox" aria-label="Project gallery">
  <div class="uif-lightbox-grid">
    <a
      href="/assets/gallery-large-1.jpg"
      data-uif-role="item"
      data-uif-caption="Dashboard overview"
    >
      <img src="/assets/gallery-thumb-1.jpg" alt="Dashboard overview" />
    </a>
    <a href="/assets/gallery-large-2.jpg" data-uif-role="item" data-uif-caption="Reports workspace">
      <img src="/assets/gallery-thumb-2.jpg" alt="Reports workspace" />
    </a>
  </div>

  <div class="uif-lightbox-dialog" data-uif-role="dialog" hidden>
    <div class="uif-lightbox-toolbar">
      <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="previous">
        Previous
      </button>
      <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="close">Close</button>
      <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="next">Next</button>
    </div>
    <img class="uif-lightbox-image" data-uif-role="image" alt="" />
    <p class="uif-lightbox-caption" data-uif-role="caption"></p>
  </div>
</section>
```

Runtime behavior:

| Hook                        | Purpose                               |
| --------------------------- | ------------------------------------- |
| `data-uif-role="item"`      | Opens the clicked thumbnail           |
| `data-uif-src`              | Optional large image URL override     |
| `data-uif-caption`          | Caption copied into the dialog        |
| `data-uif-role="dialog"`    | Modal preview surface                 |
| `data-uif-role="image"`     | Large image target                    |
| `data-uif-role="caption"`   | Caption target                        |
| `previous`, `next`, `close` | Dialog controls via `data-uif-action` |
| `Escape`, arrow keys        | Close and image navigation while open |

The lightbox emits `uif:lightbox-open` with the opened `index` and gallery `el`.

## Masonry cards and images

Use `.uif-masonry` for the default three-column masonry layout and `.uif-masonry-item` on each child. The layout is CSS-only and uses browser column layout, so it works without JavaScript; `data-uif="masonry"` is included for registry consistency and future lifecycle hooks.

```html
<section class="uif-masonry" data-uif="masonry" aria-label="Knowledge cards">
  <article class="uif-card uif-masonry-item">
    <h2>Short card</h2>
    <p>Compact summary content.</p>
  </article>
  <article class="uif-card uif-masonry-item">
    <h2>Taller card</h2>
    <p>Longer content flows naturally without forcing equal row heights.</p>
    <p class="uif-text-muted">Useful for feeds, galleries, notes, and case studies.</p>
  </article>
  <figure class="uif-masonry-item">
    <img src="/assets/site-preview.jpg" alt="Site preview" />
    <figcaption>Image cards can mix with text cards.</figcaption>
  </figure>
</section>
```

Column variants:

| Utility          | Default columns | Narrow behavior           |
| ---------------- | --------------- | ------------------------- |
| `.uif-masonry`   | 3               | 2 columns, then 1 column  |
| `.uif-masonry-2` | 2               | 1 column on small screens |
| `.uif-masonry-4` | 4               | 2 columns, then 1 column  |

Because CSS columns fill top-to-bottom before moving across, masonry is best for visual browsing and feeds. Use `.uif-grid-*` instead when row order and side-by-side comparison are more important than height packing.

## Progressive enhancement notes

Server-render meaningful HTML first. UIF should enhance it without making the content unusable when JavaScript is delayed.

Use `hidden` on inactive dialogs and non-active carousel slides in server output when possible. The component initializer will synchronize runtime state after load and after RAD partial rehydration.

Keep AI and MCP actions server-mediated. Browser-side components can render approval cards, launchers, progress, and results, but privileged tool execution stays in governed backend code.
