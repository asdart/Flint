import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const STATS = [
  { value: 200, suffix: "+", label: "Partner facilities" },
  { value: 23, suffix: "", label: "States supported" },
  { value: 100_000, suffix: "", label: "Vetted candidates" },
] as const;

function formatNumber(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function CountUp({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className="inline-flex items-center justify-center" aria-label={`${formatNumber(value)}${suffix}`}>
      <span className="font-serif text-[40px] leading-[44px] tracking-[-0.8px] text-ink md:text-[56px] md:leading-[64px] lg:text-[72px] lg:leading-[80px] lg:tracking-[-1.08px]">
        {formatNumber(display)}
      </span>
      {suffix ? (
        <span className="font-serif text-[32px] leading-10 tracking-[-0.48px] text-brand">{suffix}</span>
      ) : null}
    </span>
  );
}

export default function FacilityStats() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center justify-center overflow-clip rounded-[24px] bg-brand-light px-5 py-12 md:px-10 md:py-16 lg:px-[104px] lg:py-[94px]">
        <div className="grid w-full max-w-[960px] grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex w-full flex-col items-center">
              <CountUp value={stat.value} suffix={stat.suffix} />
              <p data-reveal className="text-[16px] leading-6 text-ink opacity-80 md:whitespace-nowrap md:text-[18px] md:leading-7">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
