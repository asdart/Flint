import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const SIZE = 388;
const HUB = { x: 194, y: 194, r: 54 };
const PROFILE_R = 36;
const PROFILE_RING_R = 46;
const HUB_RING_R = 64;
const STROKE = "#F1E0D8";
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const LOAD_DELAY = 0.45;
const CENTER_DUR = 0.4;
const PROFILE_STAGGER = 0.1;
const PROFILE_DUR = 0.85;
const LINE_DUR = 0.4;
const PROFILE_START = LOAD_DELAY + CENTER_DUR;
const PROFILE_COUNT = 8;
const FACES_DONE =
  PROFILE_START + (PROFILE_COUNT - 1) * PROFILE_STAGGER + PROFILE_DUR;
const LINE_START = FACES_DONE;
const ORBIT_DUR = 48;
const ORBIT_START = LINE_START + LINE_DUR + 0.15;

type Profile = {
  src: string;
  x: number;
  y: number;
  img: { width: number; height: number; left: number; top: number };
};

/** Clockwise from 12 o'clock — Figma 5543:983 / 5568:26769 */
const PROFILES: Profile[] = [
  {
    src: "/assets/network/portrait-01.png",
    x: 194,
    y: 46,
    img: { width: 150, height: 187, left: -39, top: -14 },
  },
  {
    src: "/assets/network/portrait-05.png",
    x: 298.65,
    y: 89.35,
    img: { width: 150, height: 187, left: -39, top: -14 },
  },
  {
    src: "/assets/network/portrait-03.png",
    x: 342,
    y: 194,
    img: { width: 157, height: 195, left: -42, top: 0 },
  },
  {
    src: "/assets/network/portrait-07.png",
    x: 298.65,
    y: 298.65,
    img: { width: 115, height: 115, left: -20.65, top: -5.65 },
  },
  {
    src: "/assets/network/portrait-02.png",
    x: 194,
    y: 342,
    img: { width: 150, height: 187, left: -39, top: -6 },
  },
  {
    src: "/assets/network/portrait-06.png",
    x: 89.35,
    y: 298.65,
    img: { width: 134, height: 167, left: -29.35, top: -11.65 },
  },
  {
    src: "/assets/network/portrait-04.png",
    x: 46,
    y: 194,
    img: { width: 150, height: 187, left: -39, top: -5 },
  },
  {
    src: "/assets/network/portrait-08.png",
    x: 89.35,
    y: 89.35,
    img: { width: 185, height: 231, left: -59.35, top: -7.35 },
  },
];

function radialOffset(x: number, y: number, distance: number) {
  const dx = x - HUB.x;
  const dy = y - HUB.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: (dx / len) * distance, y: (dy / len) * distance };
}

function lineGeometry(x: number, y: number) {
  const dx = x - HUB.x;
  const dy = y - HUB.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const start = HUB_RING_R;
  const end = len - PROFILE_R - 10;
  return {
    x1: HUB.x + ux * start,
    y1: HUB.y + uy * start,
    x2: HUB.x + ux * end,
    y2: HUB.y + uy * end,
  };
}

export default function NetworkIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);
  const orbit = Boolean(play && !reduceMotion);

  const orbitTransition = {
    duration: ORBIT_DUR,
    ease: "linear" as const,
    repeat: Infinity,
    delay: reduceMotion ? 0 : ORBIT_START,
  };

  return (
    <IllustrationPanel>
      <div ref={ref} className="absolute left-24 top-[154px] size-[388px]">
          <svg
            className="pointer-events-none absolute inset-0 size-full"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            fill="none"
            aria-hidden
          >
            <motion.circle
              cx={HUB.x}
              cy={HUB.y}
              r={HUB_RING_R}
              stroke={STROKE}
              strokeWidth={1}
              strokeLinecap="round"
              fill="none"
              strokeDasharray="2 3"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={play ? { opacity: 1 } : { opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : LINE_DUR,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : LINE_START,
              }}
            />

            <g transform={`translate(${HUB.x} ${HUB.y})`}>
              <motion.g
                animate={orbit ? { rotate: 360 } : { rotate: 0 }}
                transition={orbitTransition}
              >
                <g transform={`translate(${-HUB.x} ${-HUB.y})`}>
                  {PROFILES.map((profile, i) => {
                    const { x1, y1, x2, y2 } = lineGeometry(profile.x, profile.y);
                    return (
                      <motion.line
                        key={`line-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={STROKE}
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeDasharray="2 3"
                        initial={{ opacity: reduceMotion ? 1 : 0 }}
                        animate={play ? { opacity: 1 } : { opacity: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : LINE_DUR,
                          ease: EASE_OUT,
                          delay: reduceMotion ? 0 : LINE_START,
                        }}
                      />
                    );
                  })}

                  {PROFILES.map((profile, i) => (
                    <motion.circle
                      key={`ring-${i}`}
                      cx={profile.x}
                      cy={profile.y}
                      r={PROFILE_RING_R}
                      stroke={STROKE}
                      strokeWidth={1}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="2 3"
                      initial={{ opacity: reduceMotion ? 1 : 0 }}
                      animate={play ? { opacity: 1 } : { opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : LINE_DUR,
                        ease: EASE_OUT,
                        delay: reduceMotion ? 0 : LINE_START,
                      }}
                    />
                  ))}
                </g>
              </motion.g>
            </g>
          </svg>

          <motion.div
            className="absolute"
            style={{ left: HUB.x, top: HUB.y, width: 0, height: 0 }}
            animate={orbit ? { rotate: 360 } : { rotate: 0 }}
            transition={orbitTransition}
          >
            {PROFILES.map((profile, i) => {
              const offset = radialOffset(profile.x, profile.y, 48);
              const delay = PROFILE_START + i * PROFILE_STAGGER;
              return (
                <motion.div
                  key={`profile-${i}`}
                  className="absolute overflow-clip rounded-full"
                  style={{
                    left: profile.x - HUB.x - PROFILE_R,
                    top: profile.y - HUB.y - PROFILE_R,
                    width: PROFILE_R * 2,
                    height: PROFILE_R * 2,
                    backgroundColor: STROKE,
                  }}
                  initial={
                    reduceMotion
                      ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
                      : {
                          opacity: 0,
                          scale: 0.75,
                          x: offset.x,
                          y: offset.y,
                          filter: "blur(6px)",
                        }
                  }
                  animate={
                    play
                      ? {
                          opacity: 1,
                          scale: reduceMotion ? 1 : [0.75, 1.05, 1],
                          x: 0,
                          y: 0,
                          filter: "blur(0px)",
                        }
                      : undefined
                  }
                  transition={{
                    duration: reduceMotion ? 0 : PROFILE_DUR,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : delay,
                    scale: {
                      duration: reduceMotion ? 0 : PROFILE_DUR,
                      ease: EASE_OUT,
                      delay: reduceMotion ? 0 : delay,
                      times: [0, 0.72, 1],
                    },
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={orbit ? { rotate: -360 } : { rotate: 0 }}
                    transition={orbitTransition}
                  >
                    <img
                      src={profile.src}
                      alt=""
                      className="pointer-events-none absolute max-w-none object-cover"
                      style={{
                        width: profile.img.width,
                        height: profile.img.height,
                        left: profile.img.left,
                        top: profile.img.top,
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="absolute flex size-[108px] items-center justify-center rounded-full bg-brand"
            style={{ left: HUB.x - HUB.r, top: HUB.y - HUB.r }}
            initial={
              reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
            }
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : CENTER_DUR,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LOAD_DELAY,
            }}
          >
            <motion.img
              src="/assets/how-it-works/hub-people.svg"
              alt=""
              width={32}
              height={32}
              className="size-8"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={play ? { opacity: 1 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : LOAD_DELAY + 0.15,
              }}
            />
          </motion.div>
      </div>
    </IllustrationPanel>
  );
}
