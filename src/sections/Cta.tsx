import ApplyButton from "../components/ApplyButton";

export default function Cta() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="relative flex h-[560px] w-full items-center overflow-clip rounded-[24px] bg-tertiary p-24">
        <div
          className="pointer-events-none absolute left-[747px] top-[-299px] h-[813px] w-[1196px]"
          style={{
            WebkitMaskImage: "url(/assets/home/cta-mask.svg)",
            maskImage: "url(/assets/home/cta-mask.svg)",
            WebkitMaskSize: "795px 795px",
            maskSize: "795px 795px",
            WebkitMaskPosition: "83px 7px",
            maskPosition: "83px 7px",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <img src="/assets/home/cta-flower.png" alt="" className="size-full object-cover" />
        </div>

        <img
          src="/assets/home/cta-photo.png"
          alt=""
          className="pointer-events-none absolute right-0 bottom-0 h-[485px] w-[577px] object-cover object-left"
        />

        <div className="relative z-10 flex w-[436px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
              Your green card pathway starts here.
            </h2>
            <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
              Cards.
            </p>
          </div>
          <ApplyButton />
        </div>
      </div>
    </section>
  );
}
