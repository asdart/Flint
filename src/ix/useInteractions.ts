import { useEffect } from "react";
import { blurReveal } from "./blurReveal";
import { cardHover } from "./cardHover";
import { heroArc } from "./heroArc";
import { howCarousel } from "./howCarousel";
import { marquee } from "./marquee";
import { revealStagger } from "./revealStagger";
import { testimonials } from "./testimonials";
import { ticker } from "./ticker";
import { twoWays } from "./twoWays";

/*
 * Local preview of the Webflow interactions in docs/webflow/interactions.md. One function per
 * registered interaction, same trigger, target and timing. Not shipped to Webflow.
 */

type Cleanup = () => void;

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)"; // IX3 preset 11, power4.out
const EASE_POP = "cubic-bezier(0.34, 1.45, 0.64, 1)"; // IX3 preset 14, back.out
const PILL_SCROLL_OFFSET = 24;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll trigger, start "top 85%", once: fade in and move up from `y` px. */
function scrollReveal(selector: string, y: number, duration: number, easing: string): Cleanup {
  if (prefersReducedMotion()) return () => {};

  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const pending = new Set(elements);
  const from = { opacity: "0", transform: `translateY(${y}px)` };

  const play = (element: HTMLElement) => {
    pending.delete(element);
    observer.unobserve(element);
    element.style.opacity = "";
    element.style.transform = "";
    element.animate([from, { opacity: "1", transform: "translateY(0)" }], { duration, easing });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) play(element);
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );

  elements.forEach((element) => {
    Object.assign(element.style, from);
    observer.observe(element);
  });

  return () => {
    observer.disconnect();
    pending.forEach((element) => {
      element.style.opacity = "";
      element.style.transform = "";
    });
  };
}

/** ix-reveal */
const reveal = () => scrollReveal('[data-ix="reveal"]', 18, 700, EASE_OUT);

/** ix-count-in */
const countIn = () => scrollReveal(".fk-stat-value", 8, 500, EASE_POP);

/** ix-nav-pill (past 24px: add `is-pill`) and ix-nav-pill-rest (back above: remove it). */
function navPill(): Cleanup {
  const nav = document.querySelector<HTMLElement>(".fk-nav");
  if (!nav || prefersReducedMotion()) return () => {};

  const update = () => nav.classList.toggle("is-pill", window.scrollY > PILL_SCROLL_OFFSET);

  update();
  window.addEventListener("scroll", update, { passive: true });
  return () => {
    window.removeEventListener("scroll", update);
    nav.classList.remove("is-pill");
  };
}

/** ix-nav-menu (toggle opens, locks body scroll) and ix-nav-menu-close (close button reverses it). */
function navMenu(): Cleanup {
  const menu = document.querySelector<HTMLElement>(".fk-nav-menu");
  if (!menu) return () => {};

  const setOpen = (open: boolean) => {
    menu.classList.toggle("is-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (target.closest(".fk-nav-toggle")) setOpen(true);
    else if (target.closest(".fk-nav-menu-close")) setOpen(false);
  };

  document.addEventListener("click", onClick);
  return () => {
    document.removeEventListener("click", onClick);
    setOpen(false);
  };
}

/** Call once per page, after the page markup has mounted. */
export function useInteractions() {
  useEffect(() => {
    const cleanups = [
      reveal(),
      countIn(),
      navPill(),
      navMenu(),
      blurReveal(),
      revealStagger(),
      marquee(),
      cardHover(),
      twoWays(),
      ticker(),
      heroArc(),
      howCarousel(),
      testimonials(),
    ];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}
