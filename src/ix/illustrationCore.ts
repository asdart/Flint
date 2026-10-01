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
 */

import { animate, inView } from "motion";

export type Cleanup = () => void;
export type Playback = ReturnType<typeof animate>;
export type Ease = readonly [number, number, number, number] | "linear" | "easeInOut";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const parts = (root: Element, name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-x-part="${name}"]`));
export const clear = (element: HTMLElement, ...properties: string[]) => properties.forEach((property) => element.style.removeProperty(property));

/** One illustration's running animations, so the whole set can pause, resume and stop together. */
export function player() {
  const running = new Set<Playback>();
  let paused = false;
  const track = (playback: Playback) => {
    running.add(playback);
    if (paused) playback.pause();
    playback.then(() => running.delete(playback));
    return playback;
  };
  return {
    track,
    animate: (...args: Parameters<typeof animate>) => track(animate(...args)),
    /** A timed number 0 → 1 (eased), or just a wait when there is no `update`. */
    tween: (seconds: number, update?: (value: number) => void, ease: Ease = "linear") =>
      track(animate(0, 1, { duration: seconds, ease, onUpdate: update })),
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
  const blur = from.blur ? [`blur(${from.blur}px)`, "blur(0px)"] : undefined;
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
