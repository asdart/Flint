import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import CarouselPagination, {
  CAROUSEL_AUTOPLAY_DELAY,
  CAROUSEL_BAR_WIDTH,
} from "../components/CarouselPagination";

// A deck of identical notifications, ordered back-to-front. Each one sits
// lower and slightly smaller than the one in front of it, so only a ~17px
// sliver of its rounded bottom edge stays visible. `top` is measured inside
// the 296x274 stack frame; the cards behind fade their content out while
// keeping the glass surface at full strength.
const NOTIFICATIONS = [
  { top: 149.11, scale: 0.861, contentOpacity: 0.4 },
  { top: 128.44, scale: 0.917, contentOpacity: 0.6 },
  { top: 109, scale: 0.944, contentOpacity: 0.8 },
  { top: 89, scale: 1, contentOpacity: 1 },
];

function ApplicationCard() {
  return (
    <div className="relative flex h-[464px] w-[360px] shrink-0 flex-col justify-end gap-4 overflow-clip rounded-[32px] p-8">
      <img
        src="/assets/home/how-application-bg.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="relative h-[274px] w-full">
        {NOTIFICATIONS.map(({ top, scale, contentOpacity }) => {
          const isFront = scale === 1;
          return (
            <div
              key={top}
              className="absolute inset-x-0 flex h-[72px] items-center rounded-[24px] border border-white/20 px-4 shadow-[inset_0_2px_6px_rgba(255,255,255,0.25)]"
              style={{
                top,
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                background: `rgba(255,255,255,${isFront ? 0.4 : 0.16})`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="flex min-w-0 flex-1 items-center gap-3"
                style={{ opacity: contentOpacity }}
              >
                <div className="size-10 shrink-0 overflow-clip rounded-full bg-[#fee0db] shadow-[inset_0_2px_6px_rgba(255,255,255,0.25)]">
                  <img
                    src="/assets/home/how-avatar-andrew.png"
                    alt=""
                    className="size-full object-cover object-top"
                  />
                </div>
                <div className={`min-w-0 flex-1 ${isFront ? "text-ink" : "text-white"}`}>
                  <p className="truncate text-[14px] leading-5">Andrew</p>
                  <p className="truncate text-[14px] leading-5 opacity-60">Applications sent</p>
                </div>
                <div
                  className={`flex shrink-0 items-center justify-center rounded-full p-3 ${isFront ? "bg-black/10" : "bg-white/10"}`}
                >
                  <img src="/assets/home/how-send-icon.svg" alt="" className="size-[13px]" />
                </div>
              </div>
            </div>
          );
        })}
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
        className="pointer-events-none absolute left-[125px] top-[-264px] size-[505px] overflow-hidden"
        style={{
          WebkitMaskImage: "url(/assets/home/flower-mask.svg)",
          maskImage: "url(/assets/home/flower-mask.svg)",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      >
        <img
          src="/assets/home/how-bg-purple.png"
          alt=""
          className="absolute left-[-20.57px] top-0 h-[505px] w-[743px] max-w-none object-cover"
        />
      </div>

      <div className="relative min-h-0 w-full flex-1 drop-shadow-[0_14px_15.5px_rgba(0,0,0,0.03)]">
        <div className="absolute left-px top-0 flex h-[280px] w-[296px] items-center justify-center">
          <div className="-rotate-90">
            <div className="relative h-[296px] w-[280px] overflow-clip">
              <img src="/assets/home/how-ticket.svg" alt="" className="size-full" />
            </div>
          </div>
        </div>

        <p className="absolute left-[29px] top-[28px] w-[52px] text-[24px] font-medium leading-8 text-ink">
          SAN
        </p>
        <p className="absolute left-[30px] top-[58px] whitespace-nowrap text-[12px] font-medium leading-4 text-subtle">
          San Diego
        </p>
        <p className="absolute right-[28px] top-[28px] w-[52px] text-right text-[24px] font-medium leading-8 text-ink">
          MSP
        </p>
        <p className="absolute right-[28px] top-[58px] whitespace-nowrap text-right text-[12px] font-medium leading-4 text-subtle">
          Minnesota
        </p>

        <div className="absolute left-[91px] top-[47px] h-[2px] w-[36px] rounded-full bg-gradient-to-r from-brand to-transparent" />
        <div className="absolute left-[157px] top-[39px] flex size-[17.47px] items-center justify-center">
          <div className="size-[17.47px] rotate-90 overflow-clip">
            <img src="/assets/home/plane.svg" alt="" className="size-full" />
          </div>
        </div>
        <div className="absolute left-[173px] top-[47px] h-[2px] w-[36px] rotate-180 rounded-full bg-gradient-to-r from-brand to-transparent" />

        <div className="absolute left-[30px] top-[101px] h-px w-[239px] overflow-clip">
          <img src="/assets/home/how-ticket-rule.svg" alt="" className="size-full" />
        </div>

        <p className="absolute left-[29px] top-[122px] whitespace-nowrap text-[12px] font-medium leading-4 text-subtle">
          Passenger
        </p>
        <p className="absolute left-[28px] top-[136px] whitespace-nowrap text-[24px] font-medium leading-8 text-ink">
          Chrismene
        </p>
        <div className="absolute left-[245px] top-[140px] size-6 overflow-clip">
          <img src="/assets/home/how-ticket-flag.svg" alt="" className="size-full" />
        </div>

        <div className="absolute left-4 top-[197px] h-px w-[265px] overflow-clip">
          <img src="/assets/home/how-ticket-dash.svg" alt="" className="size-full" />
        </div>

        <div className="absolute left-[46px] top-[214px] h-12 w-[206px] overflow-clip">
          <img src="/assets/home/how-barcode.svg" alt="" className="size-full" />
        </div>
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

function StartWorkCard() {
  return (
    <div className="relative flex h-[464px] w-[361px] shrink-0 flex-col justify-end gap-2 overflow-clip rounded-[32px] bg-secondary px-8 pb-8">
      <img
        src="/assets/home/how-startwork-visual.png"
        alt=""
        className="pointer-events-none absolute left-0 top-0 h-[340px] w-[361px] max-w-none"
      />
      <p className="relative text-[20px] font-medium leading-7 tracking-[-0.04px] text-ink">
        Start work
      </p>
      <p className="relative text-[20px] leading-7 tracking-[-0.04px] text-ink opacity-60">
        After the probation period, immigration filing begins
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
  { Card: StartWorkCard, nativeWidth: 361 },
];

const SMALL_SIZE = { width: 360, height: 464 };
const LARGE_SIZE = { width: 398, height: 512 };

function scaleFor(nativeWidth: number, isActive: boolean) {
  const target = isActive ? LARGE_SIZE : SMALL_SIZE;
  return target.width / nativeWidth;
}

// Pagination is shared with Testimonials via CarouselPagination.
export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [trackX, setTrackX] = useState(0);
  const barProgress = useMotionValue(0);
  const fillWidth = useTransform(barProgress, [0, 1], [0, CAROUSEL_BAR_WIDTH]);

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

  useEffect(() => {
    barProgress.set(shouldReduceMotion ? 1 : 0);
  }, [active, shouldReduceMotion, barProgress]);

  useEffect(() => {
    if (shouldReduceMotion || paused) return;
    const controls = animate(barProgress, 1, {
      duration: (CAROUSEL_AUTOPLAY_DELAY * (1 - barProgress.get())) / 1000,
      ease: "linear",
      onComplete: () => setActive((a) => (a + 1) % STEPS.length),
    });
    return () => controls.stop();
  }, [active, paused, shouldReduceMotion, barProgress]);

  return (
    <section className="flex w-full flex-col items-center overflow-x-clip bg-white p-4">
      <div className="flex w-full max-w-[1200px] flex-col items-center pt-24">
        <header className="mb-12 flex w-[480px] flex-col gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            How Flint works
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
            Cards.
          </p>
        </header>
      </div>

      <div
        ref={viewportRef}
        data-reveal
        className="flex h-[512px] w-full min-w-0 items-center"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
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

      <div data-reveal className="mt-[34px] flex w-full max-w-[1200px] justify-center pb-24">
        <CarouselPagination
          count={STEPS.length}
          active={active}
          onSelect={goTo}
          fillWidth={fillWidth}
          reduceMotion={shouldReduceMotion}
          ariaLabel={(index) => `Go to step ${index + 1}`}
        />
      </div>
    </section>
  );
}
