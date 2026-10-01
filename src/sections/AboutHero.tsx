/**
 * The seven cut-out portraits of the desktop strip, left to right (Figma 5993:3822). Eager: it is the first
 * screen. Decorative: the people aren't named anywhere in the design, so the images carry an empty alt.
 * [file, width, height] are the WebP's own size; the on-screen size and position are `fk-photo-strip-image is-pN`.
 */
const STRIP: Array<[string, number, number]> = [
  ["strip-1", 484, 605],
  ["strip-2", 568, 568],
  ["strip-3", 612, 764],
  ["strip-4", 592, 740],
  ["strip-5", 540, 720],
  ["strip-6", 522, 696],
  ["strip-7", 540, 720],
];

/**
 * Section / About Hero (Figma 5993:3802 desktop, phone 5974:7520). Page-level markup (D-17: only About has
 * this hero). One `h1`: above 991px the page shows the eyebrow, the title and the strip of seven portraits on a
 * white panel; from Tablet down it is the phone design, a grey panel and a title of four lines with three inline portrait
 * pills (`fk-portrait`, hidden above 991px; they reuse the strip's files, strip 2, 6 and 4, so no new image
 * is uploaded). The Nav is the global fixed one.
 */
export default function AboutHero() {
  const pill = (file: string, width: number, height: number, tone: string, crop = false) => (
    <span className={`fk-portrait ${tone}`}>
      <img
        className={crop ? "fk-portrait-image is-crop" : "fk-portrait-image"}
        src={`/assets/about/${file}.webp`}
        alt=""
        width={width}
        height={height}
        loading="eager"
      />
    </span>
  );

  return (
    <section className="fk-section">
      <div className="fk-panel is-intro fk-flex-tablet fk-flex-col-tablet fk-justify-center-tablet">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-12">
            <div className="fk-section-header is-center is-wide" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <p className="fk-eyebrow">About us</p>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <h1 className="fk-heading-lg fk-flex-tablet fk-flex-col fk-items-center fk-gap-3">
                  <span>Building {pill("strip-2", 568, 568, "is-brand", true)} the path</span>{" "}
                  <span>to permanence for {pill("strip-6", 522, 696, "is-peach")}</span>{" "}
                  <span>{pill("strip-4", 592, 740, "is-sand")} the nurses</span> <span>America needs</span>
                </h1>
              </div>
            </div>
            <div
              className="fk-photo-strip fk-relative fk-w-full fk-bg-brand-light fk-rounded-lg fk-overflow-clip fk-hidden-tablet"
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
