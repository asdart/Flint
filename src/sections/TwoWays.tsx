import { Fragment, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import ApplyButton from "../components/ApplyButton";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Per-card timeline, in seconds from the moment the card scrolls into view.
   The card lands first, then the photography rises into it, then the copy. */
const AT = {
  card: 0,
  photoLead: 0.4,
  photoFollow: 0.54,
  eyebrow: 0.62,
  title: 0.72,
  body: 1,
  cta: 1.12,
};

/* Both illustrations fade into the card background. Figma exports these as
   gradient-filled SVG masks; expressed here as CSS gradients so they scale
   with the card instead of being pinned to 592x172. */
const NURSES_FADE = "linear-gradient(to bottom, #000 0%, #000 61%, transparent 100%)";
const FACILITY_FADE =
  "radial-gradient(75% 100% at 50% 0%, #000 0%, #000 48.7%, transparent 100%)";

type RevealState = {
  play: boolean;
  reduceMotion: boolean;
  /** Staggers the second card behind the first. */
  offset: number;
};

/** Words rise into place from behind a clipping mask, one after another. */
function WordReveal({
  text,
  play,
  reduceMotion,
  delay,
  stagger = 0.045,
  className,
}: Omit<RevealState, "offset"> & {
  text: string;
  delay: number;
  stagger?: number;
  className?: string;
}) {
  const words = text.split(" ");

  /* SN Pro's content area is 1.3em, so glyphs sit ~1.6px below a 24px/28px
     line box. The clip box needs bottom room or descenders get shaved off;
     `align-top` keeps the text put and the negative margin below cancels the
     extra height so the surrounding layout is unchanged. */
  return (
    <p className={`-mb-[0.12em] ${className ?? ""}`}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              className="inline-block"
              initial={reduceMotion ? false : { y: "115%" }}
              animate={play ? { y: "0%" } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.6,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : delay + i * stagger,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}

function Illustration({ fade, children }: { fade: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative h-[172px] w-full shrink-0 overflow-clip"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      {children}
    </div>
  );
}

function NursesIllustration({ play, reduceMotion, offset }: RevealState) {
  // Each figure rises out of the fade at the bottom of the frame.
  const rise = (delay: number, distance: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: distance },
    animate: play ? { opacity: 1, y: 0 } : undefined,
    transition: {
      duration: reduceMotion ? 0 : 0.8,
      ease: EASE_OUT,
      delay: reduceMotion ? 0 : offset + delay,
    },
  });

  return (
    <Illustration fade={NURSES_FADE}>
      {/* Collage laid out on Figma's 592px canvas, centred so it crops
          symmetrically on narrower cards. */}
      <div className="absolute left-1/2 top-0 h-[172px] w-[592px] -translate-x-1/2">
        <motion.img
          src="/assets/home/two-ways-nurse-right.png"
          alt=""
          className="absolute left-[312px] top-[25px] h-[211px] w-[159px] object-cover"
          {...rise(AT.photoFollow + 0.08, 52)}
        />
        <motion.img
          src="/assets/home/two-ways-nurse-left.png"
          alt=""
          className="absolute left-[60px] top-[38px] h-[311px] w-[249px] object-cover"
          {...rise(AT.photoFollow, 52)}
        />
        <motion.div
          className="absolute left-[219px] top-[122px] h-[109px] w-[124px] rounded-[50%] bg-tertiary blur-[12.55px]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={play ? { opacity: 1 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : offset + AT.photoLead + 0.15,
          }}
        />
        <motion.div
          className="absolute left-[262px] top-[122px] h-[109px] w-[124px] rounded-[50%] bg-tertiary blur-[12.55px]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={play ? { opacity: 1 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : offset + AT.photoLead + 0.15,
          }}
        />
        <motion.img
          src="/assets/home/two-ways-nurse-center.png"
          alt=""
          className="absolute left-[207px] top-[35px] h-[184px] w-[173px] object-cover"
          {...rise(AT.photoLead, 68)}
        />
      </div>
    </Illustration>
  );
}

function FacilityIllustration({ play, reduceMotion, offset }: RevealState) {
  return (
    <Illustration fade={FACILITY_FADE}>
      <motion.img
        src="/assets/home/two-ways-facility.png"
        alt=""
        className="absolute inset-x-0 -top-[49px] h-[230px] w-full rounded-[16px] object-cover"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
        animate={play ? { opacity: 1, scale: 1 } : undefined}
        transition={{
          duration: reduceMotion ? 0 : 0.95,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : offset + AT.photoLead,
        }}
      />
    </Illustration>
  );
}

type BannerProps = {
  background: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  illustration: React.ComponentType<RevealState>;
  offset?: number;
};

function Banner({
  background,
  eyebrow,
  title,
  body,
  cta,
  illustration: CardIllustration,
  offset = 0,
}: BannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion() ?? false;
  const play = Boolean(reduceMotion || inView);
  const state: RevealState = { play, reduceMotion, offset };

  return (
    <motion.div
      ref={ref}
      className={`flex flex-1 flex-col items-center justify-center overflow-clip rounded-[24px] ${background}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={play ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reduceMotion ? 0 : 0.7,
        ease: EASE_OUT,
        delay: reduceMotion ? 0 : offset + AT.card,
      }}
    >
      <CardIllustration {...state} />

      <div className="flex w-full flex-col items-center gap-6 px-12 py-8">
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <WordReveal
            text={eyebrow}
            play={play}
            reduceMotion={reduceMotion}
            delay={offset + AT.eyebrow}
            className="w-full text-[16px] leading-6 text-brand"
          />
          <WordReveal
            text={title}
            play={play}
            reduceMotion={reduceMotion}
            delay={offset + AT.title}
            className="w-full text-[24px] leading-7 tracking-[-0.48px] text-ink"
          />
          <motion.p
            className="w-full text-[16px] leading-6 text-subtle"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={play ? { opacity: 0.8, y: 0 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : offset + AT.body,
            }}
          >
            {body}
          </motion.p>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={play ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: EASE_OUT,
            delay: reduceMotion ? 0 : offset + AT.cta,
          }}
        >
          <ApplyButton variant="white" size="lg" reveal={false}>
            {cta}
          </ApplyButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function TwoWays() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full justify-center rounded-[24px] py-24">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-16 px-4">
          <header className="flex w-[436px] flex-col gap-4 text-center">
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
              One mission.
              <br />
              Two ways in.
            </h2>
            <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
              Cards.
            </p>
          </header>

          <div className="flex w-full items-stretch gap-4">
            <Banner
              background="bg-brand-light"
              eyebrow="Nurses"
              title="Not a visa. A permanent future."
              body="Flint sponsors your green card, so from day one you're building something that lasts."
              cta="Apply as nurse"
              illustration={NursesIllustration}
            />
            <Banner
              background="bg-secondary"
              eyebrow="Facilities"
              title="Retain nurses, don't rent."
              body="Flint sponsors your green card, so from day one you're building something that lasts."
              cta="Apply as facility"
              illustration={FacilityIllustration}
              offset={0.12}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
