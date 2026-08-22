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
    <section className="flex w-full flex-col items-start gap-4 py-8 md:flex-row md:items-center md:gap-14">
      <p className="shrink-0 px-5 text-[16px] leading-5 text-brand md:whitespace-nowrap md:px-0 md:pl-12 md:pr-2">
        Partnering with the top facilities
      </p>
      <div className="relative h-9 min-w-0 w-full flex-1 overflow-hidden">
        <div className="logo-marquee-track flex w-max items-center">
          {row}
          {row}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent md:w-32" />
      </div>
    </section>
  );
}
