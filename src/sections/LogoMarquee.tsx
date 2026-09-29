const LOGOS = [
  { src: "/assets/home/logo-01.webp", name: "Lincoln Health", width: 132 },
  { src: "/assets/home/logo-02.webp", name: "Pleasant View Home", width: 96 },
  { src: "/assets/home/logo-03.webp", name: "Miramont Behavioral Health", width: 101 },
  { src: "/assets/home/logo-04.webp", name: "Gunnison Valley Health", width: 187 },
  { src: "/assets/home/logo-05.webp", name: "CHRISTUS Health", width: 146 },
  { src: "/assets/home/logo-06.webp", name: "Sandhills Care Center", width: 121 },
];

// One set is 1071px; the strip is up to ≈1540px wide at 1920. Three copies keep it filled while
// ix-marquee moves one set (−33.333%) per cycle.
const COPIES = 3;

/** Section / Logo Marquee. */
export default function LogoMarquee() {
  return (
    <section className="fk-logo-marquee fk-flex fk-items-center fk-w-full fk-gap-14 fk-flex-col-mobile fk-gap-6-mobile">
      <div className="fk-shrink-0" data-ix="blur-reveal">
        <div className="fk-blur-reveal">
          <p className="fk-text-md fk-color-brand-80">Partnering with the top facilities</p>
        </div>
      </div>
      <div className="fk-logo-marquee-viewport fk-relative fk-min-w-0 fk-w-full">
        <div className="fk-logo-marquee-track fk-flex fk-items-center">
          {Array.from({ length: COPIES }, (_, copy) => (
            <div
              key={copy}
              className="fk-logo-marquee-row fk-flex fk-shrink-0 fk-items-center fk-gap-12"
              aria-hidden={copy > 0 || undefined}
            >
              {LOGOS.map((logo) => (
                <img
                  key={logo.src}
                  className="fk-logo-marquee-logo fk-shrink-0"
                  src={logo.src}
                  alt={copy === 0 ? logo.name : ""}
                  width={logo.width}
                  height={36}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="fk-logo-marquee-fade is-left fk-absolute" aria-hidden="true" />
        <div className="fk-logo-marquee-fade is-right fk-absolute" aria-hidden="true" />
      </div>
    </section>
  );
}
