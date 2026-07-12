import { isSafeURL } from '@batoi/uif-dom';

export type MarkdownDiagnosticSeverity = 'info' | 'warning' | 'error';

export interface MarkdownDiagnostic {
  code: string;
  column: number;
  line: number;
  message: string;
  severity: MarkdownDiagnosticSeverity;
}

export interface MarkdownParseOptions {
  maxInputLength?: number;
  maxLines?: number;
  maxNesting?: number;
  maxTableColumns?: number;
}

export interface MarkdownRenderOptions {
  sourceMap?: boolean;
}

export interface MarkdownSourcePosition {
  endLine: number;
  startLine: number;
}

export type MarkdownInlineNode =
  | { type: 'text'; value: string }
  | { type: 'break' }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: MarkdownInlineNode[] }
  | { type: 'emphasis'; children: MarkdownInlineNode[] }
  | { type: 'strike'; children: MarkdownInlineNode[] }
  | { type: 'link'; children: MarkdownInlineNode[]; href: string; title?: string }
  | { type: 'image'; alt: string; src: string; title?: string };

export interface MarkdownListItem {
  checked?: boolean;
  children: MarkdownListNode[];
  content: MarkdownInlineNode[];
}

export interface MarkdownListNode {
  type: 'list';
  ordered: boolean;
  start: number;
  task: boolean;
  items: MarkdownListItem[];
  position?: MarkdownSourcePosition;
}

export type MarkdownBlockNode =
  | { type: 'heading'; depth: number; content: MarkdownInlineNode[]; position?: MarkdownSourcePosition }
  | { type: 'paragraph'; content: MarkdownInlineNode[]; position?: MarkdownSourcePosition }
  | { type: 'codeBlock'; language?: string; value: string; position?: MarkdownSourcePosition }
  | { type: 'blockquote'; children: MarkdownBlockNode[]; position?: MarkdownSourcePosition }
  | MarkdownListNode
  | { type: 'table'; align: Array<'left' | 'center' | 'right' | undefined>; header: MarkdownInlineNode[][]; rows: MarkdownInlineNode[][][]; position?: MarkdownSourcePosition }
  | { type: 'thematicBreak'; position?: MarkdownSourcePosition };

export interface MarkdownDocument {
  type: 'document';
  children: MarkdownBlockNode[];
  diagnostics: MarkdownDiagnostic[];
  truncated: boolean;
}

const defaults: Required<MarkdownParseOptions> = {
  maxInputLength: 1_000_000,
  maxLines: 50_000,
  maxNesting: 16,
  maxTableColumns: 50,
};

const hardLimits: Required<MarkdownParseOptions> = {
  maxInputLength: 5_000_000,
  maxLines: 100_000,
  maxNesting: 32,
  maxTableColumns: 100,
};

function boundedLimit(value: number | undefined, fallback: number, maximum: number): number {
  return Math.min(maximum, Math.max(1, Math.floor(Number.isFinite(value) ? (value as number) : fallback)));
}

function text(value: string): MarkdownInlineNode {
  return { type: 'text', value };
}

function appendText(nodes: MarkdownInlineNode[], value: string): void {
  if (!value) return;
  const last = nodes.at(-1);
  if (last?.type === 'text') last.value += value;
  else nodes.push(text(value));
}

function closingDelimiter(value: string, delimiter: string, start: number): number {
  let cursor = start;
  while (cursor < value.length) {
    const found = value.indexOf(delimiter, cursor);
    if (found < 0) return -1;
    if (found === 0 || value[found - 1] !== '\\') {
      if ((delimiter === '**' || delimiter === '__') && value[found + delimiter.length] === delimiter[0]) return found + 1;
      return found;
    }
    cursor = found + delimiter.length;
  }
  return -1;
}

function linkDestination(value: string, start: number): { end: number; title?: string; url: string } | null {
  if (value[start] !== '(') return null;
  const end = value.indexOf(')', start + 1);
  if (end < 0) return null;
  const raw = value.slice(start + 1, end).trim();
  const match = /^(\S+?)(?:\s+["']([^"']*)["'])?$/.exec(raw);
  if (!match) return null;
  return { end, url: match[1], title: match[2] };
}

export function parseMarkdownInline(value: string): MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = [];
  let index = 0;
  while (index < value.length) {
    const char = value[index];
    if (char === '\\' && index + 1 < value.length && /[\\`*_[\]{}()#+\-.!~>|]/.test(value[index + 1])) {
      appendText(nodes, value[index + 1]);
      index += 2;
      continue;
    }
    if (char === '\n') {
      nodes.push({ type: 'break' });
      index += 1;
      continue;
    }
    if (char === '`') {
      const run = /^`+/.exec(value.slice(index))?.[0] ?? '`';
      const end = closingDelimiter(value, run, index + run.length);
      if (end >= 0) {
        nodes.push({ type: 'code', value: value.slice(index + run.length, end).replace(/^ | $/g, '') });
        index = end + run.length;
        continue;
      }
    }
    if (value.startsWith('![', index) || char === '[') {
      const image = value.startsWith('![', index);
      const labelStart = index + (image ? 2 : 1);
      const labelEnd = value.indexOf(']', labelStart);
      const destination = labelEnd >= 0 ? linkDestination(value, labelEnd + 1) : null;
      if (labelEnd >= 0 && destination) {
        const label = value.slice(labelStart, labelEnd);
        const context = image ? 'image' : 'link';
        if (isSafeURL(destination.url, { context, allowHash: !image })) {
          nodes.push(image
            ? { type: 'image', alt: label, src: destination.url, title: destination.title }
            : { type: 'link', children: parseMarkdownInline(label), href: destination.url, title: destination.title });
          index = destination.end + 1;
          continue;
        }
      }
    }
    const formatting = value.startsWith('**', index) || value.startsWith('__', index)
      ? { delimiter: value.slice(index, index + 2), type: 'strong' as const }
      : value.startsWith('~~', index)
        ? { delimiter: '~~', type: 'strike' as const }
        : char === '*' || char === '_'
          ? { delimiter: char, type: 'emphasis' as const }
          : null;
    if (formatting) {
      const end = closingDelimiter(value, formatting.delimiter, index + formatting.delimiter.length);
      if (end > index + formatting.delimiter.length) {
        nodes.push({ type: formatting.type, children: parseMarkdownInline(value.slice(index + formatting.delimiter.length, end)) });
        index = end + formatting.delimiter.length;
        continue;
      }
    }
    const angle = /^<(https?:\/\/[^>]+|mailto:[^>]+)>/i.exec(value.slice(index));
    if (angle && isSafeURL(angle[1], { context: 'link' })) {
      nodes.push({ type: 'link', children: [text(angle[1])], href: angle[1] });
      index += angle[0].length;
      continue;
    }
    const bare = /^https?:\/\/[^\s<]+/i.exec(value.slice(index));
    if (bare) {
      const url = bare[0].replace(/[.,;:!?]+$/, '');
      if (isSafeURL(url, { context: 'link' })) {
        nodes.push({ type: 'link', children: [text(url)], href: url });
        index += url.length;
        continue;
      }
    }
    appendText(nodes, char);
    index += 1;
  }
  return nodes;
}

interface ListEntry {
  checked?: boolean;
  indent: number;
  marker: string;
  text: string;
}

function listEntry(line: string): ListEntry | null {
  const match = /^(\s*)([-*+]|\d+\.)\s+(?:\[([ xX])\]\s+)?(.*)$/.exec(line);
  return match ? { indent: match[1].replaceAll('\t', '  ').length, marker: match[2], checked: match[3] === undefined ? undefined : match[3].toLowerCase() === 'x', text: match[4] } : null;
}

function parseList(entries: ListEntry[], diagnostics: MarkdownDiagnostic[], options: Required<MarkdownParseOptions>): MarkdownListNode[] {
  const renderLevel = (start: number, indent: number, depth: number): { node: MarkdownListNode; next: number } => {
    const first = entries[start];
    const ordered = /^\d/.test(first.marker);
    const task = first.checked !== undefined;
    const node: MarkdownListNode = { type: 'list', ordered, start: ordered ? Number.parseInt(first.marker, 10) : 1, task, items: [] };
    let index = start;
    while (index < entries.length) {
      const entry = entries[index];
      if (entry.indent < indent) break;
      if (entry.indent > indent) {
        if (depth >= options.maxNesting) {
          diagnostics.push({ code: 'markdown-nesting-limit', line: index + 1, column: entry.indent + 1, message: `Markdown nesting is limited to ${options.maxNesting} levels.`, severity: 'warning' });
          index += 1;
          continue;
        }
        const nested = renderLevel(index, entry.indent, depth + 1);
        node.items.at(-1)?.children.push(nested.node);
        index = nested.next;
        continue;
      }
      if (/^\d/.test(entry.marker) !== ordered || (entry.checked !== undefined) !== task) break;
      node.items.push({ checked: entry.checked, content: parseMarkdownInline(entry.text), children: [] });
      index += 1;
    }
    return { node, next: index };
  };
  const lists: MarkdownListNode[] = [];
  let index = 0;
  while (index < entries.length) {
    const result = renderLevel(index, entries[index].indent, 1);
    lists.push(result.node);
    index = result.next;
  }
  return lists;
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.replaceAll('\\|', '|').trim());
}

function tableSeparator(line: string): Array<'left' | 'center' | 'right' | undefined> | null {
  const cells = tableCells(line);
  if (!cells.length || cells.some((cell) => !/^:?-{3,}:?$/.test(cell))) return null;
  return cells.map((cell) => cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'right' : cell.startsWith(':') ? 'left' : undefined);
}

function blockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? '';
  return /^(?:#{1,6})\s+/.test(line) || /^\s*(?:[-*+]|\d+\.)\s+/.test(line) || /^\s*>/.test(line) || /^\s*(?:`{3,}|~{3,})/.test(line) || /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line) || (line.includes('|') && tableSeparator(lines[index + 1] ?? '') !== null);
}

function parseMarkdownDocument(markdown: string, options: MarkdownParseOptions, depth: number): MarkdownDocument {
  const config: Required<MarkdownParseOptions> = {
    maxInputLength: boundedLimit(options.maxInputLength, defaults.maxInputLength, hardLimits.maxInputLength),
    maxLines: boundedLimit(options.maxLines, defaults.maxLines, hardLimits.maxLines),
    maxNesting: boundedLimit(options.maxNesting, defaults.maxNesting, hardLimits.maxNesting),
    maxTableColumns: boundedLimit(options.maxTableColumns, defaults.maxTableColumns, hardLimits.maxTableColumns),
  };
  const diagnostics: MarkdownDiagnostic[] = [];
  let source = markdown.replace(/\r\n?/g, '\n');
  let truncated = false;
  if (source.length > config.maxInputLength) {
    source = source.slice(0, config.maxInputLength);
    truncated = true;
    diagnostics.push({ code: 'markdown-input-limit', line: 1, column: 1, message: `Markdown preview is limited to ${config.maxInputLength} characters.`, severity: 'warning' });
  }
  let lines = source.split('\n');
  if (lines.length > config.maxLines) {
    lines = lines.slice(0, config.maxLines);
    truncated = true;
    diagnostics.push({ code: 'markdown-line-limit', line: config.maxLines, column: 1, message: `Markdown preview is limited to ${config.maxLines} lines.`, severity: 'warning' });
  }
  const children: MarkdownBlockNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (!line.trim()) { index += 1; continue; }
    const fence = /^\s*(`{3,}|~{3,})\s*([^\s`]*)\s*$/.exec(line);
    if (fence) {
      const marker = fence[1][0];
      const length = fence[1].length;
      const language = /^[\w+-]+$/.test(fence[2]) ? fence[2] : undefined;
      const startLine = index + 1;
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${marker}{${length},}\\s*$`).test(lines[index] ?? '')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      if (index >= lines.length) diagnostics.push({ code: 'markdown-unclosed-fence', line: startLine, column: 1, message: 'Code fence is not closed.', severity: 'error' });
      else index += 1;
      children.push({ type: 'codeBlock', language, value: code.join('\n'), position: { startLine, endLine: Math.min(index, lines.length) } });
      continue;
    }
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      children.push({ type: 'heading', depth: heading[1].length, content: parseMarkdownInline(heading[2]), position: { startLine: index + 1, endLine: index + 1 } });
      index += 1;
      continue;
    }
    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
      const entries: ListEntry[] = [];
      const listStart = index;
      while (index < lines.length) {
        const entry = listEntry(lines[index] ?? '');
        if (!entry) break;
        entries.push(entry);
        index += 1;
      }
      const localDiagnostics: MarkdownDiagnostic[] = [];
      children.push(...parseList(entries, localDiagnostics, config).map((list) => ({ ...list, position: { startLine: listStart + 1, endLine: index } })));
      diagnostics.push(...localDiagnostics.map((diagnostic) => ({ ...diagnostic, line: diagnostic.line + listStart })));
      continue;
    }
    const align = line.includes('|') ? tableSeparator(lines[index + 1] ?? '') : null;
    if (align) {
      const headerCells = tableCells(line);
      const width = Math.min(headerCells.length, config.maxTableColumns);
      if (headerCells.length > config.maxTableColumns) diagnostics.push({ code: 'markdown-table-column-limit', line: index + 1, column: 1, message: `Markdown tables are limited to ${config.maxTableColumns} columns.`, severity: 'warning' });
      index += 2;
      const rows: MarkdownInlineNode[][][] = [];
      while (index < lines.length && (lines[index] ?? '').includes('|') && lines[index]?.trim()) {
        const cells = tableCells(lines[index] ?? '');
        if (cells.length !== headerCells.length) diagnostics.push({ code: 'markdown-table-width', line: index + 1, column: 1, message: 'Table row width does not match the header.', severity: 'warning' });
        rows.push(Array.from({ length: width }, (_, cell) => parseMarkdownInline(cells[cell] ?? '')));
        index += 1;
      }
      children.push({ type: 'table', align: align.slice(0, width), header: headerCells.slice(0, width).map(parseMarkdownInline), rows, position: { startLine: index - rows.length - 1, endLine: index } });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      const quoteStart = index;
      while (index < lines.length && /^\s*>/.test(lines[index] ?? '')) {
        quote.push((lines[index] ?? '').replace(/^\s*>\s?/, ''));
        index += 1;
      }
      if (depth >= config.maxNesting) {
        diagnostics.push({ code: 'markdown-nesting-limit', line: quoteStart + 1, column: 1, message: `Markdown nesting is limited to ${config.maxNesting} levels.`, severity: 'warning' });
        children.push({ type: 'blockquote', children: [{ type: 'paragraph', content: parseMarkdownInline(quote.join('\n')) }], position: { startLine: quoteStart + 1, endLine: index } });
      } else {
        const nested = parseMarkdownDocument(quote.join('\n'), config, depth + 1);
        diagnostics.push(...nested.diagnostics.map((diagnostic) => ({ ...diagnostic, line: diagnostic.line + quoteStart })));
        children.push({ type: 'blockquote', children: nested.children, position: { startLine: quoteStart + 1, endLine: index } });
      }
      continue;
    }
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      children.push({ type: 'thematicBreak', position: { startLine: index + 1, endLine: index + 1 } });
      index += 1;
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index]?.trim() && (paragraph.length === 0 || !blockStart(lines, index))) {
      paragraph.push(lines[index] ?? '');
      index += 1;
    }
    const value = paragraph.join('\n');
    if (/^\s*<[A-Za-z][^>]*>/.test(value)) diagnostics.push({ code: 'markdown-raw-html-escaped', line: index - paragraph.length + 1, column: 1, message: 'Raw HTML is escaped in Markdown preview.', severity: 'info' });
    children.push({ type: 'paragraph', content: parseMarkdownInline(value), position: { startLine: index - paragraph.length + 1, endLine: index } });
  }
  return { type: 'document', children, diagnostics, truncated };
}

export function parseMarkdown(markdown: string, options: MarkdownParseOptions = {}): MarkdownDocument {
  return parseMarkdownDocument(markdown, options, 0);
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderInline(nodes: MarkdownInlineNode[]): string {
  return nodes.map((node) => {
    if (node.type === 'text') return escapeHtml(node.value);
    if (node.type === 'break') return '<br>';
    if (node.type === 'code') return `<code>${escapeHtml(node.value)}</code>`;
    if (node.type === 'strong') return `<strong>${renderInline(node.children)}</strong>`;
    if (node.type === 'emphasis') return `<em>${renderInline(node.children)}</em>`;
    if (node.type === 'strike') return `<del>${renderInline(node.children)}</del>`;
    if (node.type === 'link') return `<a href="${escapeHtml(node.href)}"${node.title ? ` title="${escapeHtml(node.title)}"` : ''}>${renderInline(node.children)}</a>`;
    return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt)}"${node.title ? ` title="${escapeHtml(node.title)}"` : ''}>`;
  }).join('');
}

function renderList(node: MarkdownListNode): string {
  const tag = node.ordered ? 'ol' : 'ul';
  const attrs = `${node.task ? ' class="uif-task-list"' : ''}${node.ordered && node.start !== 1 ? ` start="${node.start}"` : ''}`;
  const items = node.items.map((item) => {
    const prefix = node.task ? `<input type="checkbox" disabled${item.checked ? ' checked' : ''}> ` : '';
    return `<li>${prefix}${renderInline(item.content)}${item.children.map(renderList).join('')}</li>`;
  }).join('');
  return `<${tag}${attrs}>${items}</${tag}>`;
}

export function renderMarkdown(document: MarkdownDocument, options: MarkdownRenderOptions = {}): string {
  return document.children.map((node) => {
    const source = options.sourceMap && node.position ? ` data-uif-md-line="${node.position.startLine}" data-uif-md-line-end="${node.position.endLine}"` : '';
    if (node.type === 'heading') return `<h${node.depth}${source}>${renderInline(node.content)}</h${node.depth}>`;
    if (node.type === 'paragraph') return `<p${source}>${renderInline(node.content)}</p>`;
    if (node.type === 'codeBlock') return `<pre${source}><code${node.language ? ` class="language-${escapeHtml(node.language)}"` : ''}>${escapeHtml(node.value)}</code></pre>`;
    if (node.type === 'blockquote') return `<blockquote${source}>${renderMarkdown({ type: 'document', children: node.children, diagnostics: [], truncated: false })}</blockquote>`;
    if (node.type === 'list') return renderList(node).replace(/^<(ol|ul)/, `<$1${source}`);
    if (node.type === 'thematicBreak') return `<hr${source}>`;
    const alignment = (index: number) => node.align[index] ? ` class="uif-text-${node.align[index]}"` : '';
    const head = node.header.map((cell, index) => `<th${alignment(index)}>${renderInline(cell)}</th>`).join('');
    const rows = node.rows.map((row) => `<tr>${row.map((cell, index) => `<td${alignment(index)}>${renderInline(cell)}</td>`).join('')}</tr>`).join('');
    return `<table${source}><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }).join('\n');
}

export function markdownToHtml(markdown: string, options: MarkdownParseOptions = {}): string {
  return renderMarkdown(parseMarkdown(markdown, options));
}

export function markdownDiagnostics(markdown: string, options: MarkdownParseOptions = {}): MarkdownDiagnostic[] {
  return parseMarkdown(markdown, options).diagnostics;
}
