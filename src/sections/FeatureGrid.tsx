import ServiceCard from "../components/ui/ServiceCard";

const DEFAULT_ITEMS = [
  {
    icon: "/assets/home/offer-hospital.svg",
    title: "Matched to the right hospital",
    body: "We find a facility that fits your specialty, experience, and where you want to live.",
  },
  {
    icon: "/assets/home/offer-id.svg",
    title: "Your green card, managed",
    body: "We file and track your permanent residency from day one. Not a visa, not a temp fix.",
  },
  {
    icon: "/assets/home/offer-travel.svg",
    title: "Relocation support included",
    body: "Housing help, community links, and a team that understands starting fresh abroad.",
  },
  {
    icon: "/assets/home/offer-dashboard.svg",
    title: "One place for everything",
    body: "Track your visa status, licensing steps, and hospital match. All in your Flint dashboard.",
  },
  {
    icon: "/assets/home/offer-concierge.svg",
    title: "You're never alone in this",
    body: "A dedicated advisor walks every step with you, from first application to green card approval.",
  },
  {
    icon: "/assets/home/offer-check.svg",
    title: "We got you covered. No Fees.",
    body: "Immigration attorneys, NCLEX, licensing, visa filing, all covered. You pay nothing, ever.",
  },
];

const BENEFITS_ITEMS = [
  {
    icon: "/assets/facility/icon-verified.svg",
    title: "Verified Talent",
    body: "Every clinician on our platform undergoes a rigorous 5-step credentialing and background check process.",
  },
  {
    icon: "/assets/facility/icon-flexible.svg",
    title: "Flexible Staffing",
    body: "From per-diem shifts to long-term travel contracts and permanent placements, manage it all in one place.",
  },
  {
    icon: "/assets/facility/icon-support.svg",
    title: "Dedicated Support",
    body: "Your facility is assigned a dedicated account manager to assist with technical support and staffing strategy.",
  },
];

type FeatureGridItem = {
  icon: string;
  title: string;
  body: string;
};

type FeatureGridProps = {
  /** Default: Home's "What we offer" (secondary panel, 6 cards, 244px rows). Benefits: Facility partners' "Built for the modern facility" (tertiary panel, 3 cards with 32px icons, 296px rows, subtle text). */
  variant?: "default" | "benefits";
  title?: React.ReactNode;
  body?: string;
  items?: FeatureGridItem[];
};

/** Section / Feature Grid (Default: What We Offer; Benefits). */
export default function FeatureGrid({
  variant = "default",
  title = variant === "benefits" ? (
    <>
      Built for the
      <br />
      modern facility
    </>
  ) : (
    "What we offer"
  ),
  body = variant === "benefits"
    ? "Experience a partnership that prioritizes quality, reliability, and human support."
    : "Flint gives you a real path to a green card (and not just another contract).",
  items = variant === "benefits" ? BENEFITS_ITEMS : DEFAULT_ITEMS,
}: FeatureGridProps) {
  const benefits = variant === "benefits";

  return (
    <section className="fk-section">
      <div className={benefits ? "fk-panel fk-bg-tertiary" : "fk-panel fk-bg-secondary"}>
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-16 fk-gap-10-mobile fk-w-full">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className={benefits ? "fk-text-lg fk-color-subtle" : "fk-text-lg fk-color-brand-80"}>{body}</p>
              </div>
            </div>

            <div data-ix="reveal-stagger" className={
                benefits
                  ? "fk-feature-grid-cards is-tall fk-grid fk-cols-3 fk-cols-1-mobile fk-gap-2 fk-w-full"
                  : "fk-feature-grid-cards fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-2 fk-w-full"
              }>
              {items.map((item) => (
                <div key={item.title} data-ix-item className="fk-feature-grid-item fk-h-full">
                  <ServiceCard
                    icon={item.icon}
                    title={item.title}
                    body={item.body}
                    variant={benefits ? "subtle" : "default"}
                    iconSize={benefits ? "md" : "lg"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
