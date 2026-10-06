import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import IllustrationPanel from "./IllustrationPanel";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const LOAD_DELAY = 0.35;
const CARD_W = 346;
const CARD_H = 72;
const STACK_H = 153;

type Notice = {
  name: string;
  avatar: string;
  flag: string;
  avatarBg: string;
  objectPosition?: string;
  crop?: { top: number; left: number; width: number; height: number };
  scale: number;
  top: number;
  opacity: number;
};

const NOTICES: Notice[] = [
  {
    name: "Yuki Tanaka",
    avatar: "/assets/home/how-avatar-jonathan.png",
    flag: "/assets/flags/cn.svg",
    avatarBg: "#f1e0d8",
    objectPosition: "center 8%",
    scale: 0.75,
    top: 98.73,
    opacity: 0.6,
  },
  {
    name: "Amara Okafor",
    avatar: "/assets/how-flint-works/send-amara.png",
    flag: "/assets/flags/ph.svg",
    avatarBg: "#f1e0d8",
    objectPosition: "center 18%",
    scale: 0.833,
    top: 72.73,
    opacity: 1,
  },
  {
    name: "Raj Patel",
    avatar: "/assets/how-flint-works/send-raj.png",
    flag: "/assets/flags/in.svg",
    avatarBg: "#fee0db",
    objectPosition: "center 18%",
    scale: 0.917,
    top: 38.73,
    opacity: 1,
  },
  {
    name: "Kwame Asante",
    avatar: "/assets/how-flint-works/send-kwame.png",
    flag: "/assets/flags/ng.svg",
    avatarBg: "#fee0db",
    crop: { top: 3, left: -17, width: 74, height: 74 },
    scale: 1,
    top: 0,
    opacity: 1,
  },
];

export default function SendApplicationIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const play = Boolean(reduceMotion || inView);

  return (
    <IllustrationPanel tone="brand">
      <div ref={ref} className="absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: CARD_W,
            height: STACK_H,
            marginLeft: -CARD_W / 2,
            marginTop: -STACK_H / 2,
          }}
        >
          {NOTICES.map((notice, i) => (
            <motion.div
              key={notice.name}
              className="absolute left-1/2"
              style={{
                top: notice.top,
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                transformOrigin: "top center",
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: notice.scale * 0.96 }}
              animate={play ? { opacity: notice.opacity, y: 0, scale: notice.scale } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : LOAD_DELAY + i * 0.1,
              }}
            >
              <div
                className="flex h-full w-full items-center gap-3 rounded-[24px] bg-white px-4 py-3.5 shadow-[0_6px_7px_rgba(0,0,0,0.03),0_25px_12.5px_rgba(0,0,0,0.02),0_57px_17px_rgba(0,0,0,0.01)] backdrop-blur-[10px]"
              >
                <div className="relative size-10 shrink-0">
                  <div
                    className="relative aspect-square size-10 overflow-clip rounded-full shadow-[inset_0_2px_6px_rgba(255,255,255,0.25)]"
                    style={{ background: notice.avatarBg }}
                  >
                    <img
                      src={notice.avatar}
                      alt=""
                      className="absolute max-w-none object-cover"
                      style={
                        notice.crop
                          ? {
                              top: notice.crop.top,
                              left: notice.crop.left,
                              width: notice.crop.width,
                              height: notice.crop.height,
                            }
                          : {
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectPosition: notice.objectPosition,
                            }
                      }
                    />
                  </div>
                  <div className="absolute right-0 bottom-0 size-3 overflow-clip">
                    <img src={notice.flag} alt="" className="size-full" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center text-[14px] leading-5 text-ink">
                  <p className="truncate">{notice.name}</p>
                  <p className="truncate opacity-60">Applications sent</p>
                </div>
                <div className="flex size-[38px] shrink-0 items-center justify-center overflow-clip rounded-full bg-brand-light">
                  <img src="/assets/how-flint-works/ic-send.svg" alt="" className="h-[14px] w-[13px]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </IllustrationPanel>
  );
}
