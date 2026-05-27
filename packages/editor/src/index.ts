import { emit } from '@batoi/uif-core';

export type EditorMode = 'html' | 'markdown' | 'plain';
export type EditorPreviewMode = 'none' | 'manual' | 'live';
export type EditorLayout = 'source' | 'preview' | 'split' | 'tabs';
export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'code'
  | 'hr'
  | 'ul'
  | 'ol'
  | 'task'
  | 'link'
  | 'image'
  | 'table'
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
  sourceMode: boolean;
  getValue(): string;
  setValue(value: string): void;
  focus(): void;
  destroy(): void;
}

export interface EditorCommandContext {
  editor: EditorInstance;
  command: EditorCommand;
  value?: string;
}

export type EditorCommandHandler = (context: EditorCommandContext) => void;
export type EditorHookName =
  | 'beforeInput'
  | 'afterInput'
  | 'beforeCommand'
  | 'afterCommand'
  | 'beforePaste'
  | 'afterPaste'
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
}

export type EditorHookHandler = (context: EditorHookContext) => void | string | Promise<void | string>;

const editors = new WeakMap<HTMLElement, EditorInstance>();
const editorListeners = new WeakMap<EditorInstance, Array<() => void>>();
const editorInitialValue = new WeakMap<EditorInstance, string>();
const editorHistory = new WeakMap<EditorInstance, { undo: string[]; redo: string[]; last: string }>();
const commandHandlers = new Map<string, EditorCommandHandler>();
const hookHandlers = new Map<EditorHookName, Set<EditorHookHandler>>();
const editorAutosaveTimers = new WeakMap<EditorInstance, number>();
const defaultToolbar = ['undo', 'redo', 'bold', 'italic', 'heading', 'quote', 'code', 'ul', 'ol', 'link', 'preview', 'source'];
const commandLabels: Record<string, string> = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  heading: 'Heading',
  paragraph: 'Paragraph',
  quote: 'Quote',
  code: 'Code',
  hr: 'Horizontal rule',
  ul: 'Bulleted list',
  ol: 'Numbered list',
  task: 'Task list',
  link: 'Link',
  image: 'Image',
  table: 'Table',
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
  paragraph: '<path d="M13 20V5"></path><path d="M17 20V5"></path><path d="M17 5H9a4 4 0 0 0 0 8h4"></path>',
  quote: '<path d="M9 7H5v6h4v4l3-4V7z"></path><path d="M19 7h-4v6h4v4l3-4V7z"></path>',
  code: '<path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path>',
  hr: '<path d="M5 12h14"></path>',
  ul: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
  ol: '<path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M4 14h2l-2 4h2"></path>',
  task: '<path d="m4 7 2 2 4-4"></path><path d="M12 8h8"></path><path d="m4 17 2 2 4-4"></path><path d="M12 18h8"></path>',
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
  const body = commandIcons[command] ?? '<circle cx="12" cy="12" r="8"></circle>';
  return `<svg class="uif-icon uif-editor-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function isSafeUrl(value: string): boolean {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(value.trim());
}

function linesToList(lines: string[], ordered: boolean): string {
  const tag = ordered ? 'ol' : 'ul';
  const items = lines
    .map((line) => line.replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/, ''))
    .map((line) => `<li>${inlineMarkdown(line)}</li>`)
    .join('');
  return `<${tag}>${items}</${tag}>`;
}

function inlineMarkdown(value: string): string {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  output = output.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_match, alt: string, url: string) => {
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}">`;
  });
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g, (_match, label: string, url: string) => {
    return `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`;
  });
  output = output.replace(/(?<!href=")\bhttps?:\/\/[^\s<]+/g, (url) => `<a href="${escapeAttr(url)}">${escapeHtml(url)}</a>`);
  return output;
}

function tableToHtml(lines: string[]): string {
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());
  const [headerLine, , ...bodyLines] = lines;
  const header = cells(headerLine ?? '');
  const body = bodyLines.map(cells);
  return `<table><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i]?.startsWith('```')) {
        code.push(lines[i] ?? '');
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      i += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^\s*[-*+]\s+\[[ xX]\]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+\[[ xX]\]\s+/.test(lines[i] ?? '')) {
        const checked = /\[[xX]\]/.test(lines[i] ?? '');
        items.push((lines[i] ?? '').replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, `${checked ? '[x] ' : '[ ] '}`));
        i += 1;
      }
      blocks.push(
        `<ul class="uif-task-list">${items
          .map((item) => `<li><input type="checkbox" disabled${item.startsWith('[x]') ? ' checked' : ''}> ${inlineMarkdown(item.slice(4))}</li>`)
          .join('')}</ul>`,
      );
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? '')) {
        items.push(lines[i] ?? '');
        i += 1;
      }
      blocks.push(linesToList(items, false));
      continue;
    }
    if (/^\|.+\|$/.test(line) && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1] ?? '')) {
      const tableLines = [line, lines[i + 1] ?? ''];
      i += 2;
      while (i < lines.length && /^\|.+\|$/.test(lines[i] ?? '')) {
        tableLines.push(lines[i] ?? '');
        i += 1;
      }
      blocks.push(tableToHtml(tableLines));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? '')) {
        items.push(lines[i] ?? '');
        i += 1;
      }
      blocks.push(linesToList(items, true));
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quotes: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i] ?? '')) {
        quotes.push((lines[i] ?? '').replace(/^\s*>\s?/, ''));
        i += 1;
      }
      blocks.push(`<blockquote>${quotes.map(inlineMarkdown).join('<br>')}</blockquote>`);
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) {
      blocks.push('<hr>');
      i += 1;
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]?.trim() &&
      !/^(#{1,6})\s+/.test(lines[i] ?? '') &&
      !/^\s*[-*+]\s+/.test(lines[i] ?? '') &&
      !/^\s*\d+\.\s+/.test(lines[i] ?? '') &&
      !/^\s*>\s?/.test(lines[i] ?? '') &&
      !lines[i]?.startsWith('```')
    ) {
      para.push(lines[i] ?? '');
      i += 1;
    }
    blocks.push(`<p>${para.map(inlineMarkdown).join('<br>')}</p>`);
  }
  return blocks.join('\n');
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
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach((el) => el.remove());
  doc.querySelectorAll<HTMLElement>('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
      if ((attr.name === 'href' || attr.name === 'src') && !isSafeUrl(attr.value)) el.removeAttribute(attr.name);
      if (attr.name === 'style') el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
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
  return {
    mode: options.mode ?? (el.dataset.uifMode as EditorMode | undefined) ?? 'html',
    toolbar: options.toolbar ?? el.dataset.uifToolbar?.split(/\s+/).filter(Boolean) ?? defaultToolbar,
    preview: options.preview ?? (el.dataset.uifPreview as EditorPreviewMode | undefined) ?? 'manual',
    height: options.height ?? el.dataset.uifEditorHeight ?? '14rem',
    layout: options.layout ?? (el.dataset.uifEditorLayout as EditorLayout | undefined) ?? 'source',
    status: options.status ?? el.dataset.uifEditorStatus !== 'false',
    placeholder: options.placeholder ?? el.dataset.uifPlaceholder ?? '',
    autosave: options.autosave ?? el.dataset.uifAutosave === 'true',
    autosaveDelay: options.autosaveDelay ?? (Number(el.dataset.uifAutosaveDelay || '') || 1200),
    autosaveUrl: options.autosaveUrl ?? el.dataset.uifAutosaveUrl ?? '',
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

function applyMarkdownCommand(editor: EditorInstance, command: EditorCommand, value?: string): string {
  const surface = editor.surface instanceof HTMLTextAreaElement ? editor.surface : null;
  if (!surface) return editor.getValue();
  if (command === 'bold') return wrapSelection(surface, '**', '**', 'bold text');
  if (command === 'italic') return wrapSelection(surface, '*', '*', 'italic text');
  if (command === 'strike') return wrapSelection(surface, '~~', '~~', 'deleted text');
  if (command === 'heading') return insertAtSelection(surface, '\n## Heading\n');
  if (command === 'paragraph') return insertAtSelection(surface, '\nParagraph text\n');
  if (command === 'quote') return insertAtSelection(surface, '\n> Quote\n');
  if (command === 'code') return insertAtSelection(surface, '\n```\ncode\n```\n');
  if (command === 'hr') return insertAtSelection(surface, '\n---\n');
  if (command === 'ul') return insertAtSelection(surface, '\n- Item\n');
  if (command === 'ol') return insertAtSelection(surface, '\n1. Item\n');
  if (command === 'task') return insertAtSelection(surface, '\n- [ ] Task\n');
  if (command === 'link') return wrapSelection(surface, '[', `](${isSafeUrl(value ?? '') ? value : 'https://example.com'})`, 'link');
  if (command === 'image') return insertAtSelection(surface, `\n![Image alt](${isSafeUrl(value ?? '') ? value : 'https://example.com/image.png'})\n`);
  if (command === 'table') return insertAtSelection(surface, '\n| Column A | Column B |\n| --- | --- |\n| Value A | Value B |\n');
  if (command === 'clear') return '';
  return surface.value;
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function updateStatus(instance: EditorInstance): void {
  if (!instance.status) return;
  const value = instance.getValue();
  const words = countWords(value);
  const chars = value.length;
  const state = instance.dirty ? 'Unsaved changes' : 'Clean';
  instance.status.textContent = `${words} words · ${chars} characters · ${state}`;
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

async function autosaveEditor(editor: EditorInstance, url?: string): Promise<void> {
  const value = editor.getValue();
  editor.element.dataset.uifAutosaveState = 'saving';
  await runEditorHooks('autosave', { editor, value });
  if (url) {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: editor.input.name, value }),
    });
  }
  editor.element.dataset.uifAutosaveState = 'saved';
  editor.dirty = false;
  editorInitialValue.set(editor, value);
  updateStatus(editor);
  emit('uif:editor-autosave', { editor, value }, editor.element);
}

function scheduleAutosave(editor: EditorInstance, delay: number, url?: string): void {
  const existing = editorAutosaveTimers.get(editor);
  if (existing) window.clearTimeout(existing);
  editorAutosaveTimers.set(
    editor,
    window.setTimeout(() => {
      void autosaveEditor(editor, url).catch((error: unknown) => {
        editor.element.dataset.uifAutosaveState = 'error';
        emit('uif:editor-error', { editor, error }, editor.element);
      });
    }, delay),
  );
}

function pushHistory(instance: EditorInstance, next: string): void {
  const history = editorHistory.get(instance);
  if (!history || history.last === next) return;
  history.undo.push(history.last);
  if (history.undo.length > 60) history.undo.shift();
  history.redo = [];
  history.last = next;
}

function restoreHistory(instance: EditorInstance, direction: 'undo' | 'redo'): void {
  const history = editorHistory.get(instance);
  if (!history) return;
  const from = direction === 'undo' ? history.undo : history.redo;
  const to = direction === 'undo' ? history.redo : history.undo;
  const value = from.pop();
  if (value === undefined) return;
  to.push(instance.getValue());
  history.last = value;
  instance.setValue(value);
}

export function queryEditorCommand(editor: EditorInstance, command: EditorCommand | string): boolean {
  if (command === 'preview') return !editor.preview?.hidden;
  if (command === 'source') return editor.sourceMode;
  if (editor.mode !== 'html') return false;
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

export function runEditorCommand(editor: EditorInstance, command: EditorCommand, value?: string): void {
  const custom = commandHandlers.get(command);
  if (custom) {
    void runEditorHooks('beforeCommand', { editor, value: editor.getValue(), command });
    custom({ editor, command, value });
    void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
    return;
  }
  void runEditorHooks('beforeCommand', { editor, value: editor.getValue(), command });
  if (editor.mode === 'html') {
    editor.surface.focus();
    if (command === 'undo') restoreHistory(editor, 'undo');
    else if (command === 'redo') restoreHistory(editor, 'redo');
    else if (command === 'heading') document.execCommand('formatBlock', false, value || 'h2');
    else if (command === 'paragraph') document.execCommand('formatBlock', false, 'p');
    else if (command === 'quote') document.execCommand('formatBlock', false, 'blockquote');
    else if (command === 'code') document.execCommand('formatBlock', false, 'pre');
    else if (command === 'strike') document.execCommand('strikeThrough');
    else if (command === 'ul') document.execCommand('insertUnorderedList');
    else if (command === 'ol') document.execCommand('insertOrderedList');
    else if (command === 'hr') document.execCommand('insertHorizontalRule');
    else if (command === 'link') document.execCommand('createLink', false, isSafeUrl(value ?? '') ? value : '#');
    else if (command === 'image') {
      const imageUrl = isSafeUrl(value ?? '') ? String(value) : '';
      void runEditorHooks('uploadImage', { editor, value: imageUrl });
      document.execCommand('insertImage', false, imageUrl);
    }
    else if (command === 'table') document.execCommand('insertHTML', false, '<table><thead><tr><th>Column A</th><th>Column B</th></tr></thead><tbody><tr><td>Value A</td><td>Value B</td></tr></tbody></table>');
    else if (command === 'clear') document.execCommand('removeFormat');
    else if (command !== 'preview' && command !== 'source' && command !== 'fullscreen') document.execCommand(command);
    editor.setValue(cleanEditorHtml(editor.surface.innerHTML));
    void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
    return;
  }
  if (command === 'undo') restoreHistory(editor, 'undo');
  else if (command === 'redo') restoreHistory(editor, 'redo');
  else editor.setValue(applyMarkdownCommand(editor, command, value));
  void runEditorHooks('afterCommand', { editor, value: editor.getValue(), command });
}

export function formatEditor(editor: EditorInstance, command: EditorCommand, value?: string): void {
  runEditorCommand(editor, command, value);
}

function syncPreview(instance: EditorInstance): void {
  if (!instance.preview) return;
  instance.preview.innerHTML = instance.mode === 'markdown' ? markdownToHtml(instance.getValue()) : cleanEditorHtml(instance.getValue());
}

export function createEditor(el: HTMLElement, options: EditorOptions = {}): EditorInstance {
  if (editors.has(el)) return editors.get(el) as EditorInstance;
  const input = asInput(el);
  const config = parseOptions(el, options);
  const wrapper = document.createElement('div');
  wrapper.className = 'uif-editor';
  wrapper.dataset.uifMode = config.mode;
  const toolbar = document.createElement('div');
  toolbar.className = 'uif-editor-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  const body = document.createElement('div');
  body.className = 'uif-editor-body';
  const surface = config.mode === 'markdown' || config.mode === 'plain' ? document.createElement('textarea') : document.createElement('div');
  surface.className = config.mode === 'markdown' || config.mode === 'plain' ? 'uif-editor-source' : 'uif-editor-surface';
  surface.style.minHeight = config.height;
  if (config.placeholder) surface.setAttribute('aria-placeholder', config.placeholder);
  if (surface instanceof HTMLTextAreaElement) {
    surface.value = input.value;
    surface.spellcheck = true;
    surface.placeholder = config.placeholder;
  } else {
    surface.contentEditable = 'true';
    surface.innerHTML = config.mode === 'html' ? cleanEditorHtml(input.value) : escapeHtml(input.value);
  }
  const preview = document.createElement('div');
  preview.className = 'uif-editor-preview';
  preview.hidden = config.preview === 'none' || (config.layout === 'source' && config.preview !== 'live');
  const status = document.createElement('div');
  status.className = 'uif-editor-status';
  status.setAttribute('role', 'status');
  config.toolbar.forEach((command) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'uif-editor-button';
    button.dataset.uifEditorCommand = command;
    const label = editorCommandLabel(command);
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = `${editorCommandIcon(command)}<span class="uif-sr-only">${escapeHtml(label)}</span>`;
    if (command === 'source') button.setAttribute('aria-pressed', String(config.mode !== 'html'));
    if (command === 'preview') button.setAttribute('aria-pressed', String(!preview.hidden));
    toolbar.append(button);
  });
  input.hidden = true;
  input.setAttribute('data-uif-editor-input', 'true');
  input.insertAdjacentElement('afterend', wrapper);
  body.append(surface, preview);
  if (config.layout === 'split') body.classList.add('uif-editor-body-split');
  wrapper.append(toolbar, body);
  if (config.status) wrapper.append(status);
  const instance: EditorInstance = {
    element: wrapper,
    mode: config.mode,
    input,
    surface,
    preview,
    status: config.status ? status : undefined,
    dirty: false,
    sourceMode: config.mode !== 'html',
    getValue() {
      return input.value;
    },
    setValue(next: string) {
      const previous = input.value;
      if (previous !== next) pushHistory(instance, next);
      input.value = next;
      if (surface instanceof HTMLTextAreaElement && surface.value !== next) surface.value = next;
      if (!(surface instanceof HTMLTextAreaElement) && surface.innerHTML !== next) surface.innerHTML = config.mode === 'html' ? cleanEditorHtml(next) : escapeHtml(next);
      instance.dirty = next !== editorInitialValue.get(instance);
      syncPreview(instance);
      updateStatus(instance);
      emit('uif:editor-change', { value: next, editor: instance }, wrapper);
      validateEditor(instance);
      if (config.autosave && instance.dirty) scheduleAutosave(instance, config.autosaveDelay, config.autosaveUrl || undefined);
    },
    focus() {
      surface.focus();
    },
    destroy() {
      wrapper.remove();
      input.hidden = false;
      editors.delete(el);
      editorListeners.get(instance)?.forEach((cleanup) => cleanup());
      const autosaveTimer = editorAutosaveTimers.get(instance);
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      editorListeners.delete(instance);
      emit('uif:editor-destroy', { editor: instance }, input);
    },
  };
  editorInitialValue.set(instance, input.value);
  editorHistory.set(instance, { undo: [], redo: [], last: input.value });
  editorListeners.set(instance, []);
  const syncFromSurface = () => {
    const value = surface instanceof HTMLTextAreaElement ? surface.value : cleanEditorHtml(surface.innerHTML);
    void runEditorHooks('beforeInput', { editor: instance, value });
    instance.setValue(value);
    void runEditorHooks('afterInput', { editor: instance, value });
  };
  surface.addEventListener('input', syncFromSurface);
  surface.addEventListener('focus', () => emit('uif:editor-focus', { editor: instance }, wrapper));
  surface.addEventListener('blur', () => emit('uif:editor-blur', { editor: instance }, wrapper));
  toolbar.addEventListener('click', (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-uif-editor-command]') : null;
    const command = button?.dataset.uifEditorCommand as EditorCommand | undefined;
    if (!button || !command) return;
    if (command === 'preview') {
      void runEditorHooks('beforePreview', { editor: instance, value: instance.getValue(), command });
      preview.hidden = !preview.hidden;
      button.setAttribute('aria-pressed', String(!preview.hidden));
      syncPreview(instance);
      emit('uif:editor-preview', { editor: instance, visible: !preview.hidden }, wrapper);
      void runEditorHooks('afterPreview', { editor: instance, value: instance.getValue(), command });
      return;
    }
    if (command === 'source' && config.mode === 'html') {
      instance.sourceMode = !instance.sourceMode;
      button.setAttribute('aria-pressed', String(instance.sourceMode));
      if (instance.sourceMode) {
        const source = document.createElement('textarea');
        source.className = 'uif-editor-source';
        source.style.minHeight = config.height;
        source.value = instance.getValue();
        body.replaceChild(source, surface);
        instance.surface = source;
        source.addEventListener('input', () => instance.setValue(source.value));
        source.focus();
      } else {
        body.replaceChild(surface, instance.surface);
        instance.surface = surface;
        surface.innerHTML = cleanEditorHtml(instance.getValue());
        surface.focus();
      }
      emit('uif:editor-mode-change', { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    if (command === 'source' && config.mode === 'markdown') {
      instance.sourceMode = !instance.sourceMode;
      button.setAttribute('aria-pressed', String(instance.sourceMode));
      surface.hidden = !instance.sourceMode;
      preview.hidden = instance.sourceMode;
      if (instance.sourceMode) {
        surface.focus();
      } else {
        syncPreview(instance);
        preview.tabIndex = 0;
        preview.focus();
      }
      emit('uif:editor-mode-change', { editor: instance, source: instance.sourceMode }, wrapper);
      return;
    }
    emit('uif:editor-command', { editor: instance, command }, wrapper);
    formatEditor(instance, command);
  });
  surface.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) return;
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
  });
  surface.addEventListener('paste', () => {
    void runEditorHooks('beforePaste', { editor: instance, value: instance.getValue() });
    window.setTimeout(() => {
      syncFromSurface();
      void runEditorHooks('afterPaste', { editor: instance, value: instance.getValue() });
    });
  });
  editors.set(el, instance);
  instance.setValue(input.value);
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
