/*
 * ix-blur-reveal preview (decision D-19). Scroll trigger on [data-ix="blur-reveal"] (start
 * "top 85%", once). In Webflow the interaction is a Set that adds `is-revealed` (the class
 * transition brings the blur to 0; the resting blur is exception x-blur-reveal) plus a FromTo on
 * the .fk-blur-reveal children (opacity 0 → 100%, y 16 → 0, 0.75s, ease-in-out, 0.15s stagger in
 * DOM order). IX3 holds that from-state at rest, so this emulation applies it inline right away
 * (useInteractions runs in a layout effect, before the first paint) and animates it on trigger.
 * With reduced motion the end state is applied at once, like IX3's skip-to-end.
 */

type Cleanup = () => void;

const DURATION_MS = 750;
const STAGGER_MS = 150;
const EASE = "cubic-bezier(0.42, 0, 0.58, 1)";
const REST_Y = 16;

export function blurReveal(): Cleanup {
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="blur-reveal"]'));
  const itemsOf = (trigger: Element) =>
    Array.from(trigger.querySelectorAll<HTMLElement>(".fk-blur-reveal"));
  const animations = new Set<Animation>();

  const reveal = (trigger: Element, animate: boolean) => {
    itemsOf(trigger).forEach((item, index) => {
      item.classList.add("is-revealed");
      if (!animate) {
        item.style.opacity = "";
        item.style.transform = "";
        return;
      }
      const animation = item.animate(
        [
          { opacity: "0", transform: `translateY(${REST_Y}px)` },
          { opacity: "1", transform: "translateY(0px)" },
        ],
        { duration: DURATION_MS, delay: index * STAGGER_MS, easing: EASE, fill: "backwards" },
      );
      animations.add(animation);
      animation.onfinish = () => {
        item.style.opacity = "";
        item.style.transform = "";
        animations.delete(animation);
      };
    });
  };

  const restore = () => {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    triggers.forEach((trigger) =>
      itemsOf(trigger).forEach((item) => {
        item.style.opacity = "";
        item.style.transform = "";
        item.classList.remove("is-revealed");
      }),
    );
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    triggers.forEach((trigger) => reveal(trigger, false));
    return restore;
  }

  triggers.forEach((trigger) =>
    itemsOf(trigger).forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = `translateY(${REST_Y}px)`;
    }),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return;
        reveal(entry.target, true);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  triggers.forEach((trigger) => observer.observe(trigger));

  return () => {
    observer.disconnect();
    restore();
  };
}
