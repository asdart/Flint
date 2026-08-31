import BlurReveal from "../components/BlurReveal";
import ServiceCard from "../components/ServiceCard";

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

export default function WhatWeOffer() {
  return (
    <section className="w-full px-4 pt-4 pb-4">
      <div className="relative w-full overflow-clip rounded-[24px] bg-secondary py-12 md:py-16 lg:py-24">
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 px-5 md:gap-16 md:px-10">
          <BlurReveal className="flex w-full max-w-[436px] flex-col gap-4 text-center">
            <h2 className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
              What we offer
            </h2>
            <p className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
              Cards.
            </p>
          </BlurReveal>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[244px]">
            {OFFERS.map((offer) => (
              <div key={offer.title} data-reveal className="h-full min-h-[240px] lg:min-h-0">
                <ServiceCard
                  icon={offer.icon}
                  title={offer.title}
                  body={offer.body}
                  className="h-full"
                  bodyClass="text-brand"
                  iconClass="size-10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
