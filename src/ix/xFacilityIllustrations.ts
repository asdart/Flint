/*
 * Exception x-facility-illustrations (docs/webflow/interactions.md, roadmap D-36): the animated illustrations of
 * the Facility partners page (network, savings, retention), ported 1:1 from the legacy components. A dedicated
 * script so the page loads only its own code (pagespeed); the engine is shared with the Candidates script at the
 * source level only (illustrationCore.ts). `node scripts/build-x-illustrations.mjs` bundles this file with Motion
 * loaded from the CDN into docs/webflow/custom-code/x-facility-illustrations.html, and the local preview runs the
 * same module with Motion from npm. Needs no head CSS.
 *
 * Markup contract: `[data-x-illustration="network|savings|retention"]` is the panel, the animated pieces are
 * `[data-x-part="…"]` inside it (parts per illustration are read below). The static markup is the final frame
 * and the whole state under reduced motion.
 */

import { animate } from "motion";
import { clear, entrance, fade, EASE_OUT, parts, runIllustrations, type Cleanup, type From, type Illustration, type Player } from "./illustrationCore";

/* ---- Facility partners row 1: the network (NetworkIllustration) ---- */

const NET_LOAD = 0.45;
const NET_HUB = 0.4;
const NET_FACES = NET_LOAD + NET_HUB; // the avatars follow the hub
const NET_STAGGER = 0.1;
const NET_FACE = 0.85;
const NET_LINES = NET_FACES + 7 * NET_STAGGER + NET_FACE; // spokes and rings fade in once the last avatar has landed
const NET_LINE = 0.4;
const NET_TURN = 48; // seconds per turn, clockwise; the faces turn the other way so the portraits stay upright
const NET_TRAVEL = 48; // px an avatar flies in along its own radius

function network(root: HTMLElement, p: Player): Illustration {
  const hub = parts(root, "hub")[0];
  const layer = parts(root, "orbit")[0];
  const avatars = parts(root, "avatar");
  if (!hub || !layer || !avatars.length) return { start: () => {}, dispose: () => {} };
  const hubIcon = parts(root, "hub-icon")[0];
  const faces = parts(root, "face");
  const strokes = [...parts(root, "line"), ...parts(root, "ring"), ...parts(root, "hub-ring")];
  const all = [hub, hubIcon, ...avatars, ...strokes].filter(Boolean);

  /* Each avatar flies in along the line from the hub centre (the middle of the orbit layer) through its own centre. */
  const middle = layer.offsetWidth / 2;
  const travel = avatars.map((avatar) => {
    const node = avatar.parentElement as HTMLElement;
    const dx = node.offsetLeft + node.offsetWidth / 2 - middle;
    const dy = node.offsetTop + node.offsetHeight / 2 - middle;
    const length = Math.hypot(dx, dy) || 1;
    return { x: (dx / length) * NET_TRAVEL, y: (dy / length) * NET_TRAVEL };
  });

  const playHub = entrance(hub, { scale: 0.8 }, NET_LOAD, NET_HUB, p);
  const playIcon = hubIcon ? entrance(hubIcon, {}, NET_LOAD + 0.15, 0.3, p) : () => {};
  const playStrokes = fade(strokes, NET_LINES, NET_LINE, p);
  avatars.forEach((avatar, index) => {
    avatar.style.opacity = "0";
    avatar.style.filter = "blur(6px)";
    avatar.style.transform = `translate(${travel[index].x}px, ${travel[index].y}px) scale(0.75)`;
  });

  return {
    start: () => {
      playHub();
      playIcon();
      avatars.forEach((avatar, index) => {
        /* Legacy: opacity, blur and the flight take the whole 0.85s; the scale overshoots to 1.05 at 72% of it. */
        p.animate(
          avatar,
          { opacity: [0, 1], filter: ["blur(6px)", "blur(0px)"], x: [travel[index].x, 0], y: [travel[index].y, 0], scale: [0.75, 1.05, 1] },
          { duration: NET_FACE, delay: NET_FACES + index * NET_STAGGER, ease: EASE_OUT, scale: { times: [0, 0.72, 1], ease: EASE_OUT } },
        ).then(() => setTimeout(() => clear(avatar, "opacity", "filter", "transform"), 50));
      });
      playStrokes();
      /* Then the whole layer turns for good (delay as legacy: lines done + 0.15s); the faces counter-turn. */
      const forever = { duration: NET_TURN, ease: "linear", repeat: Infinity, delay: NET_LINES + NET_LINE + 0.15 } as const;
      p.animate(layer, { rotate: [0, 360] }, forever);
      faces.forEach((face) => p.animate(face, { rotate: [0, -360] }, forever));
    },
    startAmount: 0.35,
    loop: { pause: p.pause, resume: p.resume },
    dispose: () => {
      const reset = () => {
        all.forEach((element) => clear(element, "opacity", "transform", "filter"));
        [layer, ...faces].forEach((element) => clear(element, "transform", "rotate"));
      };
      reset();
      /* A stopped Motion animation commits its last value as inline style a frame later. */
      requestAnimationFrame(() => requestAnimationFrame(reset));
    },
  };
}

/* ---- Facility partners row 2: staffing costs (CostSavingsIllustration) ---- */

/* The legacy draws the chart's `pathLength` 0 → 1 (eased over arclength); the shipped line is the same path as an
   image, so it is revealed by a growing clip whose edge follows the path: x at each arclength fraction, sampled once
   from the path itself. Coordinates are those of `chart-stroke.svg` (viewBox 299 × 122). */
const CHART_PATH =
  "M1.5 1.5H43.9681C50.2293 1.5 55.7293 5.65736 57.4372 11.6811L62.5262 29.6302C64.2341 35.654 69.7341 39.8113 75.9953 39.8113H147.921C151.29 39.8113 154.546 41.0263 157.092 43.2332L195.604 76.6224C198.119 78.8026 201.328 80.0155 204.656 80.0438L265.752 80.5629H276.036C282.369 80.5629 287.914 84.8145 289.557 90.9309L297.5 120.5";
const CHART_WIDTH = 299;
const CHART_STEPS = 120;

function chartReveal(): (fraction: number) => number {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", CHART_PATH);
  const total = path.getTotalLength();
  const edge = Array.from({ length: CHART_STEPS + 1 }, (_, step) => path.getPointAtLength((total * step) / CHART_STEPS).x);
  return (fraction) => {
    const at = Math.min(Math.max(fraction, 0), 1) * CHART_STEPS;
    const low = Math.floor(at);
    return edge[low] + ((edge[Math.min(low + 1, CHART_STEPS)] - edge[low]) * (at - low));
  };
}

const SAV_LOAD = 0.35;

function savings(root: HTMLElement, p: Player): Illustration {
  const [back1, back2] = parts(root, "back");
  const card = parts(root, "card")[0];
  const line = parts(root, "line")[0];
  if (!card || !line) return { start: () => {}, dispose: () => {} };
  const all: HTMLElement[] = [];
  const plays: Array<() => void> = [];
  const add = (element: HTMLElement | undefined, from: From, delay: number, duration: number) => {
    if (!element) return;
    all.push(element);
    plays.push(entrance(element, from, delay, duration, p));
  };
  add(back1, { y: 24, scale: 0.96 }, SAV_LOAD, 0.5);
  add(back2, { y: 20, scale: 0.97 }, SAV_LOAD + 0.08, 0.5);
  add(card, { y: 28, scale: 0.96 }, SAV_LOAD + 0.16, 0.55);
  add(parts(root, "dot-start")[0], { scale: 0 }, SAV_LOAD + 0.5, 0.25);
  add(parts(root, "dot-end")[0], { scale: 0 }, SAV_LOAD + 1.45, 0.25);
  add(parts(root, "saved")[0], { y: 10 }, SAV_LOAD + 1.55, 0.4);
  add(parts(root, "chip")[0], { scale: 0.85 }, SAV_LOAD + 1.7, 0.35);
  const fades = [
    fade(parts(root, "fill"), SAV_LOAD + 0.85, 0.45, p),
    fade(parts(root, "rule"), SAV_LOAD + 0.4, 0.3, p, "linear"),
    fade([line], SAV_LOAD + 0.45, 0.2, p, "linear"),
  ];
  all.push(...parts(root, "fill"), ...parts(root, "rule"), line);

  const edge = chartReveal();
  const clip = (fraction: number) => (line.style.clipPath = `inset(0 ${100 - (edge(fraction) / CHART_WIDTH) * 100}% 0 0)`);
  clip(0);

  return {
    start: () => {
      plays.forEach((play) => play());
      fades.forEach((play) => play());
      p.track(animate(0, 1, { duration: 1.1, delay: SAV_LOAD + 0.45, ease: EASE_OUT, onUpdate: clip })).then(() => clear(line, "clip-path"));
    },
    dispose: () => {
      all.forEach((element) => clear(element, "opacity", "transform"));
      clear(line, "clip-path");
    },
  };
}

/* ---- Facility partners row 3: guaranteed retention (RetentionIllustration) ---- */

const RET_LOAD = 0.35;
const RET_LINE = RET_LOAD + 0.45;
const RET_LINE_DUR = 0.6;
const RET_FACILITY = RET_LINE + RET_LINE_DUR;

function retention(root: HTMLElement, p: Player): Illustration {
  const connector = parts(root, "connector")[0];
  if (!connector) return { start: () => {}, dispose: () => {} };
  const all: HTMLElement[] = [];
  const plays: Array<() => void> = [];
  /* A "rise" in the legacy: opacity 0 → 1, 24px up and blur 6px → 0. */
  const rise = (element: HTMLElement | undefined, delay: number, duration = 0.6) => {
    if (!element) return;
    all.push(element);
    plays.push(entrance(element, { y: 24, blur: 6 }, delay, duration, p));
  };
  rise(parts(root, "hired")[0], RET_LOAD);
  parts(root, "person").forEach((person, index) => rise(person, RET_LOAD + 0.25 + index * 0.12, 0.45));
  rise(parts(root, "facility")[0], RET_FACILITY);
  rise(parts(root, "thumb")[0], RET_FACILITY + 0.18, 0.45);
  rise(parts(root, "address")[0], RET_FACILITY + 0.28, 0.45);
  const badge = parts(root, "badge")[0];
  if (badge) {
    all.push(badge);
    plays.push(entrance(badge, { scale: 0.7 }, RET_LINE + 0.3, 0.4, p));
  }

  /* The dotted connector is drawn downwards: its clip box grows from 0 to its height. */
  const height = connector.offsetHeight;
  connector.style.height = "0px";

  return {
    start: () => {
      plays.forEach((play) => play());
      p.animate(connector, { height: [0, height] }, { duration: RET_LINE_DUR, delay: RET_LINE, ease: EASE_OUT }).then(() => setTimeout(() => clear(connector, "height"), 50));
    },
    dispose: () => {
      all.forEach((element) => clear(element, "opacity", "transform", "filter"));
      clear(connector, "height");
    },
  };
}

const MAKERS = { network, savings, retention };

export const xFacilityIllustrations = (): Cleanup => runIllustrations(MAKERS);
