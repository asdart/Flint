import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.35;

const CHART_STROKE =
  "M1.5 1.5H43.9681C50.2293 1.5 55.7293 5.65736 57.4372 11.6811L62.5262 29.6302C64.2341 35.654 69.7341 39.8113 75.9953 39.8113H147.921C151.29 39.8113 154.546 41.0263 157.092 43.2332L195.604 76.6224C198.119 78.8026 201.328 80.0155 204.656 80.0438L265.752 80.5629H276.036C282.369 80.5629 287.914 84.8145 289.557 90.9309L297.5 120.5";

export default function CostSavingsIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  return (
    <IllustrationPanel tone="brand" flower="left">
      <div ref={ref} className="absolute inset-0">
        {/* Stacked cards behind */}
        <motion.div
          className="absolute left-1/2 top-[calc(50%+72.5px)] h-[209px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white opacity-40"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={play ? { opacity: 0.4, y: 0, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY }}
        />
        <motion.div
          className="absolute left-1/2 top-[calc(50%+30.5px)] h-[257px] w-[296px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[#fbfbfc]"
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : LOAD_DELAY + 0.08,
          }}
        />

        {/* Main chart card */}
        <motion.div
          className="absolute left-[110px] top-[170px] h-[318px] w-[360px] rounded-[32px] bg-white"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.55,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : LOAD_DELAY + 0.16,
          }}
        >
          <p className="absolute left-8 top-8 whitespace-nowrap text-[14px] leading-5 text-subtle">
            Register nurse cost
          </p>

          <div className="absolute left-8 top-24 h-[119px] w-[296px]">
            <motion.img
              src="/assets/how-it-works/chart-fill.svg"
              alt=""
              className="absolute inset-0 size-full"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={play ? { opacity: 1 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : LOAD_DELAY + 0.85,
              }}
            />
            <svg
              className="absolute inset-0 overflow-visible"
              width={296}
              height={119}
              viewBox="0 0 299 122"
              fill="none"
              aria-hidden
            >
              <motion.path
                d={CHART_STROKE}
                stroke="#44386D"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
                animate={play ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{
                  pathLength: {
                    duration: reduceMotion ? 0 : 1.1,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : LOAD_DELAY + 0.45,
                  },
                  opacity: {
                    duration: reduceMotion ? 0 : 0.2,
                    delay: reduceMotion ? 0 : LOAD_DELAY + 0.45,
                  },
                }}
              />
              <motion.circle
                cx={4}
                cy={4}
                r={4}
                fill="#44386D"
                initial={{ opacity: reduceMotion ? 1 : 0, scale: 0 }}
                animate={play ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: EASE_OUT,
                  delay: reduceMotion ? 0 : LOAD_DELAY + 0.5,
                }}
              />
              <motion.circle
                cx={295}
                cy={118}
                r={4}
                fill="#44386D"
                initial={{ opacity: reduceMotion ? 1 : 0, scale: 0 }}
                animate={play ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: EASE_OUT,
                  delay: reduceMotion ? 0 : LOAD_DELAY + 1.45,
                }}
              />
            </svg>
          </div>

          <motion.div
            className="absolute left-1/2 top-[216px] h-px w-[296px] -translate-x-1/2 border-t border-dashed border-stone-100"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              delay: reduceMotion ? 0 : LOAD_DELAY + 0.4,
            }}
          />

          <motion.div
            className="absolute left-8 top-[232px]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LOAD_DELAY + 1.55,
            }}
          >
            <p className="text-[14px] leading-5 text-subtle">Saved this month</p>
            <p className="text-[24px] leading-8 text-ink">$60,000</p>
          </motion.div>

          <motion.div
            className="absolute left-[262px] top-[258px] flex items-center gap-[3px] rounded-full bg-[rgba(5,175,107,0.1)] px-1 py-0.5"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LOAD_DELAY + 1.7,
            }}
          >
            <img
              src="/assets/how-it-works/arrow-down.svg"
              alt=""
              width={20}
              height={20}
              className="size-5 rotate-180"
            />
            <span className="text-[16px] leading-6 text-[#04804e]">60%</span>
          </motion.div>
        </motion.div>
      </div>
    </IllustrationPanel>
  );
}
