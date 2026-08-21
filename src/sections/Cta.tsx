import ApplyButton from "../components/ApplyButton";

/* The artwork is laid out on Figma's 1408x560 card and anchored to the right
   edge, so it keeps its composition as the card narrows.

   Ring: the purple texture is clipped to a 795px circle stroked 100px wide,
   which is what gives the crescent. Photo: the full room shot only shows
   through an 832px circular window, and the cut-out pair sits on top of it
   unclipped. Both photos are mirrored; the masks are not. */

const RING_MASK = {
  maskImage: "url(/assets/home/cta-ring.svg)",
  WebkitMaskImage: "url(/assets/home/cta-ring.svg)",
  maskSize: "795px 795px",
  WebkitMaskSize: "795px 795px",
  maskPosition: "82.66px 7.29px",
  WebkitMaskPosition: "82.66px 7.29px",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

const WINDOW_MASK = {
  maskImage: "url(/assets/home/cta-circle.svg)",
  WebkitMaskImage: "url(/assets/home/cta-circle.svg)",
  maskSize: "831.69px 831.69px",
  WebkitMaskSize: "831.69px 831.69px",
  maskPosition: "153.57px 87.31px",
  WebkitMaskPosition: "153.57px 87.31px",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

export default function Cta() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="relative flex h-[560px] w-full items-center overflow-clip rounded-[24px] bg-tertiary p-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[535.49px] -top-[298.62px] h-[812.83px] w-[1196.15px]"
          style={RING_MASK}
        >
          <img src="/assets/home/cta-flower.png" alt="" className="size-full object-cover" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[32.7px] -right-[15.93px] h-[484.7px] w-[576.87px]"
        >
          <div className="absolute inset-0" style={WINDOW_MASK}>
            <img
              src="/assets/home/cta-room.jpg"
              alt=""
              className="size-full -scale-x-100 object-cover"
            />
          </div>
          <img
            src="/assets/home/cta-photo.png"
            alt=""
            className="absolute inset-0 size-full -scale-x-100 object-cover"
          />
        </div>

        <div className="relative z-10 flex w-[436px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2
              data-reveal
              className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink"
            >
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
