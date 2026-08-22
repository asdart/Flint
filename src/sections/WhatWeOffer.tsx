const OFFERS = [
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

function Flower({ className, size }: { className?: string; size: number }) {
  return (
    <div
      className={`pointer-events-none absolute overflow-hidden ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: "url(/assets/home/flower-mask.svg)",
        maskImage: "url(/assets/home/flower-mask.svg)",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    >
      <img src="/assets/home/flower-alt.png" alt="" className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

export default function WhatWeOffer() {
  return (
    <section className="w-full px-4 pt-4 pb-4">
      <div className="relative w-full overflow-clip rounded-[24px] bg-secondary px-5 py-12 md:px-10 md:py-16 lg:px-[104px] lg:py-24">
        <Flower className="top-[-261px] left-[-311px]" size={522} />
        <Flower className="top-[521px] left-[900px] hidden md:block" size={747} />

        <header className="relative mx-auto mb-10 flex w-full max-w-[436px] flex-col gap-4 text-center md:mb-16">
          <h2 data-reveal className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
            What we offer
          </h2>
          <p data-reveal className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
            Cards.
          </p>
        </header>

        <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
            <article
              key={offer.title}
              data-reveal
              className="flex min-h-[240px] flex-col justify-between rounded-[20px] bg-white p-6 lg:h-[304px]"
            >
              <img src={offer.icon} alt="" className="size-8" />
              <div className="flex flex-col gap-2">
                <h3 className="text-[16px] font-medium leading-6 text-ink opacity-80">{offer.title}</h3>
                <p className="text-[16px] leading-6 text-brand opacity-80">{offer.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
