# UIF 4 theme authoring

Status: experimental local authoring tools included with stable UIF 4.0.0. These tools
require a repository checkout and Node 22; they are not part of the browser
runtime or a hosted connector service. No model/provider account is required.

## File-only quickstart

```sh
npm ci
npm run build
npm run theme -- create my-theme.json brand
npm run theme -- validate my-theme.json
npm run theme -- build my-theme.json output/brand
```

Serve `output/brand` using your local static server. Open `web.html`,
`mobile.html`, and `desktop.html`. `preview` and `export` currently materialize
the same static directory as `build`; they do not start a server or create an
archive. Every export includes its editable `uif.theme.json` source.

Read [the schema](generated/theme.schema.json),
[starter manifest](generated/starter.theme.json), and
[compact assistant context](generated/ai-theme-context.md). The same input goes
through the same compiler regardless of which assistant/editor produced it.
Pass a brief and these files to any chat assistant; save its JSON and validate
locally. Do not run generated scripts or paste unknown executable CSS.

## Local studio

Run `npm run theme:studio` and open the printed loopback URL. The studio uses the
same validator/compiler, with a JSON token inspector, contrast/byte report,
web/mobile/desktop preview, light/dark mode, density, RTL and viewport controls.
Export revalidates and downloads the editable manifest. CLI build/export produces
the complete static file directory. Invalid edits preserve the previous preview.

The preview iframe and response CSP prohibit scripts; no application or
publication operation is exposed. This is a development server, not a hosted
multi-tenant studio. Keep it on loopback and do not tunnel it publicly. Static
state examples are not interactive application acceptance or a WCAG certificate.

## Supported token subset

Tokens use DTCG-style `$type`, `$value`, optional `$description`, nested groups
and whole-token `{group.name}` aliases. Color accepts six-digit hex or opaque
`{colorSpace:"srgb",components:[r,g,b]}` values. Supported other types are
dimension (`{value:1,unit:"rem"}`), duration, number, fontWeight, fontFamily,
and cubicBezier. Type inheritance, `$extends`, JSON pointers, composite
typography/shadows, arbitrary CSS and remote assets are not implemented.
This is a documented subset, not full DTCG conformance. See the
[DTCG 2025.10 format report](https://www.designtokens.org/tr/2025.10/format/).

Keep assets empty in this implementation. The field is reserved; the schema,
validator, compiler and materializers all reject nonempty local or remote assets.
The compiler does not fetch URLs, extract archives, invoke a model or execute
template code. Limits are 100,000 input bytes, 512 tokens in each effective
base-plus-mode tree, and 16 nesting levels. Mode overrides do not count twice.

One pack selects web/mobile/desktop recipes. Web supports content/sidebar,
mobile stack/bottom navigation, and desktop sidebar/workspace. These are browser
layouts, not native OS widgets, offline persistence or Electron packaging.
Set `data-theme="dark"` or `high-contrast` on the theme scope, `dir="rtl"` for
direction, and `data-uif-density="compact"` for preview density. Render the
initial mode attribute server-side to avoid a first-paint script dependency.

Builds are scoped with `data-uif-theme`, content-hashed and deterministic for
pinned compiler/foundation inputs. They check key semantic text contrast pairs;
this does not certify rendered WCAG conformance. Inspect actual states, keyboard
focus, reflow, forced colors and assistive technology before production use.

## Local MCP

Configure a coding assistant's stdio server with absolute paths:

```json
{"command":"node","args":["/absolute/checkout/tools/theme/server.mjs"]}
```

Resources: `uif://catalog`, `uif://theme/starter`, `uif://theme/schema`.
Tools: catalog, validate, build, preview, diff, export, apply (all `uif_`-prefixed
as listed by `tools/list`). Preview returns static HTML **source**, not a rendered
screenshot. Export returns text files, not a download URL. Artifact lifetime is
15 minutes, with at most 20 retained artifacts per server process.

The development transport implements the
[MCP 2025-06-18 stdio/JSON HTTP transport subset](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports).
It does not provide subscriptions, roots negotiation, sampling, elicitation,
OAuth, multi-tenant sessions or public hosting. Remote Claude/ChatGPT connectors
cannot be assumed to reach a user's localhost. No actual hosted Claude/ChatGPT
acceptance is claimed. The portable file workflow remains usable independently.

## Write authority and rollback

Default tools cannot apply files. An operator must explicitly set
`UIF_THEME_WORKSPACE` to an existing dedicated, trusted directory and start the
server with `--allow-apply`. Each theme writes only below that directory, using
its validated name. Never point it at a repository root or a writable shared
directory controlled by another user. Symlink checks are defense in depth, not
an OS sandbox against concurrent hostile filesystem mutation.

Application verifies immutable artifact identity and the actual previous bytes.
MCP apply rejects compiler/foundation input changes that would produce a different
artifact from the reviewed ID. Rebuild, preview and review the new artifact first.
Replacing an existing theme requires its reviewed `expectedBase` SHA-256.
Edited files or stale receipts fail closed. Replacement keeps the old directory
under a `.rollback-*` name. Do not remove backups until the owner approves.
The CLI `apply <manifest> <destination> <expectedBase>` uses the same mechanism.
Backend audit records requested/applied hashes, not theme payloads or secrets.
An interrupted request can leave a requested-only audit entry; inspect the
destination receipt before retrying. Hashes prove identity, not trust.

Enabling application delegates that capability to the connected MCP client.
This local service does not enforce a separate human-confirmation exchange or
require preview/diff before each call. The operator and client must enforce their
approval policy; a model instruction or tool annotation is not that control.

Optional `--http` is **loopback-only private development access**. Supply a private
`UIF_AUTHORING_TOKEN` of at least 32 characters through the environment. It denies
Origin headers, authenticates requests, bounds bodies and supports JSON POST with
the protocol Accept header. It is not a public OAuth-protected remote connector.
Do not expose it through an unauthenticated tunnel. Publishing/deployment is not
an authoring tool operation and requires separate backend authority.
