# Batoi UIF Editors

`@batoi/uif-editor` provides dependency-free rich HTML, Markdown, and plain-text editing while keeping the original form control synchronized.

## Rich HTML

Rich mode uses a compact semantic schema and the shared `@batoi/uif-dom` allowlist sanitizer. It supports headings, paragraphs, quotes, inline formatting, nested lists, task lists, links, images, tables, code blocks, source view, managed history, and safe paste/drop ingestion.

HTML source remains the canonical value. Switching to source view does not convert the document to Markdown.

## Markdown Profile

The built-in parser supports:

- ATX headings and thematic breaks
- paragraphs and blockquotes
- fenced code blocks with optional language identifiers
- ordered, unordered, nested, and task lists
- pipe tables with column alignment
- emphasis, strong emphasis, strikethrough, inline code, and escapes
- links, images, angle autolinks, and bare web URLs

Raw HTML is escaped. The parser has input, line, nesting, and table-column limits. This is a documented practical profile; it does not claim complete CommonMark or GFM conformance.

```ts
import {
  markdownDiagnostics,
  markdownToHtml,
  parseMarkdown,
  renderMarkdown,
} from '@batoi/uif-editor';

const document = parseMarkdown(source);
const html = renderMarkdown(document);
const diagnostics = markdownDiagnostics(source);
```

`parseMarkdown()` returns a typed block/inline document and diagnostics. `markdownToHtml()` remains the compact convenience API.

Editor selection snapshots and normalization-resistant bookmarks live in the internal `selection` module. Bounded undo/redo ownership and applying guards live in the internal `transaction` module. These are implementation details; the public editor entry point and API remain unchanged.

Sanitization and Markdown rendering profiles use data-driven fixtures under `packages/editor/src/fixtures/` so new boundary cases can be added without duplicating test setup.

## Diagnostics

Markdown editors expose current diagnostics through `editor.diagnostics`, `data-uif-editor-diagnostics`, and the `uif:editor-diagnostics` event. Current diagnostics cover unclosed fences, escaped raw HTML, parser limits, table width mismatches, and nesting limits.

Split Markdown editors render private source-line markers in the preview and synchronize scrolling by block. Public `markdownToHtml()` output remains free of these editor-only attributes; pass `{ sourceMap: true }` to `renderMarkdown()` only when a consumer explicitly needs source positions.

## Keyboard and Input

- Toolbar buttons use roving focus with arrow, Home, and End keys.
- Toolbars identify the controlled editor surface and announce explicit formatting, source, and preview changes.
- Editor dialogs trap Tab/Shift+Tab, close with Escape, and restore focus to the invoking toolbar button.
- Common formatting shortcuts use Control/Command.
- Tab and Shift+Tab indent and outdent list items. In rich tables, they move backward and forward by cell; Tab from the final cell appends a body row.
- Enter continues unordered, ordered, nested, and task-list markers in Markdown. In rich lists it splits at the caret; an empty item exits without merging or reordering adjacent items.
- In rich paragraphs, headings, quotes, and generic blocks, Enter preserves the semantic block type, Shift+Enter inserts a soft break, and Backspace/Delete removes an empty block toward the adjacent sibling with a stable caret destination.
- Markdown table row/column commands edit the table containing the caret and preserve its separator and column alignment.
- Rich tables support cell-by-cell Tab navigation, bounded 20-by-20 text-only rectangular paste, row/column expansion, header toggling, and escaped accessible captions through contextual tools.
- Markdown link and image dialogs use selected source text as the initial label or alt text.
- IME composition is committed as one synchronized history change.
- Consecutive text insertion or deletion inputs are grouped into bounded undo transactions; command, paste, drop, composition, and programmatic changes establish separate history boundaries.
- Rich paste accepts sanitized HTML or escaped plain text.
- Rich image drops require an `uploadImage` hook to return an approved URL.
- Destroying an editor removes surface, toolbar, document, overlay, timer, and pending autosave bindings.
- Native form reset synchronizes the active rich or source surface, clears dirty state, establishes a fresh undo baseline, and emits `uif:editor-reset`.
- Editor transitions and scrolling honor `prefers-reduced-motion`.

HTML source toggles preserve rich text selections and both surfaces' scroll positions. If allowlist normalization changes source HTML while returning to rich mode, the editor emits `uif:editor-normalize` with `{ editor, source, normalized }` so applications can surface or audit the change.

Visible HTML and Markdown source surfaces add one-based line and column information to the optional status row. HTML source uses the governing sanitizer to expose an `html-source-normalized` warning before returning to rich mode when submitted source will change.

```ts
registerEditorHook('uploadImage', async ({ file }) => {
  if (!file) return;
  return uploadToGovernedServer(file);
});
```

The server must authorize, inspect, rename, store, and return image URLs. Browser checks are not a replacement for server validation or sanitization.

Autosave uses keyed `@batoi/uif-net` requests. New edits cancel pending requests immediately, stale hook/request completions cannot mark newer content clean, and CSRF values can be configured with `csrfToken` and `csrfHeader` or their `data-uif-*` equivalents. Mutation retries are disabled by default; an application should implement retries through a governed autosave hook only when its server contract supplies idempotency/replay protection. Failures retain dirty state and emit `uif:editor-autosave-error`.

Image upload hooks receive an `AbortSignal`; a newer drop or editor destruction aborts prior work. `uploadMaxBytes` defaults to 10 MiB, unsafe returned URLs are ignored, and upload failures emit `uif:editor-upload-error`.
