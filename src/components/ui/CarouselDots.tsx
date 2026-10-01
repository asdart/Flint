import { cx } from "../../lib/cx";

type CarouselDotsProps = {
  count: number;
  /** Dot that starts active (0-based). */
  active?: number;
  label: (index: number) => string;
};

/**
 * Carousel dots (fk-carousel-dots). In Webflow this is page markup inside each carousel section, not
 * a component. `x-carousel` finds each dot by `data-x-dot` and drives its bar (first child) and
 * fill (the bar's child): the bar widens when the dot is active, the fill is the autoplay clock.
 */
export default function CarouselDots({ count, active = 0, label }: CarouselDotsProps) {
  return (
    <div className="fk-carousel-dots">
      {Array.from({ length: count }, (_, index) => (
        <button key={index} type="button" className="fk-carousel-dots-button" data-x-dot aria-label={label(index)}>
          <span className={cx("fk-carousel-dots-bar", index === active && "is-active")}>
            <span className="fk-carousel-dots-fill" />
          </span>
        </button>
      ))}
    </div>
  );
}
