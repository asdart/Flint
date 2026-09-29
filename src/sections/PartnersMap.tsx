import { cx } from "../lib/cx";

const STATES = [
  "New York",
  "Florida",
  "Texas",
  "Illinois",
  "Washington",
  "Nevada",
  "Massachusetts",
  "Michigan",
  "Pennsylvania",
  "Oregon",
  "Arizona",
  "Colorado",
  "Georgia",
  "Ohio",
];

// Seven rows cover each 340px half of the 680px desktop viewport:
// ceil((340 - 26) / 52) = 7. The duplicate New York is the cycle's identical end frame.
const ROWS_ABOVE = 7;
const ROWS_BELOW = 7;
const START = STATES.length - ROWS_ABOVE;
const TICKER_ROWS = Array.from(
  { length: ROWS_ABOVE + STATES.length + 1 + ROWS_BELOW },
  (_, index) => STATES[(START + index) % STATES.length],
);
const STARTING_ROW = ROWS_ABOVE;

/** Section / Partners Map. */
export default function PartnersMap() {
  return (
    <section className="fk-section">
      <div className="fk-partners-map fk-relative fk-w-full fk-rounded-xl fk-bg-tertiary fk-overflow-clip">
        <img
          className="fk-partners-map-image fk-absolute fk-inset-0 fk-block fk-w-full fk-h-full fk-object-cover"
          src="/assets/home/map-bg.jpg"
          alt=""
        />
        <div className="fk-partners-map-overlay fk-absolute fk-inset-0" aria-hidden="true" />
        <div className="fk-flex fk-items-center fk-justify-center fk-h-full">
        <div className="fk-container fk-h-full">
          <div className="fk-partners-map-inner fk-relative fk-flex fk-flex-col-tablet fk-items-center-tablet fk-w-full fk-h-full fk-gap-19 fk-gap-4-tablet">
            <div
              className="fk-partners-map-heading fk-flex fk-flex-col fk-flex-row-tablet fk-justify-center fk-shrink-0"
              data-ix="blur-reveal"
            >
              <div className="fk-blur-reveal">
                <p className="fk-heading-xl fk-color-white">Our partners are in</p>
              </div>
            </div>
            <div className="fk-partners-map-viewport">
              <div className="fk-partners-map-track" data-ix="ticker">
                {TICKER_ROWS.map((state, index) => (
                  <p
                    key={`${state}-${index}`}
                    className={cx("fk-partners-map-row", index === STARTING_ROW && "is-active")}
                    data-ticker-row={index}
                  >
                    {state}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
