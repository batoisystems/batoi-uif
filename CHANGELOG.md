# Changelog

## 3.0.0-alpha.1

- Published the first v3 prerelease after the complete lifecycle, registry, configuration, capability, localization, security, Micro App, AI/MCP, documentation, reference-application, and compatibility gates passed.
- Retains the diagnostic compatibility entry for v2 behavior during migration; strict v3 behavior remains opt-in through `configureCompatibility({ mode: 'v3' })` during the alpha cycle.
- Establishes the alpha acceptance baseline for real RAD, Micro App, PWA, and governed agent integrations before beta promotion.

## 2.7.0

- Added governed Micro App sync and PWA offline work with principal ownership, expiry, conflict recovery, retry/capacity bounds, and owner-scoped cleanup.
- Added machine-readable DOM, interaction, shell, and offline capability groups while preserving package-level runtime boundaries.
- Added a diagnostic v3 compatibility entry point and typed migration rules with generated migration, accessibility, and security references.
- Added strict CSP/Trusted Types browser coverage and cross-browser smoke journeys for the canonical RAD, Micro App, dashboard, mobile, desktop, PWA, AI, and MCP reference applications.
- Split shared component implementation helpers into a private module without changing the established component facade.

## 2.6.0

- Closed the canonical declarative attribute, action, event, state, error, component, and envelope registries with generated references and contract tests.
- Added exact path-boundary cross-origin capabilities, mandatory registered capabilities at remote call sites, partitioned application/tenant/principal storage, and expanded automated security-policy gates.
- Added shared bounded JSON parsing and resource ownership primitives, then adopted them across configuration, actions, effects, charts, AI, MCP, and registry-managed component lifecycle paths.
- Added locale, direction, number, currency, date, and message hooks; completed logical-direction CSS and RTL checks while retaining high-contrast, forced-colors, and density modes.
- Added server-provided MCP tool discovery and fail-closed v3 approval review behavior for incomplete or expired requests.

## 2.5.0

- Added curated All, RAD, Dashboard, Mobile, Desktop, and Agent package profiles without introducing a second runtime.
- Added typed metadata for every declarative component and shared Agent/RAD envelope authorities, with generated JSON and Markdown contract references.
- Unified root, target, and refresh hydration ownership; every documented `data-uif` component now participates in the runtime registry.
- Added a versioned design-token inventory with compact-density, high-contrast, forced-colors, and reduced-motion modes.
- Added deterministic CycloneDX SBOM and SLSA/in-toto-style provenance artifacts, covered by the release integrity manifest and reproducibility checks.

## 2.4.0

- Added the v3-compatible component registry with idempotent mount/update/suspend/resume/destroy ownership and a single all-in-one hydration path.
- Added typed errors, bounded configuration parsing, safe object/path handling, URL capability policies, strict compatibility diagnostics, and privacy-safe opt-in diagnostics.
- Added a machine-readable compatibility baseline and CI security-policy checks for dangerous sinks and third-party runtime dependencies.
- Added a provider-neutral Agent Interaction Envelope, assistant threads/composer/stream/actions, governed AI gateway transport, and fail-closed compatibility notices.
- Added tool plans, permissions, reviews, one-shot decisions, progress, results, receipts, and a governed tool gateway transport while retaining server authority.
- Added a bounded, versioned, transactional IndexedDB Micro App store with atomic imports and browser coverage.

## 2.3.0

- Added searchable example navigation covering every example and component-gallery pattern.
- Added complete 12-column and logical margin/padding utility matrices with values from zero through five.
- Added copy-ready typography, list-group, counter, horizontal-tab, breadcrumb, button-group, theme, image-slider-generator, and widget-generator examples.
- Extended the dependency-free carousel with configurable visible-item and navigation-step counts, including accessible status updates and regression coverage.
- Added persisted light/dark example theming with an early theme application and matching UIF logo variants.
- Corrected typed-text and testimonial code samples and ensured inactive testimonial slides remain hidden.
- Kept arbitrary website crawling/XML export on the governed server side; the browser framework does not bypass CORS, credential, SSRF, or content-permission controls.

## 2.2.0

- Added complete, copy-ready component gallery samples generated from each live preview.
- Added multi-image and testimonial carousel examples using the existing accessible carousel contract.
- Added dependency-free typed text with declarative options, lifecycle cleanup, and reduced-motion behavior.
- Added visible, copyable per-icon CSS and first-party Facebook, GitHub, Instagram, LinkedIn, X/Twitter, and YouTube marks.
- Added a stronger typography hierarchy, system-font fallbacks, semantic weights, text utilities, and semantic icon colors without a webfont dependency.
- Added focused unit and cross-browser gallery regression coverage.

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
