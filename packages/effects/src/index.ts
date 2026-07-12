export interface EffectOptions {
  className?: string;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  fill?: FillMode;
  once?: boolean;
}

export interface AnimationStep {
  el: HTMLElement;
  animation: string;
  options?: EffectOptions;
}

export interface AnimationPreset {
  name: string;
  category: 'entrance' | 'exit' | 'attention' | 'loading' | 'layout';
  duration: number;
  repeat?: boolean;
  description: string;
}

export const animationPresets: AnimationPreset[] = [
  { name: 'fade-in', category: 'entrance', duration: 180, description: 'Fade content into view.' },
  { name: 'fade-out', category: 'exit', duration: 180, description: 'Fade content out of view.' },
  { name: 'slide-up', category: 'entrance', duration: 220, description: 'Slide upward into place.' },
  { name: 'slide-down', category: 'entrance', duration: 220, description: 'Slide downward into place.' },
  { name: 'slide-left', category: 'entrance', duration: 220, description: 'Slide left into place.' },
  { name: 'slide-right', category: 'entrance', duration: 220, description: 'Slide right into place.' },
  { name: 'slide-out-up', category: 'exit', duration: 200, description: 'Slide upward out of view.' },
  { name: 'slide-out-down', category: 'exit', duration: 200, description: 'Slide downward out of view.' },
  { name: 'scale-in', category: 'entrance', duration: 180, description: 'Scale content into view.' },
  { name: 'scale-out', category: 'exit', duration: 180, description: 'Scale content out of view.' },
  { name: 'pop', category: 'attention', duration: 220, description: 'Short emphasized pop.' },
  { name: 'pulse', category: 'attention', duration: 420, repeat: true, description: 'Pulse focus ring for attention.' },
  { name: 'shake', category: 'attention', duration: 260, description: 'Shake to show invalid state.' },
  { name: 'highlight', category: 'attention', duration: 500, description: 'Highlight changed content.' },
  { name: 'flash', category: 'attention', duration: 380, description: 'Flash content briefly.' },
  { name: 'bounce', category: 'attention', duration: 420, description: 'Bounce content into emphasis.' },
  { name: 'wiggle', category: 'attention', duration: 420, description: 'Small rotational attention motion.' },
  { name: 'shimmer', category: 'loading', duration: 1100, repeat: true, description: 'Loading shimmer.' },
  { name: 'spin', category: 'loading', duration: 900, repeat: true, description: 'Spinner rotation.' },
  { name: 'skeleton-pulse', category: 'loading', duration: 1200, repeat: true, description: 'Skeleton loading pulse.' },
  { name: 'crossfade', category: 'layout', duration: 220, description: 'Soft layout/content transition.' },
];

const activeAnimations = new WeakMap<HTMLElement, number>();

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function transition(el: HTMLElement, className: string, options: EffectOptions = {}): Promise<void> {
  if (prefersReducedMotion()) {
    el.classList.add(className);
    return;
  }
  await nextFrame();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  el.classList.add(className);
  await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
}

export async function show(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  el.hidden = false;
  el.dataset.uifState = 'open';
  await transition(el, options.className ?? 'uif-is-visible', options);
}

export async function hide(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  el.dataset.uifState = 'closed';
  el.classList.remove(options.className ?? 'uif-is-visible');
  if (!prefersReducedMotion()) await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 180));
  el.hidden = true;
}

export async function toggle(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  if (el.hidden || el.dataset.uifState === 'closed') await show(el, options);
  else await hide(el, options);
}

export async function expand(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  el.style.height = '0px';
  el.hidden = false;
  await nextFrame();
  el.style.height = `${el.scrollHeight}px`;
  await transition(el, options.className ?? 'uif-is-expanded', options);
  el.style.height = '';
}

export async function collapse(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  el.style.height = `${el.scrollHeight}px`;
  await nextFrame();
  el.style.height = '0px';
  await hide(el, options);
  el.style.height = '';
}

export async function animate(el: HTMLElement, animation: string, options: EffectOptions = {}): Promise<void> {
  const className = options.className ?? `uif-animate-${animation}`;
  el.classList.remove(className, 'uif-is-animating');
  if (prefersReducedMotion()) {
    el.dataset.uifAnimation = animation;
    return;
  }
  await nextFrame();
  if (options.delay) await new Promise((resolve) => window.setTimeout(resolve, options.delay));
  const preset = animationPresets.find((item) => item.name === animation);
  const duration = options.duration ?? preset?.duration ?? 220;
  el.style.animationDuration = `${duration}ms`;
  if (options.easing) el.style.animationTimingFunction = options.easing;
  if (options.repeat) el.style.animationIterationCount = String(options.repeat);
  if (options.direction) el.style.animationDirection = options.direction;
  if (options.fill) el.style.animationFillMode = options.fill;
  el.classList.add('uif-is-animating', className);
  const token = Date.now();
  activeAnimations.set(el, token);
  await new Promise((resolve) => window.setTimeout(resolve, duration * (options.repeat ?? 1)));
  if (activeAnimations.get(el) !== token) return;
  el.classList.remove('uif-is-animating', className);
  el.style.animationDuration = '';
  el.style.animationTimingFunction = '';
  el.style.animationIterationCount = '';
  el.style.animationDirection = '';
  el.style.animationFillMode = '';
}

export async function sequence(steps: AnimationStep[], options: EffectOptions = {}): Promise<void> {
  for (const step of steps) await animate(step.el, step.animation, { ...options, ...step.options });
}

export async function timeline(steps: AnimationStep[], options: EffectOptions = {}): Promise<void> {
  await sequence(steps, options);
}

export async function stagger(elements: Iterable<HTMLElement>, animation: string, options: EffectOptions = {}): Promise<void> {
  const delay = options.delay ?? 60;
  await Promise.all([...elements].map((el, index) => animate(el, animation, { ...options, delay: delay * index })));
}

export async function animateGroup(root: ParentNode, selector: string, animation: string, options: EffectOptions = {}): Promise<void> {
  await stagger(root.querySelectorAll<HTMLElement>(selector), animation, options);
}

export function cancelAnimation(el: HTMLElement): void {
  activeAnimations.delete(el);
  el.classList.remove('uif-is-animating');
  [...el.classList].filter((name) => name.startsWith('uif-animate-')).forEach((name) => el.classList.remove(name));
  el.style.animationDuration = '';
  el.style.animationTimingFunction = '';
  el.style.animationIterationCount = '';
  el.style.animationDirection = '';
  el.style.animationFillMode = '';
}

export interface AnimationController { refresh(): void; destroy(): void; }
const animationControllers = new WeakMap<HTMLElement, AnimationController>();

export function initAnimation(el: HTMLElement): AnimationController {
  const existing = animationControllers.get(el);
  if (existing) return existing;
  const animation = el.dataset.uifAnimation || 'fade-in';
  const duration = Number(el.dataset.uifDuration || '') || undefined;
  const delay = Number(el.dataset.uifDelay || '') || undefined;
  const repeat = Number(el.dataset.uifRepeat || '') || undefined;
  const easing = el.dataset.uifEasing || undefined;
  const once = el.dataset.uifOnce !== 'false';
  const trigger = el.dataset.uifTrigger || 'load';
  let hasRun = false;
  const run = () => {
    if (once && hasRun) return;
    hasRun = true;
    void animate(el, animation, { duration, delay, repeat, easing, once });
  };
  let observer: IntersectionObserver | null = null;
  let eventName: 'mouseenter' | 'focusin' | 'click' | null = null;
  if (trigger === 'load') run();
  if (trigger === 'hover') {
    eventName = 'mouseenter';
    el.addEventListener(eventName, run);
  }
  if (trigger === 'focus') {
    eventName = 'focusin';
    el.addEventListener(eventName, run);
  }
  if (trigger === 'click') {
    eventName = 'click';
    el.addEventListener(eventName, run);
  }
  if (trigger === 'intersect' && 'IntersectionObserver' in window) {
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        intersectionObserver.disconnect();
      }
    });
    observer = intersectionObserver;
    intersectionObserver.observe(el);
  }
  const controller: AnimationController = {
    refresh() {
      hasRun = false;
      run();
    },
    destroy() {
      if (eventName) el.removeEventListener(eventName, run);
      observer?.disconnect();
      cancelAnimation(el);
      if (animationControllers.get(el) === controller) animationControllers.delete(el);
    },
  };
  animationControllers.set(el, controller);
  return controller;
}

export function initAnimationTriggers(root: ParentNode = document): () => void {
  const controllers = [...root.querySelectorAll<HTMLElement>('[data-uif="animate"]')].map(initAnimation);
  return () => controllers.forEach((controller) => controller.destroy());
}

export function observeMotion(root: HTMLElement = document.documentElement): void {
  root.dataset.uifMotion = prefersReducedMotion() ? 'reduce' : 'safe';
}
