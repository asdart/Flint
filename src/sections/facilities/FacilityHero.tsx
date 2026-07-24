import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ApplyButton from "../../components/ApplyButton";
import ProximityOrbit from "../../components/ProximityOrbit";
import { NAV_LINKS } from "../../nav";

const ORBIT_PEOPLE = [
  // 01 — East Asian woman
  { name: "Maria Santos", role: "RN", location: "Minnesota", flag: "/assets/flags/ph.svg" },
  // 02 — Latino man
  { name: "Diego Hernández", role: "ER RN", location: "Texas", flag: "/assets/flags/mx.svg" },
  // 03 — East Asian woman
  { name: "Linh Nguyen", role: "Med-Surg RN", location: "Wisconsin", flag: "/assets/flags/vn.svg" },
  // 04 — Southeast Asian woman
  { name: "Putri Wijaya", role: "LPN", location: "North Dakota", flag: "/assets/flags/id.svg" },
  // 05 — South Asian man
  { name: "Arjun Patel", role: "ICU RN", location: "Ohio", flag: "/assets/flags/in.svg" },
  // 06 — Black African woman
  { name: "Amara Okafor", role: "Oncology RN", location: "Georgia", flag: "/assets/flags/ng.svg" },
  // 07 — Middle Eastern woman
  { name: "Layla Haddad", role: "OR RN", location: "Michigan", flag: "/assets/flags/lb.svg" },
  // 08 — East African man
  { name: "Samuel Tesfaye", role: "CNA", location: "South Dakota", flag: "/assets/flags/et.svg" },
  // 09 — Latina woman
  { name: "Valentina Rojas", role: "L&D RN", location: "Florida", flag: "/assets/flags/co.svg" },
  // 10 — Northern European man
  { name: "Ryan Mitchell", role: "Cardiac RN", location: "Colorado", flag: "/assets/flags/ca.svg" },
  // 11 — North African / Middle Eastern man
  { name: "Omar Hassan", role: "CCRN", location: "Illinois", flag: "/assets/flags/eg.svg" },
  // 12 — Persian / Middle Eastern woman
  { name: "Yasmin Karimi", role: "NICU RN", location: "Washington", flag: "/assets/flags/ir.svg" },
];

const ORBIT_IMAGES = ORBIT_PEOPLE.map(
  (_, i) => `/assets/candidates/orbit-${String(i + 1).padStart(2, "0")}.png`,
);

export default function FacilityHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imagesReady, setImagesReady] = useState(false);

  const handleOrbitEntered = useCallback(() => setImagesReady(true), []);

  useEffect(() => {
    if (!imagesReady) return;
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    items.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 90}ms`);
      el.classList.add("is-visible");
    });
  }, [imagesReady]);

  return (
    <section ref={sectionRef} className="flex h-svh w-full flex-col bg-white p-4">
      <div className="relative min-h-0 w-full flex-1 overflow-clip rounded-[24px] bg-brand-light">
        <Link to="/" className="absolute left-4 top-[15px] z-10">
          <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
        </Link>
        <nav className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`whitespace-nowrap transition-colors hover:text-ink ${
                link.label === "Candidates" ? "text-ink" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute right-4 top-[18px] z-10">
          <ApplyButton variant="white" reveal={false} />
        </div>

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 840, height: 840 }}
        >
          <ProximityOrbit
            images={ORBIT_IMAGES}
            tooltips={ORBIT_PEOPLE}
            orbitRadius={14}
            imageScale={4.5}
            rounded={8}
            imageFit="contain"
            speed={1}
            direction="clockwise"
            movementType="continuous"
            hoverAnimation={{ type: "speedDown", speedMultiplier: 6 }}
            animateIn
            enterStagger={100}
            enterDuration={1100}
            enterDistance={2.2}
            onEntered={handleOrbitEntered}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 flex w-[436px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 data-hero-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
              Find the right sponsored healthcare role for you
            </h1>
            <p data-hero-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps healthcare professionals on temporary status find sponsored healthcare jobs.
            </p>
          </div>
          <span data-hero-reveal className="inline-flex">
            <ApplyButton reveal={false} />
          </span>
        </div>
      </div>
    </section>
  );
}
