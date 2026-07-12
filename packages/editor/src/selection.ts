export interface EditorSelectionSnapshot {
  end: number[];
  endOffset: number;
  start: number[];
  startOffset: number;
}

export interface EditorSnapshot {
  value: string;
  selection?: EditorSelectionSnapshot | { end: number; start: number };
  scrollLeft: number;
  scrollTop: number;
}

export interface EditorTextBookmark {
  end: number;
  start: number;
  text: string;
}

export interface SelectionEditor {
  surface: HTMLElement;
  getValue(): string;
}

function nodePath(root: Node, node: Node): number[] | null {
  const path: number[] = [];
  let current: Node | null = node;
  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, current) as number);
    current = parent;
  }
  return current === root ? path : null;
}

function nodeAtPath(root: Node, path: number[]): Node | null {
  let current: Node = root;
  for (const index of path) {
    const next = current.childNodes.item(index);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function captureTextBookmark(root: HTMLElement): EditorTextBookmark | null {
  const selection = document.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  return { start, end: start + range.toString().length, text: range.toString() };
}

function textBoundary(root: HTMLElement, offset: number): { node: Node; offset: number } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, offset);
  let node = walker.nextNode();
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (remaining <= length) return { node, offset: remaining };
    remaining -= length;
    node = walker.nextNode();
  }
  return { node: root, offset: root.childNodes.length };
}

export function restoreTextBookmark(root: HTMLElement, bookmark: EditorTextBookmark): boolean {
  const start = textBoundary(root, bookmark.start);
  const end = textBoundary(root, bookmark.end);
  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return true;
  } catch {
    return false;
  }
}

export function captureSnapshot(editor: SelectionEditor, value = editor.getValue()): EditorSnapshot {
  const surface = editor.surface;
  const snapshot: EditorSnapshot = { value, scrollLeft: surface.scrollLeft, scrollTop: surface.scrollTop };
  if (surface instanceof HTMLTextAreaElement) {
    snapshot.selection = { start: surface.selectionStart, end: surface.selectionEnd };
    return snapshot;
  }
  const selection = document.getSelection();
  if (!selection?.rangeCount) return snapshot;
  const range = selection.getRangeAt(0);
  if (!surface.contains(range.commonAncestorContainer)) return snapshot;
  const start = nodePath(surface, range.startContainer);
  const end = nodePath(surface, range.endContainer);
  if (start && end) snapshot.selection = { start, startOffset: range.startOffset, end, endOffset: range.endOffset };
  return snapshot;
}

function isTextareaSelection(selection: EditorSnapshot['selection']): selection is { end: number; start: number } {
  return Boolean(selection && typeof selection.start === 'number');
}

export function restoreSnapshot(editor: SelectionEditor, snapshot: EditorSnapshot): void {
  const surface = editor.surface;
  surface.scrollLeft = snapshot.scrollLeft;
  surface.scrollTop = snapshot.scrollTop;
  if (!snapshot.selection) return;
  if (surface instanceof HTMLTextAreaElement && isTextareaSelection(snapshot.selection)) {
    surface.setSelectionRange(snapshot.selection.start, snapshot.selection.end);
    return;
  }
  if (surface instanceof HTMLTextAreaElement || isTextareaSelection(snapshot.selection)) return;
  const start = nodeAtPath(surface, snapshot.selection.start);
  const end = nodeAtPath(surface, snapshot.selection.end);
  if (!start || !end) return;
  try {
    const range = document.createRange();
    range.setStart(start, Math.min(snapshot.selection.startOffset, start.nodeType === Node.TEXT_NODE ? (start.textContent?.length ?? 0) : start.childNodes.length));
    range.setEnd(end, Math.min(snapshot.selection.endOffset, end.nodeType === Node.TEXT_NODE ? (end.textContent?.length ?? 0) : end.childNodes.length));
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  } catch {
    // Normalization can invalidate a DOM boundary while content restoration still succeeds.
  }
}
