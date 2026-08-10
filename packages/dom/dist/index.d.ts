interface UIFDomComponent {
    name: string;
    init(el: HTMLElement): void;
    destroy?(el: HTMLElement): void;
}
type Root = Document | HTMLElement | DocumentFragment;
type HTMLSwapMode = 'inner' | 'outer' | 'append' | 'prepend' | 'before' | 'after';
interface TrustedHTMLRenderOptions {
    trusted?: boolean;
    context?: string;
}
interface SafeHTMLRenderOptions {
    allowedTags?: string[];
    allowedAttributes?: string[];
}
interface UIFTrustedTypesPolicy {
    createHTML(input: string): unknown;
}
type SafeURLContext = 'link' | 'image' | 'network' | 'navigation';
interface SafeURLPolicy {
    context?: SafeURLContext;
    allowRelative?: boolean;
    allowHash?: boolean;
    sameOrigin?: boolean;
    protocols?: string[];
    requireCapability?: boolean;
}
interface UIFURLCapability {
    origin: string;
    pathPrefix?: string;
    contexts?: readonly SafeURLContext[];
}
interface UIFURLCapabilityPolicy {
    enforce?: boolean;
    capabilities?: readonly UIFURLCapability[];
}
declare function registerComponent(name: string, component: Omit<UIFDomComponent, 'name'>): void;
declare function registerComponent(component: UIFDomComponent): void;
declare function qs<T extends Element = Element>(selector: string, root?: ParentNode): T | null;
declare function qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[];
declare function closest<T extends Element = Element>(el: Element, selector: string): T | null;
declare function safeQuerySelector<T extends Element = Element>(selector: string, root?: ParentNode): T | null;
declare function resolveTarget(sourceEl: HTMLElement, targetExpression?: string): HTMLElement | null;
declare function setText(target: Element | null, value: unknown): void;
declare function appendTextElement<K extends keyof HTMLElementTagNameMap>(parent: Element, tagName: K, text: unknown, className?: string): HTMLElementTagNameMap[K];
declare function configureTrustedTypes(policy: UIFTrustedTypesPolicy | null): void;
declare function getTrustedTypesPolicy(): UIFTrustedTypesPolicy | null;
declare function configureURLCapabilities(policy: UIFURLCapabilityPolicy | null): void;
declare function getURLCapabilityPolicy(): Readonly<Required<UIFURLCapabilityPolicy>>;
declare function isURLCapabilityAllowed(url: URL, context: SafeURLContext): boolean;
declare function isSafeURL(value: string, policy?: SafeURLPolicy): boolean;
declare function sanitizeHTML(html: string, options?: SafeHTMLRenderOptions): DocumentFragment;
declare function setSafeHTML(target: Element | null, html: string, options?: SafeHTMLRenderOptions): void;
declare function setTrustedHTML(target: Element | null, html: string, options?: TrustedHTMLRenderOptions): void;
declare function swapTrustedHTML(targetEl: HTMLElement, html: string, mode?: HTMLSwapMode): HTMLElement;
declare function mount(root?: Root): void;
declare function unmount(root?: Root): void;
declare function autoInit(root?: Root): void;
declare function observe(root?: HTMLElement): MutationObserver;
declare function isInitialized(el: HTMLElement): boolean;

export { type HTMLSwapMode, type SafeHTMLRenderOptions, type SafeURLContext, type SafeURLPolicy, type TrustedHTMLRenderOptions, type UIFDomComponent, type UIFTrustedTypesPolicy, type UIFURLCapability, type UIFURLCapabilityPolicy, appendTextElement, autoInit, closest, configureTrustedTypes, configureURLCapabilities, getTrustedTypesPolicy, getURLCapabilityPolicy, isInitialized, isSafeURL, isURLCapabilityAllowed, mount, observe, qs, qsa, registerComponent, resolveTarget, safeQuerySelector, sanitizeHTML, setSafeHTML, setText, setTrustedHTML, swapTrustedHTML, unmount };
