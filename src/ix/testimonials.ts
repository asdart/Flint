/*
 * Local preview of ix-testimonials and ix-testimonial-hover. Position/scale use the exact sampled
 * Framer duration-spring (1.4s, bounce .22); Webflow uses a CustomEase path traced from it.
 * Hovering the row freezes every running animation, as the IX3 pause does (decision H-12).
 */

type Cleanup = () => void;

const COUNT = 7;
const CENTER_SLOT = 3;
const CARD_HALF = 198;
const SLOT_X = [-1038.24, -697.44, -356.64, 0, 356.64, 697.44, 1038.24];
const STEP_MS = 5_000;
const MOVE_MS = 1_400;
const OPACITY_MS = 500;
const MORPH_MS = 450;
const HOVER_MS = 450;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const SPRING_FREQUENCY = 6.527519325867;
const SPRING_DAMPING_RATIO = 0.78;
const SPRING_DURATION = 1.4;
const SPRING_SAMPLES = 100;

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function slotFor(index: number, offset: number) {
  return modulo(index - offset, COUNT);
}

function springProgress(progress: number) {
  if (progress === 1) return 1;
  const angular = SPRING_FREQUENCY * Math.sqrt(1 - SPRING_DAMPING_RATIO ** 2);
  const coefficient = (SPRING_DAMPING_RATIO * SPRING_FREQUENCY) / angular;
  const time = SPRING_DURATION * progress;
  return (
    1 -
    Math.exp(-SPRING_DAMPING_RATIO * SPRING_FREQUENCY * time) *
      (coefficient * Math.sin(angular * time) + Math.cos(angular * time))
  );
}

function transformFor(slot: number, progress = 1, fromSlot = slot) {
  const spring = springProgress(progress);
  const fromX = SLOT_X[fromSlot] - CARD_HALF;
  const toX = SLOT_X[slot] - CARD_HALF;
  const fromScale = fromSlot === CENTER_SLOT ? 0.88 : 0.8;
  const toScale = slot === CENTER_SLOT ? 0.88 : 0.8;
  const x = fromX + (toX - fromX) * spring;
  const scale = fromScale + (toScale - fromScale) * spring;
  return `translateX(${x}px) scale(${scale})`;
}

function springFrames(fromSlot: number, toSlot: number): Keyframe[] {
  return Array.from({ length: SPRING_SAMPLES + 1 }, (_, index) => {
    const offset = index / SPRING_SAMPLES;
    return { offset, transform: transformFor(toSlot, offset, fromSlot) };
  });
}

function animateTo(
  element: HTMLElement,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
  animations: Set<Animation>,
) {
  const animation = element.animate(keyframes, options);
  animations.add(animation);
  animation.onfinish = () => {
    animations.delete(animation);
    animation.commitStyles();
    animation.cancel();
  };
  return animation;
}

function setupCardHover(card: HTMLElement, reduceMotion: boolean): Cleanup {
  const quote = card.querySelector<HTMLElement>(".fk-testimonial-card-quote");
  const scrim = card.querySelector<HTMLElement>(".fk-testimonial-card-scrim");
  const animations = new Set<Animation>();

  const setOpen = (open: boolean) => {
    const duration = reduceMotion ? 0 : HOVER_MS;
    if (quote) {
      const height = getComputedStyle(quote).height;
      quote.getAnimations().forEach((animation) => animation.cancel());
      quote.classList.toggle("is-open", open);
      animateTo(quote, [{ height }, { height: open ? "160px" : "104px" }], {
        duration,
        easing: EASE_OUT,
        fill: "forwards",
      }, animations);
    }
    if (scrim) {
      const opacity = getComputedStyle(scrim).opacity;
      scrim.getAnimations().forEach((animation) => animation.cancel());
      animateTo(scrim, [{ opacity }, { opacity: open ? "0.9" : "0.6" }], {
        duration,
        easing: EASE_OUT,
        fill: "forwards",
      }, animations);
    }
  };

  const onEnter = () => setOpen(true);
  const onLeave = () => setOpen(false);
  card.addEventListener("pointerenter", onEnter);
  card.addEventListener("pointerleave", onLeave);

  return () => {
    card.removeEventListener("pointerenter", onEnter);
    card.removeEventListener("pointerleave", onLeave);
    animations.forEach((animation) => animation.cancel());
    quote?.classList.remove("is-open");
    if (quote) quote.style.height = "";
    if (scrim) scrim.style.opacity = "";
  };
}

function setupTestimonials(root: HTMLElement): Cleanup {
  const row = root.querySelector<HTMLElement>(".fk-testimonials-row");
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-tm-slide]"));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot^="tm-"]'));
  const bars = dots.map((dot) => dot.querySelector<HTMLElement>("[data-dot-bar]"));
  const fills = dots.map((dot) => dot.querySelector<HTMLElement>("[data-dot-fill]"));
  if (!row || slides.length !== COUNT || dots.length !== COUNT) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new Set<Animation>();
  const hoverCleanups = slides.map((slide) => {
    const card = slide.querySelector<HTMLElement>(".fk-testimonial-card");
    return card ? setupCardHover(card, reduceMotion) : () => {};
  });
  let offset = 0;
  let activeIndex = CENTER_SLOT;
  let fillAnimation: Animation | null = null;
  let stopped = false;

  const setSlideFrame = (index: number, slot: number) => {
    const slide = slides[index];
    slide.style.transform = transformFor(slot);
    slide.style.opacity = slot === CENTER_SLOT ? "1" : "0.6";
    slide.style.zIndex = slot === CENTER_SLOT ? "1" : "0";
    slide.classList.toggle("is-center", slot === CENTER_SLOT);
  };

  const setDotFrame = (index: number, active: boolean) => {
    const bar = bars[index];
    const fill = fills[index];
    if (bar) {
      bar.classList.toggle("is-active", active);
      bar.style.width = active ? "57px" : "7px";
    }
    if (fill) fill.style.width = "0%";
  };

  const morphDots = (nextIndex: number) => {
    bars.forEach((bar, index) => {
      if (!bar) return;
      const from = getComputedStyle(bar).width;
      const active = index === nextIndex;
      bar.classList.toggle("is-active", active);
      animateTo(bar, [{ width: from }, { width: active ? "57px" : "7px" }], {
        duration: reduceMotion ? 0 : MORPH_MS,
        easing: EASE_OUT,
        fill: "forwards",
      }, animations);
      if (!active && fills[index]) fills[index]!.style.width = "0%";
    });
    activeIndex = nextIndex;
  };

  const startClock = () => {
    fillAnimation?.cancel();
    const fill = fills[activeIndex];
    if (!fill || reduceMotion || stopped) return;
    fill.style.width = "0%";
    fillAnimation = fill.animate([{ width: "0%" }, { width: "100%" }], {
      duration: STEP_MS,
      easing: "linear",
      fill: "forwards",
    });
    animations.add(fillAnimation);
    fillAnimation.onfinish = () => {
      if (!fillAnimation || stopped) return;
      animations.delete(fillAnimation);
      fillAnimation.cancel();
      fillAnimation = null;
      moveTo(offset + 1);
    };
  };

  const moveTo = (nextOffset: number) => {
    const previousOffset = offset;
    offset = nextOffset;
    slides.forEach((slide, index) => {
      const fromSlot = slotFor(index, previousOffset);
      const toSlot = slotFor(index, offset);
      const wrap = Math.abs(toSlot - fromSlot) > COUNT / 2;
      slide.style.zIndex = toSlot === CENTER_SLOT ? "1" : "0";
      slide.classList.toggle("is-center", toSlot === CENTER_SLOT);
      slide.getAnimations().forEach((animation) => animation.cancel());
      if (reduceMotion || wrap) {
        setSlideFrame(index, toSlot);
        return;
      }
      animateTo(slide, springFrames(fromSlot, toSlot), {
        duration: MOVE_MS,
        easing: "linear",
        fill: "forwards",
      }, animations);
      animateTo(
        slide,
        [
          { opacity: fromSlot === CENTER_SLOT ? 1 : 0.6 },
          { opacity: toSlot === CENTER_SLOT ? 1 : 0.6 },
        ],
        { duration: OPACITY_MS, easing: EASE_OUT, fill: "forwards" },
        animations,
      );
    });
    morphDots(modulo(CENTER_SLOT + offset, COUNT));
    startClock();
  };

  slides.forEach((_, index) => setSlideFrame(index, slotFor(index, offset)));
  dots.forEach((_, index) => setDotFrame(index, index === CENTER_SLOT));
  startClock();

  const onEnter = () => animations.forEach((animation) => animation.pause());
  const onLeave = () => animations.forEach((animation) => animation.play());
  row.addEventListener("pointerenter", onEnter);
  row.addEventListener("pointerleave", onLeave);

  const dotCleanups = dots.map((dot, index) => {
    const onClick = () => {
      const forward = modulo(index - CENTER_SLOT - offset, COUNT);
      const shortest = forward > COUNT / 2 ? forward - COUNT : forward;
      moveTo(offset + shortest);
    };
    dot.addEventListener("click", onClick);
    return () => dot.removeEventListener("click", onClick);
  });

  return () => {
    stopped = true;
    row.removeEventListener("pointerenter", onEnter);
    row.removeEventListener("pointerleave", onLeave);
    dotCleanups.forEach((cleanup) => cleanup());
    hoverCleanups.forEach((cleanup) => cleanup());
    animations.forEach((animation) => animation.cancel());
    slides.forEach((slide) => {
      slide.style.transform = "";
      slide.style.opacity = "";
      slide.style.zIndex = "";
    });
    bars.forEach((bar) => {
      if (bar) bar.style.width = "";
    });
    fills.forEach((fill) => {
      if (fill) fill.style.width = "";
    });
  };
}

export function testimonials(): Cleanup {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="testimonials"]'));
  const cleanups = roots.map(setupTestimonials);
  return () => cleanups.forEach((cleanup) => cleanup());
}
