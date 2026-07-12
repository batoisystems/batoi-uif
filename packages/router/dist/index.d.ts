interface RouterOptions {
    target?: string;
    routes?: Record<string, string>;
    activeClass?: string;
    beforeNavigate?: (url: URL) => boolean | void | Promise<boolean | void>;
    afterNavigate?: (url: URL, target: HTMLElement | null) => void;
    restoreFocus?: boolean;
    restoreScroll?: boolean;
    allowCrossOrigin?: boolean;
    maxHTMLLength?: number;
}
declare function initRouter(root?: Document | HTMLElement, options?: RouterOptions): () => void;

export { type RouterOptions, initRouter };
