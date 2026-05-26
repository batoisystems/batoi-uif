interface EffectOptions {
    className?: string;
    duration?: number;
    delay?: number;
}
interface AnimationStep {
    el: HTMLElement;
    animation: string;
    options?: EffectOptions;
}
declare function transition(el: HTMLElement, className: string, options?: EffectOptions): Promise<void>;
declare function show(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function hide(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function toggle(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function expand(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function collapse(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function animate(el: HTMLElement, animation: string, options?: EffectOptions): Promise<void>;
declare function sequence(steps: AnimationStep[], options?: EffectOptions): Promise<void>;
declare function stagger(elements: Iterable<HTMLElement>, animation: string, options?: EffectOptions): Promise<void>;
declare function initAnimation(el: HTMLElement): void;
declare function initAnimationTriggers(root?: ParentNode): void;
declare function observeMotion(root?: HTMLElement): void;

export { type AnimationStep, type EffectOptions, animate, collapse, expand, hide, initAnimation, initAnimationTriggers, observeMotion, sequence, show, stagger, toggle, transition };
