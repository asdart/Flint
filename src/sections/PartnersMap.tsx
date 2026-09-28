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
      <div className="fk-partners-map">
        <img className="fk-partners-map-image" src="/assets/home/map-bg.jpg" alt="" />
        <div className="fk-partners-map-overlay" aria-hidden="true" />
        <div className="fk-partners-map-content">
        <div className="fk-container is-full-height">
          <div className="fk-partners-map-inner">
            <div className="fk-partners-map-heading" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <p className="fk-heading-xl is-inverse">Our partners are in</p>
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
