/*
 * Local preview of ix-testimonials and ix-testimonial-hover. Position/scale use the exact sampled
 * Framer duration-spring (1.4s, bounce .22); Webflow uses a CustomEase path traced from it.
 * Hovering the track freezes every running animation, as the IX3 pause does (decision H-12).
 *
 * The slides sit in normal flow inside one flex track: a step slides the track by one card pitch
 * and swaps which slide is the current one (scale 0.8 ↔ 0.88, with the side margin that keeps the
 * 24px gap). The track holds three copies of the 7 testimonials. Before a move, the current index
 * is shifted by whole copies into a safe range, which is invisible because the copies are
 * identical, so the loop never runs out of cards and never jumps in view.
 * Only the current card reacts to hover.
 */

type Cleanup = () => void;

const COUNT = 7;
const RING = COUNT * 3;
const START_CURRENT = COUNT + 3;
/** Current-index range in which every slot from -2 to 8 has a card (slots are relative to it). */
const SAFE_MIN = 5;
const SAFE_MAX = 15;
const CARD_WIDTH = 396;
const PITCH = 340.8;
const CENTER_HALF = 174.24;
const SIDE_SCALE = 0.8;
const CENTER_SCALE = 0.88;
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

/** Shifts the current index by whole copies so it and its target both stay in the safe range. */
function safeCurrent(current: number, delta: number) {
  const base = modulo(current, COUNT);
  for (let candidate = base; candidate < RING; candidate += COUNT) {
    const target = candidate + delta;
    if (candidate >= SAFE_MIN && candidate <= SAFE_MAX && target >= SAFE_MIN && target <= SAFE_MAX) {
      return candidate;
    }
  }
  return current;
}

/** Track offset (px from the row centre) that puts the slide at `current` under the centre. */
function trackX(current: number) {
  return -(current * PITCH + CENTER_HALF);
}

/** Margin on each side of a slide that cancels the space its scale takes away. */
function marginFor(scale: number) {
  return (CARD_WIDTH * scale - CARD_WIDTH) / 2;
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

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * springProgress(progress);
}

function trackFrames(fromCurrent: number, toCurrent: number): Keyframe[] {
  return Array.from({ length: SPRING_SAMPLES + 1 }, (_, index) => {
    const offset = index / SPRING_SAMPLES;
    return { offset, transform: `translateX(${mix(trackX(fromCurrent), trackX(toCurrent), offset)}px)` };
  });
}

function slideFrames(fromScale: number, toScale: number): Keyframe[] {
  return Array.from({ length: SPRING_SAMPLES + 1 }, (_, index) => {
    const offset = index / SPRING_SAMPLES;
    const scale = mix(fromScale, toScale, offset);
    return {
      offset,
      transform: `scale(${scale})`,
      marginLeft: `${marginFor(scale)}px`,
      marginRight: `${marginFor(scale)}px`,
    };
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

type CardHover = { close: () => void; cleanup: Cleanup };

/** Hover opens the card only while `isCurrent()` is true; leaving always closes it. */
function setupCardHover(card: HTMLElement, isCurrent: () => boolean): CardHover {
  const quote = card.querySelector<HTMLElement>(".fk-testimonial-card-quote");
  const scrim = card.querySelector<HTMLElement>(".fk-testimonial-card-scrim");
  const animations = new Set<Animation>();

  const setOpen = (open: boolean) => {
    const duration = HOVER_MS; // also under reduced motion (D-30)
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

  const onEnter = () => {
    if (isCurrent()) setOpen(true);
  };
  const onLeave = () => setOpen(false);
  card.addEventListener("pointerenter", onEnter);
  card.addEventListener("pointerleave", onLeave);

  return {
    close: () => {
      if (quote?.classList.contains("is-open")) setOpen(false);
    },
    cleanup: () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      animations.forEach((animation) => animation.cancel());
      quote?.classList.remove("is-open");
      if (quote) quote.style.height = "";
      if (scrim) scrim.style.opacity = "";
    },
  };
}

function setupTestimonials(root: HTMLElement): Cleanup {
  const track = root.querySelector<HTMLElement>(".fk-testimonials-track");
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-tm-slide]"));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot^="tm-"]'));
  const bars = dots.map((dot) => dot.querySelector<HTMLElement>("[data-dot-bar]"));
  const fills = dots.map((dot) => dot.querySelector<HTMLElement>("[data-dot-fill]"));
  if (!track || slides.length !== RING || dots.length !== COUNT) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new Set<Animation>();
  let current = START_CURRENT;
  let activeIndex = modulo(current, COUNT);
  let fillAnimation: Animation | null = null;
  let stopped = false;

  const hovers = slides.map((slide, index) => {
    const card = slide.querySelector<HTMLElement>(".fk-testimonial-card");
    return card
      ? setupCardHover(card, () => index === current)
      : { close: () => {}, cleanup: () => {} };
  });

  const setSlideFrame = (index: number, isCurrent: boolean) => {
    const slide = slides[index];
    const scale = isCurrent ? CENTER_SCALE : SIDE_SCALE;
    slide.style.transform = `scale(${scale})`;
    slide.style.marginLeft = `${marginFor(scale)}px`;
    slide.style.marginRight = `${marginFor(scale)}px`;
    slide.style.opacity = isCurrent ? "1" : "0.6";
    slide.classList.toggle("is-center", isCurrent);
  };

  /** Places the whole ring for `next` being current, with no animation. */
  const setFrame = (next: number) => {
    current = next;
    track.style.transform = `translateX(${trackX(next)}px)`;
    slides.forEach((_, index) => setSlideFrame(index, index === next));
  };

  const setDotFrame = (index: number, active: boolean) => {
    const bar = bars[index];
    const fill = fills[index];
    if (bar) {
      bar.classList.toggle("is-active", active);
      bar.style.width = active ? "52px" : "12px";
    }
    if (fill) fill.style.width = "0%";
  };

  const morphDots = (nextIndex: number) => {
    bars.forEach((bar, index) => {
      if (!bar) return;
      const from = getComputedStyle(bar).width;
      const active = index === nextIndex;
      bar.classList.toggle("is-active", active);
      animateTo(bar, [{ width: from }, { width: active ? "52px" : "12px" }], {
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
      moveBy(1);
    };
  };

  /** Moves the current card `delta` places along the track. */
  const moveBy = (delta: number) => {
    if (delta === 0) return;
    [track, ...slides].forEach((element) => element.getAnimations().forEach((a) => a.cancel()));
    hovers[current].close();
    // Shift by whole copies first: same picture, but the target stays inside the ring.
    setFrame(safeCurrent(current, delta));
    const previous = current;
    const next = current + delta;

    current = next;
    slides[previous].classList.remove("is-center");
    slides[next].classList.add("is-center");
    if (reduceMotion) {
      setFrame(next);
    } else {
      animateTo(track, trackFrames(previous, next), {
        duration: MOVE_MS,
        easing: "linear",
        fill: "forwards",
      }, animations);
      animateTo(slides[previous], slideFrames(CENTER_SCALE, SIDE_SCALE), {
        duration: MOVE_MS,
        easing: "linear",
        fill: "forwards",
      }, animations);
      animateTo(slides[next], slideFrames(SIDE_SCALE, CENTER_SCALE), {
        duration: MOVE_MS,
        easing: "linear",
        fill: "forwards",
      }, animations);
      animateTo(slides[previous], [{ opacity: 1 }, { opacity: 0.6 }], {
        duration: OPACITY_MS,
        easing: EASE_OUT,
        fill: "forwards",
      }, animations);
      animateTo(slides[next], [{ opacity: 0.6 }, { opacity: 1 }], {
        duration: OPACITY_MS,
        easing: EASE_OUT,
        fill: "forwards",
      }, animations);
    }
    morphDots(modulo(next, COUNT));
    startClock();
  };

  setFrame(current);
  dots.forEach((_, index) => setDotFrame(index, index === activeIndex));
  startClock();

  const onEnter = () => animations.forEach((animation) => animation.pause());
  const onLeave = () => animations.forEach((animation) => animation.play());
  track.addEventListener("pointerenter", onEnter);
  track.addEventListener("pointerleave", onLeave);

  const dotCleanups = dots.map((dot, index) => {
    const onClick = () => {
      const forward = modulo(index - activeIndex, COUNT);
      moveBy(forward > COUNT / 2 ? forward - COUNT : forward);
    };
    dot.addEventListener("click", onClick);
    return () => dot.removeEventListener("click", onClick);
  });

  return () => {
    stopped = true;
    track.removeEventListener("pointerenter", onEnter);
    track.removeEventListener("pointerleave", onLeave);
    dotCleanups.forEach((cleanup) => cleanup());
    hovers.forEach((hover) => hover.cleanup());
    animations.forEach((animation) => animation.cancel());
    track.style.transform = "";
    slides.forEach((slide, index) => {
      slide.style.transform = "";
      slide.style.marginLeft = "";
      slide.style.marginRight = "";
      slide.style.opacity = "";
      slide.classList.toggle("is-center", index === START_CURRENT);
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
