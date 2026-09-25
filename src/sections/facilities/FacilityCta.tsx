import ApplyButton from "../../components/ApplyButton";
import BlurReveal from "../../components/BlurReveal";

type Photo = {
  src: string;
  bg: string;
  width: number;
  height: number;
  left: number;
  top: number;
  flip?: boolean;
};

const PHOTOS: Photo[] = [
  { src: "/assets/candidates/cta/01.png", bg: "#f1e0d8", width: 240, height: 320, left: -32, top: -101, flip: true },
  { src: "/assets/candidates/cta/02.png", bg: "#e0dcec", width: 167, height: 223, left: 0, top: -12, flip: true },
  { src: "/assets/candidates/cta/03.png", bg: "#fee0db", width: 235, height: 313, left: -33, top: -9 },
  { src: "/assets/candidates/cta/04.png", bg: "#f1e0d8", width: 255, height: 318, left: -50, top: -12 },
  { src: "/assets/candidates/cta/05.png", bg: "#e0dcec", width: 211, height: 264, left: -29, top: -6 },
  { src: "/assets/candidates/cta/06.png", bg: "#fee0db", width: 219, height: 273, left: -30, top: -9 },
  { src: "/assets/candidates/cta/07.png", bg: "#f1e0d8", width: 252, height: 335, left: -40, top: -126, flip: true },
  { src: "/assets/candidates/cta/08.png", bg: "#e0dcec", width: 225, height: 300, left: -35, top: -12 },
  { src: "/assets/candidates/cta/09.png", bg: "#fee0db", width: 237, height: 316, left: -32, top: -97, flip: true },
  { src: "/assets/candidates/cta/10.png", bg: "#f1e0d8", width: 252, height: 336, left: -40, top: -125, flip: true },
  { src: "/assets/candidates/cta/11.png", bg: "#e0dcec", width: 237, height: 316, left: -34, top: -18 },
  { src: "/assets/candidates/cta/12.png", bg: "#fee0db", width: 291, height: 388, left: -63, top: -157, flip: true },
];

function CtaPhoto({ photo }: { photo: Photo }) {
  const image = (
    <div
      className="absolute mix-blend-luminosity"
      style={{
        left: photo.left,
        top: photo.top,
        width: photo.width,
        height: photo.height,
      }}
    >
      {photo.flip ? (
        <div className="size-full -scale-y-100">
          <img
            src={photo.src}
            alt=""
            className="size-full max-w-none object-cover"
          />
        </div>
      ) : (
        <img
          src={photo.src}
          alt=""
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      )}
    </div>
  );

  const frame = (
    <div
      className="relative h-[200px] w-[168px] overflow-clip rounded-lg"
      style={{ background: photo.bg }}
    >
      {image}
    </div>
  );

  if (!photo.flip) return <div className="shrink-0">{frame}</div>;
  return <div className="flex shrink-0 -scale-y-100">{frame}</div>;
}

function PhotoRow() {
  return (
    <div className="flex shrink-0 items-center gap-4 pr-4">
      {PHOTOS.map((photo) => (
        <CtaPhoto key={photo.src} photo={photo} />
      ))}
    </div>
  );
}

export default function FacilityCta() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="flex w-full flex-col items-center gap-10 overflow-clip rounded-[24px] bg-tertiary py-12 md:gap-16 md:py-16 lg:py-24">
        <BlurReveal className="flex w-full max-w-[436px] flex-col items-center gap-8 px-6 text-center">
          <div className="flex w-full flex-col gap-4">
            <h2 className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
              Our candidates are happily working across the country
            </h2>
            <p className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
              Flint helps healthcare professionals on temporary status find sponsored healthcare jobs.
            </p>
          </div>
          <ApplyButton reveal={false} />
        </BlurReveal>

        <div className="w-full overflow-hidden">
          <div className="cta-marquee-track flex w-max items-center">
            <PhotoRow />
            <PhotoRow />
          </div>
        </div>
      </div>
    </section>
  );
}
