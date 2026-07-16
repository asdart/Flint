const CARDS = [
  {
    icon: "/assets/icon-relocate.svg",
    title: "Ready to relocate",
    body: "You are ready to move to a new city or state, embracing a fresh start and new environment.",
  },
  {
    icon: "/assets/icon-commitment.svg",
    title: "Commitment",
    body: "You are willing to work in your role for 3-5 years as your green card processes",
  },
  {
    icon: "/assets/icon-residency.svg",
    title: "Permanent residency",
    body: "You're ready for long-term stability and permenant residency in the US",
  },
];

export default function Benefits() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-16 overflow-clip rounded-[24px] bg-tertiary py-24">
        <header className="flex max-w-[480px] flex-col items-center gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            Is Flint Right for You?
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-subtle">
            The Flint program is a great fit for finding
            <br />a sponsored role if:
          </p>
        </header>
        <div className="flex h-[296px] w-full max-w-[1200px] items-start gap-2 px-4">
          {CARDS.map((card) => (
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
