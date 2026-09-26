/*
 * ix-marquee preview: each `.fk-logo-marquee-track` moves translateX from 0 to −(100 / copies)%
 * linearly over 32s, infinite (one set per cycle; copies read from `.fk-logo-marquee-row` count).
 */

type Cleanup = () => void;

export function marquee(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const tracks = Array.from(document.querySelectorAll<HTMLElement>(".fk-logo-marquee-track"));
  const animations: Animation[] = [];

  tracks.forEach((track) => {
    const copies = track.querySelectorAll(".fk-logo-marquee-row").length;
    if (copies < 1) return;

    const stepPercent = 100 / copies;
    const animation = track.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(-${stepPercent}%)` }],
      { duration: 32_000, easing: "linear", iterations: Infinity },
    );
    animations.push(animation);
  });

  return () => {
    animations.forEach((animation) => animation.cancel());
  };
}
