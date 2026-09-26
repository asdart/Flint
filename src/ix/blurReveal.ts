/*
 * ix-blur-reveal preview: scroll trigger on [data-ix="blur-reveal"] (start "top 85%", once) adds
 * `is-revealed` to the .fk-blur-reveal elements inside it; the class transition does the motion.
 * With reduced motion the class is added right away, like IX3's skip-to-end.
 */

type Cleanup = () => void;

export function blurReveal(): Cleanup {
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="blur-reveal"]'));
  const reveal = (trigger: Element) =>
    trigger.querySelectorAll(".fk-blur-reveal").forEach((item) => item.classList.add("is-revealed"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    triggers.forEach(reveal);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  triggers.forEach((trigger) => observer.observe(trigger));
  return () => observer.disconnect();
}
