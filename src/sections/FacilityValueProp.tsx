import { Fragment } from "react";
import { cx } from "../lib/cx";

/** The eight network portraits, clockwise from the top (Figma 5594:26794): the legacy `NetworkIllustration` files. */
const PORTRAITS = [
  { src: "/assets/network/portrait-01.webp", size: [300, 375] },
  { src: "/assets/network/portrait-05.webp", size: [300, 375] },
  { src: "/assets/network/portrait-03.webp", size: [314, 419] },
  { src: "/assets/network/portrait-07.webp", size: [412, 230] },
  { src: "/assets/network/portrait-02.webp", size: [300, 400] },
  { src: "/assets/network/portrait-06.webp", size: [268, 349] },
  { src: "/assets/network/portrait-04.webp", size: [300, 400] },
  { src: "/assets/network/portrait-08.webp", size: [370, 493] },
] as const;

const CANDIDATES = [
  {
    name: "Charlette Nono",
    avatar: "/assets/how-it-works/retention-avatar-charlette.webp",
    size: [110, 138],
    crop: "is-charlette",
    bg: "fk-bg-sand-100",
    flag: "/assets/how-it-works/retention-flag-angola.svg",
  },
  {
    name: "Eizle",
    avatar: "/assets/how-it-works/retention-avatar-eizle.webp",
    size: [102, 136],
    crop: "is-eizle",
    bg: "fk-bg-brand-foreground",
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
    <div className={cx("fk-split fk-items-center fk-justify-end fk-gap-24 fk-gap-10-tablet fk-w-full", reverse && "is-reverse")} data-ix="reveal">
      <div className="fk-split-copy fk-gap-2">
        <h3 className="fk-heading-md fk-flex">
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
        <div className="fk-container">
          <div className="fk-panel-content">
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

            <Row
              title="A stable team of familiar faces"
              body="No more onboarding new staff every 90 days. Flint placements become familiar faces for your residents — not strangers filling a shift."
              reverse
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-tertiary" data-x-illustration="network" aria-hidden="true">
                <div className="fk-steps-canvas fk-absolute is-network">
                  <div className="fk-network fk-absolute">
                    <img className="fk-network-hub-ring fk-absolute fk-block" data-x-part="hub-ring" src="/assets/facility/network-ring-hub.svg" alt="" width={128} height={128} loading="lazy" />
                    <div className="fk-absolute fk-inset-0" data-x-part="orbit">
                      {PORTRAITS.map((portrait, index) => (
                        <div className={`fk-network-spoke fk-absolute is-a${index + 1}`} data-x-part="line" key={`spoke-${portrait.src}`}>
                          <img className="fk-network-spoke-image fk-absolute fk-block" src="/assets/facility/network-line.svg" alt="" width={2} height={37} loading="lazy" />
                        </div>
                      ))}
                      {PORTRAITS.map((portrait, index) => (
                        <div className={`fk-network-node fk-absolute is-a${index + 1}`} key={portrait.src}>
                          <img className="fk-network-ring fk-absolute fk-block" data-x-part="ring" src="/assets/facility/network-ring.svg" alt="" width={92} height={92} loading="lazy" />
                          <div className="fk-network-avatar fk-absolute fk-rounded-full fk-bg-sand-100 fk-overflow-clip" data-x-part="avatar">
                            <div className="fk-absolute fk-inset-0" data-x-part="face">
                              <img
                                className={`fk-network-portrait fk-absolute fk-block fk-object-cover is-a${index + 1}`}
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
                    <div className="fk-network-hub fk-absolute fk-flex fk-items-center fk-justify-center fk-rounded-full fk-bg-brand" data-x-part="hub">
                      <img className="fk-network-hub-icon fk-block" data-x-part="hub-icon" src="/assets/how-it-works/hub-people.svg" alt="" width={32} height={32} loading="lazy" />
                    </div>
                  </div>
                </div>
              </div>
            </Row>

            <Row
              title="Reduced staffing costs"
              body="Facilities that replace agency staff with Flint hires save an average of $60,000 per RN and $42,000 per CNA every year."
            >
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-brand-light" data-x-illustration="savings" aria-hidden="true">
                <div className="fk-ring is-panel-left">
                  <img className="fk-ring-image is-rotated" src="/assets/home/cta-flower.webp" alt="" width={1672} height={941} loading="lazy" />
                </div>
                <div className="fk-steps-canvas fk-absolute is-savings">
                  <div className="fk-savings fk-absolute">
                    <div className="fk-steps-back is-n1 fk-absolute fk-bg-white" data-x-part="back" />
                    <div className="fk-steps-back is-n2 is-opaque fk-absolute fk-bg-white" data-x-part="back" />
                    <div className="fk-savings-card fk-absolute fk-rounded-2xl fk-bg-white" data-x-part="card">
                      <p className="fk-savings-title fk-absolute fk-text-sm fk-color-subtle">Agency Costs</p>
                      <div className="fk-savings-chart fk-absolute">
                        <img className="fk-savings-fill fk-absolute fk-block" data-x-part="fill" src="/assets/how-it-works/chart-fill.svg" alt="" width={292} height={119} loading="lazy" />
                        <img className="fk-savings-line fk-absolute fk-block" data-x-part="line" src="/assets/how-it-works/chart-stroke.svg" alt="" width={299} height={122} loading="lazy" />
                        <span className="fk-savings-dot is-start fk-absolute fk-rounded-full fk-bg-brand" data-x-part="dot-start" />
                        <span className="fk-savings-dot is-end fk-absolute fk-rounded-full fk-bg-brand" data-x-part="dot-end" />
                      </div>
                      <div className="fk-savings-rule fk-absolute" data-x-part="rule" />
                      <div className="fk-savings-saved fk-absolute fk-flex fk-flex-col fk-gap-0-5" data-x-part="saved">
                        <p className="fk-text-sm fk-color-subtle">Saved this month</p>
                        <p className="fk-savings-amount fk-color-ink" data-x-part="amount">
                          $60,000
                        </p>
                      </div>
                      <div className="fk-savings-chip fk-absolute fk-flex fk-items-center fk-rounded-full" data-x-part="chip">
                        <img className="fk-savings-arrow fk-block" src="/assets/how-it-works/arrow-down.svg" alt="" width={11} height={15} loading="lazy" />
                        <p className="fk-text-md">60%</p>
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
              <div className="fk-steps-art fk-relative fk-shrink-0 fk-rounded-2xl fk-overflow-clip fk-bg-tertiary" data-x-illustration="retention" aria-hidden="true">
                <div className="fk-steps-canvas fk-absolute is-retention">
                  <div className="fk-retention-connector fk-absolute fk-overflow-clip" data-x-part="connector">
                    <img className="fk-retention-connector-image fk-absolute fk-block" src="/assets/how-it-works/retention-connector.svg" alt="" width={140} height={2} loading="lazy" />
                  </div>
                  <div className="fk-retention-badge fk-absolute fk-flex fk-items-center fk-justify-center fk-rounded-full fk-bg-brand" data-x-part="badge">
                    <img className="fk-retention-badge-icon fk-block" src="/assets/how-it-works/handshake.svg" alt="" width={20} height={20} loading="lazy" />
                  </div>
                  <div className="fk-retention-card is-hired fk-absolute fk-flex fk-flex-col fk-gap-4 fk-rounded-xl fk-bg-white fk-overflow-clip" data-x-part="hired">
                    <div className="fk-flex fk-items-center fk-justify-between">
                      <p className="fk-text-sm fk-font-medium fk-color-ink">Hired Candidates</p>
                      <div className="fk-retention-total fk-flex fk-items-center fk-gap-1 fk-rounded-full">
                        <span className="fk-retention-total-dot fk-rounded-full" />
                        <p className="fk-text-xs fk-font-medium">2 total</p>
                      </div>
                    </div>
                    {CANDIDATES.map((candidate, index) => (
                      <Fragment key={candidate.name}>
                        {index > 0 ? (
                          <img className="fk-retention-divider fk-block fk-w-full" src="/assets/how-it-works/retention-divider.svg" alt="" width={341} height={1} loading="lazy" />
                        ) : null}
                        <div className="fk-flex fk-items-center fk-justify-between" data-x-part="person">
                          <p className="fk-text-sm fk-color-subtle">{candidate.name}</p>
                          <div className="fk-retention-avatars fk-flex fk-items-center">
                            <div className={cx("fk-retention-avatar fk-relative fk-shrink-0 fk-rounded-full fk-overflow-clip", candidate.bg)}>
                              <img
                                className={cx("fk-retention-avatar-image fk-absolute fk-block fk-object-cover", candidate.crop)}
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
                  <div className="fk-retention-card is-facility fk-absolute fk-flex fk-flex-col fk-gap-4 fk-rounded-xl fk-bg-white fk-overflow-clip" data-x-part="facility">
                    <div className="fk-retention-map fk-absolute">
                      <img className="fk-retention-map-image fk-absolute fk-block fk-w-full fk-h-full fk-object-cover" src="/assets/how-it-works/retention-map.webp" alt="" width={680} height={394} loading="lazy" />
                      <div className="fk-retention-map-fade fk-absolute fk-inset-0" />
                    </div>
                    <div className="fk-retention-thumb fk-relative fk-rounded-sm fk-bg-brand-light fk-overflow-clip" data-x-part="thumb">
                      <img className="fk-retention-thumb-image fk-absolute fk-block fk-w-full fk-h-full fk-object-cover" src="/assets/how-it-works/retention-facility.webp" alt="" width={146} height={97} loading="lazy" />
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
      </div>
    </section>
  );
}
