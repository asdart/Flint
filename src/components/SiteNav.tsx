import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ApplyButton from "./ApplyButton";
import { NAV_LINKS, type NavLabel } from "../nav";

// Every page nests the nav under 16px of section padding plus 16px of panel
// padding, so the resting bar sits 32px in from the viewport on all layouts.
const REST_OFFSET = 32;
const PILL_OFFSET = 12;
const PILL_MAX_WIDTH = 664;
const SCROLL_THRESHOLD = 24;
const SHRINK_DURATION = 0.45;
const BG_DURATION = 0.22;
const EASE = [0.22, 1, 0.36, 1] as const;
const PILL_SHADOW =
  "0px 2px 2.5px rgba(0,0,0,0.03), 0px 9px 4.5px rgba(0,0,0,0.03), 0px 19px 6px rgba(0,0,0,0.01)";

type SiteNavProps = {
  active: NavLabel;
  variant?: "light" | "dark";
  layout?: "bar" | "overlay";
  cta?: ReactNode;
};

function MenuIcon({ open, light }: { open: boolean; light: boolean }) {
  const bar = light ? "bg-ink" : "bg-white";
  return (
    <span className="relative block size-5" aria-hidden>
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full transition-[transform,background-color] duration-200 ${bar} ${
          open ? "top-2 rotate-45" : "top-1"
        }`}
      />
      <span
        className={`absolute top-2 left-0 h-0.5 w-5 rounded-full transition-[opacity,background-color] duration-200 ${bar} ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full transition-[transform,background-color] duration-200 ${bar} ${
          open ? "top-2 -rotate-45" : "top-3.5"
        }`}
      />
    </span>
  );
}

export default function SiteNav({
  active,
  variant = "light",
  layout = "bar",
  cta,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const [viewport, setViewport] = useState(() =>
    typeof document === "undefined" ? 0 : document.documentElement.clientWidth,
  );
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Light treatment (dark wordmark / links) only after the white pill is on.
  const light = variant === "light" || showPill;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const measure = () => setViewport(document.documentElement.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reduceMotion || !scrolled) {
      setShowPill(scrolled);
      return;
    }
    const id = window.setTimeout(() => setShowPill(true), SHRINK_DURATION * 720);
    return () => window.clearTimeout(id);
  }, [scrolled, reduceMotion]);

  const restWidth = Math.max(viewport - REST_OFFSET * 2, 0);
  const pillWidth = Math.min(PILL_MAX_WIDTH, restWidth);
  const motionDuration = reduceMotion ? 0 : undefined;
  const shrinkTransition = {
    duration: motionDuration ?? SHRINK_DURATION,
    // Expand only after the white pill has faded out.
    delay: reduceMotion || scrolled ? 0 : BG_DURATION,
    ease: EASE,
  };

  const linkIdle = light ? "text-subtle hover:text-ink" : "text-white/60 hover:text-white";
  const linkActive = light ? "text-ink" : "text-white";
  const restApply = cta ?? <ApplyButton variant="white" reveal={false} />;
  const pillApply = <ApplyButton variant="gradient" size="sm" reveal={false} />;
  const apply = (
    <span className="inline-grid">
      <span
        className={`transition-opacity duration-300 [grid-area:1/1] ${
          showPill ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {restApply}
      </span>
      <span
        className={`transition-opacity duration-300 [grid-area:1/1] ${
          showPill ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {pillApply}
      </span>
    </span>
  );

  const bar = (
    <motion.div
      className="fixed left-1/2 z-40 flex items-center justify-between rounded-full"
      style={{ x: "-50%" }}
      initial={false}
      animate={{
        top: scrolled ? PILL_OFFSET : REST_OFFSET,
        width: scrolled ? pillWidth : restWidth,
        paddingLeft: scrolled ? 20 : 0,
        paddingRight: scrolled ? 8 : 0,
        paddingTop: scrolled ? 8 : 0,
        paddingBottom: scrolled ? 8 : 0,
      }}
      transition={shrinkTransition}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-white"
        style={{ boxShadow: PILL_SHADOW }}
        initial={false}
        animate={{ opacity: showPill ? 1 : 0 }}
        transition={{
          duration: motionDuration ?? BG_DURATION,
          ease: "easeOut",
        }}
      />

      <Link to="/" className="relative z-20 h-6 w-[49px] shrink-0" onClick={() => setOpen(false)}>
        <img src="/assets/wordmark.svg" alt="Flint" className="absolute inset-0 size-full" />
        <img
          src="/assets/wordmark-white.svg"
          alt=""
          aria-hidden
          className={`absolute inset-0 size-full transition-opacity duration-300 ${
            light ? "opacity-0" : "opacity-100"
          }`}
        />
      </Link>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`whitespace-nowrap transition-colors ${
              link.label === active ? linkActive : linkIdle
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="relative z-20 flex items-center gap-2">
        <span className="hidden sm:inline-flex">{apply}</span>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <MenuIcon open={open} light={light} />
        </button>
      </div>
    </motion.div>
  );

  const menu = open ? (
    <div className="fixed inset-0 z-50 flex flex-col bg-white px-6 py-4 lg:hidden">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
        </Link>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <MenuIcon open light />
        </button>
      </div>
      <nav className="mt-10 flex flex-col gap-5 font-serif text-[28px] leading-9 tracking-[-0.56px] text-ink sm:text-[32px] sm:leading-10 sm:tracking-[-0.64px]">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            onClick={() => setOpen(false)}
            className={link.label === active ? "text-brand" : ""}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
        <ApplyButton size="lg" reveal={false} />
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Overlay layouts position the nav absolutely, so only in-flow bars need
          their vacated height reserved. */}
      {layout === "bar" ? (
        <div aria-hidden className="h-10 w-full shrink-0 lg:h-[34px]" />
      ) : null}
      {createPortal(
        <>
          {bar}
          {menu}
        </>,
        document.body,
      )}
    </>
  );
}
