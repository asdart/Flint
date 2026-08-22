import { useCallback, useEffect, useRef, useState } from "react";
import ApplyButton from "../../components/ApplyButton";
import ProximityOrbit from "../../components/ProximityOrbit";
import SiteNav from "../../components/SiteNav";

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
        <SiteNav active="Candidates" layout="overlay" />

        <div
          className="absolute top-1/2 left-1/2 aspect-square w-[140%] max-w-[840px] -translate-x-1/2 -translate-y-1/2"
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

        <div className="absolute top-[58%] left-1/2 z-10 flex w-full max-w-[436px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 px-5 text-center md:top-1/2 md:gap-8">
          <div className="flex flex-col gap-4">
            <h1 data-hero-reveal className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
              Find the right sponsored healthcare role for you
            </h1>
            <p data-hero-reveal className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
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
