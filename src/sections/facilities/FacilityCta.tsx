import ApplyButton from "../../components/ApplyButton";
import GravityGallery from "../../components/GravityGallery";

const AVATARS = Array.from({ length: 19 }, (_, i) => `/assets/avatar-${String(i + 1).padStart(2, "0")}.png`);

export default function FacilityCta() {
  return (
    <section className="w-full px-4 pb-4">
      <div className="relative flex min-h-[480px] w-full flex-col items-center justify-center gap-2 overflow-clip rounded-[24px] bg-tertiary px-6 py-16 md:h-[560px] md:min-h-0 md:p-24">
        <GravityGallery images={AVATARS} size={88} />
        <div className="pointer-events-none relative z-10 flex w-full max-w-[436px] flex-col items-center justify-center gap-8">
          <div className="flex w-full flex-col gap-4 text-center">
            <h2 data-reveal className="font-serif text-[32px] leading-10 tracking-[-0.64px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-0.96px]">
              Our candidates are happily working across the country
            </h2>
            <p data-reveal className="text-[16px] leading-6 text-brand opacity-80 md:text-[18px] md:leading-7">
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
