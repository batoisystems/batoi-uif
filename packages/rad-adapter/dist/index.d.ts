type SwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';
interface RadResponse {
    version?: 1 | 2;
    ok?: boolean;
    html?: string;
    target?: string;
    swap?: SwapMode;
    message?: string;
    focus?: string;
    redirect?: string;
    errors?: Record<string, string[]>;
    events?: Array<{
        name: string;
        detail?: unknown;
        target?: string;
    }>;
    actions?: Array<{
        type: string;
        [key: string]: unknown;
    }>;
}
declare const radEnvelopeContract: Readonly<{
    name: "rad-partial";
    versions: readonly [1, 2];
    fields: readonly ["actions", "errors", "events", "focus", "html", "message", "ok", "redirect", "swap", "target", "version"];
    actions: readonly ["focus", "redirect", "toast"];
    swapModes: readonly ["after", "append", "before", "inner", "outer", "prepend"];
    authority: "governed-server-html";
    limits: Readonly<{
        htmlCharacters: 1000000;
        collectionItems: 100;
        messageCharacters: 10000;
    }>;
}>;
declare function swapContent(targetEl: HTMLElement, html: string, mode?: string): HTMLElement;
declare function rehydrate(targetEl: HTMLElement): void;
declare function loadPartial(sourceEl: HTMLElement): Promise<RadResponse | null>;
declare function bindRadActions(root?: Document | HTMLElement): () => void;

export { type RadResponse, type SwapMode, bindRadActions, loadPartial, radEnvelopeContract, rehydrate, swapContent };
