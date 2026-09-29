/*
 * ix-how-carousel preview. Webflow owns the production timeline; this module mirrors its fixed
 * desktop/tablet and tiny-breakpoint geometry with WAAPI for the local React preview.
 */

type Cleanup = () => void;

type Layout = {
  smallWidth: number;
  smallHeight: number;
  largeWidth: number;
  largeHeight: number;
  gap: number;
  smallScale: number;
  largeScale: number;
};

const DESKTOP: Layout = {
  smallWidth: 360,
  smallHeight: 464,
  largeWidth: 398,
  largeHeight: 512,
  gap: 32,
  // The card fills its slide at desktop, so it is sized by the slide, not scaled.
  smallScale: 1,
  largeScale: 1,
};

// Legacy fit at a 390px phone: the viewport is the section's content box (390 − 2·16), minus 24.
const PHONE_FIT = 334 / 398;
const PHONE: Layout = {
  smallWidth: 360 * PHONE_FIT,
  smallHeight: 464 * PHONE_FIT,
  largeWidth: 398 * PHONE_FIT,
  largeHeight: 512 * PHONE_FIT,
  gap: 32 * (0.6 + 0.4 * PHONE_FIT),
  smallScale: PHONE_FIT,
  largeScale: 334 / 360,
};

const AUTOPLAY_MS = 5_000;
const CARD_MS = 700;
const BAR_MS = 450;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const PHONE_QUERY = "(max-width: 479px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function setupCarousel(viewport: HTMLElement): Cleanup {
  const track = viewport.querySelector<HTMLElement>("[data-how-track]");
  const section = viewport.closest<HTMLElement>(".fk-how");
  if (!track || !section) return () => {};

  const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-how-slide]"));
  const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-how-card]"));
  const dots = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-dot^="how-"]'));
  const bars = Array.from(section.querySelectorAll<HTMLElement>('[data-dot-bar^="how-"]'));
  const fills = Array.from(section.querySelectorAll<HTMLElement>('[data-dot-fill^="how-"]'));
  if (
    slides.length !== 6 ||
    cards.length !== 6 ||
    dots.length !== 6 ||
    bars.length !== 6 ||
    fills.length !== 6
  ) {
    return () => {};
  }

  const phoneMedia = window.matchMedia(PHONE_QUERY);
  const reduced = window.matchMedia(REDUCED_QUERY).matches;
  const transitions = new Set<Animation>();
  let active = 0;
  let clock: Animation | null = null;
  let clockStart = 0;
  let clockDuration = AUTOPLAY_MS;
  let hovered = false;
  let disposed = false;

  const layout = () => (phoneMedia.matches ? PHONE : DESKTOP);
  const paused = () => hovered;

  const pauseOrPlay = () => {
    const method = paused() ? "pause" : "play";
    transitions.forEach((animation) => animation[method]());
    if (clock) clock[method]();
  };

  const currentProgress = () => {
    if (!clock || clockDuration <= 0) return clockStart;
    const elapsed = typeof clock.currentTime === "number" ? clock.currentTime : 0;
    return Math.min(1, clockStart + (1 - clockStart) * (elapsed / clockDuration));
  };

  const remember = (animation: Animation, element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
    transitions.add(animation);
    animation.onfinish = () => {
      Object.assign(element.style, styles);
      transitions.delete(animation);
      animation.cancel();
    };
    if (paused()) animation.pause();
  };

  const applyState = (animate: boolean) => {
    const next = layout();
    const step = next.smallWidth + next.gap;
    const targets = [
      ...slides.map((slide, index) => ({
        element: slide,
        from: {
          width: getComputedStyle(slide).width,
          height: getComputedStyle(slide).height,
        },
        to: {
          width: `${index === active ? next.largeWidth : next.smallWidth}px`,
          height: `${index === active ? next.largeHeight : next.smallHeight}px`,
        },
        duration: CARD_MS,
      })),
      ...cards.map((card, index) => ({
        element: card,
        from: { transform: getComputedStyle(card).transform },
        to: { transform: `scale(${index === active ? next.largeScale : next.smallScale})` },
        duration: CARD_MS,
      })),
      {
        element: track,
        from: { transform: getComputedStyle(track).transform },
        to: { transform: `translateX(${-active * step}px)` },
        duration: CARD_MS,
      },
      ...bars.map((bar, index) => ({
        element: bar,
        from: { width: getComputedStyle(bar).width },
        to: { width: index === active ? "52px" : "12px" },
        duration: BAR_MS,
      })),
    ];

    transitions.forEach((animation) => animation.cancel());
    transitions.clear();

    targets.forEach(({ element, from, to, duration }) => {
      if (!animate) {
        Object.assign(element.style, to);
        return;
      }
      const animation = element.animate([from, to], {
        duration,
        easing: EASE_OUT,
        fill: "forwards",
      });
      remember(animation, element, to);
    });
  };

  const startClock = (from = 0) => {
    clock?.cancel();
    fills.forEach((fill) => {
      fill.style.width = "0%";
    });

    if (reduced) return;

    clockStart = from;
    clockDuration = AUTOPLAY_MS * (1 - from);
    const fill = fills[active];
    clock = fill.animate(
      [{ width: `${from * 100}%` }, { width: "100%" }],
      { duration: clockDuration, easing: "linear", fill: "forwards" },
    );
    clock.onfinish = () => {
      if (disposed) return;
      active = (active + 1) % slides.length;
      applyState(true);
      startClock();
    };
    if (paused()) clock.pause();
  };

  const goTo = (index: number) => {
    active = index;
    applyState(true);
    startClock();
  };

  const onEnter = () => {
    hovered = true;
    pauseOrPlay();
  };

  const onLeave = () => {
    hovered = false;
    pauseOrPlay();
  };

  const dotHandlers = dots.map((dot, index) => {
    const handler = () => {
      if (!reduced) goTo(index);
    };
    dot.addEventListener("click", handler);
    return handler;
  });

  const onBreakpoint = () => {
    const progress = currentProgress();
    applyState(false);
    startClock(progress);
  };

  applyState(false);
  startClock();

  if (!reduced) {
    viewport.addEventListener("pointerenter", onEnter);
    viewport.addEventListener("pointerleave", onLeave);
    phoneMedia.addEventListener("change", onBreakpoint);
  }

  return () => {
    disposed = true;
    viewport.removeEventListener("pointerenter", onEnter);
    viewport.removeEventListener("pointerleave", onLeave);
    phoneMedia.removeEventListener("change", onBreakpoint);
    dots.forEach((dot, index) => dot.removeEventListener("click", dotHandlers[index]));
    clock?.cancel();
    transitions.forEach((animation) => animation.cancel());
    track.style.transform = "";
    slides.forEach((slide) => {
      slide.style.width = "";
      slide.style.height = "";
    });
    cards.forEach((card) => {
      card.style.transform = "";
    });
    bars.forEach((bar) => {
      bar.style.width = "";
    });
    fills.forEach((fill) => {
      fill.style.width = "";
    });
  };
}

export function howCarousel(): Cleanup {
  const viewports = Array.from(
    document.querySelectorAll<HTMLElement>('[data-ix="how-carousel"]'),
  );
  const cleanups = viewports.map(setupCarousel);
  return () => cleanups.forEach((cleanup) => cleanup());
}
