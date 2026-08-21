import { motion, type MotionValue } from "framer-motion";

export const CAROUSEL_DOT_SIZE = 7;
export const CAROUSEL_BAR_WIDTH = 57;
export const CAROUSEL_AUTOPLAY_DELAY = 5000;
export const CAROUSEL_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type CarouselPaginationProps = {
  count: number;
  /** Simple index match — used when each dot maps 1:1 to active slide. */
  active?: number;
  /** Custom active check — e.g. slot-based carousels where offset wraps. */
  isActive?: (index: number) => boolean;
  onSelect: (index: number) => void;
  fillWidth: MotionValue<number>;
  reduceMotion: boolean | null;
  ariaLabel?: (index: number) => string;
  className?: string;
};

export default function CarouselPagination({
  count,
  active,
  isActive,
  onSelect,
  fillWidth,
  reduceMotion,
  ariaLabel = (index) => `Go to slide ${index + 1}`,
  className,
}: CarouselPaginationProps) {
  const activeFor = isActive ?? ((index: number) => index === active);

  return (
    <div className={`flex items-center gap-[4.5px] ${className ?? ""}`}>
      {Array.from({ length: count }, (_, i) => {
        const dotActive = activeFor(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={ariaLabel(i)}
            aria-current={dotActive ? "true" : undefined}
            className="flex items-center py-2"
          >
            <motion.span
              className="relative block h-[7px] shrink-0 overflow-hidden rounded-full bg-[#ebebe5]"
              animate={{ width: dotActive ? CAROUSEL_BAR_WIDTH : CAROUSEL_DOT_SIZE }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.45, ease: CAROUSEL_EASE_OUT }
              }
            >
              {dotActive && (
                <motion.span
                  className="absolute inset-y-0 left-0 block h-[7px] rounded-full bg-[#444444]"
                  style={{ width: fillWidth }}
                />
              )}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
