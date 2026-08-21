import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The front notification is fully detailed (avatar, name, role, icon). The
// ones behind it are just decreasingly-sized glass slivers hinting at a
// stack of more notifications underneath — mirroring the Figma design, where
// only a thin sliver of each card behind is exposed (too thin to legibly
// show any of its own content).
const BACK_LAYERS = [
  { scale: 0.944, height: 14, radius: 20, blur: 9 },
  { scale: 0.917, height: 11, radius: 18, blur: 8 },
  { scale: 0.861, height: 8, radius: 16, blur: 7 },
];

function ApplicationCard() {
  return (
    <div className="relative flex h-[464px] w-[360px] shrink-0 flex-col justify-end overflow-clip rounded-[32px] p-8">
      <img
        src="/assets/home/how-bg-purple.png"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="relative mb-4 flex flex-col items-center">
        <div
          className="relative z-10 flex w-[296px] shrink-0 items-center gap-3 rounded-[24px] border border-white/20 px-4 py-3.5"
          style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)" }}
        >
          <div className="size-10 shrink-0 overflow-clip rounded-full bg-[#fee0db]">
            <img
              src="/assets/home/how-avatar-andrew.png"
              alt=""
              className="size-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] leading-5 text-white">Andrew</p>
            <p className="truncate text-[14px] leading-5 text-white opacity-60">
              Applications sent
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-center rounded-full bg-black/10 p-3">
            <img src="/assets/home/how-send-icon.svg" alt="" className="size-[13px]" />
          </div>
        </div>

        {BACK_LAYERS.map((layer, i) => (
          <div
            key={i}
            className="shrink-0 border border-t-0 border-white/20"
            style={{
              width: 296 * layer.scale,
              height: layer.height,
              borderRadius: `0 0 ${layer.radius}px ${layer.radius}px`,
              zIndex: BACK_LAYERS.length - i,
              background: "rgba(255,255,255,0.16)",
              backdropFilter: `blur(${layer.blur}px)`,
            }}
          />
        ))}
      </div>
      <div className="relative flex flex-col gap-2 text-white">
        <p className="text-[20px] font-medium leading-7 tracking-[-0.04px]">Send application</p>
        <p className="text-[20px] leading-7 tracking-[-0.04px] opacity-60">
          We will make sure we can help you with your immigration case.
        </p>
      </div>
    </div>
  );
}

function InterviewCard() {
  return (
    <div className="relative h-[512px] w-[398px] shrink-0 overflow-clip rounded-[32px]">
      <img
        src="/assets/home/how-interview-bg.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute left-8 top-8 h-[328px] w-[334px] overflow-clip rounded-2xl border border-black/10 bg-white/80 shadow-2xl backdrop-blur-[20px]">
        <img
          src="/assets/home/how-interview-main.jpg"
          alt=""
          className="absolute left-1.5 top-1.5 h-[280px] w-[322px] rounded-xl object-cover"
        />
        <img
          src="/assets/home/how-interview-pip.jpg"
          alt=""
          className="absolute right-3 bottom-10 size-[114px] rounded-xl border-4 border-white object-cover"
        />
        <span className="absolute bottom-12 left-4 rounded-full bg-black/20 px-2.5 py-1 text-[10px] leading-3 text-white">
          Cristine
        </span>
      </div>
      <div className="absolute right-8 bottom-8 left-8 flex flex-col gap-2 text-white">
        <p className="text-[20px] font-medium leading-7 tracking-[-0.04px]">Interview and offer</p>
        <p className="text-[20px] leading-7 tracking-[-0.04px] opacity-60">
          Apply to any facility; if successful, you&rsquo;ll get an offer.
        </p>
      </div>
    </div>
  );
}

function RelocateCard() {
  return (
    <div className="relative flex h-[464px] w-[361px] shrink-0 flex-col justify-end gap-2 overflow-clip rounded-[32px] bg-tertiary p-8">
      <div
        className="pointer-events-none absolute left-[104px] top-[-264px] size-[505px] overflow-hidden"
        style={{
          WebkitMaskImage: "url(/assets/home/flower-mask.svg)",
          maskImage: "url(/assets/home/flower-mask.svg)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <img src="/assets/home/how-bg-purple.png" alt="" className="size-full object-cover" />
      </div>
      <div className="relative mb-2 flex h-[280px] w-[296px] flex-col justify-between rounded-[24px] bg-white px-7 py-7 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[24px] font-medium leading-8 text-ink">SAN</p>
            <p className="text-[12px] font-medium leading-4 text-subtle">San Diego</p>
          </div>
          <img src="/assets/home/plane.svg" alt="" className="mt-2 size-[18px] rotate-90" />
          <div className="text-right">
            <p className="text-[24px] font-medium leading-8 text-ink">MSP</p>
            <p className="text-[12px] font-medium leading-4 text-subtle">Minnesota</p>
          </div>
        </div>
        <div className="border-t border-dashed border-stone-100" />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium leading-4 text-subtle">Passenger</p>
            <p className="text-[24px] font-medium leading-8 text-ink">Chrismene</p>
          </div>
          <img src="/assets/home/flag-ng.svg" alt="" className="size-6" />
        </div>
        <img src="/assets/home/how-barcode.svg" alt="" className="mx-auto h-12 w-[206px]" />
      </div>
      <p className="relative text-[20px] font-medium leading-7 tracking-[-0.04px] text-ink">
        Relocate
      </p>
      <p className="relative text-[20px] leading-7 tracking-[-0.04px] text-ink opacity-60">
        We help with your relocation and license transfer.
      </p>
    </div>
  );
}

// Each card's own native width as coded (used to compute the exact scale
// factor that lands on SMALL_SIZE/LARGE_SIZE below, regardless of the card's
// own intrinsic size).
const STEPS = [
  { Card: ApplicationCard, nativeWidth: 360 },
  { Card: InterviewCard, nativeWidth: 398 },
  { Card: RelocateCard, nativeWidth: 361 },
];

const SMALL_SIZE = { width: 360, height: 464 };
const LARGE_SIZE = { width: 398, height: 512 };

function scaleFor(nativeWidth: number, isActive: boolean) {
  const target = isActive ? LARGE_SIZE : SMALL_SIZE;
  return target.width / nativeWidth;
}

// How long each step stays active (and the progress bar takes to fill) in seconds.
const STEP_DURATION = 5;
const DOT_SIZE = 12;
const BAR_WIDTH = 52;

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [trackX, setTrackX] = useState(0);

  // Keep the active card centered in the viewport, re-measuring on resize so
  // it works regardless of the (differing) card widths.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const card = cardRefs.current[active];
    if (!viewport || !card) return;

    const center = () => {
      const viewportCenter = viewport.clientWidth / 2;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      setTrackX(viewportCenter - cardCenter);
    };

    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
  }, [active]);

  const goTo = (index: number) => setActive(((index % STEPS.length) + STEPS.length) % STEPS.length);

  return (
    <section className="flex w-full flex-col items-center bg-white p-4">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-12 py-24">
        <header className="flex w-[480px] flex-col gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            How Flint works
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
            Cards.
          </p>
        </header>

        <div ref={viewportRef} data-reveal className="w-full overflow-hidden">
          <motion.div
            className="flex items-center gap-8"
            animate={{ x: trackX }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {STEPS.map(({ Card, nativeWidth }, i) => (
              <motion.div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="shrink-0"
                animate={{ scale: scaleFor(nativeWidth, i === active) }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + 1}`}
                aria-current={isActive ? "step" : undefined}
                className="flex items-center py-2"
              >
                <motion.span
                  className="relative block h-3 overflow-hidden rounded-full bg-stone-100"
                  animate={{ width: isActive ? BAR_WIDTH : DOT_SIZE }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isActive &&
                    (shouldReduceMotion ? (
                      <span className="absolute inset-y-0 left-0 w-full rounded-full bg-[#373839]" />
                    ) : (
                      <motion.span
                        key={active}
                        className="absolute inset-y-0 left-0 block rounded-full bg-[#373839]"
                        initial={{ width: 0 }}
                        animate={{ width: BAR_WIDTH }}
                        transition={{ duration: STEP_DURATION, ease: "linear" }}
                        onAnimationComplete={() => setActive((a) => (a + 1) % STEPS.length)}
                      />
                    ))}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
