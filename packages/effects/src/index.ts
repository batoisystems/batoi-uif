import { getCompatibilityMode } from '@batoi/uif-core/compatibility';
import { parseUIFJSON } from '@batoi/uif-core/contracts';

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

interface EffectOperation {
  signal: AbortSignal;
  finish(): void;
}
const visibility = new WeakMap<HTMLElement, AbortController>();
const activeAnimations = new WeakMap<HTMLElement, AbortController>();

function beginEffect(el: HTMLElement, operations: WeakMap<HTMLElement, AbortController>, cleanup = () => {}): EffectOperation {
  operations.get(el)?.abort();
  const controller = new AbortController();
  operations.set(el, controller);
  controller.signal.addEventListener('abort', cleanup, { once: true });
  return {
    signal: controller.signal,
    finish() {
      controller.signal.removeEventListener('abort', cleanup);
      if (!controller.signal.aborted) cleanup();
      if (operations.get(el) === controller) operations.delete(el);
    },
  };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Cancellation settles the promise and releases the scheduled callback immediately. */
function waitForEffect(signal: AbortSignal, duration?: number): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const frame = duration === undefined;
    const finish = () => {
      signal.removeEventListener('abort', abort);
      resolve(!signal.aborted);
    };
    const handle = frame ? requestAnimationFrame(finish) : window.setTimeout(finish, duration);
    const abort = () => {
      if (frame) cancelAnimationFrame(handle);
      else window.clearTimeout(handle);
      finish();
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}

async function transitionWithin(el: HTMLElement, className: string, options: EffectOptions, signal: AbortSignal): Promise<void> {
  if (prefersReducedMotion()) {
    if (!signal.aborted) el.classList.add(className);
    return;
  }
  if (!await waitForEffect(signal)) return;
  if (options.delay && !await waitForEffect(signal, options.delay)) return;
  if (signal.aborted) return;
  el.classList.add(className);
  await waitForEffect(signal, options.duration ?? 180);
}

export async function transition(el: HTMLElement, className: string, options: EffectOptions = {}): Promise<void> {
  const operation = beginEffect(el, visibility);
  try { await transitionWithin(el, className, options, operation.signal); }
  finally { operation.finish(); }
}

export async function show(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  const operation = beginEffect(el, visibility);
  el.hidden = false;
  el.dataset.uifState = 'open';
  try { await transitionWithin(el, options.className ?? 'uif-is-visible', options, operation.signal); }
  finally { operation.finish(); }
}

export async function hide(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  const operation = beginEffect(el, visibility);
  el.dataset.uifState = 'closed';
  el.classList.remove(options.className ?? 'uif-is-visible');
  try {
    if (!prefersReducedMotion()) await waitForEffect(operation.signal, options.duration ?? 180);
    if (!operation.signal.aborted) el.hidden = true;
  } finally { operation.finish(); }
}

export async function toggle(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  if (el.hidden || el.dataset.uifState === 'closed') await show(el, options);
  else await hide(el, options);
}

export async function expand(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  const operation = beginEffect(el, visibility, () => { el.style.height = ''; });
  el.style.height = '0px';
  el.hidden = false;
  el.dataset.uifState = 'open';
  try {
    if (!await waitForEffect(operation.signal)) return;
    el.style.height = `${el.scrollHeight}px`;
    await transitionWithin(el, options.className ?? 'uif-is-expanded', options, operation.signal);
  } finally { operation.finish(); }
}

export async function collapse(el: HTMLElement, options: EffectOptions = {}): Promise<void> {
  const operation = beginEffect(el, visibility, () => { el.style.height = ''; });
  el.style.height = `${el.scrollHeight}px`;
  el.dataset.uifState = 'closed';
  el.classList.remove(options.className ?? 'uif-is-expanded');
  try {
    if (!prefersReducedMotion() && !await waitForEffect(operation.signal)) return;
    el.style.height = '0px';
    if (!prefersReducedMotion()) await waitForEffect(operation.signal, options.duration ?? 180);
    if (!operation.signal.aborted) el.hidden = true;
  } finally { operation.finish(); }
}

export async function animate(el: HTMLElement, animation: string, options: EffectOptions = {}): Promise<void> {
  const className = options.className ?? `uif-animate-${animation}`;
  const operation = beginEffect(el, activeAnimations, () => {
    el.classList.remove('uif-is-animating', className);
    clearAnimationStyles(el);
  });
  try {
    if (prefersReducedMotion()) {
      el.dataset.uifAnimation = animation;
      return;
    }
    if (!await waitForEffect(operation.signal)) return;
    if (options.delay && !await waitForEffect(operation.signal, options.delay)) return;
    if (operation.signal.aborted) return;
    const preset = animationPresets.find((item) => item.name === animation);
    const duration = options.duration ?? preset?.duration ?? 220;
    el.style.animationDuration = `${duration}ms`;
    if (options.easing) el.style.animationTimingFunction = options.easing;
    if (options.repeat) el.style.animationIterationCount = String(options.repeat);
    if (options.direction) el.style.animationDirection = options.direction;
    if (options.fill) el.style.animationFillMode = options.fill;
    el.classList.add('uif-is-animating', className);
    await waitForEffect(operation.signal, duration * (options.repeat ?? 1));
  } finally { operation.finish(); }
}

function clearAnimationStyles(el: HTMLElement): void {
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
  visibility.get(el)?.abort();
  visibility.delete(el);
  activeAnimations.get(el)?.abort();
  activeAnimations.delete(el);
  el.classList.remove('uif-is-animating');
  [...el.classList].filter((name) => name.startsWith('uif-animate-')).forEach((name) => el.classList.remove(name));
  clearAnimationStyles(el);
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

export interface TypedTextOptions {
  strings?: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
  startDelay?: number;
  loop?: boolean;
}

export interface TypedTextController {
  refresh(): void;
  destroy(): void;
}

const typedTextControllers = new WeakMap<HTMLElement, TypedTextController>();

function typedTextStrings(el: HTMLElement, options: TypedTextOptions): string[] {
  if (options.strings?.length) return options.strings.map(String).filter(Boolean);
  const raw = el.dataset.uifStrings;
  if (raw) {
    const result = parseUIFJSON<unknown[]>(raw, { shape: 'array', limits: { maxItems: 100, maxCharacters: 10_000, maxBytes: 20_000, maxDepth: 2, maxKeys: 100 } });
    if (result.valid && result.value) return result.value.map(String).filter(Boolean);
    if (getCompatibilityMode() !== 'v3') return raw.split('|').map((value) => value.trim()).filter(Boolean);
  }
  return el.textContent ? [el.textContent] : [];
}

function nonNegative(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value !== undefined ? Math.max(0, value) : fallback;
}

export function initTypedText(el: HTMLElement, options: TypedTextOptions = {}): TypedTextController {
  const existing = typedTextControllers.get(el);
  if (existing) return existing;

  const strings = typedTextStrings(el, options);
  const typeSpeed = nonNegative(options.typeSpeed ?? Number(el.dataset.uifTypeSpeed), 55);
  const deleteSpeed = nonNegative(options.deleteSpeed ?? Number(el.dataset.uifDeleteSpeed), 30);
  const pause = nonNegative(options.pause ?? Number(el.dataset.uifPause), 1200);
  const startDelay = nonNegative(options.startDelay ?? Number(el.dataset.uifStartDelay), 0);
  const loop = options.loop ?? el.dataset.uifLoop !== 'false';
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  let timer: number | undefined;
  let destroyed = false;

  el.classList.add('uif-typed-text');
  el.setAttribute('aria-live', 'off');

  const schedule = (callback: () => void, delay: number) => {
    timer = window.setTimeout(callback, delay);
  };

  const render = () => {
    if (destroyed || !strings.length) return;
    const phrase = strings[phraseIndex] ?? '';
    el.textContent = phrase.slice(0, characterIndex);

    if (!deleting && characterIndex < phrase.length) {
      characterIndex += 1;
      schedule(render, typeSpeed);
      return;
    }

    if (!deleting) {
      el.setAttribute('aria-label', phrase);
      const isLastPhrase = phraseIndex === strings.length - 1;
      if (!loop && isLastPhrase) return;
      deleting = true;
      schedule(render, pause);
      return;
    }

    if (characterIndex > 0) {
      characterIndex -= 1;
      schedule(render, deleteSpeed);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % strings.length;
    schedule(render, typeSpeed);
  };

  const restart = () => {
    if (timer !== undefined) window.clearTimeout(timer);
    destroyed = false;
    phraseIndex = 0;
    characterIndex = 0;
    deleting = false;
    if (!strings.length) return;
    if (prefersReducedMotion()) {
      el.textContent = strings[0] ?? '';
      el.setAttribute('aria-label', strings[0] ?? '');
      return;
    }
    schedule(render, startDelay);
  };

  const controller: TypedTextController = {
    refresh: restart,
    destroy() {
      destroyed = true;
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      el.classList.remove('uif-typed-text');
      el.removeAttribute('aria-live');
      if (typedTextControllers.get(el) === controller) typedTextControllers.delete(el);
    },
  };
  typedTextControllers.set(el, controller);
  restart();
  return controller;
}

export function observeMotion(root: HTMLElement = document.documentElement): void {
  root.dataset.uifMotion = prefersReducedMotion() ? 'reduce' : 'safe';
}
