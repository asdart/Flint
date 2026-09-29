import { cx } from "../../lib/cx";

type CarouselDotsProps = {
  /** Attribute prefix that keeps IX3 targets unique per carousel, e.g. "how" → data-dot="how-1". */
  id: string;
  count: number;
  /** Dot that starts active (0-based). */
  active?: number;
  label: (index: number) => string;
};

/**
 * Carousel dots (fk-carousel-dots). In Webflow this is page markup inside each carousel section, not
 * a component: IX3 targets every dot, bar and fill by its own data attribute.
 */
export default function CarouselDots({ id, count, active = 0, label }: CarouselDotsProps) {
  return (
    <div className="fk-carousel-dots">
      {Array.from({ length: count }, (_, index) => {
        const key = `${id}-${index + 1}`;
        return (
          <button key={key} type="button" className="fk-carousel-dots-button" data-dot={key} aria-label={label(index)}>
            <span className={cx("fk-carousel-dots-bar", index === active && "is-active")} data-dot-bar={key}>
              <span className="fk-carousel-dots-fill" data-dot-fill={key} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
