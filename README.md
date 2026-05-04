# Batoi UIF — Unified Interface Framework

Batoi UIF is a dependency-free, HTML-first frontend framework for server-rendered and progressive web apps.

> Status: **v0 experimental**

## Installation

```bash
pnpm install
```

## CDN usage (placeholder)

```html
<!-- TODO: publish CDN bundles -->
<script type="module" src="https://cdn.example.com/batoi-uif.js"></script>
```

## npm usage

```bash
pnpm add @batoi/uif-core @batoi/uif-components @batoi/uif-rad-adapter
```

## Quick example

```html
<button data-uif="ajax" data-uif-src="/partial/customers" data-uif-target="#customers">Reload</button>
<div id="customers"></div>
```

## Philosophy

- HTML-first, JavaScript-enhanced
- Zero runtime dependencies
- Accessibility by default
- Server-rendered friendly

## Packages

- `@batoi/uif-core`
- `@batoi/uif-css`
- `@batoi/uif-dom`
- `@batoi/uif-net`
- `@batoi/uif-state`
- `@batoi/uif-forms`
- `@batoi/uif-router`
- `@batoi/uif-pwa`
- `@batoi/uif-components`
- `@batoi/uif-rad-adapter`

## PHP-friendly RAD snippets

### RAD list reload

```html
<button data-uif="ajax" data-uif-action="reload" data-uif-src="/customers/list" data-uif-target="#list">Reload</button>
<div id="list"></div>
```

### RAD modal form

```html
<form data-uif="form" data-uif-src="/customer/save" data-uif-method="POST" data-uif-target="#modal-body"></form>
```

### RAD delete confirm

```html
<button data-uif="ajax" data-uif-action="delete" data-uif-confirm="Delete record?" data-uif-src="/customer/delete/12">Delete</button>
```

### RAD dashboard card refresh

```html
<div id="kpi" data-uif="ajax" data-uif-action="reload" data-uif-src="/dashboard/kpi" data-uif-target="#kpi"></div>
```


## Where the code is

If you are browsing the repository root, the framework source code is under `packages/*/src/`.

- `packages/core/src/index.js`
- `packages/dom/src/index.js`
- `packages/net/src/index.js`
- `packages/forms/src/index.js`
- `packages/components/src/index.js`
- `packages/rad-adapter/src/index.js`

A root `index.js` is also provided as a convenience entry point for quick discovery.

## Development

```bash
pnpm lint
pnpm test
pnpm build
pnpm dev:docs
```
