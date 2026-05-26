type EditorMode = 'html' | 'markdown' | 'plain';
type EditorPreviewMode = 'none' | 'manual' | 'live';
type EditorCommand = 'bold' | 'italic' | 'underline' | 'heading' | 'quote' | 'code' | 'ul' | 'ol' | 'link' | 'undo' | 'redo' | 'preview' | 'source' | 'clear';
interface EditorOptions {
    mode?: EditorMode;
    toolbar?: string[];
    preview?: EditorPreviewMode;
    height?: string;
}
interface EditorInstance {
    element: HTMLElement;
    mode: EditorMode;
    input: HTMLTextAreaElement | HTMLInputElement;
    surface: HTMLElement;
    preview?: HTMLElement;
    getValue(): string;
    setValue(value: string): void;
    focus(): void;
    destroy(): void;
}
declare function escapeHtml(value: unknown): string;
declare function markdownToHtml(markdown: string): string;
declare function htmlToMarkdown(html: string): string;
declare function cleanEditorHtml(html: string): string;
declare function formatEditor(editor: EditorInstance, command: EditorCommand, value?: string): void;
declare function createEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function initEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function getEditorValue(editor: EditorInstance): string;
declare function setEditorValue(editor: EditorInstance, value: string): void;

export { type EditorCommand, type EditorInstance, type EditorMode, type EditorOptions, type EditorPreviewMode, cleanEditorHtml, createEditor, escapeHtml, formatEditor, getEditorValue, htmlToMarkdown, initEditor, markdownToHtml, setEditorValue };
