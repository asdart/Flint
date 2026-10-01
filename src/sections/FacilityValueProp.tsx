import { Fragment } from "react";
import { cx } from "../lib/cx";

/** The eight network portraits, clockwise from the top (Figma 5594:26794): the legacy `NetworkIllustration` files. */
const PORTRAITS = [
  { src: "/assets/network/portrait-01.png", size: [1122, 1402] },
  { src: "/assets/network/portrait-05.png", size: [820, 1024] },
  { src: "/assets/network/portrait-03.png", size: [1086, 1448] },
  { src: "/assets/network/portrait-07.png", size: [1376, 768] },
  { src: "/assets/network/portrait-02.png", size: [1086, 1448] },
  { src: "/assets/network/portrait-06.png", size: [1024, 1333] },
  { src: "/assets/network/portrait-04.png", size: [1086, 1448] },
  { src: "/assets/network/portrait-08.png", size: [1086, 1448] },
] as const;

const CANDIDATES = [
  {
    name: "Charlette Nono",
    avatar: "/assets/how-it-works/retention-avatar-charlette.png",
    size: [300, 375],
    crop: "is-charlette",
    flag: "/assets/how-it-works/retention-flag-angola.svg",
  },
  {
    name: "Eizle",
    avatar: "/assets/how-it-works/retention-avatar-eizle.png",
    size: [300, 400],
    crop: "is-eizle",
    flag: "/assets/how-it-works/retention-flag-mexico.svg",
  },
] as const;

type RowProps = {
  title: string;
  body: string;
  reverse?: boolean;
  children: React.ReactNode;
};

function Row({ title, body, reverse, children }: RowProps) {
  return (
    <div className={cx("fk-steps-row", reverse && "is-reverse")} data-ix="reveal">
      <div className="fk-steps-copy">
        <h3 className="fk-heading-md fk-steps-title">
          <span>{title}</span>
        </h3>
        <p className="fk-text-lg fk-color-subtle">{body}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * Section / Facility Value Prop ("ValueProp", Figma 5594:26788, phone 5778:883): "Why facilities trust Flint", a
 * centred header and three alternating copy / art rows. Page-level markup (D-17), on the Candidates `fk-steps-*`
 * row (the Figma rows are the same 580 art + 480 copy, 696 tall; no number). Each art panel is the final frame
 * of its legacy illustration, built from real elements with `data-x-illustration` / `data-x-part` hooks for
 * `x-illustrations` (motion built). The panels are `aria-hidden` mock-ups; their images are decorative (`alt=""`).
 */
export default function FacilityValueProp() {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-white">
        <div className="fk-panel-content">
          <div className="fk-container">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">
                  Why facilities
                  <br />
                  trust Flint
                </h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-subtle">
                  Get answers to common questions about our Green Card pathway, candidate vetting, and healthcare placement process.
                </p>
              </div>
            </div>
          </div>

          <Row
            title="A stable team of familiar faces"
            body="No more onboarding new staff every 90 days. Flint placements become familiar faces for your residents — not strangers filling a shift."
            reverse
          >
            <div className="fk-steps-art fk-bg-tertiary" data-x-illustration="network" aria-hidden="true">
              <div className="fk-steps-canvas is-network">
                <div className="fk-network">
                  <img className="fk-network-hub-ring" data-x-part="hub-ring" src="/assets/facility/network-ring-hub.svg" alt="" width={128} height={128} loading="lazy" />
                  <div className="fk-network-orbit" data-x-part="orbit">
                    {PORTRAITS.map((portrait, index) => (
                      <div className={`fk-network-spoke is-a${index + 1}`} data-x-part="line" key={`spoke-${portrait.src}`}>
                        <img className="fk-network-spoke-image" src="/assets/facility/network-line.svg" alt="" width={2} height={37} loading="lazy" />
                      </div>
                    ))}
                    {PORTRAITS.map((portrait, index) => (
                      <div className={`fk-network-node is-a${index + 1}`} key={portrait.src}>
                        <img className="fk-network-ring" data-x-part="ring" src="/assets/facility/network-ring.svg" alt="" width={92} height={92} loading="lazy" />
                        <div className="fk-network-avatar fk-rounded-full fk-bg-sand-100 fk-overflow-clip" data-x-part="avatar">
                          <div className="fk-network-face" data-x-part="face">
                            <img
                              className={`fk-network-portrait is-a${index + 1}`}
                              src={portrait.src}
                              alt=""
                              width={portrait.size[0]}
                              height={portrait.size[1]}
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="fk-network-hub fk-rounded-full fk-bg-brand" data-x-part="hub">
                    <img className="fk-network-hub-icon" data-x-part="hub-icon" src="/assets/how-it-works/hub-people.svg" alt="" width={32} height={32} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row
            title="Reduced staffing costs"
            body="Facilities that replace agency staff with Flint hires save an average of $60,000 per RN and $42,000 per CNA every year."
          >
            <div className="fk-steps-art fk-bg-brand-light" data-x-illustration="savings" aria-hidden="true">
              <div className="fk-steps-ring is-left">
                <img className="fk-steps-ring-image" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
              </div>
              <div className="fk-steps-canvas is-savings">
                <div className="fk-savings">
                  <div className="fk-savings-back is-n1" data-x-part="back" />
                  <div className="fk-savings-back is-n2" data-x-part="back" />
                  <div className="fk-savings-card fk-rounded-2xl fk-bg-white" data-x-part="card">
                    <p className="fk-savings-title fk-text-sm fk-color-subtle">Agency Costs</p>
                    <div className="fk-savings-chart">
                      <img className="fk-savings-fill" data-x-part="fill" src="/assets/how-it-works/chart-fill.svg" alt="" width={292} height={119} loading="lazy" />
                      <img className="fk-savings-line" data-x-part="line" src="/assets/how-it-works/chart-stroke.svg" alt="" width={299} height={122} loading="lazy" />
                      <span className="fk-savings-dot is-start fk-rounded-full fk-bg-brand" data-x-part="dot-start" />
                      <span className="fk-savings-dot is-end fk-rounded-full fk-bg-brand" data-x-part="dot-end" />
                    </div>
                    <div className="fk-savings-rule" data-x-part="rule" />
                    <div className="fk-savings-saved fk-flex fk-flex-col fk-gap-0-5" data-x-part="saved">
                      <p className="fk-text-sm fk-color-subtle">Saved this month</p>
                      <p className="fk-savings-amount fk-color-ink" data-x-part="amount">
                        $60,000
                      </p>
                    </div>
                    <div className="fk-savings-chip" data-x-part="chip">
                      <img className="fk-savings-arrow" src="/assets/how-it-works/arrow-down.svg" alt="" width={11} height={15} loading="lazy" />
                      <p className="fk-savings-chip-text">60%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row
            title="Guaranteed retention"
            body="Every hire sourced by Flint is guaranteed to stay 3+ years. If they don't, we find you another at no extra charge."
            reverse
          >
            <div className="fk-steps-art fk-bg-tertiary" data-x-illustration="retention" aria-hidden="true">
              <div className="fk-steps-canvas is-retention">
                <div className="fk-retention-connector" data-x-part="connector">
                  <img className="fk-retention-connector-image" src="/assets/how-it-works/retention-connector.svg" alt="" width={140} height={2} loading="lazy" />
                </div>
                <div className="fk-retention-badge fk-rounded-full fk-bg-brand" data-x-part="badge">
                  <img className="fk-retention-badge-icon" src="/assets/how-it-works/handshake.svg" alt="" width={20} height={20} loading="lazy" />
                </div>
                <div className="fk-retention-card is-hired" data-x-part="hired">
                  <div className="fk-flex fk-items-center fk-justify-between">
                    <p className="fk-text-sm fk-font-medium fk-color-ink">Hired Candidates</p>
                    <div className="fk-retention-total">
                      <span className="fk-retention-total-dot" />
                      <p className="fk-text-xs fk-font-medium">2 total</p>
                    </div>
                  </div>
                  {CANDIDATES.map((candidate, index) => (
                    <Fragment key={candidate.name}>
                      {index > 0 ? (
                        <img className="fk-retention-divider" src="/assets/how-it-works/retention-divider.svg" alt="" width={341} height={1} loading="lazy" />
                      ) : null}
                      <div className="fk-retention-person" data-x-part="person">
                        <p className="fk-text-sm fk-color-subtle">{candidate.name}</p>
                        <div className="fk-retention-avatars">
                          <div className={cx("fk-retention-avatar", candidate.crop)}>
                            <img
                              className={cx("fk-retention-avatar-image", candidate.crop)}
                              src={candidate.avatar}
                              alt=""
                              width={candidate.size[0]}
                              height={candidate.size[1]}
                              loading="lazy"
                            />
                          </div>
                          <img className="fk-flag is-lg" src={candidate.flag} alt="" width={32} height={32} loading="lazy" />
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div className="fk-retention-card is-facility" data-x-part="facility">
                  <div className="fk-retention-map">
                    <img className="fk-retention-map-image" src="/assets/how-it-works/retention-map.png" alt="" width={900} height={522} loading="lazy" />
                    <div className="fk-retention-map-fade" />
                  </div>
                  <div className="fk-retention-thumb" data-x-part="thumb">
                    <img className="fk-retention-thumb-image" src="/assets/how-it-works/retention-facility.png" alt="" width={220} height={146} loading="lazy" />
                  </div>
                  <div className="fk-flex fk-flex-col fk-gap-1 fk-relative" data-x-part="address">
                    <p className="fk-text-sm fk-font-medium fk-color-ink">Sandstone Healthcare Center</p>
                    <p className="fk-text-sm fk-color-subtle">109 Court Ave S, Sandstone, MN 55072, Estados Unidos</p>
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </div>
      </div>
    </section>
  );
}
