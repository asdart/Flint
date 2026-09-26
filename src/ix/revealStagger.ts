/*
 * ix-reveal-stagger preview: when [data-ix="reveal-stagger"] reaches "top 85%", its
 * [data-ix-item] children fade in and move up 18px, 700ms, 90ms apart (legacy [data-reveal] waves).
 */

type Cleanup = () => void;

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const FROM = { opacity: "0", transform: "translateY(18px)" };

export function revealStagger(): Cleanup {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-ix="reveal-stagger"]'));
  const itemsOf = (group: Element) => Array.from(group.querySelectorAll<HTMLElement>("[data-ix-item]"));

  const play = (group: Element) => {
    itemsOf(group).forEach((item, index) => {
      item.style.opacity = "";
      item.style.transform = "";
      item.animate([FROM, { opacity: "1", transform: "translateY(0)" }], {
        duration: 700,
        delay: index * 90,
        easing: EASE_OUT,
        fill: "backwards",
      });
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) return;
        play(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );

  groups.forEach((group) => {
    itemsOf(group).forEach((item) => Object.assign(item.style, FROM));
    observer.observe(group);
  });

  return () => {
    observer.disconnect();
    groups.forEach((group) =>
      itemsOf(group).forEach((item) => {
        item.style.opacity = "";
        item.style.transform = "";
      }),
    );
  };
}
