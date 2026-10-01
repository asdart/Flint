/*
 * Exception x-illustrations (docs/webflow/interactions.md, roadmap D-36): the animated illustrations of
 * the Candidates page (hero orbit, How It Works rows), ported 1:1 from the legacy Framer Motion
 * components (ProximityOrbit, Send / Interview / ImmigrationFees / CasePrep illustrations).
 * It is the single source of the shipped code: `node scripts/build-x-illustrations.mjs` bundles this
 * file with Motion loaded from the CDN into docs/webflow/custom-code/x-illustrations.html, and the
 * local preview runs the same module with Motion from npm.
 *
 * The static markup is the final frame: it is the first paint, and the whole state under reduced
 * motion (the script does nothing then). Otherwise each illustration puts its pieces in their start
 * state and plays when its panel scrolls into view. One-shot illustrations (send, interview, fees) play
 * once; loops (orbit, case-prep) pause while their panel is off screen and while the tab is hidden.
 *
 * Markup contract: `[data-x-illustration="orbit|send|interview|fees|case-prep"]` is the panel, the
 * animated pieces are `[data-x-part="…"]` inside it (parts per illustration are read below). Every
 * final value (opacity, scale) is read from the computed style, so the CSS stays the one description
 * of the resting frame. `portrait` has no motion.
 */

import { animate, inView } from "motion";

type Cleanup = () => void;
type Playback = ReturnType<typeof animate>;
type Ease = readonly [number, number, number, number] | "linear" | "easeInOut";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const LOAD = 0.35;

const parts = (root: Element, name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-x-part="${name}"]`));
const clear = (element: HTMLElement, ...properties: string[]) => properties.forEach((property) => element.style.removeProperty(property));

/** One illustration's running animations, so the whole set can pause, resume and stop together. */
function player() {
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
type Player = ReturnType<typeof player>;

type Illustration = {
  /** Starts on mount instead of when the panel scrolls into view (the hero is above the fold). */
  immediate?: boolean;
  /** Plays (or, for a loop, starts) the illustration. */
  start: () => void;
  /** Loops only: pause / resume while off screen or hidden. */
  loop?: { pause: () => void; resume: () => void };
  dispose: () => void;
};

/* ---- shared: a piece that rises / scales in from its resting frame ---- */

type From = { y?: number; x?: number; scale?: number };

/** Hides `element` in its start state (relative to the resting frame in the CSS) and returns its player. */
function entrance(element: HTMLElement, from: From, delay: number, duration: number, p: Player) {
  const style = getComputedStyle(element);
  const opacity = Number(style.opacity);
  const scale = style.transform === "none" ? 1 : new DOMMatrix(style.transform).a;
  const transform = (x: number, y: number, factor: number) => `translate(${x}px, ${y}px) scale(${scale * factor})`;
  const start = transform(from.x ?? 0, from.y ?? 0, from.scale ?? 1);
  element.style.opacity = "0";
  element.style.transform = start;
  return () =>
    p
      .animate(element, { opacity: [0, opacity], transform: [start, transform(0, 0, 1)] }, { duration, delay, ease: EASE_OUT })
      /* Motion writes the final values as inline style after it finishes; hand the frame back to the CSS. */
      .then(() => setTimeout(() => clear(element, "opacity", "transform"), 50));
}

/* ---- Row 1: applications sent (SendApplicationIllustration) ---- */

function send(root: HTMLElement, p: Player): Illustration {
  const notices = parts(root, "notice");
  const plays = notices.map((notice, index) => entrance(notice, { y: 28, scale: 0.96 }, LOAD + index * 0.1, 0.55, p));
  return {
    start: () => plays.forEach((play) => play()),
    dispose: () => notices.forEach((notice) => clear(notice, "opacity", "transform")),
  };
}

/* ---- Row 2: video call (InterviewIllustration) ---- */

function interview(root: HTMLElement, p: Player): Illustration {
  const all: HTMLElement[] = [];
  const plays: Array<() => void> = [];
  const add = (element: HTMLElement | undefined, from: From, delay: number, duration: number) => {
    if (!element) return;
    all.push(element);
    plays.push(entrance(element, from, delay, duration, p));
  };
  add(parts(root, "call")[0], { y: 28, scale: 0.96 }, LOAD, 0.55);
  parts(root, "control").forEach((control, index) => add(control, { scale: 0.6 }, LOAD + 0.55 + index * 0.08, 0.3));
  add(parts(root, "pip")[0], { scale: 0.8 }, LOAD + 0.45, 0.4);
  return {
    start: () => plays.forEach((play) => play()),
    dispose: () => all.forEach((element) => clear(element, "opacity", "transform")),
  };
}

/* ---- Row 3: immigration fees (ImmigrationFeesIllustration) ---- */

function fees(root: HTMLElement, p: Player): Illustration {
  const all: HTMLElement[] = [];
  const plays: Array<() => void> = [];
  const add = (element: HTMLElement | undefined, from: From, delay: number, duration: number) => {
    if (!element) return;
    all.push(element);
    plays.push(entrance(element, from, delay, duration, p));
  };
  const [back1, back2] = parts(root, "back");
  add(back1, { y: 24, scale: 0.96 }, LOAD, 0.5);
  add(back2, { y: 20, scale: 0.97 }, LOAD + 0.08, 0.5);
  add(parts(root, "card")[0], { y: 28, scale: 0.96 }, LOAD + 0.16, 0.55);
  parts(root, "fee").forEach((fee, index) => add(fee, { x: -12 }, LOAD + 0.4 + index * 0.1, 0.4));
  return {
    start: () => plays.forEach((play) => play()),
    dispose: () => all.forEach((element) => clear(element, "opacity", "transform")),
  };
}

/* ---- Row 4: case preparation (CasePrepIllustration) ---- */

const NODE_START = 0.4 + 0.45; // ring fade (delay 0.4, 0.45s), then the nodes
const NODE_STAGGER = 0.11;
const NODE_DUR = 0.6;
const DRAW = 2.4;
const BORDER = 0.85;
const HOLD = 0.7;
const FADE = 0.35;

const maskOf = (element: HTMLElement, gradient: string) => {
  element.style.maskImage = gradient;
  element.style.webkitMaskImage = gradient;
};

function casePrep(root: HTMLElement, p: Player): Illustration {
  const ring = parts(root, "ring")[0];
  const progress = parts(root, "progress")[0];
  const avatar = parts(root, "avatar")[0];
  const label = parts(root, "label")[0];
  const nodes = parts(root, "node");
  const arcs = nodes.map((node) => node.querySelector<HTMLElement>('[data-x-part="arc"]'));
  if (!ring || !progress || !avatar || !label || arcs.some((arc) => !arc)) return { start: () => {}, dispose: () => {} };
  const arcRings = arcs as HTMLElement[];

  /* Geometry from the layout (canvas pixels, unaffected by the canvas scale): the main ring's centre and
     radius, each node's centre, and where the ring meets the node, which is where its border starts. */
  const ringR = ring.offsetWidth / 2;
  const cx = ring.offsetLeft + ringR;
  const cy = ring.offsetTop + ringR;
  const nodeR = arcRings[0].offsetWidth / 2 - 0.5;
  const clockwise = (x: number, y: number) => {
    const angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
    return angle < 0 ? angle + Math.PI * 2 : angle;
  };
  const gap = (from: number, to: number) => (to < from ? to - from + Math.PI * 2 : to - from);
  const centres = nodes.map((node) => ({ x: node.offsetLeft + node.offsetWidth / 2, y: node.offsetTop + node.offsetHeight / 2 }));
  /* CSS conic angles start at the top; the legacy SVG angles at 3 o'clock: +90. */
  const starts = centres.map(({ x, y }) => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const a = (ringR * ringR - nodeR * nodeR + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, ringR * ringR - a * a));
    const px = cx + (a * dx) / d;
    const py = cy + (a * dy) / d;
    const one = { x: px - (h * dy) / d, y: py + (h * dx) / d };
    const two = { x: px + (h * dy) / d, y: py - (h * dx) / d };
    const at = clockwise(x, y);
    const hit = gap(clockwise(one.x, one.y), at) < gap(clockwise(two.x, two.y), at) ? one : two;
    return (Math.atan2(hit.y - y, hit.x - x) * 180) / Math.PI + 90;
  });
  const names = nodes.map((node) => node.dataset.xLabel ?? "");
  const labelWidth = label.offsetWidth;
  const labelHeight = label.offsetHeight;
  const labelGap = 12;
  const nodeHalf = nodes[0].offsetWidth / 2;
  const labelAt = (index: number) => {
    const { x, y } = centres[index];
    const dx = x - cx;
    const dy = y - cy;
    /* Top and bottom nodes carry the label above / below, the others beside, away from the ring. */
    if (Math.abs(dx) < ringR / 2) {
      label.style.top = `${dy < 0 ? y - nodeHalf - labelGap - labelHeight : y + nodeHalf + labelGap}px`;
      label.style.left = `${x - labelWidth / 2}px`;
      label.style.textAlign = "center";
    } else {
      label.style.top = `${y - labelHeight / 2}px`;
      label.style.left = `${dx > 0 ? x + nodeHalf + labelGap : x - nodeHalf - labelGap - labelWidth}px`;
      label.style.textAlign = dx > 0 ? "left" : "right";
    }
  };

  const setProgress = (fraction: number) => maskOf(progress, `conic-gradient(from 0deg, #000 ${fraction * 360}deg, transparent ${fraction * 360}deg)`);
  const setArc = (index: number, half: number) => {
    const arc = arcRings[index];
    if (half >= 180) {
      maskOf(arc, "none");
    } else {
      const from = starts[index] - half;
      maskOf(arc, `conic-gradient(from ${from}deg, #000 0deg ${half * 2}deg, transparent ${half * 2}deg)`);
    }
  };
  const idle = () => {
    setProgress(0);
    arcRings.forEach((arc, index) => {
      arc.style.opacity = "0";
      setArc(index, 0);
    });
  };

  /* Start state: everything of the intro hidden, no progress, no drawn borders. */
  const hidden = [ring, progress, label, avatar, ...nodes];
  hidden.forEach((element) => (element.style.opacity = "0"));
  avatar.style.transform = "scale(0.7)";
  nodes.forEach((node) => (node.style.transform = "scale(0.7)"));
  idle();

  let alive = true;
  let current = 0;
  let labelChain: Promise<unknown> = Promise.resolve();

  /* The label fades out, changes place and text, and fades in (legacy AnimatePresence mode "wait"). */
  const showLabel = (index: number) => {
    labelChain = labelChain.then(async () => {
      if (!alive) return;
      await p.animate(label, { opacity: 0 }, { duration: FADE, ease: EASE_OUT });
      if (!alive) return;
      label.textContent = names[index];
      labelAt(index);
      await p.animate(label, { opacity: 1 }, { duration: FADE, ease: EASE_OUT });
    });
  };
  const border = (index: number) => {
    arcRings[index].style.opacity = "1";
    return p.tween(BORDER, (value) => setArc(index, value * 180), EASE_OUT);
  };
  const wait = (seconds: number) => p.tween(seconds);

  const run = async () => {
    label.textContent = names[0];
    labelAt(0);
    /* Intro: the ring fades in, the nodes and the avatar scale in, the label fades in. */
    p.animate([ring, progress], { opacity: 1 }, { duration: 0.45, delay: 0.4, ease: EASE_OUT });
    nodes.forEach((node, index) =>
      p.animate(node, { opacity: [0, 1], transform: ["scale(0.7)", "scale(1)"] }, { duration: NODE_DUR, delay: NODE_START + index * NODE_STAGGER, ease: EASE_OUT }),
    );
    p.animate(avatar, { opacity: [0, 1], transform: ["scale(0.7)", "scale(1)"] }, { duration: 0.45, delay: NODE_START + 0.15, ease: EASE_OUT });
    p.animate(label, { opacity: 1 }, { duration: FADE, ease: EASE_OUT });
    await wait(NODE_START + (nodes.length - 1) * NODE_STAGGER + NODE_DUR);

    while (alive) {
      idle();
      current = 0;
      await border(0);
      await wait(HOLD);
      for (let step = 0; step < nodes.length; step++) {
        await p.tween(DRAW, (value) => setProgress((step + value) / nodes.length), "linear");
        if (step === nodes.length - 1) break;
        current = step + 1;
        showLabel(current);
        await border(current);
        await wait(HOLD);
      }
      await wait(HOLD);
      idle();
      current = 0;
      showLabel(0);
      await wait(0.05);
    }
  };

  return {
    start: () => void run(),
    loop: { pause: p.pause, resume: p.resume },
    dispose: () => {
      alive = false;
      hidden.forEach((element) => clear(element, "opacity", "transform"));
      clear(label, "top", "left", "text-align");
      label.textContent = names[0];
      clear(progress, "mask-image", "-webkit-mask-image");
      arcRings.forEach((arc) => clear(arc, "opacity", "mask-image", "-webkit-mask-image"));
    },
  };
}

/* ---- Hero orbit (ProximityOrbit, as used by FacilityHero) ---- */

const TURN = 20; // seconds per turn, clockwise
const HOVER_SPEED = 1 / 6;
const HOVER_SCALE = 1.15;
const ENTER_DISTANCE = 2.2;
const ENTER_STAGGER = 0.1;
const ENTER_DURATION = 1.1;
const RADIUS = 328 / 736; // of the stage, avatar centres from the stage centre (the 12-avatar frame)

function orbit(root: HTMLElement, p: Player): Illustration {
  const items = Array.from(root.querySelectorAll<HTMLElement>(".fk-orbit-item"));
  if (!items.length) return { immediate: true, start: () => {}, dispose: () => {} };

  /* The CSS places the items at angle 0 (a1 at the top, clockwise); the script only translates them. */
  const base = items.map((_, index) => ((-90 + (360 / items.length) * index) * Math.PI) / 180);
  const avatars = items.map((item) => item.querySelector<HTMLElement>('[data-x-part="avatar"]') ?? item);
  const tips = items.map((item) => item.querySelector<HTMLElement>('[data-x-part="tooltip"]'));
  let radius = root.offsetWidth * RADIUS;
  const resize = new ResizeObserver(() => (radius = root.offsetWidth * RADIUS));
  const enter = items.map(() => 0);
  const grown = items.map(() => 1);
  const shown = items.map(() => 0);
  const moves: Array<Playback | undefined> = [];
  let rotation = 0;
  let speed = 1;
  let entered = false;
  let running = false;
  let frame = 0;
  let last = 0;

  const place = (element: HTMLElement, index: number) => {
    const reach = ENTER_DISTANCE - (ENTER_DISTANCE - 1) * enter[index];
    const angle = base[index] + (rotation * Math.PI) / 180;
    const x = radius * (reach * Math.cos(angle) - Math.cos(base[index]));
    const y = radius * (reach * Math.sin(angle) - Math.sin(base[index]));
    element.style.translate = `${x}px ${y}px`;
    if (!entered) element.style.opacity = String(enter[index]);
  };
  const render = () => items.forEach((item, index) => place(item, index));

  /* Stacking as legacy `lastToFirst`: the first avatar on top, the hovered one above all (and its tooltip with it). */
  const stack = (hovered = -1) => {
    items.forEach((item, index) => (item.style.zIndex = String(index === hovered ? items.length + 10 : items.length - index)));
  };

  const tick = (time: number) => {
    if (!running) return;
    if (entered) rotation += (Math.min(time - last, 100) * 360 * speed) / (TURN * 1000);
    last = time;
    render();
    if (pointer) point(under());
    frame = requestAnimationFrame(tick);
  };
  const run = () => {
    running = true;
    last = performance.now();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  };

  /* A number that tweens from wherever it is (so a quick leave reverses mid-way, as Framer does). */
  const move = (values: number[], index: number, to: number, duration: number, ease: Ease, write: (value: number) => void) => {
    const key = values === grown ? index : items.length + index;
    moves[key]?.stop();
    moves[key] = p.track(
      animate(values[index], to, {
        duration,
        ease,
        onUpdate: (value) => {
          values[index] = value;
          write(value);
        },
      }),
    );
  };
  const tipOf = (index: number) => (to: number) =>
    move(shown, index, to, 0.18, EASE_OUT, (value) => {
      const tip = tips[index];
      if (!tip) return;
      tip.style.opacity = String(value);
      tip.style.transform = `translateY(${6 * (1 - value)}px) scale(${0.96 + 0.04 * value})`;
    });
  const hover = (index: number, on: boolean) => {
    move(grown, index, on ? HOVER_SCALE : 1, 0.2, "easeInOut", (value) => (avatars[index].style.transform = `scale(${value})`));
    tipOf(index)(on ? 1 : 0);
  };

  /* Hover (as legacy): the avatar grows, gets its tooltip and the top of the stack; the whole ring slows to a sixth
     while the pointer is on an avatar, and goes back at the avatar's or the stage's leave. Browsers don't fire
     mouseenter / mouseleave when only an avatar moves under a still pointer (the ring turns on its own), so the frame
     loop also checks the last pointer position against the avatars. */
  const listeners: Array<() => void> = [];
  const listen = (target: HTMLElement, type: string, handler: (event: MouseEvent) => void) => {
    target.addEventListener(type, handler as EventListener);
    listeners.push(() => target.removeEventListener(type, handler as EventListener));
  };
  let hovered = -1;
  let pointer: [number, number] | null = null;
  const point = (index: number) => {
    if (index === hovered) return;
    if (hovered >= 0) {
      hover(hovered, false);
    }
    hovered = index;
    speed = index >= 0 ? HOVER_SPEED : 1;
    stack(index);
    if (index >= 0) {
      hover(index, true);
    }
  };
  const under = () => {
    if (!pointer) return -1;
    return avatars.findIndex((avatar) => {
      const box = avatar.getBoundingClientRect();
      return Math.hypot(pointer![0] - box.left - box.width / 2, pointer![1] - box.top - box.height / 2) <= box.width / 2;
    });
  };
  avatars.forEach((avatar, index) => {
    listen(avatar, "mouseenter", () => point(index));
    listen(avatar, "mouseleave", () => hovered === index && point(-1));
  });
  listen(root, "mousemove", (event) => (pointer = [event.clientX, event.clientY]));
  listen(root, "mouseleave", () => {
    pointer = null;
    point(-1);
  });

  stack();
  render();

  return {
    immediate: true,
    start: () => {
      resize.observe(root);
      items.forEach((_, index) => {
        p.track(animate(0, 1, {
          duration: ENTER_DURATION,
          delay: index * ENTER_STAGGER,
          ease: EASE_OUT,
          onUpdate: (value) => (enter[index] = value),
          onComplete: () => {
            enter[index] = 1;
            if (index === items.length - 1) {
              /* Settled: opacity stays 1 inline (the CSS holds the avatars hidden until the script is ready). */
              entered = true;
              items.forEach((element) => (element.style.opacity = "1"));
            }
          },
        }));
      });
      run();
    },
    loop: {
      pause: () => {
        running = false;
        cancelAnimationFrame(frame);
        p.pause();
      },
      resume: () => {
        p.resume();
        run();
      },
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      listeners.forEach((remove) => remove());
      items.forEach((element) => clear(element, "opacity", "translate", "transform", "scale", "z-index"));
      avatars.forEach((avatar) => clear(avatar, "transform"));
      tips.forEach((tip) => tip && clear(tip, "opacity", "transform"));
    },
  };
}

const MAKERS: Record<string, (root: HTMLElement, p: Player) => Illustration> = {
  orbit,
  send,
  interview,
  fees,
  "case-prep": casePrep,
};

function setup(root: HTMLElement): Cleanup {
  const make = MAKERS[root.dataset.xIllustration ?? ""];
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
      if (!started) {
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

export function xIllustrations(): Cleanup {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-x-illustration]")).map(setup);
  return () => cleanups.forEach((cleanup) => cleanup());
}
