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
    <div
      className={cx(
        "fk-pricing-bubble",
        isLarger ? "is-larger" : "",
        "fk-relative fk-flex fk-items-center fk-gap-3 fk-w-full fk-rounded-xl fk-bg-white fk-shadow-float",
      )}
    >
      {icon}
      <div className="fk-flex fk-flex-col fk-min-w-0">
        <p className="fk-text-sm fk-font-medium fk-color-ink">{name}</p>
        <ul className="fk-pricing-bubble-detail fk-color-ink-60">
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
                <p className="fk-text-lg fk-color-brand-80">
                  Get answers to common questions about our Green Card pathway, candidate vetting,
                  and healthcare placement process.
                </p>
              </div>
            </div>

            <div className="fk-split is-reverse fk-gap-4 fk-w-full">
              <div className="fk-pricing-card is-copy fk-flex fk-items-center fk-justify-center fk-w-full fk-rounded-2xl">
                <div className="fk-flex fk-flex-col">
                  <div className="fk-pricing-copy fk-flex fk-flex-col fk-gap-2">
                    <h3 className="fk-heading-md">You pay nothing. The facility pay us.</h3>
                    <p className="fk-text-lg fk-color-subtle">
                      Facilities spend a lot of money on temporary agency staff. By hiring you
                      long-term, they save time and money.
                    </p>
                  </div>
                  <ul className="fk-list-none fk-flex fk-flex-col fk-gap-4">
                    <li className="fk-flex fk-items-center fk-gap-3">
                      <span className="fk-icon-badge is-sm fk-bg-brand-light">
                        <img className="fk-icon is-sm" src={checkmarkIcon} alt="" width={16} height={16} />
                      </span>
                      <p className="fk-text-md">No placement fees</p>
                    </li>
                    <li className="fk-flex fk-items-center fk-gap-3">
                      <span className="fk-icon-badge is-sm fk-bg-brand-light">
                        <img className="fk-icon is-sm" src={checkmarkIcon} alt="" width={16} height={16} />
                      </span>
                      <p className="fk-text-md">No paycheck deductions</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="fk-pricing-card fk-flex fk-items-center fk-justify-center fk-w-full fk-rounded-2xl fk-bg-tertiary">
                <div className="fk-flex fk-flex-col">
                  <div className="fk-flex fk-flex-col fk-items-center fk-justify-center fk-gap-2">
                    <p className="fk-text-xs">This is you.</p>
                    <div className="fk-pricing-avatar-wrapper fk-flex fk-items-center fk-justify-center fk-rounded-full">
                      <img
                        className="fk-pricing-avatar fk-rounded-full fk-bg-sand-100 fk-overflow-clip fk-object-cover"
                        src="/assets/home/pricing-avatar.webp"
                        alt=""
                        width={200}
                        height={249}
                      />
                    </div>
                  </div>
                  <div className="fk-pricing-thread fk-relative fk-flex fk-flex-col fk-items-center fk-gap-5 fk-w-full">
                    <div className="fk-pricing-line fk-absolute fk-h-full" aria-hidden="true" />
                    <PricingBubble
                      icon={
                        <div className="fk-icon-badge fk-bg-brand-foreground">
                          <img className="fk-icon is-sm" src={facilityIcon} alt="" width={16} height={16} />
                        </div>
                      }
                      name="Facility"
                      detail={["Healthcare facilities need to hire", "They pay Flint to find candidates like you"]}
                    />
                    <PricingBubble
                      icon={
                        <img
                          className="fk-icon is-lg fk-rounded-full"
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
                        <div className="fk-icon-badge fk-bg-brand-foreground">
                          <img className="fk-icon is-sm" src={facilityIcon} alt="" width={16} height={16} />
                        </div>
                      }
                      name="Facility"
                      detail={["Hires you as a full-time employee"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
