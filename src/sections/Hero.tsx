import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import ApplyButton from "../components/ApplyButton";

const NAV_LINKS = [
  { label: "Services", to: "/" },
  { label: "Candidates", to: "/" },
  { label: "Facility partners", to: "/facility-partners" },
  { label: "About", to: "/" },
  { label: "Blog", to: "/" },
];

const CARDS = [
  { src: "/assets/home/hero-04.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-03.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-01.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-02.png", name: "Chrismene", flag: "/assets/home/flag-ht.svg" },
  { src: "/assets/home/hero-06.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
  { src: "/assets/home/hero-05.png", name: "Andrew", flag: "/assets/home/flag-ng.svg" },
];

const CARD_W = 220;
const CARD_H = 264;
const CARD_HALF = CARD_W / 2;
const LOOP_SECONDS = 22;

/** Perfect circular arc — equal angle steps, symmetric about center */
const ARC_COUNT = CARDS.length;
const ARC_HALF_SPAN = 25; // degrees from center to each end (±25 → 10° steps)
const ARC_RADIUS = 1680;
const ARC_STEP = (2 * ARC_HALF_SPAN) / (ARC_COUNT - 1);
const WRAP_OUT = 140;

function poseAtAngle(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: ARC_RADIUS * Math.sin(rad),
    y: ARC_RADIUS * (1 - Math.cos(rad)),
    rotate: deg,
    z: 4 - Math.round(Math.abs(deg) / ARC_STEP),
    opacity: 1,
  };
}

/** Sample on the perfect arc. t ∈ [0, 1). Wraps far-right → far-left with continuous motion. */
function sampleArc(t: number) {
  const scaled = ((t % 1) + 1) % 1 * ARC_COUNT;

  // Wrap segment between last and first slot
  if (scaled >= ARC_COUNT - 1) {
    const f = scaled - (ARC_COUNT - 1);
    const end = poseAtAngle(ARC_HALF_SPAN);
    const start = poseAtAngle(-ARC_HALF_SPAN);

    if (f < 0.5) {
      const u = f * 2;
      return {
        x: end.x + u * WRAP_OUT,
        y: end.y + u * 48,
        rotate: end.rotate + u * 10,
        z: end.z,
        opacity: 1 - u,
      };
    }
    const u = (f - 0.5) * 2;
    return {
      x: start.x - (1 - u) * WRAP_OUT,
      y: start.y + (1 - u) * 48,
      rotate: start.rotate - (1 - u) * 10,
      z: start.z,
      opacity: u,
    };
  }

  // Continuous angle along the circle — equal spacing forever
  const angle = -ARC_HALF_SPAN + scaled * ARC_STEP;
  return poseAtAngle(angle);
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
      <div
        className="relative overflow-clip rounded-[26px] bg-[#fee0db]"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <img
          src={card.src}
          alt=""
          className="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 object-cover"
          style={{ top: -26, width: 352, height: 429 }}
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
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-reveal]"));
    items.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${i * 90}ms`);
      el.classList.add("is-visible");
    });
  }, []);

  useAnimationFrame((time) => {
    if (reduceMotion) {
      progress.set(0);
      startRef.current = null;
      return;
    }
    if (startRef.current === null) startRef.current = time;
    const elapsed = (time - startRef.current) / 1000;
    progress.set((elapsed / LOOP_SECONDS) % 1);
  });

  return (
    <section ref={sectionRef} className="w-full p-4">
      <div className="relative h-[848px] w-full overflow-clip rounded-[24px] bg-secondary">
        <Link to="/" className="absolute left-4 top-[15px]">
          <img src="/assets/wordmark.svg" alt="Flint" className="h-6 w-[49px]" />
        </Link>
        <nav className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-4 text-[14px] font-medium leading-5 text-subtle">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="whitespace-nowrap transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
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
