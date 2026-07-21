import type { ReactNode } from "react";
import InterviewIllustration from "../../components/InterviewIllustration";
import ImmigrationFeesIllustration from "../../components/ImmigrationFeesIllustration";
import CasePrepIllustration from "../../components/CasePrepIllustration";
import CostSavingsIllustration from "../../components/CostSavingsIllustration";

type Step = {
  title: string;
  body: string;
  imageLeft: boolean;
  illustration: ReactNode;
};

const STEPS: Step[] = [
  {
    title: "Interview directly with Facilities",
    body: "We'll connect you with ready-to-hire facilities so you can ask questions and find the right facility for you.",
    imageLeft: true,
    illustration: <InterviewIllustration />,
  },
  {
    title: "Save thousands on immigration fees",
    body: "After you're hired, we cover all licensing and immigration costs for you. We even provide a moving bonus.",
    imageLeft: false,
    illustration: <ImmigrationFeesIllustration />,
  },
  {
    title: "Work while your green card processes",
    body: "Once you start working, you'll earn your full salary while we process your green card. No hidden fees or deductions.",
    imageLeft: true,
    illustration: <CasePrepIllustration />,
  },
  {
    title: "Find permanent stability in the US",
    body: "After you earn your green card, what you do and where you go next is up to you.",
    imageLeft: false,
    illustration: <CostSavingsIllustration />,
  },
];

export default function HowFlintWorks() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-16 overflow-clip rounded-[24px] bg-white px-20 py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2
            data-reveal
            className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
          >
            How Flint works
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
            {step.imageLeft && step.illustration}
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
            {!step.imageLeft && step.illustration}
          </div>
        ))}
      </div>
    </section>
  );
}
