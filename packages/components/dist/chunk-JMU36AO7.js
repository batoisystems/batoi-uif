import {
  eventElement
} from "./chunk-D73MWFXY.js";

// src/controls/carousel.ts
import { emit } from "@batoi/uif-core/runtime";
function initCarousel(el) {
  const slides = Array.from(el.querySelectorAll('[data-uif-role="slide"]'));
  const indicators = Array.from(el.querySelectorAll("[data-uif-slide-to]"));
  const live = el.querySelector('[data-uif-role="status"]');
  const requestedItems = Number.parseInt(el.dataset.uifItemsPerSlide || "1", 10);
  const requestedStep = Number.parseInt(el.dataset.uifStep || "1", 10);
  const itemsPerSlide = Math.max(
    1,
    Math.min(slides.length || 1, Number.isFinite(requestedItems) ? requestedItems : 1)
  );
  const step = Math.max(1, Number.isFinite(requestedStep) ? requestedStep : 1);
  const requestedInterval = Number(el.dataset.uifInterval || 5e3);
  const interval = Number.isFinite(requestedInterval) ? Math.max(1e3, Math.min(6e4, requestedInterval)) : 5e3;
  const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let paused = el.dataset.uifAutoplay !== "true" || motion?.matches === true;
  let hovered = false;
  let focused = false;
  let timer;
  const toggle = el.querySelector('[data-uif-action="toggle-autoplay"]');
  const updateTimer = () => {
    if (timer !== void 0) clearInterval(timer);
    timer = void 0;
    if (toggle) {
      toggle.textContent = paused ? "Play slides" : "Pause slides";
      toggle.setAttribute("aria-pressed", String(!paused));
    }
    if (live) live.setAttribute("aria-live", paused || focused ? "polite" : "off");
    if (!paused && !hovered && !focused && !document.hidden && itemsPerSlide < slides.length) {
      timer = setInterval(() => next(), interval);
    }
  };
  el.style.setProperty("--uif-carousel-items", String(itemsPerSlide));
  let index = Math.max(
    0,
    slides.findIndex((slide) => slide.dataset.uifState === "active")
  );
  if (index < 0) index = 0;
  const sync = () => {
    slides.forEach((slide, i) => {
      const offset = (i - index + slides.length) % slides.length;
      const active = offset < itemsPerSlide;
      slide.dataset.uifState = active ? "active" : "inactive";
      slide.toggleAttribute("hidden", !active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.style.order = String(offset);
    });
    indicators.forEach((indicator, i) => {
      const active = i === index;
      indicator.dataset.uifState = active ? "active" : "inactive";
      indicator.setAttribute("aria-current", active ? "true" : "false");
    });
    if (live) {
      live.textContent = itemsPerSlide === 1 ? `Slide ${index + 1} of ${slides.length}` : `Items ${Array.from({ length: itemsPerSlide }, (_, offset) => (index + offset) % slides.length + 1).join(", ")} of ${slides.length}`;
    }
    emit("uif:carousel-change", { index, slide: slides[index], el }, el);
  };
  const goTo = (nextIndex) => {
    if (!slides.length) return;
    if (!Number.isFinite(nextIndex)) return;
    index = (Math.trunc(nextIndex) % slides.length + slides.length) % slides.length;
    sync();
  };
  const next = () => goTo(index + step);
  const previous = () => goTo(index - step);
  const onClick = (event) => {
    const target = eventElement(event)?.closest(
      "[data-uif-action], [data-uif-slide-to]"
    );
    if (!target || !el.contains(target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (target.dataset.uifAction === "next") next();
    if (target.dataset.uifAction === "previous") previous();
    if (target.dataset.uifAction === "toggle-autoplay") {
      paused = !paused;
      updateTimer();
    }
    if (target.dataset.uifSlideTo) goTo(Number(target.dataset.uifSlideTo));
  };
  const onKey = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }
  };
  el.setAttribute("role", el.getAttribute("role") || "region");
  el.setAttribute("aria-roledescription", "carousel");
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", onKey);
  const onEnter = () => {
    hovered = true;
    updateTimer();
  };
  const onLeave = () => {
    hovered = false;
    updateTimer();
  };
  const onFocus = () => {
    focused = true;
    updateTimer();
  };
  const onBlur = (event) => {
    if (event.relatedTarget instanceof Node && el.contains(event.relatedTarget)) return;
    focused = false;
    updateTimer();
  };
  const onMotion = () => {
    if (motion?.matches) paused = true;
    updateTimer();
  };
  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);
  el.addEventListener("focusin", onFocus);
  el.addEventListener("focusout", onBlur);
  document.addEventListener("visibilitychange", updateTimer);
  motion?.addEventListener?.("change", onMotion);
  sync();
  updateTimer();
  return {
    destroy: () => {
      if (timer !== void 0) clearInterval(timer);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
      document.removeEventListener("visibilitychange", updateTimer);
      motion?.removeEventListener?.("change", onMotion);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
    },
    next,
    previous,
    goTo
  };
}

export {
  initCarousel
};
