/**
 * The seven cut-out portraits of the desktop strip, left to right (Figma 5993:3822). Eager: it is the first
 * screen. Decorative: the people aren't named anywhere in the design, so the images carry an empty alt.
 * [file, width, height] are the largest displayed size (contract 1.12, same aspect as the file); the on-screen size and position are `fk-photo-strip-image is-pN`.
 */
const STRIP: Array<[string, number, number]> = [
  ["strip-1", 234, 293],
  ["strip-2", 275, 275],
  ["strip-3", 296, 370],
  ["strip-4", 287, 359],
  ["strip-5", 267, 356],
  ["strip-6", 252, 336],
  ["strip-7", 277, 369],
];

/**
 * Section / About Hero (Figma 5993:3802 desktop, phone 5974:7520). Page-level markup (D-17: only About has
 * this hero). One `h1`: the eyebrow, the title and the strip of seven portraits on a white panel, the same layout
 * at every width (the strip scales with its container). The Nav is the global fixed one.
 */
export default function AboutHero() {
  return (
    <section className="fk-section">
      <div className="fk-panel is-intro">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-12">
            <div className="fk-section-header is-center is-wide" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <p className="fk-eyebrow">About us</p>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <h1 className="fk-heading-lg">
                  Solving healthcare labor shortages by helping international professionals find long-term stability in the United States.
                </h1>
              </div>
            </div>
            <div
              className="fk-photo-strip fk-relative fk-w-full fk-bg-brand-light fk-rounded-lg fk-overflow-clip"
              data-ix="reveal-stagger"
              aria-hidden="true"
            >
              {STRIP.map(([file, width, height], index) => (
                <img
                  key={file}
                  className={`fk-photo-strip-image is-p${index + 1}`}
                  src={`/assets/about/${file}.webp`}
                  alt=""
                  width={width}
                  height={height}
                  loading="eager"
                  data-ix-item
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
