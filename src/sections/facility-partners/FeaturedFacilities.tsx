import ApplyButton from "../../components/ApplyButton";

const FACILITIES = [
  { img: "/assets/facility/facility-01.png", name: "Oceanic Medical Center", location: "Seattle, WA", roles: "12 Open Roles" },
  { img: "/assets/facility/facility-02.png", name: "Cedar Valley Health", location: "Austin, TX", roles: "8 Open Roles" },
  { img: "/assets/facility/facility-03.png", name: "Summit Care Center", location: "Denver, CO", roles: "15 Open Roles" },
  { img: "/assets/facility/facility-04.png", name: "Riverside General", location: "Portland, OR", roles: "6 Open Roles" },
  { img: "/assets/facility/facility-05.png", name: "Magnolia Springs", location: "Atlanta, GA", roles: "10 Open Roles" },
];

const CARD_OVERLAY =
  "linear-gradient(rgba(0,0,0,0) 55.8%, rgba(0,0,0,0.4) 100%), linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.28))";

export default function FeaturedFacilities() {
  return (
    <section className="flex w-full flex-col items-center gap-10 bg-white py-16 md:gap-16 md:py-24 lg:py-[120px]">
      <div className="flex w-full max-w-[436px] flex-col items-center gap-8 px-4 text-center">
        <div className="flex flex-col gap-4">
          <h2 data-reveal className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
            Join these leading facilities
          </h2>
          <p data-reveal className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
            Cards.
          </p>
        </div>
        <ApplyButton />
      </div>

      <div className="flex w-full snap-x gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FACILITIES.map((facility) => (
          <article
            key={facility.name}
            className="relative h-[320px] w-[min(501px,85vw)] shrink-0 snap-start overflow-clip rounded-[24px] first:ml-[max(16px,calc((100%-1200px)/2))] last:mr-4 md:h-[376px]"
          >
            <img src={facility.img} alt={facility.name} className="absolute inset-0 size-full object-cover" />
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARD_OVERLAY }} />
            <div className="absolute bottom-0 left-0 flex w-full flex-col items-start gap-3 p-6">
              <div className="flex flex-col gap-1 text-[18px] leading-7 text-white">
                <p>{facility.name}</p>
                <p className="opacity-60">{facility.location}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-[99px] bg-white/10 py-1 pl-2.5 pr-3 backdrop-blur-[10px]">
                <span className="size-2 rounded-full bg-[#4ade80]" />
                <span className="text-[16px] leading-6 text-white opacity-80">{facility.roles}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
