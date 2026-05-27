interface EffectOptions {
    className?: string;
    duration?: number;
    delay?: number;
    easing?: string;
    repeat?: number;
    direction?: 'normal' | 'reverse' | 'alternate';
    fill?: FillMode;
    once?: boolean;
}
interface AnimationStep {
    el: HTMLElement;
    animation: string;
    options?: EffectOptions;
}
interface AnimationPreset {
    name: string;
    category: 'entrance' | 'exit' | 'attention' | 'loading' | 'layout';
    duration: number;
    repeat?: boolean;
    description: string;
}
declare const animationPresets: AnimationPreset[];
declare function transition(el: HTMLElement, className: string, options?: EffectOptions): Promise<void>;
declare function show(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function hide(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function toggle(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function expand(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function collapse(el: HTMLElement, options?: EffectOptions): Promise<void>;
declare function animate(el: HTMLElement, animation: string, options?: EffectOptions): Promise<void>;
declare function sequence(steps: AnimationStep[], options?: EffectOptions): Promise<void>;
declare function timeline(steps: AnimationStep[], options?: EffectOptions): Promise<void>;
declare function stagger(elements: Iterable<HTMLElement>, animation: string, options?: EffectOptions): Promise<void>;
declare function animateGroup(root: ParentNode, selector: string, animation: string, options?: EffectOptions): Promise<void>;
declare function cancelAnimation(el: HTMLElement): void;
declare function initAnimation(el: HTMLElement): void;
declare function initAnimationTriggers(root?: ParentNode): void;
declare function observeMotion(root?: HTMLElement): void;

export { type AnimationPreset, type AnimationStep, type EffectOptions, animate, animateGroup, animationPresets, cancelAnimation, collapse, expand, hide, initAnimation, initAnimationTriggers, observeMotion, sequence, show, stagger, timeline, toggle, transition };
