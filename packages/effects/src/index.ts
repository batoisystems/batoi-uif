export interface EffectOptions {
  className?: string;
  duration?: number;
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
