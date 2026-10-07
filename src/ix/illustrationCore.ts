/*
 * Shared engine of the illustration scripts (exceptions x-illustrations and x-facility-illustrations,
 * docs/webflow/interactions.md, roadmap D-36): the player, the entrance and fade helpers and the setup /
 * inView / visibility / reduced-motion lifecycle. Source-level only: each page's script (xIllustrations.ts for
 * Candidates, xFacilityIllustrations.ts for Facility partners) imports this module and passes its own makers to
 * `runIllustrations`, so each shipped bundle holds just its own makers plus the part of this file it uses.
 *
 * The static markup is the final frame: it is the first paint, and the whole state under reduced
 * motion (the script does nothing then). Otherwise each illustration puts its pieces in their start
 * state and plays when its panel scrolls into view. One-shot illustrations play once; loops pause while
 * their panel is off screen and while the tab is hidden.
 *
 * Markup contract: `[data-x-illustration="<name>"]` is the panel, the animated pieces are
 * `[data-x-part="…"]` inside it. Every final value (opacity, scale) is read from the computed style, so the
 * CSS stays the one description of the resting frame.
 *
 * Self-contained (D-57): the animation engine is a small rAF runner (`run`) with Motion's own `cubicBezier`
 * for the easings, and `inView` is an IntersectionObserver wrapper with Motion's semantics. Motion's
 * `animate` (55 KB) is never imported, so each shipped bundle is one inline script with no CDN request.
 */

import { cubicBezier } from "motion";

export type Cleanup = () => void;
export type Ease = readonly [number, number, number, number] | "linear" | "easeInOut";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const easing = (ease: Ease): ((t: number) => number) =>
  ease === "linear" ? (t) => t : cubicBezier(...(ease === "easeInOut" ? ([0.42, 0, 0.58, 1] as const) : ease));

/* ---- the engine: one shared rAF loop, wall-clock tweens that can pause, resume and stop ---- */

/** A running animation. `then` resolves when it finishes (never when it is stopped or the repeat is endless). */
export type Playback = { stop: () => void; pause: () => void; play: () => void; then: (done?: () => unknown) => Promise<unknown> };
type Spec = { duration: number; delay?: number; ease?: Ease; repeat?: boolean };

const active = new Set<(now: number) => void>();
let frameId = 0;
const frame = () => {
  frameId = 0;
  const now = performance.now();
  active.forEach((tick) => tick(now));
  if (active.size && !frameId) frameId = requestAnimationFrame(frame);
};
const wake = () => {
  if (!frameId) frameId = requestAnimationFrame(frame);
};

/** Calls `write(eased progress 0 → 1)` every frame after `delay`; with `repeat` the progress restarts forever. */
export function run(spec: Spec, write: (value: number) => void): Playback {
  const curve = easing(spec.ease ?? "linear");
  const total = spec.duration * 1000;
  const delay = (spec.delay ?? 0) * 1000;
  let start = performance.now();
  let hold: number | null = null;
  let resolve!: () => void;
  const finished = new Promise<void>((done) => (resolve = done));
  const tick = (now: number) => {
    const time = now - start - delay;
    if (time < 0) return write(curve(0));
    if (spec.repeat) return write(curve((time / total) % 1));
    if (time < total) return write(curve(time / total));
    active.delete(tick);
    write(curve(1));
    resolve();
  };
  active.add(tick);
  wake();
  return {
    stop: () => void active.delete(tick),
    pause: () => {
      if (hold !== null || !active.has(tick)) return;
      hold = performance.now();
      active.delete(tick);
    },
    play: () => {
      if (hold === null) return;
      start += performance.now() - hold;
      hold = null;
      active.add(tick);
      wake();
    },
    then: (done) => finished.then(done),
  };
}

/** Motion's `inView`: calls `onStart` when `root` shows at least `amount`; what it returns runs when it leaves. */
function inView(root: Element, onStart: () => void | (() => void), { amount }: { amount: number }) {
  let onEnd: (() => void) | undefined;
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting === Boolean(onEnd)) return;
        if (entry.isIntersecting) {
          const end = onStart();
          onEnd = typeof end === "function" ? end : undefined;
          if (!onEnd) observer.unobserve(root);
        } else {
          onEnd?.();
          onEnd = undefined;
        }
      }),
    { threshold: amount },
  );
  observer.observe(root);
  return () => observer.disconnect();
}

/* Keyframes of a style value: numbers (opacity; height in px) and strings with numbers in them (transform, filter). */
type Value = number | string;
type Props = Record<string, Value | [Value, Value]>;
const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/g;
const mix = (from: Value, to: Value, t: number): string => {
  if (typeof from === "number" && typeof to === "number") return String(from + (to - from) * t);
  const a = String(from).match(NUMBER) ?? [];
  const b = String(to).match(NUMBER) ?? [];
  if (a.length !== b.length) return String(t < 1 ? from : to);
  let index = 0;
  return String(to).replace(NUMBER, () => {
    const [x, y] = [Number(a[index]), Number(b[index])];
    index++;
    return String(x + (y - x) * t);
  });
};

export const parts = (root: Element, name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-x-part="${name}"]`));
export const clear = (element: HTMLElement, ...properties: string[]) => properties.forEach((property) => element.style.removeProperty(property));

/** One illustration's running animations, so the whole set can pause, resume and stop together. */
export function player() {
  const running = new Set<Playback>();
  let paused = false;
  const track = (playback: Playback) => {
    running.add(playback);
    if (paused) playback.pause();
    void playback.then(() => running.delete(playback));
    return playback;
  };
  /** Tracked `run`. */
  const go = (spec: Spec, write: (value: number) => void) => track(run(spec, write));
  return {
    track,
    run: go,
    /** Animates style values of one or several elements: `[from, to]`, or just `to` (from the computed style). */
    animate: (targets: HTMLElement | HTMLElement[], props: Props, spec: Spec) => {
      const frames = (Array.isArray(targets) ? targets : [targets]).flatMap((element) =>
        Object.entries(props).map(([name, value]) => {
          const unit = typeof (Array.isArray(value) ? value[1] : value) === "number" && name !== "opacity" ? "px" : "";
          const [from, to] = Array.isArray(value) ? value : [parseFloat(getComputedStyle(element)[name as never]), value];
          return (t: number) => (element.style[name as never] = mix(from, to, t) + unit);
        }),
      );
      return go(spec, (t) => frames.forEach((write) => write(t)));
    },
    /** A timed number 0 → 1 (eased), or just a wait when there is no `update`. */
    tween: (seconds: number, update?: (value: number) => void, ease: Ease = "linear", delay = 0) =>
      go({ duration: seconds, ease, delay }, update ?? (() => {})),
    pause: () => {
      paused = true;
      running.forEach((playback) => playback.pause());
    },
    resume: () => {
      paused = false;
      running.forEach((playback) => playback.play());
    },
    stop: () => {
      running.forEach((playback) => playback.stop());
      running.clear();
    },
  };
}
export type Player = ReturnType<typeof player>;

export type Illustration = {
  /** Starts on mount instead of when the panel scrolls into view (the hero is above the fold). */
  immediate?: boolean;
  /** Plays (or, for a loop, starts) the illustration. */
  start: () => void;
  /** Loops that play an intro first: how much of the panel must show before it starts (legacy `useInView` 0.35). */
  startAmount?: number;
  /** Loops only: pause / resume while off screen or hidden. */
  loop?: { pause: () => void; resume: () => void };
  dispose: () => void;
};

/* ---- shared: a piece that rises / scales in from its resting frame ---- */

export type From = { y?: number; x?: number; scale?: number; blur?: number };

/** Hides `element` in its start state (relative to the resting frame in the CSS) and returns its player. */
export function entrance(element: HTMLElement, from: From, delay: number, duration: number, p: Player) {
  const style = getComputedStyle(element);
  const opacity = Number(style.opacity);
  const scale = style.transform === "none" ? 1 : new DOMMatrix(style.transform).a;
  const transform = (x: number, y: number, factor: number) => `translate(${x}px, ${y}px) scale(${scale * factor})`;
  const start = transform(from.x ?? 0, from.y ?? 0, from.scale ?? 1);
  const blur: [string, string] | undefined = from.blur ? [`blur(${from.blur}px)`, "blur(0px)"] : undefined;
  element.style.opacity = "0";
  element.style.transform = start;
  if (blur) element.style.filter = blur[0];
  return () =>
    p
      .animate(
        element,
        { opacity: [0, opacity], transform: [start, transform(0, 0, 1)], ...(blur ? { filter: blur } : {}) },
        { duration, delay, ease: EASE_OUT },
      )
      /* Motion writes the final values as inline style after it finishes; hand the frame back to the CSS. */
      .then(() => setTimeout(() => clear(element, "opacity", "transform", "filter"), 50));
}

/** Opacity only (a piece with its own CSS transform, like a rotated spoke, keeps it): 0 → its resting opacity. */
export function fade(elements: HTMLElement[], delay: number, duration: number, p: Player, ease: Ease = EASE_OUT) {
  const finals = elements.map((element) => Number(getComputedStyle(element).opacity));
  elements.forEach((element) => (element.style.opacity = "0"));
  return () =>
    elements.forEach((element, index) =>
      p.animate(element, { opacity: [0, finals[index]] }, { duration, delay, ease }).then(() => setTimeout(() => clear(element, "opacity"), 50)),
    );
}

export type Maker = (root: HTMLElement, p: Player) => Illustration;
type Makers = Record<string, Maker>;

function setup(root: HTMLElement, makers: Makers): Cleanup {
  const make = makers[root.dataset.xIllustration ?? ""];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (!make || reduced.matches) return () => {};

  const p = player();
  const illustration = make(root, p);
  /* Hands the first paint over to the script: x-illustrations.css hides the orbit pieces until this is set. */
  root.dataset.xReady = "";
  const stops: Cleanup[] = [];
  let started = false;
  let visible = true;
  let onScreen = false;

  const apply = () => {
    if (!started || !illustration.loop) return;
    if (visible && onScreen) illustration.loop.resume();
    else illustration.loop.pause();
  };

  if (illustration.immediate) {
    started = true;
    illustration.start();
  }

  const stopView = inView(
    root,
    () => {
      onScreen = true;
      if (!started && !illustration.startAmount) {
        started = true;
        illustration.start();
      }
      if (illustration.loop) {
        apply();
        return () => {
          onScreen = false;
          apply();
        };
      }
      stopView();
    },
    { amount: illustration.loop ? 0.1 : 0.35 },
  );
  stops.push(stopView);
  if (illustration.startAmount) {
    const stopStart = inView(
      root,
      () => {
        started = true;
        illustration.start();
        apply();
        stopStart();
      },
      { amount: illustration.startAmount },
    );
    stops.push(stopStart);
  }

  const onVisibility = () => {
    visible = document.visibilityState === "visible";
    apply();
  };
  document.addEventListener("visibilitychange", onVisibility);
  stops.push(() => document.removeEventListener("visibilitychange", onVisibility));

  const dispose = () => {
    stops.forEach((stop) => stop());
    p.stop();
    illustration.dispose();
    delete root.dataset.xReady;
  };
  /* Switching reduced motion on mid-visit leaves the static frame. */
  const onReduced = () => {
    if (reduced.matches) dispose();
  };
  reduced.addEventListener("change", onReduced);
  stops.push(() => reduced.removeEventListener("change", onReduced));

  return dispose;
}

/** Starts every `[data-x-illustration]` panel on the page that has a maker in `makers`; returns the cleanup. */
export function runIllustrations(makers: Makers): Cleanup {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-x-illustration]")).map((root) => setup(root, makers));
  return () => cleanups.forEach((cleanup) => cleanup());
}
