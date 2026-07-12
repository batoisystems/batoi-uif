# Batoi UIF Security Model

Batoi UIF is a browser UI framework. It does not replace server-side authorization, validation, escaping, rate limiting, audit logging, or privileged tool governance.

## Trust Boundary Inventory

[`security-boundaries.json`](../security-boundaries.json) is the machine-readable package inventory for HTML, URL, selector, navigation, network, realtime, storage, service-worker, and privileged-authority boundaries. Every framework package must appear, including packages with no executable trust boundary. `npm run verify:release` rejects missing packages, unknown categories, and missing policy summaries so new packages cannot bypass classification.

## Trusted HTML Boundary

Batoi UIF supports server-rendered partial HTML for RAD applications. This is intentional: `data-uif="ajax"`, form swaps, route partials, remote table HTML, and chart drilldown targets may receive HTML from the server.

Treat these responses as trusted server output:

- Generate them on a governed backend.
- Escape user-controlled data before including it in HTML.
- Do not pass unreviewed third-party HTML into swap responses.
- Use Content Security Policy where possible.
- Keep destructive and privileged operations server-side.

The shared DOM helpers make this boundary explicit:

- `setText()` renders text safely.
- `appendTextElement()` creates a text-backed element.
- `sanitizeHTML()` parses a limited safe subset and strips blocked tags, event handlers, and unsafe URLs.
- `setSafeHTML()` renders that limited subset for non-authoritative UI snippets.
- `setTrustedHTML()` refuses HTML unless marked as trusted.
- `swapTrustedHTML()` performs intentional server-rendered HTML swaps.

## URL and Origin Policy

`@batoi/uif-dom` provides `isSafeURL()` for context-aware URL checks. Link contexts permit governed web, email, telephone, fragment, and relative URLs. Image, network, and navigation contexts use narrower protocol defaults and reject protocol-relative URLs, control characters, and unsafe schemes.

RAD requests are same-origin by default. A specific source element may opt into an approved cross-origin endpoint with `data-uif-allow-cross-origin="true"`; the remote server must still enforce CORS, authentication, authorization, CSRF protections where applicable, and response integrity. RAD response redirects remain same-origin.

Malformed target selectors resolve to no target instead of stopping framework initialization.

RAD, router, chart, realtime, table, form, push, and service-worker network/navigation URLs are same-origin by default. Approved cross-origin chart, realtime, table, form, and RAD sources require `data-uif-allow-cross-origin="true"`; programmatic router, chart, and table options expose the equivalent explicit flag. Push and service-worker endpoints remain same-origin. WebSocket `ws:`/`wss:` origins are compared with their HTTP/HTTPS page equivalents.

## Trusted Types and CSP

Applications that enforce Trusted Types can register their governed policy once. UIF routes shared safe and trusted HTML sinks through that policy:

```ts
import { configureTrustedTypes } from '@batoi/uif-dom';

const policy = window.trustedTypes?.createPolicy('batoi-uif', {
  createHTML: (html) => html,
});

configureTrustedTypes(policy ?? null);
```

The policy callback must not be used as a sanitizer. `setSafeHTML()` still applies UIF's allowlist before rendering; `setTrustedHTML()` remains restricted to explicitly trusted, governed server output.

Framework-owned rendering in the editor, charts, dashboard, desktop shell, icons, and query helpers also passes through the registered policy. The following public string APIs intentionally retain trusted-HTML semantics for compatibility and must not receive untrusted user, model, feed, or tool output:

- `UIFQuery.html()`, string `append()`/`prepend()`, and `fragment()`.
- `DashboardWidget.html` for custom widgets.
- `DesktopShellOptions.bodyHtml`.

Use text nodes or `setSafeHTML()` when the source is not already governed. Registering a permissive Trusted Types policy does not make these values safe.

A practical CSP baseline should start with `default-src 'self'`, narrow `script-src`, `style-src`, `img-src`, `connect-src`, and `frame-src` for the application, and add `require-trusted-types-for 'script'` plus an application-specific `trusted-types` policy name when browser support and deployed code have been verified. Do not copy a CSP verbatim without accounting for the application's real asset, API, WebSocket, and image origins.

## Safe-by-Default Rendering

Dynamic text in forms, realtime feeds, AI UI, MCP UI, and generated remote table rows is rendered as text by default. Markup in server error messages, feed payloads, model output, or tool payloads should appear as text unless the consuming app explicitly chooses a trusted HTML path.

Remote table payloads require an object response and enforce default row, column, cell-text, and trusted-HTML render limits. JSON row values are converted to bounded text. HTML row payloads remain explicitly trusted server output and are length-bounded, not sanitized; applications must generate them on an authorized backend. Keyed stale loads cannot delete ownership of a newer active request.

Router partials are same-origin by default, capped at 1,000,000 HTML characters, keyed so stale navigation is cancelled, and committed to history only after a successful current load. Asynchronous route guards prevent native navigation before awaiting application policy. Route HTML remains trusted server output.

RAD responses accept envelope versions 1 and 2 when a version is supplied. Envelopes are object-only, trusted HTML is capped at 1,000,000 characters, event/action/error collections are bounded, and actions are limited to toast, focus, and same-origin redirect UI behavior. These browser checks do not authorize the underlying request or action; server permissions, validation, CSRF, replay protection, and audit remain authoritative.

Realtime remote payloads default to a 1 MB browser limit and are rejected before subscriber delivery when oversized or unserializable. Reconnect attempts are bounded, jittered, capped, and suspended while the document is hidden. These browser controls do not replace server message limits, authentication, channel authorization, rate limiting, replay controls, or connection quotas.

Rich editor content uses the shared allowlist sanitizer at initial value, programmatic value, paste, generated-fragment, and source-to-rich boundaries. This browser cleanup is a user-experience and defense-in-depth control; applications must still sanitize and validate submitted HTML on the server.

Form validation is advisory browser feedback. The server must repeat validation and authorization for every submission. UIF renders validation messages as text, bounds server error maps, rejects unsafe action URLs, catches malformed response target/focus selectors, and cancels stale validation and submission work. Cross-origin form actions require an explicit declarative opt-in and remain subject to CORS, CSRF, credential, and server authorization policy.

Network retries are bounded to 10 and apply automatically only to `GET`, `HEAD`, and `OPTIONS`. Mutation retries require the programmatic request option `idempotent: true` and should be enabled only when the server contract provides an idempotency key or equivalent replay protection. Permanent 4xx failures are not retried; transient network, 408, 429, and 5xx failures may be. Request interceptors cannot replace UIF's cancellation signal.

Caller abort signals are composed with UIF timeout/key cancellation rather than replaced. Progress-aware XHR uploads enforce timeout, external abort, CSRF headers, credential mode, and HTTP success status, and return normalized status/data on server rejection. Applications must still enforce upload size, media type, content inspection, authorization, storage naming, and malware controls on the server.

Periodic data connectors never overlap their own polling work, use a minimum 250 ms interval, cancel an active request on teardown, and emit `uif:connector-error` for non-abort failures. Connector endpoints and transforms remain application trust boundaries.

## Local Persistence

`createLocalStore()` namespaces data, records a schema version, validates keys, bounds individual values/import size and entry count, reports malformed persisted JSON explicitly, and validates imports before replacing existing data. `createAdvancedStore()` and Micro App persistence use versioned envelopes, retain version-one legacy-object compatibility, bound serialized payload size, and expose `onPersistError` so inaccessible, malformed, mismatched, circular, or quota-failed storage does not abort in-memory state updates.

Local and session storage are application convenience stores, not secure credential stores. Do not persist access tokens, secrets, regulated records, private tool payloads, or authorization state there. Server authorization remains authoritative, and applications own migration decisions when changing `version` or `persistVersion`.

Desktop preference storage falls back to process-memory preferences when local storage is unavailable, malformed, or full. Malformed dashboard and desktop declarative JSON leaves server-rendered fallback content intact and emits `uif:dashboard-error` or `uif:desktop-error`.

## PWA And Offline Data

- Service worker scripts and scopes must be same-origin. `registerServiceWorker()` defaults `updateViaCache` to `none` so browsers check the worker script directly.
- Cache only same-origin `GET` requests without an `Authorization` header. Responses must be successful and explicitly cacheable through `Cache-Control: public` or `max-age`; `private` and `no-store` responses are rejected.
- Do not precache authenticated HTML, JSON, tenant data, or user-specific responses. The supplied worker template does not precache `/`.
- Queue only operations that are explicitly idempotent. `queueOfflineTask()` requires `{ idempotent: true }`, bounds the in-memory queue to 100 entries, deduplicates optional keys, and limits retries.
- Offline tasks are memory-only and disappear on navigation. Applications that persist offline work must protect sensitive data, partition it by authenticated user and tenant, expire it, and clear it on sign-out.
- An update callback indicates that a worker is waiting; the application controls when to message that worker or reload. Dispose update and network listeners when their owning UI is removed.
- Push subscription helpers require browser support, granted notification permission, and `userVisibleOnly: true`. Subscription storage, audience authorization, expiry, topic access, rate limits, and delivery payload validation remain server responsibilities.
- The in-app notification feed retains at most 100 entries and truncates messages at 10,000 characters. Treat notification `data` as untrusted application data and render it as text unless independently validated.

## AI and MCP UI Limits

AI response, result, history, and streaming surfaces accept configurable character limits and emit `uif:ai-error` when content is truncated. A limited stream stops accepting chunks. MCP review rendering bounds list items and serialized payload/result previews, handles circular data as text, and never interprets model or tool content as HTML.

Governed tool reviews may carry `requestId`, `expiresAt`, and `auditRef`. Expired approvals emit `uif:tool-expired`; accepted/rejected review decisions become one-shot in the UI and include correlation metadata in the server-mediated event. These are browser indicators only. The server must independently enforce request identity, expiry, nonce/replay protection, permissions, confirmation policy, execution status, and authoritative audit references.

## AI and MCP Boundaries

Browser-side AI and MCP packages are UI-only. They may render:

- launchers
- prompt panels
- approval cards
- progress states
- streamed text
- result previews
- audit timelines

They must not directly perform:

- database access
- file writes
- GitHub commits
- deployments
- email sending
- payment actions
- MCP server invocation
- credential handling
- permission decisions
- authoritative audit logging

Those operations belong in Batoi RAD or another governed backend.

## Client Confirmation Is Not Authorization

`data-uif-confirm` and irreversible approval prompts are useful user-experience safeguards. They are not authorization controls. The server must still verify identity, permissions, CSRF protection, request integrity, and policy compliance.

## Recommended App Controls

- Keep `dist/` assets pinned by version.
- Serve UIF over HTTPS.
- Use CSRF protection for state-changing requests.
- Prefer same-origin URLs for `data-uif-src`.
- Treat `data-uif-allow-cross-origin="true"` as a reviewed exception, not a general compatibility switch.
- Validate all incoming form and AJAX payloads server-side.
- Escape all user-controlled data before rendering server partials.
- Emit server-side audit records for tool approvals and destructive actions.
