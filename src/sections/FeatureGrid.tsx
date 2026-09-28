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

type FeatureGridItem = {
  icon: string;
  title: string;
  body: string;
};

type FeatureGridProps = {
  title?: string;
  body?: string;
  items?: FeatureGridItem[];
};

/** Section / Feature Grid (What We Offer). */
export default function FeatureGrid({
  title = "What we offer",
  body = "Flint gives you a real path to a green card (and not just another contract).",
  items = DEFAULT_ITEMS,
}: FeatureGridProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel is-secondary">
        <div className="fk-container">
          <div className="fk-feature-grid">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg is-brand-muted">{body}</p>
              </div>
            </div>

            <div data-ix="reveal-stagger" className="fk-feature-grid-cards">
              {items.map((item) => (
                <div key={item.title} data-ix-item className="fk-feature-grid-item">
                  <ServiceCard icon={item.icon} title={item.title} body={item.body} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
