import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import CarouselPagination, {
  CAROUSEL_AUTOPLAY_DELAY,
  CAROUSEL_BAR_WIDTH,
} from "../components/CarouselPagination";

type Testimonial = {
  name: string;
  location: string;
  photo: string;
  quote: string;
};

const QUOTE =
  "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.";

const TESTIMONIALS: Testimonial[] = [
  { name: "Brandon Terry", location: "Minesota", photo: "/assets/testimonial-photo-2.png", quote: QUOTE },
  { name: "Brandon Terry", location: "Minesota", photo: "/assets/testimonial-photo-1.png", quote: QUOTE },
  { name: "Brandon Terry", location: "Minesota", photo: "/assets/testimonial-photo-3.png", quote: QUOTE },
  { name: "Chrismene jones", location: "California", photo: "/assets/testimonial-photo-3.png", quote: QUOTE },
  { name: "Chrismene jones", location: "California", photo: "/assets/testimonial-photo-1.png", quote: QUOTE },
  { name: "Brandon Terry", location: "Minesota", photo: "/assets/testimonial-photo-2.png", quote: QUOTE },
  { name: "Chrismene jones", location: "California", photo: "/assets/testimonial-photo-3.png", quote: QUOTE },
];

// Native card canvas — the Card component's internal layout (photo, quote
// box, name/flag) is all positioned in these pixels; everything below scales
// that canvas down with a CSS transform rather than resizing it.
const CARD_W = 396;
const CARD_HALF = CARD_W / 2;

// Every card is 20% smaller than the original design; the centred card stays
// proportionally bigger than the rest, just scaled down by the same 20%.
const BASE_SCALE = 0.8;
const CENTER_SCALE = BASE_SCALE * 1.1;

// Gap is in visual (post-scale) pixels, and identical everywhere — including
// next to the bigger center card, even though it's wider than its neighbors.
const GAP = 24;

// The slot sitting at x = 0 — always the middle index since TESTIMONIALS.length is odd.
const CENTER_SLOT = (TESTIMONIALS.length - 1) / 2;

/**
 * Visual center offset for the slot `steps` positions away from the center.
 * The center card is wider than the rest, so the first step out accounts for
 * its half-width instead of a side card's; every step after that is between
 * two same-sized side cards.
 */
function slotOffset(steps: number) {
  if (steps === 0) return 0;
  const baseW = CARD_W * BASE_SCALE;
  let x = (CARD_W * CENTER_SCALE) / 2 + GAP + baseW / 2;
  for (let s = 2; s <= Math.abs(steps); s++) x += baseW + GAP;
  return Math.sign(steps) * x;
}

/**
 * A flat row with the active card centred. Slot count tracks the number of
 * testimonials so the outermost pair always sits fully outside the container,
 * which is where the wrap-around jump happens — off screen, so it never shows.
 */
const SLOTS = TESTIMONIALS.map((_, i) => slotOffset(i - CENTER_SLOT));

/* The quote is bottom-anchored and grows upward on hover: 104px shows three
   lines fading out, 160px shows all five. Both end 110px above the card's
   bottom edge, and the scrim over the photo deepens as it opens. */
const QUOTE_COLLAPSED = 104;
const QUOTE_EXPANDED = 160;
const QUOTE_BOTTOM = 110;
const SCRIM_REST = 0.6;
const SCRIM_HOVER = 0.9;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];
const DURATION = 0.45;
const BOUNCE_TRANSITION = {
  type: "spring" as const,
  duration: 1.4,
  bounce: 0.22,
};
const DRAG_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 500;
const DRAG_GAIN = 0.55;

function Card({ testimonial, dragging }: { testimonial: Testimonial; dragging: boolean }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const open = hovered && !dragging;

  const progress = useMotionValue(0);
  const height = useTransform(progress, [0, 1], [QUOTE_COLLAPSED, QUOTE_EXPANDED]);
  const scrim = useTransform(progress, [0, 1], [SCRIM_REST, SCRIM_HOVER]);
  // At rest the quote fades to nothing over its own height; open, the fade is
  // gone. Interpolating the gradient's end alpha lands on both exactly.
  const fade = useTransform(
    progress,
    (p) => `linear-gradient(to bottom, rgb(0 0 0 / 1) 0%, rgb(0 0 0 / ${p}) 100%)`,
  );

  useEffect(() => {
    animate(
      progress,
      open ? 1 : 0,
      reduceMotion ? { duration: 0 } : { duration: 0.45, ease: EASE_OUT },
    );
  }, [open, progress, reduceMotion]);

  return (
    <div
      className="relative h-[488px] w-[396px] overflow-clip rounded-[32px] bg-white"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-71px] h-[798px] w-[612px] -translate-x-1/2">
        <img
          src={testimonial.photo}
          alt={testimonial.name}
          draggable={false}
          className="absolute inset-0 size-full max-w-none select-none object-cover"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[61.475%] to-black" />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black"
        style={{ opacity: scrim }}
      />

      {/* The gradient is sized by this box, so it always fades to nothing
          exactly at the clip edge; overflow-hidden keeps the lines below it
          from reappearing where the mask tiles. */}
      <motion.div
        className="pointer-events-none absolute left-8 w-[338px] overflow-hidden"
        style={{ bottom: QUOTE_BOTTOM, height, maskImage: fade, WebkitMaskImage: fade }}
      >
        <p className="absolute inset-x-0 top-0 font-serif text-[24px] leading-8 tracking-[-0.48px] text-white">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </motion.div>

      <img
        src="/assets/country-flag.svg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-8 right-8 size-8 select-none"
      />
      <div className="pointer-events-none absolute bottom-8 left-8 flex flex-col gap-1">
        <p className="text-[16px] font-medium leading-6 text-white">{testimonial.name}</p>
        <p className="text-[16px] leading-6 text-white opacity-60">{testimonial.location}</p>
      </div>
    </div>
  );
}

function slotForIndex(index: number, offset: number, count: number) {
  return (((index - offset) % count) + count) % count;
}

export default function Testimonials() {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const n = TESTIMONIALS.length;
  const prevSlots = useRef(TESTIMONIALS.map((_, i) => slotForIndex(i, 0, n)));
  const dragX = useMotionValue(0);

  useEffect(() => {
    prevSlots.current = TESTIMONIALS.map((_, i) => slotForIndex(i, offset, n));
  }, [offset]);

  const goPrev = () => setOffset((o) => o - 1);
  const goNext = () => setOffset((o) => o + 1);

  // Centres the given testimonial, taking whichever direction round the loop
  // is shorter so the row never sweeps the long way.
  const goTo = (index: number) =>
    setOffset((o) => {
      const delta = (((index - CENTER_SLOT - o) % n) + n) % n;
      return o + (delta > n / 2 ? delta - n : delta);
    });

  // The pagination bar's fill *is* the autoplay clock. It advances the
  // carousel on completion and holds its position while paused, so hovering
  // freezes the countdown mid-way and resumes from there rather than restarting.
  const barProgress = useMotionValue(0);
  const fillWidth = useTransform(barProgress, [0, 1], [0, CAROUSEL_BAR_WIDTH]);

  useEffect(() => {
    barProgress.set(reduceMotion ? 1 : 0);
  }, [offset, reduceMotion, barProgress]);

  useEffect(() => {
    if (reduceMotion || paused || dragging) return;
    const controls = animate(barProgress, 1, {
      duration: (CAROUSEL_AUTOPLAY_DELAY * (1 - barProgress.get())) / 1000,
      ease: "linear",
      onComplete: goNext,
    });
    return () => controls.stop();
  }, [offset, paused, dragging, reduceMotion, barProgress]);

  const onPanStart = () => setDragging(true);

  const onPan = (_: PointerEvent, info: PanInfo) => {
    dragX.set(info.offset.x * DRAG_GAIN);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    setDragging(false);
    const { offset: panOffset, velocity } = info;
    if (panOffset.x < -DRAG_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      goNext();
    } else if (panOffset.x > DRAG_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      goPrev();
    }
    animate(dragX, 0, {
      type: "tween",
      duration: reduceMotion ? 0 : DURATION,
      ease: EASE_IN_OUT,
    });
  };

  return (
    <section className="w-full px-4 pb-4">
      <div className="relative h-[900px] w-full overflow-clip rounded-[24px] bg-tertiary md:h-[1102px]">
        <header className="absolute top-[72px] left-1/2 flex w-full max-w-[436px] -translate-x-1/2 flex-col gap-4 px-5 text-center md:top-[140px]">
          <h2 data-reveal className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
            Real stories.
            <br />
            Real impact
          </h2>
          <p data-reveal className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.
          </p>
        </header>

        <motion.div
          className="absolute top-[280px] left-0 h-[488px] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing md:top-[412px]"
          style={{ x: dragX }}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          {TESTIMONIALS.map((testimonial, i) => {
            const slotIndex = slotForIndex(i, offset, n);
            const isCenter = slotIndex === CENTER_SLOT;
            // A card that changed slot by more than half the row took the long
            // way round, i.e. it wrapped — jump it instead of flying it across.
            // Smaller multi-slot moves (from a pagination click) still animate.
            const wrap = Math.abs(slotIndex - prevSlots.current[i]) > n / 2;
            const snap = reduceMotion || wrap;
            const positionTransition = snap ? { type: "tween" as const, duration: 0 } : BOUNCE_TRANSITION;
            // Opacity settles rather than bounces — springing it would dip below
            // 60% or overshoot past 100% before landing.
            const opacityTransition = snap ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT };

            return (
              <motion.div
                key={i}
                className="absolute top-0"
                style={{ left: "50%", zIndex: isCenter ? 1 : 0 }}
                initial={false}
                animate={{
                  x: SLOTS[slotIndex] - CARD_HALF,
                  scale: isCenter ? CENTER_SCALE : BASE_SCALE,
                  opacity: isCenter ? 1 : 0.6,
                }}
                transition={{ x: positionTransition, scale: positionTransition, opacity: opacityTransition }}
              >
                <Card testimonial={testimonial} dragging={dragging} />
              </motion.div>
            );
          })}
        </motion.div>

        <div
          data-reveal
          className="absolute bottom-[80px] left-1/2 z-10 -translate-x-1/2 md:bottom-[168px]"
        >
          <CarouselPagination
            count={TESTIMONIALS.length}
            isActive={(i) => slotForIndex(i, offset, n) === CENTER_SLOT}
            onSelect={goTo}
            fillWidth={fillWidth}
            reduceMotion={reduceMotion}
            ariaLabel={(i) => `Go to testimonial ${i + 1}`}
          />
        </div>
      </div>
    </section>
  );
}
