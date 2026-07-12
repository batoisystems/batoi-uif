# Changelog

## 2.1.2

- Corrected the npm lockfile so clean installs retain the published `fast-json-stable-stringify@2.1.0` artifact and original `punycode` range.
- Added a release verification guard that rejects lockfile tarball URLs whose embedded version does not match the locked package version.

## 2.1.1

- Fixed all Markdown example preview layouts, including immediate modal and drawer presentation with accessible state feedback.
- Made Markdown quote formatting reversible while preserving headings, lists, indentation, and multi-line selections.
- Standardized primary example navigation and replaced legacy Batoi marks with the official UIF logo in static markup.
- Added cross-browser regression coverage for example navigation, branding, preview layouts, and quote behavior.

## 2.1.0

- Rebuilt the rich HTML and Markdown editors around deterministic formatting, source fidelity, structured Markdown parsing, selection-aware history, accessible dialogs/toolbars, and governed autosave/upload hooks.
- Added Chromium, Firefox, WebKit, and mobile Chromium editor regression coverage.
- Centralized HTML sanitization, URL/origin policy, Trusted Types support, CSP guidance, and machine-verified package trust boundaries.
- Hardened forms, tables, router/RAD partials, network retries/uploads/connectors, persistence, realtime, PWA/offline, push, mobile, AI, and MCP browser behavior with bounded payloads and lifecycle cleanup.
- Added artifact checksums and SRI, public declaration signature baselines, package and aggregate size budgets, package-content verification, and offline packed-install smoke testing.
- Reconciled package, example, documentation, roadmap, distribution, and public website release messaging.

## 2.0.0

- Added expanded dependency-free SVG chart coverage for business, finance, dense composition, and cyclical visualization use cases.
- Added Flint-compatible chart input adaptation without bundling Flint or third-party renderer dependencies.
- Expanded the first-party SVG icon registry for application, workflow, commerce, chart, device, communication, content, and domain interfaces.
- Added chart compatibility documentation and updated the chart gallery with new native and Flint-compatible examples.
- Rebuilt distribution bundles and package artifacts for the v2 release.

## 0.1.0

- Added dependency-free browser distribution files.
- Added query, effects, overlays, and table packages.
- Expanded components, forms, RAD, charts, realtime, push, PWA, AI, and MCP capabilities.
- Added scenario examples and release verification gates.
