import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";

type Testimonial = {
  name: string;
  location: string;
  photo: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-2.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-1.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Chrismene jones",
    location: "California",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Chrismene jones",
    location: "California",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
];

/**
 * Arc slots from Figma 5543:1034 — card-center offsets from track center.
 * Near cards sit in 538px wrappers at top:5; far cards in 578px wrappers at top:74.
 */
const SLOTS = [
  { x: -874, y: 119, rotate: -16, dimmed: true, z: 1 },
  { x: -440, y: 30, rotate: -8, dimmed: false, z: 2 },
  { x: 0, y: 0, rotate: 0, dimmed: false, z: 3 },
  { x: 448, y: 30, rotate: 8, dimmed: false, z: 2 },
  { x: 868, y: 119, rotate: 16, dimmed: true, z: 1 },
];

const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];
const DURATION = 0.45;
const BOUNCE_TRANSITION = {
  type: "spring" as const,
  duration: 0.9,
  bounce: 0.28,
};
const CARD_W = 396;
const CARD_HALF = CARD_W / 2;
const DRAG_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 500;
const DRAG_GAIN = 0.55;

function Card({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="group relative h-[488px] w-[396px] overflow-clip rounded-[32px] bg-white">
      <div className="pointer-events-none absolute left-1/2 top-[-71px] h-[798px] w-[612px] -translate-x-1/2">
        <img
          src={testimonial.photo}
          alt={testimonial.name}
          draggable={false}
          className="absolute inset-0 size-full max-w-none select-none object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[61.5%] to-black transition-opacity duration-500 group-hover:opacity-0 [[data-dragging]_&]:opacity-100" />
      <div className="invisible absolute inset-0 bg-white/90 opacity-0 backdrop-blur-[8px] transition-[opacity,visibility] duration-500 group-hover:visible group-hover:opacity-100 [[data-dragging]_&]:invisible [[data-dragging]_&]:opacity-0" />
      <div className="absolute left-[74px] top-[141px] flex w-[248px] flex-col items-center gap-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [[data-dragging]_&]:opacity-0">
        <img src="/assets/quote.svg" alt="" className="h-8 w-10" />
        <p className="w-full text-center font-serif text-[20px] leading-7 tracking-[-0.4px] text-ink">
          {testimonial.quote}
        </p>
        <img src="/assets/quote.svg" alt="" className="h-8 w-10 rotate-180" />
      </div>
      <img
        src="/assets/country-flag.svg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute right-8 bottom-8 size-8 select-none transition-opacity duration-500 group-hover:opacity-0 [[data-dragging]_&]:opacity-100"
      />
      <div className="absolute bottom-8 left-8 flex flex-col gap-1 transition-opacity duration-500 group-hover:opacity-0 [[data-dragging]_&]:opacity-100">
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
  const reduceMotion = useReducedMotion();
  const n = TESTIMONIALS.length;
  const prevSlots = useRef(TESTIMONIALS.map((_, i) => slotForIndex(i, 0, n)));
  const dragX = useMotionValue(0);

  useEffect(() => {
    prevSlots.current = TESTIMONIALS.map((_, i) => slotForIndex(i, offset, n));
  }, [offset]);

  const goPrev = () => setOffset((o) => o - 1);
  const goNext = () => setOffset((o) => o + 1);

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
      <div className="relative h-[1102px] w-full overflow-clip rounded-[24px] bg-tertiary">
        <header className="absolute left-1/2 top-[140px] flex w-[436px] -translate-x-1/2 flex-col gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            Real stories.
            <br />
            Real impact
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.
          </p>
        </header>

        <motion.div
          className="absolute top-[412px] h-[512px] w-[1384px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ left: "50%", marginLeft: -692, x: dragX }}
          {...(dragging ? { "data-dragging": true } : {})}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          {TESTIMONIALS.map((testimonial, i) => {
            const slotIndex = slotForIndex(i, offset, n);
            const slot = SLOTS[slotIndex];
            const wrap = Math.abs(prevSlots.current[i] - slotIndex) > 1;
            const transition =
              reduceMotion || wrap
                ? { type: "tween" as const, duration: 0 }
                : BOUNCE_TRANSITION;

            return (
              <motion.div
                key={i}
                className="absolute top-0 origin-center"
                style={{ left: "50%", zIndex: slot.z }}
                initial={false}
                animate={{
                  x: slot.x - CARD_HALF,
                  y: slot.y,
                  rotate: slot.rotate,
                  opacity: slot.dimmed ? 0.6 : 1,
                }}
                transition={transition}
              >
                <Card testimonial={testimonial} />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="absolute bottom-[96px] left-1/2 flex -translate-x-1/2 items-center gap-3">
          <span data-reveal className="inline-flex">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={goPrev}
              className="flex items-center justify-center rounded-[24px] bg-white p-3 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative size-5 overflow-clip">
                <img
                  src="/assets/arrow-left.svg"
                  alt=""
                  className="absolute left-1/2 top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-180"
                />
              </span>
            </button>
          </span>
          <span data-reveal className="inline-flex">
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={goNext}
              className="flex items-center justify-center rounded-[24px] bg-white p-3 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative size-5 overflow-clip">
                <img
                  src="/assets/arrow-right.svg"
                  alt=""
                  className="absolute left-1/2 top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2"
                />
              </span>
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
