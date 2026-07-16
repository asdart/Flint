import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "framer-motion";

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
    <section ref={sectionRef} className="flex h-[360px] w-full flex-col bg-white px-4 pb-4">
      <div className="relative flex flex-1 items-center justify-center overflow-clip rounded-[24px] bg-tertiary">
        <Flower
          className="absolute -right-[210px] -top-[274px] size-[458px]"
          style={{ y: shouldReduceMotion ? 0 : topFlowerY }}
        />
        <Flower
          className="absolute -left-[255px] top-[124px] size-[458px] rotate-90"
          style={{ y: shouldReduceMotion ? 0 : bottomFlowerY }}
        />
        <div className="flex w-full max-w-[960px] items-center justify-between text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex w-[227px] flex-col items-center text-ink">
              <p data-reveal className="font-serif text-[72px] leading-[80px] tracking-[-1.08px]">{stat.value}</p>
              <p data-reveal className="whitespace-nowrap text-[18px] leading-7 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
