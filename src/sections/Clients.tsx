const LOGOS = [
  { src: "/assets/home/logo-01.png", w: 132 },
  { src: "/assets/home/logo-02.png", w: 96 },
  { src: "/assets/home/logo-03.png", w: 101 },
  { src: "/assets/home/logo-04.png", w: 187 },
  { src: "/assets/home/logo-05.png", w: 146 },
  { src: "/assets/home/logo-06.png", w: 121 },
];

export default function Clients() {
  const row = (
    <div className="flex shrink-0 items-center gap-12 pr-12">
      {LOGOS.map((logo) => (
        <img
          key={logo.src}
          src={logo.src}
          alt=""
          className="h-9 opacity-80 object-contain"
          style={{ width: logo.w }}
        />
      ))}
    </div>
  );

  return (
    <section className="flex w-full items-center gap-14 py-8">
      <p className="shrink-0 pl-12 pr-2 text-[16px] leading-5 text-brand whitespace-nowrap">
        Partnering with the top facilities
      </p>
      <div className="relative h-9 min-w-0 flex-1 overflow-hidden">
        <div className="logo-marquee-track flex w-max items-center">
          {row}
          {row}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
