import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STROKE = "#EAD0C3";
const LOAD_DELAY = 0.4;
const RING_DUR = 0.45;
const NODE_START = LOAD_DELAY + RING_DUR;
const NODE_STAGGER = 0.11;
const NODE_DUR = 0.6;

const CENTER = { x: 286, y: 348 };

type CpNode = {
  x: number;
  y: number;
  icon: string;
  center?: boolean;
};

// Hexagon around CENTER (radius 152), starting at top going clockwise.
const NODES: CpNode[] = [
  { x: 286, y: 196, icon: "/assets/how-flint-works/cp-doc.svg", center: true },
  { x: 417.6, y: 272, icon: "/assets/how-flint-works/cp-topright.svg" },
  { x: 417.6, y: 424, icon: "/assets/how-flint-works/cp-bottomright.svg" },
  { x: 286, y: 500, icon: "/assets/how-flint-works/cp-bottom.svg" },
  { x: 154.4, y: 424, icon: "/assets/how-flint-works/cp-bottomleft.svg" },
  { x: 154.4, y: 272, icon: "/assets/how-flint-works/cp-topleft.svg" },
];

const AVATARS = [
  { src: "/assets/how-flint-works/cp-avatar-1.png", x: 262, y: 348 },
  { src: "/assets/how-flint-works/cp-avatar-2.png", x: 318, y: 348 },
];

export default function CasePrepIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  return (
    <IllustrationPanel>
      <div ref={ref} className="absolute inset-0">
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          width={580}
          height={696}
          viewBox="0 0 580 696"
          fill="none"
          aria-hidden
        >
          <motion.circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={148}
            stroke={STROKE}
            strokeWidth={1}
            fill="none"
            strokeDasharray="2 4"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{ duration: reduceMotion ? 0 : RING_DUR, ease: EASE_OUT, delay: reduceMotion ? 0 : LOAD_DELAY }}
          />
        </svg>

        <p
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] leading-4 text-ink"
          style={{ top: 132 }}
        >
          Case preparation
        </p>

        {/* Center avatars */}
        {AVATARS.map((avatar, i) => (
          <motion.div
            key={avatar.src}
            className="absolute size-16 overflow-clip rounded-full border-2 border-tertiary bg-tertiary"
            style={{ left: avatar.x - 32, top: avatar.y - 32, zIndex: 5 + i }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : NODE_START + 0.15 + i * 0.08,
            }}
          >
            <img src={avatar.src} alt="" className="size-full object-cover" />
          </motion.div>
        ))}

        {/* Icon nodes */}
        {NODES.map((node, i) => (
          <motion.div
            key={node.icon}
            className={`absolute flex size-[72px] items-center justify-center rounded-full bg-tertiary ${
              node.center ? "border border-brand" : "border border-dashed"
            }`}
            style={{
              left: node.x - 36,
              top: node.y - 36,
              borderColor: node.center ? undefined : STROKE,
            }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : NODE_DUR,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : NODE_START + i * NODE_STAGGER,
            }}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-white">
              <img src={node.icon} alt="" className="size-6" />
            </div>
          </motion.div>
        ))}
      </div>
    </IllustrationPanel>
  );
}
