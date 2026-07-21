import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.35;

const CONTROLS = [
  "/assets/how-flint-works/ic-video.svg",
  "/assets/how-flint-works/ic-mic.svg",
  "/assets/how-flint-works/ic-participants.svg",
];

export default function InterviewIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  return (
    <IllustrationPanel flower="right">
      <div ref={ref} className="absolute inset-0">
        <motion.div
          className="absolute left-[50px] top-[184px] h-[361px] w-[514px]"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY }}
        >
          {/* Glass call window */}
          <div className="absolute bottom-[33px] left-0 right-[34px] top-0 overflow-clip rounded-[16px] border border-black/10 bg-white/80 shadow-[0px_37px_37px_0px_rgba(0,0,0,0.03),0px_9px_20px_0px_rgba(0,0,0,0.03)] backdrop-blur-[20px]">
            <img
              src="/assets/home/how-interview-main.jpg"
              alt=""
              className="absolute left-[9px] top-[7px] h-[280px] w-[462px] rounded-[12px] object-cover"
            />
            <span className="absolute bottom-[45px] left-[21px] rounded-full bg-black/20 px-2.5 py-1 text-[10px] leading-3 text-white">
              Cristine
            </span>

            {/* Bottom-left people icon */}
            <img
              src="/assets/how-flint-works/ic-people.svg"
              alt=""
              className="absolute bottom-[13px] left-5 size-4"
            />

            {/* Centered control cluster */}
            <div className="absolute bottom-[9px] left-1/2 flex -translate-x-1/2 items-center gap-[9px]">
              {CONTROLS.map((icon, i) => (
                <motion.img
                  key={icon}
                  src={icon}
                  alt=""
                  className="size-4"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={play ? { opacity: 1, scale: 1 } : undefined}
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : LOAD_DELAY + 0.55 + i * 0.08,
                  }}
                />
              ))}
              <motion.div
                className="flex items-center rounded-full bg-[#d63933] p-1.5"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={play ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  ease: EASE_OUT,
                  delay: reduceMotion ? 0 : LOAD_DELAY + 0.55 + CONTROLS.length * 0.08,
                }}
              >
                <img src="/assets/how-flint-works/ic-endcall.svg" alt="" className="size-3" />
              </motion.div>
            </div>
          </div>

          {/* Picture-in-picture */}
          <motion.img
            src="/assets/home/how-interview-pip.jpg"
            alt=""
            className="absolute left-[384px] top-[247px] size-[114px] rounded-[12px] border-4 border-white object-cover"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY + 0.45 }}
          />
        </motion.div>
      </div>
    </IllustrationPanel>
  );
}
