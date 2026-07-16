import { useEffect, useRef } from "react";

/**
 * Scroll-triggered stagger reveal.
 *
 * Attach the returned ref to a container. Every descendant marked with
 * `data-reveal` fades + slides up as it scrolls into view. Elements that enter
 * the viewport together are staggered (each gets an incrementing
 * `--reveal-delay`); the counter resets between waves so a section lower down
 * the page starts its own stagger from zero rather than inheriting a huge delay.
 */
export function useStaggerReveal<T extends HTMLElement>(step = 90) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    let order = 0;
    let lastRevealAt = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        // Reveal in document order so a batch staggers top-to-bottom.
        const revealed = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => items.indexOf(a) - items.indexOf(b));

        revealed.forEach((el) => {
          const now = performance.now();
          if (now - lastRevealAt > 220) order = 0;
          lastRevealAt = now;

          el.style.setProperty("--reveal-delay", `${order * step}ms`);
          order += 1;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [step]);

  return ref;
}
