import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STROKE = "#EAD0C3";
const BRAND = "#44386D";
const LOAD_DELAY = 0.4;
const RING_DUR = 0.45;
const NODE_START = LOAD_DELAY + RING_DUR;
const NODE_STAGGER = 0.11;
const NODE_DUR = 0.6;
const DRAW_DUR = 2.4;
const BORDER_DUR = 0.85;
const HOLD_DUR = 0.7;
const STEP_COUNT = 6;

const CENTER = { x: 286, y: 348 };
const RING_R = 148;
const ICON_SIZE = 72;
const ICON_C = ICON_SIZE / 2;
const ICON_R = 35.5;

type FillPhase = "idle" | "border" | "path" | "hold";

type LabelAlign = "center" | "start" | "end";

type CpNode = {
  x: number;
  y: number;
  icon: string;
  name: string;
  label: { left: number; top: number; align: LabelAlign };
  startDeg: number;
  cwPath: string;
  ccwPath: string;
};

function ringAngleCW(x: number, y: number) {
  const a = Math.atan2(y - CENTER.y, x - CENTER.x);
  let cw = a + Math.PI / 2;
  if (cw < 0) cw += Math.PI * 2;
  return cw;
}

function incomingPoint(x: number, y: number) {
  const dx = x - CENTER.x;
  const dy = y - CENTER.y;
  const d = Math.hypot(dx, dy) || 1;
  const a = (RING_R * RING_R - ICON_R * ICON_R + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, RING_R * RING_R - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const px = CENTER.x + a * ux;
  const py = CENTER.y + a * uy;
  const i1 = { x: px - h * uy, y: py + h * ux };
  const i2 = { x: px + h * uy, y: py - h * ux };
  const nodeA = ringAngleCW(x, y);
  const delta = (from: number, to: number) => {
    let gap = to - from;
    if (gap < 0) gap += Math.PI * 2;
    return gap;
  };
  return delta(ringAngleCW(i1.x, i1.y), nodeA) < delta(ringAngleCW(i2.x, i2.y), nodeA)
    ? i1
    : i2;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function semicircle(startDeg: number, clockwise: boolean) {
  const endDeg = clockwise ? startDeg + 179.9 : startDeg - 179.9;
  const s = polar(ICON_C, ICON_C, ICON_R, startDeg);
  const e = polar(ICON_C, ICON_C, ICON_R, endDeg);
  return `M ${s.x} ${s.y} A ${ICON_R} ${ICON_R} 0 0 ${clockwise ? 1 : 0} ${e.x} ${e.y}`;
}

const LABEL_GAP = 12;
const LABEL_H = 16;

function labelAbove(x: number, y: number) {
  return { left: x, top: y - ICON_C - LABEL_GAP - LABEL_H, align: "center" as const };
}

function labelBelow(x: number, y: number) {
  return { left: x, top: y + ICON_C + LABEL_GAP, align: "center" as const };
}

function labelRight(x: number, y: number) {
  return { left: x + ICON_C + LABEL_GAP, top: y - LABEL_H / 2, align: "start" as const };
}

function labelLeft(x: number, y: number) {
  return { left: x - ICON_C - LABEL_GAP, top: y - LABEL_H / 2, align: "end" as const };
}

function withArc(node: Omit<CpNode, "startDeg" | "cwPath" | "ccwPath">): CpNode {
  const hit = incomingPoint(node.x, node.y);
  const startDeg = (Math.atan2(hit.y - node.y, hit.x - node.x) * 180) / Math.PI;
  return {
    ...node,
    startDeg,
    cwPath: semicircle(startDeg, true),
    ccwPath: semicircle(startDeg, false),
  };
}

const NODES: CpNode[] = [
  withArc({
    x: 286,
    y: 196,
    icon: "/assets/how-flint-works/cp-doc.svg",
    name: "Case preparation",
    label: labelAbove(286, 196),
  }),
  withArc({
    x: 417.6,
    y: 272,
    icon: "/assets/how-flint-works/cp-topright.svg",
    name: "Legal filing",
    label: labelRight(417.6, 272),
  }),
  withArc({
    x: 417.6,
    y: 424,
    icon: "/assets/how-flint-works/cp-bottomright.svg",
    name: "USCIS filing",
    label: labelRight(417.6, 424),
  }),
  withArc({
    x: 286,
    y: 500,
    icon: "/assets/how-flint-works/cp-bottom.svg",
    name: "Relocation",
    label: labelBelow(286, 500),
  }),
  withArc({
    x: 154.4,
    y: 424,
    icon: "/assets/how-flint-works/cp-bottomleft.svg",
    name: "Visa processing",
    label: labelLeft(154.4, 424),
  }),
  withArc({
    x: 154.4,
    y: 272,
    icon: "/assets/how-flint-works/cp-topleft.svg",
    name: "Licensing",
    label: labelLeft(154.4, 272),
  }),
];

const AVATAR_ENTER = {
  duration: 0.45,
  ease: EASE_OUT,
} as const;

function iconFillState(
  index: number,
  active: number,
  phase: FillPhase,
): "idle" | "filling" | "done" {
  if (phase === "idle") return "idle";
  if (index < active) return "done";
  if (index > active) return "idle";
  if (phase === "border") return "filling";
  return "done";
}

function IconRing({
  node,
  state,
  reduceMotion,
}: {
  node: CpNode;
  state: "idle" | "filling" | "done";
  reduceMotion: boolean | null;
}) {
  const instant = Boolean(reduceMotion) || state === "done";

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={ICON_SIZE}
      height={ICON_SIZE}
      fill="none"
      aria-hidden
    >
      <circle
        cx={ICON_C}
        cy={ICON_C}
        r={ICON_R}
        stroke={STROKE}
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      {state !== "idle" ? (
        <>
          <motion.path
            d={node.cwPath}
            stroke={BRAND}
            strokeWidth={1}
            strokeLinecap="round"
            initial={{ pathLength: instant ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: instant ? 0 : BORDER_DUR,
              ease: EASE_OUT,
            }}
          />
          <motion.path
            d={node.ccwPath}
            stroke={BRAND}
            strokeWidth={1}
            strokeLinecap="round"
            initial={{ pathLength: instant ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: instant ? 0 : BORDER_DUR,
              ease: EASE_OUT,
            }}
          />
        </>
      ) : null}
    </svg>
  );
}

export default function CasePrepIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(reduceMotion ? 1 : 0);
  const [snapPath, setSnapPath] = useState(false);
  const [phase, setPhase] = useState<FillPhase>(reduceMotion ? "hold" : "idle");

  useEffect(() => {
    if (!play || reduceMotion) return;

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const introMs =
      (NODE_START + (STEP_COUNT - 1) * NODE_STAGGER + NODE_DUR) * 1000;

    const run = async () => {
      await wait(introMs);
      while (!cancelled) {
        setSnapPath(false);
        setProgress(0);
        setActive(0);
        setPhase("border");
        await wait(BORDER_DUR * 1000);
        if (cancelled) return;
        setPhase("hold");
        await wait(HOLD_DUR * 1000);

        for (let i = 0; i < STEP_COUNT; i++) {
          if (cancelled) return;
          setPhase("path");
          setProgress((i + 1) / STEP_COUNT);
          await wait(DRAW_DUR * 1000);
          if (i === STEP_COUNT - 1) break;
          if (cancelled) return;
          setActive(i + 1);
          setPhase("border");
          await wait(BORDER_DUR * 1000);
          if (cancelled) return;
          setPhase("hold");
          await wait(HOLD_DUR * 1000);
        }

        if (cancelled) return;
        await wait(HOLD_DUR * 1000);
        setSnapPath(true);
        setPhase("idle");
        setProgress(0);
        setActive(0);
        await wait(50);
      }
    };

    void run();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [play, reduceMotion]);

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
            r={RING_R}
            stroke={STROKE}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            strokeDasharray="2 4"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : RING_DUR,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LOAD_DELAY,
            }}
          />
          <motion.circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={RING_R}
            stroke={BRAND}
            strokeWidth={1}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${CENTER.x} ${CENTER.y})`}
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
            animate={play ? { pathLength: progress, opacity: 1 } : undefined}
            transition={{
              opacity: {
                duration: reduceMotion ? 0 : RING_DUR,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : LOAD_DELAY,
              },
              pathLength: {
                duration: reduceMotion || snapPath ? 0 : DRAW_DUR,
                ease: "linear",
              },
            }}
          />
        </svg>

        {/* Center avatars */}
        <div className="absolute z-[5] flex items-center" style={{ left: 233, top: 316 }}>
          <motion.div
            className="relative mr-[-12px] size-16 shrink-0 overflow-clip rounded-full bg-[#f1e0d8]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              ...AVATAR_ENTER,
              duration: reduceMotion ? 0 : AVATAR_ENTER.duration,
              delay: reduceMotion ? 0 : NODE_START + 0.15,
            }}
          >
            <div className="absolute left-[-53px] top-[-11px] flex h-[215px] w-[172px] items-center justify-center">
              <div className="-scale-y-100 rotate-180">
                <img
                  src="/assets/how-flint-works/cp-avatar-1.png"
                  alt=""
                  className="h-[215px] w-[172px] max-w-none object-cover"
                />
              </div>
            </div>
          </motion.div>
          <motion.div
            className="relative size-16 shrink-0 overflow-clip rounded-full border-2 border-tertiary bg-[#f1e0d8]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              ...AVATAR_ENTER,
              duration: reduceMotion ? 0 : AVATAR_ENTER.duration,
              delay: reduceMotion ? 0 : NODE_START + 0.23,
            }}
          >
            <div className="absolute left-[-2px] top-[-2px] flex size-[72px] items-center justify-center">
              <div className="-scale-y-100 rotate-180">
                <img
                  src="/assets/how-flint-works/cp-avatar-2.png"
                  alt=""
                  className="size-[72px] max-w-none rounded-[200px] object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Icon nodes */}
        {NODES.map((node, i) => {
          const fill = iconFillState(i, active, phase);
          return (
            <motion.div
              key={node.icon}
              className="absolute z-[6] flex size-[72px] items-center justify-center rounded-full bg-tertiary"
              style={{
                left: node.x - 36,
                top: node.y - 36,
              }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
              animate={play ? { opacity: 1, scale: 1 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : NODE_DUR,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : NODE_START + i * NODE_STAGGER,
              }}
            >
              <IconRing node={node} state={fill} reduceMotion={reduceMotion} />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-white">
                <img src={node.icon} alt="" className="size-6" />
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence mode="wait">
          <motion.div
            key={NODES[active].name}
            className={`absolute z-[7] flex h-4 w-0 whitespace-nowrap text-[12px] leading-4 text-ink ${
              NODES[active].label.align === "center"
                ? "justify-center"
                : NODES[active].label.align === "end"
                  ? "justify-end"
                  : "justify-start"
            }`}
            style={{ left: NODES[active].label.left, top: NODES[active].label.top }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE_OUT }}
          >
            {NODES[active].name}
          </motion.div>
        </AnimatePresence>
      </div>
    </IllustrationPanel>
  );
}
