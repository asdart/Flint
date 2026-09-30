/*
 * ix-card-hover preview: hovering a `.fk-card` tweens its background, title and text (300ms, legacy
 * ease) and adds `is-inverse` to its icon, whose filter transition turns it white. Reduced motion
 * plays the same tween: a hover is user-initiated, and IX3 can't skip a hover (decision D-30).
 */

type Cleanup = () => void;

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function cardHover(): Cleanup {
  const cards = Array.from(document.querySelectorAll<HTMLElement>(".fk-card"));

  const cleanups = cards.map((card) => {
    const title = card.querySelector<HTMLElement>(".fk-card-title");
    const text = card.querySelector<HTMLElement>(".fk-card-text");
    const icon = card.querySelector<HTMLElement>(".fk-icon");
    const targets = [card, title, text].filter((element): element is HTMLElement => !!element);

    const tween = (element: HTMLElement | null, to: Record<string, string>) => {
      if (!element) return;
      const style = getComputedStyle(element) as unknown as Record<string, string>;
      const from = Object.fromEntries(Object.keys(to).map((key) => [key, style[key]]));
      element.getAnimations().forEach((animation) => animation.cancel());
      element.animate([from, to], { duration: 300, easing: EASE, fill: "forwards" });
    };

    const set = (hovered: boolean) => {
      tween(card, { backgroundColor: token(hovered ? "--color-brand" : "--color-white") });
      tween(title, { color: token(hovered ? "--color-white" : "--color-ink") });
      tween(text, {
        color: token(hovered ? "--color-white" : "--color-brand"),
        opacity: hovered ? "0.6" : "0.8",
      });
      icon?.classList.toggle("is-inverse", hovered);
    };

    const onEnter = () => set(true);
    const onLeave = () => set(false);
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);

    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      targets.forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
      icon?.classList.remove("is-inverse");
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
