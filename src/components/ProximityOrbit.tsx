// OriginKit · Proximity Orbit (stack: vite · styling: tailwind)
// Fetched via the OriginKit MCP and adapted for the Flint hero.
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, animate } from "framer-motion";

const FALLBACK_IMAGES = [
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/5f084e5a-2e3f-4239-be1a-5084a6dcef00/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/3b42034b-897e-456d-cb00-1f2cf0aa4700/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/c84f3e45-635f-4eaa-4e24-730098b55500/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/9652cf81-4644-4471-1122-4e40ef6e2600/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/1640f8fe-2cb1-4026-88e3-10dd0019f400/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/20fd03c3-49d6-408c-3ac9-8c5a6ed2b500/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/4b1ec233-9a09-4483-1adb-404a93094100/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/8fd4d2a3-a363-4658-d6ee-84790bc8f300/w=800",
  "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/3ad8e2bd-dc38-49ba-d186-1a5ab1428d00/w=800",
];

type ProximityOrbitProps = {
  images?: string[];
  orbitRadius?: number;
  imageScale?: number;
  imageFit?: "cover" | "contain";
  rounded?: number;
  opacity?: number;
  movementType?: "continuous" | "step";
  direction?: "clockwise" | "counterclockwise";
  speed?: number;
  stepTransition?: Record<string, unknown>;
  stackDirection?: "firstToLast" | "lastToFirst";
  hoverAnimation?: {
    type?: "none" | "pause" | "speedUp" | "speedDown";
    speedMultiplier?: number;
    scale?: number;
    opacity?: number;
  };
  /** Play a one-time "assemble" intro: images slide + fade in from outside the
   * container into their orbit positions, then the spin begins. */
  animateIn?: boolean;
  /** Delay (ms) before this ring starts assembling. */
  enterDelay?: number;
  /** Delay (ms) between each image sliding in. */
  enterStagger?: number;
  /** Duration (ms) of each image's slide-in. */
  enterDuration?: number;
  /** How far outside its final radius each image starts (multiplier). */
  enterDistance?: number;
  /** Fired once this ring has finished assembling (before/at spin start). */
  onEntered?: () => void;
  /** Optional per-image hover tooltip content (aligned to `images` order). */
  tooltips?: { name: string; role: string; flag: string; location?: string }[];
  style?: React.CSSProperties;
};

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 620
 */
export default function ProximityOrbit({
  images = [],
  orbitRadius = 12,
  imageScale = 10,
  imageFit = "cover",
  rounded = 0,
  opacity = 100,
  movementType = "continuous",
  direction = "counterclockwise",
  speed = 3,
  stepTransition = { duration: 0.5, ease: "easeInOut" },
  stackDirection = "lastToFirst",
  hoverAnimation = { type: "speedUp", speedMultiplier: 5 },
  animateIn = false,
  enterDelay = 0,
  enterStagger = 60,
  enterDuration = 700,
  enterDistance = 2.2,
  onEntered,
  tooltips = [],
  style,
}: ProximityOrbitProps) {
  const hoverType = hoverAnimation?.type ?? "none";
  const hoverSpeedMult = hoverAnimation?.speedMultiplier ?? 5;
  const hoverScaleVal = hoverAnimation?.scale ?? 1.15;
  const hoverOpacityVal = hoverAnimation?.opacity ?? 100;

  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [liveSpeedMult, setLiveSpeedMult] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const shouldAnimateIn = animateIn && !reduceMotion;
  const [entered, setEntered] = useState(!shouldAnimateIn);

  const onEnteredRef = useRef(onEntered);
  onEnteredRef.current = onEntered;
  const firedRef = useRef(false);
  const fireEntered = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onEnteredRef.current?.();
  }, []);

  // Rings that don't animate in are "entered" immediately.
  useEffect(() => {
    if (!shouldAnimateIn) {
      setEntered(true);
      fireEntered();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const stepAngleRef = useRef(0);

  const hoverTypeRef = useRef(hoverType);
  const hoverSpeedRef = useRef(hoverSpeedMult);
  const liveSpeedRef = useRef(liveSpeedMult);
  const dirMultRef = useRef(direction === "counterclockwise" ? -1 : 1);
  hoverTypeRef.current = hoverType;
  hoverSpeedRef.current = hoverSpeedMult;
  liveSpeedRef.current = liveSpeedMult;
  dirMultRef.current = direction === "counterclockwise" ? -1 : 1;

  const radiusPx = orbitRadius * 24;
  const imageSizePx = imageScale * 20;
  const borderRadiusPct = (Math.max(0, Math.min(20, rounded)) / 20) * 50;

  const imgs = Array.isArray(images) && images.length > 0 ? images : FALLBACK_IMAGES;
  const hasImages = imgs.length > 0;
  const n = hasImages ? imgs.length : 0;

  const revDurationMs = (20 / speed) * 1000;
  const stepDurationMs = n > 0 ? revDurationMs / n : revDurationMs;

  useEffect(() => {
    if (movementType !== "continuous" || !hasImages) return;
    if (!entered) return;
    if (isPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const tick = (ts) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = Math.min(ts - lastTimeRef.current, 100);
      lastTimeRef.current = ts;
      const degsPerMs = (360 / revDurationMs) * liveSpeedRef.current * dirMultRef.current;
      rotRef.current = rotRef.current + dt * degsPerMs;
      setRotation(rotRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [movementType, hasImages, revDurationMs, isPaused, entered]);

  useEffect(() => {
    if (movementType !== "step" || n === 0 || isPaused || !entered) return;

    let active = true;
    let currentAnim = null;

    const dirMult = direction === "counterclockwise" ? -1 : 1;
    const stepSize = (360 / n) * dirMult;

    const effectiveDurationMs = stepDurationMs / liveSpeedMult;
    const animMs = Math.max(effectiveDurationMs * 0.65, 150);
    const pauseMs = Math.max(effectiveDurationMs * 0.35, 100);

    function makeAnimOpts(onUpdate, onComplete) {
      const base = { onUpdate, onComplete };
      if (stepTransition?.type === "spring") {
        return {
          ...base,
          type: "spring",
          stiffness: stepTransition.stiffness ?? 100,
          damping: stepTransition.damping ?? 15,
          mass: stepTransition.mass ?? 1,
        };
      }
      return {
        ...base,
        duration: animMs / 1000,
        ease: stepTransition?.ease ?? "easeInOut",
      };
    }

    const doStep = () => {
      if (!active) return;
      const from = stepAngleRef.current;
      const to = from + stepSize;
      stepAngleRef.current = to;

      currentAnim = animate(
        from,
        to,
        makeAnimOpts(
          (v) => {
            if (active) setRotation(v);
          },
          () => {
            if (active) setTimeout(doStep, pauseMs);
          },
        ),
      );
    };

    const timer = setTimeout(doStep, pauseMs);
    return () => {
      active = false;
      clearTimeout(timer);
      if (currentAnim) currentAnim.stop();
    };
  }, [movementType, n, stepDurationMs, liveSpeedMult, isPaused, direction, stepTransition, entered]);

  const handleContainerLeave = useCallback(() => {
    setIsPaused(false);
    setLiveSpeedMult(1);
    setHoveredIndex(null);
  }, []);

  const handleImageEnter = useCallback((index) => {
    const t = hoverTypeRef.current;
    if (t === "pause") {
      setIsPaused(true);
    } else if (t === "speedUp") {
      setLiveSpeedMult(Math.max(hoverSpeedRef.current, 1));
    } else if (t === "speedDown") {
      setLiveSpeedMult(1 / Math.max(hoverSpeedRef.current, 1));
    }
    setHoveredIndex(index);
  }, []);

  const handleImageLeave = useCallback(() => {
    setIsPaused(false);
    setLiveSpeedMult(1);
    setHoveredIndex(null);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseLeave={handleContainerLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "visible",
        ...style,
      }}
    >
      {hasImages &&
        imgs.map((src, i) => {
          const baseAngle = (i / n) * 360;
          const totalAngleRad = (baseAngle + rotation) * (Math.PI / 180);
          const x = Math.cos(totalAngleRad) * radiusPx;
          const y = Math.sin(totalAngleRad) * radiusPx;

          // Assemble-in start/target positions (measured at rotation 0).
          const angle0Rad = baseAngle * (Math.PI / 180);
          const targetX = Math.cos(angle0Rad) * radiusPx;
          const targetY = Math.sin(angle0Rad) * radiusPx;
          const startX = targetX * enterDistance;
          const startY = targetY * enterDistance;

          const isHovered = hoveredIndex === i;
          const applyHover = isHovered && hoverType === "pause";

          // Scale hovered thumbnail up regardless of hover behavior type.
          const targetScale = isHovered ? hoverScaleVal : 1;
          const targetOpacity = applyHover ? hoverOpacityVal / 100 : opacity / 100;

          const baseZIndex = stackDirection === "firstToLast" ? i + 1 : n - i;
          const zIndex = isHovered ? n + 10 : baseZIndex;

          const image = (
            <motion.div
              onMouseEnter={() => handleImageEnter(i)}
              onMouseLeave={handleImageLeave}
              animate={{ opacity: targetOpacity, scale: targetScale }}
              transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
              style={{
                cursor: hoverType !== "none" ? "pointer" : "default",
                lineHeight: 0,
              }}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: imageSizePx,
                  height: imageFit === "cover" ? imageSizePx : "auto",
                  objectFit: imageFit,
                  display: "block",
                  borderRadius: `${borderRadiusPct}%`,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            </motion.div>
          );

          const info = tooltips[i];
          const tooltip = info ? (
            <motion.div
              className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2"
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 6,
                scale: isHovered ? 1 : 0.96,
              }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: n + 20 }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap rounded-[14px] border border-black/5 bg-white px-3 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
                <img src={info.flag} alt="" className="size-5 shrink-0 rounded-full" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[14px] font-medium text-ink">{info.name}</span>
                  <span className="text-[12px] text-subtle">
                    {info.location ? `${info.role} · ${info.location}` : info.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : null;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                zIndex,
                transform: "translate(-50%, -50%)",
              }}
            >
              {entered ? (
                <div style={{ position: "relative", willChange: "transform", transform: `translate(${x}px, ${y}px)` }}>
                  {image}
                  {tooltip}
                </div>
              ) : (
                <motion.div
                  initial={{ x: startX, y: startY, opacity: 0 }}
                  animate={{ x: targetX, y: targetY, opacity: 1 }}
                  transition={{
                    duration: enterDuration / 1000,
                    delay: (enterDelay + i * enterStagger) / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onAnimationComplete={
                    i === n - 1
                      ? () => {
                          setEntered(true);
                          fireEntered();
                        }
                      : undefined
                  }
                >
                  {image}
                </motion.div>
              )}
            </div>
          );
        })}
    </div>
  );
}
