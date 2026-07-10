type EditorMode = 'html' | 'markdown' | 'plain';
type EditorPreviewMode = 'none' | 'manual' | 'live';
type EditorLayout = 'source' | 'preview' | 'split' | 'tabs' | 'modal' | 'drawer';
type EditorCommand = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'h1' | 'h2' | 'h3' | 'paragraph' | 'quote' | 'code' | 'code-inline' | 'code-block' | 'hr' | 'ul' | 'ol' | 'task' | 'link' | 'link-edit' | 'link-remove' | 'image' | 'image-edit' | 'image-remove' | 'table' | 'table-row-before' | 'table-row-after' | 'table-row-delete' | 'table-col-before' | 'table-col-after' | 'table-col-delete' | 'table-delete' | 'table-header-toggle' | 'undo' | 'redo' | 'preview' | 'source' | 'fullscreen' | 'clear';
interface EditorOptions {
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
interface EditorInstance {
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
interface EditorCommandContext {
    editor: EditorInstance;
    command: EditorCommand;
    value?: unknown;
}
type EditorCommandHandler = (context: EditorCommandContext) => void;
type EditorHookName = 'beforeInput' | 'afterInput' | 'beforeCommand' | 'afterCommand' | 'beforePaste' | 'afterPaste' | 'beforePreview' | 'afterPreview' | 'validate' | 'autosave' | 'uploadImage';
interface EditorHookContext {
    editor: EditorInstance;
    value: string;
    command?: EditorCommand;
    file?: File;
}
type EditorHookHandler = (context: EditorHookContext) => void | string | Promise<void | string>;
interface EditorLinkValue {
    text?: string;
    href?: string;
    title?: string;
    target?: '_self' | '_blank';
}
interface EditorImageValue {
    src?: string;
    alt?: string;
    caption?: string;
}
interface EditorTableValue {
    rows?: number;
    columns?: number;
    header?: boolean;
}
declare function registerEditorCommand(name: EditorCommand | string, handler: EditorCommandHandler): void;
declare function unregisterEditorCommand(name: EditorCommand | string): void;
declare function registerEditorHook(name: EditorHookName, handler: EditorHookHandler): () => void;
declare function escapeHtml(value: unknown): string;
declare function markdownToHtml(markdown: string): string;
declare function htmlToMarkdown(html: string): string;
declare function cleanEditorHtml(html: string): string;
declare function validateEditor(editor: EditorInstance): string[];
declare function queryEditorCommand(editor: EditorInstance, command: EditorCommand | string): boolean;
declare function runEditorCommand(editor: EditorInstance, command: EditorCommand, value?: unknown): void;
declare function formatEditor(editor: EditorInstance, command: EditorCommand, value?: unknown): void;
declare function setEditorPreviewLayout(editor: EditorInstance, layout: EditorLayout): void;
declare function createEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function initEditor(el: HTMLElement, options?: EditorOptions): EditorInstance;
declare function getEditorValue(editor: EditorInstance): string;
declare function setEditorValue(editor: EditorInstance, value: string): void;

export { type EditorCommand, type EditorCommandContext, type EditorCommandHandler, type EditorHookContext, type EditorHookHandler, type EditorHookName, type EditorImageValue, type EditorInstance, type EditorLayout, type EditorLinkValue, type EditorMode, type EditorOptions, type EditorPreviewMode, type EditorTableValue, cleanEditorHtml, createEditor, escapeHtml, formatEditor, getEditorValue, htmlToMarkdown, initEditor, markdownToHtml, queryEditorCommand, registerEditorCommand, registerEditorHook, runEditorCommand, setEditorPreviewLayout, setEditorValue, unregisterEditorCommand, validateEditor };
