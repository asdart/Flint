type Banner = {
  image: string;
  title: string;
  body: string;
  cta: string;
  ctaTop: number;
  overlay: string;
  features: { icon: string; label: string }[];
};

const BANNERS: Banner[] = [
  {
    image: "/assets/home/banner-nurse.jpg",
    title: "For nurses. Not a visa. A permanent future.",
    body: "Flint sponsors your green card, so from day one you're building something that lasts.",
    cta: "Apply as nurse",
    ctaTop: 176,
    overlay: "linear-gradient(129deg, rgba(0,0,0,0.6) 1%, rgba(0,0,0,0) 35%)",
    features: [
      { icon: "/assets/home/icon-relocate.svg", label: "Relocation support included" },
      { icon: "/assets/home/icon-greencard.svg", label: "Green card sponsorship" },
      { icon: "/assets/home/icon-hospital.svg", label: "Matched to a hospital for your skills." },
    ],
  },
  {
    image: "/assets/home/banner-facility.jpg",
    title: "For facilities. Stop renting nurses. Start retaining them.",
    body: "Flint brings you internationally trained nurses who are fully licensed, green card-sponsored, and committed to staying.",
    cta: "Apply as facility",
    ctaTop: 200,
    overlay: "linear-gradient(108deg, rgba(0,0,0,0.6) 1%, rgba(0,0,0,0) 51%)",
    features: [
      { icon: "/assets/home/icon-costs.svg", label: "Cut agency spend and turnover costs" },
      { icon: "/assets/home/icon-compliance.svg", label: "We handle immigration compliance" },
      { icon: "/assets/home/icon-states.svg", label: "Available in 23 states" },
    ],
  },
];

function GlassButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="relative flex items-center justify-center rounded-[24px] border border-white/20 px-5 py-2.5 text-[14px] font-medium leading-5 tracking-[-0.028px] text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
    >
      <span className="absolute inset-0 rounded-[24px] bg-[rgba(255,255,255,0.16)] backdrop-blur-[10px]" />
      <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_6px_0px_rgba(255,255,255,0.25)]" />
      <span className="relative">{children}</span>
    </button>
  );
}

function FeatureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-[24px] border border-white/20">
        <span className="absolute inset-0 rounded-[24px] bg-[rgba(255,255,255,0.16)] backdrop-blur-[10px]" />
        <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_6px_0px_rgba(255,255,255,0.25)]" />
        <img src={icon} alt="" className="relative size-5" />
      </div>
      <p className="text-[16px] leading-6 text-white opacity-80">{label}</p>
    </div>
  );
}

export default function TwoWays() {
  return (
    <section className="w-full px-4 pt-4">
      <div className="flex w-full justify-center rounded-[24px] bg-surface py-24">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-16 px-4">
          <header className="flex w-[436px] flex-col gap-4 text-center">
            <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
              One mission.
              <br />
              Two ways in.
            </h2>
            <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
              Flint helps eligible healthcare professionals connect with hospitals sponsoring Green
              Cards.
            </p>
          </header>

          <div className="flex w-full flex-col gap-4">
            {BANNERS.map((banner) => (
              <div
                key={banner.cta}
                data-reveal
                className="relative h-[560px] w-full overflow-clip rounded-[24px] bg-white"
              >
                <img
                  src={banner.image}
                  alt=""
                  className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] rounded-2xl object-cover"
                />
                <div
                  className="absolute inset-2 rounded-2xl"
                  style={{ backgroundImage: banner.overlay }}
                />
                <div className="absolute left-10 top-10 flex w-[338px] flex-col gap-2 text-white">
                  <p className="text-[24px] leading-7 tracking-[-0.48px]">{banner.title}</p>
                  <p className="text-[16px] leading-6 opacity-80">{banner.body}</p>
                </div>
                <div className="absolute left-10" style={{ top: banner.ctaTop }}>
                  <GlassButton>{banner.cta}</GlassButton>
                </div>
                <div className="absolute bottom-10 left-10 flex w-[338px] flex-col gap-4">
                  {banner.features.map((f) => (
                    <FeatureRow key={f.label} icon={f.icon} label={f.label} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
