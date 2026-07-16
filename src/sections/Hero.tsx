import { useCallback, useEffect, useRef, useState } from "react";
import ApplyButton from "../components/ApplyButton";
import ProximityOrbit from "../components/ProximityOrbit";

const NAV_LINKS = ["Services", "Candidates", "Facility partners", "About", "Blog"];

const ORBIT_IMAGES = Array.from({ length: 10 }, (_, i) => `/assets/avatar-${String(i + 1).padStart(2, "0")}.png`);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imagesReady, setImagesReady] = useState(false);

  // Fired once the orbit has finished assembling; kicks off the text reveal.
  const handleOrbitEntered = useCallback(() => setImagesReady(true), []);

  // Stage 3: after the images assemble, reveal the hero text top-to-bottom.
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
        {/* Navbar */}
        <img src="/assets/wordmark.svg" alt="Flint" className="absolute left-4 top-[15px] h-6 w-[49px]" />
        <nav className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="whitespace-nowrap transition-colors hover:text-ink">
              {link}
            </a>
          ))}
        </nav>
        <div className="absolute right-4 top-[18px]">
          <ApplyButton variant="white" reveal={false} />
        </div>

        {/* Orbiting candidate photos (OriginKit Proximity Orbit) */}
        <div className="absolute left-1/2 top-[72px] -translate-x-1/2" style={{ width: 840, height: 840 }}>
          <ProximityOrbit
            images={ORBIT_IMAGES}
            orbitRadius={14}
            imageScale={4.5}
            rounded={8}
            imageFit="contain"
            speed={1}
            direction="clockwise"
            movementType="continuous"
            hoverAnimation={{ type: "speedUp", speedMultiplier: 1.6 }}
            animateIn
            enterStagger={100}
            enterDuration={1100}
            enterDistance={2.2}
            onEntered={handleOrbitEntered}
          />
        </div>

        {/* Headline */}
        <div className="absolute left-1/2 top-[353px] flex w-[436px] -translate-x-1/2 flex-col items-center gap-8 text-center">
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
