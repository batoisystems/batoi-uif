import { captureSnapshot, restoreSnapshot, type EditorSnapshot, type SelectionEditor } from './selection.js';

export interface TransactionEditor extends SelectionEditor {
  setValue(value: string): void;
}

export interface TransactionMetadata {
  inputType?: string;
  origin: 'command' | 'composition' | 'drop' | 'input' | 'paste' | 'programmatic' | 'source';
  timestamp?: number;
}

interface EditorHistory {
  applying: boolean;
  lastChange?: Required<Pick<TransactionMetadata, 'origin' | 'timestamp'>> & Pick<TransactionMetadata, 'inputType'>;
  last: EditorSnapshot;
  pending?: TransactionMetadata;
  redo: EditorSnapshot[];
  undo: EditorSnapshot[];
}

const histories = new WeakMap<TransactionEditor, EditorHistory>();

export function initializeHistory(editor: TransactionEditor, value = editor.getValue()): void {
  histories.set(editor, { applying: false, undo: [], redo: [], last: captureSnapshot(editor, value) });
}

export function destroyHistory(editor: TransactionEditor): void {
  histories.delete(editor);
}

function inputFamily(inputType = ''): string {
  if (inputType.startsWith('insert')) return 'insert';
  if (inputType.startsWith('delete')) return 'delete';
  return inputType;
}

function canGroup(previous: EditorHistory['lastChange'], next: TransactionMetadata): boolean {
  const timestamp = next.timestamp ?? Date.now();
  return (previous?.origin === 'input' || previous?.origin === 'source')
    && previous.origin === next.origin
    && inputFamily(previous.inputType) === inputFamily(next.inputType)
    && timestamp - previous.timestamp <= 1000;
}

export function pushHistory(editor: TransactionEditor, next: string, metadata?: TransactionMetadata): void {
  const history = histories.get(editor);
  if (!history || history.applying) return;
  if (history.last.value === next) {
    history.pending = undefined;
    return;
  }
  const change = metadata ?? history.pending ?? { origin: 'programmatic' };
  if (!canGroup(history.lastChange, change)) {
    history.undo.push(history.last);
    if (history.undo.length > 60) history.undo.shift();
  }
  history.redo = [];
  history.last = captureSnapshot(editor, next);
  history.lastChange = { origin: change.origin, inputType: change.inputType, timestamp: change.timestamp ?? Date.now() };
  history.pending = undefined;
}

export function prepareHistory(editor: TransactionEditor, metadata: TransactionMetadata = { origin: 'programmatic' }): void {
  const history = histories.get(editor);
  if (!history || history.applying) return;
  history.last = captureSnapshot(editor);
  history.pending = metadata;
}

export function restoreHistory(editor: TransactionEditor, direction: 'undo' | 'redo'): void {
  const history = histories.get(editor);
  if (!history) return;
  const from = direction === 'undo' ? history.undo : history.redo;
  const to = direction === 'undo' ? history.redo : history.undo;
  const snapshot = from.pop();
  if (!snapshot) return;
  to.push(captureSnapshot(editor));
  history.applying = true;
  editor.setValue(snapshot.value);
  history.applying = false;
  history.last = snapshot;
  history.lastChange = undefined;
  history.pending = undefined;
  restoreSnapshot(editor, snapshot);
}
