import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "framer-motion";
import DigitPopIn from "../components/DigitPopIn";

const STATS = [
  { value: "200+", label: "Roles placed" },
  { value: "23", label: "States with Facility Partners" },
  { value: "100,000", label: "Patients Served" },
];

function Flower({ className, style }: { className?: string; style?: MotionStyle }) {
  return (
    <motion.div
      className={className}
      style={{
        maskImage: "url(/assets/stats-mask-1.svg)",
        WebkitMaskImage: "url(/assets/stats-mask-1.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        ...style,
      }}
    >
      <img src="/assets/stats-bg.png" alt="" className="pointer-events-none size-full object-cover" />
    </motion.div>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const topFlowerY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const bottomFlowerY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="flex min-h-[320px] w-full flex-col bg-white px-4 pb-4 md:h-[360px] md:min-h-0">
      <div className="relative flex flex-1 items-center justify-center overflow-clip rounded-[24px] bg-tertiary px-5 py-12 md:px-8 md:py-0">
        <Flower
          className="absolute -right-[210px] -top-[274px] size-[458px]"
          style={{ y: shouldReduceMotion ? 0 : topFlowerY }}
        />
        <Flower
          className="absolute -left-[255px] top-[124px] size-[458px] rotate-90"
          style={{ y: shouldReduceMotion ? 0 : bottomFlowerY }}
        />
        <div className="relative z-10 grid w-full max-w-[960px] grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex w-full flex-col items-center text-ink sm:w-[227px] sm:justify-self-center">
              <p className="font-serif text-[48px] leading-[52px] tracking-[-0.72px] md:text-[72px] md:leading-[80px] md:tracking-[-1.08px]">
                <DigitPopIn value={stat.value} />
              </p>
              <p data-reveal className="text-[16px] leading-6 opacity-80 md:whitespace-nowrap md:text-[18px] md:leading-7">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
