import ApplyButton from "../components/ApplyButton";
import GravityGallery from "../components/GravityGallery";

const AVATARS = Array.from({ length: 19 }, (_, i) => `/assets/avatar-${String(i + 1).padStart(2, "0")}.png`);

export default function Cta() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="relative flex h-[560px] w-full flex-col items-center justify-center gap-2 overflow-clip rounded-[24px] bg-tertiary p-24">
        <GravityGallery images={AVATARS} size={88} />
        <div className="pointer-events-none relative z-10 flex w-[436px] flex-col items-center justify-center gap-8">
          <div className="flex w-full flex-col gap-4 text-center">
            <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
              Our candidates are happily working across the country
            </h2>
            <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.
            </p>
          </div>
          <div className="pointer-events-auto">
            <ApplyButton />
          </div>
        </div>
      </div>
    </section>
  );
}
