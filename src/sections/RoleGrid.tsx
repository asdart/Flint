import Button from "../components/ui/Button";
import ServiceCard from "../components/ui/ServiceCard";

const DEFAULT_ITEMS = [
  {
    title: "Registered Nurse",
    body: "Provide patient care, coordinate treatments, and support recovery.",
  },
  {
    title: "Certified Nursing Assistant",
    body: "Support patients with daily care, mobility, comfort, and basic health needs.",
  },
  {
    title: "Licensed Practical Nurse",
    body: "Deliver essential nursing care, monitor patients, and assist with treatment plans.",
  },
  {
    title: "Housekeeper",
    body: "Provide specialized nursing care in areas such as ICU, ER, or surgery.",
  },
  {
    title: "Medical Assistant",
    body: "Support clinical teams with patient care, examinations, and administrative tasks.",
  },
  {
    title: "Phlebotomist",
    body: "Collect blood samples safely and prepare specimens for laboratory testing.",
  },
  {
    title: "Allied Health",
    body: "Perform laboratory tests and analyze samples to support accurate diagnoses.",
  },
  {
    title: "Certified Medication Aide",
    body: "Administer medications and support patients under licensed nursing supervision.",
  },
  {
    title: "Dietary Aides",
    body: "Prepare and serve meals while supporting patients' dietary and nutritional needs.",
  },
  {
    title: "HHA",
    body: "Prepare and serve meals while supporting patients' dietary and nutritional needs.",
  },
  {
    title: "Caregiver",
    body: "Prepare and serve meals while supporting patients' dietary and nutritional needs.",
  },
];

type RoleGridItem = {
  title: string;
  body: string;
};

type RoleGridProps = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonLink?: string;
  items?: RoleGridItem[];
};

/** Section / Role Grid (Healthcare roles with sponsorship). */
export default function RoleGrid({
  title = "Healthcare roles with sponsorship",
  body = "Don't see your role listed? Apply and we will work with you to find a solution.",
  buttonLabel = "Apply now",
  buttonLink = "#apply",
  items = DEFAULT_ITEMS,
}: RoleGridProps) {
  return (
    <section className="fk-section">
      <div className="fk-panel fk-bg-brand-light">
        <div className="fk-container">
          <div className="fk-flex fk-flex-col fk-items-center fk-gap-16 fk-gap-10-mobile fk-w-full">
            <div className="fk-section-header is-center is-narrow" data-ix="blur-reveal">
              <div className="fk-blur-reveal">
                <h2 className="fk-heading-xl">{title}</h2>
              </div>
              <div className="fk-blur-reveal is-delay-1">
                <p className="fk-text-lg fk-color-brand-80">{body}</p>
              </div>
              <div className="fk-blur-reveal is-delay-2">
                <Button label={buttonLabel} link={buttonLink} />
              </div>
            </div>

            <div data-ix="reveal-stagger" className="fk-grid fk-cols-3 fk-cols-2-tablet fk-cols-1-mobile fk-gap-2 fk-w-full">
              {items.map((item) => (
                <div key={item.title} data-ix-item>
                  <ServiceCard title={item.title} body={item.body} variant="subtle" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
