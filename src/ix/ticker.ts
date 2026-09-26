/*
 * ix-ticker preview: move one 52px row every 2.2s (y from 0; the CSS margin centres row 7). Fourteen steps land on a duplicate New York,
 * then reset to the visually identical starting frame. Webflow uses the equivalent IX3 actions.
 */

type Cleanup = () => void;

const UNIQUE_ROWS = 14;
const LINE = 52;
const STEP_MS = 2_200;
const MOVE_MS = 900;
const FADE_MS = 450;
const STARTING_ROW = 7;
const OPACITY_EASE = "cubic-bezier(0.42, 0, 0.58, 1)";
const BACK_OVERSHOOT = 1.2;
const BACK_SAMPLES = 100;

function backOut(progress: number) {
  const shifted = progress - 1;
  return 1 + (BACK_OVERSHOOT + 1) * shifted ** 3 + BACK_OVERSHOOT * shifted ** 2;
}

function yFor(row: number) {
  return -(row - STARTING_ROW) * LINE;
}

function moveFrames(from: number, to: number): Keyframe[] {
  return Array.from({ length: BACK_SAMPLES + 1 }, (_, index) => {
    const offset = index / BACK_SAMPLES;
    const y = from + (to - from) * backOut(offset);
    return { offset, transform: `translateY(${y}px)` };
  });
}

function setupTicker(track: HTMLElement): Cleanup {
  const rows = Array.from(track.querySelectorAll<HTMLElement>("[data-ticker-row]"));
  if (rows.length <= STARTING_ROW + UNIQUE_ROWS) return () => {};

  const animations = new Set<Animation>();
  let timeout = 0;
  let step = 0;
  let stopped = false;

  const setStartFrame = () => {
    track.style.transform = `translateY(${yFor(STARTING_ROW)}px)`;
    rows.forEach((row, index) => {
      row.style.opacity = index === STARTING_ROW ? "1" : "0.2";
    });
  };

  const fade = (row: HTMLElement, from: number, to: number) => {
    const animation = row.animate([{ opacity: from }, { opacity: to }], {
      duration: FADE_MS,
      easing: OPACITY_EASE,
      fill: "forwards",
    });
    animations.add(animation);
    animation.onfinish = () => {
      row.style.opacity = String(to);
      animations.delete(animation);
      animation.cancel();
    };
  };

  const tick = () => {
    if (stopped) return;

    step += 1;
    const leavingIndex = STARTING_ROW + step - 1;
    const enteringIndex = STARTING_ROW + step;
    const fromY = yFor(leavingIndex);
    const toY = yFor(enteringIndex);

    const movement = track.animate(moveFrames(fromY, toY), {
      duration: MOVE_MS,
      easing: "linear",
      fill: "forwards",
    });
    animations.add(movement);
    movement.onfinish = () => {
      animations.delete(movement);
      movement.cancel();
      if (step === UNIQUE_ROWS) {
        step = 0;
        setStartFrame();
      } else {
        track.style.transform = `translateY(${toY}px)`;
      }
    };

    fade(rows[leavingIndex], 1, 0.2);
    fade(rows[enteringIndex], 0.2, 1);
    timeout = window.setTimeout(tick, STEP_MS);
  };

  setStartFrame();
  timeout = window.setTimeout(tick, STEP_MS);

  return () => {
    stopped = true;
    window.clearTimeout(timeout);
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    track.style.transform = "";
    rows.forEach((row) => {
      row.style.opacity = "";
    });
  };
}

export function ticker(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const tracks = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="ticker"]'));
  const cleanups = tracks.map(setupTicker);
  return () => cleanups.forEach((cleanup) => cleanup());
}
