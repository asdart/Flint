import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const STROKE = "#F1E0D8";
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.4;
const CENTER_DUR = 0.4;
const NODE_DUR = 0.75;
const NODE_STAGGER = 0.12;
const NODE_START = LOAD_DELAY + CENTER_DUR;
const NODES_DONE = NODE_START + 3 * NODE_STAGGER + NODE_DUR;
const LINE_START = NODES_DONE;
const LINE_DUR = 0.4;

const HUB = { x: 290, y: 348, r: 54 };
const HUB_RING_R = 64;

type Node = {
  kind: "face" | "facility";
  x: number;
  y: number;
  r: number;
  ringR: number;
  src?: string;
  img?: { width: number; height: number; left: number; top: number };
};

const NODES: Node[] = [
  {
    kind: "face",
    x: 290,
    y: 216,
    r: 36,
    ringR: 44,
    src: "/assets/network/portrait-08.png",
    img: { width: 185, height: 231, left: -56.35, top: -7.35 },
  },
  {
    kind: "face",
    x: 194,
    y: 242,
    r: 29,
    ringR: 36,
    src: "/assets/network/portrait-02.png",
    img: { width: 136, height: 170, left: -38, top: -7 },
  },
  {
    kind: "face",
    x: 386,
    y: 242,
    r: 29,
    ringR: 36,
    src: "/assets/network/portrait-07.png",
    img: { width: 84, height: 105, left: -14, top: -4 },
  },
  {
    kind: "facility",
    x: 290,
    y: 480,
    r: 36,
    ringR: 44,
  },
];

function lineGeometry(node: Node) {
  const dx = node.x - HUB.x;
  const dy = node.y - HUB.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const start = HUB_RING_R;
  const end = len - node.r - 8;
  return {
    x1: HUB.x + ux * start,
    y1: HUB.y + uy * start,
    x2: HUB.x + ux * end,
    y2: HUB.y + uy * end,
  };
}

export default function RetentionIllustration() {
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
            cx={HUB.x}
            cy={HUB.y}
            r={HUB_RING_R}
            stroke={STROKE}
            strokeWidth={1}
            fill="none"
            strokeDasharray="2 3"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : LINE_DUR,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LINE_START,
            }}
          />

          {NODES.map((node, i) => {
            const { x1, y1, x2, y2 } = lineGeometry(node);
            return (
              <g key={`connectors-${i}`}>
                <motion.line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={STROKE}
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={play ? { opacity: 1 } : undefined}
                  transition={{
                    duration: reduceMotion ? 0 : LINE_DUR,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : LINE_START,
                  }}
                />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.ringR}
                  stroke={STROKE}
                  strokeWidth={1}
                  fill="none"
                  strokeDasharray="2 3"
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={play ? { opacity: 1 } : undefined}
                  transition={{
                    duration: reduceMotion ? 0 : LINE_DUR,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : LINE_START,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {NODES.map((node, i) => {
          const delay = NODE_START + i * NODE_STAGGER;
          const fromY = node.y < HUB.y ? -36 : 36;
          return (
            <motion.div
              key={`node-${i}`}
              className="absolute overflow-clip rounded-full"
              style={{
                left: node.x - node.r,
                top: node.y - node.r,
                width: node.r * 2,
                height: node.r * 2,
                backgroundColor: node.kind === "facility" ? "#ffffff" : STROKE,
              }}
              initial={
                reduceMotion
                  ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, scale: 0.8, y: fromY, filter: "blur(5px)" }
              }
              animate={
                play
                  ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                  : undefined
              }
              transition={{
                duration: reduceMotion ? 0 : NODE_DUR,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : delay,
              }}
            >
              {node.kind === "facility" ? (
                <div className="flex size-full items-center justify-center">
                  <img
                    src="/assets/how-it-works/facilities.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </div>
              ) : (
                <img
                  src={node.src}
                  alt=""
                  className="pointer-events-none absolute max-w-none object-cover"
                  style={{
                    width: node.img!.width,
                    height: node.img!.height,
                    left: node.img!.left,
                    top: node.img!.top,
                  }}
                />
              )}
            </motion.div>
          );
        })}

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
            src="/assets/how-it-works/handshake.svg"
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
