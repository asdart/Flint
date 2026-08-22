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
      <div className="flex w-full flex-col items-center gap-10 overflow-clip rounded-[24px] bg-white px-5 py-12 md:gap-16 md:px-10 md:py-16 lg:px-20 lg:py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2
            data-reveal
            className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]"
          >
            How Flint works
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
            <div className="w-full max-w-[580px]">{step.illustration}</div>
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
