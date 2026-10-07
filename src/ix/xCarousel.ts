/*
 * Exception x-carousel (docs/webflow/interactions.md, roadmap D-37): the one shared carousel script.
 * It is the single source of the shipped code: `node scripts/build-x-carousel.mjs` bundles this file
 * with Motion's `JSAnimation` (the spring / tween engine, 21 KB; the full `animate` is 55 KB, D-54)
 * into one self-contained docs/webflow/custom-code/x-carousel.html, and the local preview runs the
 * same module.
 *
 * It keeps a current index, animates forward and backward with Motion, and takes the geometry from
 * the CSS: a slide is "current" when it carries the current class, so the script toggles that class,
 * reads the computed width, height, side margins, opacity and scale of every slide in both states,
 * and animates between them. Breakpoints, sizes and gaps stay in the classes; only the track's
 * translateX is computed (the current slide's centre goes to the viewport's centre, or its left edge
 * to the viewport's left edge with data-x-align="start").
 *
 * Markup contract (data attributes, all optional unless said):
 *   [data-x-carousel="spring|tween"]  root (required). spring = 1.4s spring, bounce .22 (Testimonials);
 *                                     tween = 0.7s ease-out (How It Works). Default tween
 *     data-x-autoplay="5000"          ms per slide; absent = no autoplay
 *     data-x-current="is-center"      class that marks the current slide (default is-active)
 *     data-x-copies="3"               the set is repeated this many times in the track (a looping
 *                                     row); the middle copy is the real one. Default 1
 *     data-x-align="start"            the current slide's left edge sits at the viewport's left edge
 *                                     (a left-aligned row whose cards run off the right: Facility
 *                                     partners; the viewport clips on the left). Default: centre
 *   [data-x-viewport]                 clipping area that receives swipe and hover pause (default: the track's parent)
 *   [data-x-track]                    required; its children are the slides, its first child's first child may be a card
 *   [data-x-dot]                      one button per slide (per set, with copies); holds a bar > fill
 *   [data-x-prev] / [data-x-next]     arrow buttons
 * A slide's first child may carry the current class too (How It Works cards scale on phone).
 * Testimonial cards (.fk-testimonial-card-quote / -scrim) open on hover while their slide is current.
 */

import { JSAnimation, cubicBezier } from "motion";

type Cleanup = () => void;


type Frame = { width: number; height: number; left: number; right: number; opacity: number; scale: number; card: number };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.42, 0, 0.58, 1] as const;
const SPRING = { type: "spring", duration: 1.4, bounce: 0.22 } as const;
const TWEEN = { duration: 0.7, ease: EASE_OUT } as const;
const OPACITY = { duration: 0.5, ease: EASE_OUT } as const;
const BAR_MS = 0.45;
const OPEN_MS = 0.45; // card hover plays under reduced motion too (D-30)
const SWIPE_START = 6;
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;
const SWIPE_GAIN = 0.55;

const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const px = (value: number) => `${value}px`;
const translateX = (value: number) => `translateX(${value}px)`;

/*
 * `animate` replacement on Motion's JSAnimation: the same engine (spring, cubic-bezier, linear) without
 * the 35 KB of DOM and value plumbing. One tween drives numeric style values of one element from `a` to
 * `b` with progress p (a spring overshoots p past 1, like Motion's own values do). Starting a new tween
 * on a property takes it over from the running one, which stops writing it.
 */
type Prop = [name: string, from: number, to: number, format: (value: number) => string];
type Spec = { type?: "spring"; duration: number; bounce?: number; ease?: readonly [number, number, number, number] | "linear" };
type Tween = { stop: () => void; pause: () => void; play: () => void; cancel: () => void; then: (done: () => void) => void };

const owners = new WeakMap<Element, Map<string, object>>();
const num = (value: number) => String(value);
const pct = (value: number) => `${value}%`;
const scale = (value: number) => `scale(${value})`;

function tween(element: HTMLElement, props: Prop[], spec: Spec): Tween {
  const owner = {};
  const claimed = owners.get(element) ?? new Map<string, object>();
  owners.set(element, claimed);
  props.forEach(([name]) => claimed.set(name, owner));
  const write = (p: number) =>
    props.forEach(([name, from, to, format]) => {
      if (claimed.get(name) === owner) element.style[name as never] = format(from + (to - from) * p);
    });
  const ease = spec.ease === "linear" ? (t: number) => t : spec.ease ? cubicBezier(...spec.ease) : undefined;
  const animation = new JSAnimation({
    keyframes: [0, 1],
    duration: spec.duration * 1000,
    ...(spec.type ? { type: spec.type, bounce: spec.bounce } : { ease }),
    onUpdate: write,
  });
  return {
    stop: () => animation.stop(),
    pause: () => animation.pause(),
    play: () => animation.play(),
    cancel: () => animation.cancel(),
    then: (done) => void animation.then(done, () => {}),
  };
}

function scaleOf(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === "none" ? 1 : new DOMMatrix(transform).a;
}

function translateXOf(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === "none" ? 0 : new DOMMatrix(transform).m41;
}

function centreOf(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function setup(root: HTMLElement): Cleanup {
  const track = root.querySelector<HTMLElement>("[data-x-track]");
  const viewport = root.querySelector<HTMLElement>("[data-x-viewport]") ?? track?.parentElement;
  if (!track || !viewport) return () => {};

  const slides = Array.from(track.children) as HTMLElement[];
  const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-x-dot]"));
  const bars = dots.map((dot) => dot.firstElementChild as HTMLElement | null);
  const fills = bars.map((bar) => bar?.firstElementChild as HTMLElement | null);
  const copies = Number(root.dataset.xCopies) || 1;
  const count = slides.length / copies;
  if (!slides.length || !Number.isInteger(count)) return () => {};

  const currentClass = root.dataset.xCurrent || "is-active";
  const spring = root.dataset.xCarousel === "spring";
  const move = spring ? SPRING : TWEEN;
  const autoplay = Number(root.dataset.xAutoplay) || 0;
  const start = root.dataset.xAlign === "start";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cards = slides.map((slide) => slide.firstElementChild as HTMLElement | null);
  const cardFlag = (() => {
    const first = slides.findIndex((slide) => slide.classList.contains(currentClass));
    return !!cards[Math.max(first, 0)]?.classList.contains(currentClass);
  })();

  /* No slide flagged: start on the first card of the middle copy, so a repeated set already fills both sides at first paint. */
  const flagged = slides.findIndex((slide) => slide.classList.contains(currentClass));
  let current = flagged >= 0 ? flagged : count * Math.floor(copies / 2);
  let playing: Tween[] = [];
  let clock: Tween | null = null;
  let hovering = false;
  let dragging = false;
  let visible = true;
  let disposed = false;

  /* ---- geometry ---- */

  const frames = (): Frame[] =>
    slides.map((slide, index) => {
      const style = getComputedStyle(slide);
      return {
        width: parseFloat(style.width),
        height: parseFloat(style.height),
        left: parseFloat(style.marginLeft),
        right: parseFloat(style.marginRight),
        opacity: Number(style.opacity),
        scale: scaleOf(slide),
        card: cards[index] ? scaleOf(cards[index]) : 1,
      };
    });

  /** Back to what the CSS says, except the track: its CSS offset is the no-script resting place, so it is zeroed to measure. */
  const clearInline = () => {
    track.style.transform = "none";
    slides.forEach((slide, index) => {
      ["width", "height", "margin-left", "margin-right", "opacity", "transform"].forEach((property) =>
        slide.style.removeProperty(property),
      );
      cards[index]?.style.removeProperty("transform");
    });
  };

  const applyInline = (frame: Frame[]) =>
    frame.forEach((f, index) => {
      const style = slides[index].style;
      style.width = px(f.width);
      style.height = px(f.height);
      style.marginLeft = px(f.left);
      style.marginRight = px(f.right);
      style.opacity = String(f.opacity);
      style.transform = `scale(${f.scale})`;
      if (cards[index]) cards[index]!.style.transform = `scale(${f.card})`;
    });

  const setCurrent = (index: number) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle(currentClass, i === index);
      if (cardFlag) cards[i]?.classList.toggle(currentClass, i === index);
    });
  };

  const markClones = () => {
    if (copies === 1) return;
    const real = Math.floor(current / count);
    slides.forEach((slide, i) => slide.toggleAttribute("aria-hidden", Math.floor(i / count) !== real));
  };

  /** translateX that puts the slide at `index` where the alignment says (track at x = 0): centre under the viewport's centre, or left edge on the viewport's left edge. */
  const trackX = (index: number) => {
    const view = viewport.getBoundingClientRect();
    if (start) return view.left - slides[index].getBoundingClientRect().left;
    return view.left + view.width / 2 - centreOf(slides[index]);
  };

  const stopPlaying = () => {
    playing.forEach((playback) => playback.stop());
    playing = [];
  };

  /**
   * Slots to keep on each side of the current slide so a move never shows an empty edge. Centred: half
   * the viewport each way. Start-aligned: one slot plus a spare to the left (the clipped edge), and as
   * many to the right as are visible, which is up to the window's edge since the cards run off the viewport.
   */
  const margins = () => {
    const pitch = Math.abs(centreOf(slides[slides.length - 1]) - centreOf(slides[0])) / Math.max(slides.length - 1, 1);
    const view = viewport.getBoundingClientRect();
    if (start) {
      const reach = Math.min(view.width, window.innerWidth - view.left);
      return { before: 2, after: Math.ceil(reach / Math.max(pitch, 1)) + 1 };
    }
    const both = Math.ceil(view.width / 2 / Math.max(pitch, 1)) + 1;
    return { before: both, after: both };
  };

  /** The same picture, whole copies away: keeps `from` and `to` inside the repeated set. */
  const shiftFor = (from: number, to: number) => {
    if (copies === 1) return 0;
    const { before, after } = margins();
    const low = before;
    const high = slides.length - 1 - after;
    if (from >= low && from <= high && to >= low && to <= high) return 0;
    for (let candidate = mod(from, count); candidate < slides.length; candidate += count) {
      const target = candidate + (to - from);
      if (candidate >= low && candidate <= high && target >= low && target <= high) return candidate - from;
    }
    return count * Math.floor(copies / 2) - Math.floor(from / count) * count;
  };

  /**
   * Moves to the slide at ring index `to`. `instant` places it without animation (first paint, resize,
   * reduced motion). The picture on screen is captured first, so a move that interrupts another one
   * starts from where the slide is, not from where it was going.
   */
  const go = (to: number, instant = false) => {
    let from = current;
    let before = frames();
    let startX = translateXOf(track);
    const anchor = centreOf(slides[from]);
    stopPlaying();
    clearInline();

    let shift = 0;
    if (!instant) shift = shiftFor(from, to);
    if (shift) {
      const ring = slides.length;
      before = before.map((_, index) => before[mod(index - shift, ring)]);
      from += shift;
      to += shift;
    }

    setCurrent(to);
    current = to;
    markClones();
    const target = frames();
    const targetX = trackX(to);

    if (instant) {
      track.style.transform = `translateX(${targetX}px)`;
      return;
    }

    applyInline(before);
    if (shift) startX = anchor - centreOf(slides[from]);
    track.style.transform = `translateX(${startX}px)`;

    const motion = reduced.matches ? { duration: 0 } : move;
    const opacity = reduced.matches ? { duration: 0 } : OPACITY;
    slides.forEach((slide, index) => {
      const a = before[index];
      const b = target[index];
      const values: Prop[] = [];
      if (a.width !== b.width) values.push(["width", a.width, b.width, px]);
      if (a.height !== b.height) values.push(["height", a.height, b.height, px]);
      if (a.left !== b.left) values.push(["marginLeft", a.left, b.left, px]);
      if (a.right !== b.right) values.push(["marginRight", a.right, b.right, px]);
      if (values.length) playing.push(tween(slide, values, motion));
      if (a.scale !== b.scale) playing.push(tween(slide, [["transform", a.scale, b.scale, scale]], motion));
      if (a.opacity !== b.opacity) playing.push(tween(slide, [["opacity", a.opacity, b.opacity, num]], opacity));
      const card = cards[index];
      if (card && a.card !== b.card) playing.push(tween(card, [["transform", a.card, b.card, scale]], motion));
    });
    playing.push(tween(track, [["transform", startX, targetX, translateX]], motion));
  };

  /* ---- dots, clock, arrows ---- */

  let shown = -1;

  const morphDots = (active: number, instant: boolean) => {
    dots.forEach((dot, index) => {
      const bar = bars[index];
      const on = index === active;
      dot.toggleAttribute("aria-current", on);
      if (on) dot.setAttribute("aria-current", "true");
      if (!bar) return;
      const width = parseFloat(getComputedStyle(bar).width);
      bar.style.removeProperty("width");
      bar.classList.toggle("is-active", on);
      const next = parseFloat(getComputedStyle(bar).width);
      if (instant || reduced.matches || width === next) return;
      bar.style.width = px(width);
      tween(bar, [["width", width, next, px]], { duration: BAR_MS, ease: EASE_OUT }).then(() =>
        bar.style.removeProperty("width"),
      );
    });
    shown = active;
  };

  const syncClock = () => {
    const hold = hovering || dragging || !visible || document.hidden;
    if (!clock) return;
    if (hold) clock.pause();
    else clock.play();
  };

  const startClock = () => {
    clock?.cancel();
    clock = null;
    fills.forEach((fill, index) => {
      if (fill) fill.style.width = reduced.matches && index === shown ? "100%" : "";
    });
    const fill = fills[shown];
    if (!autoplay || reduced.matches || !fill || disposed) return;
    const own = tween(fill, [["width", 0, 100, pct]], { duration: autoplay / 1000, ease: "linear" });
    clock = own;
    own.then(() => {
      if (clock === own && !disposed) next();
    });
    syncClock();
  };

  const settle = (instant = false) => {
    morphDots(mod(current, count), instant);
    startClock();
  };

  /** Ring index of logical slide `index`, by the shorter way round. */
  const nearest = (index: number) => {
    const delta = mod(index - current, count);
    return current + (delta > count / 2 ? delta - count : delta);
  };

  const closeCards = () => cardHovers.forEach((hover) => hover.close());

  const goBy = (delta: number) => {
    closeCards();
    go(copies === 1 ? mod(current + delta, count) : current + delta);
    settle();
  };
  const next = () => goBy(1);
  const prev = () => goBy(-1);
  const goTo = (index: number) => {
    if (copies === 1 ? index === current : mod(index, count) === mod(current, count)) return;
    closeCards();
    go(copies === 1 ? index : nearest(index));
    settle();
  };

  const clicks: Array<[Element, () => void]> = [];
  const listen = (target: Element | Window | Document, type: string, handler: (event: any) => void, options?: AddEventListenerOptions) => {
    target.addEventListener(type, handler, options);
    clicks.push([target as Element, () => target.removeEventListener(type, handler, options)]);
  };
  dots.forEach((dot, index) => listen(dot, "click", () => goTo(index)));
  root.querySelectorAll("[data-x-prev]").forEach((button) => listen(button, "click", prev));
  root.querySelectorAll("[data-x-next]").forEach((button) => listen(button, "click", next));
  listen(root, "keydown", (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") prev();
    else if (event.key === "ArrowRight") next();
  });

  /* ---- hover pause and card hover ---- */

  listen(viewport, "pointerenter", (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    hovering = true;
    syncClock();
  });
  listen(viewport, "pointerleave", () => {
    hovering = false;
    syncClock();
  });
  listen(document, "visibilitychange", syncClock);

  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      syncClock();
    },
    { threshold: 0.3 },
  );
  observer.observe(root);

  const cardHovers = slides.map((slide, index) => {
    const quote = slide.querySelector<HTMLElement>(".fk-testimonial-card-quote");
    const scrim = slide.querySelector<HTMLElement>(".fk-testimonial-card-scrim");
    let open = false;
    const set = (value: boolean) => {
      if (!quote || open === value) return;
      open = value;
      quote.classList.toggle("is-open", value);
      tween(quote, [["height", parseFloat(getComputedStyle(quote).height), value ? 160 : 104, px]], { duration: OPEN_MS, ease: EASE_OUT }).then(() => {
        if (open === value) quote.style.height = value ? "160px" : "";
      });
      if (scrim) tween(scrim, [["opacity", Number(getComputedStyle(scrim).opacity), value ? 0.9 : 0.6, num]], { duration: OPEN_MS, ease: EASE_OUT }).then(() => {
        if (open === value && !value) scrim.style.opacity = "";
      });
    };
    if (quote) {
      listen(slide, "pointerenter", (event: PointerEvent) => {
        if (event.pointerType === "mouse" && index === current && !dragging) set(true);
      });
      listen(slide, "pointerleave", () => set(false));
    }
    return { close: () => set(false) };
  });

  /* ---- swipe ---- */

  viewport.style.touchAction = "pan-y";
  viewport.style.userSelect = "none";
  let origin: { x: number; y: number; id: number; baseX: number } | null = null;
  let samples: Array<{ x: number; t: number }> = [];
  let swiped = false;

  listen(viewport, "pointerdown", (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    origin = { x: event.clientX, y: event.clientY, id: event.pointerId, baseX: 0 };
    samples = [{ x: event.clientX, t: event.timeStamp }];
    swiped = false;
  });
  listen(viewport, "pointermove", (event: PointerEvent) => {
    if (!origin || event.pointerId !== origin.id) return;
    const dx = event.clientX - origin.x;
    if (!dragging) {
      if (Math.abs(dx) < SWIPE_START || Math.abs(dx) < Math.abs(event.clientY - origin.y)) return;
      dragging = true;
      swiped = true;
      closeCards();
      stopPlaying();
      origin.baseX = translateXOf(track);
      origin.x = event.clientX;
      viewport.setPointerCapture(event.pointerId);
      syncClock();
      return;
    }
    samples.push({ x: event.clientX, t: event.timeStamp });
    samples = samples.filter((sample) => event.timeStamp - sample.t < 100);
    track.style.transform = `translateX(${origin.baseX + (event.clientX - origin.x) * SWIPE_GAIN}px)`;
  });
  const release = (event: PointerEvent) => {
    if (!origin || event.pointerId !== origin.id) return;
    const wasDragging = dragging;
    const start = origin;
    origin = null;
    if (!wasDragging) return;
    dragging = false;
    const dx = event.clientX - start.x;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const velocity = first && last && last.t > first.t ? ((last.x - first.x) / (last.t - first.t)) * 1000 : 0;
    if (event.type !== "pointercancel" && (dx < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY)) next();
    else if (event.type !== "pointercancel" && (dx > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY)) prev();
    else {
      const x = translateXOf(track);
      playing.push(tween(track, [["transform", x, start.baseX, translateX]], reduced.matches ? { duration: 0 } : { duration: 0.45, ease: EASE_IN_OUT }));
      syncClock();
    }
  };
  listen(viewport, "pointerup", release);
  listen(viewport, "pointercancel", release);
  // A swipe that ends on a dot or an arrow must not also click it.
  listen(viewport, "click", (event: Event) => {
    if (!swiped) return;
    swiped = false;
    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });

  /* ---- start, resize, cleanup ---- */

  const place = () => {
    if (disposed) return;
    stopPlaying();
    go(current, true);
    morphDots(mod(current, count), true);
  };

  go(current, true);
  morphDots(mod(current, count), true);
  startClock();

  let frame = 0;
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(place);
  });
  resize.observe(viewport);
  listen(window, "load", place);
  const onReduced = () => {
    place();
    startClock();
  };
  reduced.addEventListener("change", onReduced);
  clicks.push([root, () => reduced.removeEventListener("change", onReduced)]);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    observer.disconnect();
    clicks.forEach(([, remove]) => remove());
    clock?.cancel();
    stopPlaying();
    clearInline();
    track.style.removeProperty("transform");
    viewport.style.removeProperty("touch-action");
    viewport.style.removeProperty("user-select");
    fills.forEach((fill) => fill?.style.removeProperty("width"));
    bars.forEach((bar) => bar?.style.removeProperty("width"));
    slides.forEach((slide) => slide.removeAttribute("aria-hidden"));
  };
}

export function xCarousel(): Cleanup {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-x-carousel]")).map(setup);
  return () => cleanups.forEach((cleanup) => cleanup());
}
