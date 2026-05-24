# Batoi UIF Security Model

Batoi UIF is a browser UI framework. It does not replace server-side authorization, validation, escaping, rate limiting, audit logging, or privileged tool governance.

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
- `setTrustedHTML()` refuses HTML unless marked as trusted.
- `swapTrustedHTML()` performs intentional server-rendered HTML swaps.

## Safe-by-Default Rendering

Dynamic text in forms, realtime feeds, AI UI, MCP UI, and generated remote table rows is rendered as text by default. Markup in server error messages, feed payloads, model output, or tool payloads should appear as text unless the consuming app explicitly chooses a trusted HTML path.

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
- Validate all incoming form and AJAX payloads server-side.
- Escape all user-controlled data before rendering server partials.
- Emit server-side audit records for tool approvals and destructive actions.
