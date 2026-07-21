import type { ReactNode } from "react";

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
        className={`flex w-full flex-col items-center gap-16 overflow-clip rounded-[24px] py-24 ${background}`}
      >
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            {title}
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-subtle">
            {subtitle}
          </p>
        </header>
        <div className="flex h-[296px] w-full max-w-[1200px] items-start gap-2 px-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex h-full min-w-0 flex-1 flex-col items-start justify-between overflow-clip rounded-[20px] bg-white p-6"
            >
              <img src={card.icon} alt="" className="size-8" />
              <div className="flex w-full flex-col gap-2">
                <h3 data-reveal className="text-[16px] font-medium leading-6 text-ink opacity-80">
                  {card.title}
                </h3>
                <p data-reveal className="text-[16px] leading-6 text-subtle opacity-80">
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
