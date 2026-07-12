type MarkdownDiagnosticSeverity = 'info' | 'warning' | 'error';
interface MarkdownDiagnostic {
    code: string;
    column: number;
    line: number;
    message: string;
    severity: MarkdownDiagnosticSeverity;
}
interface MarkdownParseOptions {
    maxInputLength?: number;
    maxLines?: number;
    maxNesting?: number;
    maxTableColumns?: number;
}
interface MarkdownRenderOptions {
    sourceMap?: boolean;
}
interface MarkdownSourcePosition {
    endLine: number;
    startLine: number;
}
type MarkdownInlineNode = {
    type: 'text';
    value: string;
} | {
    type: 'break';
} | {
    type: 'code';
    value: string;
} | {
    type: 'strong';
    children: MarkdownInlineNode[];
} | {
    type: 'emphasis';
    children: MarkdownInlineNode[];
} | {
    type: 'strike';
    children: MarkdownInlineNode[];
} | {
    type: 'link';
    children: MarkdownInlineNode[];
    href: string;
    title?: string;
} | {
    type: 'image';
    alt: string;
    src: string;
    title?: string;
};
interface MarkdownListItem {
    checked?: boolean;
    children: MarkdownListNode[];
    content: MarkdownInlineNode[];
}
interface MarkdownListNode {
    type: 'list';
    ordered: boolean;
    start: number;
    task: boolean;
    items: MarkdownListItem[];
    position?: MarkdownSourcePosition;
}
type MarkdownBlockNode = {
    type: 'heading';
    depth: number;
    content: MarkdownInlineNode[];
    position?: MarkdownSourcePosition;
} | {
    type: 'paragraph';
    content: MarkdownInlineNode[];
    position?: MarkdownSourcePosition;
} | {
    type: 'codeBlock';
    language?: string;
    value: string;
    position?: MarkdownSourcePosition;
} | {
    type: 'blockquote';
    children: MarkdownBlockNode[];
    position?: MarkdownSourcePosition;
} | MarkdownListNode | {
    type: 'table';
    align: Array<'left' | 'center' | 'right' | undefined>;
    header: MarkdownInlineNode[][];
    rows: MarkdownInlineNode[][][];
    position?: MarkdownSourcePosition;
} | {
    type: 'thematicBreak';
    position?: MarkdownSourcePosition;
};
interface MarkdownDocument {
    type: 'document';
    children: MarkdownBlockNode[];
    diagnostics: MarkdownDiagnostic[];
    truncated: boolean;
}
declare function parseMarkdownInline(value: string): MarkdownInlineNode[];
declare function parseMarkdown(markdown: string, options?: MarkdownParseOptions): MarkdownDocument;
declare function renderMarkdown(document: MarkdownDocument, options?: MarkdownRenderOptions): string;
declare function markdownToHtml(markdown: string, options?: MarkdownParseOptions): string;
declare function markdownDiagnostics(markdown: string, options?: MarkdownParseOptions): MarkdownDiagnostic[];

type EditorMode = 'html' | 'markdown' | 'plain';
type EditorPreviewMode = 'none' | 'manual' | 'live';
type EditorLayout = 'source' | 'preview' | 'split' | 'tabs' | 'modal' | 'drawer';
type EditorCommand = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'paragraph' | 'quote' | 'code' | 'code-inline' | 'code-block' | 'hr' | 'ul' | 'ol' | 'task' | 'indent' | 'outdent' | 'link' | 'link-edit' | 'link-remove' | 'image' | 'image-edit' | 'image-remove' | 'table' | 'table-row-before' | 'table-row-after' | 'table-row-delete' | 'table-col-before' | 'table-col-after' | 'table-col-delete' | 'table-delete' | 'table-header-toggle' | 'table-caption' | 'undo' | 'redo' | 'preview' | 'source' | 'fullscreen' | 'clear';
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
    autosaveRetries?: number;
    csrfToken?: string;
    csrfHeader?: string;
    uploadMaxBytes?: number;
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
    diagnostics: MarkdownDiagnostic[];
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
type EditorHookName = 'beforeInput' | 'afterInput' | 'beforeCommand' | 'afterCommand' | 'beforePaste' | 'afterPaste' | 'beforeDrop' | 'afterDrop' | 'beforePreview' | 'afterPreview' | 'validate' | 'autosave' | 'uploadImage';
interface EditorHookContext {
    editor: EditorInstance;
    value: string;
    command?: EditorCommand;
    file?: File;
    revision?: number;
    signal?: AbortSignal;
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
interface EditorCodeBlockValue {
    code?: string;
    language?: string;
}
declare function registerEditorCommand(name: EditorCommand | string, handler: EditorCommandHandler): void;
declare function unregisterEditorCommand(name: EditorCommand | string): void;
declare function registerEditorHook(name: EditorHookName, handler: EditorHookHandler): () => void;
declare function escapeHtml(value: unknown): string;
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

export { type EditorCodeBlockValue, type EditorCommand, type EditorCommandContext, type EditorCommandHandler, type EditorHookContext, type EditorHookHandler, type EditorHookName, type EditorImageValue, type EditorInstance, type EditorLayout, type EditorLinkValue, type EditorMode, type EditorOptions, type EditorPreviewMode, type EditorTableValue, type MarkdownBlockNode, type MarkdownDiagnostic, type MarkdownDiagnosticSeverity, type MarkdownDocument, type MarkdownInlineNode, type MarkdownListItem, type MarkdownListNode, type MarkdownParseOptions, type MarkdownRenderOptions, type MarkdownSourcePosition, cleanEditorHtml, createEditor, escapeHtml, formatEditor, getEditorValue, htmlToMarkdown, initEditor, markdownDiagnostics, markdownToHtml, parseMarkdown, parseMarkdownInline, queryEditorCommand, registerEditorCommand, registerEditorHook, renderMarkdown, runEditorCommand, setEditorPreviewLayout, setEditorValue, unregisterEditorCommand, validateEditor };
