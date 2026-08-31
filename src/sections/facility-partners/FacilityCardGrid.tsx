import type { ReactNode } from "react";
import BlurReveal from "../../components/BlurReveal";
import ServiceCard from "../../components/ServiceCard";

export type FacilityCard = {
  icon: string;
  title: string;
  body: string;
};

type FacilityCardGridProps = {
  title: ReactNode;
  subtitle: ReactNode;
  cards: FacilityCard[];
  background?: string;
};

export default function FacilityCardGrid({
  title,
  subtitle,
  cards,
  background = "bg-tertiary",
}: FacilityCardGridProps) {
  return (
    <section className="w-full px-4 pb-4">
      <div
        className={`flex w-full flex-col items-center gap-10 overflow-clip rounded-[24px] px-5 py-12 md:gap-16 md:px-8 md:py-16 lg:py-24 ${background}`}
      >
        <BlurReveal className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
            {title}
          </h2>
          <p className="text-[16px] leading-6 text-subtle md:text-[18px] md:leading-7">
            {subtitle}
          </p>
        </BlurReveal>
        <div className="flex w-full max-w-[1200px] flex-col items-stretch gap-2 px-0 md:h-[296px] md:flex-row md:items-start md:px-4">
          {cards.map((card) => (
            <ServiceCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              body={card.body}
              className="min-h-[220px] min-w-0 flex-1 md:h-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
