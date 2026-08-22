import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import ApplyButton from "./ApplyButton";
import { NAV_LINKS, type NavLabel } from "../nav";

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
        className={`absolute left-0 h-0.5 w-5 rounded-full transition-transform duration-200 ${bar} ${
          open ? "top-2 rotate-45" : "top-1"
        }`}
      />
      <span
        className={`absolute top-2 left-0 h-0.5 w-5 rounded-full transition-opacity duration-200 ${bar} ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full transition-transform duration-200 ${bar} ${
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
  const location = useLocation();
  const light = variant === "light";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkIdle = light ? "text-subtle hover:text-ink" : "text-white/60 hover:text-white";
  const linkActive = light ? "text-ink" : "text-white";
  const apply = cta ?? <ApplyButton variant="white" reveal={false} />;

  const bar = (
    <div className="relative flex w-full items-center justify-between">
      <Link to="/" className="relative z-20 shrink-0" onClick={() => setOpen(false)}>
        <img
          src={light ? "/assets/wordmark.svg" : "/assets/wordmark-white.svg"}
          alt="Flint"
          className="h-6 w-[49px]"
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
    </div>
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

  if (layout === "overlay") {
    return (
      <>
        <div className="absolute inset-x-4 top-4 z-20">{bar}</div>
        {menu}
      </>
    );
  }

  return (
    <>
      <div className="relative z-20 w-full">{bar}</div>
      {menu}
    </>
  );
}
