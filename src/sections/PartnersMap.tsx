import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

const STATES = [
  "New York",
  "Florida",
  "Texas",
  "Illinois",
  "Washington",
  "Nevada",
  "Massachusetts",
  "Michigan",
  "Pennsylvania",
  "Oregon",
  "Arizona",
  "Colorado",
  "Georgia",
  "Ohio",
];

const LINE = 52;
const COPIES = 4;
const STEP_MS = 2200;
const FADE = { duration: 0.45, ease: [0.42, 0, 0.58, 1] as const };

const LOOP = Array.from({ length: STATES.length * COPIES }, (_, i) => STATES[i % STATES.length]);

export default function PartnersMap() {
  // Start in the second copy so we can wrap seamlessly forever
  const [index, setIndex] = useState(STATES.length);
  const y = useMotionValue(-(STATES.length * LINE + LINE / 2));
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    let cancelled = false;
    const target = -(index * LINE + LINE / 2);

    const controls = animate(y, target, {
      type: "spring",
      duration: reduceMotion ? 0 : 0.9,
      bounce: 0.28,
      onComplete: () => {
        if (cancelled || reduceMotion) return;
        // Jump back one full cycle once we've entered the last copies
        if (index >= STATES.length * (COPIES - 1)) {
          const resetIndex = index - STATES.length;
          y.set(-(resetIndex * LINE + LINE / 2));
          setIndex(resetIndex);
        }
      },
    });

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [index, reduceMotion, y]);

  return (
    <section className="w-full p-4">
      <div className="relative h-[680px] w-full overflow-clip rounded-[24px] bg-tertiary">
        <img
          src="/assets/home/map-bg.jpg"
          alt=""
          className="absolute inset-0 size-full scale-105 object-cover blur-[3px]"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-full items-center">
            <p className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-white whitespace-nowrap">
              Our partners are in
            </p>

            <div
              className="relative h-full w-[340px] overflow-hidden pl-5"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 38%, black 62%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 38%, black 62%, transparent 100%)",
              }}
            >
              <motion.div style={{ y }} className="absolute left-5 top-1/2 flex flex-col">
                {LOOP.map((state, i) => (
                  <motion.p
                    key={`${state}-${i}`}
                    className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-white whitespace-nowrap"
                    style={{ height: LINE }}
                    initial={false}
                    animate={{ opacity: i === index ? 1 : 0.2 }}
                    transition={reduceMotion ? { duration: 0 } : FADE}
                  >
                    {state}
                  </motion.p>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
