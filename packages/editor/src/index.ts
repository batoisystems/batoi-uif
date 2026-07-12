import { emit } from '@batoi/uif-core';
import { isSafeURL, sanitizeHTML, setTrustedHTML, swapTrustedHTML } from '@batoi/uif-dom';
import { cancelRequest, request } from '@batoi/uif-net';
import { markdownToHtml, parseMarkdown, renderMarkdown } from './markdown.js';
import type { MarkdownDiagnostic } from './markdown.js';
import { captureTextBookmark, restoreTextBookmark, type EditorTextBookmark } from './selection.js';
import { destroyHistory, initializeHistory, prepareHistory, pushHistory, restoreHistory } from './transaction.js';

export { markdownDiagnostics, markdownToHtml, parseMarkdown, parseMarkdownInline, renderMarkdown } from './markdown.js';
export type { MarkdownBlockNode, MarkdownDiagnostic, MarkdownDiagnosticSeverity, MarkdownDocument, MarkdownInlineNode, MarkdownListItem, MarkdownListNode, MarkdownParseOptions, MarkdownRenderOptions, MarkdownSourcePosition } from './markdown.js';

export type EditorMode = 'html' | 'markdown' | 'plain';
export type EditorPreviewMode = 'none' | 'manual' | 'live';
export type EditorLayout = 'source' | 'preview' | 'split' | 'tabs' | 'modal' | 'drawer';
export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'heading'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'paragraph'
  | 'quote'
  | 'code'
  | 'code-inline'
  | 'code-block'
  | 'hr'
  | 'ul'
  | 'ol'
  | 'task'
  | 'indent'
  | 'outdent'
  | 'link'
  | 'link-edit'
  | 'link-remove'
  | 'image'
  | 'image-edit'
  | 'image-remove'
  | 'table'
  | 'table-row-before'
  | 'table-row-after'
  | 'table-row-delete'
  | 'table-col-before'
  | 'table-col-after'
  | 'table-col-delete'
  | 'table-delete'
  | 'table-header-toggle'
  | 'table-caption'
  | 'undo'
  | 'redo'
  | 'preview'
  | 'source'
  | 'fullscreen'
  | 'clear';

export interface EditorOptions {
  mode?: EditorMode;
  toolbar?: string[];
  preview?: EditorPreviewMode;
  height?: string;
  layout?: EditorLayout;
  status?: boolean;
  placeholder?: string;
  autosave?: boolean;
  autosaveDelay?: number;
  autosaveUrl?: string;
  autosaveRetries?: number;
  csrfToken?: string;
  csrfHeader?: string;
  uploadMaxBytes?: number;
  required?: boolean;
  maxLength?: number;
}

export interface EditorInstance {
  element: HTMLElement;
  mode: EditorMode;
  input: HTMLTextAreaElement | HTMLInputElement;
  surface: HTMLElement;
  preview?: HTMLElement;
  status?: HTMLElement;
  dirty: boolean;
  diagnostics: MarkdownDiagnostic[];
  sourceMode: boolean;
  getValue(): string;
  setValue(value: string): void;
  focus(): void;
  destroy(): void;
}

export interface EditorCommandContext {
  editor: EditorInstance;
  command: EditorCommand;
  value?: unknown;
}

export type EditorCommandHandler = (context: EditorCommandContext) => void;
export type EditorHookName =
  | 'beforeInput'
  | 'afterInput'
  | 'beforeCommand'
  | 'afterCommand'
  | 'beforePaste'
  | 'afterPaste'
  | 'beforeDrop'
  | 'afterDrop'
  | 'beforePreview'
  | 'afterPreview'
  | 'validate'
  | 'autosave'
  | 'uploadImage';

export interface EditorHookContext {
  editor: EditorInstance;
  value: string;
  command?: EditorCommand;
  file?: File;
  revision?: number;
  signal?: AbortSignal;
}

export type EditorHookHandler = (context: EditorHookContext) => void | string | Promise<void | string>;

export interface EditorLinkValue {
  text?: string;
  href?: string;
  title?: string;
  target?: '_self' | '_blank';
}

export interface EditorImageValue {
  src?: string;
  alt?: string;
  caption?: string;
}

export interface EditorTableValue {
  rows?: number;
  columns?: number;
  header?: boolean;
}

export interface EditorCodeBlockValue {
  code?: string;
  language?: string;
}

const editors = new WeakMap<HTMLElement, EditorInstance>();
const editorListeners = new WeakMap<EditorInstance, Array<() => void>>();
const editorInitialValue = new WeakMap<EditorInstance, string>();
const editorActiveTableCell = new WeakMap<EditorInstance, HTMLTableCellElement>();
const commandHandlers = new Map<string, EditorCommandHandler>();
const hookHandlers = new Map<EditorHookName, Set<EditorHookHandler>>();
const editorAutosaveTimers = new WeakMap<EditorInstance, number>();
const editorAutosaveKeys = new WeakMap<EditorInstance, string>();
const editorAutosaveRevisions = new WeakMap<EditorInstance, number>();
const editorUploadControllers = new WeakMap<EditorInstance, AbortController>();
let activeEditorTransient: { close(restoreFocus?: boolean): void; editor: EditorInstance } | null = null;
let editorSequence = 0;
const defaultToolbar = ['undo', 'redo', 'bold', 'italic', 'heading', 'quote', 'code', 'ul', 'ol', 'link', 'preview', 'source'];
const commandLabels: Record<string, string> = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  heading: 'Heading',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  paragraph: 'Paragraph',
  quote: 'Quote',
  code: 'Code',
  'code-inline': 'Inline code',
  'code-block': 'Code block',
  hr: 'Horizontal rule',
  ul: 'Bulleted list',
  ol: 'Numbered list',
  task: 'Task list',
  indent: 'Indent list item',
  outdent: 'Outdent list item',
  link: 'Link',
  'link-edit': 'Edit link',
  'link-remove': 'Remove link',
  image: 'Image',
  'image-edit': 'Edit image',
  'image-remove': 'Remove image',
  table: 'Table',
  'table-row-before': 'Add row before',
  'table-row-after': 'Add row',
  'table-row-delete': 'Delete row',
  'table-col-before': 'Add column before',
  'table-col-after': 'Add column',
  'table-col-delete': 'Delete column',
  'table-delete': 'Delete table',
  'table-header-toggle': 'Toggle header',
  'table-caption': 'Edit caption',
  undo: 'Undo',
  redo: 'Redo',
  preview: 'Preview',
  source: 'Source',
  fullscreen: 'Fullscreen',
  clear: 'Clear formatting',
};
const commandIcons: Record<string, string> = {
  bold: '<path d="M7 5h6a4 4 0 0 1 0 8H7z"></path><path d="M7 13h7a4 4 0 0 1 0 8H7z"></path>',
  italic: '<path d="M10 5h8"></path><path d="M6 19h8"></path><path d="m14 5-4 14"></path>',
  underline: '<path d="M7 5v6a5 5 0 0 0 10 0V5"></path><path d="M5 21h14"></path>',
  strike: '<path d="M5 12h14"></path><path d="M16 6.5A4.5 4.5 0 0 0 12 5c-2.5 0-4 1.2-4 3"></path><path d="M8 17c.8 1.3 2.2 2 4 2 2.5 0 4-1.2 4-3"></path>',
  heading: '<path d="M6 5v14"></path><path d="M18 5v14"></path><path d="M6 12h12"></path>',
  h1: '<path d="M5 5v14"></path><path d="M13 5v14"></path><path d="M5 12h8"></path><path d="M18 10v9"></path><path d="m16 12 2-2 2 2"></path>',
  h2: '<path d="M4 5v14"></path><path d="M12 5v14"></path><path d="M4 12h8"></path><path d="M16 12a2 2 0 1 1 4 0c0 2-4 3-4 7h4"></path>',
  h3: '<path d="M4 5v14"></path><path d="M12 5v14"></path><path d="M4 12h8"></path><path d="M17 10h4l-3 4a3 3 0 1 1-2 5"></path>',
  paragraph: '<path d="M13 20V5"></path><path d="M17 20V5"></path><path d="M17 5H9a4 4 0 0 0 0 8h4"></path>',
  quote: '<path d="M9 7H5v6h4v4l3-4V7z"></path><path d="M19 7h-4v6h4v4l3-4V7z"></path>',
  code: '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  'code-inline': '<path d="m9 10-3 2 3 2"></path><path d="m15 10 3 2-3 2"></path>',
  'code-block': '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  hr: '<path d="M5 12h14"></path>',
  ul: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
  ol: '<path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M4 14h2l-2 4h2"></path>',
  task: '<path d="m4 7 2 2 4-4"></path><path d="M12 8h8"></path><path d="m4 17 2 2 4-4"></path><path d="M12 18h8"></path>',
  indent: '<path d="M9 6h12"></path><path d="M9 12h12"></path><path d="M9 18h12"></path><path d="m3 9 3 3-3 3"></path>',
  outdent: '<path d="M9 6h12"></path><path d="M9 12h12"></path><path d="M9 18h12"></path><path d="m6 9-3 3 3 3"></path>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2"></path>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="10" r="2"></circle><path d="m21 15-4-4-5 5-2-2-4 5"></path>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 4v16"></path><path d="M15 4v16"></path>',
  undo: '<path d="M3 7v6h6"></path><path d="M3 13a8 8 0 1 1 2.3 5.7"></path>',
  redo: '<path d="M21 7v6h-6"></path><path d="M21 13a8 8 0 1 0-2.3 5.7"></path>',
  preview: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
  source: '<path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path>',
  fullscreen: '<path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M21 16v5h-5"></path><path d="M8 21H3v-5"></path>',
  clear: '<path d="m16 3 5 5-9 9H7l-4-4 13-10z"></path><path d="M14 21H3"></path>',
};

export function registerEditorCommand(name: EditorCommand | string, handler: EditorCommandHandler): void {
  commandHandlers.set(name, handler);
}

export function unregisterEditorCommand(name: EditorCommand | string): void {
  commandHandlers.delete(name);
}

export function registerEditorHook(name: EditorHookName, handler: EditorHookHandler): () => void {
  const handlers = hookHandlers.get(name) ?? new Set<EditorHookHandler>();
  handlers.add(handler);
  hookHandlers.set(name, handlers);
  return () => handlers.delete(handler);
}

async function runEditorHooks(name: EditorHookName, context: EditorHookContext): Promise<Array<void | string>> {
  const handlers = hookHandlers.get(name);
  if (!handlers?.size) return [];
  const results: Array<void | string> = [];
  for (const handler of handlers) results.push(await handler(context));
  return results;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value: unknown): string {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function editorCommandLabel(command: string): string {
  return commandLabels[command] ?? command.replaceAll('-', ' ');
}

function editorCommandIcon(command: string): string {
  const body = commandIcons[command] ?? (/^h[1-6]$/.test(command) ? commandIcons.heading : undefined) ?? '<circle cx="12" cy="12" r="8"></circle>';
  return `<svg class="uif-icon uif-editor-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function safeUrl(value: unknown, fallback: string, context: 'link' | 'image' = 'link'): string {
  const candidate = String(value ?? '').trim();
  return isSafeURL(candidate, { context, allowHash: context === 'link' }) ? candidate : fallback;
}

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('strong,b').forEach((el) => el.replaceWith(`**${el.textContent ?? ''}**`));
  doc.querySelectorAll('em,i').forEach((el) => el.replaceWith(`*${el.textContent ?? ''}*`));
  doc.querySelectorAll('del,s').forEach((el) => el.replaceWith(`~~${el.textContent ?? ''}~~`));
  doc.querySelectorAll('code').forEach((el) => el.replaceWith(`\`${el.textContent ?? ''}\``));
  doc.querySelectorAll('img').forEach((el) => el.replaceWith(`![${el.getAttribute('alt') ?? ''}](${el.getAttribute('src') ?? ''})`));
  doc.querySelectorAll('a').forEach((el) => el.replaceWith(`[${el.textContent ?? ''}](${el.getAttribute('href') ?? '#'})`));
  doc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((el) => {
    const level = Number(el.tagName.slice(1));
    el.replaceWith(`${'#'.repeat(level)} ${el.textContent ?? ''}\n\n`);
  });
  doc.querySelectorAll('li').forEach((el) => el.replaceWith(`- ${el.textContent ?? ''}\n`));
  doc.querySelectorAll('p,blockquote,pre').forEach((el) => el.replaceWith(`${el.textContent ?? ''}\n\n`));
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

export function cleanEditorHtml(html: string): string {
  const fragment = sanitizeHTML(html, {
    allowedTags: ['a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'div', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'input', 'label', 'li', 'mark', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul'],
    allowedAttributes: ['alt', 'aria-label', 'checked', 'class', 'colspan', 'disabled', 'height', 'href', 'id', 'rel', 'rowspan', 'scope', 'src', 'start', 'target', 'title', 'type', 'width'],
  });
  fragment.querySelectorAll<HTMLInputElement>('input').forEach((input) => { if (input.type !== 'checkbox') input.remove(); });
  fragment.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((link) => { link.rel = 'noopener noreferrer'; });
  const template = document.createElement('template');
  template.content.append(fragment);
  return template.innerHTML;
}

function asInput(el: HTMLElement): HTMLTextAreaElement | HTMLInputElement {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el;
  const input = el.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea,input[type="hidden"],input[type="text"]');
  if (!input) throw new Error('Editor requires a textarea or input.');
  return input;
}

function parseOptions(el: HTMLElement, options: EditorOptions = {}): Required<EditorOptions> {
  const configuredMaxLength = Number(el.dataset.uifMaxlength || '');
  const inputMaxLength = el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement ? (el.maxLength > 0 ? el.maxLength : 0) : 0;
  const mode = options.mode ?? (el.dataset.uifMode as EditorMode | undefined) ?? 'html';
  return {
    mode,
    toolbar: options.toolbar ?? el.dataset.uifToolbar?.split(/\s+/).filter(Boolean) ?? defaultToolbar,
    preview: options.preview ?? (el.dataset.uifPreview as EditorPreviewMode | undefined) ?? 'manual',
    height: options.height ?? el.dataset.uifEditorHeight ?? '14rem',
    layout: options.layout ?? (el.dataset.uifEditorLayout as EditorLayout | undefined) ?? (mode === 'markdown' ? 'preview' : 'source'),
    status: options.status ?? el.dataset.uifEditorStatus !== 'false',
    placeholder: options.placeholder ?? el.dataset.uifPlaceholder ?? '',
    autosave: options.autosave ?? el.dataset.uifAutosave === 'true',
    autosaveDelay: options.autosaveDelay ?? (Number(el.dataset.uifAutosaveDelay || '') || 1200),
    autosaveUrl: options.autosaveUrl ?? el.dataset.uifAutosaveUrl ?? '',
    autosaveRetries: options.autosaveRetries ?? (Number(el.dataset.uifAutosaveRetries || '') || 0),
    csrfToken: options.csrfToken ?? el.dataset.uifCsrfToken ?? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
    csrfHeader: options.csrfHeader ?? el.dataset.uifCsrfHeader ?? 'x-csrf-token',
    uploadMaxBytes: options.uploadMaxBytes ?? (Number(el.dataset.uifUploadMaxBytes || '') || 10 * 1024 * 1024),
    required: options.required ?? (el.dataset.uifRequired === 'true' || (el instanceof HTMLTextAreaElement && el.required)),
    maxLength: options.maxLength ?? (configuredMaxLength || inputMaxLength),
  };
}

function wrapSelection(surface: HTMLTextAreaElement, before: string, after = before, fallback = 'text'): string {
  const start = surface.selectionStart;
  const end = surface.selectionEnd;
  const selected = surface.value.slice(start, end) || fallback;
  const next = `${surface.value.slice(0, start)}${before}${selected}${after}${surface.value.slice(end)}`;
  surface.value = next;
  const cursorStart = start + before.length;
  surface.setSelectionRange(cursorStart, cursorStart + selected.length);
  return next;
}

function insertAtSelection(surface: HTMLTextAreaElement, value: string): string {
  const start = surface.selectionStart;
  const end = surface.selectionEnd;
  const next = `${surface.value.slice(0, start)}${value}${surface.value.slice(end)}`;
  surface.value = next;
  surface.setSelectionRange(start + value.length, start + value.length);
  return next;
}

function selectedTextareaLineRange(surface: HTMLTextAreaElement): { end: number; lines: string[]; start: number } {
  const value = surface.value;
  const selectionStart = surface.selectionStart;
  let selectionEnd = surface.selectionEnd;
  if (selectionEnd > selectionStart && value[selectionEnd - 1] === '\n') selectionEnd -= 1;
  const start = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
  const nextBreak = value.indexOf('\n', selectionEnd);
  const end = nextBreak === -1 ? value.length : nextBreak;
  return { start, end, lines: value.slice(start, end).split('\n') };
}

function markdownListMatch(line: string, kind: 'ul' | 'ol' | 'task'): RegExpExecArray | null {
  if (kind === 'task') return /^(\s*)[-*+]\s+\[[ xX]\]\s*(.*)$/.exec(line);
  if (kind === 'ol') return /^(\s*)\d+\.\s+(.*)$/.exec(line);
  return /^(\s*)[-*+]\s+(?!\[[ xX]\]\s*)(.*)$/.exec(line);
}

function stripMarkdownListMarker(line: string): { indent: string; text: string } {
  const match = /^(\s*)(?:[-*+]\s+(?:\[[ xX]\]\s*)?|\d+\.\s+)(.*)$/.exec(line);
  return match ? { indent: match[1], text: match[2] } : { indent: line.match(/^\s*/)?.[0] ?? '', text: line.trimStart() };
}

function stripMarkdownBlockMarker(line: string): { indent: string; text: string } {
  const list = stripMarkdownListMarker(line);
  const heading = /^(\s*)#{1,6}\s+(.*)$/.exec(list.text);
  if (heading) return { indent: `${list.indent}${heading[1]}`, text: heading[2] };
  const quote = /^(\s*)>\s?(.*)$/.exec(list.text);
  if (quote) return { indent: `${list.indent}${quote[1]}`, text: quote[2] };
  return list;
}

function applyMarkdownLineTransform(surface: HTMLTextAreaElement, transform: (line: string, index: number) => string): string {
  const { start, end, lines } = selectedTextareaLineRange(surface);
  const targets = lines.length ? lines : [''];
  const replacement = targets.map(transform).join('\n');
  surface.value = `${surface.value.slice(0, start)}${replacement}${surface.value.slice(end)}`;
  surface.setSelectionRange(start, start + replacement.length);
  return surface.value;
}

function applyMarkdownHeadingCommand(surface: HTMLTextAreaElement, level: 1 | 2 | 3): string {
  return applyMarkdownLineTransform(surface, (line) => {
    const { indent, text } = stripMarkdownBlockMarker(line);
    return `${indent}${'#'.repeat(level)} ${text || 'Heading'}`;
  });
}

function applyMarkdownParagraphCommand(surface: HTMLTextAreaElement): string {
  return applyMarkdownLineTransform(surface, (line) => {
    const { indent, text } = stripMarkdownBlockMarker(line);
    return `${indent}${text || 'Paragraph text'}`;
  });
}

function applyMarkdownQuoteCommand(surface: HTMLTextAreaElement): string {
  return applyMarkdownLineTransform(surface, (line) => {
    const { indent, text } = stripMarkdownBlockMarker(line);
    return `${indent}> ${text || 'Quote'}`;
  });
}

function stripMarkdownInlineFormatting(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]*)`/g, '$1');
}

function applyMarkdownClearCommand(surface: HTMLTextAreaElement): string {
  return applyMarkdownLineTransform(surface, (line) => {
    const { indent, text } = stripMarkdownBlockMarker(line);
    return `${indent}${stripMarkdownInlineFormatting(text)}`;
  });
}

function applyMarkdownListCommand(surface: HTMLTextAreaElement, kind: 'ul' | 'ol' | 'task'): string {
  const { start, end, lines } = selectedTextareaLineRange(surface);
  const targets = lines.length ? lines : [''];
  const nonEmpty = targets.filter((line) => line.trim());
  const sameList = nonEmpty.length > 0 && nonEmpty.every((line) => markdownListMatch(line, kind));
  let orderedIndex = 1;
  const replacement = targets
    .map((line) => {
      if (!line.trim()) return sameList ? '' : kind === 'ol' ? `${orderedIndex++}. Item` : kind === 'task' ? '- [ ] Task' : '- Item';
      const { indent, text } = stripMarkdownListMarker(line);
      if (sameList) return `${indent}${text}`;
      if (kind === 'ol') return `${indent}${orderedIndex++}. ${text || 'Item'}`;
      if (kind === 'task') return `${indent}- [ ] ${text || 'Task'}`;
      return `${indent}- ${text || 'Item'}`;
    })
    .join('\n');
  surface.value = `${surface.value.slice(0, start)}${replacement}${surface.value.slice(end)}`;
  surface.setSelectionRange(start, start + replacement.length);
  return surface.value;
}

function applyMarkdownIndentCommand(surface: HTMLTextAreaElement, outdent: boolean): string {
  return applyMarkdownLineTransform(surface, (line) => {
    if (!line.trim()) return line;
    return outdent ? line.replace(/^(?: {1,2}|\t)/, '') : `  ${line}`;
  });
}

function currentTextareaLine(surface: HTMLTextAreaElement): { end: number; line: string; start: number } {
  const before = surface.value.slice(0, surface.selectionStart);
  const after = surface.value.slice(surface.selectionStart);
  const start = before.lastIndexOf('\n') + 1;
  const nextBreak = after.indexOf('\n');
  const end = nextBreak === -1 ? surface.value.length : surface.selectionStart + nextBreak;
  return { start, end, line: surface.value.slice(start, end) };
}

function handleMarkdownListKey(surface: HTMLTextAreaElement, event: KeyboardEvent): boolean {
  const { start, end, line } = currentTextareaLine(surface);
  const list = /^(\s*)(?:(\d+)\.|([-*+]))\s+(\[[ xX]\]\s*)?(.*)$/.exec(line);
  if (!list) return false;
  const text = list[5];
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!text.trim()) {
      const removeStart = start > 0 && surface.value[start - 1] === '\n' ? start - 1 : start;
      surface.value = `${surface.value.slice(0, removeStart)}${surface.value.slice(end)}`;
      surface.setSelectionRange(removeStart, removeStart);
      return true;
    }
    const marker = list[2] ? `${Number(list[2]) + 1}.` : list[3];
    const task = list[4] ? '[ ] ' : '';
    const insert = `\n${list[1]}${marker} ${task}`;
    insertAtSelection(surface, insert);
    return true;
  }
  if (event.key === 'Backspace' && !text.trim() && surface.selectionStart === end && surface.selectionEnd === end) {
    event.preventDefault();
    surface.value = `${surface.value.slice(0, start)}${surface.value.slice(end)}`;
    surface.setSelectionRange(start, start);
    return true;
  }
  return false;
}

function richSurface(editor: EditorInstance): HTMLElement | null {
  return editor.surface instanceof HTMLTextAreaElement ? null : editor.surface;
}

function richRange(editor: EditorInstance): Range | null {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0);
    if (surface.contains(range.commonAncestorContainer)) return range;
  }
  const range = document.createRange();
  range.selectNodeContents(surface);
  range.collapse(false);
  return range;
}

function setRichCaretAfter(node: Node): void {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function insertRichHtml(editor: EditorInstance, html: string): void {
  const range = richRange(editor);
  if (!range) return;
  const template = document.createElement('template');
  setTrustedHTML(template, cleanEditorHtml(html), { trusted: true, context: 'editor fragment' });
  const fragment = template.content;
  const last = fragment.lastChild;
  range.deleteContents();
  range.insertNode(fragment);
  if (last) setRichCaretAfter(last);
}

function wrapRichSelection(editor: EditorInstance, tagName: string, fallback: string, attrs: Record<string, string> = {}): void {
  const range = richRange(editor);
  if (!range) return;
  const node = document.createElement(tagName);
  Object.entries(attrs).forEach(([name, attrValue]) => node.setAttribute(name, attrValue));
  if (range.collapsed) {
    node.textContent = fallback;
  } else {
    node.append(range.extractContents());
  }
  range.deleteContents();
  range.insertNode(node);
  setRichCaretAfter(node);
}

function unwrapElement(element: Element): void {
  const children = [...element.childNodes];
  const last = children.at(-1) ?? null;
  element.replaceWith(...children);
  if (last) setRichCaretAfter(last);
}

function unwrapMatchingElements(root: ParentNode, selector: string): void {
  [...root.querySelectorAll(selector)].forEach((element) => {
    element.replaceWith(...element.childNodes);
  });
}

function hasMatchingElement(root: ParentNode, selector: string): boolean {
  return root.querySelector(selector) !== null;
}

function closestRichInlineForRange(editor: EditorInstance, range: Range, selector: string): Element | null {
  const surface = richSurface(editor);
  if (!surface) return null;
  const startElement = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  const endElement = range.endContainer instanceof Element ? range.endContainer : range.endContainer.parentElement;
  const startMatch = startElement?.closest(selector);
  const endMatch = endElement?.closest(selector);
  if (startMatch && startMatch === endMatch && surface.contains(startMatch)) return startMatch;
  return null;
}

function hasContent(node: Node): boolean {
  return node.textContent?.length ? true : node.childNodes.length > 0;
}

function rangeCoversInlineContents(range: Range, inline: Element): boolean {
  const contents = document.createRange();
  contents.selectNodeContents(inline);
  const before = contents.cloneRange();
  before.setEnd(range.startContainer, range.startOffset);
  const after = contents.cloneRange();
  after.setStart(range.endContainer, range.endOffset);
  return !before.toString() && !after.toString() && range.toString() === contents.toString();
}

function unwrapWholeRichInline(inline: Element): void {
  const children = [...inline.childNodes];
  if (!children.length) {
    inline.remove();
    return;
  }
  const first = children[0];
  const last = children.at(-1) as Node;
  inline.replaceWith(...children);
  const range = document.createRange();
  range.setStartBefore(first);
  range.setEndAfter(last);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function unwrapSelectedRichInline(inline: Element, range: Range): void {
  const fragment = range.extractContents();
  unwrapMatchingElements(fragment, inline.tagName.toLowerCase());
  const marker = document.createTextNode('');
  range.insertNode(marker);
  const after = inline.cloneNode(false) as Element;
  while (marker.nextSibling) after.append(marker.nextSibling);
  const last = fragment.lastChild;
  inline.after(fragment);
  if (hasContent(after)) {
    if (last) last.after(after);
    else inline.after(after);
  }
  marker.remove();
  if (!hasContent(inline)) inline.remove();
  if (last) setRichCaretAfter(last);
}

function toggleRichInline(editor: EditorInstance, tagName: string, fallback: string, selector = tagName): void {
  const range = richRange(editor);
  if (!range) return;
  const activeInline = closestRichInlineForRange(editor, range, selector);
  if (activeInline && range.collapsed) {
    unwrapElement(activeInline);
    return;
  }
  if (activeInline) {
    if (rangeCoversInlineContents(range, activeInline)) {
      unwrapWholeRichInline(activeInline);
      return;
    }
    unwrapSelectedRichInline(activeInline, range);
    return;
  }
  const fragment = range.cloneContents();
  if (!range.collapsed && hasMatchingElement(fragment, selector)) {
    const replacement = range.extractContents();
    unwrapMatchingElements(replacement, selector);
    const last = replacement.lastChild;
    range.insertNode(replacement);
    if (last) setRichCaretAfter(last);
    return;
  }
  wrapRichSelection(editor, tagName, fallback);
}

function selectedRichText(editor: EditorInstance, fallback: string): string {
  const range = richRange(editor);
  return range && !range.collapsed ? range.toString() : fallback;
}

function selectedRichLines(editor: EditorInstance, fallback: string): string[] {
  const range = richRange(editor);
  if (!range || range.collapsed) return [fallback];
  const textParts: string[] = [];
  const appendBreak = () => {
    if (textParts.at(-1) !== '\n') textParts.push('\n');
  };
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      textParts.push(node.textContent ?? '');
      return;
    }
    if (node instanceof HTMLBRElement) {
      appendBreak();
      return;
    }
    node.childNodes.forEach(visit);
    if (node instanceof HTMLElement && /^(P|DIV|LI|H[1-6]|BLOCKQUOTE|PRE)$/i.test(node.tagName)) appendBreak();
  };
  range.cloneContents().childNodes.forEach(visit);
  const lines = textParts
    .join('')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : [fallback];
}

const richBlockSelector = 'p,h1,h2,h3,h4,h5,h6,blockquote,pre,div';
type RichBlockTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'pre';

function selectedRichBlocks(editor: EditorInstance): HTMLElement[] {
  const surface = richSurface(editor);
  const range = richRange(editor);
  if (!surface || !range) return [];
  const blocks = [...surface.querySelectorAll<HTMLElement>(richBlockSelector)].filter((block) => {
    try { return range.intersectsNode(block); } catch { return false; }
  });
  if (blocks.length) return blocks.filter((block) => !blocks.some((other) => other !== block && block.contains(other)));
  const element = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  const closest = element?.closest<HTMLElement>(richBlockSelector);
  return closest && surface.contains(closest) ? [closest] : [];
}

function replaceRichBlock(block: HTMLElement, tagName: RichBlockTag): HTMLElement {
  if (block.tagName.toLowerCase() === tagName) return block;
  const replacement = document.createElement(tagName);
  if (tagName === 'pre') {
    const code = document.createElement('code');
    code.textContent = block.textContent ?? '';
    replacement.append(code);
  } else if (block.tagName === 'PRE') replacement.textContent = block.textContent ?? '';
  else replacement.append(...block.childNodes);
  block.replaceWith(replacement);
  return replacement;
}

function transformRichBlocks(editor: EditorInstance, tagName: RichBlockTag, fallback: string): void {
  const blocks = selectedRichBlocks(editor);
  if (!blocks.length) {
    insertRichHtml(editor, `<${tagName}>${tagName === 'pre' ? `<code>${escapeHtml(fallback)}</code>` : escapeHtml(fallback)}</${tagName}>`);
    return;
  }
  const last = blocks.map((block) => replaceRichBlock(block, tagName)).at(-1);
  if (last) setCaretInside(last);
}

function indentRichListItem(editor: EditorInstance): void {
  const item = currentRichElement<HTMLLIElement>(editor, 'li');
  const list = item?.parentElement;
  const previous = item?.previousElementSibling;
  if (!item || !(list instanceof HTMLUListElement || list instanceof HTMLOListElement) || !(previous instanceof HTMLLIElement)) return;
  let nested = [...previous.children].find((child) => child.tagName === list.tagName) as HTMLUListElement | HTMLOListElement | undefined;
  if (!nested) {
    nested = document.createElement(list.tagName.toLowerCase()) as HTMLUListElement | HTMLOListElement;
    if (list.classList.contains('uif-task-list')) nested.className = 'uif-task-list';
    previous.append(nested);
  }
  nested.append(item);
  setCaretInside(item);
}

function outdentRichListItem(editor: EditorInstance): void {
  const item = currentRichElement<HTMLLIElement>(editor, 'li');
  const list = item?.parentElement;
  const parentItem = list?.parentElement;
  const parentList = parentItem?.parentElement;
  if (!item || !(list instanceof HTMLUListElement || list instanceof HTMLOListElement) || !(parentItem instanceof HTMLLIElement)) return;
  if (!(parentList instanceof HTMLUListElement || parentList instanceof HTMLOListElement)) return;
  parentItem.after(item);
  if (!list.children.length) list.remove();
  setCaretInside(item);
}

function clearRichFormatting(editor: EditorInstance): void {
  const range = richRange(editor);
  if (!range) return;
  if (!range.collapsed) {
    const fragment = range.extractContents();
    unwrapMatchingElements(fragment, 'strong,b,em,i,u,s,del,code,mark,sub,sup,a');
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) setRichCaretAfter(last);
  }
  selectedRichBlocks(editor).forEach((block) => replaceRichBlock(block, 'p'));
}

function currentRichElement<T extends Element>(editor: EditorInstance, selector: string): T | null {
  const surface = richSurface(editor);
  if (!surface) return null;
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const selectedNode = range?.startContainer.childNodes.item(range.startOffset);
  if (selectedNode instanceof Element) {
    const selected = selectedNode.matches(selector) ? selectedNode : selectedNode.querySelector(selector);
    if (selected instanceof Element && surface.contains(selected)) return selected as T;
  }
  const element = node instanceof Element ? node : node?.parentElement;
  const closest = element?.closest<T>(selector);
  return closest && surface.contains(closest) ? closest : null;
}

function currentLink(editor: EditorInstance): HTMLAnchorElement | null {
  return currentRichElement<HTMLAnchorElement>(editor, 'a[href]');
}

function currentImage(editor: EditorInstance): HTMLImageElement | null {
  const image = currentRichElement<HTMLImageElement>(editor, 'img');
  if (image) return image;
  return currentRichElement<HTMLElement>(editor, 'figure')?.querySelector('img') ?? null;
}

function currentTaskItem(editor: EditorInstance): HTMLLIElement | null {
  return currentRichElement<HTMLLIElement>(editor, '.uif-task-list li');
}

function currentRichList(editor: EditorInstance): HTMLUListElement | HTMLOListElement | null {
  const list = currentRichElement<HTMLUListElement | HTMLOListElement>(editor, 'ul,ol');
  return list?.classList.contains('uif-task-list') ? null : list;
}

function replaceRichList(list: HTMLUListElement | HTMLOListElement, tagName: 'ul' | 'ol'): HTMLElement {
  const next = document.createElement(tagName);
  [...list.children].forEach((child) => {
    if (child instanceof HTMLLIElement) next.append(child.cloneNode(true));
  });
  list.replaceWith(next);
  setCaretInside(next);
  return next;
}

function unwrapRichList(list: HTMLUListElement | HTMLOListElement): void {
  const fragment = document.createDocumentFragment();
  [...list.children].forEach((child) => {
    if (!(child instanceof HTMLLIElement)) return;
    const paragraph = document.createElement('p');
    setTrustedHTML(paragraph, child.innerHTML, { trusted: true, context: 'editor block transform' });
    fragment.append(paragraph);
  });
  const last = fragment.lastChild;
  list.replaceWith(fragment);
  if (last instanceof HTMLElement) setCaretInside(last);
}

function setCaretInside(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function handleRichTaskKey(editor: EditorInstance, event: KeyboardEvent): boolean {
  const item = currentTaskItem(editor);
  if (!item) return false;
  const label = item.querySelector('label') ?? item;
  const text = (label.textContent ?? '').trim();
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!text) {
      item.remove();
      return true;
    }
    const next = document.createElement('li');
    setTrustedHTML(next, '<label><input type="checkbox"> </label>', { trusted: true, context: 'editor task item' });
    item.after(next);
    setCaretInside(next.querySelector('label') ?? next);
    return true;
  }
  if (event.key === 'Backspace' && !text) {
    event.preventDefault();
    item.remove();
    return true;
  }
  return false;
}

function richListItemIsEmpty(item: HTMLLIElement): boolean {
  const clone = item.cloneNode(true) as HTMLLIElement;
  clone.querySelectorAll('ul,ol').forEach((list) => list.remove());
  return !(clone.textContent ?? '').trim() && !clone.querySelector('img,figure,table,hr');
}

function exitRichListItem(item: HTMLLIElement): void {
  const list = item.parentElement;
  if (!(list instanceof HTMLUListElement || list instanceof HTMLOListElement)) return;
  const parentItem = list.parentElement;
  if (parentItem instanceof HTMLLIElement) {
    const parentList = parentItem.parentElement;
    if (parentList instanceof HTMLUListElement || parentList instanceof HTMLOListElement) {
      item.remove();
      const next = document.createElement('li');
      next.append(document.createElement('br'));
      parentItem.after(next);
      if (!list.querySelector(':scope > li')) list.remove();
      setCaretInside(next);
      return;
    }
  }
  const trailingList = list.cloneNode(false) as HTMLUListElement | HTMLOListElement;
  while (item.nextElementSibling) trailingList.append(item.nextElementSibling);
  const paragraph = document.createElement('p');
  paragraph.append(document.createElement('br'));
  item.remove();
  list.after(paragraph, trailingList);
  if (!trailingList.children.length) trailingList.remove();
  if (!list.children.length) list.remove();
  setCaretInside(paragraph);
}

function handleRichListKey(editor: EditorInstance, event: KeyboardEvent): boolean {
  const item = currentRichElement<HTMLLIElement>(editor, 'li');
  const list = item?.parentElement;
  const range = richRange(editor);
  if (!item || !range?.collapsed || !(list instanceof HTMLUListElement || list instanceof HTMLOListElement) || list.classList.contains('uif-task-list')) return false;
  if (event.key === 'Backspace' && richListItemIsEmpty(item)) {
    event.preventDefault();
    exitRichListItem(item);
    return true;
  }
  if (event.key !== 'Enter') return false;
  event.preventDefault();
  if (richListItemIsEmpty(item)) {
    exitRichListItem(item);
    return true;
  }
  const tail = document.createRange();
  tail.setStart(range.startContainer, range.startOffset);
  tail.setEnd(item, item.childNodes.length);
  const trailingContent = tail.extractContents();
  const next = document.createElement('li');
  next.append(trailingContent);
  if (richListItemIsEmpty(next)) next.append(document.createElement('br'));
  item.after(next);
  setCaretInside(next);
  const nextRange = document.getSelection()?.getRangeAt(0);
  nextRange?.collapse(true);
  return true;
}

function richBlockIsEmpty(block: HTMLElement): boolean {
  return !(block.textContent ?? '').trim() && !block.querySelector('img,figure,table,hr');
}

function setCaretAtStart(element: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(true);
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function handleRichBlockKey(editor: EditorInstance, event: KeyboardEvent): boolean {
  const surface = richSurface(editor);
  const block = currentRichElement<HTMLElement>(editor, richBlockSelector);
  const range = richRange(editor);
  if (!surface || !block || block === surface || !range?.collapsed || block.closest('li') || block.tagName === 'PRE') return false;
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    const lineBreak = document.createElement('br');
    range.insertNode(lineBreak);
    setRichCaretAfter(lineBreak);
    return true;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    const tail = document.createRange();
    tail.setStart(range.startContainer, range.startOffset);
    tail.setEnd(block, block.childNodes.length);
    const trailingContent = tail.extractContents();
    const next = document.createElement(block.tagName.toLowerCase());
    next.append(trailingContent);
    if (richBlockIsEmpty(next)) next.append(document.createElement('br'));
    block.after(next);
    setCaretAtStart(next);
    return true;
  }
  if (!richBlockIsEmpty(block)) return false;
  if (event.key === 'Backspace' && block.previousElementSibling instanceof HTMLElement) {
    event.preventDefault();
    const previous = block.previousElementSibling;
    block.remove();
    setCaretInside(previous);
    return true;
  }
  if (event.key === 'Delete' && block.nextElementSibling instanceof HTMLElement) {
    event.preventDefault();
    const next = block.nextElementSibling;
    block.remove();
    setCaretAtStart(next);
    return true;
  }
  return false;
}

function applyLinkAttributes(linkEl: HTMLAnchorElement, link: Required<EditorLinkValue>): void {
  linkEl.href = link.href;
  linkEl.setAttribute('href', link.href);
  if (link.text) linkEl.textContent = link.text;
  if (link.title) linkEl.title = link.title;
  else linkEl.removeAttribute('title');
  if (link.target === '_blank') {
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
  } else {
    linkEl.removeAttribute('target');
    linkEl.removeAttribute('rel');
  }
}

function applyImageAttributes(imageEl: HTMLImageElement, image: Required<EditorImageValue>): void {
  imageEl.src = image.src;
  imageEl.setAttribute('src', image.src);
  imageEl.alt = image.alt;
}

function linkValue(value?: unknown, fallbackText = 'Link text'): Required<EditorLinkValue> {
  if (typeof value === 'object' && value) {
    const data = value as EditorLinkValue;
    return {
      text: String(data.text || fallbackText),
      href: safeUrl(data.href, '#'),
      title: String(data.title || ''),
      target: data.target === '_blank' ? '_blank' : '_self',
    };
  }
  return { text: fallbackText, href: safeUrl(value, '#'), title: '', target: '_self' };
}

function imageValue(value?: unknown): Required<EditorImageValue> {
  if (typeof value === 'object' && value) {
    const data = value as EditorImageValue;
    return {
      src: safeUrl(data.src, '/favicon.ico', 'image'),
      alt: String(data.alt || 'Image'),
      caption: String(data.caption || ''),
    };
  }
  return { src: safeUrl(value, '/favicon.ico', 'image'), alt: 'Image', caption: '' };
}

function tableValue(value?: unknown): Required<EditorTableValue> {
  if (typeof value === 'object' && value) {
    const data = value as EditorTableValue;
    return {
      rows: Math.max(1, Math.min(12, Number(data.rows) || 2)),
      columns: Math.max(1, Math.min(8, Number(data.columns) || 2)),
      header: data.header !== false,
    };
  }
  return { rows: 2, columns: 2, header: true };
}

function codeBlockValue(value?: unknown, fallback = 'code'): Required<EditorCodeBlockValue> {
  if (typeof value === 'object' && value) {
    const data = value as EditorCodeBlockValue;
    return { code: String(data.code || fallback), language: /^[\w+-]+$/.test(String(data.language || '')) ? String(data.language) : '' };
  }
  return { code: fallback, language: '' };
}

function tableHtml(value?: unknown): string {
  const config = tableValue(value);
  const headers = Array.from({ length: config.columns }, (_item, index) => `<th>Column ${String.fromCharCode(65 + index)}</th>`).join('');
  const bodyRows = Array.from({ length: config.rows }, () => {
    const cells = Array.from({ length: config.columns }, (_item, index) => `<td>Value ${String.fromCharCode(65 + index)}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<table>${config.header ? `<thead><tr>${headers}</tr></thead>` : ''}<tbody>${bodyRows}</tbody></table>`;
}

function currentTableCell(): HTMLTableCellElement | null {
  const selection = document.getSelection();
  const node = selection?.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  const element = node instanceof Element ? node : node?.parentElement;
  return element?.closest('td,th') ?? null;
}

function currentTable(): HTMLTableElement | null {
  return currentTableCell()?.closest('table') ?? null;
}

function handleRichTableKey(editor: EditorInstance, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab') return false;
  const surface = richSurface(editor);
  const cell = currentTableCell();
  const table = cell?.closest('table');
  if (!surface || !cell || !table || !surface.contains(table)) return false;
  const cells = [...table.querySelectorAll<HTMLTableCellElement>('th,td')];
  const index = cells.indexOf(cell);
  if (index < 0) return false;
  event.preventDefault();
  let target: HTMLTableCellElement | undefined = cells[index + (event.shiftKey ? -1 : 1)];
  if (!target && !event.shiftKey) {
    const columns = Math.max(1, cell.parentElement?.children.length ?? 1);
    const body = table.tBodies.item(0) ?? table.createTBody();
    const row = body.insertRow();
    for (let column = 0; column < columns; column += 1) row.insertCell();
    target = row.cells.item(0) ?? undefined;
  }
  if (target) {
    editorActiveTableCell.set(editor, target);
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(true);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  return true;
}

function appendTableCell(row: HTMLTableRowElement): HTMLTableCellElement {
  const cell = document.createElement(row.parentElement?.tagName === 'THEAD' ? 'th' : 'td');
  row.append(cell);
  return cell;
}

function pasteRichTableGrid(editor: EditorInstance, text: string): boolean {
  if (!text.includes('\t') && !/[\r\n]/.test(text)) return false;
  const surface = richSurface(editor);
  const cell = currentTableCell();
  const table = cell?.closest('table');
  const startRow = cell?.parentElement;
  if (!surface || !cell || !table || !(startRow instanceof HTMLTableRowElement) || !surface.contains(table)) return false;
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  const grid = normalized.split('\n').slice(0, 20).map((line) => line.split('\t').slice(0, 20));
  if (!grid.length || !grid.some((row) => row.length)) return false;
  const rows = [...table.rows];
  const startRowIndex = rows.indexOf(startRow);
  const startColumn = cell.cellIndex;
  if (startRowIndex < 0 || startColumn < 0) return false;
  const requiredColumns = startColumn + Math.max(...grid.map((row) => row.length));
  rows.forEach((row) => {
    while (row.cells.length < requiredColumns) appendTableCell(row);
  });
  const body = table.tBodies.item(0) ?? table.createTBody();
  while (table.rows.length < startRowIndex + grid.length) {
    const row = body.insertRow();
    while (row.cells.length < requiredColumns) appendTableCell(row);
  }
  let last = cell;
  grid.forEach((values, rowOffset) => {
    const row = table.rows.item(startRowIndex + rowOffset);
    values.forEach((value, columnOffset) => {
      const target = row?.cells.item(startColumn + columnOffset);
      if (!target) return;
      target.textContent = value;
      last = target;
    });
  });
  editorActiveTableCell.set(editor, last);
  setCaretInside(last);
  return true;
}

function applyTableCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): boolean {
  const table = currentTable();
  const cell = currentTableCell() ?? editorActiveTableCell.get(editor) ?? null;
  const activeTable = table ?? cell?.closest('table') ?? null;
  if (!activeTable || !cell) return false;
  const row = cell.parentElement as HTMLTableRowElement;
  const cellIndex = cell.cellIndex;
  if (command === 'table-caption') {
    const text = typeof value === 'object' && value ? String((value as { caption?: unknown }).caption ?? '').trim() : String(value ?? '').trim();
    const caption = activeTable.caption;
    if (!text) caption?.remove();
    else {
      const next = caption ?? activeTable.createCaption();
      next.textContent = text;
    }
    return true;
  }
  if (command === 'table-row-before') {
    const previous = row.cloneNode(true) as HTMLTableRowElement;
    previous.querySelectorAll('th,td').forEach((item) => (item.textContent = ''));
    row.before(previous);
    previous.querySelector<HTMLElement>('td,th')?.focus();
    return true;
  }
  if (command === 'table-row-after') {
    const next = row.cloneNode(true) as HTMLTableRowElement;
    next.querySelectorAll('th,td').forEach((item) => (item.textContent = ''));
    row.after(next);
    next.querySelector<HTMLElement>('td,th')?.focus();
    return true;
  }
  if (command === 'table-row-delete') {
    row.remove();
    if (!activeTable.querySelector('tr')) activeTable.remove();
    return true;
  }
  if (command === 'table-col-before') {
    let insertedCurrent: Element | null = null;
    activeTable.querySelectorAll('tr').forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === 'TH' ? 'th' : 'td';
      const next = document.createElement(tag);
      next.textContent = '';
      ref?.before(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === 'table-col-after') {
    let insertedCurrent: Element | null = null;
    activeTable.querySelectorAll('tr').forEach((tableRow) => {
      const ref = tableRow.children.item(cellIndex);
      const tag = ref?.tagName === 'TH' ? 'th' : 'td';
      const next = document.createElement(tag);
      next.textContent = '';
      ref?.after(next);
      if (tableRow === row) insertedCurrent = next;
    });
    if (insertedCurrent) {
      const range = document.createRange();
      range.selectNodeContents(insertedCurrent);
      range.collapse(true);
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(range);
    }
    return true;
  }
  if (command === 'table-col-delete') {
    activeTable.querySelectorAll('tr').forEach((tableRow) => tableRow.children.item(cellIndex)?.remove());
    if (!activeTable.querySelector('td,th')) activeTable.remove();
    return true;
  }
  if (command === 'table-delete') {
    activeTable.remove();
    return true;
  }
  if (command === 'table-header-toggle') {
    const head = activeTable.tHead;
    if (head) {
      const first = head.rows.item(0);
      if (first) activeTable.tBodies.item(0)?.prepend(first);
      head.remove();
    } else {
      const first = activeTable.tBodies.item(0)?.rows.item(0);
      if (first) {
        const thead = activeTable.createTHead();
        thead.append(first);
        first.querySelectorAll('td').forEach((td) => {
          const th = document.createElement('th');
          setTrustedHTML(th, td.innerHTML, { trusted: true, context: 'editor table header' });
          td.replaceWith(th);
        });
      }
    }
    return true;
  }
  return false;
}

function applyRichHtmlCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): void {
  if (command === 'bold') toggleRichInline(editor, 'strong', 'bold text', 'strong,b');
  else if (command === 'italic') toggleRichInline(editor, 'em', 'italic text', 'em,i');
  else if (command === 'underline') toggleRichInline(editor, 'u', 'underlined text');
  else if (command === 'strike') toggleRichInline(editor, 's', 'deleted text', 's,del');
  else if (command === 'heading') transformRichBlocks(editor, 'h2', 'Heading');
  else if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'h4' || command === 'h5' || command === 'h6') transformRichBlocks(editor, command, 'Heading');
  else if (command === 'paragraph') transformRichBlocks(editor, 'p', 'Paragraph text');
  else if (command === 'quote') transformRichBlocks(editor, 'blockquote', 'Quote');
  else if (command === 'code-inline') wrapRichSelection(editor, 'code', 'code');
  else if (command === 'code' || command === 'code-block') {
    const code = codeBlockValue(value, selectedRichText(editor, 'code'));
    transformRichBlocks(editor, 'pre', code.code);
    const codeElement = currentRichElement<HTMLElement>(editor, 'pre')?.querySelector('code');
    if (code.language) codeElement?.setAttribute('class', `language-${code.language}`);
    else codeElement?.removeAttribute('class');
  }
  else if (command === 'ul' || command === 'ol') {
    const tag = command;
    const existingList = currentRichList(editor);
    if (existingList?.tagName.toLowerCase() === tag) {
      unwrapRichList(existingList);
      return;
    }
    if (existingList) {
      replaceRichList(existingList, tag);
      return;
    }
    const items = selectedRichLines(editor, 'Item')
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join('');
    insertRichHtml(editor, `<${tag}>${items}</${tag}>`);
  }
  else if (command === 'task') insertRichHtml(editor, '<ul class="uif-task-list"><li><label><input type="checkbox"> Task</label></li></ul>');
  else if (command === 'indent') indentRichListItem(editor);
  else if (command === 'outdent') outdentRichListItem(editor);
  else if (command === 'hr') insertRichHtml(editor, '<hr>');
  else if (command === 'link' || command === 'link-edit') {
    const link = linkValue(value, selectedRichText(editor, 'Link text'));
    const existing = currentLink(editor);
    if (existing) {
      applyLinkAttributes(existing, link);
      return;
    }
    const attrs: Record<string, string> = { href: link.href };
    if (link.title) attrs.title = link.title;
    if (link.target === '_blank') {
      attrs.target = '_blank';
      attrs.rel = 'noopener noreferrer';
    }
    wrapRichSelection(editor, 'a', link.text, attrs);
  } else if (command === 'link-remove') {
    const existing = currentLink(editor);
    if (!existing) return;
    existing.replaceWith(document.createTextNode(existing.textContent ?? ''));
  } else if (command === 'image' || command === 'image-edit') {
    const image = imageValue(value);
    const existing = currentImage(editor);
    if (existing) {
      applyImageAttributes(existing, image);
      const figure = existing.closest('figure');
      if (figure) {
        let caption = figure.querySelector('figcaption');
        if (image.caption) {
          if (!caption) {
            caption = document.createElement('figcaption');
            figure.append(caption);
          }
          caption.textContent = image.caption;
        } else {
          caption?.remove();
        }
      }
      return;
    }
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    insertRichHtml(editor, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  } else if (command === 'image-remove') {
    const existing = currentImage(editor);
    if (!existing) return;
    const figure = existing.closest('figure');
    if (figure) figure.remove();
    else existing.remove();
  } else if (command === 'table') insertRichHtml(editor, tableHtml(value));
  else if (command.startsWith('table-')) applyTableCommand(editor, command, value);
  else if (command === 'clear') {
    clearRichFormatting(editor);
  }
}

function applyHtmlSourceCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): string {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === 'bold') return wrapSelection(surface, '<strong>', '</strong>', 'bold text');
  if (command === 'italic') return wrapSelection(surface, '<em>', '</em>', 'italic text');
  if (command === 'underline') return wrapSelection(surface, '<u>', '</u>', 'underlined text');
  if (command === 'strike') return wrapSelection(surface, '<s>', '</s>', 'deleted text');
  if (command === 'heading') return wrapSelection(surface, `<${value || 'h2'}>`, `</${value || 'h2'}>`, 'Heading');
  if (command === 'h1' || command === 'h2' || command === 'h3' || command === 'h4' || command === 'h5' || command === 'h6') return wrapSelection(surface, `<${command}>`, `</${command}>`, 'Heading');
  if (command === 'paragraph') return wrapSelection(surface, '<p>', '</p>', 'Paragraph text');
  if (command === 'quote') return wrapSelection(surface, '<blockquote>', '</blockquote>', 'Quote');
  if (command === 'code-inline') return wrapSelection(surface, '<code>', '</code>', 'code');
  if (command === 'code' || command === 'code-block') {
    const code = codeBlockValue(value, 'code');
    const language = code.language ? ` class="language-${escapeAttr(code.language)}"` : '';
    return wrapSelection(surface, `<pre><code${language}>`, '</code></pre>', code.code);
  }
  if (command === 'hr') return insertAtSelection(surface, '\n<hr>\n');
  if (command === 'ul') return insertAtSelection(surface, '\n<ul><li>Item</li></ul>\n');
  if (command === 'ol') return insertAtSelection(surface, '\n<ol><li>Item</li></ol>\n');
  if (command === 'task') return insertAtSelection(surface, '\n<ul class="uif-task-list"><li><input type="checkbox" disabled> Task</li></ul>\n');
  if (command === 'link' || command === 'link-edit') {
    const link = linkValue(value, 'link');
    const target = link.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
    const title = link.title ? ` title="${escapeAttr(link.title)}"` : '';
    return wrapSelection(surface, `<a href="${escapeAttr(link.href)}"${title}${target}>`, '</a>', link.text);
  }
  if (command === 'image' || command === 'image-edit') {
    const image = imageValue(value);
    const img = `<img src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt)}">`;
    return insertAtSelection(surface, image.caption ? `<figure>${img}<figcaption>${escapeHtml(image.caption)}</figcaption></figure>` : img);
  }
  if (command === 'table') return insertAtSelection(surface, `\n${tableHtml(value)}\n`);
  if (command === 'clear') return cleanEditorHtml(surface.value);
  return surface.value;
}

function markdownTable(value?: unknown): string {
  const config = tableValue(value);
  const header = `| ${Array.from({ length: config.columns }, (_item, index) => `Column ${String.fromCharCode(65 + index)}`).join(' | ')} |`;
  const rule = `| ${Array.from({ length: config.columns }, () => '---').join(' | ')} |`;
  const rows = Array.from({ length: config.rows }, () => `| ${Array.from({ length: config.columns }, (_item, index) => `Value ${String.fromCharCode(65 + index)}`).join(' | ')} |`);
  return `\n${[header, rule, ...rows].join('\n')}\n`;
}

interface MarkdownTableContext {
  column: number;
  endLine: number;
  line: number;
  lines: string[];
  startLine: number;
}

function markdownTableCells(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((cell) => cell.replaceAll('\\|', '|').trim());
}

function markdownTableRule(line: string): boolean {
  const cells = markdownTableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function markdownTableContext(surface: HTMLTextAreaElement): MarkdownTableContext | null {
  const lines = surface.value.split('\n');
  const line = surface.value.slice(0, surface.selectionStart).split('\n').length - 1;
  for (let startLine = 0; startLine < lines.length - 1; startLine += 1) {
    if (!lines[startLine].includes('|') || !markdownTableRule(lines[startLine + 1])) continue;
    let endLine = startLine + 1;
    while (endLine + 1 < lines.length && lines[endLine + 1].includes('|') && lines[endLine + 1].trim()) endLine += 1;
    if (line < startLine || line > endLine) continue;
    const lineStart = lines.slice(0, line).reduce((total, entry) => total + entry.length + 1, 0);
    const beforeCaret = lines[line].slice(0, Math.max(0, surface.selectionStart - lineStart));
    const pipes = (beforeCaret.match(/(?<!\\)\|/g) ?? []).length;
    const width = markdownTableCells(lines[startLine]).length;
    return { column: Math.min(width - 1, Math.max(0, pipes - (lines[line].trimStart().startsWith('|') ? 1 : 0))), endLine, line, lines, startLine };
  }
  return null;
}

function renderMarkdownTableRow(cells: string[]): string {
  return `| ${cells.map((cell) => cell.replaceAll('|', '\\|')).join(' | ')} |`;
}

function markdownTableCellOffset(line: string, column: number): number {
  let pipes = 0;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '|' || line[index - 1] === '\\') continue;
    if (pipes === column) return Math.min(line.length, index + 2);
    pipes += 1;
  }
  return line.length;
}

function applyMarkdownTableCommand(surface: HTMLTextAreaElement, command: EditorCommand): string {
  const context = markdownTableContext(surface);
  if (!context) return surface.value;
  const rows = context.lines.slice(context.startLine, context.endLine + 1).map(markdownTableCells);
  let targetRow = Math.max(2, context.line - context.startLine);
  let targetColumn = context.column;
  if (command === 'table-row-before' || command === 'table-row-after') {
    const current = Math.max(2, context.line - context.startLine);
    const insertAt = command === 'table-row-before' ? current : current + 1;
    rows.splice(Math.min(rows.length, insertAt), 0, Array.from({ length: rows[0].length }, () => ''));
    targetRow = Math.min(rows.length - 1, insertAt);
  } else if (command === 'table-row-delete') {
    if (context.line - context.startLine < 2 || rows.length <= 2) return surface.value;
    rows.splice(context.line - context.startLine, 1);
    targetRow = Math.min(rows.length - 1, context.line - context.startLine);
  } else {
    if (command === 'table-col-delete' && rows[0].length <= 1) return surface.value;
    const insertAt = command === 'table-col-before' ? context.column : context.column + 1;
    rows.forEach((row, rowIndex) => {
      if (command === 'table-col-delete') row.splice(context.column, 1);
      else row.splice(insertAt, 0, rowIndex === 0 ? 'Column' : rowIndex === 1 ? '---' : '');
    });
    targetColumn = command === 'table-col-delete' ? Math.min(context.column, rows[0].length - 1) : insertAt;
  }
  const rendered = rows.map(renderMarkdownTableRow);
  context.lines.splice(context.startLine, context.endLine - context.startLine + 1, ...rendered);
  surface.value = context.lines.join('\n');
  const absoluteLine = context.startLine + targetRow;
  const lineStart = context.lines.slice(0, absoluteLine).reduce((total, entry) => total + entry.length + 1, 0);
  const cursor = lineStart + markdownTableCellOffset(context.lines[absoluteLine], targetColumn);
  surface.setSelectionRange(cursor, cursor);
  return surface.value;
}

function applyMarkdownCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): string {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === 'bold') return wrapSelection(surface, '**', '**', 'bold text');
  if (command === 'italic') return wrapSelection(surface, '*', '*', 'italic text');
  if (command === 'strike') return wrapSelection(surface, '~~', '~~', 'deleted text');
  if (command === 'heading' || command === 'h2') return applyMarkdownHeadingCommand(surface, 2);
  if (command === 'h1') return applyMarkdownHeadingCommand(surface, 1);
  if (command === 'h3') return applyMarkdownHeadingCommand(surface, 3);
  if (command === 'h4') return applyMarkdownLineTransform(surface, (line) => `${stripMarkdownBlockMarker(line).indent}#### ${stripMarkdownBlockMarker(line).text}`);
  if (command === 'h5') return applyMarkdownLineTransform(surface, (line) => `${stripMarkdownBlockMarker(line).indent}##### ${stripMarkdownBlockMarker(line).text}`);
  if (command === 'h6') return applyMarkdownLineTransform(surface, (line) => `${stripMarkdownBlockMarker(line).indent}###### ${stripMarkdownBlockMarker(line).text}`);
  if (command === 'paragraph') return applyMarkdownParagraphCommand(surface);
  if (command === 'quote') return applyMarkdownQuoteCommand(surface);
  if (command === 'code-inline') return wrapSelection(surface, '`', '`', 'code');
  if (command === 'code' || command === 'code-block') {
    const selected = surface.value.slice(surface.selectionStart, surface.selectionEnd);
    const code = codeBlockValue(value, selected || 'code');
    return insertAtSelection(surface, `\n\`\`\`${code.language}\n${code.code}\n\`\`\`\n`);
  }
  if (command === 'hr') return insertAtSelection(surface, '\n---\n');
  if (command === 'ul') return applyMarkdownListCommand(surface, 'ul');
  if (command === 'ol') return applyMarkdownListCommand(surface, 'ol');
  if (command === 'task') return applyMarkdownListCommand(surface, 'task');
  if (command === 'indent') return applyMarkdownIndentCommand(surface, false);
  if (command === 'outdent') return applyMarkdownIndentCommand(surface, true);
  if (command === 'link' || command === 'link-edit') {
    const link = linkValue(value, 'link');
    if (surface.selectionStart === surface.selectionEnd) return insertAtSelection(surface, `[${link.text}](${link.href})`);
    return wrapSelection(surface, '[', `](${link.href})`, link.text);
  }
  if (command === 'image' || command === 'image-edit') {
    const image = imageValue(value);
    return insertAtSelection(surface, `\n![${image.alt}](${image.src})${image.caption ? `\n\n${image.caption}` : ''}\n`);
  }
  if (command === 'table') return insertAtSelection(surface, markdownTable(value));
  if (command.startsWith('table-row-') || command.startsWith('table-col-')) return applyMarkdownTableCommand(surface, command);
  if (command === 'clear') return applyMarkdownClearCommand(surface);
  return surface.value;
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function htmlSourceDiagnostics(value: string): MarkdownDiagnostic[] {
  const normalized = cleanEditorHtml(value);
  if (normalized === value) return [];
  let offset = 0;
  const limit = Math.min(value.length, normalized.length);
  while (offset < limit && value[offset] === normalized[offset]) offset += 1;
  const before = value.slice(0, offset);
  return [{
    code: 'html-source-normalized',
    column: before.length - before.lastIndexOf('\n'),
    line: before.split('\n').length,
    message: 'This HTML will be normalized when returning to rich mode.',
    severity: 'warning',
  }];
}

function updateStatus(instance: EditorInstance): void {
  if (!instance.status) return;
  const value = instance.getValue();
  const words = countWords(value);
  const chars = value.length;
  const state = instance.dirty ? 'Unsaved changes' : 'Clean';
  const diagnostics = instance.diagnostics.length ? ` · ${instance.diagnostics.length} ${instance.diagnostics.length === 1 ? 'issue' : 'issues'}` : '';
  const source = instance.surface instanceof HTMLTextAreaElement && !instance.surface.hidden ? instance.surface : null;
  const beforeCaret = source?.value.slice(0, source.selectionStart) ?? '';
  const line = source ? beforeCaret.split('\n').length : 0;
  const column = source ? beforeCaret.length - beforeCaret.lastIndexOf('\n') : 0;
  const position = source ? ` · Line ${line}, column ${column}` : '';
  instance.status.textContent = `${words} words · ${chars} characters · ${state}${diagnostics}${position}`;
}

function syncRichControlAttributes(root: HTMLElement): void {
  root.querySelectorAll<HTMLInputElement>('input[type="checkbox"],input[type="radio"]').forEach((input) => {
    if (input.checked) input.setAttribute('checked', '');
    else input.removeAttribute('checked');
  });
  root.querySelectorAll<HTMLOptionElement>('option').forEach((option) => {
    if (option.selected) option.setAttribute('selected', '');
    else option.removeAttribute('selected');
  });
}

export function validateEditor(editor: EditorInstance): string[] {
  const value = editor.getValue();
  const errors: string[] = [];
  const required = editor.input.dataset.uifRequired === 'true' || editor.input.required;
  const maxLength = Number(editor.input.dataset.uifMaxlength || '') || (editor.input.maxLength > 0 ? editor.input.maxLength : 0);
  if (required && !value.trim()) errors.push('This field is required.');
  if (maxLength && value.length > maxLength) errors.push(`Maximum length is ${maxLength} characters.`);
  editor.element.dataset.uifValidation = errors.length ? 'invalid' : 'valid';
  editor.input.setAttribute('aria-invalid', errors.length ? 'true' : 'false');
  emit('uif:editor-validate', { editor, errors }, editor.element);
  void runEditorHooks('validate', { editor, value });
  return errors;
}

async function autosaveEditor(editor: EditorInstance, revision: number, options: { csrfHeader: string; csrfToken: string; retries: number; url?: string }): Promise<void> {
  const value = editor.getValue();
  editor.element.dataset.uifAutosaveState = 'saving';
  await runEditorHooks('autosave', { editor, value, revision });
  if (revision !== editorAutosaveRevisions.get(editor)) return;
  if (options.url) {
    await request(options.url, {
      key: editorAutosaveKeys.get(editor),
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: editor.input.name, value }),
      credentials: 'same-origin',
      timeout: 15_000,
      retries: options.retries,
      retryDelay: 500,
      csrfToken: options.csrfToken || undefined,
      csrfHeader: options.csrfHeader,
    });
  }
  if (revision !== editorAutosaveRevisions.get(editor)) return;
  editor.element.dataset.uifAutosaveState = 'saved';
  editor.dirty = false;
  editorInitialValue.set(editor, value);
  updateStatus(editor);
  emit('uif:editor-autosave', { editor, value, revision }, editor.element);
}

function scheduleAutosave(editor: EditorInstance, delay: number, options: { csrfHeader: string; csrfToken: string; retries: number; url?: string }): void {
  const existing = editorAutosaveTimers.get(editor);
  if (existing) window.clearTimeout(existing);
  const revision = (editorAutosaveRevisions.get(editor) ?? 0) + 1;
  editorAutosaveRevisions.set(editor, revision);
  const key = editorAutosaveKeys.get(editor);
  if (key) cancelRequest(key);
  editorAutosaveTimers.set(
    editor,
    window.setTimeout(() => {
      void autosaveEditor(editor, revision, options).catch((error: unknown) => {
        if (revision !== editorAutosaveRevisions.get(editor)) return;
        editor.element.dataset.uifAutosaveState = 'error';
        emit('uif:editor-autosave-error', { editor, error, revision, value: editor.getValue() }, editor.element);
        emit('uif:editor-error', { editor, error }, editor.element);
      });
    }, delay),
  );
}

export function queryEditorCommand(editor: EditorInstance, command: EditorCommand | string): boolean {
  if (command === 'preview') return !editor.preview?.hidden;
  if (command === 'source') return editor.sourceMode;
  if (editor.mode !== 'html' || editor.surface instanceof HTMLTextAreaElement) return false;
  const selectors: Record<string, string> = { bold: 'strong,b', italic: 'em,i', underline: 'u', strike: 's,del', 'code-inline': 'code', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6', heading: 'h1,h2,h3,h4,h5,h6', paragraph: 'p', quote: 'blockquote', ul: 'ul', ol: 'ol', task: '.uif-task-list' };
  return selectors[command] ? currentRichElement(editor, selectors[command]) !== null : false;
}

export function runEditorCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): void {
  prepareHistory(editor, { origin: 'command' });
  const custom = commandHandlers.get(command);
  if (custom) {
    void runEditorHooks('beforeCommand', { editor, value: editor.getValue(), command });
    custom({ editor, command, value });
    void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
    return;
  }
  void runEditorHooks('beforeCommand', { editor, value: editor.getValue(), command });
  if (editor.mode === 'html') {
    if (editor.surface instanceof HTMLTextAreaElement) {
      if (command === 'undo') restoreHistory(editor, 'undo');
      else if (command === 'redo') restoreHistory(editor, 'redo');
      else editor.setValue(applyHtmlSourceCommand(editor, command, value));
      void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
      return;
    }
    editor.surface.focus();
    if (command === 'undo') restoreHistory(editor, 'undo');
    else if (command === 'redo') restoreHistory(editor, 'redo');
    else {
      if (command === 'image') void runEditorHooks('uploadImage', { editor, value: imageValue(value).src });
      applyRichHtmlCommand(editor, command, value);
    }
    syncRichControlAttributes(editor.surface);
    editor.setValue(cleanEditorHtml(editor.surface.innerHTML));
    void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
    return;
  }
  if (command === 'undo') restoreHistory(editor, 'undo');
  else if (command === 'redo') restoreHistory(editor, 'redo');
  else {
    if (editor.mode === 'markdown' && !editor.sourceMode && command !== 'preview' && command !== 'source' && command !== 'fullscreen') {
      editor.sourceMode = true;
      editor.surface.hidden = false;
      if (editor.preview) editor.preview.hidden = true;
      editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]')?.setAttribute('aria-pressed', 'true');
    }
    editor.setValue(applyMarkdownCommand(editor, command, value));
  }
  void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
}

export function formatEditor(editor: EditorInstance, command: EditorCommand, value?: unknown): void {
  runEditorCommand(editor, command, value);
}

function syncPreview(instance: EditorInstance): void {
  if (!instance.preview) return;
  if (instance.mode === 'markdown') {
    const document = parseMarkdown(instance.getValue());
    instance.diagnostics = document.diagnostics;
    setTrustedHTML(instance.preview, renderMarkdown(document, { sourceMap: true }), { trusted: true, context: 'editor markdown preview' });
  } else {
    instance.diagnostics = instance.sourceMode && instance.surface instanceof HTMLTextAreaElement ? htmlSourceDiagnostics(instance.getValue()) : [];
    setTrustedHTML(instance.preview, cleanEditorHtml(instance.getValue()), { trusted: true, context: 'editor HTML preview' });
  }
  instance.element.dataset.uifEditorDiagnostics = String(instance.diagnostics.length);
  emit('uif:editor-diagnostics', { editor: instance, diagnostics: instance.diagnostics }, instance.element);
}

function openPreviewOverlay(editor: EditorInstance, layout: EditorLayout, anchor?: HTMLElement): void {
  if (!editor.preview) return;
  activeEditorTransient?.close(false);
  syncPreview(editor);
  const backdrop = document.createElement('div');
  backdrop.className = 'uif-editor-preview-backdrop';
  const panel = document.createElement('div');
  panel.className = layout === 'drawer' ? 'uif-editor-preview-drawer' : 'uif-editor-preview-modal';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  setTrustedHTML(panel, `<div class="uif-editor-preview-head"><strong>Preview</strong><button type="button" class="uif-editor-preview-close" aria-label="Close preview">&times;</button></div><div class="uif-editor-preview-content">${editor.preview.innerHTML}</div>`, { trusted: true, context: 'editor preview overlay' });
  let closed = false;
  const onKeydown = (event: KeyboardEvent) => {
    if (trapEditorFocus(panel, event)) return;
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  };
  const close = (restoreFocus = true) => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKeydown);
    panel.remove();
    backdrop.remove();
    if (activeEditorTransient?.editor === editor) activeEditorTransient = null;
    if (restoreFocus) (anchor ?? editor.surface).focus();
  };
  backdrop.addEventListener('click', () => close());
  const closeButton = panel.querySelector('button');
  closeButton?.addEventListener('click', () => close());
  closeButton?.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    close();
  });
  document.addEventListener('keydown', onKeydown);
  document.body.append(backdrop, panel);
  activeEditorTransient = { editor, close };
  panel.querySelector<HTMLButtonElement>('button')?.focus();
}

export function setEditorPreviewLayout(editor: EditorInstance, layout: EditorLayout): void {
  editor.element.dataset.uifEditorLayout = layout;
  const body = editor.element.querySelector<HTMLElement>('.uif-editor-body');
  body?.classList.toggle('uif-editor-body-split', layout === 'split');
  body?.classList.toggle('uif-editor-body-tabs', layout === 'tabs');
  if (editor.mode === 'markdown' && editor.preview) {
    syncPreview(editor);
    const sourceButton = editor.element.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]');
    editor.surface.hidden = false;
    editor.preview.hidden = true;
    if (layout === 'split') {
      editor.preview.hidden = false;
      editor.sourceMode = true;
    } else if (layout === 'tabs') {
      editor.surface.hidden = !editor.sourceMode;
      editor.preview.hidden = editor.sourceMode;
    } else if (layout === 'preview') {
      editor.surface.hidden = true;
      editor.preview.hidden = false;
      editor.sourceMode = false;
    } else {
      editor.sourceMode = true;
    }
    if (!editor.preview.hidden) editor.preview.tabIndex = 0;
    sourceButton?.setAttribute('aria-pressed', String(editor.sourceMode));
  }
  emit('uif:editor-layout-change', { editor, layout }, editor.element);
}

function formField(name: string, label: string, value = '', type = 'text', placeholder = ''): string {
  return `<label class="uif-editor-dialog-field"><span>${escapeHtml(label)}</span><input class="uif-input" type="${type}" name="${escapeAttr(name)}" value="${escapeAttr(value)}"${placeholder ? ` placeholder="${escapeAttr(placeholder)}"` : ''}></label>`;
}

function currentLinkValue(editor: EditorInstance): Required<EditorLinkValue> {
  const link = currentLink(editor);
  const selectedText = link ? '' : selectedRichText(editor, '');
  return {
    text: link?.textContent || selectedText,
    href: link?.getAttribute('href') || '',
    title: link?.getAttribute('title') || '',
    target: link?.getAttribute('target') === '_blank' ? '_blank' : '_self',
  };
}

function currentImageValue(editor: EditorInstance): Required<EditorImageValue> {
  const image = currentImage(editor);
  const figure = image?.closest('figure');
  return {
    src: image?.getAttribute('src') || '',
    alt: image?.getAttribute('alt') || '',
    caption: figure?.querySelector('figcaption')?.textContent || '',
  };
}

function currentCodeBlockValue(editor: EditorInstance): Required<EditorCodeBlockValue> {
  if (editor.surface instanceof HTMLTextAreaElement) {
    const selected = editor.surface.value.slice(editor.surface.selectionStart, editor.surface.selectionEnd);
    return { code: selected, language: '' };
  }
  const pre = currentRichElement<HTMLElement>(editor, 'pre');
  const code = pre?.querySelector('code');
  return { code: code?.textContent || selectedRichText(editor, ''), language: code?.className.match(/(?:^|\s)language-([\w+-]+)/)?.[1] || '' };
}

function selectedSourceText(editor: EditorInstance): string {
  return editor.surface instanceof HTMLTextAreaElement
    ? editor.surface.value.slice(editor.surface.selectionStart, editor.surface.selectionEnd)
    : '';
}

function editorFocusableElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
}

function trapEditorFocus(root: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab') return false;
  const focusable = editorFocusableElements(root);
  if (!focusable.length) return false;
  const current = focusable.indexOf(document.activeElement as HTMLElement);
  const next = event.shiftKey
    ? (current <= 0 ? focusable.length - 1 : current - 1)
    : (current < 0 || current === focusable.length - 1 ? 0 : current + 1);
  event.preventDefault();
  focusable[next].focus();
  return true;
}

function positionEditorCommandDialog(dialog: HTMLElement, anchor?: HTMLElement): void {
  const margin = 8;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  dialog.style.removeProperty('right');
  dialog.style.removeProperty('bottom');
  if (viewportWidth <= 640) {
    dialog.dataset.uifEditorDialogPlacement = 'sheet';
    dialog.style.left = `${margin}px`;
    dialog.style.right = `${margin}px`;
    dialog.style.top = 'auto';
    dialog.style.bottom = `${margin}px`;
    return;
  }
  dialog.dataset.uifEditorDialogPlacement = 'popover';
  const anchorRect = anchor?.getBoundingClientRect() || editorToolbarAnchorRect(dialog);
  const width = dialog.offsetWidth || 360;
  const height = dialog.offsetHeight || 240;
  const left = Math.min(Math.max(anchorRect.left, margin), Math.max(margin, viewportWidth - width - margin));
  const preferredTop = anchorRect.bottom + margin;
  const top = preferredTop + height > viewportHeight - margin ? Math.max(margin, anchorRect.top - height - margin) : preferredTop;
  dialog.style.left = `${left}px`;
  dialog.style.top = `${top}px`;
}

function editorToolbarAnchorRect(dialog: HTMLElement): DOMRect {
  const fallback = dialog.getBoundingClientRect();
  return new DOMRect(fallback.left, fallback.top, fallback.width, fallback.height);
}

function openEditorCommandDialog(editor: EditorInstance, command: EditorCommand, apply: (value: unknown) => void, anchor?: HTMLElement): void {
  activeEditorTransient?.close(false);
  const dialog = document.createElement('form');
  dialog.className = 'uif-editor-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', editorCommandLabel(command));
  if (command === 'link') {
    const link = editor.mode === 'html' ? currentLinkValue(editor) : { text: selectedSourceText(editor), href: '', title: '', target: '_self' as const };
    setTrustedHTML(dialog, `<div class="uif-editor-dialog-grid">${formField('text', 'Text', link.text, 'text', 'Link text')}${formField('href', 'URL', link.href, 'text', 'https://example.com')}${formField('title', 'Title', link.title, 'text', 'Optional title')}<label class="uif-editor-dialog-check"><input type="checkbox" name="blank"${link.target === '_blank' ? ' checked' : ''}> Open in new tab</label></div>`, { trusted: true, context: 'editor link dialog' });
  } else if (command === 'image') {
    const image = editor.mode === 'html' ? currentImageValue(editor) : { src: '', alt: selectedSourceText(editor), caption: '' };
    setTrustedHTML(dialog, `<div class="uif-editor-dialog-grid">${formField('src', 'Image URL', image.src, 'text', '/image.png')}${formField('alt', 'Alt text', image.alt, 'text', 'Image description')}${formField('caption', 'Caption', image.caption, 'text', 'Optional caption')}</div>`, { trusted: true, context: 'editor image dialog' });
  } else if (command === 'table') {
    setTrustedHTML(dialog, `<div class="uif-editor-dialog-grid">${formField('rows', 'Rows', '2', 'number')}${formField('columns', 'Columns', '2', 'number')}<label class="uif-editor-dialog-check"><input type="checkbox" name="header" checked> Header row</label></div>`, { trusted: true, context: 'editor table dialog' });
  } else if (command === 'table-caption') {
    const caption = currentTable()?.caption?.textContent || '';
    setTrustedHTML(dialog, `<div class="uif-editor-dialog-grid">${formField('caption', 'Caption', caption, 'text', 'Table description')}</div>`, { trusted: true, context: 'editor table caption dialog' });
  } else if (command === 'code-block') {
    const code = currentCodeBlockValue(editor);
    setTrustedHTML(dialog, `<div class="uif-editor-dialog-grid">${formField('language', 'Language', code.language, 'text', 'Optional language')}${formField('code', 'Code', code.code, 'text', 'Code')}</div>`, { trusted: true, context: 'editor code dialog' });
  }
  swapTrustedHTML(dialog, '<div class="uif-editor-dialog-actions"><button type="button" class="uif-btn uif-btn-secondary" data-uif-editor-dialog-cancel>Cancel</button><button type="submit" class="uif-btn">Apply</button></div>', 'append');
  const closeDialog = (restoreFocus = true) => {
    dialog.remove();
    document.removeEventListener('pointerdown', handleOutsidePointer, true);
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange, true);
    if (restoreFocus) (anchor ?? editor.surface).focus();
    if (activeEditorTransient?.editor === editor) activeEditorTransient = null;
  };
  const handleOutsidePointer = (event: PointerEvent) => {
    const target = event.target instanceof Node ? event.target : null;
    if (!target || dialog.contains(target) || anchor?.contains(target)) return;
    closeDialog(false);
  };
  const handleViewportChange = () => positionEditorCommandDialog(dialog, anchor);
  dialog.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(dialog);
    if (command === 'link') apply({ text: data.get('text'), href: data.get('href'), title: data.get('title'), target: data.get('blank') ? '_blank' : '_self' });
    if (command === 'image') apply({ src: data.get('src'), alt: data.get('alt'), caption: data.get('caption') });
    if (command === 'table') apply({ rows: data.get('rows'), columns: data.get('columns'), header: Boolean(data.get('header')) });
    if (command === 'table-caption') apply({ caption: data.get('caption') });
    if (command === 'code-block') apply({ language: data.get('language'), code: data.get('code') });
    closeDialog(false);
  });
  dialog.querySelector('[data-uif-editor-dialog-cancel]')?.addEventListener('click', () => {
    closeDialog();
  });
  dialog.addEventListener('keydown', (event) => {
    if (trapEditorFocus(dialog, event)) return;
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeDialog();
  });
  document.body.append(dialog);
  activeEditorTransient = { editor, close: closeDialog };
  positionEditorCommandDialog(dialog, anchor);
  document.addEventListener('pointerdown', handleOutsidePointer, true);
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleViewportChange, true);
  dialog.querySelector<HTMLInputElement>('input')?.focus();
}

export function createEditor(el: HTMLElement, options: EditorOptions = {}): EditorInstance {
  if (editors.has(el)) return editors.get(el) as EditorInstance;
  const input = asInput(el);
  const config = parseOptions(el, options);
  const wrapper = document.createElement('div');
  const editorId = ++editorSequence;
  wrapper.className = 'uif-editor';
  wrapper.dataset.uifMode = config.mode;
  const toolbar = document.createElement('div');
  toolbar.className = 'uif-editor-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Editor formatting');
  const body = document.createElement('div');
  body.className = 'uif-editor-body';
  const surface = config.mode === 'markdown' || config.mode === 'plain' ? document.createElement('textarea') : document.createElement('div');
  surface.className = config.mode === 'markdown' || config.mode === 'plain' ? 'uif-editor-source' : 'uif-editor-surface';
  surface.id ||= `uif-editor-surface-${editorId}`;
  toolbar.setAttribute('aria-controls', surface.id);
  surface.style.minHeight = config.height;
  if (config.placeholder) surface.setAttribute('aria-placeholder', config.placeholder);
  if (surface instanceof HTMLTextAreaElement) {
    surface.value = input.value;
    surface.spellcheck = true;
    surface.placeholder = config.placeholder;
  } else {
    surface.contentEditable = 'true';
    setTrustedHTML(surface, config.mode === 'html' ? cleanEditorHtml(input.value) : escapeHtml(input.value), { trusted: true, context: 'editor initial value' });
  }
  const preview = document.createElement('div');
  preview.className = 'uif-editor-preview';
  preview.hidden = config.preview === 'none';
  const status = document.createElement('div');
  status.className = 'uif-editor-status';
  status.setAttribute('role', 'status');
  const announcer = document.createElement('div');
  announcer.className = 'uif-sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  const initialSourceMode = config.mode === 'html' ? false : config.mode === 'markdown' ? config.layout !== 'preview' : true;
  config.toolbar.forEach((command) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'uif-editor-button';
    button.dataset.uifEditorCommand = command;
    const label = editorCommandLabel(command);
    button.setAttribute('aria-label', label);
    button.title = label;
    setTrustedHTML(button, `${editorCommandIcon(command)}<span class="uif-sr-only">${escapeHtml(label)}</span>`, { trusted: true, context: 'editor toolbar' });
    if (command === 'source') button.setAttribute('aria-pressed', String(initialSourceMode));
    if (command === 'preview') button.setAttribute('aria-pressed', String(!preview.hidden));
    toolbar.append(button);
  });
  const toolbarButtons = () => [...toolbar.querySelectorAll<HTMLButtonElement>('.uif-editor-button:not([disabled])')];
  toolbarButtons().forEach((button, index) => { button.tabIndex = index === 0 ? 0 : -1; });
  input.hidden = true;
  input.setAttribute('data-uif-editor-input', 'true');
  input.insertAdjacentElement('afterend', wrapper);
  body.append(surface, preview);
  wrapper.append(toolbar, body);
  const tableTools = document.createElement('div');
  tableTools.className = 'uif-editor-table-tools';
  tableTools.hidden = true;
  setTrustedHTML(tableTools, [
    ['table-row-before', 'Row before'],
    ['table-row-after', 'Row'],
    ['table-col-before', 'Column before'],
    ['table-col-after', 'Column'],
    ['table-row-delete', 'Delete row'],
    ['table-col-delete', 'Delete column'],
    ['table-caption', 'Caption'],
    ['table-header-toggle', 'Header'],
    ['table-delete', 'Delete table'],
  ]
    .map(([command, label]) => `<button type="button" class="uif-editor-tool-chip" data-uif-editor-command="${command}">${label}</button>`)
    .join(''), { trusted: true, context: 'editor table tools' });
  if (config.mode === 'html') wrapper.append(tableTools);
  if (config.status) wrapper.append(status);
  wrapper.append(announcer);
  let destroyed = false;
  let resetTimer: number | undefined;
  const instance: EditorInstance = {
    element: wrapper,
    mode: config.mode,
    input,
    surface,
    preview,
    status: config.status ? status : undefined,
    dirty: false,
    diagnostics: [],
    sourceMode: initialSourceMode,
    getValue() {
      return input.value;
    },
    setValue(next: string) {
      const canonical = config.mode === 'html' && !(instance.sourceMode && instance.surface instanceof HTMLTextAreaElement) ? cleanEditorHtml(next) : next;
      const previous = input.value;
      if (previous !== canonical) pushHistory(instance, canonical);
      input.value = canonical;
      if (instance.surface instanceof HTMLTextAreaElement && instance.surface.value !== canonical) instance.surface.value = canonical;
      if (!(surface instanceof HTMLTextAreaElement) && surface.innerHTML !== canonical) setTrustedHTML(surface, config.mode === 'html' ? canonical : escapeHtml(canonical), { trusted: true, context: 'editor value' });
      instance.dirty = canonical !== editorInitialValue.get(instance);
      syncPreview(instance);
      updateStatus(instance);
      emit('uif:editor-change', { value: canonical, editor: instance }, wrapper);
      validateEditor(instance);
      if (config.autosave) {
        if (instance.dirty) scheduleAutosave(instance, config.autosaveDelay, {
          url: config.autosaveUrl || undefined,
          retries: config.autosaveRetries,
          csrfToken: config.csrfToken,
          csrfHeader: config.csrfHeader,
        });
        else {
          const timer = editorAutosaveTimers.get(instance);
          if (timer) window.clearTimeout(timer);
          const key = editorAutosaveKeys.get(instance);
          if (key) cancelRequest(key);
          editorAutosaveRevisions.set(instance, (editorAutosaveRevisions.get(instance) ?? 0) + 1);
          instance.element.dataset.uifAutosaveState = 'saved';
        }
      }
    },
    focus() {
      instance.surface.focus();
    },
    destroy() {
      destroyed = true;
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      if (activeEditorTransient?.editor === instance) activeEditorTransient.close(false);
      wrapper.remove();
      input.hidden = false;
      editors.delete(el);
      editorListeners.get(instance)?.forEach((cleanup) => cleanup());
      const autosaveTimer = editorAutosaveTimers.get(instance);
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      const autosaveKey = editorAutosaveKeys.get(instance);
      if (autosaveKey) cancelRequest(autosaveKey);
      editorUploadControllers.get(instance)?.abort();
      editorUploadControllers.delete(instance);
      destroyHistory(instance);
      editorListeners.delete(instance);
      emit('uif:editor-destroy', { editor: instance }, input);
    },
  };
  const initialValue = config.mode === 'html' ? cleanEditorHtml(input.value) : input.value;
  input.value = initialValue;
  editorInitialValue.set(instance, initialValue);
  editorAutosaveKeys.set(instance, `uif-editor-autosave-${editorId}`);
  editorAutosaveRevisions.set(instance, 0);
  initializeHistory(instance, initialValue);
  editorListeners.set(instance, []);
  const addEditorListener = (target: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => {
    target.addEventListener(type, listener, options);
    const cleanup = () => target.removeEventListener(type, listener, options);
    editorListeners.get(instance)?.push(cleanup);
    return cleanup;
  };
  const announce = (message: string) => { announcer.textContent = message; };
  let savedRange: Range | null = null;
  let richBookmark: EditorTextBookmark | null = null;
  let richScroll = { left: 0, top: 0 };
  let composing = false;
  let sourceSelection: { end: number; scrollLeft: number; scrollTop: number; start: number } | null = null;
  let htmlSourceBaseline = '';
  let htmlSourceCleanup: (() => void) | null = null;
  const saveRichSelection = () => {
    if (surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) return;
    savedRange = range.cloneRange();
  };
  const restoreRichSelection = () => {
    if (!savedRange || surface instanceof HTMLTextAreaElement || instance.surface !== surface) return;
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRange);
  };
  const syncFromSurface = () => {
    const activeSurface = instance.surface;
    if (!(activeSurface instanceof HTMLTextAreaElement)) syncRichControlAttributes(activeSurface);
    const value = activeSurface instanceof HTMLTextAreaElement ? activeSurface.value : cleanEditorHtml(activeSurface.innerHTML);
    void runEditorHooks('beforeInput', { editor: instance, value });
    instance.setValue(value);
    if (instance.mode === 'markdown') syncMarkdownSourceToPreview();
    void runEditorHooks('afterInput', { editor: instance, value });
  };
  const updateToolbarStates = () => {
    wrapper.querySelectorAll<HTMLButtonElement>('.uif-editor-button[data-uif-editor-command]').forEach((button) => {
      const command = button.dataset.uifEditorCommand;
      if (!command || command === 'source' || command === 'preview') return;
      const active = queryEditorCommand(instance, command);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  let syncingMarkdownScroll = false;
  const markdownSource = surface instanceof HTMLTextAreaElement ? surface : null;
  const releaseMarkdownScroll = () => window.requestAnimationFrame(() => { syncingMarkdownScroll = false; });
  const sourceScrollRatio = () => {
    if (!markdownSource) return 0;
    const max = markdownSource.scrollHeight - markdownSource.clientHeight;
    return max > 0 ? markdownSource.scrollTop / max : 0;
  };
  const syncMarkdownSourceToPreview = () => {
    if (instance.mode !== 'markdown' || !markdownSource || preview.hidden || syncingMarkdownScroll) return;
    syncingMarkdownScroll = true;
    const lines = Math.max(1, markdownSource.value.split('\n').length);
    const line = Math.round(sourceScrollRatio() * (lines - 1)) + 1;
    const markers = [...preview.querySelectorAll<HTMLElement>('[data-uif-md-line]')];
    const marker = markers.reduce<HTMLElement | null>((match, entry) => Number(entry.dataset.uifMdLine || 1) <= line ? entry : match, null);
    const max = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = marker ? Math.min(max, Math.max(0, marker.offsetTop)) : max * sourceScrollRatio();
    releaseMarkdownScroll();
  };
  const syncMarkdownPreviewToSource = () => {
    if (instance.mode !== 'markdown' || !markdownSource || markdownSource.hidden || syncingMarkdownScroll) return;
    syncingMarkdownScroll = true;
    const markers = [...preview.querySelectorAll<HTMLElement>('[data-uif-md-line]')];
    const marker = markers.reduce<HTMLElement | null>((match, entry) => entry.offsetTop <= preview.scrollTop + 1 ? entry : match, null);
    const lines = Math.max(1, markdownSource.value.split('\n').length);
    const line = Number(marker?.dataset.uifMdLine || 1);
    const max = markdownSource.scrollHeight - markdownSource.clientHeight;
    markdownSource.scrollTop = max * Math.min(1, Math.max(0, (line - 1) / Math.max(1, lines - 1)));
    releaseMarkdownScroll();
  };
  const updateActiveTableCell = (target: EventTarget | null) => {
    const cell = target instanceof Element ? target.closest<HTMLTableCellElement>('td,th') : null;
    if (cell && surface.contains(cell)) editorActiveTableCell.set(instance, cell);
  };
  const updateTableTools = (target?: EventTarget | null) => {
    if (config.mode !== 'html') return;
    if (instance.surface instanceof HTMLTextAreaElement) {
      tableTools.hidden = true;
      return;
    }
    updateActiveTableCell(target ?? null);
    const cell = currentTableCell() ?? editorActiveTableCell.get(instance) ?? null;
    tableTools.hidden = !cell?.closest('table');
  };
  const handleEditorKeydown = (event: KeyboardEvent) => {
    const activeSurface = instance.surface;
    if (!(activeSurface instanceof HTMLTextAreaElement) && handleRichTableKey(instance, event)) {
      syncFromSurface();
      return;
    }
    if (event.key === 'Tab') {
      const markdownList = activeSurface instanceof HTMLTextAreaElement && /^\s*(?:[-*+] |\d+\. )/.test(currentTextareaLine(activeSurface).line);
      const richList = !(activeSurface instanceof HTMLTextAreaElement) && currentRichElement(instance, 'li') !== null;
      if (markdownList || richList) {
        event.preventDefault();
        formatEditor(instance, event.shiftKey ? 'outdent' : 'indent');
        return;
      }
    }
    if (activeSurface instanceof HTMLTextAreaElement && instance.mode === 'markdown' && handleMarkdownListKey(activeSurface, event)) {
      syncFromSurface();
      return;
    }
    if (!(activeSurface instanceof HTMLTextAreaElement) && handleRichTaskKey(instance, event)) {
      syncFromSurface();
      return;
    }
    if (!(activeSurface instanceof HTMLTextAreaElement) && handleRichListKey(instance, event)) {
      syncFromSurface();
      return;
    }
    if (!(activeSurface instanceof HTMLTextAreaElement) && handleRichBlockKey(instance, event)) {
      syncFromSurface();
      return;
    }
    const key = event.key.toLowerCase();
    if (!(event.metaKey || event.ctrlKey)) return;
    if (key === 'b') {
      event.preventDefault();
      formatEditor(instance, 'bold');
    }
    if (key === 'i') {
      event.preventDefault();
      formatEditor(instance, 'italic');
    }
    if (key === 'k') {
      event.preventDefault();
      formatEditor(instance, 'link');
    }
    if (key === 'z' && event.shiftKey) {
      event.preventDefault();
      formatEditor(instance, 'redo');
    } else if (key === 'z') {
      event.preventDefault();
      formatEditor(instance, 'undo');
    }
  };
  const insertRichTransfer = (html: string, text: string) => {
    if (html) insertRichHtml(instance, html);
    else if (text) {
      const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map((part) => `<p>${escapeHtml(part).replaceAll('\n', '<br>')}</p>`).join('');
      insertRichHtml(instance, paragraphs);
    }
  };
  const handleEditorPaste = (event: ClipboardEvent) => {
    prepareHistory(instance, { origin: 'paste' });
    void runEditorHooks('beforePaste', { editor: instance, value: instance.getValue() });
    if (!(instance.surface instanceof HTMLTextAreaElement)) {
      event.preventDefault();
      const html = event.clipboardData?.getData('text/html') ?? '';
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (!pasteRichTableGrid(instance, text)) insertRichTransfer(html, text);
      syncFromSurface();
      saveRichSelection();
      updateToolbarStates();
      void runEditorHooks('afterPaste', { editor: instance, value: instance.getValue() });
      return;
    }
    window.setTimeout(() => {
      syncFromSurface();
      void runEditorHooks('afterPaste', { editor: instance, value: instance.getValue() });
    });
  };
  const handleEditorDrop = async (event: DragEvent) => {
    if (instance.surface instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    prepareHistory(instance, { origin: 'drop' });
    const files = Array.from(event.dataTransfer?.files ?? []);
    editorUploadControllers.get(instance)?.abort();
    const uploadController = new AbortController();
    editorUploadControllers.set(instance, uploadController);
    try {
      await runEditorHooks('beforeDrop', { editor: instance, value: instance.getValue(), signal: uploadController.signal });
      if (files.length) {
        instance.element.dataset.uifUploadState = 'uploading';
        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          if (file.size > config.uploadMaxBytes) throw new Error(`Image exceeds the ${config.uploadMaxBytes} byte upload limit`);
          const results = await runEditorHooks('uploadImage', { editor: instance, value: instance.getValue(), file, signal: uploadController.signal });
          if (uploadController.signal.aborted) return;
          const url = results.find((result): result is string => typeof result === 'string' && isSafeURL(result, { context: 'image', allowHash: false }));
          if (url) insertRichHtml(instance, `<img src="${escapeAttr(url)}" alt="${escapeAttr(file.name)}">`);
        }
        instance.element.dataset.uifUploadState = 'uploaded';
      } else {
        insertRichTransfer(event.dataTransfer?.getData('text/html') ?? '', event.dataTransfer?.getData('text/plain') ?? '');
      }
      syncFromSurface();
      saveRichSelection();
      updateToolbarStates();
      await runEditorHooks('afterDrop', { editor: instance, value: instance.getValue(), signal: uploadController.signal });
    } catch (error) {
      if (uploadController.signal.aborted) return;
      instance.element.dataset.uifUploadState = 'error';
      emit('uif:editor-upload-error', { editor: instance, error }, instance.element);
      emit('uif:editor-error', { editor: instance, error }, instance.element);
    } finally {
      if (editorUploadControllers.get(instance) === uploadController) editorUploadControllers.delete(instance);
    }
  };
  const bindCurrentSurfaceEvents = (current: HTMLElement) => {
    const listeners = editorListeners.get(instance) as Array<() => void>;
    const start = listeners.length;
    addEditorListener(current, 'compositionstart', () => {
      prepareHistory(instance, { origin: 'composition' });
      composing = true;
    });
    addEditorListener(current, 'compositionend', () => {
      composing = false;
      syncFromSurface();
    });
    addEditorListener(current, 'beforeinput', (event) => {
      if (!composing) prepareHistory(instance, { origin: current instanceof HTMLTextAreaElement && instance.sourceMode ? 'source' : 'input', inputType: event instanceof InputEvent ? event.inputType : '' });
    });
    addEditorListener(current, 'input', () => { if (!composing) syncFromSurface(); });
    addEditorListener(current, 'change', syncFromSurface);
    addEditorListener(current, 'keyup', () => updateStatus(instance));
    addEditorListener(current, 'mouseup', () => updateStatus(instance));
    addEditorListener(current, 'select', () => updateStatus(instance));
    addEditorListener(current, 'keydown', (event) => {
      if (event instanceof KeyboardEvent) handleEditorKeydown(event);
    });
    addEditorListener(current, 'paste', (event) => handleEditorPaste(event as ClipboardEvent));
    addEditorListener(current, 'dragover', (event) => { if (!(instance.surface instanceof HTMLTextAreaElement)) event.preventDefault(); });
    addEditorListener(current, 'drop', (event) => { void handleEditorDrop(event as DragEvent); });
    addEditorListener(current, 'focus', () => emit('uif:editor-focus', { editor: instance }, wrapper));
    addEditorListener(current, 'blur', () => emit('uif:editor-blur', { editor: instance }, wrapper));
    return () => listeners.splice(start, listeners.length - start).forEach((cleanup) => cleanup());
  };
  if (input.form) {
    addEditorListener(input.form, 'reset', () => {
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetTimer = undefined;
        if (destroyed) return;
        const value = config.mode === 'html' ? cleanEditorHtml(input.value) : input.value;
        editorInitialValue.set(instance, value);
        instance.setValue(value);
        initializeHistory(instance, value);
        instance.dirty = false;
        updateStatus(instance);
        emit('uif:editor-reset', { editor: instance, value }, wrapper);
      });
    });
  }
  const setMarkdownSourceMode = (sourceVisible: boolean, focus = true) => {
    instance.sourceMode = sourceVisible;
    surface.hidden = !sourceVisible;
    preview.hidden = sourceVisible;
    if (!sourceVisible) {
      syncPreview(instance);
      preview.tabIndex = 0;
    }
    const sourceButton = wrapper.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]');
    sourceButton?.setAttribute('aria-pressed', String(instance.sourceMode));
    updateStatus(instance);
    if (focus) (sourceVisible ? surface : preview).focus();
  };
  bindCurrentSurfaceEvents(surface);
  if (config.mode === 'markdown') {
    addEditorListener(surface, 'scroll', syncMarkdownSourceToPreview as EventListener);
    addEditorListener(preview, 'scroll', syncMarkdownPreviewToSource as EventListener);
  }
  addEditorListener(surface, 'keyup', (event) => {
    saveRichSelection();
    updateTableTools(event.target);
    updateToolbarStates();
  });
  addEditorListener(surface, 'mouseup', (event) => {
    saveRichSelection();
    updateTableTools(event.target);
    updateToolbarStates();
  });
  addEditorListener(toolbar, 'mousedown', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-uif-editor-command]')) event.preventDefault();
  });
  addEditorListener(toolbar, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      const buttons = toolbarButtons();
      const current = event.target instanceof HTMLButtonElement ? buttons.indexOf(event.target) : -1;
      if (current < 0 || !buttons.length) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons.forEach((button, index) => { button.tabIndex = index === next ? 0 : -1; });
      buttons[next]?.focus();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-uif-editor-command]') : null;
    if (!button) return;
    event.preventDefault();
    button.click();
  });
  addEditorListener(toolbar, 'focusin', (event) => {
    const button = event.target instanceof HTMLButtonElement ? event.target : null;
    if (!button?.classList.contains('uif-editor-button')) return;
    toolbarButtons().forEach((entry) => { entry.tabIndex = entry === button ? 0 : -1; });
  });
  addEditorListener(toolbar, 'click', (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-uif-editor-command]') : null;
    const command = button?.dataset.uifEditorCommand as EditorCommand | undefined;
    if (!button || !command) return;
    if (command === 'preview') {
      const layout = (instance.element.dataset.uifEditorLayout as EditorLayout | undefined) ?? config.layout;
      if (config.mode === 'markdown' && (layout === 'modal' || layout === 'drawer')) {
        openPreviewOverlay(instance, layout, button);
        return;
      }
      void runEditorHooks('beforePreview', { editor: instance, value: instance.getValue(), command });
      if (config.mode === 'markdown') {
        if (layout === 'split') {
          syncPreview(instance);
          surface.hidden = false;
          preview.hidden = false;
          instance.sourceMode = true;
          wrapper.querySelector<HTMLButtonElement>('[data-uif-editor-command="source"]')?.setAttribute('aria-pressed', 'true');
        } else {
          setMarkdownSourceMode(false);
        }
      } else {
        preview.hidden = !preview.hidden;
        syncPreview(instance);
      }
      button.setAttribute('aria-pressed', String(!preview.hidden));
      emit('uif:editor-preview', { editor: instance, visible: !preview.hidden }, wrapper);
      announce(`Preview ${preview.hidden ? 'hidden' : 'shown'}`);
      void runEditorHooks('afterPreview', { editor: instance, value: instance.getValue(), command });
      return;
    }
    if (command === 'source' && config.mode === 'html') {
      instance.sourceMode = !instance.sourceMode;
      button.setAttribute('aria-pressed', String(instance.sourceMode));
      if (instance.sourceMode) {
        saveRichSelection();
        richBookmark = captureTextBookmark(surface) ?? richBookmark;
        richScroll = { left: surface.scrollLeft, top: surface.scrollTop };
        const source = document.createElement('textarea');
        source.className = 'uif-editor-source';
        source.style.minHeight = config.height;
        source.value = instance.getValue();
        htmlSourceBaseline = source.value;
        body.replaceChild(source, surface);
        instance.surface = source;
        htmlSourceCleanup = bindCurrentSurfaceEvents(source);
        savedRange = null;
        editorActiveTableCell.delete(instance);
        updateTableTools();
        source.focus();
        if (sourceSelection) {
          source.setSelectionRange(sourceSelection.start, sourceSelection.end);
          source.scrollTop = sourceSelection.scrollTop;
          source.scrollLeft = sourceSelection.scrollLeft;
        } else if (richBookmark?.text) {
          const selectedStart = source.value.indexOf(richBookmark.text);
          if (selectedStart >= 0) source.setSelectionRange(selectedStart, selectedStart + richBookmark.text.length);
        }
      } else {
        const source = instance.surface as HTMLTextAreaElement;
        htmlSourceCleanup?.();
        htmlSourceCleanup = null;
        sourceSelection = { start: source.selectionStart, end: source.selectionEnd, scrollTop: source.scrollTop, scrollLeft: source.scrollLeft };
        const sourceValue = source.value;
        const cleaned = cleanEditorHtml(sourceValue);
        if (cleaned !== source.value) source.value = cleaned;
        instance.setValue(cleaned);
        body.replaceChild(surface, source);
        instance.surface = surface;
        if (surface.innerHTML !== cleaned) {
          setTrustedHTML(surface, cleaned, { trusted: true, context: 'editor input normalization' });
          savedRange = null;
        }
        editorActiveTableCell.delete(instance);
        updateTableTools();
        surface.focus();
        surface.scrollTop = richScroll.top;
        surface.scrollLeft = richScroll.left;
        if (!richBookmark || !restoreTextBookmark(surface, richBookmark)) {
          if (cleaned === htmlSourceBaseline) restoreRichSelection();
        }
        saveRichSelection();
        richBookmark = captureTextBookmark(surface) ?? richBookmark;
        if (cleaned !== sourceValue) {
          emit('uif:editor-normalize', { editor: instance, source: sourceValue, normalized: cleaned }, wrapper);
        }
        updateToolbarStates();
      }
      emit('uif:editor-mode-change', { editor: instance, source: instance.sourceMode }, wrapper);
      updateStatus(instance);
      announce(`${instance.sourceMode ? 'Source' : 'Rich'} mode`);
      return;
    }
    if (command === 'source' && config.mode === 'markdown') {
      const layout = (instance.element.dataset.uifEditorLayout as EditorLayout | undefined) ?? config.layout;
      if (layout === 'split') {
        instance.sourceMode = true;
        surface.hidden = false;
        preview.hidden = false;
        button.setAttribute('aria-pressed', 'true');
        surface.focus();
      } else if (layout === 'modal' || layout === 'drawer') {
        setMarkdownSourceMode(true);
      } else {
        setMarkdownSourceMode(!instance.sourceMode);
      }
      emit('uif:editor-mode-change', { editor: instance, source: instance.sourceMode }, wrapper);
      announce(`${instance.sourceMode ? 'Source' : 'Preview'} mode`);
      return;
    }
    emit('uif:editor-command', { editor: instance, command }, wrapper);
    restoreRichSelection();
    if ((command === 'link' || command === 'image' || command === 'table' || command === 'code-block') && !(event instanceof CustomEvent)) {
      openEditorCommandDialog(instance, command, (value) => {
        restoreRichSelection();
        formatEditor(instance, command, value);
        saveRichSelection();
        updateTableTools();
      }, button);
      return;
    }
    if (config.mode === 'markdown' && !instance.sourceMode) setMarkdownSourceMode(true);
    const wasActive = queryEditorCommand(instance, command);
    formatEditor(instance, command);
    saveRichSelection();
    updateTableTools();
    updateToolbarStates();
    if (!['undo', 'redo', 'link', 'image', 'table', 'code-block', 'clear', 'hr'].includes(command)) {
      announce(`${editorCommandLabel(command)} ${wasActive ? 'off' : 'on'}`);
    }
  });
  addEditorListener(tableTools, 'click', (event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-uif-editor-command]') : null;
    const command = button?.dataset.uifEditorCommand as EditorCommand | undefined;
    if (!command) return;
    restoreRichSelection();
    if (command === 'table-caption') {
      openEditorCommandDialog(instance, command, (value) => {
        restoreRichSelection();
        formatEditor(instance, command, value);
        saveRichSelection();
        updateTableTools();
      }, button ?? undefined);
      return;
    }
    formatEditor(instance, command);
    saveRichSelection();
    updateTableTools();
    updateToolbarStates();
  });
  addEditorListener(tableTools, 'mousedown', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-uif-editor-command]')) event.preventDefault();
  });
  editors.set(el, instance);
  instance.setValue(initialValue);
  setEditorPreviewLayout(instance, config.layout);
  emit('uif:editor-init', { editor: instance }, wrapper);
  return instance;
}

export function initEditor(el: HTMLElement, options?: EditorOptions): EditorInstance {
  return createEditor(el, options);
}

export function getEditorValue(editor: EditorInstance): string {
  return editor.getValue();
}

export function setEditorValue(editor: EditorInstance, value: string): void {
  editor.setValue(value);
}
