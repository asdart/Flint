import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ApplyButton from "../components/ApplyButton";

const NAV_LINKS = ["Services", "Candidates", "Facility partners", "About", "Blog"];

const CARDS = [
  { src: "/assets/home/hero-04.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-03.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-01.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-02.png", name: "Chrismene", flag: "/assets/home/flag-ht.svg" },
  { src: "/assets/home/hero-06.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-05.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
];

/** Arc slots left → right (card-center offsets from track center) */
const SLOTS = [
  { x: -682, y: 136, rotate: -26, z: 1 },
  { x: -420, y: 44, rotate: -16, z: 2 },
  { x: -145, y: 0, rotate: -6, z: 3 },
  { x: 147, y: 0, rotate: 6, z: 3 },
  { x: 433, y: 44, rotate: 16, z: 2 },
  { x: 705, y: 136, rotate: 26, z: 1 },
];

const CARD_HALF = 100;
const LOOP_SECONDS = 22;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Sample position on the arc. t ∈ [0, 1). Wraps far-right → far-left with a short fade. */
function sampleArc(t: number) {
  const n = SLOTS.length;
  const scaled = ((t % 1) + 1) % 1 * n;
  const i0 = Math.floor(scaled) % n;
  const i1 = (i0 + 1) % n;
  const f = scaled - Math.floor(scaled);
  const a = SLOTS[i0];
  const b = SLOTS[i1];

  // Edge wrap: don't travel across the stage — fade out and reappear
  if (i0 === n - 1) {
    if (f < 0.5) {
      return { x: a.x, y: a.y, rotate: a.rotate, z: a.z, opacity: 1 - f * 2 };
    }
    return { x: b.x, y: b.y, rotate: b.rotate, z: b.z, opacity: (f - 0.5) * 2 };
  }

  return {
    x: lerp(a.x, b.x, f),
    y: lerp(a.y, b.y, f),
    rotate: lerp(a.rotate, b.rotate, f),
    z: f < 0.5 ? a.z : b.z,
    opacity: 1,
  };
}

function ArcCard({
  card,
  index,
  count,
  progress,
}: {
  card: (typeof CARDS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const pose = useTransform(progress, (p) => sampleArc((index / count + p) % 1));
  const x = useTransform(pose, (v) => v.x - CARD_HALF);
  const y = useTransform(pose, (v) => v.y);
  const rotate = useTransform(pose, (v) => v.rotate);
  const opacity = useTransform(pose, (v) => v.opacity);
  const zIndex = useTransform(pose, (v) => v.z);

  return (
    <motion.div
      className="absolute top-0 origin-center"
      style={{ left: "50%", x, y, rotate, opacity, zIndex }}
    >
      <div className="relative h-[240px] w-[200px] overflow-clip rounded-[24px] bg-[#fee0db]">
        <img
          src={card.src}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-24px] h-[390px] w-[320px] max-w-none -translate-x-1/2 object-cover"
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-[32px] bg-white py-1 pl-1 pr-2.5">
          <img src={card.flag} alt="" className="size-5" />
          <span className="text-[14px] font-medium leading-5 text-brand">{card.name}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    items.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 90}ms`);
      el.classList.add("is-visible");
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(0);
      return;
    }
    const controls = animate(progress, 1, {
      duration: LOOP_SECONDS,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [progress, reduceMotion]);

  return (
    <section ref={sectionRef} className="w-full p-4">
      <div className="relative h-[848px] w-full overflow-clip rounded-[24px] bg-secondary">
        <img
          src="/assets/wordmark.svg"
          alt="Flint"
          className="absolute left-4 top-[15px] h-6 w-[49px]"
        />
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

        <div className="absolute left-1/2 top-[140px] flex w-[436px] -translate-x-1/2 flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1
              data-hero-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              Your green card pathway starts here.
            </h1>
            <p data-hero-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
              Cards.
            </p>
          </div>
          <span data-hero-reveal className="inline-flex">
            <ApplyButton reveal={false} />
          </span>
        </div>

        <div className="absolute bottom-[33px] left-4 right-2 h-[355px]" aria-hidden>
          {CARDS.map((card, i) => (
            <ArcCard
              key={card.src}
              card={card}
              index={i}
              count={CARDS.length}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
