import checkmarkIcon from "../assets/icons/checkmark.svg";
import facilityIcon from "../assets/icons/facility.svg";
import { cx } from "../lib/cx";

type PricingBubbleProps = {
  icon: React.ReactNode;
  name: string;
  detail: string[];
  isLarger?: boolean;
};

function PricingBubble({ icon, name, detail, isLarger }: PricingBubbleProps) {
  return (
    <div className={cx("fk-pricing-bubble", isLarger ? "is-larger" : "")}>
      {icon}
      <div className="fk-pricing-bubble-body">
        <p className="fk-pricing-bubble-name">{name}</p>
        <ul className="fk-pricing-bubble-detail">
          {detail.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Section / Pricing. New (Figma nodes 6011:2380, 6011:2529), no legacy source. */
export default function Pricing() {
  return (
    <section className="fk-section">
      <div className="fk-panel">
        <div className="fk-container">
          <div className="fk-panel-content">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">Why Flint is free?</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg is-brand-muted">
                  Get answers to common questions about our Green Card pathway, candidate vetting,
                  and healthcare placement process.
                </p>
              </div>
            </div>

            <div className="fk-pricing-cards">
              <div className="fk-pricing-card is-diagram">
                <div className="fk-pricing-card-content">
                  <div className="fk-pricing-header">
                    <p className="fk-text-xs">This is you.</p>
                    <div className="fk-pricing-avatar-wrapper">
                      <img
                        className="fk-pricing-avatar"
                        src="/assets/home/Image%2049.png"
                        alt=""
                        width={200}
                        height={249}
                      />
                    </div>
                  </div>
                  <div className="fk-pricing-thread">
                    <div className="fk-pricing-line" aria-hidden="true" />
                    <PricingBubble
                      icon={
                        <div className="fk-pricing-bubble-icon">
                          <img className="fk-icon is-sm" src={facilityIcon} alt="" />
                        </div>
                      }
                      name="Facility"
                      detail={["Healthcare facilities need to hire", "They pay Flint to find candidates like you"]}
                    />
                    <PricingBubble
                      icon={
                        <img
                          className="fk-pricing-bubble-icon is-plain"
                          src="/assets/home/Flint-logo-brand-circle.svg"
                          alt=""
                          width={40}
                          height={40}
                        />
                      }
                      name="Flint"
                      detail={["Connects you to facilities", "Covers your Green Card + Relocation"]}
                      isLarger={true}
                    />
                    <PricingBubble
                      icon={
                        <div className="fk-pricing-bubble-icon">
                          <img className="fk-icon is-sm" src={facilityIcon} alt="" />
                        </div>
                      }
                      name="Facility"
                      detail={["Hires you as a full-time employee"]}
                    />
                  </div>
                </div>
              </div>

              <div className="fk-pricing-card is-copy">
                <div className="fk-pricing-card-content">
                  <div className="fk-pricing-copy">
                    <h3 className="fk-heading-md">You pay nothing. The facility pay us.</h3>
                    <p className="fk-text-lg is-subtle">
                      Facilities spend a lot of money on temporary agency staff. By hiring you
                      long-term, they save time and money.
                    </p>
                  </div>
                  <ul className="fk-pricing-checklist">
                    <li className="fk-pricing-checklist-item">
                      <span className="fk-pricing-checklist-icon">
                        <img className="fk-icon is-sm" src={checkmarkIcon} alt="" />
                      </span>
                      <p className="fk-text-md">No placement fees</p>
                    </li>
                    <li className="fk-pricing-checklist-item">
                      <span className="fk-pricing-checklist-icon">
                        <img className="fk-icon is-sm" src={checkmarkIcon} alt="" />
                      </span>
                      <p className="fk-text-md">No paycheck deductions</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
