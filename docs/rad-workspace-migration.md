# Batoi RAD Workspace UIF Migration

Use this guide when migrating workspace-scoped Batoi RAD route families from Bootstrap, jQuery, Bootstrap Table, Chart.js, and Summernote toward Batoi UIF.

## Shell Template

Load the browser distribution once in the shared shell template:

```html
<link rel="stylesheet" href="/assets/uif/uif.css">
<script src="/assets/uif/uif.iife.js"></script>
<script>BatoiUIF.autoStart();</script>
```

Use `data-uif="shell"` on the server-rendered workspace shell:

```html
<div
  id="workspace-shell"
  class="uif-app-shell-fixed"
  data-uif="shell"
  data-uif-route="guard.analytics"
  data-uif-sidebar-key="workspace:sidebar"
  data-uif-density-key="workspace:density">
  <a class="uif-skip-link" data-uif-role="skip-link">Skip to content</a>

  <aside class="uif-sidebar uif-sidebar-fixed" data-uif-role="sidebar">
    <nav class="uif-sidebar-nav" data-uif-role="nav" aria-label="Workspace">
      <a href="/workspace/core" data-uif-route="core"><span data-uif-icon="home"></span><span>Core</span></a>
      <a href="/workspace/guard/analytics" data-uif-route="guard.analytics"><span data-uif-icon="shield"></span><span>Guard</span></a>
      <button type="button" data-uif-action="toggle-section">Build</button>
      <div>
        <a href="/workspace/build/apps" data-uif-route="build.apps">Apps</a>
      </div>
    </nav>
  </aside>

  <div class="uif-shell-content">
    <header class="uif-topbar">
      <button class="uif-btn uif-btn-secondary uif-icon-btn" type="button" data-uif-action="toggle" data-uif-target="#workspace-shell" aria-label="Toggle navigation">
        <span data-uif-icon="sidebar"></span>
      </button>
      <div class="uif-page-actions">
        <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="set-density" data-uif-density="compact">Compact</button>
        <button class="uif-btn uif-btn-secondary" type="button" data-uif-action="set-density" data-uif-density="comfortable">Comfortable</button>
      </div>
    </header>

    <main class="uif-scroll-region" data-uif-role="main">
      <!-- route pagepart output -->
    </main>
  </div>
</div>
```

## Route Structure

Keep RAD route parts server-owned:

- `prepart`: prepare authorization, route state, filters, form defaults, and server data.
- `pagepart`: render semantic HTML with `data-uif-*` hooks.
- `postpart`: handle mutations, validation, redirects, and trusted partial responses.

UIF enhances the rendered HTML. It does not replace server-side authorization, sanitization, or audit logging.

## Partial Rehydration

When RAD returns trusted partial HTML, target a region and let UIF rehydrate the replacement:

```html
<button
  class="uif-btn"
  type="button"
  data-uif="ajax"
  data-uif-src="/workspace/guard/register"
  data-uif-target="#guard-register"
  data-uif-swap="inner">
  Refresh
</button>

<section id="guard-register">
  <!-- server-rendered rows -->
</section>
```

## Register Route

Use native table markup with UIF table hooks:

```html
<section class="uif-card uif-card-flush" id="users-register">
  <div class="uif-card-head">
    <label class="uif-search">
      <span data-uif-icon="search"></span>
      <input type="search" data-uif-table-filter="#users-table" placeholder="Search users">
    </label>
  </div>

  <table id="users-table" class="uif-table" data-uif="table">
    <thead>
      <tr>
        <th><input type="checkbox" aria-label="Select all"></th>
        <th data-uif-sort="name">Name</th>
        <th data-uif-sort="role">Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" aria-label="Select Ada Lovelace"></td>
        <td>Ada Lovelace</td>
        <td>Owner</td>
        <td><span class="uif-badge uif-badge-success">Active</span></td>
      </tr>
    </tbody>
  </table>
</section>
```

## Manage Form Route

Use normal forms first, then add UIF validation and async hooks:

```html
<form
  class="uif-card uif-stack"
  data-uif="form"
  data-uif-src="/workspace/guard/save"
  data-uif-method="POST"
  data-uif-target="#form-result">
  <input type="hidden" name="csrf_token" value="{{csrf_token}}">

  <label class="uif-field">
    Name
    <input class="uif-input" name="name" data-uif-rule="required|minLength:3">
  </label>

  <section data-uif="accordion">
    <button type="button" data-uif-role="trigger">Advanced</button>
    <div data-uif-role="panel">
      <label class="uif-field">Notes <textarea class="uif-input" name="notes"></textarea></label>
    </div>
  </section>

  <button class="uif-btn" type="submit" data-uif-confirm="Save this record?">Save</button>
  <div id="form-result"></div>
</form>
```

## Analytics Route Without Chart.js

Prefer UIF charts or server-rendered accessible summaries:

```html
<div
  data-uif="chart"
  data-uif-chart="bar"
  data-uif-options='{"legend":true}'
  data-uif-data='[
    {"label":"Allowed","value":72},
    {"label":"Reviewed","value":19},
    {"label":"Blocked","value":9}
  ]'>
</div>
```

For low-JavaScript route summaries, render percentage bars with accessible labels:

```html
<section class="uif-card" aria-label="Guard policy outcomes">
  <div class="uif-stack">
    <div>
      <strong>Allowed</strong>
      <div class="uif-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72" style="--uif-progress:72%"></div>
    </div>
    <div>
      <strong>Blocked</strong>
      <div class="uif-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="9" style="--uif-progress:9%"></div>
    </div>
  </div>
</section>
```

## Editor Route Without Summernote

Use the dependency-free editor package with server-side sanitization:

```html
<textarea
  name="body"
  data-uif="editor"
  data-uif-mode="markdown"
  data-uif-preview="live"
  data-uif-editor-layout="split"
  data-uif-toolbar="bold italic heading quote code ul ol task link image table preview">
## Workspace note
</textarea>
```

Browser-side preview is convenience only. Sanitize and authorize stored HTML on the server.
