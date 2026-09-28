const LOGOS = [
  { src: "/assets/home/logo-01.png", width: 132 },
  { src: "/assets/home/logo-02.png", width: 96 },
  { src: "/assets/home/logo-03.png", width: 101 },
  { src: "/assets/home/logo-04.png", width: 187 },
  { src: "/assets/home/logo-05.png", width: 146 },
  { src: "/assets/home/logo-06.png", width: 121 },
];

// One set is 1071px; the strip is up to ≈1540px wide at 1920. Three copies keep it filled while
// ix-marquee moves one set (−33.333%) per cycle.
const COPIES = 3;

/** Section / Logo Marquee. */
export default function LogoMarquee() {
  return (
    <section className="fk-logo-marquee">
      <div className="fk-logo-marquee-label" data-ix="blur-reveal">
        <div className="fk-blur-reveal">
          <p className="fk-text-md is-brand-muted">Partnering with the top facilities</p>
        </div>
      </div>
      <div className="fk-logo-marquee-viewport">
        <div className="fk-logo-marquee-track">
          {Array.from({ length: COPIES }, (_, copy) => (
            <div key={copy} className="fk-logo-marquee-row" aria-hidden={copy > 0 || undefined}>
              {LOGOS.map((logo) => (
                <img
                  key={logo.src}
                  className="fk-logo-marquee-logo"
                  src={logo.src}
                  alt=""
                  width={logo.width}
                  height={36}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="fk-logo-marquee-fade is-left" aria-hidden="true" />
        <div className="fk-logo-marquee-fade is-right" aria-hidden="true" />
      </div>
    </section>
  );
}
