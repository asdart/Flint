import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.35;

const FEES = [
  "Immigration lawyer fees",
  "USCIS filing fees",
  "Green card case preparation",
  "Licensing expenses",
  "Immigration administration",
  "Relocation assistance",
];

export default function ImmigrationFeesIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  return (
    <IllustrationPanel tone="brand" flower="left">
      <div ref={ref} className="absolute inset-0">
        {/* Stacked cards behind */}
        <motion.div
          className="absolute left-1/2 top-[calc(50%+72px)] h-[209px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white/40 backdrop-blur-[10px]"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY }}
        />
        <motion.div
          className="absolute left-1/2 top-[calc(50%+31px)] h-[257px] w-[296px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white/60 backdrop-blur-[10px]"
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY + 0.08 }}
        />

        {/* Main list card */}
        <motion.div
          className="absolute left-1/2 top-[calc(50%-18px)] h-[316px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY + 0.16 }}
        >
          <div className="flex flex-col gap-3 p-8">
            {FEES.map((fee, i) => (
              <motion.div
                key={fee}
                className="flex items-center gap-3"
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={play ? { opacity: 1, x: 0 } : undefined}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  ease: EASE_OUT,
                  delay: reduceMotion ? 0 : LOAD_DELAY + 0.4 + i * 0.1,
                }}
              >
                <span className="flex items-center justify-center rounded-full bg-[rgba(5,175,107,0.1)] p-1.5">
                  <img src="/assets/how-flint-works/ic-check.svg" alt="" className="size-5" />
                </span>
                <span className="text-[16px] leading-6 text-ink">{fee}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </IllustrationPanel>
  );
}
