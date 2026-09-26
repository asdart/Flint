/*
 * ix-hero-arc preview: rotate one ten-card set (55.556deg) in 34s. The second set makes the
 * infinite restart visually identical. Webflow uses the equivalent IX3 load and hover controls.
 */

type Cleanup = () => void;

const SET_ANGLE = 500 / 9;
const CYCLE_MS = 34_000;

function setupHeroArc(stage: HTMLElement): Cleanup {
  const wheel = stage.querySelector<HTMLElement>(".fk-hero-wheel");
  if (!wheel) return () => {};

  const animation = wheel.animate(
    [{ transform: "rotate(0deg)" }, { transform: `rotate(${SET_ANGLE}deg)` }],
    {
      duration: CYCLE_MS,
      easing: "linear",
      iterations: Infinity,
    },
  );

  const pause = () => animation.pause();
  const resume = () => animation.play();

  stage.addEventListener("pointerenter", pause);
  stage.addEventListener("pointerleave", resume);

  return () => {
    stage.removeEventListener("pointerenter", pause);
    stage.removeEventListener("pointerleave", resume);
    animation.cancel();
  };
}

export function heroArc(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const stages = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="hero-arc"]'));
  const cleanups = stages.map(setupHeroArc);

  return () => cleanups.forEach((cleanup) => cleanup());
}
