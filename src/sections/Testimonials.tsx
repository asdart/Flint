import { useState } from "react";

type Testimonial = {
  name: string;
  location: string;
  photo: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-2.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-1.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Brandon Terry",
    location: "Minesota",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Chrismene jones",
    location: "California",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
  {
    name: "Chrismene jones",
    location: "California",
    photo: "/assets/testimonial-photo-3.png",
    quote:
      "Flint made everything feel easy. After years of uncertainty, they gave me a path and the support I needed to finally see a permanent future here.",
  },
];

/* Slot layout mirrors the Figma arrangement: far-left, left, center, right, far-right */
const SLOTS = [
  { x: -874, rotate: -16, dimmed: true },
  { x: -440, rotate: -8, dimmed: false },
  { x: 0, rotate: 0, dimmed: false },
  { x: 448, rotate: 8, dimmed: false },
  { x: 868, rotate: 16, dimmed: true },
];

function Card({ testimonial, dimmed }: { testimonial: Testimonial; dimmed: boolean }) {
  return (
    <div
      className={`group relative h-[488px] w-[396px] overflow-clip rounded-[32px] bg-white transition-opacity duration-500 ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <img
        src={testimonial.photo}
        alt={testimonial.name}
        className="absolute left-1/2 top-[-71px] h-[798px] w-[612px] max-w-none -translate-x-1/2 object-cover"
      />
      {/* Dark gradient (default state) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[61%] to-black transition-opacity duration-500 group-hover:opacity-0" />
      {/* Light overlay + quote (hover state, per the design's component variants) */}
      <div className="invisible absolute inset-0 bg-white/90 opacity-0 backdrop-blur-[8px] transition-[opacity,visibility] duration-500 group-hover:visible group-hover:opacity-100" />
      <div className="absolute left-[74px] top-[141px] flex w-[248px] flex-col items-center gap-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <img src="/assets/quote.svg" alt="" className="h-8 w-10" />
        <p className="w-full text-center font-serif text-[20px] leading-7 tracking-[-0.4px] text-ink">
          {testimonial.quote}
        </p>
        <img src="/assets/quote.svg" alt="" className="h-8 w-10 rotate-180" />
      </div>
      <img
        src="/assets/country-flag.svg"
        alt=""
        className="absolute left-[332px] top-[424px] size-8 transition-opacity duration-500 group-hover:opacity-0"
      />
      <div className="absolute bottom-8 left-8 flex flex-col gap-1 transition-opacity duration-500 group-hover:opacity-0">
        <p className="text-[16px] font-medium leading-6 text-white">{testimonial.name}</p>
        <p className="text-[16px] leading-6 text-white opacity-60">{testimonial.location}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [offset, setOffset] = useState(0);

  const at = (slot: number) => {
    const n = TESTIMONIALS.length;
    return TESTIMONIALS[(((slot + offset) % n) + n) % n];
  };

  return (
    <section className="w-full px-4 pb-4">
      <div className="relative h-[1102px] w-full overflow-clip rounded-[24px] bg-tertiary">
        <header className="absolute left-1/2 top-[140px] flex w-[436px] -translate-x-1/2 flex-col gap-4 text-center">
          <h2 data-reveal className="font-serif text-[48px] leading-[52px] tracking-[-0.96px] text-ink">
            Real stories.
            <br />
            Real impact
          </h2>
          <p data-reveal className="text-[18px] leading-7 text-brand opacity-80">
            Flint helps eligible healthcare professionals connect with hospitals sponsoring Green Cards.
          </p>
        </header>

        <div className="absolute left-1/2 top-[412px] h-[512px] w-[1384px] -translate-x-1/2">
          {SLOTS.map((slot, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 flex h-[538px] items-center justify-center transition-transform duration-500"
              style={{ transform: `translateX(calc(-50% + ${slot.x}px)) rotate(${slot.rotate}deg)` }}
            >
              <Card testimonial={at(i)} dimmed={slot.dimmed} />
            </div>
          ))}
        </div>

        <div className="absolute bottom-[96px] left-1/2 flex -translate-x-1/2 items-center gap-3">
          <span data-reveal className="inline-flex">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => setOffset((o) => o - 1)}
              className="flex items-center justify-center rounded-[24px] bg-white p-3 transition-transform hover:scale-105 active:scale-95"
            >
              <img src="/assets/arrow-left.svg" alt="" className="h-4 w-3 rotate-180" />
            </button>
          </span>
          <span data-reveal className="inline-flex">
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => setOffset((o) => o + 1)}
              className="flex items-center justify-center rounded-[24px] bg-white p-3 transition-transform hover:scale-105 active:scale-95"
            >
              <img src="/assets/arrow-right.svg" alt="" className="h-4 w-3" />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
