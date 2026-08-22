import NetworkIllustration from "../../components/NetworkIllustration";
import CostSavingsIllustration from "../../components/CostSavingsIllustration";
import RetentionIllustration from "../../components/RetentionIllustration";

const STEPS = [
  {
    title: "A stable team of familiar faces",
    body: "No more onboarding new staff every 90 days. Flint placements become familiar faces for your residents — not strangers filling a shift.",
    imageLeft: true,
    illustration: "network" as const,
  },
  {
    title: "Reduced staffing costs",
    body: "Facilities that replace agency staff with Flint hires save an average of $60,000 per RN and $42,000 per CNA every year.",
    imageLeft: false,
    illustration: "savings" as const,
  },
  {
    title: "Guaranteed retention",
    body: "Every hire sourced by Flint is guaranteed to stay 3+ years. If they don't, we find you another at no extra charge.",
    imageLeft: true,
    illustration: "retention" as const,
  },
];

function StepMedia({
  illustration,
}: {
  illustration?: "network" | "savings" | "retention";
}) {
  if (illustration === "network") return <NetworkIllustration />;
  if (illustration === "savings") return <CostSavingsIllustration />;
  if (illustration === "retention") return <RetentionIllustration />;
  return (
    <div className="aspect-[580/696] w-full max-w-[580px] shrink-0 rounded-[24px] bg-tertiary md:rounded-[40px]" />
  );
}

export default function FacilityHowItWorks() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-10 overflow-clip rounded-[24px] bg-white px-5 py-12 md:gap-16 md:px-10 md:py-16 lg:px-20 lg:py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2
            data-reveal
            className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]"
          >
            Why facilities
            <br />
            trust Flint
          </h2>
          <p data-reveal className="text-[16px] leading-6 text-subtle md:text-[18px] md:leading-7">
            Get answers to common questions about our Green Card pathway, candidate vetting, and
            healthcare placement process.
          </p>
        </header>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex w-full max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-24 ${
              step.imageLeft ? "" : "lg:flex-row-reverse"
            }`}
          >
            <div className="w-full max-w-[580px]">
              <StepMedia illustration={step.illustration} />
            </div>
            <div className="flex w-full min-w-0 max-w-[480px] flex-1 flex-col gap-2">
              <h3
                data-reveal
                className="font-serif text-[28px] leading-9 tracking-[-0.56px] text-ink md:text-[32px] md:leading-10 md:tracking-[-0.64px]"
              >
                {step.title}
              </h3>
              <p data-reveal className="text-[16px] leading-6 text-subtle md:text-[18px] md:leading-7">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
