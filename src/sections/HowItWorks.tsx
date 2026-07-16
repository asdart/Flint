import NetworkIllustration from "../components/NetworkIllustration";
import CostSavingsIllustration from "../components/CostSavingsIllustration";
import RetentionIllustration from "../components/RetentionIllustration";

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
    <div className="h-[696px] w-[580px] max-w-[580px] shrink-0 rounded-[40px] bg-tertiary" />
  );
}

export default function HowItWorks() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-16 overflow-clip rounded-[24px] bg-white px-20 py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2
            data-reveal
            className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
          >
            Why facilities
            <br />
            trust Flint
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-subtle">
            Get answers to common questions about our Green Card pathway, candidate vetting, and
            healthcare placement process.
          </p>
        </header>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex w-full max-w-[1200px] items-center justify-between gap-24"
          >
            {step.imageLeft && <StepMedia illustration={step.illustration} />}
            <div className="flex min-w-0 max-w-[480px] flex-1 flex-col gap-2">
              <h3
                data-reveal
                className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink"
              >
                {step.title}
              </h3>
              <p data-reveal className="text-[18px] leading-7 text-subtle">
                {step.body}
              </p>
            </div>
            {!step.imageLeft && <StepMedia illustration={step.illustration} />}
          </div>
        ))}
      </div>
    </section>
  );
}
