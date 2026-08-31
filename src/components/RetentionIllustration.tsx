import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.35;
const CARD_DUR = 0.6;
const ROW_DUR = 0.45;
const ROW_STAGGER = 0.12;
const LINE_START = LOAD_DELAY + 0.45;
const LINE_DUR = 0.6;
const BADGE_START = LINE_START + 0.3;
const FACILITY_START = LINE_START + LINE_DUR;

const ART_WIDTH = 580;
const ART_HEIGHT = 696;

const CANDIDATES = [
  {
    name: "Charlette Nono",
    avatar: "/assets/how-it-works/retention-avatar-charlette.png",
    // Figma crops each portrait to the face inside the 32px circle.
    crop: { width: 54.5, height: 68, left: -13.25, top: -2 },
    tint: "bg-[#f1e0d8]",
    flag: "/assets/how-it-works/retention-flag-angola.svg",
  },
  {
    name: "Eizle",
    avatar: "/assets/how-it-works/retention-avatar-eizle.png",
    crop: { width: 51, height: 68, left: -11.5, top: -3 },
    tint: "bg-brand-foreground",
    flag: "/assets/how-it-works/retention-flag-mexico.svg",
  },
];

export default function RetentionIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  // Cards are laid out at Figma's 580x696 size, then scaled down to the panel.
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => setScale(Math.min(1, node.clientWidth / ART_WIDTH));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rise = (delay: number, duration = CARD_DUR) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: play ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: {
      duration: reduceMotion ? 0 : duration,
      ease: EASE_OUT,
      delay: reduceMotion ? 0 : delay,
    },
  });

  return (
    <IllustrationPanel>
      <div ref={ref} className="absolute inset-0">
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: ART_WIDTH, height: ART_HEIGHT, transform: `scale(${scale})` }}
        >
          {/* Dotted connector, drawn downwards from the candidates to the facility */}
          <motion.div
            className="absolute left-1/2 w-[2px] -translate-x-1/2 overflow-hidden"
            style={{ top: 266 }}
            initial={reduceMotion ? false : { height: 0 }}
            animate={play ? { height: 140 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : LINE_DUR,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : LINE_START,
            }}
            aria-hidden
          >
            <div className="flex h-[140px] w-[2px] items-center justify-center">
              <img
                src="/assets/how-it-works/retention-connector.svg"
                alt=""
                className="h-[2px] w-[140px] max-w-none rotate-90"
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute left-1/2 z-[2] flex size-10 -translate-x-1/2 items-center justify-center rounded-[20px] bg-brand"
            style={{ top: 316 }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={play ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : BADGE_START,
            }}
          >
            <img src="/assets/how-it-works/handshake.svg" alt="" className="size-5 object-contain" />
          </motion.div>

          {/* Hired candidates */}
          <motion.div
            className="absolute left-1/2 flex w-[381px] -translate-x-1/2 flex-col gap-4 overflow-clip rounded-[24px] bg-white p-5 shadow-[0_14px_31px_rgba(0,0,0,0.03),0_56px_56px_rgba(0,0,0,0.03)]"
            style={{ top: 120 }}
            {...rise(LOAD_DELAY)}
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium leading-5 tracking-[-0.07px] text-ink">
                Hired Candidates
              </p>
              <div className="flex items-center gap-1 rounded-full bg-[#fdf5f0] px-1.5 py-0.5">
                <span className="size-1 rounded-full bg-[#d6783e]" />
                <p className="text-[12px] font-medium leading-4 text-[#d6783e]">2 total</p>
              </div>
            </div>

            {CANDIDATES.map((candidate, i) => (
              <Fragment key={candidate.name}>
                {i > 0 ? (
                  <img
                    src="/assets/how-it-works/retention-divider.svg"
                    alt=""
                    className="h-px w-full"
                  />
                ) : null}
                <motion.div
                  className="flex items-center justify-between"
                  {...rise(LOAD_DELAY + 0.25 + i * ROW_STAGGER, ROW_DUR)}
                >
                  <p className="text-[14px] leading-5 tracking-[-0.07px] text-subtle">
                    {candidate.name}
                  </p>
                  <div className="flex items-center">
                    <div
                      className={`relative z-[2] mr-[-8px] size-8 overflow-clip rounded-full border-[1.5px] border-white ${candidate.tint}`}
                    >
                      <img
                        src={candidate.avatar}
                        alt=""
                        className="absolute max-w-none object-cover"
                        style={{
                          width: candidate.crop.width,
                          height: candidate.crop.height,
                          left: candidate.crop.left,
                          top: candidate.crop.top,
                        }}
                      />
                    </div>
                    <img src={candidate.flag} alt="" className="size-8 shrink-0" />
                  </div>
                </motion.div>
              </Fragment>
            ))}
          </motion.div>

          {/* Matched facility */}
          <motion.div
            className="absolute left-1/2 flex w-[381px] -translate-x-1/2 flex-col gap-4 overflow-clip rounded-[24px] bg-white px-5 pt-12 pb-5 shadow-[0_14px_31px_rgba(0,0,0,0.03),0_56px_56px_rgba(0,0,0,0.03)]"
            style={{ top: 376 }}
            {...rise(FACILITY_START)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20">
              <img
                src="/assets/how-it-works/retention-map.png"
                alt=""
                className="absolute inset-0 size-full max-w-none object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white" />
            </div>

            <motion.div
              className="relative size-12 overflow-clip rounded-lg bg-brand-light"
              {...rise(FACILITY_START + 0.18, ROW_DUR)}
            >
              <img
                src="/assets/how-it-works/retention-facility.png"
                alt=""
                className="absolute inset-0 size-full max-w-none object-cover"
              />
            </motion.div>

            <motion.div
              className="relative flex flex-col gap-1"
              {...rise(FACILITY_START + 0.28, ROW_DUR)}
            >
              <p className="text-[14px] font-medium leading-5 tracking-[-0.07px] text-ink">
                Sandstone Healthcare Center
              </p>
              <p className="text-[14px] leading-5 tracking-[-0.07px] text-subtle">
                109 Court Ave S, Sandstone, MN 55072, Estados Unidos
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </IllustrationPanel>
  );
}
