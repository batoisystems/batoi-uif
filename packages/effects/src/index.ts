export interface EffectOptions {
  className?: string;
  duration?: number;
  delay?: number;
}

export interface AnimationStep {
  el: HTMLElement;
  animation: string;
  options?: EffectOptions;
}

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
  el.classList.add('uif-is-animating', className);
  await new Promise((resolve) => window.setTimeout(resolve, options.duration ?? 220));
  el.classList.remove('uif-is-animating', className);
}

export async function sequence(steps: AnimationStep[], options: EffectOptions = {}): Promise<void> {
  for (const step of steps) await animate(step.el, step.animation, { ...options, ...step.options });
}

export async function stagger(elements: Iterable<HTMLElement>, animation: string, options: EffectOptions = {}): Promise<void> {
  const delay = options.delay ?? 60;
  await Promise.all([...elements].map((el, index) => animate(el, animation, { ...options, delay: delay * index })));
}

export function initAnimation(el: HTMLElement): void {
  const animation = el.dataset.uifAnimation || 'fade-in';
  const duration = Number(el.dataset.uifDuration || '') || undefined;
  const delay = Number(el.dataset.uifDelay || '') || undefined;
  const trigger = el.dataset.uifTrigger || 'load';
  const run = () => void animate(el, animation, { duration, delay });
  if (trigger === 'load') run();
  if (trigger === 'hover') {
    el.addEventListener('mouseenter', run);
    return;
  }
  if (trigger === 'focus') {
    el.addEventListener('focusin', run);
    return;
  }
  if (trigger === 'click') {
    el.addEventListener('click', run);
    return;
  }
  if (trigger === 'intersect' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        observer.disconnect();
      }
    });
    observer.observe(el);
  }
}

export function initAnimationTriggers(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-uif="animate"]').forEach(initAnimation);
}

export function observeMotion(root: HTMLElement = document.documentElement): void {
  root.dataset.uifMotion = prefersReducedMotion() ? 'reduce' : 'safe';
}
