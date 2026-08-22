import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
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
      <div className="absolute left-8 top-8 h-[328px] w-[334px] overflow-clip rounded-2xl border border-black/10 bg-white/80 shadow-[0_37px_37px_rgba(0,0,0,0.18),0_9px_20px_rgba(0,0,0,0.21)] backdrop-blur-[20px]">
        <img
          src="/assets/home/how-interview-main.jpg"
          alt=""
          className="absolute left-1.5 top-[7px] h-[280px] w-[322px] rounded-xl object-cover"
        />
        <span className="absolute left-[18px] top-[255px] rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10px] leading-3 text-white">
          Cristine
        </span>

        <div className="absolute bottom-3 left-5 size-4 overflow-clip">
          <img src="/assets/home/how-interview-ic-people.svg" alt="" className="size-full object-contain" />
        </div>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-[9px]">
          <div className="size-4 overflow-clip">
            <img src="/assets/home/how-interview-ic-video.svg" alt="" className="size-full object-contain" />
          </div>
          <div className="size-4 overflow-clip">
            <img src="/assets/home/how-interview-ic-mic.svg" alt="" className="size-full object-contain" />
          </div>
          <div className="size-4 overflow-clip">
            <img src="/assets/home/how-interview-ic-more.svg" alt="" className="size-full object-contain" />
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-[#d63933] p-1.5">
            <div className="size-3 overflow-clip">
              <img src="/assets/home/how-interview-ic-endcall.svg" alt="" className="size-full object-contain" />
            </div>
          </div>
        </div>
        <div className="absolute right-[23.5px] bottom-3 size-4 overflow-clip">
          <img src="/assets/home/how-interview-ic-expand.svg" alt="" className="size-full object-contain" />
        </div>
      </div>
      <img
        src="/assets/home/how-interview-pip.jpg"
        alt=""
        className="absolute left-[269.5px] top-[214px] size-[114px] rounded-xl border-4 border-white object-cover"
      />
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
          WebkitMaskImage: "url(/assets/home/how-ring-mask.svg)",
          maskImage: "url(/assets/home/how-ring-mask.svg)",
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

        <div className="absolute left-1/2 top-[39px] flex -translate-x-1/2 items-center gap-3">
          <div className="h-[2px] w-[36px] rounded-full bg-gradient-to-r from-brand to-transparent" />
          <div className="size-[17.47px] rotate-90 overflow-clip">
            <img src="/assets/home/plane.svg" alt="" className="size-full" />
          </div>
          <div className="h-[2px] w-[36px] rotate-180 rounded-full bg-gradient-to-r from-brand to-transparent" />
        </div>

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

function ProcessingCard() {
  return (
    <div className="relative flex h-[464px] w-[361px] shrink-0 flex-col justify-end gap-2 overflow-clip rounded-[32px] px-8 pb-8">
      <img
        src="/assets/home/how-processing-bg.jpg"
        alt=""
        className="pointer-events-none absolute left-[-13px] top-[-25px] h-[514px] w-[386px] max-w-none object-cover blur-[2px]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 from-[0.5%] to-transparent to-[39%]" />

      <div className="relative min-h-0 w-full flex-1">
        <div
          className="absolute left-5 top-[197px] h-[41px] w-[257px] rounded-[24px] border border-white/20"
          style={{
            background: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(10px)",
            boxShadow: "inset 0 2px 6px rgba(255,255,255,0.25)",
          }}
        />

        <div className="absolute left-0 top-[62px] flex w-[297px] flex-col gap-4 overflow-clip rounded-[24px] bg-white p-5 shadow-[0_14px_31px_rgba(0,0,0,0.03),0_56px_56px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium leading-5 tracking-[-0.07px] text-ink">
              Case preparation
            </p>
            <div className="flex items-center gap-1 rounded-full bg-[#fdf5f0] px-1.5 py-0.5">
              <span className="size-1 rounded-full bg-[#d6783e]" />
              <p className="text-[12px] font-medium leading-4 text-[#d6783e]">In progress</p>
            </div>
          </div>

          <div className="relative h-6 w-full">
            <div className="absolute top-1/2 right-1.5 left-1.5 h-0.5 -translate-y-1/2 bg-brand-foreground" />
            <div className="absolute top-1/2 left-1.5 h-0.5 w-[123px] -translate-y-1/2 bg-brand" />
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
              <span className="size-3 rounded-full bg-brand" />
              <span className="size-3 rounded-full bg-brand" />
              <div className="flex size-6 items-center justify-center rounded-xl border-2 border-[#d1e7da] bg-[#5aa572] p-[3px]">
                <div className="size-[18px] overflow-clip">
                  <img src="/assets/home/how-processing-check.svg" alt="" className="size-full object-contain" />
                </div>
              </div>
              <span className="size-3 rounded-full bg-brand-foreground" />
              <span className="size-3 rounded-full bg-brand-foreground" />
            </div>
          </div>

          <div className="h-px w-full overflow-clip">
            <img src="/assets/home/how-processing-dash.svg" alt="" className="size-full" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium leading-5 tracking-[-0.07px] text-ink">Amina Duarte</p>
            <div className="flex items-center">
              <div className="relative z-[1] mr-[-8px] size-8 overflow-clip rounded-full border-[1.5px] border-white bg-[#d8b09b]">
                <img
                  src="/assets/home/how-processing-avatar.png"
                  alt=""
                  className="absolute inset-0 size-full object-cover object-[center_20%]"
                />
              </div>
              <div className="size-8 overflow-clip rounded-full">
                <img src="/assets/home/how-processing-flag.png" alt="" className="size-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative text-[20px] font-medium leading-7 tracking-[-0.04px] text-white">
        Processing
      </p>
      <p className="relative text-[20px] leading-7 tracking-[-0.04px] text-white opacity-60">
        While your Green card processes you continue to work
      </p>
    </div>
  );
}

// Each card's own native size as coded. Scale is applied inside a slot whose
// width/height match the *visual* size, so the flex gap stays even next to
// the larger active card.
const STEPS = [
  { Card: ApplicationCard, nativeWidth: 360, nativeHeight: 464 },
  { Card: InterviewCard, nativeWidth: 398, nativeHeight: 512 },
  { Card: RelocateCard, nativeWidth: 361, nativeHeight: 464 },
  { Card: StartWorkCard, nativeWidth: 361, nativeHeight: 464 },
  { Card: ProcessingCard, nativeWidth: 361, nativeHeight: 464 },
];

const SMALL_SIZE = { width: 360, height: 464 };
const LARGE_SIZE = { width: 398, height: 512 };
const CARD_GAP = 32;
const CARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function scaleFor(nativeWidth: number, isActive: boolean) {
  const target = isActive ? LARGE_SIZE : SMALL_SIZE;
  return target.width / nativeWidth;
}

function trackOffset(activeIndex: number, viewportWidth: number) {
  let x = 0;
  let activeCenter = 0;
  STEPS.forEach((_, i) => {
    const width = i === activeIndex ? LARGE_SIZE.width : SMALL_SIZE.width;
    if (i === activeIndex) activeCenter = x + width / 2;
    x += width + CARD_GAP;
  });
  return viewportWidth / 2 - activeCenter;
}

// Pagination is shared with Testimonials via CarouselPagination.
export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const [trackX, setTrackX] = useState(0);
  const barProgress = useMotionValue(0);
  const fillWidth = useTransform(barProgress, [0, 1], [0, CAROUSEL_BAR_WIDTH]);
  const cardTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: CARD_EASE };

  // Center the active *visual* slot. Wrapper widths are the post-scale sizes,
  // so this stays correct as cards grow/shrink.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const center = () => setTrackX(trackOffset(active, viewport.clientWidth));

    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
  }, [active]);

  const goTo = (index: number) => setActive(((index % STEPS.length) + STEPS.length) % STEPS.length);

  useEffect(() => {
    barProgress.set(shouldReduceMotion ? 1 : 0);
  }, [active, shouldReduceMotion, barProgress]);

  useEffect(() => {
    if (shouldReduceMotion || paused || !inView) return;
    const controls = animate(barProgress, 1, {
      duration: (CAROUSEL_AUTOPLAY_DELAY * (1 - barProgress.get())) / 1000,
      ease: "linear",
      onComplete: () => setActive((a) => (a + 1) % STEPS.length),
    });
    return () => controls.stop();
  }, [active, paused, inView, shouldReduceMotion, barProgress]);

  return (
    <section
      ref={sectionRef}
      className="flex w-full flex-col items-center overflow-x-clip bg-white p-4"
    >
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
          className="flex items-center"
          style={{ gap: CARD_GAP }}
          animate={{ x: trackX }}
          transition={cardTransition}
        >
          {STEPS.map(({ Card, nativeWidth, nativeHeight }, i) => {
            const isActive = i === active;
            const target = isActive ? LARGE_SIZE : SMALL_SIZE;
            return (
              <motion.div
                key={i}
                className="relative shrink-0"
                animate={{ width: target.width, height: target.height }}
                transition={cardTransition}
              >
                <motion.div
                  className="absolute"
                  style={{
                    width: nativeWidth,
                    height: nativeHeight,
                    left: "50%",
                    top: "50%",
                    marginLeft: -nativeWidth / 2,
                    marginTop: -nativeHeight / 2,
                  }}
                  animate={{ scale: scaleFor(nativeWidth, isActive) }}
                  transition={cardTransition}
                >
                  <Card />
                </motion.div>
              </motion.div>
            );
          })}
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
